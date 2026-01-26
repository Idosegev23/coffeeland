import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { checkTransactionStatus } from '@/lib/payplus';

/**
 * API לבדיקת סטטוס תשלום ישירות מ-PayPlus
 * POST /api/payments/verify-status
 * 
 * משמש כ-fallback mechanism כשה-callback לא מגיע
 */
export async function POST(req: NextRequest) {
  try {
    const { payment_id } = await req.json();
    
    if (!payment_id) {
      return NextResponse.json({ error: 'Missing payment_id' }, { status: 400 });
    }
    
    const supabase = getServiceClient();
    
    // מציאת התשלום
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();
    
    if (findError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    
    // אם התשלום כבר completed - לא צריך לבדוק
    if (payment.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        message: 'Payment already completed',
        payment_id: payment.id
      });
    }
    
    // בדיקה אם יש transaction_uid מ-PayPlus
    const transactionUid = payment.metadata?.payplus_transaction_uid || 
                          payment.metadata?.payplus_page_request_uid;
    
    if (!transactionUid) {
      return NextResponse.json({
        status: 'pending',
        message: 'No PayPlus transaction UID found yet',
        payment_id: payment.id
      });
    }
    
    // בדיקת סטטוס ישירות מ-PayPlus
    console.log(`🔍 Checking PayPlus status for payment: ${payment_id}`);
    
    const payPlusResponse = await checkTransactionStatus(transactionUid);
    
    if (!payPlusResponse?.results?.status) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid PayPlus response',
        payment_id: payment.id
      }, { status: 500 });
    }
    
    // בדיקה אם העסקה הצליחה
    const isSuccess = payPlusResponse.results.status === 'success' || 
                      payPlusResponse.results.code === 0;
    
    console.log(`PayPlus status: ${payPlusResponse.results.status}, code: ${payPlusResponse.results.code}`);
    
    if (isSuccess && payment.status === 'pending') {
      console.log(`✅ Payment ${payment_id} succeeded according to PayPlus - fixing now!`);
      
      // התשלום הצליח אבל ה-callback לא הגיע - נתקן אותו!
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          metadata: {
            ...payment.metadata,
            verified_by_api: true,
            verified_at: new Date().toISOString(),
            payplus_response: payPlusResponse.results
          }
        })
        .eq('id', payment.id);
      
      // יצירת registration/pass בהתאם
      if (payment.metadata?.event_id) {
        const { data: registration } = await supabase
          .from('registrations')
          .insert({
            event_id: payment.metadata.event_id,
            user_id: payment.user_id,
            status: 'confirmed',
            ticket_type: payment.metadata.ticket_type || 'show_only',
            registered_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (registration) {
          await supabase
            .from('payments')
            .update({
              metadata: {
                ...payment.metadata,
                registration_id: registration.id
              }
            })
            .eq('id', payment.id);
        }
        
        return NextResponse.json({
          status: 'completed',
          message: 'Payment verified and fixed',
          payment_id: payment.id,
          registration_id: registration?.id
        });
      } else if (payment.metadata?.card_type_id) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        
        const { data: pass } = await supabase
          .from('passes')
          .insert({
            user_id: payment.user_id,
            card_type_id: payment.metadata.card_type_id,
            type: 'playground',
            total_entries: payment.metadata.entries_count || 10,
            remaining_entries: payment.metadata.entries_count || 10,
            expiry_date: expiryDate.toISOString(),
            price_paid: payment.amount,
            status: 'active',
            purchase_date: new Date().toISOString(),
            payment_id: payment.id
          })
          .select()
          .single();
        
        if (pass) {
          await supabase
            .from('payments')
            .update({
              metadata: {
                ...payment.metadata,
                pass_id: pass.id
              }
            })
            .eq('id', payment.id);
        }
        
        return NextResponse.json({
          status: 'completed',
          message: 'Payment verified and fixed',
          payment_id: payment.id,
          pass_id: pass?.id
        });
      }
    }
    
    return NextResponse.json({
      status: payment.status,
      payplus_status: payPlusResponse.results.status,
      message: 'Payment status checked',
      payment_id: payment.id
    });
    
  } catch (error: any) {
    console.error('Error verifying payment status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
