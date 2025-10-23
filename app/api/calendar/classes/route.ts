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
        instructor:instructors(name),
        room:rooms(name),
        registrations(count)
      `)
      .in('type', ['class', 'workshop'])
      .eq('status', 'active')
      .gte('start_at', new Date().toISOString())
      .order('start_at', { ascending: true })
      .limit(50)

    if (error) throw error

    // המרה לפורמט CalendarEvent
    const formattedEvents = (events || []).map((event: any) => {
      const startDate = new Date(event.start_at)
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][startDate.getDay()]
      
      return {
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
      }
    })
    
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

