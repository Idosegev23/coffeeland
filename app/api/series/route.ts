/**
 * API: Event Series Management
 * GET - רשימת סדרות (עם ספירת מפגשים ונרשמים)
 * POST - יצירת סדרה חדשה + אירועים מקושרים (admin only)
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { upsertGoogleEvent } from '@/lib/googleCalendar';

export const dynamic = 'force-dynamic';

// GET - רשימת סדרות
export async function GET(request: Request) {
  try {
    const serviceClient = getServiceClient();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type'); // 'class' | 'workshop'
    const status = searchParams.get('status'); // 'active' | 'paused' | 'completed' | 'cancelled'
    const includeEvents = searchParams.get('include_events') === 'true';

    let query = serviceClient
      .from('event_series')
      .select(`
        *,
        instructor:instructors(id, name),
        room:rooms(id, name)
      `)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.neq('status', 'cancelled');
    }

    const { data: series, error } = await query;
    if (error) throw error;

    // הוסף ספירות לכל סדרה
    const enriched = await Promise.all(
      (series || []).map(async (s) => {
        // ספירת מפגשים
        const { count: sessionsCount } = await serviceClient
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('series_id', s.id);

        // ספירת נרשמים פעילים
        const { count: registrationsCount } = await serviceClient
          .from('series_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('series_id', s.id)
          .eq('status', 'active');

        // אם צריך - טען גם את האירועים
        let events = null;
        if (includeEvents) {
          const { data: eventsData } = await serviceClient
            .from('events')
            .select('id, title, start_at, end_at, series_order')
            .eq('series_id', s.id)
            .order('series_order', { ascending: true });
          events = eventsData;
        }

        // המפגש הבא (עתידי)
        const now = new Date().toISOString();
        const { data: nextSession } = await serviceClient
          .from('events')
          .select('id, start_at, end_at')
          .eq('series_id', s.id)
          .gte('start_at', now)
          .order('start_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        return {
          ...s,
          sessions_count: sessionsCount || 0,
          registrations_count: registrationsCount || 0,
          next_session: nextSession,
          events: events,
        };
      })
    );

    return NextResponse.json({ series: enriched });
  } catch (error: any) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series', details: error.message },
      { status: 500 }
    );
  }
}

// POST - יצירת סדרה חדשה
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient();

    // בדיקת הרשאות אדמין
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      series_price,
      per_session_price,
      instructor_id,
      room_id,
      capacity,
      min_age,
      max_age,
      banner_image_url,
      occurrences, // Array<{ start_at: string, end_at: string }>
      instructor_name,
      room_name,
    } = body;

    // ולידציה בסיסית
    if (!title || !type || !occurrences || !Array.isArray(occurrences) || occurrences.length === 0) {
      return NextResponse.json({
        error: 'Missing required fields: title, type, occurrences'
      }, { status: 400 });
    }

    if (!['class', 'workshop'].includes(type)) {
      return NextResponse.json({ error: 'Type must be class or workshop' }, { status: 400 });
    }

    if (occurrences.length > 100) {
      return NextResponse.json({ error: 'Too many occurrences (max 100)' }, { status: 400 });
    }

    // 1. יצירת הסדרה
    const { data: series, error: seriesError } = await serviceClient
      .from('event_series')
      .insert({
        title,
        description,
        type,
        series_price: series_price || null,
        per_session_price: per_session_price || null,
        total_sessions: occurrences.length,
        instructor_id: instructor_id || null,
        room_id: room_id || null,
        capacity: capacity || null,
        min_age: min_age || null,
        max_age: max_age || null,
        banner_image_url: banner_image_url || null,
        status: 'active',
      })
      .select()
      .single();

    if (seriesError) throw seriesError;

    // 2. יצירת כל האירועים עם series_id
    const sortedOccurrences = [...occurrences].sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );

    const eventRows = sortedOccurrences.map((occ, index) => ({
      title,
      description,
      type,
      is_recurring: true,
      recurrence_pattern: 'series',
      instructor_id: instructor_id || null,
      room_id: room_id || null,
      capacity: capacity || null,
      min_age: min_age || null,
      max_age: max_age || null,
      price: per_session_price || null,
      requires_registration: true,
      status: 'active',
      banner_image_url: banner_image_url || null,
      series_id: series.id,
      series_order: index + 1,
      start_at: occ.start_at,
      end_at: occ.end_at,
    }));

    const { data: createdEvents, error: eventsError } = await serviceClient
      .from('events')
      .insert(eventRows)
      .select();

    if (eventsError) {
      // cleanup series if events creation fails
      await serviceClient.from('event_series').delete().eq('id', series.id);
      throw eventsError;
    }

    // 3. סנכרון לגוגל קלנדר
    for (const ev of createdEvents || []) {
      try {
        const googleEventId = await upsertGoogleEvent({
          title: `${ev.title} (מפגש ${ev.series_order}/${sortedOccurrences.length})`,
          description: ev.description,
          start_at: ev.start_at,
          end_at: ev.end_at,
          location: room_name,
          instructor_name: instructor_name,
          capacity: ev.capacity,
          registered_count: 0,
        });

        await serviceClient
          .from('events')
          .update({
            google_event_id: googleEventId,
            synced_to_google: true,
            last_synced_at: new Date().toISOString(),
          })
          .eq('id', ev.id);
      } catch (googleError) {
        console.error('Google Calendar sync failed for series event:', googleError);
      }
    }

    // 4. audit log
    await serviceClient.from('audit_log').insert({
      admin_id: admin.id,
      action: 'create_series',
      entity_type: 'event_series',
      entity_id: series.id,
      details: {
        title,
        type,
        total_sessions: occurrences.length,
        series_price,
        per_session_price,
      },
    });

    return NextResponse.json({
      series,
      events: createdEvents,
    });
  } catch (error: any) {
    console.error('Error creating series:', error);
    return NextResponse.json(
      { error: 'Failed to create series', details: error.message },
      { status: 500 }
    );
  }
}
