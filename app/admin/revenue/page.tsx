'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, TrendingUp, Calendar, DollarSign, CreditCard, Theater, Ticket, BookOpen, Loader2 } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  payment_method: string | null
  created_at: string
  metadata: Record<string, any> | null
  user: {
    full_name: string
    email: string
  } | null
}

type PaymentType = 'show' | 'pass' | 'series' | 'other'

function getPaymentType(payment: Payment): PaymentType {
  const meta = payment.metadata
  if (!meta) return 'other'
  if (meta.series_id) return 'series'
  if (meta.card_type_id) return 'pass'
  if (meta.event_id) return 'show'
  return 'other'
}

function getPaymentTypeLabel(type: PaymentType): string {
  switch (type) {
    case 'show': return 'הצגה'
    case 'pass': return 'כרטיסייה'
    case 'series': return 'חוג/סדנה'
    case 'other': return 'אחר'
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed': return 'הושלם'
    case 'pending': return 'ממתין'
    case 'failed': return 'נכשל'
    case 'refunded': return 'זוכה'
    default: return status
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'failed': return 'bg-red-100 text-red-800'
    case 'refunded': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function RevenueDashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!user || error) {
        router.push('/login')
        return
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!admin) {
        router.push('/')
        return
      }

      const { data, error: paymentsError } = await supabase
        .from('payments')
        .select('id, amount, status, payment_method, created_at, metadata, user:users!payments_user_id_fkey(full_name, email)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(500)

      if (paymentsError) {
        console.error('Error loading payments:', paymentsError)
      }

      setPayments((data as unknown as Payment[]) || [])
    } catch (err) {
      console.error('Error loading revenue data:', err)
    } finally {
      setLoading(false)
    }
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const revenueToday = payments
    .filter(p => new Date(p.created_at) >= todayStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const revenueWeek = payments
    .filter(p => new Date(p.created_at) >= weekStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const revenueMonth = payments
    .filter(p => new Date(p.created_at) >= monthStart)
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  const revenueTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0)

  const revenueByType = payments.reduce((acc, p) => {
    const type = getPaymentType(p)
    acc[type] = (acc[type] || 0) + (p.amount || 0)
    return acc
  }, {} as Record<PaymentType, number>)

  const recentPayments = payments.slice(0, 20)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-text-light/70">טוען נתוני הכנסות...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link href="/admin">
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לפאנל ניהול
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">דוח הכנסות</h1>
            <p className="text-text-light/70">סיכום הכנסות ותשלומים</p>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">סיכום הכנסות</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
              <div className="flex items-center gap-4">
                <DollarSign className="w-10 h-10 text-text-dark/80" />
                <div>
                  <div className="text-3xl font-bold text-text-dark">{revenueToday.toLocaleString('he-IL')}&#8362;</div>
                  <div className="text-sm text-text-dark/70">הכנסות היום</div>
                </div>
              </div>
            </Card>

            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-10 h-10 text-text-dark/80" />
                <div>
                  <div className="text-3xl font-bold text-text-dark">{revenueWeek.toLocaleString('he-IL')}&#8362;</div>
                  <div className="text-sm text-text-dark/70">הכנסות השבוע</div>
                </div>
              </div>
            </Card>

            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-text-dark/80" />
                <div>
                  <div className="text-3xl font-bold text-text-dark">{revenueMonth.toLocaleString('he-IL')}&#8362;</div>
                  <div className="text-sm text-text-dark/70">הכנסות החודש</div>
                </div>
              </div>
            </Card>

            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] p-6">
              <div className="flex items-center gap-4">
                <CreditCard className="w-10 h-10 text-text-dark/80" />
                <div>
                  <div className="text-3xl font-bold text-text-dark">{revenueTotal.toLocaleString('he-IL')}&#8362;</div>
                  <div className="text-sm text-text-dark/70">סה&quot;כ הכנסות</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Revenue by Type */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">הכנסות לפי סוג</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-white p-6 border">
              <div className="flex items-center gap-4">
                <Theater className="w-10 h-10 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-primary">{(revenueByType.show || 0).toLocaleString('he-IL')}&#8362;</div>
                  <div className="text-sm text-text-light/70">הצגות</div>
                </div>
              </div>
            </Card>

            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-white p-6 border">
              <div className="flex items-center gap-4">
                <Ticket className="w-10 h-10 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-primary">{(revenueByType.pass || 0).toLocaleString('he-IL')}&#8362;</div>
                  <div className="text-sm text-text-light/70">כרטיסיות</div>
                </div>
              </div>
            </Card>

            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-white p-6 border">
              <div className="flex items-center gap-4">
                <BookOpen className="w-10 h-10 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-primary">{(revenueByType.series || 0).toLocaleString('he-IL')}&#8362;</div>
                  <div className="text-sm text-text-light/70">חוגים/סדנאות</div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <h2 className="text-2xl font-semibold text-primary mb-4">תנועות אחרונות</h2>
          <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-white overflow-hidden border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background">
                  <tr>
                    <th className="text-right p-3 text-sm font-semibold text-primary">תאריך</th>
                    <th className="text-right p-3 text-sm font-semibold text-primary">לקוח</th>
                    <th className="text-right p-3 text-sm font-semibold text-primary">סכום</th>
                    <th className="text-right p-3 text-sm font-semibold text-primary">סוג</th>
                    <th className="text-right p-3 text-sm font-semibold text-primary">סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id} className="border-t hover:bg-background/50">
                      <td className="p-3 text-sm" suppressHydrationWarning>
                        {new Date(payment.created_at).toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 text-sm font-medium">
                        {payment.user?.full_name || 'לא ידוע'}
                      </td>
                      <td className="p-3 text-sm font-bold text-[#4C2C21]">
                        {payment.amount.toLocaleString('he-IL')}&#8362;
                      </td>
                      <td className="p-3 text-sm">
                        {getPaymentTypeLabel(getPaymentType(payment))}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentPayments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        אין תנועות להצגה
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
