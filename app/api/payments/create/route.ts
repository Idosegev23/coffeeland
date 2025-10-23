/**
 * API: Create Payment (Mockup + POS)
 * יצירת תשלום - דמה לאונליין או POS אמיתי
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
    const {
      amount,
      payment_type, // 'online', 'pos_cash', 'pos_credit', 'pos_bit', 'pos_other'
      payment_method,
      item_type, // 'pass', 'event_registration', 'workshop', 'other'
      item_id,
      user_id, // עבור POS - אפשר לשלם עבור מישהו אחר
      notes
    } = body;

    // בדיקה אם זה POS - צריך הרשאות אדמין
    const isPOS = payment_type.startsWith('pos_');
    let admin = null;

    if (isPOS) {
      const { data: adminData } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!adminData) {
        return NextResponse.json({ error: 'Admin access required for POS' }, { status: 403 });
      }
      admin = adminData;
    }

    const targetUserId = user_id || user.id;

    // יצירת תשלום
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: targetUserId,
        amount,
        currency: 'ILS',
        payment_type,
        payment_method,
        item_type,
        item_id,
        status: isPOS ? 'completed' : 'pending', // POS מאושר מיד
        processed_by_admin: isPOS ? admin?.id : null,
        notes,
        completed_at: isPOS ? new Date().toISOString() : null,
        metadata: {
          created_via: isPOS ? 'pos' : 'online',
          user_agent: request.headers.get('user-agent')
        }
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // אם זה תשלום POS מוצלח, עדכן את הפריט
    if (isPOS && item_type && item_id) {
      if (item_type === 'event_registration') {
        await supabase
          .from('registrations')
          .update({
            payment_id: payment.id,
            is_paid: true,
            status: 'confirmed'
          })
          .eq('id', item_id);
      } else if (item_type === 'pass') {
        await supabase
          .from('passes')
          .update({
            payment_id: payment.id,
            status: 'active'
          })
          .eq('id', item_id);
      }
    }

    // audit log
    if (admin) {
      await supabase.from('audit_log').insert({
        admin_id: admin.id,
        user_id: targetUserId,
        action: 'create_pos_payment',
        entity_type: 'payment',
        entity_id: payment.id,
        details: { amount, payment_type, item_type }
      });
    }

    return NextResponse.json({
      payment,
      message: isPOS ? 'Payment processed via POS' : 'Payment created. Awaiting confirmation.'
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}

