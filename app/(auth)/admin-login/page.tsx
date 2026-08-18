'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Lock } from 'lucide-react'

const inputClass =
  'w-full px-4 py-2 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none'

export default function AdminLoginPage() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (authError || !data.user) {
        setError('אימייל או סיסמה שגויים')
        return
      }

      const { data: adminData } = await supabase
        .from('admins')
        .select('is_active')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (!adminData?.is_active) {
        await supabase.auth.signOut()
        setError('המשתמש הזה אינו חשבון צוות')
        return
      }

      window.location.href = '/admin'
    } catch {
      setError('שגיאה בהתחברות, נסו שוב')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4">
            <Image src="/logo.svg" alt="CoffeeLand" width={96} height={96} />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
            <Lock className="w-6 h-6" />
            כניסת צוות
          </h1>
          <p className="text-text-light/70">כניסה למערכת הניהול עם אימייל וסיסמה</p>
        </div>

        <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">אימייל</label>
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
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">סיסמה</label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-text-light/60 hover:text-accent">
            ← כניסת לקוחות
          </Link>
        </div>
      </div>
    </div>
  )
}
