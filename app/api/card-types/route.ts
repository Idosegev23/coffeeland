/**
 * API: Card Types Management
 * ניהול סוגי כרטיסיות
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Service Role client for admin operations (bypasses RLS)
const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

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
      { error: 'Failed to fetch card types' },
      { status: 500 }
    );
  }
}

// POST - יצירת סוג כרטיסייה חדש (אדמין בלבד)
export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    logger.info('🔍 POST /api/card-types - checking auth...');
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    logger.info('👤 User check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message
    });
    
    if (!user) {
      logger.info('❌ No user found - returning 401');
      return NextResponse.json({ error: 'Unauthorized - No user session' }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    logger.info('🔐 Admin check:', {
      hasAdmin: !!admin,
      adminId: admin?.id,
      error: adminError?.message
    });

    if (!admin) {
      logger.info('❌ User is not an admin - returning 403');
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    logger.info('✅ Auth successful - proceeding with insert');

    const body = await request.json();
    
    logger.info('📦 Request body:', body);

    // Use service role client for insert (bypasses RLS)
    const serviceClient = getServiceClient();
    
    // Prepare insert data - only include fields that are provided
    const insertData: any = {
      name: body.name,
      description: body.description,
      type: body.type,
      entries_count: body.entries_count,
      price: body.price,
      is_active: body.is_active ?? true,
    };
    
    // Add optional fields only if provided
    if (body.sale_price !== null && body.sale_price !== undefined) {
      insertData.sale_price = body.sale_price;
    }
    if (body.validity_days !== null && body.validity_days !== undefined) {
      insertData.validity_days = body.validity_days;
    }
    if (body.validity_months !== null && body.validity_months !== undefined) {
      insertData.validity_months = body.validity_months;
    }
    if (body.is_family !== null && body.is_family !== undefined) {
      insertData.is_family = body.is_family;
    }
    
    logger.info('💾 Insert data:', insertData);
    
    const { data: cardType, error } = await serviceClient
      .from('card_types')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      logger.error('❌ Insert error:', error);
      throw error;
    }

    logger.info('✅ Card type created:', cardType.id);

    // Audit log
    await serviceClient.from('audit_log').insert({
      admin_id: admin.id,
      action: 'create_card_type',
      entity_type: 'card_type',
      entity_id: cardType.id,
      details: { name: cardType.name, price: cardType.price }
    });

    return NextResponse.json({ card_type: cardType });
  } catch (error: any) {
    logger.error('❌ Fatal error:', error);
    return NextResponse.json(
      { error: 'Failed to create card type' },
      { status: 500 }
    );
  }
}

