'use client'

import { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReserveSlotDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (date: string, slot: string, slotEnd: string) => void
  loading?: boolean
  title?: string
  /** Optional info shown in the popup (e.g. "כרטיסייה: 5 כניסות") */
  contextLabel?: string
}

const HE_WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

function isoLocalDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function ReserveSlotDialog({ open, onClose, onConfirm, loading, title, contextLabel }: ReserveSlotDialogProps) {
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState(isoLocalDate(today))
  const [availability, setAvailability] = useState<any>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSlotEnd, setSelectedSlotEnd] = useState<string | null>(null)

  const dateOptions = useMemo(() => {
    const arr: Array<{ value: string; label: string; weekday: string }> = []
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      arr.push({
        value: isoLocalDate(d),
        label: `${d.getDate()}.${d.getMonth() + 1}`,
        weekday: i === 0 ? 'היום' : i === 1 ? 'מחר' : HE_WEEKDAYS[d.getDay()],
      })
    }
    return arr
  }, [])

  useEffect(() => {
    if (!open) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    setSelectedSlotEnd(null)
    fetch(`/api/playground/availability?date=${selectedDate}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setAvailability(data))
      .catch(() => setAvailability(null))
      .finally(() => setSlotsLoading(false))
  }, [open, selectedDate])

  useEffect(() => {
    if (!open) {
      setSelectedSlot(null)
      setSelectedSlotEnd(null)
      setAvailability(null)
      setSelectedDate(isoLocalDate(new Date()))
    }
  }, [open])

  if (!open) return null

  const formatSelectedDateHeb = (iso: string) => {
    const d = new Date(`${iso}T00:00:00`)
    return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={() => { if (!loading) onClose() }}
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-lg font-bold text-primary">{title || 'שריון משבצת זמן'}</h3>
          </div>
          <button onClick={() => { if (!loading) onClose() }} aria-label="סגור" className="text-primary/50 hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {contextLabel && (
          <p className="text-xs text-text-light/70 mb-3">{contextLabel}</p>
        )}

        {/* Date picker — next 7 days */}
        <div className="mb-3">
          <div className="text-xs text-primary/70 mb-1.5 font-medium">תאריך</div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {dateOptions.map(opt => {
              const isSel = selectedDate === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setSelectedDate(opt.value)}
                  disabled={loading}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium border-2 transition-all min-w-[64px] text-center ${
                    isSel
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white border-gray-200 text-primary hover:border-accent/50'
                  } disabled:opacity-50`}
                >
                  <div className="leading-tight">{opt.weekday}</div>
                  <div className="text-[10px] opacity-80">{opt.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Slots */}
        <div className="text-xs text-primary/70 mb-1.5 font-medium">משבצת זמן</div>
        {slotsLoading ? (
          <div className="py-4 text-center text-xs text-primary/60">
            <Loader2 className="w-4 h-4 animate-spin inline-block ml-1" />
            טוען שעות...
          </div>
        ) : availability?.closed ? (
          <div className="py-3 text-center text-xs text-red-600 bg-red-50 rounded">
            {availability.message || 'סגור בתאריך זה'}
          </div>
        ) : !availability?.slots?.length ? (
          <div className="py-3 text-center text-xs text-primary/60">אין משבצות זמינות</div>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {availability.slots.map((slot: any) => {
              const available = slot.max - slot.active
              const isBlocked = slot.blocked || available <= 0
              const isSelected = selectedSlot === slot.start
              return (
                <button
                  key={slot.start}
                  onClick={() => { if (!isBlocked) { setSelectedSlot(slot.start); setSelectedSlotEnd(slot.end) } }}
                  disabled={isBlocked || loading}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
                    isBlocked
                      ? 'bg-red-50 text-red-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-accent text-white ring-2 ring-accent ring-offset-1'
                      : 'bg-background hover:bg-accent/10 text-primary border border-transparent hover:border-accent/30'
                  }`}
                >
                  <span className="font-medium">{slot.start} - {slot.end}</span>
                  <span className={isBlocked ? 'text-red-400' : isSelected ? 'text-white/80' : 'text-primary/60'}>
                    {isBlocked
                      ? (slot.showTitle ? `${slot.showTitle}` : available <= 0 ? 'מלא' : 'חסום')
                      : `${available} פנויים`}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Summary + actions */}
        {selectedSlot && (
          <div className="mt-3 p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm text-text-light">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span className="font-medium">{formatSelectedDateHeb(selectedDate)}</span>
              <span className="text-accent font-bold">· {selectedSlot}{selectedSlotEnd ? ` - ${selectedSlotEnd}` : ''}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => { if (selectedSlot && selectedSlotEnd) onConfirm(selectedDate, selectedSlot, selectedSlotEnd) }}
            disabled={!selectedSlot || loading}
            className="flex-1"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin ml-1" />משריין...</> : 'אישור שריון'}
          </Button>
          <Button variant="outline" onClick={() => { if (!loading) onClose() }} disabled={loading} className="flex-1">
            ביטול
          </Button>
        </div>
      </div>
    </div>
  )
}
