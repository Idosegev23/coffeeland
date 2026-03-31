import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  reconcileWithPayPlusAPI, 
  generateReconciliationReport 
} from '@/lib/payplus-reconciliation';

export const maxDuration = 60;

/**
 * API להתאמה אוטומטית עם PayPlus (ללא צורך ב-CSV)
 * POST /api/admin/payplus/reconcile-auto
 * 
 * Body: { daysBack?: number, autoFix: boolean }
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
    const { daysBack = 7, autoFix = false } = body;

    console.log(`🔍 Starting automatic PayPlus reconciliation (${daysBack} days back, autoFix: ${autoFix})...`);

    // הרצת reconciliation אוטומטי
    const result = await reconcileWithPayPlusAPI(daysBack, autoFix);

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
    console.error('❌ Error in automatic reconciliation:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
