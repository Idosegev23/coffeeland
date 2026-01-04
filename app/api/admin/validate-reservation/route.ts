/**
 * API: Admin - Validate Reservation QR
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const getServiceClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 })
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: adminData } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('user_id', authUser.id)
      .maybeSingle()

    if (!adminData?.is_active) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    const service = getServiceClient()

    const { data: reservation, error } = await service
      .from('event_reservations')
      .select(
        `
        id,
        event_id,
        user_id,
        seats,
        status,
        qr_code,
        reserved_at,
        checked_in_at,
        payment_id,
        user:users(full_name, phone, email),
        event:events(title, type, start_at, end_at, price, capacity)
      `
      )
      .eq('qr_code', qrCode)
      .single()

    if (error || !reservation) {
      return NextResponse.json({ error: 'שריון לא נמצא' }, { status: 404 })
    }

    return NextResponse.json({ reservation })
  } catch (error: any) {
    console.error('Validate reservation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}




