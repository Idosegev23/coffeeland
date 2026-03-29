import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

function escapeCsvField(value: string): string {
  if (!value) return '';
  // If field contains comma, newline, or quote, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function buildCsv(headers: string[], rows: string[][]): string {
  const bom = '\ufeff';
  const headerLine = headers.map(escapeCsvField).join(',');
  const dataLines = rows.map(row => row.map(escapeCsvField).join(','));
  return bom + [headerLine, ...dataLines].join('\n');
}

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const supabaseAuth = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();

    // Admin check
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');

    let csvContent = '';
    let filename = 'export.csv';

    if (type === 'registrations') {
      const eventId = searchParams.get('event_id');
      if (!eventId) {
        return NextResponse.json({ error: 'event_id is required' }, { status: 400 });
      }

      const { data: registrations, error } = await supabase
        .from('registrations')
        .select(`
          id, ticket_type, is_paid, registered_at, status,
          user:users!registrations_user_id_fkey(full_name, email, phone),
          payment:payments!registrations_payment_id_fkey(amount, status)
        `)
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false });

      if (error) {
        console.error('Export registrations error:', error);
        return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
      }

      const headers = ['שם', 'אימייל', 'טלפון', 'סוג כרטיס', 'סכום', 'תאריך רישום'];
      const rows = (registrations || []).map((r: any) => [
        r.user?.full_name || '',
        r.user?.email || '',
        r.user?.phone || '',
        r.ticket_type === 'show_only' ? 'הצגה בלבד' : 'הצגה + גימבורי',
        r.payment?.amount ? `${r.payment.amount}` : '0',
        r.registered_at ? new Date(r.registered_at).toLocaleDateString('he-IL') : '',
      ]);

      csvContent = buildCsv(headers, rows);
      filename = `registrations_${eventId}.csv`;

    } else if (type === 'payments') {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          id, amount, status, payment_method, created_at,
          user:users!payments_user_id_fkey(full_name, email)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Export payments error:', error);
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
      }

      const headers = ['מזהה', 'שם לקוח', 'אימייל', 'סכום', 'סטטוס', 'אמצעי תשלום', 'תאריך'];
      const rows = (payments || []).map((p: any) => [
        p.id || '',
        p.user?.full_name || '',
        p.user?.email || '',
        p.amount ? `${p.amount}` : '0',
        p.status === 'completed' ? 'הושלם' : p.status,
        p.payment_method || 'כרטיס אשראי',
        p.created_at ? new Date(p.created_at).toLocaleDateString('he-IL') : '',
      ]);

      csvContent = buildCsv(headers, rows);
      filename = 'payments.csv';

    } else if (type === 'customers') {
      const { data: customers, error } = await supabase
        .from('users')
        .select('full_name, email, phone, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Export customers error:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
      }

      const headers = ['שם', 'אימייל', 'טלפון', 'תאריך הרשמה'];
      const rows = (customers || []).map((c: any) => [
        c.full_name || '',
        c.email || '',
        c.phone || '',
        c.created_at ? new Date(c.created_at).toLocaleDateString('he-IL') : '',
      ]);

      csvContent = buildCsv(headers, rows);
      filename = 'customers.csv';

    } else {
      return NextResponse.json({ error: 'Invalid type parameter. Use: registrations, payments, or customers' }, { status: 400 });
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({
      error: 'Failed to export data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
