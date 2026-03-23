import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';
import { processRefund } from '@/lib/payplus';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // קבלת המשתמש הנוכחי
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // שימוש ב-service client לשאר הפעולות (עוקף RLS)
    const supabase = getServiceClient();

    // בדיקת הרשאות אדמין
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { payment_id, refund_amount, reason } = await req.json();

    // בדיקת פרמטרים
    if (!payment_id || !refund_amount || refund_amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // טעינת פרטי התשלום המקורי
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, metadata')
      .eq('id', payment_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // בדיקות תקינות
    if (payment.status === 'refunded') {
      return NextResponse.json({ error: 'Payment already refunded' }, { status: 400 });
    }

    if (payment.amount === 0) {
      return NextResponse.json({ error: 'Cannot refund a free payment' }, { status: 400 });
    }

    if (refund_amount > payment.amount) {
      return NextResponse.json({ error: 'Refund amount exceeds payment amount' }, { status: 400 });
    }

    // ה-transaction_uid מאוחסן ב-metadata (נשמר ע"י PayPlus callback)
    let transactionUid = payment.metadata?.payplus_transaction_uid;

    // Fallback: אם חסר ב-metadata, מחפשים ב-webhook_logs
    if (!transactionUid) {
      const { data: webhookLog } = await supabase
        .from('webhook_logs')
        .select('transaction_uid')
        .eq('payment_id', payment.id.toString())
        .eq('status', 'completed')
        .not('transaction_uid', 'is', null)
        .single();

      if (webhookLog?.transaction_uid) {
        transactionUid = webhookLog.transaction_uid;
        // תיקון ה-metadata לעתיד
        await supabase
          .from('payments')
          .update({
            metadata: { ...payment.metadata, payplus_transaction_uid: transactionUid }
          })
          .eq('id', payment.id);
        console.log(`🔧 Fixed missing transaction_uid for payment ${payment.id}: ${transactionUid}`);
      }
    }

    if (!transactionUid) {
      return NextResponse.json({ error: 'Payment has no PayPlus transaction UID - cannot refund' }, { status: 400 });
    }

    // בדיקה אם כבר יש זיכוי בתהליך
    const { data: existingRefund } = await supabase
      .from('refunds')
      .select('*')
      .eq('payment_id', payment.id)
      .in('status', ['pending', 'completed'])
      .single();

    if (existingRefund) {
      return NextResponse.json({ 
        error: existingRefund.status === 'completed' 
          ? 'Payment already refunded' 
          : 'Refund already in progress' 
      }, { status: 400 });
    }

    // יצירת רשומת זיכוי (pending)
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        payment_id: payment.id,
        user_id: payment.user_id,
        processed_by_admin: admin.id,
        refund_amount,
        original_amount: payment.amount,
        refund_type: refund_amount === payment.amount ? 'full' : 'partial',
        reason: reason || null,
        status: 'pending'
      })
      .select()
      .single();

    if (refundError) {
      console.error('Error creating refund record:', refundError);
      throw refundError;
    }

    console.log('🔵 Processing refund:', refund.id);

    // ביצוע זיכוי ב-PayPlus
    try {
      const payplusResponse = await processRefund({
        transaction_uid: transactionUid,
        amount: refund_amount,
        reason
      });

      // בדיקת תוצאה
      const isSuccess = payplusResponse.results?.status === 'success' || 
                       payplusResponse.results?.code === 0;

      console.log('🟢 PayPlus refund result:', { isSuccess, response: payplusResponse });

      // עדכון סטטוס הזיכוי
      await supabase
        .from('refunds')
        .update({
          status: isSuccess ? 'completed' : 'failed',
          payplus_response: payplusResponse,
          payplus_transaction_uid: payplusResponse.data?.transaction_uid,
          error_message: !isSuccess ? payplusResponse.results?.description : null,
          completed_at: isSuccess ? new Date().toISOString() : null
        })
        .eq('id', refund.id);

      if (isSuccess) {
        // עדכון סטטוס התשלום המקורי
        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            metadata: {
              ...payment.metadata,
              refund_id: refund.id,
              refunded_amount: refund_amount,
              refunded_at: new Date().toISOString()
            }
          })
          .eq('id', payment.id);

        // ביטול registrations שקשורות לתשלום זה (לפי payment_id)
        const { data: cancelledRegs, error: regCancelError } = await supabase
          .from('registrations')
          .update({ status: 'cancelled', is_paid: false })
          .eq('payment_id', payment.id)
          .select();

        if (!regCancelError && cancelledRegs && cancelledRegs.length > 0) {
          console.log(`✅ Cancelled ${cancelledRegs.length} registration(s) for payment ${payment.id}`);
        }

        // גם לפי event_id מה-metadata (למקרה שה-payment_id לא תואם)
        if (payment.metadata?.event_id) {
          const { data: extraCancelled } = await supabase
            .from('registrations')
            .update({ status: 'cancelled', is_paid: false })
            .eq('event_id', payment.metadata.event_id)
            .eq('user_id', payment.user_id)
            .eq('payment_id', payment.id)
            .select();

          if (extraCancelled && extraCancelled.length > 0) {
            console.log(`✅ Extra cancelled ${extraCancelled.length} registration(s) by event_id`);
          }
        }

        // סימון כרטיסייה כמזוכה
        if (payment.metadata?.card_type_id && payment.item_id) {
          await supabase
            .from('passes')
            .update({ status: 'refunded' })
            .eq('id', payment.item_id);

          console.log('✅ Pass marked as refunded:', payment.item_id);
        }

        // audit log
        await supabase.from('audit_log').insert({
          admin_id: admin.id,
          user_id: payment.user_id,
          action: 'process_refund',
          entity_type: 'payment',
          entity_id: payment.id,
          details: { refund_id: refund.id, amount: refund_amount, reason }
        });

        console.log('✅ Refund completed successfully');
      } else {
        console.error('❌ Refund failed:', payplusResponse.results?.description);
      }

      return NextResponse.json({
        success: isSuccess,
        refund: {
          ...refund,
          status: isSuccess ? 'completed' : 'failed'
        },
        message: isSuccess ? 'הזיכוי בוצע בהצלחה' : 'הזיכוי נכשל'
      });

    } catch (payplusError) {
      console.error('❌ PayPlus Error:', payplusError);
      
      // עדכון סטטוס לכשלון
      await supabase
        .from('refunds')
        .update({
          status: 'failed',
          error_message: payplusError instanceof Error ? payplusError.message : 'Unknown error'
        })
        .eq('id', refund.id);

      return NextResponse.json({
        success: false,
        refund: {
          ...refund,
          status: 'failed'
        },
        message: 'שגיאה בביצוע זיכוי דרך PayPlus',
        error: payplusError instanceof Error ? payplusError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error processing refund:', error);
    return NextResponse.json({
      error: 'Failed to process refund',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
