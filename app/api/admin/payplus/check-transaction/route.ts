import { NextRequest, NextResponse } from 'next/server';
import { checkTransactionStatus } from '@/lib/payplus';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * API לבדיקת סטטוס עסקה ב-PayPlus
 * GET /api/admin/payplus/check-transaction?uid=XXX
 */
export async function GET(request: NextRequest) {
  try {
    const service = getServiceClient();
    
    // 1) בדיקת הרשאות אדמין
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await service.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // בדיקה שהמשתמש הוא אדמין
    const { data: admin } = await service
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 2) קבלת מזהה העסקה
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    const searchType = searchParams.get('type') || 'transaction'; // transaction או page_request

    if (!uid) {
      return NextResponse.json({ 
        error: 'Missing uid parameter',
        usage: 'GET /api/admin/payplus/check-transaction?uid=XXX&type=transaction'
      }, { status: 400 });
    }

    // 3) חיפוש במסד הנתונים תחילה
    let dbPayment = null;
    
    if (searchType === 'transaction') {
      // חיפוש לפי transaction_uid (אם יש)
      const { data } = await service
        .from('payments')
        .select(`
          *,
          users:user_id (full_name, email, phone),
          registrations (id, status, ticket_type)
        `)
        .eq('metadata->>payplus_transaction_uid', uid)
        .single();
      dbPayment = data;
    } else {
      // חיפוש לפי page_request_uid
      const { data } = await service
        .from('payments')
        .select(`
          *,
          users:user_id (full_name, email, phone),
          registrations (id, status, ticket_type)
        `)
        .eq('metadata->>payplus_page_request_uid', uid)
        .single();
      dbPayment = data;
    }

    // 4) בדיקה ב-PayPlus API
    let payplusData = null;
    let payplusError = null;

    if (searchType === 'transaction') {
      try {
        payplusData = await checkTransactionStatus(uid);
      } catch (error: any) {
        payplusError = error.message;
      }
    }

    // 5) החזרת התוצאות
    return NextResponse.json({
      success: true,
      search: {
        uid,
        type: searchType
      },
      database: dbPayment ? {
        found: true,
        payment_id: dbPayment.id,
        amount: dbPayment.amount,
        status: dbPayment.status,
        created_at: dbPayment.created_at,
        user: dbPayment.users,
        registrations: dbPayment.registrations,
        metadata: dbPayment.metadata
      } : {
        found: false,
        message: 'No payment found in database with this identifier'
      },
      payplus: payplusData ? {
        found: true,
        data: payplusData
      } : {
        found: false,
        error: payplusError || 'Could not check PayPlus (only works with transaction_uid)'
      }
    });

  } catch (error: any) {
    console.error('❌ Check transaction error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}
