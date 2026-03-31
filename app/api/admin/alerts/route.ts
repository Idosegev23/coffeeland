import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Admin API - Alerts
 * GET /api/admin/alerts
 */
export async function GET(req: NextRequest) {
  try {
    // בדיקת הרשאות אדמין
    const authClient = createRouteHandlerClient({ cookies });
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: admin } = await authClient
      .from('admins')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!admin?.is_active) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { searchParams } = new URL(req.url);
    
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'active';

    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || []
    });

  } catch (error: any) {
    console.error('[ADMIN] Error fetching alerts:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
