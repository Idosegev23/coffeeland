'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Ticket, Calendar, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, getCurrentUser } from '@/lib/supabase'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface CardType {
  id: string
  name: string
  description: string
  type: string
  entries_count: number
  price: number
  sale_price?: number
  is_active: boolean
}

interface PassOption {
  id: string
  type: string
  name: string
  totalEntries: number
  price: number
  salePrice?: number
  description: string
  popular?: boolean
  lottie: string
}

function LottieIcon({ src }: { src: string }) {
  const [animationData, setAnimationData] = useState<any>(null)

  React.useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Error loading Lottie:', err))
  }, [src])

  if (!animationData) return <div className="w-full h-full" />

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default function PassesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [passOptions, setPassOptions] = useState<PassOption[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    loadCardTypes()
  }, [])

  const loadCardTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('card_types')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) throw error

      // המרה לפורמט PassOption
      const formatted: PassOption[] = (data || []).map((card: CardType, index: number) => ({
        id: card.id,
        type: card.type,
        name: card.name,
        totalEntries: card.entries_count,
        price: card.sale_price || card.price,
        salePrice: card.sale_price,
        description: card.description || '',
        popular: index === 0, // הראשון הכי פופולרי
        lottie: card.type === 'playroom' ? '/lottie/play.json' : 
                card.type === 'class' ? '/lottie/workshops.json' :
                card.type === 'workshop' ? '/lottie/workshops.json' :
                '/lottie/play.json'
      }))

      setPassOptions(formatted)
    } catch (err) {
      console.error('Error loading card types:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handlePurchase = async (pass: PassOption) => {
    setError('')
    setLoading(pass.id)

    try {
      // Check if user is logged in
      const user = await getCurrentUser()
      
      if (!user) {
        // Redirect to register
        router.push('/register')
        return
      }

      // Calculate expiry (3 or 6 months based on entries)
      const expiryMonths = pass.totalEntries >= 10 ? 6 : pass.totalEntries >= 5 ? 3 : 2
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + expiryMonths)

      // Create pass (mockup - no real payment)
      const { data, error: purchaseError } = await supabase
        .from('passes')
        .insert({
          user_id: user.id,
          card_type_id: pass.id,
          entries_used: 0,
          entries_remaining: pass.totalEntries,
          expiry_date: expiryDate.toISOString(),
          price_paid: pass.price,
          status: 'active',
        })
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Success! Redirect to my account
      alert('✅ הכרטיסייה נרכשה בהצלחה! (מוקאפ - ללא תשלום אמיתי)')
      router.push('/my-account')
    } catch (err: any) {
      setError(err.message || 'שגיאה ברכישה')
    } finally {
      setLoading(null)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-light/70">טוען כרטיסיות...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={400} height={400} className="absolute top-10 left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={350} height={350} className="absolute bottom-20 right-10 -rotate-12" />
        <Image src="/coffebeans.svg" alt="" width={180} height={180} className="absolute top-1/3 right-1/4 rotate-45" />
        <Image src="/coldshake2.svg" alt="" width={200} height={200} className="absolute bottom-1/4 left-1/4 -rotate-6" />
      </div>

      {/* Header */}
      <section className="relative py-12 sm:py-16 bg-background-light overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <Image src="/palmLeaf2.svg" alt="" width={200} height={200} className="absolute -top-10 right-20 rotate-45" />
          <Image src="/BananaLeaf1.svg" alt="" width={180} height={180} className="absolute bottom-10 -left-10 -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-4">
            <LottieIcon src="/lottie/play.json" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            כרטיסיות ומנויים
          </h1>
          <p className="text-xl text-text-light/70 max-w-3xl mx-auto">
            בחרו את הכרטיסייה המתאימה לכם וחסכו! כל כרטיסייה כוללת QR אישי לשימוש קל ונוח.
          </p>
        </div>
      </section>

      {/* Passes Grid */}
      <section className="relative py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700">
              {error}
            </div>
          )}

          {passOptions.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-text-light/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary mb-2">אין כרטיסיות זמינות כרגע</h3>
              <p className="text-text-light/70 mb-6">בקרוב יפורסמו כרטיסיות חדשות</p>
              <Link href="/">
                <Button>חזרה לדף הבית</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {passOptions.map((pass) => (
              <Card
                key={pass.id}
                className={`rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] relative ${
                  pass.popular ? 'ring-2 ring-accent ring-offset-2' : ''
                }`}
              >
                {pass.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    הכי פופולרי
                  </Badge>
                )}
                
                <div className="p-6 flex flex-col h-full">
                  {/* Lottie */}
                  <div className="w-16 h-16 mx-auto mb-4">
                    <LottieIcon src={pass.lottie} />
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-bold text-text-dark text-center mb-2">
                    {pass.name}
                  </h3>

                  {/* Price */}
                  <div className="text-3xl font-bold text-accent text-center mb-3">
                    ₪{pass.price}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-dark/80 text-center mb-4 flex-1">
                    {pass.description}
                  </p>

                  {/* Purchase Button */}
                  <Button
                    onClick={() => handlePurchase(pass)}
                    disabled={loading === pass.id}
                    className="w-full"
                    variant={pass.popular ? 'default' : 'secondary'}
                  >
                    {loading === pass.id ? 'רוכש...' : 'רכוש כרטיסייה'}
                  </Button>
                </div>
              </Card>
              ))}
            </div>
          )}

          {/* Info */}
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 bg-background-light">
              <h3 className="text-xl font-semibold text-primary mb-3">איך זה עובד?</h3>
              <ol className="text-right space-y-2 text-text-light/80">
                <li>1️⃣ הרשמו או התחברו למערכת</li>
                <li>2️⃣ בחרו את הכרטיסייה המתאימה</li>
                <li>3️⃣ קבלו QR אישי באיזור האישי שלכם</li>
                <li>4️⃣ הראו את ה-QR ב-CoffeeLand בכל ביקור</li>
                <li>5️⃣ הצוות שלנו יסרוק וינצל כניסה</li>
              </ol>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 bg-accent text-accent-foreground overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image src="/BananaLeaf1.svg" alt="" width={250} height={250} className="absolute -top-10 left-10 rotate-12" />
          <Image src="/palmLeaf2.svg" alt="" width={220} height={220} className="absolute -bottom-10 right-10 -rotate-45" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">רוצים לדעת עוד?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            יש שאלות על הכרטיסיות? נשמח לעזור!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link href="/">חזרה לדף הבית</Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent">
              <Link href="/login">התחבר לאיזור אישי</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

