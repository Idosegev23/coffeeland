import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { syncPendingPayments, detectStuckPayments } from '@/lib/payplus-sync-service';

/**
 * Cron Job - תיקון אוטומטי של תשלומים תקועים (Enhanced)
 * GET /api/cron/fix-pending-payments
 * 
 * רץ כל 15 דקות ומתקן תשלומים שנשארו pending
 * הוסף ב-Vercel Cron: 0,15,30,45 * * * *
 * 
 * עכשיו עם:
 * - Logging מפורט ל-sync_logs
 * - זיהוי תשלומים תקועים
 * - יצירת alerts אוטומטית
 */
export async function GET(req: Request) {
  const startTime = Date.now();
  const supabase = getServiceClient();

  try {
    // בדיקת authorization (רק Vercel Cron יכול לקרוא)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] ============================================');
    console.log('[CRON] Starting enhanced pending payments fix');
    console.log('[CRON] ============================================');
    
    // שלב 1: סנכרון תשלומים pending עם PayPlus
    console.log('[CRON] Step 1: Syncing pending payments with PayPlus...');
    
    const syncResult = await syncPendingPayments({
      maxAge: 72, // 72 שעות
      limit: 100   // עד 100 תשלומים בכל run
    });

    console.log(`[CRON] Sync completed: ${syncResult.total_updated} updated, ${syncResult.total_failed} failed`);

    // שלב 2: זיהוי תשלומים תקועים
    console.log('[CRON] Step 2: Detecting stuck payments...');
    
    const stuckResult = await detectStuckPayments();

    console.log(`[CRON] Found ${stuckResult.stuck_count} stuck payments`);

    // שלב 3: סיכום
    const duration = Date.now() - startTime;

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      sync: {
        total_checked: syncResult.total_checked,
        updated: syncResult.total_updated,
        failed: syncResult.total_failed,
        skipped: syncResult.total_skipped,
        sync_log_id: syncResult.sync_log_id
      },
      stuck_payments: {
        count: stuckResult.stuck_count,
        payments: stuckResult.payments.map(p => ({
          id: p.id,
          amount: p.amount,
          created_at: p.created_at,
          user: p.users
        }))
      }
    };

    console.log('[CRON] ============================================');
    console.log('[CRON] Cron job completed successfully');
    console.log(`[CRON] Duration: ${duration}ms`);
    console.log(`[CRON] Updated: ${syncResult.total_updated} payments`);
    console.log(`[CRON] Stuck: ${stuckResult.stuck_count} payments`);
    console.log('[CRON] ============================================');

    // יצירת alert אם יש הרבה כשלונות
    if (syncResult.total_failed > 0 && syncResult.total_failed / syncResult.total_checked > 0.3) {
      await supabase
        .from('alerts')
        .insert({
          alert_type: 'sync_failed',
          severity: 'error',
          title: 'Cron Job: High Failure Rate',
          message: `${syncResult.total_failed} out of ${syncResult.total_checked} payments failed to sync in cron job`,
          details: {
            sync_log_id: syncResult.sync_log_id,
            failure_rate: (syncResult.total_failed / syncResult.total_checked * 100).toFixed(1) + '%'
          },
          sync_log_id: syncResult.sync_log_id
        });
    }

    return NextResponse.json(summary);
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error('[CRON] ============================================');
    console.error('[CRON] Fatal error:', error);
    console.error(`[CRON] Duration before error: ${duration}ms`);
    console.error('[CRON] ============================================');

    // יצירת alert קריטי
    try {
      await supabase
        .from('alerts')
        .insert({
          alert_type: 'sync_failed',
          severity: 'critical',
          title: 'Cron Job Failed',
          message: `Cron job failed with error: ${error.message}`,
          details: {
            error: error.message,
            stack: error.stack,
            duration_ms: duration
          }
        });
    } catch (alertError) {
      console.error('[CRON] Failed to create alert:', alertError);
    }

    return NextResponse.json({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      duration_ms: duration
    }, { status: 500 });
  }
}

// מאפשר גם POST (לבדיקות ידניות)
export async function POST(req: Request) {
  return GET(req);
}
