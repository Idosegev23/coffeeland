import { Clock, Users, Award, MapPin, BookOpen } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CalendarEvent } from '@/types/calendar'
import { formatTime, formatPrice } from '@/lib/utils'

interface EventCardProps {
  event: CalendarEvent
  onSelect?: (event: CalendarEvent) => void
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const startTime = formatTime(new Date(event.start))
  const endTime = formatTime(new Date(event.end))
  const meta = event.meta as any
  const isSeries = !!meta?.seriesId

  const availabilityColors = {
    free: 'success',
    limited: 'warning',
    full: 'error',
  } as const

  const availabilityLabels = {
    free: 'זמין',
    limited: 'מקומות אחרונים',
    full: 'מלא',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect?.(event)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            {isSeries && (
              <Badge className="bg-indigo-100 text-indigo-700">
                <BookOpen className="w-3 h-3 ml-1" />
                סדרה
              </Badge>
            )}
            {event.meta?.availability && (
              <Badge variant={availabilityColors[event.meta.availability]}>
                {availabilityLabels[event.meta.availability]}
              </Badge>
            )}
          </div>
        </div>
        {event.description && (
          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Series info */}
        {isSeries && (
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span>{meta.totalSessions} מפגשים ({meta.remainingSessions} נותרו)</span>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-text-light/70">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {isSeries ? `מפגש הבא: ${startTime} - ${endTime}` : `${startTime} - ${endTime}`}
          </span>
        </div>

        {/* Coach/Instructor */}
        {(event.meta?.coach || meta?.instructor) && (
          <div className="flex items-center gap-2 text-sm text-text-light/70">
            <Award className="w-4 h-4 flex-shrink-0" />
            <span>{event.meta?.coach || meta?.instructor}</span>
          </div>
        )}

        {/* Capacity */}
        {event.meta?.capacity && (
          <div className="flex items-center gap-2 text-sm text-text-light/70">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>עד {event.meta.capacity} משתתפים</span>
          </div>
        )}

        {/* Location */}
        {(event.meta?.location || meta?.room) && (
          <div className="flex items-center gap-2 text-sm text-text-light/70">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{event.meta?.location || meta?.room}</span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {event.meta?.price && (
            <span className="text-lg font-semibold text-accent">
              {formatPrice(event.meta.price)}
            </span>
          )}
          <Button
            size="sm"
            variant={isSeries ? 'default' : 'outline'}
            className={isSeries ? 'bg-accent hover:bg-accent/90' : ''}
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(event)
            }}
          >
            {isSeries ? 'הרשמה לסדרה' : 'פרטים נוספים'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

