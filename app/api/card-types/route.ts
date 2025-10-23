/**
 * API: Card Types Management
 * ניהול סוגי כרטיסיות
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - קבלת רשימת סוגי כרטיסיות
export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get('type'); // 'playground', 'workshop', 'event', 'family'
    const activeOnly = searchParams.get('active') !== 'false';

    let query = supabase
      .from('card_types')
      .select('*')
      .order('price', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ card_types: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch card types', details: error.message },
      { status: 500 }
    );
  }
}

// POST - יצירת סוג כרטיסייה חדש (אדמין בלבד)
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('🔍 POST /api/card-types - checking auth...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    console.log('👤 User check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message
    });
    
    if (!user) {
      console.log('❌ No user found - returning 401');
      return NextResponse.json({ error: 'Unauthorized - No user session' }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    console.log('🔐 Admin check:', {
      hasAdmin: !!admin,
      adminId: admin?.id,
      error: adminError?.message
    });

    if (!admin) {
      console.log('❌ User is not an admin - returning 403');
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    console.log('✅ Auth successful - proceeding with insert');

    const body = await request.json();

    const { data: cardType, error } = await supabase
      .from('card_types')
      .insert({
        name: body.name,
        description: body.description,
        type: body.type,
        entries_count: body.entries_count,
        validity_days: body.validity_days,
        validity_months: body.validity_months,
        price: body.price,
        sale_price: body.sale_price,
        is_active: body.is_active ?? true,
        is_family: body.is_family ?? false
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      admin_id: admin.id,
      action: 'create_card_type',
      entity_type: 'card_type',
      entity_id: cardType.id,
      details: { name: cardType.name, price: cardType.price }
    });

    return NextResponse.json({ card_type: cardType });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create card type', details: error.message },
      { status: 500 }
    );
  }
}

