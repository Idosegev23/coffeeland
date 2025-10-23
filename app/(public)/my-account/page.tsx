'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getCurrentUser } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QRCodeDisplay } from '@/components/account/QRCodeDisplay'
import { PassCard } from '@/components/account/PassCard'
import { LoyaltyCard } from '@/components/account/LoyaltyCard'
import { UsageHistory } from '@/components/account/UsageHistory'
import { LogOut, Plus, Ticket, Home } from 'lucide-react'

export default function MyAccountPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activePasses, setActivePasses] = useState<any[]>([])
  const [expiredPasses, setExpiredPasses] = useState<any[]>([])
  const [loyaltyCard, setLoyaltyCard] = useState<any>(null)
  const [usages, setUsages] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)

      // Load passes
      const { data: passesData } = await supabase
        .from('passes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('purchase_date', { ascending: false })

      if (passesData) {
        setActivePasses(passesData.filter((p: any) => p.status === 'active' && p.remaining_entries > 0))
        setExpiredPasses(passesData.filter((p: any) => p.status !== 'active' || p.remaining_entries === 0))
      }

      // Load loyalty
      const { data: loyaltyData } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle()

      setLoyaltyCard(loyaltyData)

      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    // Force a full page refresh to clear all state
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>טוען...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={400} height={400} className="absolute top-10 left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={350} height={350} className="absolute bottom-20 right-10 -rotate-12" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">שלום, {user.full_name}</h1>
            <p className="text-text-light/70">האיזור האישי שלך</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href="/">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">דף הבית</span>
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">יציאה</span>
            </Button>
          </div>
        </div>

        <QRCodeDisplay qrCode={user.qr_code} userName={user.full_name} />

        <Separator className="my-8" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-primary">כרטיסיות פעילות</h2>
          <Button size="sm" asChild>
            <Link href="/passes" className="gap-2">
              <Plus className="w-4 h-4" />
              רכוש
            </Link>
          </Button>
        </div>

        {activePasses.length === 0 ? (
          <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-8 text-center">
            <p className="text-text-light/70 mb-4">אין כרטיסיות פעילות</p>
            <Button asChild>
              <Link href="/passes">רכוש כרטיסייה</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {activePasses.map((pass) => (
              <PassCard
                key={pass.id}
                type={pass.type}
                totalEntries={pass.total_entries}
                remainingEntries={pass.remaining_entries}
                expiryDate={pass.expiry_date}
                purchaseDate={pass.purchase_date}
              />
            ))}
          </div>
        )}

        <Separator className="my-8" />

        <h2 className="text-2xl font-semibold text-primary mb-4">כרטיסיית נאמנות</h2>
        {loyaltyCard ? (
          <LoyaltyCard
            totalStamps={loyaltyCard.total_stamps}
            redeemedCoffees={loyaltyCard.redeemed_coffees}
          />
        ) : (
          <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 text-center">
            <p className="text-text-light/70">טוען...</p>
          </Card>
        )}
      </div>
    </div>
  )
}
