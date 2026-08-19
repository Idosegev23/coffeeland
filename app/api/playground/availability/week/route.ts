import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const maxDuration = 30;

/**
 * GET /api/playground/availability/week
 * זמינות המשחקייה ל-7 הימים הקרובים — ללוח השבועי בדף הבית.
 * מלקט את התשובות של ה-API היומי + מזהה כרטיס הכניסה לרכישה מהמשבצת.
 * נכנס לקאש CDN כדי שדף הבית לא יפציץ את ה-DB.
 */
export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;

    // "היום" לפי שעון ישראל
    const todayIsrael = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
    const [y, m, d] = todayIsrael.split('-').map(Number);

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(Date.UTC(y, m - 1, d + i));
      dates.push(dt.toISOString().split('T')[0]);
    }

    const [dayResults, { data: cardType }] = await Promise.all([
      Promise.all(
        dates.map(date =>
          fetch(`${origin}/api/playground/availability?date=${date}`, { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        )
      ),
      getServiceClient()
        .from('card_types')
        .select('id, name, price, sale_price')
        .eq('type', 'playground')
        .eq('entries_count', 1)
        .eq('is_active', true)
        .order('price', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    const days = dates.map((date, i) => {
      const day = dayResults[i];
      const weekday = new Date(`${date}T12:00:00+03:00`).toLocaleDateString('he-IL', {
        weekday: 'short',
        timeZone: 'Asia/Jerusalem',
      });
      if (!day) {
        return { date, weekday, closed: true, message: 'לא זמין', slots: [] };
      }
      return {
        date,
        weekday,
        closed: !!day.closed,
        message: day.message || day.closureReason || null,
        slots: day.slots || [],
      };
    });

    const res = NextResponse.json({
      today: todayIsrael,
      days,
      cardTypeId: cardType?.id || null,
      cardTypePrice: cardType ? Number(cardType.sale_price || cardType.price) : null,
    });
    // קאש CDN: 3 דקות טרי + רבע שעה stale — איזון בין עומס לדיוק התפוסה
    res.headers.set('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=900');
    return res;
  } catch (error) {
    console.error('❌ week availability error:', error);
    return NextResponse.json({ days: [], cardTypeId: null }, { status: 500 });
  }
}
