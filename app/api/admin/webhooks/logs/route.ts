import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

/**
 * Admin API - Webhook Logs
 * GET /api/admin/webhooks/logs
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(req.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    let query = supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      logs: logs || []
    });

  } catch (error: any) {
    console.error('[ADMIN] Error fetching webhook logs:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
