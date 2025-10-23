import { NextResponse } from 'next/server'
import { calendarClient } from '@/lib/googleCalendar'

export const revalidate = 300 // Revalidate every 5 minutes
export const dynamic = 'force-dynamic'

// פונקציה ליצירת סלוטים זמינים
function generateAvailableSlots(busySlots: Array<{ start: string; end: string; title: string }> = []) {
  const now = new Date()
  const availableSlots: any[] = []
  const daysToShow = 60
  
  for (let i = 0; i < daysToShow; i++) {
    const day = new Date()
    day.setDate(day.getDate() + i)
    day.setHours(0, 0, 0, 0)
    
    // דלג על ימי שישי ושבת (אופציונלי)
    const dayOfWeek = day.getDay()
    if (dayOfWeek === 5 || dayOfWeek === 6) continue
    
    // שעות פעילות: 9:00-20:00
    for (let hour = 9; hour < 20; hour += 3) { // כל 3 שעות
      const slotStart = new Date(day)
      slotStart.setHours(hour, 0, 0, 0)
      
      const slotEnd = new Date(day)
      slotEnd.setHours(hour + 3, 0, 0, 0)
      
      // בדוק אם השעה הזו תפוסה
      const isBusy = busySlots.some(busy => {
        const busyStart = new Date(busy.start)
        const busyEnd = new Date(busy.end)
        
        // יש חפיפה אם:
        return (
          (slotStart >= busyStart && slotStart < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (slotStart <= busyStart && slotEnd >= busyEnd)
        )
      })
      
      if (!isBusy && slotStart > now) {
        availableSlots.push({
          id: `available-${slotStart.toISOString()}`,
          title: 'זמין להזמנה',
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          available: true,
          type: 'available'
        })
      }
    }
  }
  
  return availableSlots
}

export async function GET() {
  try {
    const now = new Date()
    const timeMin = new Date()
    timeMin.setHours(0, 0, 0, 0)
    const timeMax = new Date()
    timeMax.setDate(timeMax.getDate() + 60) // 60 ימים קדימה
    
    let busySlots: Array<{ start: string; end: string; title: string }> = []
    
    try {
      // ניסיון לשלוף אירועים תפוסים מ-Google Calendar
      const calendar = await calendarClient()
      
      const response = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        maxResults: 200
      })

      const busyEvents = response.data.items || []
      console.log(`📅 Found ${busyEvents.length} events in Google Calendar`)

      // יצירת מפה של תאריכים תפוסים
      busySlots = busyEvents
        .filter(event => event.start && event.start.dateTime)
        .map(event => ({
          start: event.start!.dateTime!,
          end: event.end!.dateTime!,
          title: event.summary || 'תפוס'
        }))
    } catch (calendarError: any) {
      console.error('⚠️ Google Calendar error:', {
        message: calendarError?.message,
        code: calendarError?.code,
        status: calendarError?.response?.status,
        statusText: calendarError?.response?.statusText,
        data: calendarError?.response?.data
      })
      // אם יש שגיאה עם Google Calendar, נמשיך עם busySlots ריק (הכל זמין)
    }

    // יצירת זמנים זמינים באמצעות הפונקציה
    const availableSlots = generateAvailableSlots(busySlots)
    
    console.log(`✅ Generated ${availableSlots.length} available slots (with ${busySlots.length} busy slots)`)
    
    return NextResponse.json(availableSlots, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error: any) {
    console.error('❌ Fatal error in availability route:', {
      message: error?.message,
      stack: error?.stack
    })
    
    // במקרה של שגיאה כללית, נחזיר זמינות מלאה
    const fallbackSlots = generateAvailableSlots([])
    console.log(`⚠️ Returning ${fallbackSlots.length} fallback slots`)
    
    return NextResponse.json(fallbackSlots, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
      status: 200
    })
  }
}

