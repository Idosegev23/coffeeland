import { NextResponse } from 'next/server'
import { calendarClient } from '@/lib/googleCalendar'

export const revalidate = 300 // Revalidate every 5 minutes
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const timeMin = new Date()
    timeMin.setHours(0, 0, 0, 0)
    const timeMax = new Date()
    timeMax.setDate(timeMax.getDate() + 60) // 60 ימים קדימה
    
    // שליפת אירועים תפוסים מ-Google Calendar
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

    // יצירת מפה של תאריכים תפוסים
    const busySlots = busyEvents
      .filter(event => event.start && event.start.dateTime)
      .map(event => ({
        start: event.start!.dateTime!,
        end: event.end!.dateTime!,
        title: event.summary || 'תפוס'
      }))

    // יצירת זמנים זמינים: כל יום מ-9:00 עד 20:00 פרט לזמנים תפוסים
    const availableSlots: any[] = []
    const daysToShow = 60
    
    for (let i = 0; i < daysToShow; i++) {
      const day = new Date()
      day.setDate(day.getDate() + i)
      day.setHours(0, 0, 0, 0)
      
      // דלג על ימי שישי ושבת (אופציונלי - תוכל להסיר)
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
          // - התחלת הסלוט בתוך אירוע תפוס
          // - סוף הסלוט בתוך אירוע תפוס
          // - הסלוט מכסה את כל האירוע התפוס
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
    
    return NextResponse.json(availableSlots, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    
    return NextResponse.json(
      [],
      { status: 200 }
    )
  }
}

