import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  reconcileWithPayPlusReport, 
  generateReconciliationReport 
} from '@/lib/payplus-reconciliation';

/**
 * API להתאמת דוחות PayPlus CSV עם המערכת
 * POST /api/admin/payplus/reconcile-csv
 * 
 * Body: { csvContent: string, autoFix: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // אימות אדמין
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { csvContent, autoFix = false } = body;

    if (!csvContent) {
      return NextResponse.json({ error: 'CSV content is required' }, { status: 400 });
    }

    console.log(`🔍 Starting PayPlus CSV reconciliation (autoFix: ${autoFix})...`);

    // הרצת reconciliation
    const result = await reconcileWithPayPlusReport(csvContent, autoFix);

    // יצירת דוח
    const report = generateReconciliationReport(result);
    console.log(report);

    return NextResponse.json({
      success: result.success,
      result,
      report,
      summary: {
        totalInReport: result.totalInReport,
        matched: result.matchedInSystem,
        missing: result.missingInSystem.length,
        extra: result.extraInSystem.length,
        mismatches: result.statusMismatches.length,
        fixed: result.fixed,
        errors: result.errors.length
      }
    });

  } catch (error) {
    console.error('❌ Error in CSV reconciliation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
