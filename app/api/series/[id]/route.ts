/**
 * API: Single Series Management
 * GET - פרטי סדרה + אירועים + נרשמים
 * PATCH - עדכון סדרה (admin)
 * DELETE - מחיקת סדרה + כל האירועים (admin)
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - פרטי סדרה
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceClient = getServiceClient();
    const seriesId = params.id;

    // פרטי הסדרה
    const { data: series, error: seriesError } = await serviceClient
      .from('event_series')
      .select(`
        *,
        instructor:instructors(id, name),
        room:rooms(id, name, capacity)
      `)
      .eq('id', seriesId)
      .single();

    if (seriesError || !series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    // כל האירועים בסדרה
    const { data: events } = await serviceClient
      .from('events')
      .select(`
        id, title, start_at, end_at, series_order, status, capacity,
        registrations:event_reservations(id, status, user_id)
      `)
      .eq('series_id', seriesId)
      .order('series_order', { ascending: true });

    // כל הנרשמים לסדרה
    const { data: registrations } = await serviceClient
      .from('series_registrations')
      .select(`
        *,
        user:users(id, full_name, phone, email)
      `)
      .eq('series_id', seriesId)
      .order('registered_at', { ascending: false });

    // ספירת נרשמים פעילים
    const activeRegistrations = (registrations || []).filter(r => r.status === 'active').length;

    return NextResponse.json({
      series: {
        ...series,
        events: events || [],
        registrations: registrations || [],
        active_registrations_count: activeRegistrations,
        available_spots: series.capacity ? series.capacity - activeRegistrations : null,
      },
    });
  } catch (error: any) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch series', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - עדכון סדרה
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient();

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
    const seriesId = params.id;

    // עדכון רק שדות שנשלחו
    const updateFields: Record<string, any> = {};
    const allowedFields = [
      'title', 'description', 'series_price', 'per_session_price',
      'capacity', 'min_age', 'max_age', 'banner_image_url', 'status',
      'instructor_id', 'room_id',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: updated, error } = await serviceClient
      .from('event_series')
      .update(updateFields)
      .eq('id', seriesId)
      .select()
      .single();

    if (error) throw error;

    // אם שינו title/description/capacity - עדכן גם את האירועים
    if (updateFields.title || updateFields.description || updateFields.capacity) {
      const eventUpdate: Record<string, any> = {};
      if (updateFields.title) eventUpdate.title = updateFields.title;
      if (updateFields.description) eventUpdate.description = updateFields.description;
      if (updateFields.capacity) eventUpdate.capacity = updateFields.capacity;

      await serviceClient
        .from('events')
        .update(eventUpdate)
        .eq('series_id', seriesId);
    }

    // audit log
    await serviceClient.from('audit_log').insert({
      admin_id: admin.id,
      action: 'update_series',
      entity_type: 'event_series',
      entity_id: seriesId,
      details: updateFields,
    });

    return NextResponse.json({ series: updated });
  } catch (error: any) {
    console.error('Error updating series:', error);
    return NextResponse.json(
      { error: 'Failed to update series', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - מחיקת סדרה
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient();

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

    const seriesId = params.id;

    // בדיקה שאין נרשמים פעילים
    const { count: activeRegs } = await serviceClient
      .from('series_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('series_id', seriesId)
      .eq('status', 'active');

    if (activeRegs && activeRegs > 0) {
      return NextResponse.json({
        error: 'Cannot delete series with active registrations',
        active_registrations: activeRegs,
      }, { status: 409 });
    }

    // מחיקת attendance records
    const { data: regs } = await serviceClient
      .from('series_registrations')
      .select('id')
      .eq('series_id', seriesId);

    if (regs && regs.length > 0) {
      const regIds = regs.map(r => r.id);
      await serviceClient
        .from('session_attendance')
        .delete()
        .in('series_registration_id', regIds);
    }

    // מחיקת registrations
    await serviceClient
      .from('series_registrations')
      .delete()
      .eq('series_id', seriesId);

    // ניתוק אירועים מהסדרה (לא מוחקים אותם - SET NULL)
    await serviceClient
      .from('events')
      .update({ series_id: null, series_order: null })
      .eq('series_id', seriesId);

    // מחיקת הסדרה
    const { error } = await serviceClient
      .from('event_series')
      .delete()
      .eq('id', seriesId);

    if (error) throw error;

    // audit log
    await serviceClient.from('audit_log').insert({
      admin_id: admin.id,
      action: 'delete_series',
      entity_type: 'event_series',
      entity_id: seriesId,
      details: { title: 'deleted' },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting series:', error);
    return NextResponse.json(
      { error: 'Failed to delete series', details: error.message },
      { status: 500 }
    );
  }
}
