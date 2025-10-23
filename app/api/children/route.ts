/**
 * API: Children Management
 * ניהול ילדים של המשתמש
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - קבלת הילדים של המשתמש
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: children, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ children });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch children', details: error.message },
      { status: 500 }
    );
  }
}

// POST - הוספת ילד חדש
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const { data: child, error } = await supabase
      .from('children')
      .insert({
        parent_id: user.id,
        name: body.name,
        age: body.age,
        birth_date: body.birth_date,
        notes: body.notes
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ child });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create child', details: error.message },
      { status: 500 }
    );
  }
}

