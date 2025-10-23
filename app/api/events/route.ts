/**
 * API: Events Management
 * ניהול אירועים (חוגים וסדנאות) עם סנכרון אוטומטי ליומן גוגל
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { upsertGoogleEvent, deleteGoogleEvent } from '@/lib/googleCalendar';

export const dynamic = 'force-dynamic';

// GET - קבלת רשימת אירועים
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type'); // 'class', 'workshop', 'event'
    const status = searchParams.get('status') || 'active';
    const from = searchParams.get('from'); // תאריך התחלה
    const to = searchParams.get('to'); // תאריך סיום

    let query = supabase
      .from('events')
      .select(`
        *,
        instructor:instructors(id, name),
        room:rooms(id, name, capacity),
        registrations(count)
      `)
      .eq('status', status)
      .order('start_at', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    if (from) {
      query = query.gte('start_at', from);
    }

    if (to) {
      query = query.lte('start_at', to);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ events: data });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    );
  }
}

// POST - יצירת אירוע חדש
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // בדיקת הרשאות אדמין
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('POST /api/events - User:', user?.id, userError);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - Please login', details: userError?.message }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    console.log('Admin check:', admin, adminError);

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required', details: adminError?.message }, { status: 403 });
    }

    const body = await request.json();

    // יצירת האירוע ב-Supabase
    const { data: event, error: insertError } = await supabase
      .from('events')
      .insert({
        title: body.title,
        description: body.description,
        type: body.type,
        start_at: body.start_at,
        end_at: body.end_at,
        is_recurring: body.is_recurring || false,
        recurrence_pattern: body.recurrence_pattern,
        recurrence_days: body.recurrence_days,
        recurrence_end_date: body.recurrence_end_date,
        instructor_id: body.instructor_id,
        room_id: body.room_id,
        capacity: body.capacity,
        min_age: body.min_age,
        max_age: body.max_age,
        price: body.price,
        requires_registration: body.requires_registration ?? true,
        status: 'active'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // סנכרון ליומן גוגל (אסינכרוני - לא חוסם)
    try {
      const instructorName = body.instructor_name || null;
      const roomName = body.room_name || null;

      const googleEventId = await upsertGoogleEvent({
        title: event.title,
        description: event.description,
        start_at: event.start_at,
        end_at: event.end_at,
        location: roomName,
        instructor_name: instructorName,
        capacity: event.capacity,
        registered_count: 0
      });

      // עדכון ה-event עם google_event_id
      await supabase
        .from('events')
        .update({
          google_event_id: googleEventId,
          synced_to_google: true,
          last_synced_at: new Date().toISOString()
        })
        .eq('id', event.id);

      event.google_event_id = googleEventId;
      event.synced_to_google = true;
    } catch (googleError: any) {
      console.error('Google Calendar sync failed:', googleError);
      // לא נכשל את כל הבקשה בגלל שגיאת סנכרון
    }

    // רישום ב-audit log
    await supabase.from('audit_log').insert({
      admin_id: admin.id,
      action: 'create_event',
      entity_type: 'event',
      entity_id: event.id,
      details: { title: event.title, type: event.type }
    });

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}

