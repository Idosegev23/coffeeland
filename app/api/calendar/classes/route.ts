import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const revalidate = 300 // Revalidate every 5 minutes
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // שליפת אירועים מסוג class או workshop שפעילים
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        type,
        start_at,
        end_at,
        capacity,
        is_recurring,
        recurrence_pattern,
        series_id,
        series_order,
        instructor:instructors(name),
        room:rooms(name),
        registrations(count)
      `)
      .in('type', ['class', 'workshop'])
      .eq('status', 'active')
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(100)

    if (error) throw error

    // קיבוץ לפי סדרה: אם לאירוע יש series_id, מציגים כרטיס סדרה אחד
    const seriesMap = new Map<string, any[]>()
    const standaloneEvents: any[] = []

    for (const event of (events || [])) {
      if ((event as any).series_id) {
        const sid = (event as any).series_id
        if (!seriesMap.has(sid)) seriesMap.set(sid, [])
        seriesMap.get(sid)!.push(event)
      } else {
        standaloneEvents.push(event)
      }
    }

    const formattedEvents: any[] = []

    // אירועים עצמאיים (ללא סדרה)
    for (const event of standaloneEvents) {
      const startDate = new Date(event.start_at)
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][startDate.getDay()]

      formattedEvents.push({
        id: event.id,
        title: event.title,
        start: event.start_at,
        end: event.end_at,
        description: event.description,
        type: event.type,
        meta: {
          dayOfWeek,
          time: startDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          instructor: event.instructor?.name,
          room: event.room?.name,
          capacity: event.capacity,
          registered: event.registrations?.length || 0,
          available: event.capacity ? event.capacity - (event.registrations?.length || 0) : null,
          isRecurring: event.is_recurring,
          recurrencePattern: event.recurrence_pattern
        }
      })
    }

    // כרטיסי סדרה (כרטיס אחד לכל סדרה)
    for (const [seriesId, seriesEvents] of seriesMap) {
      const first = seriesEvents[0]
      const nextEvent = seriesEvents.find((e: any) => new Date(e.start_at) >= new Date()) || first
      const startDate = new Date(nextEvent.start_at)
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][startDate.getDay()]

      formattedEvents.push({
        id: `series-${seriesId}`,
        title: first.title,
        start: nextEvent.start_at,
        end: nextEvent.end_at,
        description: first.description,
        type: first.type,
        meta: {
          dayOfWeek,
          time: startDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
          instructor: first.instructor?.name,
          room: first.room?.name,
          capacity: first.capacity,
          isRecurring: true,
          recurrencePattern: 'series',
          seriesId: seriesId,
          totalSessions: seriesEvents.length,
          remainingSessions: seriesEvents.filter((e: any) => new Date(e.start_at) >= new Date()).length,
        }
      })
    }

    return NextResponse.json(formattedEvents, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch classes events:', error)

    return NextResponse.json(
      [],
      { status: 200 } // מחזיר מערך ריק במקום שגיאה
    )
  }
}
