import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { buildEmail } from '@/lib/email-campaign-template';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

/**
 * קמפיין "נכנסים עם הנייד" — שליחה יומית מדורגת דרך Resend.
 * תוכנית Resend חינמית = עד 100 מיילים ביום, לכן עד 95 לריצה (מרווח ביטחון).
 * טבלת email_campaign_log מונעת כפילויות; כשכולם קיבלו — הריצה הופכת ל-no-op.
 * עדיפות: קודם לקוחות בלי נייד (הם אלה שצריכים לפעול), אחר כך כולם.
 *
 * Vercel Cron: daily. הפעלה ידנית: GET עם Authorization: Bearer CRON_SECRET.
 */

const DAILY_LIMIT = 95;
const FROM = 'CoffeeLand <hello@coffelandclub.co.il>';
const REPLY_TO = 'triroars@gmail.com';
const SUBJECT = 'חדש בקופילנד: נכנסים עם הנייד בלבד 📱 (ויש מתנה בפנים)';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const supabase = getServiceClient();

    const [{ data: users }, { data: sentRows }] = await Promise.all([
      supabase.from('users').select('email, phone').not('email', 'is', null),
      supabase.from('email_campaign_log').select('email'),
    ]);

    const sent = new Set((sentRows || []).map(r => r.email));
    const seen = new Set<string>();
    const pending: Array<{ email: string; noPhone: boolean }> = [];

    for (const u of users || []) {
      const email = (u.email || '').trim().toLowerCase();
      if (!email || !email.includes('@') || seen.has(email) || sent.has(email)) continue;
      seen.add(email);
      pending.push({ email, noPhone: !(u.phone && u.phone.replace(/\D/g, '')) });
    }

    // בלי נייד קודם — הם צריכים לבצע פעולה
    pending.sort((a, b) => Number(b.noPhone) - Number(a.noPhone));
    const todays = pending.slice(0, DAILY_LIMIT);

    if (todays.length === 0) {
      return NextResponse.json({ done: true, message: 'campaign complete — nothing to send' });
    }

    const htmlA = buildEmail({ noPhone: false });
    const htmlB = buildEmail({ noPhone: true });

    let sentCount = 0;
    const failed: string[] = [];

    // Resend batch: עד 100 לבקשה
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todays.map(t => ({
        from: FROM,
        to: [t.email],
        reply_to: REPLY_TO,
        subject: SUBJECT,
        html: t.noPhone ? htmlB : htmlA,
      }))),
    });

    const resBody = await res.json().catch(() => null);

    if (res.ok) {
      sentCount = todays.length;
      const { error: logError } = await supabase.from('email_campaign_log').insert(
        todays.map(t => ({ email: t.email, variant: t.noPhone ? 'no_phone' : 'has_phone' }))
      );
      if (logError) logger.error('❌ email-campaign log insert failed:', logError);
    } else {
      failed.push(...todays.map(t => t.email));
      logger.error('❌ email-campaign batch failed:', res.status, resBody);
    }

    logger.info(`📧 email-campaign: sent ${sentCount}, remaining ${pending.length - sentCount}`);
    return NextResponse.json({
      sent: sentCount,
      failed: failed.length,
      remaining: pending.length - sentCount,
      resend_status: res.status,
    });

  } catch (error) {
    logger.error('❌ email-campaign error:', error);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
