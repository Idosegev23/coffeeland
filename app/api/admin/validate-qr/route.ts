import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 })
    }

    // Verify admin
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('is_active')
      .eq('user_id', authUser.id)
      .maybeSingle()

    if (!adminData?.is_active) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    // Find user by QR code
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email, qr_code')
      .eq('qr_code', qrCode)
      .maybeSingle()

    if (userError || !user) {
      return NextResponse.json({ error: 'משתמש לא נמצא' }, { status: 404 })
    }

    // Get active passes
    const { data: passes } = await supabase
      .from('passes')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('remaining_entries', 0)
      .order('purchase_date', { ascending: false })

    // Get loyalty card
    const { data: loyaltyCard } = await supabase
      .from('loyalty_cards')
      .select('id, total_stamps, redeemed_coffees')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      user,
      passes: passes || [],
      loyaltyCard,
    })
  } catch (error: any) {
    console.error('Validate QR error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

