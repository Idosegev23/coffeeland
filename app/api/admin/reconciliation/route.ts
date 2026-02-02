import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentConsistency } from '@/lib/reconciliation-service';

/**
 * Reconciliation API
 * POST /api/admin/reconciliation
 * 
 * מריץ דוח התאמה בין PayPlus למסד הנתונים
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[ADMIN-RECONCILIATION] Starting reconciliation report...');

    const report = await checkPaymentConsistency();

    return NextResponse.json({
      success: true,
      report
    });

  } catch (error: any) {
    console.error('[ADMIN-RECONCILIATION] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * GET - קבלת דוחות אחרונים
 */
export async function GET(req: NextRequest) {
  try {
    const { getServiceClient } = await import('@/lib/supabase');
    const supabase = getServiceClient();

    const { data: reports, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('sync_type', 'reconciliation')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      reports: reports || []
    });

  } catch (error: any) {
    console.error('[ADMIN-RECONCILIATION] Error getting reports:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
