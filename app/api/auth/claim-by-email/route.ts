import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { normalizePhone, isValidIsraeliMobile } from '@/lib/phone';
import { logger } from '@/lib/logger';

/**
 * חיבור מספר נייד לחשבון ותיק שנרשם עם אימייל בלבד.
 * מותר רק לחשבון שעדיין אין לו טלפון — חד-פעמי: ברגע שיש טלפון,
 * המסלול נסגר והכניסה היא עם הטלפון בלבד.
 * POST /api/auth/claim-by-email { email, phone }
 */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 15;

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
    const email = (body?.email || '').trim().toLowerCase();
    const phone = normalizePhone(body?.phone || '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email', message: 'כתובת האימייל אינה תקינה' }, { status: 400 });
    }
    if (!isValidIsraeliMobile(phone)) {
      return NextResponse.json(
        { error: 'invalid_phone', message: 'יש להזין מספר נייד ישראלי תקין' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();

    const { data: userRow } = await serviceClient
      .from('users')
      .select('id, email, phone')
      .ilike('email', email)
      .maybeSingle();

    // תשובה אחידה כשאין מה לחבר — לא חושפים אילו אימיילים רשומים ומה מצבם
    const genericFail = NextResponse.json({
      error: 'not_claimable',
      message: 'לא מצאנו חשבון מתאים לחיבור. אם יש לך כבר מספר בחשבון — היכנסו איתו. אפשר גם להירשם מחדש או לפנות אלינו.',
    }, { status: 404 });

    if (!userRow) return genericFail;

    // רק חשבון שעדיין אין לו טלפון — חיבור חד-פעמי
    if (userRow.phone && normalizePhone(userRow.phone)) return genericFail;

    // אדמינים לא נכנסים בלי סיסמה, נקודה
    const { data: adminRow } = await serviceClient
      .from('admins')
      .select('user_id')
      .eq('user_id', userRow.id)
      .eq('is_active', true)
      .maybeSingle();
    if (adminRow) return genericFail;

    const { error: updateError } = await serviceClient
      .from('users')
      .update({ phone })
      .eq('id', userRow.id);

    if (updateError) {
      logger.error('❌ claim-by-email update failed:', updateError);
      return NextResponse.json({ error: 'internal', message: 'שגיאה זמנית, נסו שוב' }, { status: 500 });
    }

    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: 'magiclink',
      email: userRow.email,
    });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      logger.error('❌ claim-by-email generateLink failed:', linkError);
      // הטלפון חובר — הלקוח יכול פשוט להיכנס איתו עכשיו
      return NextResponse.json({ success: true, login_required: true });
    }

    logger.info('✅ phone claimed by email for user:', userRow.id);
    return NextResponse.json({ success: true, token_hash: tokenHash });

  } catch (error) {
    logger.error('❌ claim-by-email error:', error);
    return NextResponse.json({ error: 'internal', message: 'שגיאה זמנית, נסו שוב' }, { status: 500 });
  }
}
