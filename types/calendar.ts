/**
 * Calendar event types
 */
export type EventType = 'class' | 'event' | 'block' | 'show'

/**
 * Availability status for events
 */
export type AvailabilityStatus = 'free' | 'limited' | 'full'

/**
 * Days of the week
 */
export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

/**
 * Calendar event metadata
 */
export interface EventMeta {
  /** Age range (e.g., "4-6", "0-3") */
  age?: string
  /** Instructor/coach name */
  coach?: string
  /** Price in ILS */
  price?: number
  /** Maximum capacity */
  capacity?: number
  /** Current availability status */
  availability?: AvailabilityStatus
  /** Location within venue */
  location?: string
  /** Additional notes */
  notes?: string
  /** Day of week for recurring events */
  dayOfWeek?: DayOfWeek
  /** Is this a recurring event */
  recurring?: boolean
  /** Image URL for the event */
  imageUrl?: string
  /** Show banner image URL */
  bannerImageUrl?: string
  /** Price for show-only ticket */
  priceShowOnly?: number
  /** Price for show + playground ticket */
  priceShowAndPlayground?: number
}

/**
 * Calendar event structure
 */
export interface CalendarEvent {
  /** Unique identifier */
  id: string
  /** Event title */
  title: string
  /** Start date/time (ISO string) */
  start: string
  /** End date/time (ISO string) */
  end: string
  /** All-day event flag */
  allDay?: boolean
  /** Event type */
  type: EventType
  /** Additional metadata */
  meta?: EventMeta
  /** Full description */
  description?: string
}

/**
 * Calendar filter options
 */
export interface CalendarFilters {
  /** Filter by age range */
  age?: string
  /** Filter by day of week */
  dayOfWeek?: DayOfWeek
  /** Filter by instructor */
  coach?: string
  /** Filter by availability */
  availability?: AvailabilityStatus
  /** Search by title */
  search?: string
}

/**
 * Calendar view type
 */
export type CalendarView = 'week' | 'month' | 'list'

/**
 * Class/workshop category
 */
export type ClassCategory = 
  | 'art'
  | 'music'
  | 'dance'
  | 'sport'
  | 'cooking'
  | 'science'
  | 'language'
  | 'other'

/**
 * Event package (for birthdays)
 */
export interface EventPackage {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  capacity: number
  includes: string[]
  imageUrl?: string
}

/**
 * Pass/membership option
 */
export interface PassOption {
  id: string
  name: string
  description: string
  price: number
  visits?: number // undefined = unlimited
  validityDays: number // how many days until expiration
  benefits: string[]
  popular?: boolean
}

