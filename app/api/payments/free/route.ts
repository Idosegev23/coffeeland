import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

/**
 * POST /api/payments/free
 * יצירת רכישה חינמית עם קוד קופון - ללא PayPlus
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const serviceClient = getServiceClient(); // עבור פעולות מנהל
    
    // בדיקת משתמש מחובר
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'נדרשת התחברות' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      event_id, 
      ticket_type, 
      quantity = 1, 
      coupon_code,
      original_amount 
    } = body;

    if (!event_id) {
      return NextResponse.json(
        { error: 'חסר מזהה אירוע' },
        { status: 400 }
      );
    }

    if (!coupon_code) {
      return NextResponse.json(
        { error: 'חסר קוד קופון' },
        { status: 400 }
      );
    }

    // בדיקת האירוע
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'אירוע לא נמצא' },
        { status: 404 }
      );
    }

    // בדיקת קוד קופון
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', coupon_code.trim())
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: 'קוד קופון לא תקף' },
        { status: 400 }
      );
    }

    // וידוא שזה קופון חינמי
    if (coupon.discount_type !== 'free') {
      return NextResponse.json(
        { error: 'קוד קופון זה לא מאפשר כניסה חינמית' },
        { status: 400 }
      );
    }

    // בדיקת תוקף
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json(
        { error: 'קוד הקופון פג תוקף' },
        { status: 400 }
      );
    }

    // בדיקת מקסימום שימושים
    if (coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'קוד הקופון מוצה — הגיע למקסימום שימושים' },
        { status: 400 }
      );
    }

    // בדיקת שימוש כפול
    const { data: existingUsage } = await supabase
      .from('coupon_usages')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .single();

    if (existingUsage) {
      return NextResponse.json(
        { error: 'כבר השתמשת בקוד קופון זה' },
        { status: 400 }
      );
    }

    // בדיקת קיבולת - סופרים רק רישומים ששולמו (is_paid=true ולא מבוטלים)
    const { data: confirmedRegs } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', event_id)
      .eq('is_paid', true)
      .neq('status', 'cancelled');

    const { data: pendingPayments } = await supabase
      .from('payments')
      .select('metadata', { count: 'exact' })
      .eq('metadata->>event_id', event_id)
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());

    const confirmedCount = confirmedRegs?.length || 0;
    const pendingCount = pendingPayments?.reduce((sum: number, p: any) => {
      return sum + (p.metadata?.quantity || 1);
    }, 0) || 0;

    const currentReservations = confirmedCount + pendingCount;
    const availableSeats = (event.capacity || 0) - currentReservations;

    if (event.capacity && availableSeats < quantity) {
      return NextResponse.json(
        { error: `נותרו רק ${availableSeats} מקומות פנויים` },
        { status: 400 }
      );
    }

    // יצירת תשלום עם סטטוס completed (using service client for permissions)
    const { data: payment, error: paymentError } = await serviceClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: 0, // חינמי!
        status: 'completed',
        payment_method: 'coupon',
        item_type: 'show',
        metadata: {
          event_id,
          ticket_type: ticket_type || 'regular',
          quantity,
          coupon_code: coupon.code,
          coupon_id: coupon.id,
          original_amount,
          discount_amount: original_amount,
          payment_method: 'free_coupon'
        },
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json(
        { error: 'שגיאה ביצירת תשלום' },
        { status: 500 }
      );
    }

    // יצירת registrations
    const registrationsToInsert = Array.from({ length: quantity }, () => {
      const qrCode = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      return {
        event_id,
        user_id: user.id,
        status: 'confirmed',
        is_paid: true,
        payment_id: payment.id,
        ticket_type: ticket_type || 'regular',
        qr_code: qrCode,
        registered_at: new Date().toISOString()
      };
    });

    const { data: registrations, error: regError } = await serviceClient
      .from('registrations')
      .insert(registrationsToInsert)
      .select();

    if (regError || !registrations) {
      console.error('Error creating registrations:', regError);
      
      // ביטול התשלום במקרה של שגיאה
      await serviceClient
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);

      return NextResponse.json(
        { error: 'שגיאה ביצירת כרטיסים' },
        { status: 500 }
      );
    }

    // עדכון התשלום עם פרטי הרישומים
    await serviceClient
      .from('payments')
      .update({
        item_id: registrations[0].id,
        metadata: {
          ...payment.metadata,
          registration_ids: registrations.map(r => r.id)
        }
      })
      .eq('id', payment.id);

    // רישום שימוש בקופון
    await serviceClient
      .from('coupon_usages')
      .insert({
        coupon_id: coupon.id,
        user_id: user.id,
        payment_id: payment.id,
        discount_amount: original_amount || 0
      });

    // עדכון מספר השימושים בקופון
    await serviceClient
      .from('coupons')
      .update({ 
        used_count: (coupon.used_count || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', coupon.id);

    console.log(`✅ Free purchase created with coupon ${coupon.code}: ${registrations.length} tickets`);

    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      registrations: registrations.map(r => ({
        id: r.id,
        qr_code: r.qr_code
      })),
      message: `נוצרו ${quantity} כרטיסים בהצלחה! 🎉`
    });

  } catch (error) {
    console.error('Error creating free purchase:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת רכישה' },
      { status: 500 }
    );
  }
}
