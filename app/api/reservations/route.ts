/**
 * API: Reservations (Activities)
 * - POST: create reservation (until 30 minutes before start)
 * - GET: list my reservations
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

export const dynamic = 'force-dynamic'

const RESERVATION_CUTOFF_MINUTES = 30

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

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = getServiceClient()
    const { data, error } = await service
      .from('event_reservations')
      .select(
        `
        id,
        event_id,
        seats,
        status,
        qr_code,
        reserved_at,
        checked_in_at,
        payment_id,
        event:events(
          id,
          title,
          type,
          start_at,
          end_at,
          price,
          capacity
        )
      `
      )
      .eq('user_id', user.id)
      .order('reserved_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return NextResponse.json({ reservations: data || [] })
  } catch (error: any) {
    console.error('Reservations GET error:', error)
    return NextResponse.json({ reservations: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const event_id = body?.event_id as string | undefined
    const seats = Math.max(1, Math.min(parseInt(body?.seats || '1', 10) || 1, 10))

    if (!event_id) {
      return NextResponse.json({ error: 'event_id is required' }, { status: 400 })
    }

    const service = getServiceClient()

    const { data: event, error: eventError } = await service
      .from('events')
      .select('id, title, start_at, end_at, status, capacity, price, type')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'active') {
      return NextResponse.json({ error: 'Event is not active' }, { status: 400 })
    }

    const now = new Date()
    const startAt = new Date(event.start_at)
    if (startAt.getTime() <= now.getTime()) {
      return NextResponse.json({ error: 'Event already started' }, { status: 400 })
    }

    const cutoff = new Date(startAt.getTime() - RESERVATION_CUTOFF_MINUTES * 60 * 1000)
    if (now.getTime() > cutoff.getTime()) {
      return NextResponse.json(
        { error: `לא ניתן לשריין פחות מ-${RESERVATION_CUTOFF_MINUTES} דקות לפני תחילת הפעילות` },
        { status: 400 }
      )
    }

    // Capacity check
    if (event.capacity != null) {
      const { data: rows, error: resvErr } = await service
        .from('event_reservations')
        .select('seats, status')
        .eq('event_id', event_id)
        .in('status', ['reserved', 'checked_in'])

      if (resvErr) throw resvErr

      const reservedSeats = (rows || []).reduce((sum: number, r: any) => sum + (r.seats || 0), 0)
      const available = Math.max(0, event.capacity - reservedSeats)
      if (seats > available) {
        return NextResponse.json(
          { error: 'אין מספיק מקומות פנויים', details: { available } },
          { status: 400 }
        )
      }
    }

    const qr_code = `RSV-${nanoid(10)}`

    const { data: reservation, error } = await service
      .from('event_reservations')
      .insert({
        event_id,
        user_id: user.id,
        seats,
        status: 'reserved',
        qr_code,
      })
      .select(
        `
        id,
        event_id,
        seats,
        status,
        qr_code,
        reserved_at
      `
      )
      .single()

    if (error) throw error

    return NextResponse.json({
      reservation,
      message: 'Reservation created',
    })
  } catch (error: any) {
    console.error('Reservations POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create reservation', details: error.message },
      { status: 500 }
    )
  }
}



