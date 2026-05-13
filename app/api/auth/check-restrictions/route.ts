import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST /api/auth/check-restrictions
// body: { email }
// Returns { magic_link_allowed: boolean, reason?: string }
//
// מנהלי חנות (store_manager) חייבים להתחבר רק עם סיסמה — חוסם להם magic link.
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ magic_link_allowed: true });
    }

    const supabase = getServiceClient();
    const normalized = email.trim().toLowerCase();

    // Look up user by email
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .ilike('email', normalized)
      .maybeSingle();

    if (!userRow?.id) {
      return NextResponse.json({ magic_link_allowed: true });
    }

    const { data: adminRow } = await supabase
      .from('admins')
      .select('role, is_active')
      .eq('user_id', userRow.id)
      .maybeSingle();

    if (adminRow?.is_active && adminRow.role === 'store_manager') {
      return NextResponse.json({
        magic_link_allowed: false,
        reason: 'store_manager_password_only',
        message: 'התחברות עם סיסמה בלבד עבור משתמש זה',
      });
    }

    return NextResponse.json({ magic_link_allowed: true });
  } catch (e: any) {
    console.error('check-restrictions error:', e);
    // Don't leak — fail open with allowed=true
    return NextResponse.json({ magic_link_allowed: true });
  }
}
