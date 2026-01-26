/**
 * API: Single Event Operations
 * עדכון ומחיקה של אירוע בודד
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { upsertGoogleEvent, deleteGoogleEvent } from '@/lib/googleCalendar';

export const dynamic = 'force-dynamic';

// GET - קבלת אירוע בודד
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        instructor:instructors(id, name, phone, email),
        room:rooms(id, name, capacity, location),
        registrations(
          id,
          user_id,
          child_id,
          status,
          is_paid,
          registered_at,
          user:users(id, full_name, email, phone),
          child:children(id, name, age)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ event });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Event not found', details: error.message },
      { status: 404 }
    );
  }
}

// PUT - עדכון אירוע (alias ל-PATCH)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(request, { params });
}

// PATCH - עדכון אירוע
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // בדיקת הרשאות
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

    // עדכון ב-Supabase - רק שדות מותרים
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // רק שדות שנשלחו ומותרים לעדכון
    const allowedFields = [
      'title', 'description', 'type', 'start_at', 'end_at',
      'is_recurring', 'recurrence_pattern', 'recurrence_days', 'recurrence_end_date',
      'instructor_id', 'room_id', 'capacity', 'min_age', 'max_age',
      'price', 'requires_registration', 'status',
      // שדות הצגות:
      'is_featured', 'cancellation_deadline_hours', 
      'banner_image_url', 'price_show_only', 'price_show_and_playground'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // סנכרון מעודכן ליומן גוגל
    if (event.google_event_id) {
      try {
        await upsertGoogleEvent({
          google_event_id: event.google_event_id,
          title: event.title,
          description: event.description,
          start_at: event.start_at,
          end_at: event.end_at,
          location: body.room_name || null,
          instructor_name: body.instructor_name || null,
          capacity: event.capacity,
          registered_count: body.registered_count || 0
        });

        await supabase
          .from('events')
          .update({ last_synced_at: new Date().toISOString() })
          .eq('id', event.id);
      } catch (googleError) {
        console.error('Google sync failed on update:', googleError);
      }
    }

    // audit log
    await supabase.from('audit_log').insert({
      admin_id: admin.id,
      action: 'update_event',
      entity_type: 'event',
      entity_id: event.id,
      details: body
    });

    return NextResponse.json({ event });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - מחיקת אירוע
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    
    // בדיקת הרשאות
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

    // קבלת האירוע לפני מחיקה
    const { data: event } = await supabase
      .from('events')
      .select('google_event_id, title')
      .eq('id', id)
      .single();

    // מחיקה מיומן גוגל
    if (event?.google_event_id) {
      try {
        await deleteGoogleEvent(event.google_event_id);
      } catch (googleError) {
        console.error('Failed to delete from Google:', googleError);
      }
    }

    // מחיקה מ-Supabase
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // audit log
    await supabase.from('audit_log').insert({
      admin_id: admin.id,
      action: 'delete_event',
      entity_type: 'event',
      entity_id: id,
      details: { title: event?.title }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete event', details: error.message },
      { status: 500 }
    );
  }
}

