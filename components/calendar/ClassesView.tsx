'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { EventCard } from './EventCard'
import { EventModal } from './EventModal'
import type { CalendarEvent, CalendarFilters } from '@/types/calendar'

const daysOfWeek = [
  { value: '', label: 'כל הימים' },
  { value: 'sunday', label: 'ראשון' },
  { value: 'monday', label: 'שני' },
  { value: 'tuesday', label: 'שלישי' },
  { value: 'wednesday', label: 'רביעי' },
  { value: 'thursday', label: 'חמישי' },
  { value: 'friday', label: 'שישי' },
  { value: 'saturday', label: 'שבת' },
]

const ageGroups = [
  { value: '', label: 'כל הגילאים' },
  { value: '0-2', label: '0-2' },
  { value: '2-4', label: '2-4' },
  { value: '3-5', label: '3-5' },
  { value: '5-7', label: '5-7' },
  { value: '6-8', label: '6-8' },
  { value: '6-10', label: '6-10' },
  { value: '7-10', label: '7-10' },
  { value: '3-8', label: '3-8 (הורה-ילד)' },
]

export function ClassesView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<CalendarFilters>({
    dayOfWeek: undefined,
    age: undefined,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/calendar/classes')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Failed to fetch classes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setModalOpen(true)
  }

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (filters.dayOfWeek && event.meta?.dayOfWeek !== filters.dayOfWeek) {
      return false
    }
    if (filters.age && event.meta?.age !== filters.age) {
      return false
    }
    return true
  })

  // Sort by day of week, then by time
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayA = dayOrder.indexOf(a.meta?.dayOfWeek || '')
    const dayB = dayOrder.indexOf(b.meta?.dayOfWeek || '')
    
    if (dayA !== dayB) return dayA - dayB
    
    return new Date(a.start).getTime() - new Date(b.start).getTime()
  })

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="w-12 h-12 text-text-light/30 mb-4" />
          <p className="text-text-light/70 mb-2">אין חוגים פעילים כרגע</p>
          <p className="text-sm text-text-light/50">בקרוב יפורסמו חוגים וסדנאות חדשות</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 mb-4"
        >
          <Filter className="w-4 h-4" />
          סינון
        </Button>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-background-light p-4 rounded-lg border-2 border-border space-y-4"
          >
            {/* Day of Week Filter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                יום בשבוע
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <Button
                    key={day.value}
                    variant={filters.dayOfWeek === day.value || (!filters.dayOfWeek && !day.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setFilters({ ...filters, dayOfWeek: day.value as any })
                    }
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Age Filter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                גילאים
              </label>
              <div className="flex flex-wrap gap-2">
                {ageGroups.map((age) => (
                  <Button
                    key={age.value}
                    variant={filters.age === age.value || (!filters.age && !age.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, age: age.value })}
                  >
                    {age.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ dayOfWeek: undefined, age: undefined })}
            >
              נקה סינון
            </Button>
          </motion.div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-text-light/70 mb-4">
        {sortedEvents.length} חוגים וסדנאות
      </p>

      {/* Classes Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <EventCard event={event} onSelect={handleEventClick} />
          </motion.div>
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-text-light/30 mb-4" />
            <p className="text-text-light/70 mb-2">לא נמצאו חוגים מתאימים</p>
            <p className="text-sm text-text-light/50">נסו לשנות את הסינון</p>
          </CardContent>
        </Card>
      )}

      <EventModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}

