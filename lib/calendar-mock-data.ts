import type { CalendarEvent } from '@/types/calendar'

/**
 * Helper to create dates relative to today
 */
function getDate(daysFromNow: number, hours: number = 10, minutes: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

/**
 * Mock availability data (blocked/free slots for events/birthdays)
 */
export const mockAvailabilityEvents: CalendarEvent[] = [
  // This week - blocked
  {
    id: 'block-1',
    title: 'תפוס - יום הולדת פרטי',
    start: getDate(2, 15, 0),
    end: getDate(2, 18, 0),
    type: 'block',
    allDay: false,
    meta: {
      availability: 'full',
      notes: 'אירוע מלא',
    },
  },
  {
    id: 'block-2',
    title: 'תפוס - אירוע חברה',
    start: getDate(4, 10, 0),
    end: getDate(4, 14, 0),
    type: 'block',
    allDay: false,
    meta: {
      availability: 'full',
      notes: 'הזמנה מראש',
    },
  },

  // Next week - available slots
  {
    id: 'avail-1',
    title: 'זמין - אחר הצהריים',
    start: getDate(7, 14, 0),
    end: getDate(7, 18, 0),
    type: 'event',
    allDay: false,
    meta: {
      availability: 'free',
      capacity: 30,
      notes: 'מתאים לימי הולדת ואירועים',
    },
  },
  {
    id: 'avail-2',
    title: 'זמין - בוקר',
    start: getDate(8, 9, 0),
    end: getDate(8, 13, 0),
    type: 'event',
    allDay: false,
    meta: {
      availability: 'free',
      capacity: 30,
      notes: 'שעות שקטות יותר',
    },
  },
  {
    id: 'avail-3',
    title: 'זמין - סוף שבוע',
    start: getDate(10, 10, 0),
    end: getDate(10, 14, 0),
    type: 'event',
    allDay: false,
    meta: {
      availability: 'free',
      capacity: 30,
      notes: 'פופולרי לימי הולדת',
    },
  },

  // Week after - limited availability
  {
    id: 'avail-4',
    title: 'זמינות מוגבלת',
    start: getDate(14, 15, 0),
    end: getDate(14, 18, 0),
    type: 'event',
    allDay: false,
    meta: {
      availability: 'limited',
      capacity: 15,
      notes: 'נשארו 15 מקומות',
    },
  },
  {
    id: 'avail-5',
    title: 'זמין',
    start: getDate(15, 10, 0),
    end: getDate(15, 14, 0),
    type: 'event',
    allDay: false,
    meta: {
      availability: 'free',
      capacity: 30,
    },
  },
]

/**
 * Mock classes/workshops data (recurring activities)
 */
export const mockClassesEvents: CalendarEvent[] = [
  // Art classes
  {
    id: 'class-art-1',
    title: 'חוג אומנות | גילאי 3-5',
    start: getDate(1, 16, 0),
    end: getDate(1, 17, 0),
    type: 'class',
    allDay: false,
    description: 'סדנת אומנות יצירתית לגילאי הגן. ציור, פיסול וקולאז׳.',
    meta: {
      age: '3-5',
      coach: 'מיכל כהן',
      price: 80,
      capacity: 12,
      availability: 'free',
      dayOfWeek: 'monday',
      recurring: true,
      location: 'אולם יצירה',
    },
  },
  {
    id: 'class-art-2',
    title: 'חוג אומנות | גילאי 6-8',
    start: getDate(1, 17, 30),
    end: getDate(1, 18, 30),
    type: 'class',
    allDay: false,
    description: 'טכניקות מתקדמות בציור ופיסול לילדי בית ספר.',
    meta: {
      age: '6-8',
      coach: 'מיכל כהן',
      price: 90,
      capacity: 10,
      availability: 'limited',
      dayOfWeek: 'monday',
      recurring: true,
      location: 'אולם יצירה',
    },
  },

  // Music classes
  {
    id: 'class-music-1',
    title: 'חוג מוזיקה | גילאי 2-4',
    start: getDate(2, 10, 0),
    end: getDate(2, 10, 45),
    type: 'class',
    allDay: false,
    description: 'שירה, תנועה וכלי הקשה. פיתוח חושי מוזיקלי.',
    meta: {
      age: '2-4',
      coach: 'דני לוי',
      price: 70,
      capacity: 15,
      availability: 'free',
      dayOfWeek: 'tuesday',
      recurring: true,
      location: 'אולם מוזיקה',
    },
  },
  {
    id: 'class-music-2',
    title: 'חוג מוזיקה | גילאי 5-7',
    start: getDate(2, 16, 0),
    end: getDate(2, 17, 0),
    type: 'class',
    allDay: false,
    description: 'לימוד כלי נגינה בסיסיים ושירה בקבוצה.',
    meta: {
      age: '5-7',
      coach: 'דני לוי',
      price: 85,
      capacity: 12,
      availability: 'free',
      dayOfWeek: 'tuesday',
      recurring: true,
      location: 'אולם מוזיקה',
    },
  },

  // Cooking classes
  {
    id: 'class-cooking-1',
    title: 'סדנת בישול | גילאי 6-10',
    start: getDate(3, 15, 30),
    end: getDate(3, 17, 0),
    type: 'class',
    allDay: false,
    description: 'בישול והכנת מאפים בצוותא עם ההורים.',
    meta: {
      age: '6-10',
      coach: 'שרה אברהם',
      price: 100,
      capacity: 8,
      availability: 'limited',
      dayOfWeek: 'wednesday',
      recurring: true,
      location: 'מטבח סדנאות',
      notes: 'כולל חומרי גלם',
    },
  },

  // Movement & Dance
  {
    id: 'class-dance-1',
    title: 'חוג תנועה ומחול | גילאי 3-5',
    start: getDate(4, 16, 0),
    end: getDate(4, 16, 45),
    type: 'class',
    allDay: false,
    description: 'תנועה יצירתית, ריתמוס ומוזיקה.',
    meta: {
      age: '3-5',
      coach: 'נועה ברק',
      price: 75,
      capacity: 15,
      availability: 'free',
      dayOfWeek: 'thursday',
      recurring: true,
      location: 'אולם תנועה',
    },
  },
  {
    id: 'class-dance-2',
    title: 'חוג תנועה ומחול | גילאי 6-8',
    start: getDate(4, 17, 0),
    end: getDate(4, 18, 0),
    type: 'class',
    allDay: false,
    description: 'כוריאוגרפיות וביטוי גופני לילדי בית ספר.',
    meta: {
      age: '6-8',
      coach: 'נועה ברק',
      price: 85,
      capacity: 12,
      availability: 'free',
      dayOfWeek: 'thursday',
      recurring: true,
      location: 'אולם תנועה',
    },
  },

  // Science & Exploration
  {
    id: 'class-science-1',
    title: 'סדנת מדע וגילוי | גילאי 7-10',
    start: getDate(5, 15, 0),
    end: getDate(5, 16, 30),
    type: 'class',
    allDay: false,
    description: 'ניסויים מדעיים מרתקים וגילוי עולם הטבע.',
    meta: {
      age: '7-10',
      coach: 'ד"ר יוסי רון',
      price: 95,
      capacity: 10,
      availability: 'free',
      dayOfWeek: 'friday',
      recurring: true,
      location: 'מעבדת מדע',
      notes: 'כולל ציוד לניסויים',
    },
  },

  // Parent-Child Workshops (weekends)
  {
    id: 'class-parentchild-1',
    title: 'סדנת הורה-ילד | יצירה',
    start: getDate(6, 10, 0),
    end: getDate(6, 11, 30),
    type: 'class',
    allDay: false,
    description: 'סדנה משותפת להורה וילד. יצירה והנאה ביחד.',
    meta: {
      age: '3-8',
      coach: 'מיכל כהן',
      price: 120,
      capacity: 8,
      availability: 'limited',
      dayOfWeek: 'saturday',
      recurring: true,
      location: 'אולם יצירה',
      notes: 'מחיר למשפחה (הורה + ילד)',
    },
  },
]

/**
 * Fetch all calendar events (combined)
 */
export function getAllMockEvents(): CalendarEvent[] {
  return [...mockAvailabilityEvents, ...mockClassesEvents]
}

