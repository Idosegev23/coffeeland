import { NextResponse } from 'next/server'
import { calendarClient } from '@/lib/googleCalendar'

export const revalidate = 300 // Revalidate every 5 minutes
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // חישוב טווח תאריכים - החודש הקרב ועוד חודשיים
    const now = new Date()
    const timeMin = new Date(now.getFullYear(), now.getMonth(), 1) // תחילת החודש
    const timeMax = new Date(now.getFullYear(), now.getMonth() + 3, 0) // סוף 3 חודשים
    
    // שליפת אירועים מ-Google Calendar
    const calendar = await calendarClient()
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100
    })

    const events = response.data.items || []

    // המרה לפורמט שהאפליקציה מצפה לו
    const formattedEvents = events
      .filter(event => event.start && event.start.dateTime)
      .map(event => {
        const start = new Date(event.start!.dateTime!)
        const end = new Date(event.end!.dateTime!)
        
        return {
          id: event.id,
          title: event.summary || 'אירוע',
          start: event.start!.dateTime,
          end: event.end!.dateTime,
          description: event.description,
          available: true // כל אירוע ביומן Google הוא זמין להזמנה
        }
      })
    
    return NextResponse.json(formattedEvents, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch availability events:', error)
    
    return NextResponse.json(
      [],
      { status: 200 } // מחזיר מערך ריק במקום שגיאה
    )
  }
}

