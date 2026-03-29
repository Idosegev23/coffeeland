'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Suspense } from 'react'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.fullName.trim()) throw new Error('יש להזין שם מלא')

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      const redirectTo = redirect
        ? `${baseUrl}/auth/callback?next=${encodeURIComponent(redirect)}`
        : `${baseUrl}/auth/callback?next=/my-account`

      // Sign up with magic link (no password needed)
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
        },
      })

      if (authError) throw authError
      setMagicLinkSent(true)
    } catch (err: any) {
      setError(err.message || 'שגיאה בהרשמה. נסו שוב.')
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
          <p className="text-text-light/70">צרו חשבון ותתחילו ליהנות מהמשחקייה</p>
        </div>

        <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
          {magicLinkSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center text-3xl">
                ✉️
              </div>
              <h2 className="text-xl font-bold text-primary">כמעט סיימנו!</h2>
              <p className="text-text-light/70 text-sm">
                שלחנו לינק אימות ל-<br />
                <span className="font-medium text-primary" dir="ltr">{formData.email}</span>
              </p>
              <p className="text-text-light/70 text-sm">
                לחצו על הלינק במייל כדי להשלים את ההרשמה
              </p>
              <p className="text-text-light/50 text-xs">
                לא קיבלתם? בדקו את תיקיית הספאם
              </p>
              <button
                onClick={() => { setMagicLinkSent(false); setError('') }}
                className="text-accent hover:underline text-sm font-medium"
              >
                שלח שוב
              </button>
            </div>
          ) : (
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
                  className="w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none"
                  placeholder="שם פרטי ומשפחה"
                />
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
                  className="w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none"
                  placeholder="your@email.com"
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1">
                  טלפון
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none"
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? 'שולח...' : 'הרשמה - קבלו לינק במייל'}
              </Button>

              <p className="text-xs text-text-light/50 text-center">
                ללא סיסמה - ההתחברות תמיד דרך לינק שנשלח למייל
              </p>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-light/70">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-accent hover:underline font-medium">
              התחבר כאן
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
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
