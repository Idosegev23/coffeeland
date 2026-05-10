import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';
import { processRefund } from '@/lib/payplus';
import { notifyRefundProcessed } from '@/lib/notifications';

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

    const { payment_id, refund_amount, reason, tickets_to_refund } = await req.json();

    // בדיקת פרמטרים
    if (!payment_id || !refund_amount || refund_amount <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    if (tickets_to_refund !== undefined && (!Number.isInteger(tickets_to_refund) || tickets_to_refund <= 0)) {
      return NextResponse.json({ error: 'Invalid tickets_to_refund' }, { status: 400 });
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
      return NextResponse.json({ error: 'Payment already fully refunded' }, { status: 400 });
    }

    if (payment.amount === 0) {
      return NextResponse.json({ error: 'Cannot refund a free payment' }, { status: 400 });
    }

    // סכום שכבר זוכה בעבר (זיכויים חלקיים קודמים)
    const { data: priorRefunds } = await supabase
      .from('refunds')
      .select('refund_amount')
      .eq('payment_id', payment.id)
      .eq('status', 'completed');
    const alreadyRefunded = (priorRefunds || []).reduce(
      (sum, r) => sum + Number(r.refund_amount || 0),
      0
    );
    const remainingRefundable = Number(payment.amount) - alreadyRefunded;

    if (refund_amount > remainingRefundable + 0.01) {
      return NextResponse.json({
        error: 'Refund amount exceeds remaining refundable amount',
        remaining_refundable: remainingRefundable
      }, { status: 400 });
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

    // בדיקה אם כבר יש זיכוי בתהליך (pending) - חוסם זיכוי כפול בו זמנית
    const { data: pendingRefund } = await supabase
      .from('refunds')
      .select('id')
      .eq('payment_id', payment.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (pendingRefund) {
      return NextResponse.json({ error: 'Refund already in progress' }, { status: 400 });
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
        status: 'pending',
        metadata: tickets_to_refund ? { tickets_to_refund } : null
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
        // טעינת ההרשמות הפעילות של תשלום זה (לזיהוי כמה לבטל)
        const { data: activeRegs } = await supabase
          .from('registrations')
          .select('id, registered_at')
          .eq('payment_id', payment.id)
          .neq('status', 'cancelled')
          .order('registered_at', { ascending: true });

        const activeCount = activeRegs?.length || 0;
        const isFullRefund = refund_amount === payment.amount;
        // כמה כרטיסים לבטל: אם נשלח tickets_to_refund - השתמש בו;
        // אם לא, ובמקרה של זיכוי מלא - בטל הכל; אחרת אל תבטל כלום (לכרטיסיות וכו').
        let regsToCancel = 0;
        if (tickets_to_refund) {
          regsToCancel = Math.min(tickets_to_refund, activeCount);
        } else if (isFullRefund) {
          regsToCancel = activeCount;
        }

        let cancelledCount = 0;
        if (regsToCancel > 0 && activeRegs && activeRegs.length > 0) {
          const idsToCancel = activeRegs.slice(0, regsToCancel).map(r => r.id);
          const { data: cancelledRegs } = await supabase
            .from('registrations')
            .update({ status: 'cancelled', is_paid: false })
            .in('id', idsToCancel)
            .select();
          cancelledCount = cancelledRegs?.length || 0;
          console.log(`✅ Cancelled ${cancelledCount}/${activeCount} registration(s) for payment ${payment.id}`);
        }

        // סטטוס התשלום: 'refunded' רק אם לא נותרו רישומים פעילים (זיכוי מלא בפועל)
        const remainingActive = activeCount - cancelledCount;
        const newPaymentStatus = remainingActive === 0 && (isFullRefund || activeCount > 0)
          ? 'refunded'
          : payment.status;

        const previousRefundedAmount = Number(payment.metadata?.refunded_amount) || 0;
        await supabase
          .from('payments')
          .update({
            status: newPaymentStatus,
            metadata: {
              ...payment.metadata,
              refund_id: refund.id,
              refunded_amount: previousRefundedAmount + refund_amount,
              refunded_at: new Date().toISOString(),
              partial_refund: newPaymentStatus !== 'refunded',
              refunded_quantity: (Number(payment.metadata?.refunded_quantity) || 0) + cancelledCount,
              remaining_quantity: remainingActive
            }
          })
          .eq('id', payment.id);

        // סימון כרטיסייה כמזוכה (רק בזיכוי מלא של כרטיסייה)
        if (isFullRefund && payment.metadata?.card_type_id && payment.item_id) {
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
          details: {
            refund_id: refund.id,
            amount: refund_amount,
            reason,
            tickets_refunded: cancelledCount,
            remaining_tickets: remainingActive
          }
        });

        console.log('✅ Refund completed successfully');

        // Notify admin
        const { data: refundUser } = await supabase.from('users').select('full_name').eq('id', payment.user_id).single();
        notifyRefundProcessed(refundUser?.full_name || 'לקוח', refund_amount, refund.id).catch(() => {});
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
