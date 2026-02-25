/**
 * API: Session Attendance
 * GET - נוכחות כל הנרשמים לכל המפגשים
 * PATCH - סימון נוכחות
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - נוכחות כל הנרשמים
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient();
    const seriesId = params.id;

    // בדיקת הרשאות (אדמין או המשתמש עצמו)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // אחזר את כל הנרשמים לסדרה
    const { data: registrations } = await serviceClient
      .from('series_registrations')
      .select(`
        id, user_id, child_id, status, qr_code,
        user:users(id, full_name, phone, email)
      `)
      .eq('series_id', seriesId)
      .eq('status', 'active');

    // אחזר את כל המפגשים
    const { data: events } = await serviceClient
      .from('events')
      .select('id, title, start_at, end_at, series_order')
      .eq('series_id', seriesId)
      .order('series_order', { ascending: true });

    // אחזר את כל שורות הנוכחות
    const regIds = (registrations || []).map(r => r.id);
    let attendance: any[] = [];
    if (regIds.length > 0) {
      const { data: attendanceData } = await serviceClient
        .from('session_attendance')
        .select('*')
        .in('series_registration_id', regIds);
      attendance = attendanceData || [];
    }

    // מבנה נוח: לכל מפגש, רשימת נרשמים + סטטוס נוכחות
    const sessionAttendance = (events || []).map(event => {
      const eventAttendance = attendance.filter(a => a.event_id === event.id);
      const attendees = (registrations || []).map(reg => {
        const record = eventAttendance.find(a => a.series_registration_id === reg.id);
        return {
          registration_id: reg.id,
          user: reg.user,
          child_id: reg.child_id,
          qr_code: reg.qr_code,
          status: record?.status || 'expected',
          checked_in_at: record?.checked_in_at,
          attendance_id: record?.id,
        };
      });

      return {
        event,
        attendees,
        attended_count: attendees.filter(a => a.status === 'attended').length,
        total_registered: attendees.length,
      };
    });

    return NextResponse.json({
      series_id: seriesId,
      sessions: sessionAttendance,
      total_registrations: registrations?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - סימון/עדכון נוכחות
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { event_id, registration_id, status, qr_code } = body;

    // אפשרות 1: סימון לפי registration_id + event_id
    // אפשרות 2: סימון לפי qr_code + event_id
    let targetRegistrationId = registration_id;

    if (!targetRegistrationId && qr_code) {
      const { data: reg } = await serviceClient
        .from('series_registrations')
        .select('id')
        .eq('qr_code', qr_code)
        .eq('series_id', params.id)
        .single();

      if (!reg) {
        return NextResponse.json({ error: 'Registration not found for QR code' }, { status: 404 });
      }
      targetRegistrationId = reg.id;
    }

    if (!targetRegistrationId || !event_id) {
      return NextResponse.json({
        error: 'Missing required fields: event_id and (registration_id or qr_code)',
      }, { status: 400 });
    }

    const validStatuses = ['expected', 'attended', 'absent', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      }, { status: 400 });
    }

    // upsert - אם קיים עדכן, אם לא צור חדש
    const updateData: Record<string, any> = { status };
    if (status === 'attended') {
      updateData.checked_in_at = new Date().toISOString();
    }

    const { data: existing } = await serviceClient
      .from('session_attendance')
      .select('id')
      .eq('series_registration_id', targetRegistrationId)
      .eq('event_id', event_id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await serviceClient
        .from('session_attendance')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await serviceClient
        .from('session_attendance')
        .insert({
          series_registration_id: targetRegistrationId,
          event_id,
          ...updateData,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ attendance: result });
  } catch (error: any) {
    console.error('Error updating attendance:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance', details: error.message },
      { status: 500 }
    );
  }
}
