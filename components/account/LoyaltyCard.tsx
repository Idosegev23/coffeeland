'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coffee } from 'lucide-react'

interface LoyaltyCardProps {
  totalStamps: number
  redeemedCoffees: number
}

export function LoyaltyCard({ totalStamps, redeemedCoffees }: LoyaltyCardProps) {
  const currentStamps = totalStamps % 10
  const canRedeem = currentStamps === 0 && totalStamps > 0
  const progress = (currentStamps / 10) * 100

  return (
    <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Coffee className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold text-text-dark">כרטיסיית נאמנות קפה</h3>
          </div>
          <p className="text-sm text-text-dark/70">
            10 חותמות = קפה חינם ☕
          </p>
        </div>

        {/* Stamps Grid */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: 10 }).map((_, index) => {
            const hasStamp = index < currentStamps

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  scale: hasStamp ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`
                  aspect-square rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none
                  flex items-center justify-center
                  ${hasStamp ? 'bg-accent' : 'bg-background-light/20 border-2 border-background-light/30'}
                `}
              >
                {hasStamp ? (
                  <div className="w-full h-full p-1 relative">
                    <Image
                      src="/logo.svg"
                      alt="CoffeeLand Stamp"
                      fill
                      className="object-contain opacity-90"
                    />
                  </div>
                ) : (
                  <Coffee className="w-4 h-4 sm:w-5 sm:h-5 text-text-dark/30" />
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm text-text-dark/80">
            <span>{currentStamps}/10 חותמות</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-background-light/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-text-dark/20">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-accent">{totalStamps}</div>
            <div className="text-xs text-text-dark/70">סה"כ חותמות</div>
          </div>
          <div className="w-px h-10 bg-text-dark/20" />
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-accent">{redeemedCoffees}</div>
            <div className="text-xs text-text-dark/70">קפה מומש</div>
          </div>
        </div>

        {/* Ready Badge */}
        {canRedeem && (
          <Badge className="w-full justify-center py-2 bg-accent text-accent-foreground">
            🎉 מוכן למימוש! הראה לצוות
          </Badge>
        )}
      </div>
    </Card>
  )
}

