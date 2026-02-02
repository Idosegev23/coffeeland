import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * Webhook Retry Processor
 * GET /api/webhooks/retry
 * 
 * מעבד webhooks שנכשלו עם exponential backoff
 * רץ כל 5 דקות דרך Vercel Cron
 */
export async function GET(req: NextRequest) {
  try {
    // בדיקת authorization (רק Vercel Cron או admin)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const now = new Date();
    
    console.log('[WEBHOOK-RETRY] Starting retry process at:', now.toISOString());

    // מציאת webhooks שנכשלו ונצריך retry
    // exponential backoff: ננסה אחרי 1min, 5min, 15min, 1h, 6h, 24h
    const retryDelays = [
      { min_retry: 0, max_retry: 0, delay_minutes: 1 },    // ניסיון ראשון - אחרי דקה
      { min_retry: 1, max_retry: 1, delay_minutes: 5 },    // ניסיון שני - אחרי 5 דקות
      { min_retry: 2, max_retry: 2, delay_minutes: 15 },   // ניסיון שלישי - אחרי 15 דקות
      { min_retry: 3, max_retry: 3, delay_minutes: 60 },   // ניסיון רביעי - אחרי שעה
      { min_retry: 4, max_retry: 4, delay_minutes: 360 },  // ניסיון חמישי - אחרי 6 שעות
      { min_retry: 5, max_retry: 10, delay_minutes: 1440 } // ניסיונות נוספים - אחרי יום
    ];

    const results: any[] = [];
    let totalRetried = 0;
    let totalSucceeded = 0;
    let totalFailed = 0;

    for (const { min_retry, max_retry, delay_minutes } of retryDelays) {
      const retryAfter = new Date(now.getTime() - delay_minutes * 60 * 1000);

      const { data: webhooksToRetry, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('status', 'failed')
        .gte('retry_count', min_retry)
        .lte('retry_count', max_retry)
        .lt('processed_at', retryAfter.toISOString())
        .order('created_at', { ascending: true })
        .limit(10); // מעבד עד 10 webhooks בכל פעם

      if (error) {
        console.error('[WEBHOOK-RETRY] Error fetching webhooks:', error);
        continue;
      }

      if (!webhooksToRetry || webhooksToRetry.length === 0) {
        continue;
      }

      console.log(`[WEBHOOK-RETRY] Found ${webhooksToRetry.length} webhooks to retry (retry_count ${min_retry}-${max_retry})`);

      // מעבד כל webhook
      for (const webhook of webhooksToRetry) {
        totalRetried++;
        
        try {
          // קריאה מחדש ל-callback handler הפנימי
          const result = await processWebhookPayload(webhook.payload, webhook.id);

          if (result.success) {
            totalSucceeded++;
            results.push({
              webhook_id: webhook.id,
              payment_id: webhook.payment_id,
              action: 'success',
              retry_count: webhook.retry_count + 1
            });
          } else {
            totalFailed++;
            
            // עדכון retry count
            await supabase
              .from('webhook_logs')
              .update({
                retry_count: webhook.retry_count + 1,
                error_message: result.error,
                processed_at: new Date().toISOString()
              })
              .eq('id', webhook.id);

            results.push({
              webhook_id: webhook.id,
              payment_id: webhook.payment_id,
              action: 'failed',
              retry_count: webhook.retry_count + 1,
              error: result.error
            });

            // אם הגענו ל-10 ניסיונות - נוותר ונשלח alert
            if (webhook.retry_count >= 9) {
              await supabase
                .from('alerts')
                .insert({
                  alert_type: 'webhook_failed',
                  severity: 'critical',
                  title: 'Webhook Failed After Multiple Retries',
                  message: `Webhook ${webhook.id} failed after ${webhook.retry_count + 1} attempts`,
                  details: {
                    webhook_id: webhook.id,
                    payment_id: webhook.payment_id,
                    final_error: result.error,
                    payload: webhook.payload
                  },
                  webhook_log_id: webhook.id
                });
            }
          }
        } catch (err: any) {
          totalFailed++;
          console.error(`[WEBHOOK-RETRY] Error processing webhook ${webhook.id}:`, err);
          
          results.push({
            webhook_id: webhook.id,
            payment_id: webhook.payment_id,
            action: 'error',
            error: err.message
          });
        }
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      total_retried: totalRetried,
      succeeded: totalSucceeded,
      failed: totalFailed,
      results
    };

    console.log('[WEBHOOK-RETRY] Summary:', JSON.stringify(summary, null, 2));

    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('[WEBHOOK-RETRY] Fatal error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * עיבוד מחדש של webhook payload
 */
async function processWebhookPayload(payload: any, webhookLogId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getServiceClient();
  
  try {
    const {
      transaction_uid,
      page_request_uid,
      status_code,
      approval_num,
      voucher_num,
      more_info_1,  // ID התשלום בDB
      customer_uid,
      token_uid
    } = payload;

    // קבלת סטטוס העסקה
    const isSuccess = status_code === '000' || status_code === 0 || status_code === '0';
    const paymentStatus = isSuccess ? 'completed' : 'failed';

    // מציאת התשלום בDB
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*, metadata')
      .eq('id', more_info_1)
      .single();

    if (findError || !payment) {
      return { success: false, error: `Payment not found: ${more_info_1}` };
    }

    // אם התשלום כבר completed - לא צריך לעדכן
    if (payment.status === 'completed') {
      await supabase
        .from('webhook_logs')
        .update({ status: 'completed', processed_at: new Date().toISOString() })
        .eq('id', webhookLogId);
      
      return { success: true };
    }

    // עדכון סטטוס התשלום
    await supabase
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
          callback_received_at: new Date().toISOString(),
          retry_processed: true
        }
      })
      .eq('id', payment.id);

    // יצירת registration/pass בהתאם
    if (isSuccess && payment.metadata?.event_id) {
      const { data: existingReg } = await supabase
        .from('registrations')
        .select('id')
        .eq('payment_id', payment.id)
        .single();

      if (!existingReg) {
        await supabase
          .from('registrations')
          .insert({
            event_id: payment.metadata.event_id,
            user_id: payment.user_id,
            status: 'confirmed',
            is_paid: true,
            payment_id: payment.id,
            ticket_type: payment.metadata.ticket_type || 'show_only',
            registered_at: new Date().toISOString()
          });
      }
    } else if (isSuccess && payment.metadata?.card_type_id) {
      const { data: existingPass } = await supabase
        .from('passes')
        .select('id')
        .eq('payment_id', payment.id)
        .single();

      if (!existingPass) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);

        await supabase
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
          });
      }
    }

    // עדכון webhook log לcompleted
    await supabase
      .from('webhook_logs')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString(),
        error_message: null
      })
      .eq('id', webhookLogId);

    return { success: true };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// מאפשר גם POST (לבדיקות ידניות)
export async function POST(req: NextRequest) {
  return GET(req);
}
