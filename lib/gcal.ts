import type { CalendarEvent } from '@/types/calendar'
import { mockAvailabilityEvents, mockClassesEvents } from './calendar-mock-data'

/**
 * Fetch availability events (for birthdays/events booking)
 * 
 * In Phase 2, this will connect to Google Calendar API
 */
export async function fetchAvailabilityEvents(): Promise<CalendarEvent[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  // Return mock data
  return mockAvailabilityEvents
}

/**
 * Fetch classes/workshops events (recurring activities)
 * 
 * In Phase 2, this will connect to Google Calendar API
 */
export async function fetchClassesEvents(): Promise<CalendarEvent[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  // Return mock data
  return mockClassesEvents
}

/**
 * Fetch all events
 */
export async function fetchAllEvents(): Promise<CalendarEvent[]> {
  const [availability, classes] = await Promise.all([
    fetchAvailabilityEvents(),
    fetchClassesEvents(),
  ])
  
  return [...availability, ...classes]
}

/**
 * Filter events by date range
 */
export function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    
    return (
      (eventStart >= startDate && eventStart <= endDate) ||
      (eventEnd >= startDate && eventEnd <= endDate) ||
      (eventStart <= startDate && eventEnd >= endDate)
    )
  })
}

/**
 * Filter events by type
 */
export function filterEventsByType(
  events: CalendarEvent[],
  types: CalendarEvent['type'][]
): CalendarEvent[] {
  return events.filter((event) => types.includes(event.type))
}

/**
 * Sort events by start date
 */
export function sortEventsByDate(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })
}

/**
 * Get upcoming events (from today)
 */
export function getUpcomingEvents(
  events: CalendarEvent[],
  limit?: number
): CalendarEvent[] {
  const now = new Date()
  const upcoming = events.filter((event) => new Date(event.start) >= now)
  const sorted = sortEventsByDate(upcoming)
  
  return limit ? sorted.slice(0, limit) : sorted
}

/**
 * Group events by date
 */
export function groupEventsByDate(
  events: CalendarEvent[]
): Record<string, CalendarEvent[]> {
  return events.reduce((acc, event) => {
    const date = new Date(event.start).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)
}

/**
 * Check if date has available slots
 */
export function isDateAvailable(
  events: CalendarEvent[],
  date: Date
): boolean {
  const dateStr = date.toISOString().split('T')[0]
  const dateEvents = events.filter((event) => {
    const eventDate = new Date(event.start).toISOString().split('T')[0]
    return eventDate === dateStr
  })
  
  // Check if any event is marked as blocked/full
  return !dateEvents.some(
    (event) =>
      event.type === 'block' || event.meta?.availability === 'full'
  )
}

