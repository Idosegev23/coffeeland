/**
 * Google Calendar Integration
 * סנכרון חד-כיווני: Supabase → Google Calendar (לצפייה בלבד)
 */

import { google } from 'googleapis';

/**
 * יוצר Google Calendar client עם OAuth2
 */
function getCalendarClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_SECRET_KEY
  );

  oauth2.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  return google.calendar({ version: 'v3', auth: oauth2 });
}

/**
 * טיפוס לאירוע שנשלח מ-Supabase
 */
export interface CalendarEventInput {
  google_event_id?: string | null; // אם קיים - עדכון, אם לא - יצירה
  title: string;
  description?: string | null;
  start_at: string; // ISO 8601 format
  end_at: string;   // ISO 8601 format
  location?: string | null;
  instructor_name?: string | null;
  capacity?: number | null;
  registered_count?: number;
}

/**
 * יוצר או מעדכן אירוע ב-Google Calendar
 * @returns Google Event ID
 */
export async function upsertGoogleEvent(evt: CalendarEventInput): Promise<string> {
  const cal = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const timeZone = process.env.GOOGLE_TIMEZONE || 'Asia/Jerusalem';

  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID לא מוגדר ב-.env.local');
  }

  // בניית התיאור עם מידע נוסף
  let fullDescription = evt.description || '';
  if (evt.instructor_name) {
    fullDescription += `\n\n🎓 מדריך: ${evt.instructor_name}`;
  }
  if (evt.capacity) {
    const registered = evt.registered_count || 0;
    fullDescription += `\n👥 רשומים: ${registered}/${evt.capacity}`;
  }

  const eventBody = {
    summary: evt.title,
    description: fullDescription,
    location: evt.location || '',
    start: {
      dateTime: evt.start_at,
      timeZone
    },
    end: {
      dateTime: evt.end_at,
      timeZone
    },
    colorId: '9', // צבע כחול בהיר (ניתן להתאים)
  };

  try {
    if (evt.google_event_id) {
      // עדכון אירוע קיים
      const res = await cal.events.patch({
        calendarId,
        eventId: evt.google_event_id,
        requestBody: eventBody
      });
      console.log(`✅ אירוע עודכן ביומן Google: ${evt.title}`);
      return res.data.id!;
    } else {
      // יצירת אירוע חדש
      const res = await cal.events.insert({
        calendarId,
        requestBody: eventBody
      });
      console.log(`✅ אירוע נוצר ביומן Google: ${evt.title}`);
      return res.data.id!;
    }
  } catch (error: any) {
    console.error('❌ שגיאה בסנכרון ליומן Google:', error.message);
    throw new Error(`Google Calendar sync failed: ${error.message}`);
  }
}

/**
 * מוחק אירוע מ-Google Calendar
 */
export async function deleteGoogleEvent(googleEventId: string): Promise<void> {
  const cal = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendarId) {
    throw new Error('GOOGLE_CALENDAR_ID לא מוגדר');
  }

  try {
    await cal.events.delete({
      calendarId,
      eventId: googleEventId
    });
    console.log(`✅ אירוע נמחק מיומן Google: ${googleEventId}`);
  } catch (error: any) {
    console.error('❌ שגיאה במחיקת אירוע:', error.message);
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}

/**
 * מוסיף משתתף לאירוע קיים (לא בשימוש כרגע - לעתיד)
 */
export async function addAttendeeToEvent(
  googleEventId: string,
  attendee: { email?: string; name: string }
): Promise<void> {
  const cal = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!calendarId) return;

  try {
    const current = await cal.events.get({ calendarId, eventId: googleEventId });
    const attendees = current.data.attendees || [];
    attendees.push({
      email: attendee.email,
      displayName: attendee.name,
      responseStatus: 'accepted'
    });

    await cal.events.patch({
      calendarId,
      eventId: googleEventId,
      requestBody: { attendees }
    });
  } catch (error: any) {
    console.error('שגיאה בהוספת משתתף:', error.message);
  }
}

/**
 * בדיקת חיבור לGoogle Calendar (לבדיקות)
 */
export async function testGoogleCalendarConnection(): Promise<boolean> {
  try {
    const cal = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!calendarId) {
      console.error('❌ GOOGLE_CALENDAR_ID חסר');
      return false;
    }

    const res = await cal.calendarList.get({ calendarId });
    console.log(`✅ חיבור תקין ליומן: ${res.data.summary}`);
    return true;
  } catch (error: any) {
    console.error('❌ בדיקת חיבור נכשלה:', error.message);
    return false;
  }
}

