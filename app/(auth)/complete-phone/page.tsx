'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Phone } from 'lucide-react'
import { isValidIsraeliMobile } from '@/lib/phone'

const inputClass =
  'w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none'

function CompletePhoneContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const redirectTarget = searchParams.get('redirect') || '/my-account'

  const [checking, setChecking] = useState(true)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      setChecking(false)
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!isValidIsraeliMobile(phone)) {
      setError('יש להזין מספר נייד ישראלי תקין, למשל 050-1234567')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/set-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.success) {
        setError(data?.message || 'שגיאה בשמירת הטלפון, נסו שוב')
        return
      }
      window.location.href = redirectTarget
    } catch {
      setError('שגיאה בשמירת הטלפון, נסו שוב')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <Image src="/logo.svg" alt="CoffeeLand" width={96} height={96} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">עוד צעד אחד!</h1>
          <p className="text-text-light/70">
            מהיום נכנסים לאיזור האישי עם מספר טלפון בלבד — עדכנו אותו כאן פעם אחת
          </p>
        </div>

        <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1">
                מספר טלפון נייד
              </label>
              <div className="relative">
                <Phone className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-text-light/40 pointer-events-none" />
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${inputClass} pr-9`}
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'שומר...' : 'שמירה והמשך'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default function CompletePhonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <CompletePhoneContent />
    </Suspense>
  )
}
