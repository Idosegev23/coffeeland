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
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔐 Attempting login with:', formData.email)
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      console.log('Auth response:', { data, error: authError })

      if (authError) throw authError
      if (!data.user) throw new Error('התחברות נכשלה')

      console.log('✅ Logged in successfully! User ID:', data.user.id)

      // Check if admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('is_active')
        .eq('user_id', data.user.id)
        .maybeSingle()

      console.log('Admin check:', { adminData, adminError })

      // Redirect based on role
      const targetPath = adminData?.is_active ? '/admin' : '/my-account'
      console.log('🔀 Redirecting to:', targetPath)
      
      // Wait for session to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh router to pick up new session, then navigate
      router.refresh()
      await new Promise(resolve => setTimeout(resolve, 100))
      router.push(targetPath)
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message || 'שגיאה בהתחברות. נסו שוב.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={300} height={300} className="absolute -top-10 -left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={250} height={250} className="absolute bottom-10 -right-10 -rotate-12" />
        <Image src="/coldshake.svg" alt="" width={150} height={150} className="absolute top-1/2 left-20 rotate-6" />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <Image src="/logo.svg" alt="CoffeeLand" width={96} height={96} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">התחברות</h1>
          <p className="text-text-light/70">גישה לאיזור האישי והכרטיסיות שלך</p>
        </div>

        <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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

            {/* Password */}
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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-text-light/70">
            עדיין אין לך חשבון?{' '}
            <Link href="/register" className="text-accent hover:underline font-medium">
              הירשם כאן
            </Link>
          </p>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-text-light/60 hover:text-accent">
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  )
}

