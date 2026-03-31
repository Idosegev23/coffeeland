import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { qrCode } = await request.json()

    logger.info('🔍 Validate QR - Start:', { qrCode })

    if (!qrCode) {
      logger.info('❌ No QR code provided')
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 })
    }

    // Verify admin
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    logger.info('👤 Auth check:', {
      hasUser: !!authUser,
      userId: authUser?.id,
      userEmail: authUser?.email,
      error: authError?.message
    })

    if (!authUser || authError) {
      logger.info('❌ Unauthorized - no user found')
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

    logger.info('🔐 Admin check:', {
      hasAdmin: !!adminData,
      adminId: adminData?.id,
      isActive: adminData?.is_active,
      error: adminError?.message
    })

    if (!adminData?.is_active) {
      logger.info('❌ Not an admin or inactive')
      return NextResponse.json({ 
        error: 'Not an admin',
        details: `User ${authUser.id} is not an active admin`
      }, { status: 403 })
    }

    logger.info('✅ Admin verified:', adminData.id)

    // Try to find registration ticket first (TICKET-XXX format)
    if (qrCode.startsWith('TICKET-')) {
      logger.info('🎫 Detected ticket QR code, searching registrations...')
      
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          ticket_type,
          registered_at,
          qr_code,
          user:users!registrations_user_id_fkey(
            id,
            full_name,
            email,
            phone
          ),
          event:events(
            id,
            title,
            type,
            start_at,
            end_at,
            banner_image_url
          )
        `)
        .eq('qr_code', qrCode)
        .maybeSingle()

      if (registration) {
        logger.info('✅ Found registration:', registration.id)
        return NextResponse.json({
          type: 'ticket',
          registration: {
            ...registration,
            user: Array.isArray(registration.user) ? registration.user[0] : registration.user,
            event: Array.isArray(registration.event) ? registration.event[0] : registration.event
          }
        })
      }
      
      logger.info('⚠️ Ticket not found in registrations')
      return NextResponse.json({ error: 'כרטיס לא נמצא במערכת' }, { status: 404 })
    }

    // Find user by QR code (for regular user QR codes)
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
      type: 'user',
      user,
      passes: passes || [],
      loyaltyCard,
    })
  } catch (error: any) {
    logger.error('Validate QR error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

