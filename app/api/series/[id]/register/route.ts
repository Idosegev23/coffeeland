/**
 * API: Series Registration
 * POST - רישום לסדרה + יצירת שורות session_attendance
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient();
    const { id: seriesId } = await params;

    // אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      child_id,
      payment_id,
      amount_paid,
      payment_type = 'full_series',
    } = body;

    // בדיקה שהסדרה קיימת ופעילה
    const { data: series, error: seriesError } = await serviceClient
      .from('event_series')
      .select('*')
      .eq('id', seriesId)
      .single();

    if (seriesError || !series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    if (series.status !== 'active') {
      return NextResponse.json({ error: 'Series is not active' }, { status: 400 });
    }

    // בדיקת קיבולת
    if (series.capacity) {
      const { count: activeRegs } = await serviceClient
        .from('series_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('series_id', seriesId)
        .eq('status', 'active');

      if ((activeRegs || 0) >= series.capacity) {
        return NextResponse.json({
          error: 'Series is full',
          capacity: series.capacity,
          registered: activeRegs,
        }, { status: 409 });
      }
    }

    // בדיקת רישום כפול
    let duplicateQuery = serviceClient
      .from('series_registrations')
      .select('id')
      .eq('series_id', seriesId)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (child_id) {
      duplicateQuery = duplicateQuery.eq('child_id', child_id);
    } else {
      duplicateQuery = duplicateQuery.is('child_id', null);
    }

    const { data: existing } = await duplicateQuery.maybeSingle();
    if (existing) {
      return NextResponse.json({
        error: 'Already registered for this series',
        registration_id: existing.id,
      }, { status: 409 });
    }

    // יצירת QR code
    const qrCode = `SERIES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // חישוב תוקף (מהמפגש הראשון עד האחרון + שבוע)
    const { data: events } = await serviceClient
      .from('events')
      .select('id, start_at, end_at')
      .eq('series_id', seriesId)
      .order('start_at', { ascending: true });

    const firstEvent = events?.[0];
    const lastEvent = events?.[events.length - 1];

    const validFrom = firstEvent ? new Date(firstEvent.start_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const validUntilDate = lastEvent ? new Date(lastEvent.end_at) : new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 7);
    const validUntil = validUntilDate.toISOString().split('T')[0];

    // יצירת הרישום
    const { data: registration, error: regError } = await serviceClient
      .from('series_registrations')
      .insert({
        series_id: seriesId,
        user_id: user.id,
        child_id: child_id || null,
        payment_type,
        payment_id: payment_id || null,
        amount_paid: amount_paid || null,
        status: 'active',
        valid_from: validFrom,
        valid_until: validUntil,
        qr_code: qrCode,
      })
      .select()
      .single();

    if (regError) throw regError;

    // יצירת שורות session_attendance לכל מפגש עתידי
    if (events && events.length > 0) {
      const now = new Date();
      const attendanceRows = events
        .filter(ev => new Date(ev.start_at) >= now) // רק מפגשים עתידיים
        .map(ev => ({
          series_registration_id: registration.id,
          event_id: ev.id,
          status: 'expected',
        }));

      if (attendanceRows.length > 0) {
        const { error: attendanceError } = await serviceClient
          .from('session_attendance')
          .insert(attendanceRows);

        if (attendanceError) {
          console.error('Error creating attendance rows:', attendanceError);
        }
      }
    }

    return NextResponse.json({
      registration,
      qr_code: qrCode,
      sessions_count: events?.length || 0,
    });
  } catch (error: any) {
    console.error('Error registering to series:', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
