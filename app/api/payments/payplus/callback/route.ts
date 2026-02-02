import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { verifyPayPlusCallback } from '@/lib/payplus';

/**
 * Callback/Webhook מ-PayPlus - Enhanced Version
 * POST /api/payments/payplus/callback
 * 
 * PayPlus שולח לכאן עדכון על סטטוס התשלום
 * כולל: Idempotency, Logging, Error Handling מחוזק
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const supabase = getServiceClient();
  let webhookLogId: string | null = null;

  try {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers.entries());
    
    console.log('📥 PayPlus Callback received at:', new Date().toISOString());
    console.log('📥 Callback data:', JSON.stringify(body, null, 2));

    // PayPlus שולח את הנתונים בתוך transaction object
    const transaction = body.transaction || {};
    
    // יצירת idempotency key מהנתונים
    const transactionUid = transaction.uid || '';
    const pageRequestUid = transaction.payment_page_request_uid || '';
    const statusCode = transaction.status_code || '';
    const idempotencyKey = `${transactionUid}-${pageRequestUid}-${statusCode}`;

    // בדיקת idempotency - האם כבר עיבדנו את ה-webhook הזה?
    const { data: existingLog } = await supabase
      .from('webhook_logs')
      .select('id, status')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingLog) {
      console.log(`⚠️ Duplicate webhook detected: ${idempotencyKey}, existing status: ${existingLog.status}`);
      
      // אם כבר הצליח - מחזירים הצלחה מיידית
      if (existingLog.status === 'completed') {
        return NextResponse.json({ 
          received: true, 
          status: 'already_processed',
          webhook_log_id: existingLog.id,
          message: 'Webhook already processed successfully'
        });
      }
      
      // אם נכשל - ננסה שוב
      webhookLogId = existingLog.id;
      await supabase
        .from('webhook_logs')
        .update({ 
          status: 'processing',
          retry_count: supabase.rpc('increment', { x: 1, delta: 1 })
        })
        .eq('id', webhookLogId);
    } else {
      // יצירת רשומת webhook חדשה
      const { data: newLog, error: logError } = await supabase
        .from('webhook_logs')
        .insert({
          webhook_type: 'payplus_callback',
          payload: body,
          headers: headers,
          transaction_uid: transactionUid,
          page_request_uid: pageRequestUid,
          payment_id: transaction.more_info_1 || null,
          status: 'processing',
          idempotency_key: idempotencyKey
        })
        .select('id')
        .single();

      if (logError) {
        console.error('❌ Error creating webhook log:', logError);
      } else {
        webhookLogId = newLog.id;
      }
    }

    // אימות שהCallback מגיע מPayPlus
    if (!verifyPayPlusCallback(body)) {
      console.error('❌ Invalid PayPlus callback signature');
      
      if (webhookLogId) {
        await supabase
          .from('webhook_logs')
          .update({ 
            status: 'failed',
            error_message: 'Invalid signature',
            processed_at: new Date().toISOString()
          })
          .eq('id', webhookLogId);
      }
      
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // PayPlus שולח את הנתונים בתוך transaction object (כבר הוגדר למעלה)
    const {
      uid: transaction_uid,
      payment_page_request_uid: page_request_uid,
      status_code,
      approval_number: approval_num,
      voucher_number: voucher_num,
      more_info,    // מזהה העסקה שלנו (transactionRef)
      more_info_1,  // ID התשלום בDB
      amount
    } = transaction;
    
    const data = body.data || {};
    const {
      customer_uid
    } = data;
    
    const token_uid = data.token_uid || data.card_information?.token || null;

    // קבלת סטטוס העסקה
    // status_code: 000 = הצלחה, אחרים = כשלון
    const isSuccess = status_code === '000' || status_code === 0 || status_code === '0';
    const paymentStatus = isSuccess ? 'completed' : 'failed';

    console.log(`💳 Payment ${isSuccess ? 'SUCCESS' : 'FAILED'}: ${more_info_1}`);

    // מציאת התשלום בDB
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*, metadata')
      .eq('id', more_info_1)
      .single();

    if (findError || !payment) {
      console.error('❌ Payment not found:', more_info_1, findError);
      // עדיין מחזירים 200 לPayPlus
      return NextResponse.json({ received: true, error: 'Payment not found' });
    }

    // עדכון סטטוס התשלום
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: paymentStatus,
        completed_at: isSuccess ? new Date().toISOString() : null,
        metadata: {
          ...payment.metadata,
          payplus_transaction_uid: transaction_uid,
          payplus_approval_num: approval_num,
          payplus_voucher_num: voucher_num,
          payplus_status_code: status_code,
          payplus_customer_uid: customer_uid,
          payplus_token_uid: token_uid,
          callback_received_at: new Date().toISOString()
        }
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error('❌ Error updating payment:', updateError);
    }

    // אם התשלום הצליח ויש card_type_id - יוצרים את הכרטיסייה
    if (isSuccess && payment.metadata?.card_type_id) {
      console.log('🎫 Creating pass for successful payment...');
      
      const { card_type_id, card_type_name, entries_count } = payment.metadata;
      
      // יצירת תוקף (3 חודשים)
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 3);

      const { data: pass, error: passError } = await supabase
        .from('passes')
        .insert({
          user_id: payment.user_id,
          card_type_id: card_type_id,
          type: card_type_name?.toLowerCase().includes('workshop') ? 'workshop' : 
                card_type_name?.toLowerCase().includes('playground') ? 'playground' : 
                'playground', // ברירת מחדל
          total_entries: entries_count || 10,
          remaining_entries: entries_count || 10,
          expiry_date: expiryDate.toISOString(),
          price_paid: payment.amount,
          status: 'active',
          purchase_date: new Date().toISOString(),
          payment_id: payment.id
        })
        .select()
        .single();

      if (passError) {
        console.error('❌ Error creating pass:', passError);
      } else {
        console.log('✅ Pass created:', pass.id);
        
        // עדכון התשלום עם מזהה הכרטיסייה
        await supabase
          .from('payments')
          .update({
            item_id: pass.id,
            metadata: {
              ...payment.metadata,
              pass_id: pass.id
            }
          })
          .eq('id', payment.id);
      }
    }
    
    // אם התשלום הצליח והוא עבור הצגה - יוצרים registration(s)
    if (isSuccess && payment.metadata?.event_id) {
      console.log('🎭 Creating show registration(s) for successful payment...');
      
      const { event_id, ticket_type } = payment.metadata;
      
      // קבלת הכמות מה-metadata של התשלום (מהימן יותר) או מה-items של PayPlus
      const quantity = payment.metadata?.quantity || 
                      (body.transaction?.items?.[0]?.quantity) || 
                      1;
      
      console.log(`🎟️ Creating ${quantity} registration(s) for event ${event_id}`);
      
      // יצירת מספר registrations לפי הכמות
      const registrationsToInsert = Array.from({ length: quantity }, () => ({
        event_id: event_id,
        user_id: payment.user_id,
        status: 'confirmed',
        is_paid: true,
        payment_id: payment.id,
        ticket_type: ticket_type || 'regular',
        registered_at: new Date().toISOString()
      }));
      
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .insert(registrationsToInsert)
        .select();

      if (regError) {
        console.error('❌ Error creating registrations:', regError);
      } else {
        console.log(`✅ Created ${registrations?.length || 0} registration(s):`, registrations?.map(r => r.id));
        
        // עדכון התשלום עם מזהה הרישום הראשון (לצורך תאימות)
        if (registrations && registrations.length > 0) {
          await supabase
            .from('payments')
            .update({
              item_id: registrations[0].id,
              item_type: 'show',
              metadata: {
                ...payment.metadata,
                registration_id: registrations[0].id,
                registration_ids: registrations.map(r => r.id),
                quantity: quantity
              }
            })
            .eq('id', payment.id);
        }
      }
    }

    console.log('✅ PayPlus callback processed successfully');
    
    // סימון webhook log בתור completed
    if (webhookLogId) {
      const duration = Date.now() - startTime;
      await supabase
        .from('webhook_logs')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', webhookLogId);
      
      console.log(`⏱️ Webhook processed in ${duration}ms`);
    }
    
    // PayPlus מצפה לתשובה 200
    return NextResponse.json({ 
      received: true,
      status: paymentStatus,
      payment_id: payment.id,
      webhook_log_id: webhookLogId,
      processing_time_ms: Date.now() - startTime
    });

  } catch (error) {
    console.error('❌ Error processing PayPlus callback:', error);
    
    // סימון webhook log בתור failed
    if (webhookLogId && supabase) {
      const duration = Date.now() - startTime;
      await supabase
        .from('webhook_logs')
        .update({ 
          status: 'failed',
          processed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', webhookLogId);
      
      // יצירת alert על כשלון webhook
      await supabase
        .from('alerts')
        .insert({
          alert_type: 'webhook_failed',
          severity: 'error',
          title: 'PayPlus Webhook Failed',
          message: `Failed to process PayPlus webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
            webhook_log_id: webhookLogId,
            processing_time_ms: duration
          },
          webhook_log_id: webhookLogId
        });
    }
    
    // עדיין מחזירים 200 כדי שPayPlus לא ינסה שוב (יש לנו retry logic משלנו)
    return NextResponse.json({ 
      received: true, 
      error: error instanceof Error ? error.message : 'Unknown error',
      webhook_log_id: webhookLogId
    });
  }
}

/**
 * GET - לבדיקת זמינות ה-endpoint
 */
export async function GET() {
  console.log('✅ PayPlus Callback GET check at:', new Date().toISOString());
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'PayPlus Callback',
    message: 'Endpoint is ready to receive webhooks',
    timestamp: new Date().toISOString()
  });
}
