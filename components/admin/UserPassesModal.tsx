'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coffee, Ticket, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Pass {
  id: string
  type: string
  total_entries: number
  remaining_entries: number
  expiry_date: string | null
}

interface UserData {
  user: {
    id: string
    full_name: string
    email: string
    qr_code: string
  }
  passes: Pass[]
  loyaltyCard: {
    id: string
    total_stamps: number
    redeemed_coffees: number
  } | null
}

interface UserPassesModalProps {
  user: UserData
  onClose: () => void
}

const typeLabels: Record<string, string> = {
  playground: 'משחקייה',
  workshop: 'סדנה',
  event: 'אירוע',
}

export function UserPassesModal({ user: userData, onClose }: UserPassesModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleUsePass = async (passId: string) => {
    setLoading(passId)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/use-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'שגיאה בניצול')
      }

      const data = await response.json()
      setSuccess(passId)
      
      // Force full reload immediately
      setTimeout(() => {
        window.location.href = window.location.href
      }, 500)
    } catch (err: any) {
      alert(err.message)
      setLoading(null)
    }
  }

  const handleAddStamp = async () => {
    setLoading('stamp')
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/add-stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userData.user.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'שגיאה בהוספת חותמת')
      }

      setSuccess('stamp')
      
      // Force full reload immediately
      setTimeout(() => {
        window.location.href = window.location.href
      }, 500)
    } catch (err: any) {
      alert(err.message)
      setLoading(null)
    }
  }

  const handleRedeemCoffee = async () => {
    if (!userData.loyaltyCard) return
    
    setLoading('redeem')
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/redeem-coffee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loyaltyCardId: userData.loyaltyCard.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'שגיאה במימוש')
      }

      setSuccess('redeem')
      
      // Force full reload immediately
      setTimeout(() => {
        window.location.href = window.location.href
      }, 500)
    } catch (err: any) {
      alert(err.message)
      setLoading(null)
    }
  }

  return (
    <AnimatePresence>
      <>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-primary/50 backdrop-blur-sm z-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
          >
            <div className="bg-background-light rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none shadow-2xl p-4 sm:p-6 md:p-8 relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 text-text-light/50 hover:text-text-light transition-colors z-10"
              aria-label="סגור"
            >
              <X className="w-6 h-6 sm:w-5 sm:h-5" />
            </button>

            {/* User Info */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <span className="text-xl sm:text-2xl font-bold text-accent">
                  {userData.user.full_name.charAt(0)}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-1">
                {userData.user.full_name}
              </h2>
              <p className="text-xs sm:text-sm text-text-light/70">{userData.user.email}</p>
              <p className="text-xs text-text-light/50 font-mono mt-1">
                ID: {userData.user.qr_code}
              </p>
            </div>

            {/* Active Passes */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-primary mb-2 sm:mb-3 flex items-center gap-2">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                כרטיסיות פעילות ({userData.passes.length})
              </h3>

              {userData.passes.length === 0 ? (
                <Card className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none p-4 text-center bg-background">
                  <p className="text-text-light/70">אין כרטיסיות פעילות</p>
                </Card>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {userData.passes.map((pass) => (
                    <Card
                      key={pass.id}
                      className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none p-3 sm:p-4 bg-background"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className="text-xs">{typeLabels[pass.type] || pass.type}</Badge>
                            {pass.remaining_entries <= 2 && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs">
                                כמעט נגמר
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-text-light/80">
                            נותרו <span className="font-bold text-primary">{pass.remaining_entries}</span> מתוך {pass.total_entries}
                          </div>
                          {pass.expiry_date && (
                            <div className="text-xs text-text-light/60 mt-1">
                              תוקף עד: {new Date(pass.expiry_date).toLocaleDateString('he-IL')}
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => handleUsePass(pass.id)}
                          disabled={loading === pass.id || success === pass.id}
                          size="sm"
                          className="gap-2 w-full sm:w-auto"
                        >
                          {success === pass.id ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              נוצל!
                            </>
                          ) : (
                            'נצל כניסה'
                          )}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Loyalty Card */}
            {userData.loyaltyCard && (() => {
              const currentStamps = userData.loyaltyCard.total_stamps % 10
              const canRedeemCoffee = currentStamps === 0 && userData.loyaltyCard.total_stamps > 0
              
              return (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-primary mb-2 sm:mb-3 flex items-center gap-2">
                  <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                  כרטיסיית נאמנות
                </h3>

                <Card className="rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none p-3 sm:p-4 bg-background">
                  {/* Stamps Display */}
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const hasStamp = index < currentStamps
                      return (
                        <div
                          key={index}
                          className={`
                            w-6 h-6 sm:w-8 sm:h-8 rounded-tl-lg rounded-tr-lg rounded-bl-lg rounded-br-none
                            flex items-center justify-center
                            ${hasStamp ? 'bg-accent' : 'bg-background-light border border-border'}
                          `}
                        >
                          {hasStamp && (
                            <div className="w-full h-full p-1 relative">
                              <Image
                                src="/logo.svg"
                                alt=""
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-sm text-text-light/70">
                      {currentStamps}/10 חותמות • מומשו {userData.loyaltyCard.redeemed_coffees} קפה
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleAddStamp}
                      disabled={loading === 'stamp' || success === 'stamp' || currentStamps === 10}
                      variant="outline"
                      className="flex-1 gap-2 text-sm"
                    >
                      {success === 'stamp' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          נוסף!
                        </>
                      ) : (
                        <>
                          <Coffee className="w-4 h-4" />
                          הוסף חותמת
                        </>
                      )}
                    </Button>

                    {canRedeemCoffee && (
                      <Button
                        onClick={handleRedeemCoffee}
                        disabled={loading === 'redeem' || success === 'redeem'}
                        className="flex-1 gap-2 text-sm"
                      >
                        {success === 'redeem' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            מומש!
                          </>
                        ) : (
                          '🎉 מימוש קפה חינם'
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
              )
            })()}
            </div>
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  )
}

