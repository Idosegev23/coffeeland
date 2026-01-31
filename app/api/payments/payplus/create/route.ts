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
      ticket_type
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

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

      // ספירת כרטיסים מאושרים
      const { count: confirmedCount } = await serviceClient
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .eq('status', 'confirmed');

      const availableSeats = event.capacity - (confirmedCount || 0);

      if (availableSeats <= 0) {
        return NextResponse.json({ 
          error: 'sold_out',
          message: `אזל המלאי! ההצגה "${event.title}" מלאה.`,
          details: {
            capacity: event.capacity,
            sold: confirmedCount,
            available: 0
          }
        }, { status: 409 }); // 409 Conflict
      }

      console.log(`✅ Capacity check passed for ${event.title}: ${availableSeats} seats available`);
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
        item_type: card_type_id ? 'pass' : 'other',
        notes: description || card_type_name,
        metadata: {
          transaction_ref: transactionRef,
          card_type_id,
          card_type_name,
          entries_count,
          items,
          event_id,
          ticket_type
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
