'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Magic Link - primary login method
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      setError('יש להזין כתובת אימייל')
      return
    }
    setError('')
    setLoading(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback?next=/my-account`,
        },
      })
      if (magicError) throw magicError
      setMagicLinkSent(true)
    } catch (err: any) {
      setError(err.message || 'שגיאה בשליחת הלינק')
    } finally {
      setLoading(false)
    }
  }

  // Password login - fallback
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (authError) throw authError
      if (!data.user) throw new Error('התחברות נכשלה')

      const { data: adminData } = await supabase
        .from('admins')
        .select('is_active')
        .eq('user_id', data.user.id)
        .maybeSingle()

      const targetPath = adminData?.is_active ? '/admin' : '/my-account'
      await new Promise(resolve => setTimeout(resolve, 1000))
      window.location.href = targetPath
    } catch (err: any) {
      setError(err.message || 'שגיאה בהתחברות. נסו שוב.')
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
          {magicLinkSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 mx-auto bg-accent/20 rounded-full flex items-center justify-center text-3xl">
                ✉️
              </div>
              <h2 className="text-xl font-bold text-primary">בדקו את המייל!</h2>
              <p className="text-text-light/70 text-sm">
                שלחנו לינק התחברות ל-<br />
                <span className="font-medium text-primary" dir="ltr">{formData.email}</span>
              </p>
              <p className="text-text-light/50 text-xs">
                לא קיבלתם? בדקו את תיקיית הספאם
              </p>
              <button
                onClick={() => { setMagicLinkSent(false); setError('') }}
                className="text-accent hover:underline text-sm font-medium"
              >
                שלח שוב או נסה אימייל אחר
              </button>
            </div>
          ) : (
            <>
              {/* Magic Link Form - Primary */}
              <form onSubmit={handleMagicLink} className="space-y-4">
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

                {error && !showPassword && (
                  <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading && !showPassword ? 'שולח...' : 'שלח לי לינק התחברות'}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-light/50">או</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Password Login - Secondary */}
              {!showPassword ? (
                <button
                  onClick={() => setShowPassword(true)}
                  className="w-full text-center text-sm text-text-light/60 hover:text-accent transition-colors"
                >
                  התחברות עם סיסמה
                </button>
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
                      סיסמה
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none"
                      placeholder="הזינו סיסמה"
                    />
                  </div>

                  {error && showPassword && (
                    <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <Button type="submit" disabled={loading} className="w-full" variant="secondary">
                    {loading ? 'מתחבר...' : 'התחבר עם סיסמה'}
                  </Button>
                </form>
              )}
            </>
          )}

          <p className="mt-6 text-center text-sm text-text-light/70">
            עדיין אין לך חשבון?{' '}
            <Link href="/register" className="text-accent hover:underline font-medium">
              הירשם כאן
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
