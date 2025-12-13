/**
 * API: Admin - Check-in Reservation + POS payment
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

function toPaymentType(method: 'cash' | 'credit' | 'bit' | 'other') {
  if (method === 'cash') return 'pos_cash'
  if (method === 'credit') return 'pos_credit'
  if (method === 'bit') return 'pos_bit'
  return 'pos_other'
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const qrCode = body?.qrCode as string | undefined
    const payment_method = (body?.payment_method || 'cash') as
      | 'cash'
      | 'credit'
      | 'bit'
      | 'other'

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code is required' }, { status: 400 })
    }

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: admin } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('user_id', authUser.id)
      .maybeSingle()

    if (!admin?.is_active) return NextResponse.json({ error: 'Not an admin' }, { status: 403 })

    const service = getServiceClient()

    const { data: reservation, error: resErr } = await service
      .from('event_reservations')
      .select('id, event_id, user_id, seats, status, payment_id')
      .eq('qr_code', qrCode)
      .single()

    if (resErr || !reservation) {
      return NextResponse.json({ error: 'שריון לא נמצא' }, { status: 404 })
    }

    if (reservation.status === 'cancelled') {
      return NextResponse.json({ error: 'שריון בוטל' }, { status: 400 })
    }

    if (reservation.status === 'checked_in') {
      return NextResponse.json({ error: 'השריון כבר אושר' }, { status: 400 })
    }

    const { data: event, error: eventErr } = await service
      .from('events')
      .select('id, title, start_at, end_at, price')
      .eq('id', reservation.event_id)
      .single()

    if (eventErr || !event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Create POS payment (if price exists)
    const amount = (event.price || 0) * (reservation.seats || 1)
    let payment: any = null

    if (amount > 0) {
      const paymentInsert = {
        user_id: reservation.user_id,
        amount,
        currency: 'ILS',
        payment_type: toPaymentType(payment_method),
        payment_method,
        item_type: 'event_reservation',
        item_id: reservation.id,
        status: 'completed',
        processed_by_admin: admin.id,
        completed_at: new Date().toISOString(),
        notes: `תשלום POS עבור שריון: ${event.title}`,
        metadata: {
          created_via: 'pos',
          seats: reservation.seats,
          event_id: reservation.event_id,
        },
      }

      const { data: pay, error: payErr } = await service
        .from('payments')
        .insert(paymentInsert)
        .select()
        .single()

      if (payErr) throw payErr
      payment = pay
    }

    // Update reservation to checked_in
    const { data: updated, error: updErr } = await service
      .from('event_reservations')
      .update({
        status: 'checked_in',
        checked_in_at: new Date().toISOString(),
        checked_in_by_admin: admin.id,
        payment_id: payment?.id || null,
      })
      .eq('id', reservation.id)
      .select()
      .single()

    if (updErr) throw updErr

    await service.from('audit_log').insert({
      admin_id: admin.id,
      user_id: reservation.user_id,
      action: 'checkin_reservation',
      entity_type: 'event_reservation',
      entity_id: reservation.id,
      details: { qrCode, payment_method, amount },
    })

    return NextResponse.json({ success: true, reservation: updated, payment })
  } catch (error: any) {
    console.error('Check-in reservation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


