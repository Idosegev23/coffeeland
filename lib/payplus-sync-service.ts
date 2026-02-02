/**
 * PayPlus Sync Service
 * 
 * שירות לסנכרון מאסיבי של סטטוסי תשלומים מול PayPlus API
 */

import { getServiceClient } from './supabase';
import { checkTransactionStatus } from './payplus';

export interface SyncResult {
  payment_id: string;
  old_status: string;
  new_status: string;
  action: 'updated' | 'skipped' | 'failed';
  error?: string;
}

export interface SyncSummary {
  sync_log_id: string;
  total_checked: number;
  total_updated: number;
  total_failed: number;
  total_skipped: number;
  duration_ms: number;
  results: SyncResult[];
}

/**
 * סנכרון סטטוס של תשלומים pending מול PayPlus
 */
export async function syncPendingPayments(options?: {
  maxAge?: number; // גיל מקסימלי בשעות (ברירת מחדל: 72)
  limit?: number;  // מספר מקסימלי לבדיקה (ברירת מחדל: 50)
}): Promise<SyncSummary> {
  const startTime = Date.now();
  const supabase = getServiceClient();
  
  const maxAge = options?.maxAge || 72; // 72 שעות
  const limit = options?.limit || 50;

  console.log(`[SYNC-SERVICE] Starting sync of pending payments (max age: ${maxAge}h, limit: ${limit})`);

  // יצירת רשומת sync log
  const { data: syncLog, error: logError } = await supabase
    .from('sync_logs')
    .insert({
      sync_type: 'status_check',
      source: 'system',
      status: 'running'
    })
    .select('id')
    .single();

  if (logError || !syncLog) {
    throw new Error(`Failed to create sync log: ${logError?.message}`);
  }

  const syncLogId = syncLog.id;

  try {
    // מציאת תשלומים pending
    const cutoffTime = new Date(Date.now() - maxAge * 60 * 60 * 1000).toISOString();

    const { data: pendingPayments, error: fetchError } = await supabase
      .from('payments')
      .select('id, status, metadata, user_id, amount, created_at')
      .eq('status', 'pending')
      .gt('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch pending payments: ${fetchError.message}`);
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('[SYNC-SERVICE] No pending payments to sync');
      
      const duration = Date.now() - startTime;
      
      await supabase
        .from('sync_logs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          total_checked: 0,
          total_updated: 0,
          total_failed: 0,
          total_skipped: 0
        })
        .eq('id', syncLogId);

      return {
        sync_log_id: syncLogId,
        total_checked: 0,
        total_updated: 0,
        total_failed: 0,
        total_skipped: 0,
        duration_ms: duration,
        results: []
      };
    }

    console.log(`[SYNC-SERVICE] Found ${pendingPayments.length} pending payments`);

    const results: SyncResult[] = [];
    let updated = 0;
    let failed = 0;
    let skipped = 0;

    // בדיקת כל תשלום
    for (const payment of pendingPayments) {
      const transactionUid = payment.metadata?.payplus_transaction_uid;

      if (!transactionUid) {
        console.log(`[SYNC-SERVICE] Skipping payment ${payment.id} - no transaction_uid`);
        skipped++;
        results.push({
          payment_id: payment.id,
          old_status: payment.status,
          new_status: payment.status,
          action: 'skipped',
          error: 'No transaction_uid'
        });
        continue;
      }

      try {
        // בדיקת סטטוס ב-PayPlus
        console.log(`[SYNC-SERVICE] Checking payment ${payment.id} with transaction_uid: ${transactionUid}`);
        
        const response = await checkTransactionStatus(transactionUid);

        if (!response?.results) {
          failed++;
          results.push({
            payment_id: payment.id,
            old_status: payment.status,
            new_status: payment.status,
            action: 'failed',
            error: 'Invalid PayPlus response'
          });
          continue;
        }

        const isSuccess = response.results.status === 'success' || response.results.code === 0;
        const newStatus = isSuccess ? 'completed' : 'failed';

        if (newStatus !== payment.status) {
          console.log(`[SYNC-SERVICE] Updating payment ${payment.id} from ${payment.status} to ${newStatus}`);

          // עדכון התשלום
          await supabase
            .from('payments')
            .update({
              status: newStatus,
              completed_at: isSuccess ? new Date().toISOString() : null,
              metadata: {
                ...payment.metadata,
                payplus_status_checked: true,
                payplus_status_checked_at: new Date().toISOString(),
                payplus_response: response.results
              }
            })
            .eq('id', payment.id);

          // יצירת registration/pass אם צריך
          if (isSuccess) {
            if (payment.metadata?.event_id) {
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
            } else if (payment.metadata?.card_type_id) {
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
          }

          updated++;
          results.push({
            payment_id: payment.id,
            old_status: payment.status,
            new_status: newStatus,
            action: 'updated'
          });
        } else {
          skipped++;
          results.push({
            payment_id: payment.id,
            old_status: payment.status,
            new_status: payment.status,
            action: 'skipped',
            error: 'Status unchanged'
          });
        }

      } catch (error: any) {
        console.error(`[SYNC-SERVICE] Error checking payment ${payment.id}:`, error);
        failed++;
        results.push({
          payment_id: payment.id,
          old_status: payment.status,
          new_status: payment.status,
          action: 'failed',
          error: error.message
        });
      }
    }

    const duration = Date.now() - startTime;

    // עדכון sync log
    await supabase
      .from('sync_logs')
      .update({
        status: failed === 0 ? 'completed' : 'partial',
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        total_checked: pendingPayments.length,
        total_updated: updated,
        total_failed: failed,
        total_skipped: skipped,
        details: { results }
      })
      .eq('id', syncLogId);

    // יצירת alert אם יש כשלונות רבים
    if (failed > 0 && failed / pendingPayments.length > 0.3) {
      await supabase
        .from('alerts')
        .insert({
          alert_type: 'sync_failed',
          severity: 'warning',
          title: 'High Failure Rate in Payment Sync',
          message: `${failed} out of ${pendingPayments.length} payments failed to sync`,
          details: {
            sync_log_id: syncLogId,
            failure_rate: (failed / pendingPayments.length * 100).toFixed(1) + '%'
          },
          sync_log_id: syncLogId
        });
    }

    console.log(`[SYNC-SERVICE] Sync completed in ${duration}ms: ${updated} updated, ${failed} failed, ${skipped} skipped`);

    return {
      sync_log_id: syncLogId,
      total_checked: pendingPayments.length,
      total_updated: updated,
      total_failed: failed,
      total_skipped: skipped,
      duration_ms: duration,
      results
    };

  } catch (error: any) {
    // סימון sync log בתור failed
    await supabase
      .from('sync_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
        duration_ms: Date.now() - startTime
      })
      .eq('id', syncLogId);

    throw error;
  }
}

