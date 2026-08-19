'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { isValidIsraeliMobile } from '@/lib/phone'

const inputClass =
  'w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none'

function RegisterContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/my-account'
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailExists, setEmailExists] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })

  // הרשמה מיידית: החשבון נוצר בשרת ומתחברים באותו רגע — בלי מייל אימות.
  // (לינקים חד-פעמיים במייל נשרפו ע"י סורקי אבטחה ותקעו לקוחות בלופ)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailExists(false)

    if (!formData.fullName.trim()) {
      setError('יש להזין שם מלא')
      return
    }
    if (!isValidIsraeliMobile(formData.phone)) {
      setError('יש להזין מספר נייד ישראלי תקין, למשל 050-1234567')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok || !data) {
        if (data?.error === 'email_exists') setEmailExists(true)
        setError(data?.message || 'שגיאה בהרשמה, נסו שוב')
        return
      }

      if (data.token_hash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash: data.token_hash,
        })
        if (!otpError) {
          window.location.href = redirect
          return
        }
      }

      // fallback נדיר: החשבון נוצר אבל החיבור האוטומטי נכשל — כניסה עם הטלפון
      window.location.href = `/login?redirect=${encodeURIComponent(redirect)}`
    } catch {
      setError('שגיאה בהרשמה, נסו שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={300} height={300} className="absolute -top-10 -left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={250} height={250} className="absolute bottom-10 -right-10 -rotate-12" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <Image src="/logo.svg" alt="CoffeeLand" width={96} height={96} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">הרשמה ל-CoffeeLand</h1>
          <p className="text-text-light/70">רישום מהיר — ונכנסים מיד</p>
        </div>

        <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-primary mb-1">
                שם מלא
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={inputClass}
                placeholder="שם פרטי ומשפחה"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1">
                טלפון נייד
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
                placeholder="050-1234567"
                dir="ltr"
              />
              <p className="text-xs text-text-light/50 mt-1">איתו נכנסים לאיזור האישי</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">
                אימייל
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="your@email.com"
                dir="ltr"
              />
              <p className="text-xs text-text-light/50 mt-1">לקבלות ואישורי רכישה</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                {error}
                {emailExists && (
                  <div className="mt-2">
                    <Link
                      href={`/login?redirect=${encodeURIComponent(redirect)}`}
                      className="font-medium underline"
                    >
                      לעמוד הכניסה ←
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'הרשמה וכניסה'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-light/70">
            כבר יש לך חשבון?{' '}
            <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-accent hover:underline font-medium">
              כניסה עם טלפון
            </Link>
          </p>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-text-light/60 hover:text-accent">
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
