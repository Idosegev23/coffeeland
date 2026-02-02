import { NextRequest, NextResponse } from 'next/server';
import { syncPendingPayments, detectStuckPayments } from '@/lib/payplus-sync-service';

/**
 * PayPlus Sync API
 * POST /api/admin/payplus/sync
 * 
 * מאפשר לאדמין לבצע סנכרון ידני של תשלומים מול PayPlus
 */
export async function POST(req: NextRequest) {
  try {
    const { action, maxAge, limit } = await req.json();

    console.log(`[ADMIN-SYNC] Starting ${action} sync`);

    switch (action) {
      case 'sync_pending':
        // סנכרון תשלומים pending
        const syncResult = await syncPendingPayments({ maxAge, limit });
        return NextResponse.json({
          success: true,
          action: 'sync_pending',
          result: syncResult
        });

      case 'detect_stuck':
        // זיהוי תשלומים תקועים
        const stuckResult = await detectStuckPayments();
        return NextResponse.json({
          success: true,
          action: 'detect_stuck',
          result: stuckResult
        });

      default:
        return NextResponse.json({
          error: 'Invalid action',
          valid_actions: ['sync_pending', 'detect_stuck']
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[ADMIN-SYNC] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * GET - קבלת סטטיסטיקות sync
 */
export async function GET(req: NextRequest) {
  try {
    const { getServiceClient } = await import('@/lib/supabase');
    const supabase = getServiceClient();

    // קבלת סיכום של sync logs אחרונים
    const { data: recentSyncs, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    // ספירת תשלומים pending
    const { count: pendingCount } = await supabase
      .from('payments')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    // ספירת alerts פעילים
    const { count: activeAlertsCount } = await supabase
      .from('alerts')
      .select('id', { count: 'exact' })
      .eq('status', 'active');

    return NextResponse.json({
      success: true,
      stats: {
        pending_payments: pendingCount || 0,
        active_alerts: activeAlertsCount || 0,
        recent_syncs: recentSyncs || []
      }
    });

  } catch (error: any) {
    console.error('[ADMIN-SYNC] Error getting stats:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
