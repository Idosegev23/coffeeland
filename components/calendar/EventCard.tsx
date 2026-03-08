import { Clock, Users, Award, MapPin, BookOpen, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CalendarEvent } from '@/types/calendar'
import { formatTime } from '@/lib/utils'

interface EventCardProps {
  event: CalendarEvent
  onSelect?: (event: CalendarEvent) => void
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const startTime = formatTime(new Date(event.start))
  const endTime = formatTime(new Date(event.end))
  const meta = event.meta as any
  const isSeries = !!meta?.seriesId

  const hebrewDay = new Date(event.start).toLocaleDateString('he-IL', { weekday: 'long' })
  const hebrewDate = new Date(event.start).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })

  return (
    <div
      className="group relative bg-background-light border-2 border-border rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-secondary/40 hover:-translate-y-1"
      onClick={() => onSelect?.(event)}
    >
      {/* Top accent strip */}
      <div className="h-2 bg-gradient-to-l from-secondary via-accent to-primary" />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-primary leading-snug mb-1">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-text-light/60 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>
          {isSeries && (
            <Badge className="bg-secondary/15 text-secondary border-secondary/30 border flex-shrink-0">
              <BookOpen className="w-3 h-3 ml-1" />
              סדרה
            </Badge>
          )}
        </div>

        {/* Series info */}
        {isSeries && (
          <div className="bg-secondary/8 rounded-xl px-4 py-3 border border-secondary/15">
            <div className="flex items-center gap-2 text-sm font-medium text-secondary">
              <BookOpen className="w-4 h-4" />
              <span>{meta.totalSessions} מפגשים</span>
              {meta.remainingSessions > 0 && (
                <span className="text-text-light/50 font-normal">
                  · {meta.remainingSessions} נותרו
                </span>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-background rounded-xl p-3 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-text-light/80">
            <Clock className="w-4 h-4 text-accent flex-shrink-0" />
            <span suppressHydrationWarning>
              {isSeries ? (
                <>
                  <span className="text-text-light/50">מפגש הבא: </span>
                  <span className="font-medium">{hebrewDay}</span>
                  {' · '}
                  {startTime} - {endTime}
                </>
              ) : (
                <>
                  <span className="font-medium">{hebrewDate}</span>
                  {' · '}
                  {startTime} - {endTime}
                </>
              )}
            </span>
          </div>

          {(event.meta?.coach || meta?.instructor) && (
            <div className="flex items-center gap-2.5 text-sm text-text-light/80">
              <Award className="w-4 h-4 text-accent flex-shrink-0" />
              <span>{event.meta?.coach || meta?.instructor}</span>
            </div>
          )}

          {event.meta?.capacity && (
            <div className="flex items-center gap-2.5 text-sm text-text-light/80">
              <Users className="w-4 h-4 text-accent flex-shrink-0" />
              <span>עד {event.meta.capacity} משתתפים</span>
            </div>
          )}

          {(event.meta?.location || meta?.room) && (
            <div className="flex items-center gap-2.5 text-sm text-text-light/80">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              <span>{event.meta?.location || meta?.room}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-primary text-primary-foreground font-medium text-sm transition-colors group-hover:bg-secondary"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(event)
          }}
        >
          {isSeries ? 'הרשמה לסדרה' : 'פרטים נוספים'}
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>
    </div>
  )
}
