'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Lock, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TimeSlot {
  start: string
  end: string
  active: number
  max: number
  blocked: boolean
  blockReason?: string
  showTitle?: string
}

interface PlaygroundData {
  closed: boolean
  date: string
  businessHours: { open: string; close: string }
  currentOccupancy: number
  maxConcurrent: number
  availableNow: number
  currentlyBlocked: boolean
  currentBlockReason: string
  maxMinutesAvailable: number
  nextShow: { title: string; startsAt: string; blockFrom: string } | null
  slots: TimeSlot[]
}

export function PlaygroundAvailability() {
  const [data, setData] = useState<PlaygroundData | null>(null)

  useEffect(() => {
    fetch('/api/playground/availability')
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setData(d))
      .catch(() => {})

    // Refresh every 2 minutes
    const interval = setInterval(() => {
      fetch('/api/playground/availability')
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setData(d))
        .catch(() => {})
    }, 120000)

    return () => clearInterval(interval)
  }, [])

  if (!data || data.closed) return null

  // Find current time slot
  const now = new Date()
  const nowStr = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jerusalem' })

  return (
    <section className="py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            זמינות הג׳ימבורי
          </h2>
          <p className="text-text-light/70 text-sm">
            שעות פעילות: {data.businessHours.open}-{data.businessHours.close} | עדכון שוטף
          </p>
        </div>

        {/* Current Status Banner */}
        <div className={`rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-5 mb-6 ${
          data.currentlyBlocked ? 'bg-red-50 border-2 border-red-200' :
          data.availableNow <= 3 ? 'bg-amber-50 border-2 border-amber-200' :
          'bg-green-50 border-2 border-green-200'
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {data.currentlyBlocked ? (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-red-500" />
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  data.availableNow <= 3 ? 'bg-amber-100' : 'bg-green-100'
                }`}>
                  <Users className={`w-6 h-6 ${
                    data.availableNow <= 3 ? 'text-amber-500' : 'text-green-600'
                  }`} />
                </div>
              )}
              <div>
                <div className="font-bold text-lg">
                  {data.currentlyBlocked
                    ? data.currentBlockReason
                    : data.availableNow === 0
                    ? 'הג׳ימבורי מלא כרגע'
                    : `${data.availableNow} מקומות פנויים`
                  }
                </div>
                <div className="text-sm text-text-light/70">
                  {data.currentlyBlocked
                    ? 'לא ניתן להיכנס בזמן הצגה'
                    : `${data.currentOccupancy} מתוך ${data.maxConcurrent} בפנים עכשיו`
                  }
                </div>
              </div>
            </div>
            {!data.currentlyBlocked && data.availableNow > 0 && (
              <Button asChild size="sm">
                <Link href="/passes">רכישת כניסה</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {data.slots.map((slot, i) => {
            const pct = slot.max > 0 ? Math.round((slot.active / slot.max) * 100) : 0
            const isCurrent = nowStr >= slot.start && nowStr < slot.end

            return (
              <div
                key={i}
                className={`rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none p-3 text-center transition-all ${
                  slot.blocked ? 'bg-red-50 border-2 border-red-200' :
                  isCurrent ? 'bg-accent/10 border-2 border-accent shadow-md' :
                  pct >= 90 ? 'bg-amber-50 border border-amber-200' :
                  'bg-white border border-border'
                }`}
              >
                <div className="text-xs font-medium text-text-light/60 mb-1">
                  {slot.start}
                </div>
                <div className="text-xs text-text-light/40 mb-2">
                  עד {slot.end}
                </div>

                {slot.blocked ? (
                  <>
                    <Lock className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    <div className="text-[10px] text-red-500 font-medium leading-tight">
                      הצגה
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`text-xl font-bold ${
                      pct >= 90 ? 'text-red-500' :
                      pct >= 70 ? 'text-amber-500' :
                      'text-green-600'
                    }`}>
                      {slot.max - slot.active}
                    </div>
                    <div className="text-[10px] text-text-light/50">
                      פנויים
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${
                          pct >= 90 ? 'bg-red-400' :
                          pct >= 70 ? 'bg-amber-400' :
                          'bg-green-400'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </>
                )}

                {isCurrent && !slot.blocked && (
                  <div className="text-[10px] text-accent font-bold mt-1">עכשיו</div>
                )}
              </div>
            )
          })}
        </div>

        {data.nextShow && !data.currentlyBlocked && (
          <div className="mt-4 text-center text-sm text-amber-700 bg-amber-50 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 inline ml-1" />
            שימו לב: הצגה &quot;{data.nextShow.title}&quot; מתחילה בקרוב - הג׳ימבורי ייסגר לכניסות
          </div>
        )}
      </div>
    </section>
  )
}
