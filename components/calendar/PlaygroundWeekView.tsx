'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Users, Theater, Moon, Sparkles } from 'lucide-react'
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

const springy = 'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'

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
    return <Skeleton className="h-96 w-full rounded-[2rem]" />
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
    const base = 'flex flex-col items-center justify-center min-h-[64px] rounded-2xl text-xs px-1 py-2'

    // יום סגור / חלון לא קיים / עבר — משטח "שקוע" ושקט
    const recessed = `${base} bg-primary/[0.04] text-primary/25 shadow-[inset_0_1px_3px_rgba(76,44,33,0.06)]`

    if (day.closed) {
      return <div className={recessed}>—</div>
    }

    const slot = day.slots.find(s => s.start === start)
    if (!slot) {
      return <div className={recessed}>—</div>
    }

    const isPastToday = day.date === data.today && slot.end <= nowIsrael
    if (isPastToday) {
      return <div className={`${recessed} text-[11px]`}>עבר</div>
    }

    if (slot.blocked) {
      return (
        <div
          className={`${base} bg-secondary text-primary-foreground shadow-[0_2px_10px_-2px_rgba(141,90,64,0.5)]`}
          title={slot.showTitle || ''}
        >
          <Theater className="w-4 h-4 mb-0.5" />
          <span className="leading-tight text-center line-clamp-2 font-medium">{slot.showTitle || 'הצגה'}</span>
        </div>
      )
    }

    const remaining = Math.max(0, slot.max - slot.active)

    if (remaining === 0) {
      return (
        <div className={`${base} bg-error text-primary-foreground font-bold shadow-[0_2px_10px_-2px_rgba(185,78,72,0.5)]`}>
          מלא
        </div>
      )
    }

    const almostFull = remaining <= 5
    const href = data.cardTypeId
      ? `/checkout?item=${data.cardTypeId}&type=pass&slot=${encodeURIComponent(start)}&date=${day.date}`
      : '/passes'

    return (
      <Link
        href={href}
        className={`${base} ${springy} group cursor-pointer font-bold
          hover:-translate-y-1 active:scale-[0.97]
          ${almostFull
            ? 'bg-[#E8940F] text-white shadow-[0_3px_12px_-2px_rgba(232,148,15,0.55)] hover:shadow-[0_8px_20px_-4px_rgba(232,148,15,0.65)]'
            : 'bg-accent text-primary-foreground shadow-[0_3px_12px_-2px_rgba(95,97,76,0.5)] hover:shadow-[0_8px_20px_-4px_rgba(95,97,76,0.6)]'
          }`}
        title={`${day.weekday} ${formatDayDate(day.date)} · ${start}-${slotKeys.get(start)}`}
      >
        <span className={`flex items-center gap-1 text-lg leading-none ${springy} group-hover:scale-110`}>
          <Users className="w-4 h-4 opacity-80" />
          {remaining}
        </span>
        <span className="text-[10px] font-medium opacity-90 mt-1 flex items-center gap-0.5">
          {almostFull && <Sparkles className="w-3 h-3" />}
          {almostFull ? 'אחרונים!' : 'מקומות פנויים'}
        </span>
      </Link>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* מעטפת כפולה — מגש חיצוני + ליבה פנימית */}
      <div className="rounded-[2rem] bg-primary/[0.06] ring-1 ring-primary/10 p-2 sm:p-2.5">
        <div className="rounded-[calc(2rem-0.625rem)] bg-background-light shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_20px_50px_-20px_rgba(76,44,33,0.25)] px-3 py-4 sm:px-5 sm:py-6">

          <div className="overflow-x-auto pb-1">
            <table className="w-full border-separate border-spacing-2 min-w-[680px]" dir="rtl">
              <thead>
                <tr>
                  <th className="w-24 min-w-24">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-wider text-primary/50 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      שעות
                    </div>
                  </th>
                  {data.days.map(day => {
                    const isToday = day.date === data.today
                    return (
                      <th key={day.date} className="min-w-[80px]">
                        <div
                          className={`rounded-2xl py-2.5 px-1 ${springy} ${
                            isToday
                              ? 'bg-primary text-primary-foreground shadow-[0_6px_18px_-4px_rgba(76,44,33,0.45)]'
                              : day.closed
                                ? 'bg-primary/[0.04] text-primary/35'
                                : 'bg-background text-primary ring-1 ring-primary/10'
                          }`}
                        >
                          {isToday && (
                            <div className="text-[9px] uppercase tracking-[0.15em] opacity-80 mb-0.5">היום</div>
                          )}
                          <div className="text-sm font-bold leading-tight">{day.weekday}</div>
                          <div className={`text-xs ${isToday ? 'opacity-75' : 'opacity-60'}`} suppressHydrationWarning>
                            {formatDayDate(day.date)}
                          </div>
                          {day.closed && (
                            <div className="text-[10px] mt-1 flex items-center justify-center gap-0.5 opacity-80">
                              <Moon className="w-3 h-3" />
                              {day.message || 'סגור'}
                            </div>
                          )}
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map(([start, end]) => (
                  <tr key={start}>
                    <td className="text-center">
                      <div className="inline-block rounded-full bg-background px-2.5 py-1 ring-1 ring-primary/10 text-xs font-bold text-primary whitespace-nowrap" dir="ltr">
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
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 mt-5 pt-4 border-t border-primary/10 text-xs text-primary/70">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-accent shadow-sm" />
              פנוי — לחיצה לרכישה
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-[#E8940F] shadow-sm" />
              מקומות אחרונים
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-error shadow-sm" />
              מלא
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-secondary shadow-sm flex items-center justify-center">
                <Theater className="w-2.5 h-2.5 text-white" />
              </span>
              הצגה
            </span>
            {data.cardTypePrice && (
              <span className="rounded-full bg-primary text-primary-foreground px-3 py-1 font-bold">
                כניסה: ₪{data.cardTypePrice}
              </span>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  )
}
