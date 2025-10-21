'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { analytics } from '@/lib/analytics'
import { useAuth } from '@/components/auth/AuthProvider'

export function FloatingPassButton() {
  const router = useRouter()
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300)
    }

    // Initial check
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    analytics.floatingButtonClick()
    // If user is logged in, go to my-account, otherwise to passes page
    router.push(user ? '/my-account' : '/passes')
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-6 z-40"
          >
            <Button
              onClick={handleClick}
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-all h-14 px-6 gap-2 relative"
              aria-label="כרטיסיות ומנויים"
            >
              <Ticket className="w-5 h-5" />
              <span className="font-semibold">כרטיסייה</span>
              
              {/* Sale Badge (optional - can be controlled via CMS/env) */}
              {process.env.NEXT_PUBLIC_SHOW_SALE_BADGE === 'true' && (
                <Badge 
                  variant="warning" 
                  className="absolute -top-2 -right-2 animate-pulse"
                >
                  מבצע
                </Badge>
              )}
            </Button>

            {/* Pulse effect */}
            <div className="absolute inset-0 rounded-full bg-accent -z-10 animate-ping opacity-20" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

