'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getCurrentUser } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Scan, Users, Ticket, Coffee, Calendar, ShoppingCart, CreditCard, List } from 'lucide-react'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

function LottieIcon({ src }: { src: string }) {
  const [animationData, setAnimationData] = useState<any>(null)

  useEffect(() => {
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

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePasses: 0,
    todayScans: 0,
  })

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Check auth directly with supabase client
      const { data: { user }, error } = await supabase.auth.getUser()
      
      console.log('Admin page - auth check:', { user: user?.id, error })
      
      if (!user || error) {
        console.log('No user found, redirecting to login')
        router.push('/login')
        return
      }

      // Get user data from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUser(userData || { id: user.id, email: user.email })

      // Load stats
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const { count: passesCount } = await supabase
        .from('passes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { count: scansCount } = await supabase
        .from('pass_usages')
        .select('*', { count: 'exact', head: true })
        .gte('used_at', today.toISOString())

      setStats({
        totalUsers: usersCount || 0,
        activePasses: passesCount || 0,
        todayScans: scansCount || 0,
      })
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Force a full page refresh to clear all state
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-light/70">טוען פאנל ניהול...</p>
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
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-1">
            פאנל ניהול
          </h1>
          <p className="text-text-light/70">שלום, {user?.full_name} (מנהל)</p>
        </div>

        {/* Quick Scan Button */}
        <div className="mb-8">
          <Button
            size="lg"
            className="w-full sm:w-auto gap-3 text-lg py-6"
            asChild
          >
            <Link href="/admin/scan">
              <Scan className="w-6 h-6" />
              סרוק QR של לקוח
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">סטטיסטיקות</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12">
                  <LottieIcon src="/lottie/people.json" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-text-dark">{stats.totalUsers}</div>
                  <div className="text-sm text-text-dark/70">משתמשים רשומים</div>
                </div>
              </div>
            </Card>

            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12">
                  <LottieIcon src="/lottie/play.json" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-text-dark">{stats.activePasses}</div>
                  <div className="text-sm text-text-dark/70">כרטיסיות פעילות</div>
                </div>
              </div>
            </Card>

            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12">
                  <LottieIcon src="/lottie/fresh.json" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-text-dark">{stats.todayScans}</div>
                  <div className="text-sm text-text-dark/70">סריקות היום</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-4">פעולות מהירות</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* סריקת QR */}
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-6 justify-start"
              asChild
            >
              <Link href="/admin/scan" className="gap-4">
                <Scan className="w-8 h-8 text-accent" />
                <div className="text-right">
                  <div className="font-semibold">סריקת QR</div>
                  <div className="text-xs opacity-70">נצל כרטיסייה או הוסף חותמת</div>
                </div>
              </Link>
            </Button>

            {/* ניהול חוגים וסדנאות */}
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-6 justify-start"
              asChild
            >
              <Link href="/admin/events" className="gap-4">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="text-right">
                  <div className="font-semibold">חוגים וסדנאות</div>
                  <div className="text-xs opacity-70">ניהול אירועים + Google Calendar</div>
                </div>
              </Link>
            </Button>

            {/* POS - קופה */}
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-6 justify-start"
              asChild
            >
              <Link href="/admin/pos" className="gap-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
                <div className="text-right">
                  <div className="font-semibold">קופה (POS)</div>
                  <div className="text-xs opacity-70">מכירת כרטיסיות בקופה</div>
                </div>
              </Link>
            </Button>

            {/* ניהול סוגי כרטיסיות */}
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-6 justify-start"
              asChild
            >
              <Link href="/admin/card-types" className="gap-4">
                <Ticket className="w-8 h-8 text-purple-600" />
                <div className="text-right">
                  <div className="font-semibold">סוגי כרטיסיות</div>
                  <div className="text-xs opacity-70">צור ונהל סוגי כרטיסיות</div>
                </div>
              </Link>
            </Button>

            {/* ניהול לקוחות */}
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-6 justify-start"
              asChild
            >
              <Link href="/admin/customers" className="gap-4">
                <Users className="w-8 h-8 text-orange-600" />
                <div className="text-right">
                  <div className="font-semibold">ניהול לקוחות</div>
                  <div className="text-xs opacity-70">רשימת לקוחות וכרטיסיות</div>
                </div>
              </Link>
            </Button>

            {/* דוחות */}
            <Button
              variant="outline"
              size="lg"
              className="h-auto py-6 justify-start"
              asChild
            >
              <Link href="/admin/reports" className="gap-4">
                <List className="w-8 h-8 text-red-600" />
                <div className="text-right">
                  <div className="font-semibold">דוחות ואנליטיקס</div>
                  <div className="text-xs opacity-70">מעקב הכנסות ופעילות</div>
                </div>
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

