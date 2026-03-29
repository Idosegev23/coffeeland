import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

async function verifyAdmin() {
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return null;
  const supabase = getServiceClient();
  const { data: admin } = await supabase
    .from('admins').select('id').eq('user_id', user.id).eq('is_active', true).single();
  return admin;
}

/**
 * GET /api/admin/notifications - Get unread notifications
 */
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getServiceClient();
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
  const unreadOnly = req.nextUrl.searchParams.get('unread') !== 'false';

  let query = supabase
    .from('admin_notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ notifications: data || [], count: data?.length || 0 });
}

/**
 * PATCH /api/admin/notifications - Mark notifications as read
 */
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids, markAll } = await req.json();
  const supabase = getServiceClient();

  if (markAll) {
    await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
  } else if (ids?.length) {
    await supabase.from('admin_notifications').update({ is_read: true }).in('id', ids);
  }

  return NextResponse.json({ success: true });
}
