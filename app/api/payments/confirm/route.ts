/**
 * API: Confirm Payment (Mockup)
 * אישור תשלום - דמה לעכשיו (במקום webhook אמיתי)
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { payment_id, green_invoice_id, green_invoice_url } = body;

    // עדכון התשלום לסטטוס completed
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        green_invoice_id: green_invoice_id || `MOCK-${Date.now()}`,
        green_invoice_url: green_invoice_url || '#'
      })
      .eq('id', payment_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // עדכון הפריט הקשור
    if (payment.item_type && payment.item_id) {
      if (payment.item_type === 'event_registration') {
        await supabase
          .from('registrations')
          .update({
            payment_id: payment.id,
            is_paid: true,
            status: 'confirmed'
          })
          .eq('id', payment.item_id);
      } else if (payment.item_type === 'pass') {
        await supabase
          .from('passes')
          .update({
            payment_id: payment.id,
            status: 'active'
          })
          .eq('id', payment.item_id);
      }
    }

    return NextResponse.json({
      payment,
      message: 'Payment confirmed successfully'
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment', details: error.message },
      { status: 500 }
    );
  }
}

