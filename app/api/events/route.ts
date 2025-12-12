/**
 * API: Events Management
 * ניהול אירועים (חוגים וסדנאות) עם סנכרון אוטומטי ליומן גוגל
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { upsertGoogleEvent, deleteGoogleEvent } from '@/lib/googleCalendar';

export const dynamic = 'force-dynamic';

type CreateEventOccurrence = {
  start_at: string;
  end_at: string;
};

function isValidIsoLikeDateTime(value: unknown): value is string {
  // Accepts ISO 8601 or datetime-local (YYYY-MM-DDTHH:mm)
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/.test(value);
}

function compareDateTimes(a: string, b: string): number {
  // Date parsing: works for ISO & datetime-local (interpreted as local time)
  return new Date(a).getTime() - new Date(b).getTime();
}

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
        registrations(
          id,
          status,
          registered_at,
          user:users(full_name, phone)
        )
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

    const occurrencesRaw = body?.occurrences;
    const hasOccurrences = Array.isArray(occurrencesRaw) && occurrencesRaw.length > 0;

    const commonInsert = {
      title: body.title,
      description: body.description,
      type: body.type,
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
    };

    const instructorName = body.instructor_name || null;
    const roomName = body.room_name || null;

    if (!hasOccurrences) {
      // יצירת האירוע ב-Supabase (מופע יחיד)
      const { data: event, error: insertError } = await supabase
        .from('events')
        .insert({
          ...commonInsert,
          start_at: body.start_at,
          end_at: body.end_at
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // סנכרון ליומן גוגל (אסינכרוני - לא חוסם)
      try {
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
    }

    // ---- Batch create (סדרת מופעים) ----
    if (occurrencesRaw.length > 100) {
      return NextResponse.json(
        { error: 'Too many occurrences (max 100)' },
        { status: 400 }
      );
    }

    const occurrences: CreateEventOccurrence[] = occurrencesRaw;
    for (const [idx, occ] of occurrences.entries()) {
      if (!occ || typeof occ !== 'object') {
        return NextResponse.json({ error: `Invalid occurrence at index ${idx}` }, { status: 400 });
      }
      if (!isValidIsoLikeDateTime((occ as any).start_at) || !isValidIsoLikeDateTime((occ as any).end_at)) {
        return NextResponse.json(
          { error: `Invalid start_at/end_at at index ${idx}` },
          { status: 400 }
        );
      }
      if (compareDateTimes((occ as any).start_at, (occ as any).end_at) >= 0) {
        return NextResponse.json(
          { error: `Occurrence start_at must be before end_at (index ${idx})` },
          { status: 400 }
        );
      }
    }

    // ניצור שורות לכל מופע
    const rows = occurrences
      .slice()
      .sort((a, b) => compareDateTimes(a.start_at, b.start_at))
      .map((occ) => ({
        ...commonInsert,
        // אם יצרו "סדרה" - ברירת מחדל לסמן כחוזר, גם אם לא נשלח
        is_recurring: body.is_recurring ?? true,
        recurrence_pattern: body.recurrence_pattern ?? 'batch',
        start_at: occ.start_at,
        end_at: occ.end_at
      }));

    const { data: created, error: batchInsertError } = await supabase
      .from('events')
      .insert(rows)
      .select();

    if (batchInsertError) throw batchInsertError;

    // סנכרון לגוגל לכל מופע (לא חוסם שגיאות בודדות)
    const updatedEvents: any[] = [];
    for (const ev of created || []) {
      let updated = ev;
      try {
        const googleEventId = await upsertGoogleEvent({
          title: ev.title,
          description: ev.description,
          start_at: ev.start_at,
          end_at: ev.end_at,
          location: roomName,
          instructor_name: instructorName,
          capacity: ev.capacity,
          registered_count: 0
        });

        await supabase
          .from('events')
          .update({
            google_event_id: googleEventId,
            synced_to_google: true,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', ev.id);

        updated = { ...ev, google_event_id: googleEventId, synced_to_google: true };
      } catch (googleError: any) {
        console.error('Google Calendar sync failed (batch):', googleError);
      }
      updatedEvents.push(updated);
    }

    // audit log (אחד לכל batch)
    await supabase.from('audit_log').insert({
      admin_id: admin.id,
      action: 'create_event_batch',
      entity_type: 'event',
      entity_id: updatedEvents[0]?.id || null,
      details: {
        title: body.title,
        type: body.type,
        occurrences_count: updatedEvents.length,
        recurrence_pattern: body.recurrence_pattern ?? 'batch'
      }
    });

    return NextResponse.json({ events: updatedEvents });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}

