'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Clock, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'

type WorkshopEvent = {
  id: string
  title: string
  description?: string
  type: string
  start: string
  end: string
  meta?: {
    seriesId?: string
    totalSessions?: number
    remainingSessions?: number
    instructor?: string
    capacity?: number
    dayOfWeek?: string
    [key: string]: any
  }
}

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > 80

  return (
    <div>
      <p className={`text-sm text-text-light/60 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
        {text}
      </p>
      {isLong && (
        <button
          className="text-sm text-secondary font-medium mt-1 hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {expanded ? 'הצג פחות' : 'קרא עוד'}
        </button>
      )}
    </div>
  )
}

export function FeaturedWorkshops() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState<WorkshopEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/calendar/classes')
        const data = await res.json()
        // סדנאות וחוגים - מקסימום 3
        setWorkshops((data || []).slice(0, 3))
      } catch {
        setWorkshops([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading || workshops.length === 0) return null

  return (
    <section className="py-10 sm:py-14 bg-background-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">סדנאות וחוגים</h2>
            <p className="text-text-light/70 mt-1">הצטרפו לסדנאות והחוגים שלנו</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/workshops">לכל הסדנאות</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {workshops.map((w) => {
            const meta = w.meta || {}
            const isSeries = !!meta.seriesId
            const startTime = formatTime(new Date(w.start))
            const endTime = formatTime(new Date(w.end))
            const hebrewDay = new Date(w.start).toLocaleDateString('he-IL', { weekday: 'long' })

            return (
              <div
                key={w.id}
                className="group bg-background-light border-2 border-border rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-secondary/40 hover:-translate-y-1"
                onClick={() => {
                  if (meta.seriesId) {
                    router.push(`/series/${meta.seriesId}`)
                  } else {
                    router.push('/workshops')
                  }
                }}
              >
                <div className="h-2 bg-gradient-to-l from-secondary via-accent to-primary" />
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-primary leading-snug">{w.title}</h3>
                    {isSeries && (
                      <span className="bg-secondary/15 text-secondary border border-secondary/30 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                        <BookOpen className="w-3 h-3" />
                        סדנה
                      </span>
                    )}
                  </div>

                  {w.description && (
                    <ExpandableDescription text={w.description} />
                  )}

                  {isSeries && (
                    <div className="bg-secondary/8 rounded-xl px-3 py-2 border border-secondary/15 text-sm font-medium text-secondary flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {meta.totalSessions} מפגשים
                    </div>
                  )}

                  <div className="bg-background rounded-xl p-3 text-sm text-text-light/80 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                    <span suppressHydrationWarning>
                      <span className="font-medium">{hebrewDay}</span> · {startTime} - {endTime}
                    </span>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-primary text-primary-foreground font-medium text-sm transition-colors group-hover:bg-secondary">
                    {isSeries ? 'הרשמה לסדנה' : 'פרטים נוספים'}
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 sm:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/workshops">לכל הסדנאות</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
