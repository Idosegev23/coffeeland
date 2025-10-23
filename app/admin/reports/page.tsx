'use client';

/**
 * אדמין - דוחות ואנליטיקס
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Calendar,
  DollarSign,
  ArrowRight,
  Coffee,
  Package
} from 'lucide-react';
import Link from 'next/link';

interface ReportData {
  totalCustomers: number;
  totalRevenue: number;
  activeCards: number;
  totalStamps: number;
  upcomingEvents: number;
  totalRegistrations: number;
  recentSales: Array<{
    id: string;
    amount: number;
    created_at: string;
    user: {
      full_name: string;
    };
    payment_method: string;
  }>;
  popularCards: Array<{
    name: string;
    count: number;
  }>;
  eventStats: Array<{
    title: string;
    type: string;
    registrations_count: number;
    capacity: number;
    start_at: string;
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // חישוב תאריך התחלה לפי טווח
      const now = new Date();
      const startDate = new Date();
      if (dateRange === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      // 1. סך הלקוחות
      const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 2. הכנסות כוללות
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

      // 3. כרטיסיות פעילות
      const { count: activeCards } = await supabase
        .from('passes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // 4. חותמות כוללות
      const { data: loyaltyCards } = await supabase
        .from('loyalty_cards')
        .select('total_stamps');

      const totalStamps = loyaltyCards?.reduce((sum, lc) => sum + lc.total_stamps, 0) || 0;

      // 5. אירועים קרובים
      const { count: upcomingEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('start_at', now.toISOString());

      // 6. רישומים כוללים
      const { count: totalRegistrations } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // 7. מכירות אחרונות
      const { data: recentSales } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          created_at,
          payment_method,
          user:users(full_name)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      // 8. כרטיסיות פופולריות
      const { data: passesData } = await supabase
        .from('passes')
        .select(`
          card_type:card_types(name)
        `)
        .gte('created_at', startDate.toISOString());

      const cardCounts = passesData?.reduce((acc: any, pass: any) => {
        const name = pass.card_type?.name || 'לא ידוע';
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const popularCards = Object.entries(cardCounts || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // 9. סטטיסטיקות אירועים
      const { data: eventStats } = await supabase
        .from('events')
        .select(`
          title,
          type,
          capacity,
          start_at,
          registrations(count)
        `)
        .eq('status', 'active')
        .gte('start_at', now.toISOString())
        .order('start_at', { ascending: true })
        .limit(10);

      const formattedEventStats = eventStats?.map((event: any) => ({
        title: event.title,
        type: event.type,
        capacity: event.capacity,
        start_at: event.start_at,
        registrations_count: event.registrations?.length || 0
      })) || [];

      setData({
        totalCustomers: totalCustomers || 0,
        totalRevenue,
        activeCards: activeCards || 0,
        totalStamps,
        upcomingEvents: upcomingEvents || 0,
        totalRegistrations: totalRegistrations || 0,
        recentSales: recentSales || [],
        popularCards,
        eventStats: formattedEventStats
      });

    } catch (error: any) {
      console.error('Error loading report data:', error);
      alert('שגיאה בטעינת דוחות');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEventDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען דוחות...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* כפתור חזרה */}
        <Link href="/admin">
          <Button variant="outline" className="mb-4 flex items-center gap-2">
            <ArrowRight size={18} />
            חזרה לפאנל ניהול
          </Button>
        </Link>

        {/* כותרת */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              <BarChart3 className="inline-block mr-2 mb-1" />
              דוחות ואנליטיקס
            </h1>
            <p className="text-gray-600">מעקב אחר ביצועים ופעילות העסק</p>
          </div>

          {/* בחירת טווח */}
          <div className="flex gap-2">
            <Button
              variant={dateRange === 'week' ? 'default' : 'outline'}
              onClick={() => setDateRange('week')}
              size="sm"
            >
              שבוע
            </Button>
            <Button
              variant={dateRange === 'month' ? 'default' : 'outline'}
              onClick={() => setDateRange('month')}
              size="sm"
            >
              חודש
            </Button>
            <Button
              variant={dateRange === 'year' ? 'default' : 'outline'}
              onClick={() => setDateRange('year')}
              size="sm"
            >
              שנה
            </Button>
          </div>
        </div>

        {/* KPIs ראשיים */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users size={24} />
              <TrendingUp size={20} />
            </div>
            <p className="text-blue-100 text-sm mb-1">סך לקוחות</p>
            <p className="text-3xl font-bold">{data.totalCustomers}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={24} />
              <TrendingUp size={20} />
            </div>
            <p className="text-green-100 text-sm mb-1">הכנסות</p>
            <p className="text-3xl font-bold">{formatCurrency(data.totalRevenue)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard size={24} />
              <Package size={20} />
            </div>
            <p className="text-purple-100 text-sm mb-1">כרטיסיות פעילות</p>
            <p className="text-3xl font-bold">{data.activeCards}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Coffee size={24} />
              <TrendingUp size={20} />
            </div>
            <p className="text-orange-100 text-sm mb-1">חותמות נאספו</p>
            <p className="text-3xl font-bold">{data.totalStamps}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* מכירות אחרונות */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              מכירות אחרונות
            </h2>
            <div className="space-y-3">
              {data.recentSales.length > 0 ? (
                data.recentSales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{sale.user?.full_name || 'לא ידוע'}</p>
                      <p className="text-sm text-gray-500">{formatDate(sale.created_at)}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-green-600">{formatCurrency(sale.amount)}</p>
                      <p className="text-xs text-gray-500">{sale.payment_method}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">אין מכירות בתקופה זו</p>
              )}
            </div>
          </div>

          {/* כרטיסיות פופולריות */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              כרטיסיות פופולריות
            </h2>
            <div className="space-y-3">
              {data.popularCards.length > 0 ? (
                data.popularCards.map((card, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{card.name}</span>
                    </div>
                    <span className="font-bold text-accent">{card.count} נמכרו</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">אין נתונים</p>
              )}
            </div>
          </div>
        </div>

        {/* אירועים קרובים */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            אירועים קרובים - תפוסה
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold">שם האירוע</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">סוג</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">תאריך</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">נרשמו</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">קיבולת</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">תפוסה</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.eventStats.length > 0 ? (
                  data.eventStats.map((event, index) => {
                    const occupancy = event.capacity 
                      ? Math.round((event.registrations_count / event.capacity) * 100)
                      : 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{event.title}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {event.type === 'class' ? 'חוג' : event.type === 'workshop' ? 'סדנא' : 'אירוע'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatEventDate(event.start_at)}</td>
                        <td className="px-4 py-3 font-medium">{event.registrations_count}</td>
                        <td className="px-4 py-3">{event.capacity || '∞'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  occupancy >= 90 ? 'bg-red-500' : 
                                  occupancy >= 70 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(occupancy, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-left">
                              {event.capacity ? `${occupancy}%` : '-'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      אין אירועים קרובים
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* סטטיסטיקות נוספות */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">סיכום כללי</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">אירועים קרובים:</span>
                <span className="font-bold text-lg">{data.upcomingEvents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">רישומים בתקופה:</span>
                <span className="font-bold text-lg">{data.totalRegistrations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ממוצע לאירוע:</span>
                <span className="font-bold text-lg">
                  {data.upcomingEvents > 0 
                    ? (data.totalRegistrations / data.upcomingEvents).toFixed(1)
                    : '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-lg mb-4">הכנסות</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">סך הכנסות:</span>
                <span className="font-bold text-lg text-green-600">{formatCurrency(data.totalRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ממוצע ללקוח:</span>
                <span className="font-bold text-lg">
                  {data.totalCustomers > 0 
                    ? formatCurrency(data.totalRevenue / data.totalCustomers)
                    : formatCurrency(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

