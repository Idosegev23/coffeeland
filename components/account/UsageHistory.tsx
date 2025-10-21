'use client'

import { Card } from '@/components/ui/card'
import { Clock, User } from 'lucide-react'

interface Usage {
  id: string
  passType: string
  usedAt: string
  adminName?: string
}

interface UsageHistoryProps {
  usages: Usage[]
}

const typeLabels: Record<string, string> = {
  playground: 'משחקייה',
  workshop: 'סדנה',
  event: 'אירוע',
}

export function UsageHistory({ usages }: UsageHistoryProps) {
  if (usages.length === 0) {
    return (
      <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 bg-background-light">
        <p className="text-center text-text-light/70">
          עדיין לא נוצלו כניסות
        </p>
      </Card>
    )
  }

  return (
    <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 bg-background-light">
      <h3 className="text-lg font-semibold text-primary mb-4">היסטוריית שימושים</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {usages.map((usage) => (
          <div
            key={usage.id}
            className="flex items-center justify-between p-3 bg-background rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="font-medium text-primary text-sm">
                  {typeLabels[usage.passType] || usage.passType}
                </div>
                <div className="text-xs text-text-light/60">
                  {new Date(usage.usedAt).toLocaleString('he-IL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
            
            {usage.adminName && (
              <div className="flex items-center gap-1 text-xs text-text-light/60">
                <User className="w-3 h-3" />
                <span>{usage.adminName}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

