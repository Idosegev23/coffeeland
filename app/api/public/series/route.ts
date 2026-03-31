/**
 * API: Public Series
 * GET - רשימת סדרות פעילות (ציבורי, ללא מידע אישי)
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

export async function GET(request: Request) {
  try {
    const service = getServiceClient();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type'); // 'class' | 'workshop'

    let query = service
      .from('event_series')
      .select(`
        id, title, description, type, series_price, per_session_price,
        total_sessions, capacity, min_age, max_age, banner_image_url, status,
        instructor:instructors(id, name),
        room:rooms(id, name)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data: seriesList, error } = await query;
    if (error) throw error;

    // עבור כל סדרה: ספירת נרשמים + מפגש הבא
    const enriched = await Promise.all(
      (seriesList || []).map(async (s) => {
        const { count: activeRegs } = await service
          .from('series_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('series_id', s.id)
          .eq('status', 'active');

        const now = new Date().toISOString();
        const { data: nextSession } = await service
          .from('events')
          .select('id, start_at, end_at, series_order')
          .eq('series_id', s.id)
          .gte('start_at', now)
          .order('start_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        // כל המפגשים
        const { data: allSessions } = await service
          .from('events')
          .select('id, start_at, end_at, series_order')
          .eq('series_id', s.id)
          .order('series_order', { ascending: true });

        return {
          ...s,
          registrations_count: activeRegs || 0,
          available_spots: s.capacity ? Math.max(0, s.capacity - (activeRegs || 0)) : null,
          next_session: nextSession,
          sessions: allSessions || [],
        };
      })
    );

    return NextResponse.json({ series: enriched });
  } catch (error: any) {
    console.error('Error fetching public series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}
