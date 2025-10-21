'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EventModal } from './EventModal'
import type { CalendarEvent } from '@/types/calendar'
import { formatDate, formatTime, generateWhatsAppLink } from '@/lib/utils'
import { analytics } from '@/lib/analytics'

export function AvailabilityView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/calendar/availability')
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Failed to fetch availability:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setModalOpen(true)
    analytics.eventOpen(event.id, event.type)
  }

  const handleQuickBook = (event: CalendarEvent) => {
    const startDate = new Date(event.start)
    const message = `שלום, אני מעוניין/ת לשריין את התאריך: ${formatDate(startDate)} בשעה ${formatTime(startDate)}`
    const link = generateWhatsAppLink(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972501234567',
      message
    )
    analytics.whatsappClick('availability_quick_book', message)
    window.open(link, '_blank')
  }

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="w-12 h-12 text-text-light/30 mb-4" />
          <p className="text-text-light/70 mb-2">אין זמינות כרגע</p>
          <p className="text-sm text-text-light/50">צרו קשר לבדיקת תאריכים נוספים</p>
        </CardContent>
      </Card>
    )
  }

  // Sort events by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  )

  const getIcon = (availability?: string) => {
    switch (availability) {
      case 'free':
        return <CheckCircle className="w-5 h-5 text-accent" />
      case 'limited':
        return <AlertCircle className="w-5 h-5 text-[#F5A219]" />
      case 'full':
        return <XCircle className="w-5 h-5 text-error" />
      default:
        return <Calendar className="w-5 h-5 text-text-light/50" />
    }
  }

  const getStatusText = (availability?: string) => {
    switch (availability) {
      case 'free':
        return 'זמין'
      case 'limited':
        return 'מקומות אחרונים'
      case 'full':
        return 'מלא'
      default:
        return 'לבדיקה'
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.map((event, index) => {
          const startDate = new Date(event.start)
          const endDate = new Date(event.end)
          const isAvailable = event.meta?.availability === 'free' || event.meta?.availability === 'limited'

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer h-full"
                onClick={() => handleEventClick(event)}
              >
                <CardContent className="p-6 space-y-4">
                  {/* Date */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-primary">
                        {startDate.getDate()}
                      </p>
                      <p className="text-sm text-text-light/70">
                        {formatDate(startDate, { month: 'long', weekday: 'long' })}
                      </p>
                    </div>
                    {getIcon(event.meta?.availability)}
                  </div>

                  {/* Time */}
                  <div className="text-sm text-text-light/80">
                    {formatTime(startDate)} - {formatTime(endDate)}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-sm font-medium">
                      {getStatusText(event.meta?.availability)}
                    </span>
                    {isAvailable && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuickBook(event)
                        }}
                      >
                        שריינו
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <EventModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}

