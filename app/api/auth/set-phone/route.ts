import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';
import { normalizePhone, isValidIsraeliMobile } from '@/lib/phone';
import { logger } from '@/lib/logger';

/**
 * עדכון מספר טלפון למשתמש מחובר — עבור לקוחות ותיקים שנרשמו בלי טלפון
 * ומשלימים אותו בכניסה אחרונה עם אימייל.
 * POST /api/auth/set-phone { phone }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const phone = normalizePhone(body?.phone || '');

    if (!isValidIsraeliMobile(phone)) {
      return NextResponse.json(
        { error: 'invalid_phone', message: 'יש להזין מספר נייד ישראלי תקין (05X-XXXXXXX)' },
        { status: 400 }
      );
    }

    const { error: updateError } = await getServiceClient()
      .from('users')
      .update({ phone })
      .eq('id', user.id);

    if (updateError) {
      logger.error('❌ set-phone update failed:', updateError);
      return NextResponse.json(
        { error: 'update_failed', message: 'שגיאה בשמירת הטלפון, נסו שוב' },
        { status: 500 }
      );
    }

    logger.info('✅ phone set for user:', user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('❌ set-phone error:', error);
    return NextResponse.json(
      { error: 'internal', message: 'שגיאה זמנית, נסו שוב' },
      { status: 500 }
    );
  }
}
