/**
 * API: Admin Reports
 * דוחות ואנליטיקס (אדמין בלבד) - רץ עם Service Role כדי לא להיתקע על RLS
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

function computeStartDate(range: 'week' | 'month' | 'year') {
  const now = new Date()
  const startDate = new Date(now)
  if (range === 'week') startDate.setDate(now.getDate() - 7)
  else if (range === 'month') startDate.setMonth(now.getMonth() - 1)
  else startDate.setFullYear(now.getFullYear() - 1)
  return startDate
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Auth + admin check
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: admin } = await supabase
      .from('admins')
      .select('id, is_active')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!admin?.is_active) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const service = getServiceClient()
    const { searchParams } = new URL(request.url)
    const dateRange = (searchParams.get('range') as 'week' | 'month' | 'year') || 'month'
    const now = new Date()
    const startDate = computeStartDate(dateRange)

    // 1) total customers
    const { count: totalCustomers } = await service
      .from('users')
      .select('*', { count: 'exact', head: true })

    // 2) revenue
    const { data: payments } = await service
      .from('payments')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
    const totalRevenue = payments?.reduce((sum, p: any) => sum + (p.amount || 0), 0) || 0

    // 3) active cards
    const { count: activeCards } = await service
      .from('passes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 4) stamps
    const { data: loyaltyCards } = await service
      .from('loyalty_cards')
      .select('total_stamps')
    const totalStamps =
      loyaltyCards?.reduce((sum, lc: any) => sum + (lc.total_stamps || 0), 0) || 0

    // 5) upcoming events
    const { count: upcomingEvents } = await service
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('start_at', now.toISOString())

    // 6) registrations in range
    const { count: totalRegistrations } = await service
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())

    // 7) recent sales
    const { data: recentSalesRaw } = await service
      .from('payments')
      .select(
        `
        id,
        amount,
        created_at,
        payment_type,
        payment_method,
        user:users(full_name)
      `
      )
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)

    const recentSales =
      (recentSalesRaw || []).map((sale: any) => ({
        id: sale.id,
        amount: sale.amount,
        created_at: sale.created_at,
        payment_method: sale.payment_method || sale.payment_type || '',
        customer_name: Array.isArray(sale.user) ? sale.user?.[0]?.full_name : sale.user?.full_name,
      })) || []

    // 8) popular cards (passes created in range)
    const { data: passesData } = await service
      .from('passes')
      .select('card_type:card_types(name)')
      .gte('created_at', startDate.toISOString())

    const counts: Record<string, number> = {}
    for (const p of passesData || []) {
      // card_type can be array or object depending on Supabase config
      const cardType = Array.isArray(p.card_type) ? p.card_type[0] : p.card_type
      const name = cardType?.name || 'לא ידוע'
      counts[name] = (counts[name] || 0) + 1
    }

    const popularCards = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 9) event stats (next 10 upcoming)
    const { data: events } = await service
      .from('events')
      .select('id, title, type, capacity, start_at')
      .eq('status', 'active')
      .gte('start_at', now.toISOString())
      .order('start_at', { ascending: true })
      .limit(10)

    const eventStats = []
    for (const ev of events || []) {
      const { count } = await service
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', ev.id)
        .neq('status', 'cancelled')

      eventStats.push({
        title: ev.title,
        type: ev.type,
        capacity: ev.capacity,
        start_at: ev.start_at,
        registrations_count: count || 0,
      })
    }

    return NextResponse.json({
      totalCustomers: totalCustomers || 0,
      totalRevenue,
      activeCards: activeCards || 0,
      totalStamps,
      upcomingEvents: upcomingEvents || 0,
      totalRegistrations: totalRegistrations || 0,
      recentSales,
      popularCards,
      eventStats,
    })
  } catch (error: any) {
    console.error('Error loading reports (admin):', error)
    return NextResponse.json(
      { error: 'Failed to load reports', details: error.message },
      { status: 500 }
    )
  }
}



