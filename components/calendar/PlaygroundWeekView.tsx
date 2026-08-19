'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, Theater, Moon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface WeekSlot {
  start: string
  end: string
  active: number
  max: number
  blocked: boolean
  blockReason?: string
  showTitle?: string
}

interface WeekDay {
  date: string
  weekday: string
  closed: boolean
  message: string | null
  slots: WeekSlot[]
}

interface WeekData {
  today: string
  days: WeekDay[]
  cardTypeId: string | null
  cardTypePrice: number | null
}

/**
 * לוח זמינות שבועי למשחקייה: עמודות ימים, שורות חלונות זמן,
 * בכל משבצת — כמה מקומות נותרו, ולחיצה קונה כניסה לחלון הזה.
 */
export function PlaygroundWeekView() {
  const [data, setData] = useState<WeekData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/playground/availability/week')
      .then(r => (r.ok ? r.json() : null))
      .then(d => d && setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!data || !data.days?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-text-light/70">
          לוח הזמינות אינו זמין כרגע — נסו לרענן את העמוד
        </CardContent>
      </Card>
    )
  }

  // איחוד כל חלונות הזמן מכל הימים לשורות הטבלה
  const slotKeys = new Map<string, string>() // start -> end
  for (const day of data.days) {
    for (const s of day.slots) {
      if (!slotKeys.has(s.start)) slotKeys.set(s.start, s.end)
    }
  }
  const rows = [...slotKeys.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  // השעה עכשיו בישראל — לסימון חלונות שכבר עברו היום
  const nowIsrael = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  })

  const formatDayDate = (date: string) => {
    const d = new Date(`${date}T12:00:00+03:00`)
    return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', timeZone: 'Asia/Jerusalem' })
  }

  const renderCell = (day: WeekDay, start: string) => {
    const base = 'flex flex-col items-center justify-center min-h-[52px] rounded-xl text-xs px-1 py-1.5'

    if (day.closed) {
      return <div className={`${base} bg-background/60 text-text-light/30`}>—</div>
    }

    const slot = day.slots.find(s => s.start === start)
    if (!slot) {
      return <div className={`${base} bg-background/60 text-text-light/30`}>—</div>
    }

    const isPastToday = day.date === data.today && slot.end <= nowIsrael
    if (isPastToday) {
      return <div className={`${base} bg-background/60 text-text-light/30`}>עבר</div>
    }

    if (slot.blocked) {
      return (
        <div className={`${base} bg-secondary/15 text-secondary`} title={slot.showTitle || ''}>
          <Theater className="w-3.5 h-3.5 mb-0.5" />
          <span className="leading-tight text-center line-clamp-2">{slot.showTitle || 'הצגה'}</span>
        </div>
      )
    }

    const remaining = Math.max(0, slot.max - slot.active)

    if (remaining === 0) {
      return <div className={`${base} bg-error/10 text-error font-medium`}>מלא</div>
    }

    const almostFull = remaining <= 5
    const tone = almostFull
      ? 'bg-[#F5A219]/15 text-[#9A6400] hover:bg-[#F5A219]/25'
      : 'bg-accent/10 text-accent hover:bg-accent/20'

    const href = data.cardTypeId
      ? `/checkout?item=${data.cardTypeId}&type=pass&slot=${encodeURIComponent(start)}&date=${day.date}`
      : '/passes'

    return (
      <Link
        href={href}
        className={`${base} ${tone} transition-colors font-medium cursor-pointer`}
        title={`${day.weekday} ${formatDayDate(day.date)} · ${start}-${slotKeys.get(start)}`}
      >
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {remaining}
        </span>
        <span className="text-[10px] opacity-80">{almostFull ? 'אחרונים!' : 'נותרו'}</span>
      </Link>
    )
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <table className="w-full border-separate border-spacing-1.5 min-w-[640px]" dir="rtl">
          <thead>
            <tr>
              <th className="w-24 min-w-24">
                <div className="flex items-center justify-center gap-1 text-xs text-text-light/60 font-normal">
                  <Clock className="w-3.5 h-3.5" />
                  שעות
                </div>
              </th>
              {data.days.map(day => (
                <th key={day.date} className="min-w-[76px]">
                  <div
                    className={`rounded-xl py-2 px-1 ${
                      day.date === data.today ? 'bg-primary text-primary-foreground' : 'bg-background-light text-primary'
                    }`}
                  >
                    <div className="text-sm font-bold">{day.weekday}</div>
                    <div className="text-xs opacity-80" suppressHydrationWarning>{formatDayDate(day.date)}</div>
                    {day.closed && (
                      <div className="text-[10px] mt-0.5 opacity-70 flex items-center justify-center gap-0.5">
                        <Moon className="w-3 h-3" />
                        {day.message || 'סגור'}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([start, end]) => (
              <tr key={start}>
                <td className="text-center">
                  <div className="text-xs font-medium text-primary whitespace-nowrap" dir="ltr">
                    {start}–{end}
                  </div>
                </td>
                {data.days.map(day => (
                  <td key={day.date}>{renderCell(day, start)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* מקרא */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4 text-xs text-text-light/70">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-accent/20 border border-accent/40" />
          פנוי — לחיצה לרכישה
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#F5A219]/25 border border-[#F5A219]/50" />
          מקומות אחרונים
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-error/15 border border-error/40" />
          מלא
        </span>
        <span className="flex items-center gap-1.5">
          <Theater className="w-3.5 h-3.5 text-secondary" />
          הצגה
        </span>
        {data.cardTypePrice && (
          <span className="font-medium text-primary">כניסה: ₪{data.cardTypePrice}</span>
        )}
      </div>
    </div>
  )
}