/**
 * בדיקה האם יש תשלומים תקועים שצריכים תשומת לב
 */
export async function detectStuckPayments(): Promise<{
  stuck_count: number;
  payments: any[];
}> {
  const supabase = getServiceClient();
  
  // תשלומים שתקועים pending מעל 24 שעות
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: stuckPayments, error } = await supabase
    .from('payments')
    .select(`
      id,
      amount,
      status,
      created_at,
      metadata,
      users:user_id (full_name, email, phone)
    `)
    .eq('status', 'pending')
    .lt('created_at', twentyFourHoursAgo)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to detect stuck payments: ${error.message}`);
  }

  if (stuckPayments && stuckPayments.length > 0) {
    // יצירת alert
    await supabase
      .from('alerts')
      .insert({
        alert_type: 'payment_stuck',
        severity: 'warning',
        title: 'Stuck Payments Detected',
        message: `${stuckPayments.length} payments have been pending for over 24 hours`,
        details: {
          stuck_count: stuckPayments.length,
          oldest_payment_id: stuckPayments[0]?.id,
          oldest_payment_age_hours: Math.round((Date.now() - new Date(stuckPayments[0]?.created_at).getTime()) / (60 * 60 * 1000))
        }
      });
  }

  return {
    stuck_count: stuckPayments?.length || 0,
    payments: stuckPayments || []
  };
}
