import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/admin/closures/hebcal?year=2026&month=5
// Returns Israeli Jewish holidays from Hebcal for the requested year/month
export async function GET(req: NextRequest) {
  try {
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient();
    const { data: admin } = await supabase
      .from('admins')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!admin?.is_active) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const year = parseInt(req.nextUrl.searchParams.get('year') || String(now.getFullYear()));
    const month = req.nextUrl.searchParams.get('month'); // optional 1-12

    // Hebcal Jewish Holiday API — Israeli calendar (i=on), major+minor+modern+rosh chodesh
    // Docs: https://www.hebcal.com/home/195/jewish-calendar-rest-api
    const params = new URLSearchParams({
      v: '1',
      cfg: 'json',
      year: String(year),
      maj: 'on',
      min: 'on',
      mod: 'on',
      mf: 'on',
      ss: 'on',
      i: 'on', // Israeli schedule
      lg: 'he',
    });
    if (month) params.set('month', month);

    const res = await fetch(`https://www.hebcal.com/hebcal?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 12 }, // cache 12h
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Hebcal', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const items = (data?.items || []) as Array<{
      title: string;
      date: string;
      category: string;
      hebrew?: string;
      yomtov?: boolean;
      subcat?: string;
    }>;

    const holidays = items
      .filter(it => ['holiday', 'roshchodesh', 'fast', 'mevarchim', 'omer'].includes(it.category))
      .map(it => ({
        date: it.date.length > 10 ? it.date.slice(0, 10) : it.date,
        title: it.hebrew || it.title,
        title_en: it.title,
        category: it.category,
        subcat: it.subcat || null,
        is_yom_tov: it.yomtov === true,
      }));

    return NextResponse.json({ year, month: month ? Number(month) : null, holidays });
  } catch (e: any) {
    console.error('Hebcal error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
