import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

interface ICSEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt: string;
  url?: string;
}

export function buildIcs(event: ICSEvent): string {
  const timezone = 'Asia/Jerusalem';
  
  // Format dates in UTC for ICS
  const dtStart = formatInTimeZone(new Date(event.startAt), 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  const dtEnd = formatInTimeZone(new Date(event.endAt), 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  const dtStamp = formatInTimeZone(new Date(), 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  
  // Clean and escape text for ICS format
  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };

  const title = escapeText(event.title);
  const description = event.description ? escapeText(event.description) : '';
  const location = event.location ? escapeText(event.location) : '';
  
  // Build ICS content
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CoffeLand//Workshop Calendar//HE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Jerusalem',
    'BEGIN:STANDARD',
    'DTSTART:20231029T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'TZNAME:IST',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0200',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:20240329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1FR',
    'TZNAME:IDT',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0300',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${event.id}@coffeeland.co.il`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `DTSTAMP:${dtStamp}`,
    `SUMMARY:${title}`,
  ];

  if (description) {
    icsLines.push(`DESCRIPTION:${description}`);
  }

  if (location) {
    icsLines.push(`LOCATION:${location}`);
  }

  if (event.url) {
    icsLines.push(`URL:${event.url}`);
  }

  icsLines.push(
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:תזכורת: הסדנה מתחילה בעוד 30 דקות',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  // Join with CRLF as per RFC 5545
  return icsLines.join('\r\n');
}

export function generateIcsFilename(title: string, date: string): string {
  const cleanTitle = title
    .replace(/[^a-zA-Z0-9\u0590-\u05FF\s]/g, '') // Keep Hebrew, English, numbers and spaces
    .replace(/\s+/g, '_')
    .substring(0, 50);
  
  const dateStr = format(new Date(date), 'yyyy-MM-dd');
  
  return `${cleanTitle}_${dateStr}.ics`;
}

export interface WorkshopSession {
  id: string;
  start_at: string;
  end_at: string;
  location?: string;
  workshop: {
    title: string;
    description_md?: string;
  };
}

export function buildWorkshopIcs(session: WorkshopSession): string {
  const event: ICSEvent = {
    id: session.id,
    title: session.workshop.title,
    description: session.workshop.description_md || undefined,
    location: session.location || 'CoffeLand - בן גוריון 7, אשקלון',
    startAt: session.start_at,
    endAt: session.end_at,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/workshops`,
  };

  return buildIcs(event);
}
