import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // קבלת המשתמש הנוכחי
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // שימוש ב-service client
    const supabase = getServiceClient();

    // בדיקת הרשאות אדמין
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // פרמטרי חיפוש
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status'); // completed, pending, failed, refunded
    const search = searchParams.get('search'); // חיפוש לפי שם/אימייל
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const minAmount = searchParams.get('min_amount');
    const maxAmount = searchParams.get('max_amount');
    const itemType = searchParams.get('item_type'); // show, pass, other

    console.log('📊 Fetching payments with filters:', {
      status,
      search,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      itemType
    });

    // בניית query
    let query = supabase
      .from('payments')
      .select(`
        *,
        user:users!payments_user_id_fkey(id, full_name, email, phone),
        refunds(id, refund_amount, status, created_at, reason)
      `)
      .order('created_at', { ascending: false });

    // פילטרים
    if (status) query = query.eq('status', status);
    if (fromDate) query = query.gte('created_at', fromDate);
    if (toDate) query = query.lte('created_at', toDate);
    if (minAmount) query = query.gte('amount', parseFloat(minAmount));
    if (maxAmount) query = query.lte('amount', parseFloat(maxAmount));
    if (itemType) query = query.eq('item_type', itemType);

    const { data: payments, error } = await query;

    if (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }

    // חיפוש טקסט (client-side כי לא יעיל ב-DB)
    let filtered = payments || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.user?.full_name?.toLowerCase().includes(searchLower) ||
        p.user?.email?.toLowerCase().includes(searchLower) ||
        p.user?.phone?.includes(search) ||
        p.id?.toLowerCase().includes(searchLower)
      );
    }

    console.log(`✅ Found ${filtered.length} payments`);

    return NextResponse.json({ 
      payments: filtered,
      count: filtered.length
    });

  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    return NextResponse.json({
      error: 'Failed to fetch payments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
