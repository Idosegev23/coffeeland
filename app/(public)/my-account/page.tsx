'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QRCodeDisplay } from '@/components/account/QRCodeDisplay'
import { PassCard } from '@/components/account/PassCard'
import { LoyaltyCard } from '@/components/account/LoyaltyCard'
import { UsageHistory } from '@/components/account/UsageHistory'
import { Plus, Ticket, Calendar, Clock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function MyAccountPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activePasses, setActivePasses] = useState<any[]>([])
  const [expiredPasses, setExpiredPasses] = useState<any[]>([])
  const [loyaltyCard, setLoyaltyCard] = useState<any>(null)
  const [usages, setUsages] = useState<any[]>([])
  const [registrations, setRegistrations] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Check auth directly with supabase client
      const { data: { user }, error } = await supabase.auth.getUser()
      
      console.log('My Account - auth check:', { user: user?.id, error })
      
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

      const currentUser = userData || { id: user.id, email: user.email }
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

      // Load registrations
      const { data: registrationsData } = await supabase
        .from('registrations')
        .select(`
          id,
          status,
          registered_at,
          event:events(
            id,
            title,
            description,
            type,
            start_at,
            end_at,
            price
          )
        `)
        .eq('user_id', currentUser.id)
        .order('registered_at', { ascending: false })

      setRegistrations(registrationsData || [])

      // Load reservations (new)
      try {
        const res = await fetch('/api/reservations', { credentials: 'include' })
        const json = await res.json()
        setReservations(json.reservations || [])
      } catch {
        setReservations([])
      }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">שלום, {user.full_name}</h1>
          <p className="text-text-light/70">האיזור האישי שלך</p>
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

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-primary">הרשמות שלי</h2>
          <Button size="sm" variant="outline" asChild>
            <Link href="/workshops" className="gap-2">
              <Plus className="w-4 h-4" />
              הירשם לחוג/סדנה
            </Link>
          </Button>
        </div>

        {registrations.length === 0 ? (
          <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-text-light/70 mb-4">אין הרשמות פעילות</p>
            <Button asChild>
              <Link href="/workshops">הירשם לחוג או סדנה</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 mb-8">
            {registrations.map((registration) => {
              const event = Array.isArray(registration.event) ? registration.event[0] : registration.event
              if (!event) return null
              
              const isPast = new Date(event.end_at) < new Date()
              const statusColor = 
                registration.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                registration.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              
              const statusText = 
                registration.status === 'confirmed' ? 'מאושר' :
                registration.status === 'cancelled' ? 'בוטל' :
                'ממתין'

              return (
                <Card key={registration.id} className={`rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-primary">{event.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.type === 'class' ? 'bg-blue-100 text-blue-700' :
                          event.type === 'workshop' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {event.type === 'class' ? 'חוג' : event.type === 'workshop' ? 'סדנה' : 'אירוע'}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Calendar size={16} className="ml-2 text-accent" />
                      {new Date(event.start_at).toLocaleDateString('he-IL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>

                    <div className="flex items-center text-gray-700">
                      <Clock size={16} className="ml-2 text-accent" />
                      {new Date(event.start_at).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {event.price && (
                      <div className="flex items-center text-gray-700">
                        <Ticket size={16} className="ml-2 text-accent" />
                        ₪{event.price}
                      </div>
                    )}
                  </div>

                  {isPast && (
                    <div className="mt-4 text-xs text-gray-500 text-center">
                      האירוע הסתיים
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        <Separator className="my-8" />

        <h2 className="text-2xl font-semibold text-primary mb-4">שריונות לפעילויות</h2>
        {reservations.length === 0 ? (
          <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-8 text-center">
            <p className="text-text-light/70 mb-4">אין שריונות כרגע</p>
            <Button asChild>
              <Link href="/classes">שריין מקום</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 mb-8">
            {reservations.map((r: any) => {
              const ev = Array.isArray(r.event) ? r.event[0] : r.event
              return (
                <Card key={r.id} className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-primary">{ev?.title || 'פעילות'}</h3>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{r.status}</span>
                      </div>
                      {ev?.start_at && (
                        <div className="text-sm text-text-light/70 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span>
                            {new Date(ev.start_at).toLocaleDateString('he-IL', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                            })}{' '}
                            {new Date(ev.start_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <div className="text-sm text-text-light/70 flex items-center gap-2 mt-1">
                        <Ticket className="w-4 h-4 text-accent" />
                        <span>מקומות: {r.seats}</span>
                      </div>
                    </div>
                    {r.qr_code && (
                      <div className="bg-white p-3 rounded-lg border inline-block">
                        <QRCodeSVG value={r.qr_code} size={120} level="H" includeMargin={true} />
                        <div className="text-xs text-gray-500 mt-1 font-mono text-center">{r.qr_code}</div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
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
