'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateWhatsAppLink } from '@/lib/utils'
import { analytics } from '@/lib/analytics'

const STORAGE_KEY = 'coffeeland-exit-intent-shown'
const DAYS_TO_WAIT = 7

export function ExitIntentDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if already shown
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown) {
      const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24)
      if (daysSince < DAYS_TO_WAIT) {
        return
      }
    }

    let hasShown = false

    // Mouse leave detection - only when cursor goes to address bar (top of viewport)
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasShown) return
      // Only trigger when mouse leaves from the top (going to address bar/tabs)
      if (e.clientY <= 0) {
        showDialog()
      }
    }

    const showDialog = () => {
      if (hasShown) return
      hasShown = true
      setIsOpen(true)
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
      analytics.exitIntentShown()
    }

    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    analytics.exitIntentDismiss()
  }

  const handleWhatsApp = () => {
    const message = 'שלום! אני רוצה לשמוע עוד על המבצעים והזמינות ב-CoffeeLand'
    const link = generateWhatsAppLink(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972501234567',
      message
    )
    analytics.exitIntentConvert('whatsapp')
    window.open(link, '_blank')
    handleClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-background-light rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none shadow-2xl p-6 sm:p-8 relative">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 left-4 text-text-light/50 hover:text-text-light transition-colors"
                aria-label="סגור"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-accent" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-3 mb-6">
                <h3 className="text-2xl font-bold text-primary">
                  רגע לפני שאתם יוצאים...
                </h3>
                <p className="text-text-light/80">
                  קבלו בוואטסאפ את התאריכים הפנויים לימי הולדת והמבצע השבועי על כרטיסיות
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleWhatsApp}
                  className="w-full gap-2"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  קבלו מידע בוואטסאפ
                </Button>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full"
                >
                  לא, תודה
                </Button>
              </div>

              {/* Small print */}
              <p className="text-xs text-text-light/50 text-center mt-4">
                לא נשלח לכם ספאם. רק מידע על זמינות ומבצעים מיוחדים.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

