'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { generateQRCode } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

export default function SetupAdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const createAdmin = async () => {
    setLoading(true)
    setResult('יוצר אדמין...')

    try {
      const email = 'triroars@gmail.com'
      const password = '123456'
      const qrCode = generateQRCode()

      // Check if already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existing) {
        throw new Error('המשתמש כבר קיים! אפשר להתחבר ב-/login')
      }

      // Sign up the admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'TriRoars Admin',
          },
          emailRedirectTo: window.location.origin + '/admin',
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('נכשל ביצירת משתמש')

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name: 'TriRoars Admin',
          phone: '0501234567',
          qr_code: qrCode,
        })

      if (userError) throw userError

      // Create admin record
      const { error: adminError } = await supabase
        .from('admins')
        .insert({
          user_id: authData.user.id,
          is_active: true,
        })

      if (adminError) throw adminError

      // Create loyalty card
      await supabase
        .from('loyalty_cards')
        .insert({
          user_id: authData.user.id,
          total_stamps: 0,
          redeemed_coffees: 0,
        })

      setResult(`✅ האדמין נוצר בהצלחה!

📧 Email: ${email}
🔑 Password: ${password}
👤 User ID: ${authData.user.id}
📱 QR Code: ${qrCode}

אתה יכול עכשיו להתחבר ב-/login

⚠️ חשוב: אם יש אישור אימייל מופעל ב-Supabase, תצטרך לאשר את האימייל קודם.
כדי לכבות: Supabase Dashboard → Authentication → Providers → Email → Disable "Enable email confirmations"`)

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        router.push('/login')
      }, 5000)
    } catch (err: any) {
      setResult(`❌ שגיאה: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={300} height={300} className="absolute -top-10 -left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={250} height={250} className="absolute bottom-10 -right-10 -rotate-12" />
      </div>

      <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-8 max-w-md w-full relative z-10">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4">
            <Image src="/logo.svg" alt="CoffeeLand" width={80} height={80} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">הגדרת אדמין</h1>
          <p className="text-sm text-text-light/70">
            יצירת משתמש אדמין ראשון למערכת
          </p>
        </div>

        <Button
          onClick={createAdmin}
          disabled={loading || result.includes('✅')}
          size="lg"
          className="w-full mb-4"
        >
          {loading ? 'יוצר אדמין...' : result.includes('✅') ? 'נוצר בהצלחה ✓' : 'צור אדמין: triroars@gmail.com'}
        </Button>

        {result && (
          <div className={`p-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-sm whitespace-pre-wrap ${
            result.includes('✅') 
              ? 'bg-green-50 border-2 border-green-300 text-green-800' 
              : 'bg-red-50 border-2 border-red-300 text-red-700'
          }`}>
            {result}
          </div>
        )}

        {result.includes('✅') && (
          <p className="text-xs text-center text-text-light/60 mt-4">
            מועבר אוטומטית ל-/login בעוד מספר שניות...
          </p>
        )}
      </Card>
    </div>
  )
}
