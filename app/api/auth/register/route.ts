import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { normalizePhone, isValidIsraeliMobile } from '@/lib/phone';
import { logger } from '@/lib/logger';

/**
 * הרשמה מיידית ללא אימות מייל — החשבון נוצר בצד השרת והלקוח מחובר
 * מיד באותו מנגנון token של כניסת הטלפון. בלי לינקים חד-פעמיים במייל,
 * שסורקי אבטחה שורפים לפני שהלקוח מספיק ללחוץ (התקלה של 19.8).
 * POST /api/auth/register { full_name, email, phone }
 */

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

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
    const fullName = (body?.full_name || '').trim();
    const email = (body?.email || '').trim().toLowerCase();
    const phone = normalizePhone(body?.phone || '');

    if (!fullName) {
      return NextResponse.json({ error: 'invalid_name', message: 'יש להזין שם מלא' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid_email', message: 'כתובת האימייל אינה תקינה' }, { status: 400 });
    }
    if (!isValidIsraeliMobile(phone)) {
      return NextResponse.json(
        { error: 'invalid_phone', message: 'יש להזין מספר נייד ישראלי תקין, למשל 050-1234567' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();

    // אימייל שכבר רשום: אם יש חשבון מלא — מפנים לכניסה עם טלפון.
    // אם נשאר חצי-חשבון מהזרימה הישנה (auth בלי שורת user) — משלימים אותו.
    const { data: existingUserRow } = await serviceClient
      .from('users')
      .select('id, phone')
      .ilike('email', email)
      .maybeSingle();

    if (existingUserRow) {
      return NextResponse.json({
        error: 'email_exists',
        message: existingUserRow.phone
          ? 'כבר קיים חשבון עם האימייל הזה — היכנסו עם מספר הטלפון'
          : 'כבר קיים חשבון עם האימייל הזה. בעמוד הכניסה בחרו "נרשמתי בעבר עם אימייל" כדי לחבר אליו מספר טלפון.',
      }, { status: 409 });
    }

    // יצירת המשתמש ב-auth (או איתור חצי-חשבון קיים עם האימייל הזה)
    let userId: string | null = null;
    const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone },
    });

    if (createError) {
      const alreadyExists = createError.message?.toLowerCase().includes('already') || (createError as any).status === 422;
      if (!alreadyExists) {
        logger.error('❌ register createUser failed:', createError);
        return NextResponse.json(
          { error: 'create_failed', message: 'שגיאה ביצירת החשבון, נסו שוב' },
          { status: 500 }
        );
      }
      // auth קיים בלי שורת user — משלימים
      const { data: linkProbe } = await serviceClient.auth.admin.generateLink({ type: 'magiclink', email });
      userId = linkProbe?.user?.id || null;
      if (!userId) {
        logger.error('❌ register: existing auth user not resolvable for', email);
        return NextResponse.json(
          { error: 'create_failed', message: 'שגיאה ביצירת החשבון, נסו שוב' },
          { status: 500 }
        );
      }
    } else {
      userId = created.user?.id || null;
    }

    if (!userId) {
      return NextResponse.json({ error: 'create_failed', message: 'שגיאה ביצירת החשבון, נסו שוב' }, { status: 500 });
    }

    const qrCode = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const { error: insertError } = await serviceClient.from('users').insert({
      id: userId,
      email,
      full_name: fullName,
      phone,
      qr_code: qrCode,
    });

    if (insertError) {
      logger.error('❌ register users insert failed:', insertError);
      return NextResponse.json(
        { error: 'create_failed', message: 'שגיאה ביצירת החשבון, נסו שוב' },
        { status: 500 }
      );
    }

    await serviceClient.from('loyalty_cards').insert({
      user_id: userId,
      total_stamps: 0,
      redeemed_coffees: 0,
    });

    // חיבור מיידי — אותו מנגנון token כמו בכניסת הטלפון
    const { data: linkData, error: linkError } = await serviceClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    const tokenHash = linkData?.properties?.hashed_token;
    if (linkError || !tokenHash) {
      logger.error('❌ register generateLink failed:', linkError);
      // החשבון נוצר — שהלקוח פשוט ייכנס עם הטלפון
      return NextResponse.json({ success: true, login_required: true });
    }

    logger.info('✅ instant registration for user:', userId);
    return NextResponse.json({ success: true, token_hash: tokenHash });

  } catch (error) {
    logger.error('❌ register error:', error);
    return NextResponse.json(
      { error: 'internal', message: 'שגיאה זמנית, נסו שוב' },
      { status: 500 }
    );
  }
}
