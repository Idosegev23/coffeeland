/**
 * POST - מכירת סדרה ב-POS (אדמין בלבד)
 * כמו pos-sale אבל עבור סדרות (חוגים/סדנאות)
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
      customer_id,
      series_id,
      amount_paid,
      payment_method,
      child_id,
    } = body;

    if (!customer_id || !series_id || !amount_paid) {
      return NextResponse.json({
        error: 'Missing required fields: customer_id, series_id, amount_paid',
      }, { status: 400 });
    }

    // בדיקה שהסדרה קיימת
    const { data: series, error: seriesError } = await serviceClient
      .from('event_series')
      .select('*')
      .eq('id', series_id)
      .single();

    if (seriesError || !series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    // בדיקת קיבולת
    if (series.capacity) {
      const { count: activeRegs } = await serviceClient
        .from('series_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('series_id', series_id)
        .eq('status', 'active');

      if ((activeRegs || 0) >= series.capacity) {
        return NextResponse.json({
          error: 'Series is full',
          capacity: series.capacity,
          registered: activeRegs,
        }, { status: 409 });
      }
    }

    // יצירת תשלום
    const paymentType =
      payment_method === 'cash' ? 'pos_cash' :
      payment_method === 'credit' ? 'pos_credit' :
      payment_method === 'bit' ? 'pos_bit' :
      'pos_other';

    const { data: payment, error: paymentError } = await serviceClient
      .from('payments')
      .insert({
        user_id: customer_id,
        amount: amount_paid,
        currency: 'ILS',
        payment_type: paymentType,
        payment_method: payment_method,
        item_type: 'series',
        status: 'completed',
        processed_by_admin: admin.id,
        completed_at: new Date().toISOString(),
        notes: `רישום לסדרה: ${series.title}`,
        metadata: {
          created_via: 'pos',
          admin_id: admin.id,
          series_id,
          child_id,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment', details: paymentError.message }, { status: 500 });
    }

    // חישוב תוקף
    const { data: events } = await serviceClient
      .from('events')
      .select('id, start_at, end_at')
      .eq('series_id', series_id)
      .order('start_at', { ascending: true });

    const firstEvent = events?.[0];
    const lastEvent = events?.[events.length - 1];
    const validFrom = firstEvent ? new Date(firstEvent.start_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const validUntilDate = lastEvent ? new Date(lastEvent.end_at) : new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 7);
    const validUntil = validUntilDate.toISOString().split('T')[0];

    // QR code
    const qrCode = `SERIES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // יצירת רישום לסדרה
    const { data: registration, error: regError } = await serviceClient
      .from('series_registrations')
      .insert({
        series_id,
        user_id: customer_id,
        child_id: child_id || null,
        payment_type: 'full_series',
        payment_id: payment.id,
        amount_paid,
        status: 'active',
        valid_from: validFrom,
        valid_until: validUntil,
        qr_code: qrCode,
      })
      .select()
      .single();

    if (regError) {
      console.error('Error creating registration:', regError);
      // ניקוי: מחיקת התשלום
      await serviceClient.from('payments').delete().eq('id', payment.id);
      return NextResponse.json({ error: 'Failed to create registration', details: regError.message }, { status: 500 });
    }

    // יצירת session_attendance לכל מפגש עתידי
    if (events && events.length > 0) {
      const now = new Date();
      const attendanceRows = events
        .filter(ev => new Date(ev.start_at) >= now)
        .map(ev => ({
          series_registration_id: registration.id,
          event_id: ev.id,
          status: 'expected',
        }));

      if (attendanceRows.length > 0) {
        await serviceClient.from('session_attendance').insert(attendanceRows);
      }
    }

    // עדכון תשלום עם מזהה הרישום
    await serviceClient
      .from('payments')
      .update({ item_id: registration.id })
      .eq('id', payment.id);

    // audit log
    await serviceClient.from('audit_log').insert({
      admin_id: admin.id,
      action: 'pos_series_sale',
      entity_type: 'series_registration',
      entity_id: registration.id,
      details: {
        customer_id,
        series_id,
        series_title: series.title,
        amount_paid,
        payment_method,
      },
    });

    return NextResponse.json({
      success: true,
      registration,
      payment,
      qr_code: qrCode,
    });
  } catch (error: any) {
    console.error('Error in POS series sale:', error);
    return NextResponse.json(
      { error: 'Failed to complete POS series sale', details: error.message },
      { status: 500 }
    );
  }
}
