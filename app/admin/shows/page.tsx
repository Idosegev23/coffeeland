'use client';

/**
 * אדמין - ניהול הצגות
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, Ticket, RefreshCw, ArrowRight, Edit } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Show {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  capacity: number;
  status: string;
  banner_image_url?: string;
  price_show_only: number;
  price_show_and_playground: number;
  registrations?: Array<{
    id: string;
    status: string;
    ticket_type?: string;
    payment?: {
      amount: number;
    };
  }>;
}

export default function AdminShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      const res = await fetch('/api/events?type=show');
      const data = await res.json();
      setShows(data.events || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSales = async (show: Show) => {
    const newStatus = show.status === 'full' ? 'active' : 'full';
    const action = newStatus === 'full' ? 'עצירת' : 'פתיחת';
    
    if (!confirm(`האם אתה בטוח שברצונך ${action} מכירה עבור "${show.title}"?`)) return;

    try {
      const res = await fetch(`/api/events/${show.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      // עדכון מקומי
      setShows(shows.map(s => 
        s.id === show.id ? { ...s, status: newStatus } : s
      ));

      alert(newStatus === 'full' 
        ? '⛔ המכירה נעצרה בהצלחה!' 
        : '✅ המכירה נפתחה בהצלחה!');
    } catch (error: any) {
      alert('❌ שגיאה: ' + error.message);
    }
  };

  const calculateStats = (show: Show) => {
    const registrations = show.registrations || [];
    const confirmed = registrations.filter(r => r.status === 'confirmed');
    const totalSold = confirmed.length;
    const availableSeats = show.capacity - totalSold;
    const revenue = confirmed.reduce((sum, r) => sum + (r.payment?.amount || 0), 0);

    return { totalSold, availableSeats, revenue };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-light">טוען הצגות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin">
                <ArrowRight className="w-4 h-4 ml-2" />
                חזרה לפאנל ניהול
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">ניהול הצגות</h1>
              <p className="text-text-light/70">כל ההצגות שלך במקום אחד</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadShows} variant="outline">
              <RefreshCw className="w-4 h-4 ml-2" />
              רענן
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90">
              <Link href="/admin/events">
                <Edit className="w-4 h-4 ml-2" />
                עריכת הצגות
              </Link>
            </Button>
          </div>
        </div>

        {/* Shows List */}
        {shows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <Ticket className="w-16 h-16 text-secondary mx-auto mb-4" />
            <p className="text-xl font-bold text-primary mb-2">אין הצגות במערכת</p>
            <p className="text-text-light/70 mb-6">צור הצגה ראשונה דרך דף ניהול האירועים</p>
            <Button asChild className="bg-accent">
              <Link href="/admin/events">
                צור הצגה
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {shows.map((show) => {
              const stats = calculateStats(show);
              const isFull = show.status === 'full';
              const isPast = new Date(show.start_at) < new Date();

              return (
                <div 
                  key={show.id} 
                  className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                    isFull ? 'border-red-300' : isPast ? 'border-gray-300' : 'border-green-300'
                  }`}
                >
                  {/* Image */}
                  {show.banner_image_url && (
                    <div className="relative w-full h-48">
                      <Image 
                        src={show.banner_image_url} 
                        alt={show.title}
                        fill
                        className="object-cover"
                      />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded font-bold text-white ${
                        isFull ? 'bg-red-600' : isPast ? 'bg-gray-600' : 'bg-green-600'
                      }`}>
                        {isFull ? '⛔ מכירה עצורה' : isPast ? '✓ הסתיים' : '✓ פעיל'}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-primary mb-2">{show.title}</h2>
                    
                    {show.description && (
                      <p className="text-text-light/70 text-sm mb-4 line-clamp-2">
                        {show.description}
                      </p>
                    )}

                    {/* Date & Time */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-text-light">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>{formatDate(show.start_at)}</span>
                      </div>
                      <span className="text-accent font-bold">
                        {formatTime(show.start_at)}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6 bg-background rounded-lg p-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalSold}</p>
                        <p className="text-xs text-gray-600">נמכרו</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Ticket className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{stats.availableSeats}</p>
                        <p className="text-xs text-gray-600">פנויים</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="w-4 h-4 text-[#4C2C21]" />
                        </div>
                        <p className="text-xl font-bold text-[#4C2C21]">₪{stats.revenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-600">הכנסות</p>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-text-light/70">🎭 הצגה בלבד</span>
                        <span className="font-bold text-accent">₪{show.price_show_only}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-light/70">🎪 הצגה + גימבורי</span>
                        <span className="font-bold text-accent">₪{show.price_show_and_playground}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!isPast && (
                        <Button
                          onClick={() => handleToggleSales(show)}
                          className={`flex-1 ${isFull ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          {isFull ? '✓ פתח מכירה' : '⛔ עצור מכירה'}
                        </Button>
                      )}
                      <Button 
                        asChild 
                        variant="outline" 
                        className="flex-1"
                      >
                        <Link href={`/admin/events`}>
                          <Edit className="w-4 h-4 ml-2" />
                          ערוך
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
