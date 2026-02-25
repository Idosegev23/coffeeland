import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generatePaymentLink, isPayPlusConfigured, getPayPlusConfig } from '@/lib/payplus';
import { getServiceClient } from '@/lib/supabase';

/**
 * יצירת קישור לדף תשלום PayPlus
 * POST /api/payments/payplus/create
 */
export async function POST(req: NextRequest) {
  try {
    // בדיקה שPayPlus מוגדר
    if (!isPayPlusConfigured()) {
      console.error('❌ PayPlus not configured:', getPayPlusConfig());
      return NextResponse.json({
        error: 'Payment system not configured',
        details: getPayPlusConfig()
      }, { status: 500 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient();
    
    // אימות משתמש
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // קבלת פרטי המשתמש
    const { data: userData } = await serviceClient
      .from('users')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single();

    const body = await req.json();
    const {
      amount,
      items,
      description,
      card_type_id,
      card_type_name,
      entries_count,
      return_url,
      event_id,
      ticket_type,
      quantity,
      series_id,
      child_id,
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // חישוב כמות הכרטיסים (ברירת מחדל: 1)
    const ticketQuantity = quantity || (items?.[0]?.quantity) || 1;

    // 🔥 בדיקת קיבולת להצגות/אירועים
    if (event_id) {
      const { data: event, error: eventError } = await serviceClient
        .from('events')
        .select('id, title, capacity, type, status')
        .eq('id', event_id)
        .single();

      if (eventError || !event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      // 🚫 בדיקה אם המכירה נעצרה ידנית
      if (event.status === 'full') {
        return NextResponse.json({ 
          error: 'sold_out',
          message: `⛔ אזל המלאי! המכירה להצגה "${event.title}" נעצרה.`,
          details: {
            status: 'full',
            reason: 'Sales stopped manually'
          }
        }, { status: 409 }); // 409 Conflict
      }

      // ספירת כרטיסים ששולמו (is_paid=true ולא מבוטלים)
      const { count: confirmedCount } = await serviceClient
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('is_paid', true)
        .neq('status', 'cancelled');

      // ⏰ ספירת כרטיסים ממתינים מה-15 דקות האחרונות (למניעת מירוץ על מקומות)
      // חשוב: מסכמים את metadata.quantity ולא סופרים שורות!
      // שורה אחת יכולה לייצג מספר כרטיסים (למשל: תשלום אחד ל-5 כרטיסים)
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data: pendingPayments } = await serviceClient
        .from('payments')
        .select('metadata')
        .eq('status', 'pending')
        .gte('created_at', fifteenMinutesAgo)
        .contains('metadata', { event_id: event_id });

      const pendingCount = (pendingPayments || []).reduce(
        (sum: number, p: any) => sum + (p.metadata?.quantity || 1),
        0
      );

      const totalReserved = (confirmedCount || 0) + pendingCount;
      const availableSeats = event.capacity - totalReserved;

      // בדיקה שיש מספיק מקומות עבור הכמות המבוקשת
      if (availableSeats < ticketQuantity) {
        return NextResponse.json({ 
          error: 'sold_out',
          message: availableSeats === 0 
            ? `אזל המלאי! ההצגה "${event.title}" מלאה.`
            : `נותרו רק ${availableSeats} מקומות, אבל ביקשת ${ticketQuantity} כרטיסים.`,
          details: {
            capacity: event.capacity,
            confirmed: confirmedCount,
            pending: pendingCount,
            available: availableSeats,
            requested: ticketQuantity
          }
        }, { status: 409 }); // 409 Conflict
      }

      console.log(`✅ Capacity check passed for ${event.title}: ${availableSeats} seats available (${confirmedCount} confirmed, ${pendingCount} pending), purchasing ${ticketQuantity} tickets`);
    }

    // 🔗 בדיקת קיבולת לסדרה
    if (series_id) {
      const { data: series, error: seriesError } = await serviceClient
        .from('event_series')
        .select('id, title, capacity, status')
        .eq('id', series_id)
        .single();

      if (seriesError || !series) {
        return NextResponse.json({ error: 'Series not found' }, { status: 404 });
      }

      if (series.status !== 'active') {
        return NextResponse.json({
          error: 'Series is not active',
          message: `הסדרה "${series.title}" אינה פעילה כרגע.`,
        }, { status: 409 });
      }

      if (series.capacity) {
        const { count: activeRegs } = await serviceClient
          .from('series_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('series_id', series_id)
          .eq('status', 'active');

        const { data: pendingSeriesPayments } = await serviceClient
          .from('payments')
          .select('metadata')
          .eq('status', 'pending')
          .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
          .contains('metadata', { series_id: series_id });

        const pendingSeriesCount = (pendingSeriesPayments || []).length;
        const totalSeriesReserved = (activeRegs || 0) + pendingSeriesCount;
        const availableSpots = series.capacity - totalSeriesReserved;

        if (availableSpots <= 0) {
          return NextResponse.json({
            error: 'sold_out',
            message: `אין מקומות פנויים בסדרה "${series.title}".`,
            details: {
              capacity: series.capacity,
              registered: activeRegs,
              pending: pendingSeriesCount,
            },
          }, { status: 409 });
        }

        console.log(`✅ Series capacity check passed for ${series.title}: ${availableSpots} spots available`);
      }
    }

    // URL-ים לחזרה
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || 'http://localhost:3000';
    
    // יצירת מזהה ייחודי לעסקה (לשמירה בDB)
    const transactionRef = `TXN_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // שמירת העסקה הממתינה בDB (משתמשים ב-serviceClient כדי לעקוף RLS)
    const { data: pendingPayment, error: dbError } = await serviceClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount,
        payment_type: 'online',
        payment_method: 'credit_card',
        status: 'pending',
        item_type: series_id ? 'series' : card_type_id ? 'pass' : 'other',
        notes: description || card_type_name,
        metadata: {
          transaction_ref: transactionRef,
          card_type_id,
          card_type_name,
          entries_count,
          items,
          event_id,
          ticket_type,
          quantity: ticketQuantity,
          series_id: series_id || undefined,
          child_id: child_id || undefined,
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Error creating pending payment:', dbError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // יצירת קישור PayPlus
    const paymentResponse = await generatePaymentLink({
      amount,
      customer: {
        customer_name: userData?.full_name || user.email || 'לקוח',
        email: user.email || '',
        phone: userData?.phone
      },
      products: items?.map((item: { name: string; quantity: number; price: number }) => ({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price
      })),
      more_info: transactionRef, // מזהה לקישור לDB
      more_info_1: pendingPayment.id, // ID של התשלום בDB
      refURL_success: `${baseUrl}/payment-success?payment_id=${pendingPayment.id}&ref=${transactionRef}`,
      refURL_failure: `${baseUrl}/checkout?error=payment_failed&ref=${transactionRef}`,
      refURL_callback: `${baseUrl}/api/payments/payplus/callback`,
      sendEmailApproval: true,
      initial_invoice: false, // לשנות ל-true אם רוצים חשבונית אוטומטית
    });

    // בדיקת תוצאה
    if (paymentResponse.results?.status !== 'success' || !paymentResponse.data?.payment_page_link) {
      console.error('❌ PayPlus error:', paymentResponse);
      
      // עדכון סטטוס בDB
      await serviceClient
        .from('payments')
        .update({ status: 'failed', metadata: { ...pendingPayment.metadata, payplus_error: paymentResponse } })
        .eq('id', pendingPayment.id);

      return NextResponse.json({
        error: 'Failed to create payment link',
        details: paymentResponse.results?.description
      }, { status: 500 });
    }

    // עדכון הDB עם פרטי PayPlus
    await serviceClient
      .from('payments')
      .update({
        metadata: {
          ...pendingPayment.metadata,
          payplus_page_request_uid: paymentResponse.data.page_request_uid,
          payplus_customer_uid: paymentResponse.data.customer_uid
        }
      })
      .eq('id', pendingPayment.id);

    console.log('✅ Payment link created:', paymentResponse.data.payment_page_link);

    return NextResponse.json({
      success: true,
      payment_id: pendingPayment.id,
      payment_url: paymentResponse.data.payment_page_link,
      qr_code: paymentResponse.data.qr_code_image
    });

  } catch (error) {
    console.error('❌ Error in PayPlus create:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
