'use client'

import { MessageCircle, Clock, Users, Award, MapPin, Calendar as CalendarIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CalendarEvent } from '@/types/calendar'
import { formatDate, formatTime, formatPrice, generateWhatsAppLink } from '@/lib/utils'
import { analytics } from '@/lib/analytics'

interface EventModalProps {
  event: CalendarEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventModal({ event, open, onOpenChange }: EventModalProps) {
  if (!event) return null

  const startDate = new Date(event.start)
  const endDate = new Date(event.end)
  const startTime = formatTime(startDate)
  const endTime = formatTime(endDate)
  const formattedDate = formatDate(startDate, { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  })

  const availabilityLabels = {
    free: 'זמין',
    limited: 'מקומות אחרונים',
    full: 'מלא',
  }

  const availabilityColors = {
    free: 'success',
    limited: 'warning',
    full: 'error',
  } as const

  const handleWhatsAppClick = () => {
    const message = `שלום, אני מעוניין/ת לקבל מידע נוסף על: ${event.title}\nתאריך: ${formattedDate}\nשעה: ${startTime}-${endTime}`
    const link = generateWhatsAppLink(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972501234567', message)
    analytics.whatsappClick('event_modal', message)
    window.open(link, '_blank')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
            {event.meta?.availability && (
              <Badge variant={availabilityColors[event.meta.availability]}>
                {availabilityLabels[event.meta.availability]}
              </Badge>
            )}
          </div>
          {event.description && (
            <DialogDescription className="text-base pt-2">
              {event.description}
            </DialogDescription>
          )}
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-4">
          {/* Date & Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <CalendarIcon className="w-5 h-5" />
              <span className="font-semibold">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-text-light/70 mr-7">
              <Clock className="w-4 h-4" />
              <span>
                {startTime} - {endTime}
              </span>
            </div>
          </div>

          {/* Age Group */}
          {event.meta?.age && (
            <div className="flex items-center gap-2 text-text-light/70">
              <Users className="w-5 h-5 text-primary" />
              <span>
                <strong>גילאים:</strong> {event.meta.age}
              </span>
            </div>
          )}

          {/* Coach/Instructor */}
          {event.meta?.coach && (
            <div className="flex items-center gap-2 text-text-light/70">
              <Award className="w-5 h-5 text-primary" />
              <span>
                <strong>מדריך/ה:</strong> {event.meta.coach}
              </span>
            </div>
          )}

          {/* Capacity */}
          {event.meta?.capacity && (
            <div className="flex items-center gap-2 text-text-light/70">
              <Users className="w-5 h-5 text-primary" />
              <span>
                <strong>קיבולת:</strong> עד {event.meta.capacity} משתתפים
              </span>
            </div>
          )}

          {/* Location */}
          {event.meta?.location && (
            <div className="flex items-center gap-2 text-text-light/70">
              <MapPin className="w-5 h-5 text-primary" />
              <span>
                <strong>מיקום:</strong> {event.meta.location}
              </span>
            </div>
          )}

          {/* Notes */}
          {event.meta?.notes && (
            <div className="bg-accent/10 p-3 rounded-md text-sm text-text-light/80">
              <strong className="text-accent">הערה:</strong> {event.meta.notes}
            </div>
          )}

          {/* Recurring */}
          {event.meta?.recurring && (
            <div className="bg-secondary/10 p-3 rounded-md text-sm text-text-light/80">
              <strong className="text-secondary">חוג קבוע:</strong> מתקיים מדי שבוע באותו יום ושעה
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            {event.meta?.price && (
              <div className="text-2xl font-bold text-accent">
                {formatPrice(event.meta.price)}
                {event.meta.recurring && <span className="text-sm text-text-light/70 mr-1">/ מפגש</span>}
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-initial"
            >
              סגור
            </Button>
            <Button 
              variant="default" 
              onClick={handleWhatsAppClick}
              className="flex-1 sm:flex-initial gap-2"
              disabled={event.meta?.availability === 'full'}
            >
              <MessageCircle className="w-4 h-4" />
              {event.meta?.availability === 'full' ? 'אין מקומות' : 'שריינו מקום'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

