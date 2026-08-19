'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, Phone, Ticket } from 'lucide-react'
import { isValidIsraeliMobile, normalizePhone } from '@/lib/phone'

interface AccountOption {
  id: string
  name: string
  masked_email: string
  remaining_entries: number
  last_purchase: string | null
}

const inputClass =
  'w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // תמיכה בשני שמות הפרמטרים שקיימים באתר (checkout שולח redirect, middleware שולח redirectTo)
  const redirectTarget = searchParams.get('redirect') || searchParams.get('redirectTo') || '/my-account'

  const [step, setStep] = useState<'phone' | 'choose' | 'notfound' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [accounts, setAccounts] = useState<AccountOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get('error') === 'link_expired'
      ? 'הלינק מהמייל כבר לא בתוקף — אבל אין צורך בו: פשוט הזינו את מספר הטלפון'
      : ''
  )
  const [emailForm, setEmailForm] = useState({ email: '', password: '' })

  const completeLogin = async (tokenHash: string) => {
    const { error: otpError } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: tokenHash,
    })
    if (otpError) throw otpError
    // window.location כדי שה-middleware יראה את הקוקיז החדשים
    window.location.href = redirectTarget
  }

  const submitPhone = async (selectedUserId?: string) => {
    setError('')
    if (!isValidIsraeliMobile(phone)) {
      setError('יש להזין מספר נייד ישראלי תקין, למשל 050-1234567')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhone(phone), user_id: selectedUserId }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok || !data) {
        setError(data?.message || 'שגיאה זמנית, נסו שוב')
        return
      }

      if (data.found === false) {
        setStep('notfound')
        return
      }

      if (data.accounts) {
        setAccounts(data.accounts)
        setStep('choose')
        return
      }

      if (data.token_hash) {
        await completeLogin(data.token_hash)
        return
      }

      setError('שגיאה זמנית, נסו שוב')
    } catch (err) {
      console.error('Phone login error:', err)
      setError('שגיאה בהתחברות, נסו שוב')
    } finally {
      setLoading(false)
    }
  }

  // כניסה חד-פעמית עם אימייל+סיסמה ללקוחות ותיקים בלי טלפון — ומשם להשלמת טלפון
  const submitEmailFallback = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailForm.email,
        password: emailForm.password,
      })
      if (authError || !data.user) {
        setError('אימייל או סיסמה שגויים')
        return
      }
      window.location.href = `/complete-phone?redirect=${encodeURIComponent(redirectTarget)}`
    } catch {
      setError('שגיאה בהתחברות, נסו שוב')
    } finally {
      setLoading(false)
    }
  }

  // לינק חד-פעמי למייל למי שלא זוכר סיסמה — מחזיר להשלמת טלפון
  const sendEmailLink = async () => {
    setError('')
    if (!emailForm.email) {
      setError('יש להזין כתובת אימייל')
      return
    }
    setLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      const next = `/complete-phone?redirect=${encodeURIComponent(redirectTarget)}`
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: emailForm.email,
        options: { emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(next)}` },
      })
      if (otpError) throw otpError
      setError('')
      alert('שלחנו לינק כניסה למייל — לחצו עליו כדי להמשיך')
    } catch {
      setError('שגיאה בשליחת הלינק, נסו שוב')
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
          <h1 className="text-3xl font-bold text-primary mb-2">התחברות</h1>
          <p className="text-text-light/70">גישה לאיזור האישי והכרטיסיות שלך</p>
        </div>

        <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
          {step === 'phone' && (
            <form onSubmit={(e) => { e.preventDefault(); submitPhone() }} className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1">
                  מספר טלפון
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'כניסה'}
              </Button>
            </form>
          )}

          {step === 'choose' && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-primary text-center mb-1">נמצאו כמה חשבונות</h2>
              <p className="text-sm text-text-light/70 text-center mb-3">בחרו את החשבון שלכם:</p>
              {accounts.map((account) => (
                <button
                  key={account.id}
                  disabled={loading}
                  onClick={() => submitPhone(account.id)}
                  className="w-full text-right p-4 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light hover:border-accent transition-colors disabled:opacity-50"
                >
                  <div className="font-bold text-primary">{account.name}</div>
                  <div className="text-xs text-text-light/60" dir="ltr">{account.masked_email}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-light/70">
                    <Ticket className="w-3.5 h-3.5" />
                    {account.remaining_entries > 0
                      ? `${account.remaining_entries} כניסות בכרטיסייה`
                      : 'אין כרטיסייה פעילה'}
                    {account.last_purchase && (
                      <span>· רכישה אחרונה {new Date(account.last_purchase).toLocaleDateString('he-IL')}</span>
                    )}
                  </div>
                </button>
              ))}
              {error && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={() => { setStep('phone'); setError('') }}
                className="w-full text-center text-sm text-text-light/60 hover:text-accent"
              >
                ← מספר אחר
              </button>
            </div>
          )}

          {step === 'notfound' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center text-3xl">
                🔍
              </div>
              <h2 className="text-xl font-bold text-primary">לא מצאנו חשבון עם המספר הזה</h2>
              <p className="text-text-light/70 text-sm" dir="ltr">{phone}</p>
              <div className="space-y-3 pt-2">
                <Button asChild className="w-full" size="lg">
                  <Link href={`/register?redirect=${encodeURIComponent(redirectTarget)}`}>הרשמה חדשה</Link>
                </Button>
                <button
                  onClick={() => { setStep('email'); setError('') }}
                  className="w-full text-center text-sm text-accent hover:underline font-medium"
                >
                  נרשמתי בעבר עם אימייל — השלמת מספר טלפון
                </button>
                <button
                  onClick={() => { setStep('phone'); setError('') }}
                  className="w-full text-center text-sm text-text-light/60 hover:text-accent"
                >
                  ← ניסיתי מספר אחר
                </button>
              </div>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={submitEmailFallback} className="space-y-4">
              <p className="text-sm text-text-light/70 text-center">
                כניסה חד-פעמית עם אימייל כדי להשלים מספר טלפון — מהפעם הבאה נכנסים עם הטלפון בלבד
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">אימייל</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  className={inputClass}
                  placeholder="your@email.com"
                  dir="ltr"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">סיסמה</label>
                <input
                  id="password"
                  type="password"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  className={inputClass}
                  placeholder="הזינו סיסמה"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? 'מתחבר...' : 'כניסה'}
              </Button>
              <button
                type="button"
                onClick={sendEmailLink}
                disabled={loading}
                className="w-full text-center text-sm text-accent hover:underline"
              >
                לא זוכר/ת סיסמה? שלחו לי לינק למייל
              </button>
              <button
                type="button"
                onClick={() => { setStep('phone'); setError('') }}
                className="w-full text-center text-sm text-text-light/60 hover:text-accent"
              >
                ← חזרה לכניסה עם טלפון
              </button>
            </form>
          )}

          {step === 'phone' && (
            <p className="mt-6 text-center text-sm text-text-light/70">
              עדיין אין לך חשבון?{' '}
              <Link href={`/register?redirect=${encodeURIComponent(redirectTarget)}`} className="text-accent hover:underline font-medium">
                הירשם כאן
              </Link>
            </p>
          )}
        </Card>

        <div className="flex items-center justify-between mt-6 text-sm">
          <Link href="/" className="text-text-light/60 hover:text-accent">
            ← חזרה לדף הבית
          </Link>
          <Link href="/admin-login" className="text-text-light/40 hover:text-accent text-xs">
            כניסת צוות
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
