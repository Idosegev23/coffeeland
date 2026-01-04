'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FeaturedEvent = {
  id: string
  title: string
  description?: string | null
  type: 'class' | 'workshop' | 'event'
  start_at: string
  end_at: string
  capacity?: number | null
  price?: number | null
  registrations_count?: number
}

export function FeaturedEvents() {
  const [events, setEvents] = useState<FeaturedEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const nowIso = new Date().toISOString()
        const res = await fetch(
          `/api/public/events?status=active&type=event&from=${encodeURIComponent(nowIso)}&limit=3`
        )
        const json = await res.json()
        setEvents(json.events || [])
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  if (loading) return null
  if (!events.length) return null

  return (
    <section className="py-10 sm:py-14 bg-background-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">אירועים מיוחדים בקרוב</h2>
            <p className="text-text-light/70 mt-1">הציצו באירועים הקרובים ושריינו מקום</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/events">לכל האירועים</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {events.map((e) => {
            const date = new Date(e.start_at)
            const capacityText =
              e.capacity != null
                ? `${e.registrations_count || 0} מתוך ${e.capacity}`
                : e.registrations_count != null
                ? `${e.registrations_count} נרשמו`
                : null
            return (
              <div
                key={e.id}
                className="bg-white border rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-primary">{e.title}</h3>
                </div>
                {e.description && (
                  <p className="text-sm text-text-light/70 line-clamp-2 mb-4">{e.description}</p>
                )}
                <div className="space-y-2 text-sm text-text-light/80 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>
                      {date.toLocaleDateString('he-IL', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                      })}{' '}
                      {date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {capacityText && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span>{capacityText}</span>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full bg-accent hover:bg-accent/90">
                  <Link href="/events">שריון מקום</Link>
                </Button>
              </div>
            )
          })}
        </div>

        <div className="mt-6 sm:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/events">לכל האירועים</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}





