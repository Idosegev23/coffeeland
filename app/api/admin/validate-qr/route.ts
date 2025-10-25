import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { qrCode } = await request.json()

    console.log('🔍 Validate QR - Start:', { qrCode })

    if (!qrCode) {
      console.log('❌ No QR code provided')
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 })
    }

    // Verify admin
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 Auth check:', {
      hasUser: !!authUser,
      userId: authUser?.id,
      userEmail: authUser?.email,
      error: authError?.message
    })

    if (!authUser || authError) {
      console.log('❌ Unauthorized - no user found')
      return NextResponse.json({ 
        error: 'Unauthorized - Please login', 
        details: authError?.message 
      }, { status: 401 })
    }

    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('user_id', authUser.id)
      .maybeSingle()

    console.log('🔐 Admin check:', {
      hasAdmin: !!adminData,
      adminId: adminData?.id,
      isActive: adminData?.is_active,
      error: adminError?.message
    })

    if (!adminData?.is_active) {
      console.log('❌ Not an admin or inactive')
      return NextResponse.json({ 
        error: 'Not an admin',
        details: `User ${authUser.id} is not an active admin`
      }, { status: 403 })
    }

    console.log('✅ Admin verified:', adminData.id)

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

