'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Handle auth session from Supabase recovery link
  useEffect(() => {
    const establishSession = async () => {
      // Case 1: PKCE flow - code in URL search params
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        // Clean URL
        window.history.replaceState({}, '', '/reset-password')
      }

      // Case 2: Implicit flow - tokens in hash fragment
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        // Supabase client auto-detects hash fragments
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Check if we have a session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
      } else {
        setError('הקישור פג תוקף או שגוי. נסו לבקש איפוס סיסמה מחדש.')
      }
    }

    establishSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'שגיאה בעדכון הסיסמה')
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
          <h1 className="text-3xl font-bold text-primary mb-2">איפוס סיסמה</h1>
          <p className="text-text-light/70">הזינו סיסמה חדשה לחשבון שלכם</p>
        </div>

        <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center text-3xl">
                ✓
              </div>
              <h2 className="text-xl font-bold text-primary">הסיסמה עודכנה בהצלחה!</h2>
              <p className="text-text-light/70 text-sm">מעביר אותך לדף ההתחברות...</p>
            </div>
          ) : !sessionReady && !error ? (
            <div className="text-center space-y-4 py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="text-text-light/70 text-sm">מאמת את הקישור...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">
                  סיסמה חדשה
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none"
                  placeholder="לפחות 6 תווים"
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary mb-1">
                  אימות סיסמה חדשה
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none"
                  placeholder="הזינו שוב את הסיסמה"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? 'מעדכן...' : 'עדכן סיסמה'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-text-light/70">
            <Link href="/login" className="text-accent hover:underline font-medium">
              חזרה להתחברות
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
