/**
 * API endpoint ליצירת משתמש אדמין אוטומטית
 * משמש להקמה ראשונית בלבד
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    // יצירת משתמש ב-Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0],
        }
      }
    });

    if (authError) {
      return NextResponse.json(
        { error: `Auth error: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // יצירת user ב-public.users
    const qrCode = nanoid(12);
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: email.split('@')[0],
        phone: '050-0000000',
        qr_code: qrCode
      });

    if (userError) {
      console.error('User insert error:', userError);
      // לא נכשל את כל התהליך - המשתמש כבר נוצר ב-Auth
    }

    // יצירת loyalty card
    const { error: loyaltyError } = await supabase
      .from('loyalty_cards')
      .insert({
        user_id: userId,
        total_stamps: 0,
        redeemed_coffees: 0
      });

    if (loyaltyError) {
      console.error('Loyalty card error:', loyaltyError);
    }

    // הוספה כאדמין
    const { error: adminError } = await supabase
      .from('admins')
      .insert({
        user_id: userId,
        is_active: true
      });

    if (adminError) {
      console.error('Admin insert error:', adminError);
      return NextResponse.json(
        { error: `Failed to set as admin: ${adminError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: userId,
        email,
        qr_code: qrCode
      }
    });

  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin user', details: error.message },
      { status: 500 }
    );
  }
}

