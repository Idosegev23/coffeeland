/**
 * API: Public Events
 * מחזיר אירועים לצפייה ציבורית + registrations_count (ללא מידע אישי)
 * עובד עם Service Role כדי להוציא ספירה בלי לחשוף פרטי משתמשים.
 */

import { createClient } from '@supabase/supabase-js'
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

export async function GET(request: Request) {
  try {
    const service = getServiceClient()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get('type')
    const status = searchParams.get('status') || 'active'
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 100)
    const featured = searchParams.get('is_featured')

    let query = service
      .from('events')
      .select('id, title, description, type, start_at, end_at, capacity, price, is_recurring, recurrence_pattern, status, is_featured, cancellation_deadline_hours, banner_image_url, price_show_only, price_show_and_playground')
      .eq('status', status)
      .order('start_at', { ascending: true })
      .limit(limit)

    if (type) query = query.eq('type', type)
    if (from) query = query.gte('start_at', from)
    if (to) query = query.lte('start_at', to)
    if (featured === 'true') query = query.eq('is_featured', true)

    const { data: events, error } = await query
    if (error) throw error

    const enriched = []
    for (const ev of events || []) {
      const { count } = await service
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', ev.id)
        .neq('status', 'cancelled')

      // seats reserved via reservations (activities)
      let reserved_seats_count = 0
      try {
        const { data: resvRows } = await service
          .from('event_reservations')
          .select('seats')
          .eq('event_id', ev.id)
          .in('status', ['reserved', 'checked_in'])
        reserved_seats_count = (resvRows || []).reduce((sum: number, r: any) => sum + (r.seats || 0), 0)
      } catch {
        reserved_seats_count = 0
      }

      enriched.push({
        ...ev,
        registrations_count: count || 0,
        reserved_seats_count,
      })
    }

    return NextResponse.json({ events: enriched })
  } catch (error: any) {
    console.error('Public events error:', error)
    return NextResponse.json({ events: [] }, { status: 200 })
  }
}



