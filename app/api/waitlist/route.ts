/**
 * API: Waitlist
 * רשימת המתנה להצגות שנמכרו
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST - הצטרפות לרשימת המתנה
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_id } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    const service = getServiceClient();

    // Check event exists and is a show
    const { data: event, error: eventError } = await service
      .from('events')
      .select('id, title, type, status')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'אירוע לא נמצא' }, { status: 404 });
    }

    // Check if user is already on waitlist
    const { data: existing } = await service
      .from('waitlist')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'כבר נרשמת לרשימת ההמתנה' }, { status: 409 });
    }

    // Insert into waitlist
    const { data: entry, error: insertError } = await service
      .from('waitlist')
      .insert({
        event_id,
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email,
        status: 'waiting',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Waitlist insert error:', insertError);
      return NextResponse.json({ error: 'שגיאה בהרשמה לרשימת המתנה' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry });
  } catch (err) {
    console.error('Waitlist POST error:', err);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}

// GET - קבלת רשימת המתנה לאירוע (אדמין בלבד)
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    const { data: admin } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!admin?.is_active) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const event_id = request.nextUrl.searchParams.get('event_id');
    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
    }

    const service = getServiceClient();

    const { data: entries, error } = await service
      .from('waitlist')
      .select('*')
      .eq('event_id', event_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Waitlist GET error:', error);
      return NextResponse.json({ error: 'שגיאה בטעינת רשימת המתנה' }, { status: 500 });
    }

    return NextResponse.json({ entries: entries || [] });
  } catch (err) {
    console.error('Waitlist GET error:', err);
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}
