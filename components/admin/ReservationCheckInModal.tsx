'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, CreditCard, Banknote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type PaymentMethod = 'cash' | 'credit' | 'bit' | 'other'

interface ReservationData {
  id: string
  seats: number
  status: string
  qr_code: string
  reserved_at: string
  checked_in_at: string | null
  payment_id: string | null
  user: { full_name: string; phone: string; email: string } | null
  event: { title: string; type: string; start_at: string; end_at: string; price: number | null; capacity: number | null }
}

interface Props {
  reservation: ReservationData
  onClose: () => void
}

export function ReservationCheckInModal({ reservation, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [done, setDone] = useState(false)

  const start = new Date(reservation.event.start_at)
  const price = reservation.event.price || 0
  const amount = price * (reservation.seats || 1)

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/checkin-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: reservation.qr_code,
          payment_method: method,
        }),
        credentials: 'include',
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'שגיאה באישור הגעה')
      setDone(true)
      setTimeout(() => window.location.reload(), 700)
    } catch (e: any) {
      alert(e.message || 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full sm:max-w-xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          >
            <div className="bg-background-light rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none shadow-2xl p-4 sm:p-6 relative" dir="rtl">
              <button
                onClick={onClose}
                className="absolute top-3 left-3 text-text-light/50 hover:text-text-light transition-colors"
                aria-label="סגור"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-primary">אישור שריון</h2>
                <p className="text-text-light/70 text-sm">סריקה לפי QR שריון</p>
              </div>

              <Card className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-primary">{reservation.event.title}</div>
                    <div className="text-sm text-text-light/70">
                      {start.toLocaleDateString('he-IL', { weekday: 'long', day: '2-digit', month: '2-digit' })}{' '}
                      {start.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Badge className="text-xs">{reservation.status}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">לקוח:</span>
                    <div className="font-medium">{reservation.user?.full_name || 'לא ידוע'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">מקומות:</span>
                    <div className="font-medium">{reservation.seats}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">סכום לתשלום:</span>
                    <div className="font-bold text-accent">₪{amount}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">QR:</span>
                    <div className="font-mono text-xs">{reservation.qr_code}</div>
                  </div>
                </div>
              </Card>

              <div className="mt-4">
                <p className="font-semibold text-primary mb-2">אמצעי תשלום (POS)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button variant={method === 'cash' ? 'default' : 'outline'} onClick={() => setMethod('cash')} className="gap-2">
                    <Banknote className="w-4 h-4" /> מזומן
                  </Button>
                  <Button variant={method === 'credit' ? 'default' : 'outline'} onClick={() => setMethod('credit')} className="gap-2">
                    <CreditCard className="w-4 h-4" /> אשראי
                  </Button>
                  <Button variant={method === 'bit' ? 'default' : 'outline'} onClick={() => setMethod('bit')} className="gap-2">
                    ₿ Bit
                  </Button>
                  <Button variant={method === 'other' ? 'default' : 'outline'} onClick={() => setMethod('other')} className="gap-2">
                    <CreditCard className="w-4 h-4" /> אחר
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                  סגור
                </Button>
                <Button
                  className="flex-1 bg-accent hover:bg-accent/90 gap-2"
                  onClick={handleCheckIn}
                  disabled={loading || done}
                >
                  <CheckCircle className="w-4 h-4" />
                  {done ? 'אושר!' : loading ? 'מעבד...' : 'אשר הגעה + תשלום'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  )
}


