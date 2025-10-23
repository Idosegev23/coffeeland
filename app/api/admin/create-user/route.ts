/**
 * API endpoint ליצירת משתמש חדש ע"י אדמין
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // בדיקת הרשאות אדמין
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('is_active', true)
      .single();

    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // קבלת הנתונים
    const body = await request.json();
    const { full_name, email, phone, password, is_admin } = body;

    if (!full_name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // יצירת משתמש ב-Auth
    const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // אישור אימייל אוטומטי
      user_metadata: {
        full_name
      }
    });

    if (authCreateError) {
      console.error('Auth creation error:', authCreateError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authCreateError.message}` },
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
    const qrCode = nanoid(12);

    // יצירת user ב-public.users
    const { error: userInsertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        full_name,
        phone,
        qr_code: qrCode
      });

    if (userInsertError) {
      console.error('User insert error:', userInsertError);
      // ננסה למחוק את המשתמש מ-Auth אם נכשל
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Failed to create user profile: ${userInsertError.message}` },
        { status: 500 }
      );
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

    // אם צריך להגדיר כאדמין
    if (is_admin) {
      const { error: adminInsertError } = await supabase
        .from('admins')
        .insert({
          user_id: userId,
          is_active: true
        });

      if (adminInsertError) {
        console.error('Admin insert error:', adminInsertError);
        return NextResponse.json(
          { error: `User created but failed to set as admin: ${adminInsertError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        full_name,
        phone,
        qr_code: qrCode,
        is_admin
      }
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}

