'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Hash } from 'lucide-react'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface PassCardProps {
  type: 'playground' | 'workshop' | 'event'
  totalEntries: number
  remainingEntries: number
  expiryDate?: string
  purchaseDate: string
}

const passConfig = {
  playground: {
    lottie: '/lottie/play.json',
    label: 'משחקייה',
    color: 'bg-accent',
  },
  workshop: {
    lottie: '/lottie/workshops.json',
    label: 'סדנאות',
    color: 'bg-secondary',
  },
  event: {
    lottie: '/lottie/birthday.json',
    label: 'אירועים',
    color: 'bg-primary',
  },
}

function LottieIcon({ src }: { src: string }) {
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Error loading Lottie:', err))
  }, [src])

  if (!animationData) return <div className="w-full h-full" />

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export function PassCard({ type, totalEntries, remainingEntries, expiryDate, purchaseDate }: PassCardProps) {
  const config = passConfig[type]
  const usagePercent = (remainingEntries / totalEntries) * 100
  const isExpiring = expiryDate && new Date(expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  return (
    <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-4">
      <div className="flex items-start gap-4">
        {/* Lottie Icon */}
        <div className="w-16 h-16 flex-shrink-0">
          <LottieIcon src={config.lottie} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="text-xs">{config.label}</Badge>
            {isExpiring && (
              <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                פג בקרוב!
              </Badge>
            )}
          </div>

          <h4 className="text-lg font-semibold text-text-dark mb-1">
            {totalEntries} כניסות
          </h4>

          {/* Progress */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-sm text-text-dark/80">
              <span>נותרו {remainingEntries} כניסות</span>
              <span>{Math.round(usagePercent)}%</span>
            </div>
            <div className="h-2 bg-background-light/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 rounded-full"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-1 text-xs text-text-dark/70">
            {expiryDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>תוקף עד: {new Date(expiryDate).toLocaleDateString('he-IL')}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              <span>נרכש ב-{new Date(purchaseDate).toLocaleDateString('he-IL')}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

