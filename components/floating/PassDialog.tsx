'use client'

import { MessageCircle, Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { PassOption } from '@/types/calendar'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'
import { analytics } from '@/lib/analytics'

const passOptions: PassOption[] = [
  {
    id: 'pass-5',
    name: '5 כניסות',
    description: 'כרטיסייה ל-5 כניסות למשחקייה',
    price: 180,
    visits: 5,
    validityDays: 60,
    benefits: [
      'תקף ל-60 יום מרגע הרכישה',
      'ניתן לשימוש בכל ימות השבוע',
      'חיסכון של 20 ש"ח',
      'אין צורך בהזמנה מראש',
    ],
  },
  {
    id: 'pass-10',
    name: '10 כניסות',
    description: 'כרטיסייה ל-10 כניסות למשחקייה',
    price: 320,
    visits: 10,
    validityDays: 90,
    benefits: [
      'תקף ל-90 יום מרגע הרכישה',
      'ניתן לשימוש בכל ימות השבוע',
      'חיסכון של 80 ש"ח',
      'אין צורך בהזמנה מראש',
      'כולל כוס קפה חינם אחת לביקור',
    ],
    popular: true,
  },
  {
    id: 'pass-monthly',
    name: 'מנוי חודשי',
    description: 'כניסות בלתי מוגבלות למשחקייה',
    price: 499,
    visits: undefined, // unlimited
    validityDays: 30,
    benefits: [
      'כניסות בלתי מוגבלות למשחקייה',
      'תקף ל-30 יום',
      'ניתן לשימוש בכל ימות השבוע',
      'קפה חינם בכל ביקור',
      'הנחה של 10% על סדנאות',
      'עדיפות בהרשמה לאירועים',
    ],
  },
]

interface PassDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PassDialog({ open, onOpenChange }: PassDialogProps) {
  const handlePurchase = (pass: PassOption) => {
    const message = `שלום, אני מעוניין/ת לרכוש: ${pass.name} (${formatPrice(pass.price)})`
    const link = generateWhatsAppLink(
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972501234567',
      message
    )
    analytics.passOptionView(pass.name, pass.price)
    analytics.whatsappClick('pass_dialog', message)
    window.open(link, '_blank')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto sm:h-auto sm:max-h-[90vh]">
        <SheetHeader>
          <SheetTitle className="text-2xl">כרטיסיות ומנויים</SheetTitle>
          <SheetDescription>
            בחרו את הכרטיסייה המתאימה לכם וחסכו בעלויות הכניסה
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {passOptions.map((pass) => (
            <Card
              key={pass.id}
              className={pass.popular ? 'border-accent border-2' : ''}
            >
              {pass.popular && (
                <div className="bg-accent text-accent-foreground px-3 py-1 text-sm font-semibold text-center rounded-t-lg">
                  הכי פופולרי
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{pass.name}</CardTitle>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-accent">
                      {formatPrice(pass.price)}
                    </div>
                    {pass.visits && (
                      <div className="text-xs text-text-light/60">
                        {formatPrice(Math.round(pass.price / pass.visits))} לכניסה
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text-light/70">{pass.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Benefits */}
                <ul className="space-y-2">
                  {pass.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full gap-2"
                  variant={pass.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(pass)}
                >
                  <MessageCircle className="w-4 h-4" />
                  רכשו עכשיו
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-secondary/10 rounded-lg text-sm text-text-light/80">
          <p className="font-semibold text-primary mb-2">שימו לב:</p>
          <ul className="space-y-1 mr-4">
            <li>• כרטיסייה אישית ואינה ניתנת להעברה</li>
            <li>• כניסה אחת = ילד אחד למשך עד 3 שעות</li>
            <li>• כולל שתייה חמה אחת להורה</li>
            <li>• תקף בימי חול ובסופי שבוע</li>
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  )
}

