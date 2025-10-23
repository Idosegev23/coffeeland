/**
 * API: Event Registrations
 * רישום לחוגים וסדנאות
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST - רישום חדש לאירוע
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_id, child_id, notes } = body;

    // בדיקה שהאירוע קיים ופעיל
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .eq('status', 'active')
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or inactive' }, { status: 404 });
    }

    // בדיקת קיבולת
    if (event.capacity) {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event_id)
        .in('status', ['pending', 'confirmed', 'attended']);

      if (count && count >= event.capacity) {
        return NextResponse.json({ error: 'Event is full' }, { status: 400 });
      }
    }

    // בדיקה שלא נרשם כבר
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user.id)
      .eq('child_id', child_id || null)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already registered' }, { status: 400 });
    }

    // יצירת רישום
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        event_id,
        user_id: user.id,
        child_id: child_id || null,
        status: 'pending', // יעבור ל-confirmed אחרי תשלום
        is_paid: false,
        notes
      })
      .select(`
        *,
        event:events(*),
        child:children(*)
      `)
      .single();

    if (regError) throw regError;

    return NextResponse.json({
      registration,
      message: 'Registration created. Proceed to payment.'
    });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration', details: error.message },
      { status: 500 }
    );
  }
}

// GET - קבלת ההרשמות של המשתמש
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        *,
        event:events(
          id,
          title,
          description,
          type,
          start_at,
          end_at,
          instructor:instructors(name),
          room:rooms(name, location)
        ),
        child:children(id, name, age),
        payment:payments(id, amount, status)
      `)
      .eq('user_id', user.id)
      .order('registered_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ registrations });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch registrations', details: error.message },
      { status: 500 }
    );
  }
}

