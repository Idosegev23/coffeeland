import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { normalizePhone, isValidIsraeliMobile, maskEmail } from '@/lib/phone';
import { logger } from '@/lib/logger';

/**
 * כניסה ללקוחות עם מספר טלפון בלבד (ללא OTP — החלטה עסקית מודעת).
 * POST /api/auth/phone-login  { phone }            -> חשבון יחיד: token_hash | כמה: accounts
 * POST /api/auth/phone-login  { phone, user_id }   -> בחירת חשבון מתוך הרשימה
 *
 * אדמינים חסומים כאן בכוונה — כניסת אדמין רק עם סיסמה ב-/admin-login,
 * אחרת ידיעת הטלפון של אדמין הייתה שוות-ערך לגישת ניהול.
 */

// Rate limit בסיסי per-IP (best-effort בסביבת serverless — כל instance סופר לעצמו)
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(body?.phone || '');
    const selectedUserId: string | null = body?.user_id || null;

    if (!isValidIsraeliMobile(phone)) {
      return NextResponse.json(
        { error: 'invalid_phone', message: 'מספר הטלפון אינו תקין' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();

    const { data: matches, error: rpcError } = await serviceClient
      .rpc('find_users_by_phone', { p: phone });

    if (rpcError) {
      logger.error('❌ phone-login lookup failed:', rpcError);
      return NextResponse.json(
        { error: 'lookup_failed', message: 'שגיאה זמנית, נסו שוב' },
        { status: 500 }
      );
    }

    const users: Array<{ id: string; email: string; full_name: string }> = matches || [];

    if (users.length === 0) {
      return NextResponse.json({ found: false });
    }

    // סינון אדמינים — הם לא נכנסים דרך טלפון
    const { data: adminRows } = await serviceClient
      .from('admins')
      .select('user_id')
      .in('user_id', users.map(u => u.id))
      .eq('is_active', true);

    const adminIds = new Set((adminRows || []).map(a => a.user_id));
    const customers = users.filter(u => !adminIds.has(u.id) && u.email);

    if (customers.length === 0) {
      if (adminIds.size > 0) {
        return NextResponse.json({
          error: 'admin_login_required',
          message: 'חשבון צוות נכנס עם אימייל וסיסמה בעמוד כניסת הצוות.'
        }, { status: 403 });
      }
      return NextResponse.json({ found: false });
    }

    // בחירת חשבון: אחד בלבד, או לפי user_id שנבחר במסך הבחירה
    let target = customers.length === 1 ? customers[0] : null;
    if (selectedUserId) {
      target = customers.find(u => u.id === selectedUserId) || null;
      if (!target) {
        return NextResponse.json(
          { error: 'invalid_selection', message: 'בחירה לא תקינה' },
          { status: 400 }
        );
      }
    }

    if (!target) {
      // כמה חשבונות — מחזירים רשימת בחירה עם תקציר פעילות
      const ids = customers.map(u => u.id);

      const [{ data: passRows }, { data: paymentRows }] = await Promise.all([
        serviceClient
          .from('passes')
          .select('user_id, remaining_entries')
          .in('user_id', ids)
          .eq('status', 'active'),
        serviceClient
          .from('payments')
          .select('user_id, created_at')
          .in('user_id', ids)
          .eq('status', 'completed')
          .order('created_at', { ascending: false }),
      ]);

      const entriesByUser = new Map<string, number>();
      for (const p of passRows || []) {
        entriesByUser.set(p.user_id, (entriesByUser.get(p.user_id) || 0) + (p.remaining_entries || 0));
      }
      const lastPurchaseByUser = new Map<string, string>();
      for (const p of paymentRows || []) {
        if (!lastPurchaseByUser.has(p.user_id)) {
          lastPurchaseByUser.set(p.user_id, p.created_at);
        }
      }

      return NextResponse.json({
        found: true,
        accounts: customers.map(u => ({
          id: u.id,
          name: u.full_name || 'ללא שם',
          masked_email: maskEmail(u.email),
          remaining_entries: entriesByUser.get(u.id) || 0,
          last_purchase: lastPurchaseByUser.get(u.id) || null,
        })),
      });
    }

    // יצירת סשן אמיתי: טוקן magiclink בצד השרת (לא נשלח מייל) שהדפדפן ממיר לסשן
    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: 'magiclink',
      email: target.email,
    });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      logger.error('❌ phone-login generateLink failed:', linkError);
      return NextResponse.json(
        { error: 'session_failed', message: 'שגיאה זמנית ביצירת התחברות, נסו שוב' },
        { status: 500 }
      );
    }

    logger.info('✅ phone-login success for user:', target.id);
    return NextResponse.json({ found: true, token_hash: tokenHash });

  } catch (error) {
    logger.error('❌ phone-login error:', error);
    return NextResponse.json(
      { error: 'internal', message: 'שגיאה זמנית, נסו שוב' },
      { status: 500 }
    );
  }
}
