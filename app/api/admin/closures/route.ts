import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function requireAdmin(req: NextRequest) {
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };

  const supabase = getServiceClient();
  const { data: admin } = await supabase
    .from('admins')
    .select('id, is_active, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin?.is_active || admin.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) };
  }

  return { supabase, admin };
}

// GET /api/admin/closures?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceClient();
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: admin } = await supabase
      .from('admins')
      .select('id, is_active, role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!admin?.is_active) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const from = req.nextUrl.searchParams.get('from');
    const to = req.nextUrl.searchParams.get('to');

    let query = supabase
      .from('venue_closures')
      .select('*')
      .order('closure_date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: true });

    if (from) query = query.gte('closure_date', from);
    if (to) query = query.lte('closure_date', to);

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching closures:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ closures: data || [] });
  } catch (e: any) {
    console.error('GET /closures error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/closures
// body: { closure_date, is_full_day, start_time?, end_time?, reason?, holiday_name?, hebcal_category? }
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const { supabase, admin } = auth;

    const body = await req.json();
    const {
      closure_date,
      is_full_day,
      start_time,
      end_time,
      reason,
      holiday_name,
      hebcal_category,
    } = body;

    if (!closure_date) {
      return NextResponse.json({ error: 'closure_date is required' }, { status: 400 });
    }

    const fullDay = is_full_day !== false;

    if (!fullDay) {
      if (!start_time || !end_time) {
        return NextResponse.json(
          { error: 'start_time and end_time are required when is_full_day is false' },
          { status: 400 }
        );
      }
      if (start_time >= end_time) {
        return NextResponse.json({ error: 'end_time must be after start_time' }, { status: 400 });
      }
    }

    const insertData = {
      closure_date,
      is_full_day: fullDay,
      start_time: fullDay ? null : start_time,
      end_time: fullDay ? null : end_time,
      reason: reason || null,
      holiday_name: holiday_name || null,
      hebcal_category: hebcal_category || null,
      created_by_admin: admin.id,
    };

    const { data, error } = await supabase
      .from('venue_closures')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating closure:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ closure: data });
  } catch (e: any) {
    console.error('POST /closures error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/closures?id=...
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if ('error' in auth) return auth.error;
    const { supabase } = auth;

    const id = req.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { error } = await supabase.from('venue_closures').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('DELETE /closures error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
