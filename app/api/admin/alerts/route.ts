import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * Admin API - Alerts
 * GET /api/admin/alerts
 */
export async function GET(req: NextRequest) {
  try {
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
