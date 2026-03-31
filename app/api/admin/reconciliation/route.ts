import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';
import { checkPaymentConsistency } from '@/lib/reconciliation-service';

export const maxDuration = 30;

async function verifyAdmin() {
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
  if (userError || !user) {
    return null;
  }

  const supabase = getServiceClient();
  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  return admin;
}

/**
 * Reconciliation API
 * POST /api/admin/reconciliation
 *
 * מריץ דוח התאמה בין PayPlus למסד הנתונים
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
