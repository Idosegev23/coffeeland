'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, Ticket, Star, History } from 'lucide-react';

interface Show {
  id: string;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  capacity: number;
  banner_image_url?: string;
  price_show_only: number;
  price_show_and_playground: number;
  reserved_seats_count?: number;
  registrations_count?: number;
  status?: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('he-IL', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    weekday: 'long'
  });
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('he-IL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function ShowsPage() {
  const [upcomingShows, setUpcomingShows] = useState<Show[]>([]);
  const [historicalShows, setHistoricalShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadAllShows();
  }, []);

  const loadAllShows = async () => {
    try {
      const timestamp = Date.now();
      
      // הצגות עתידיות (כולל מלאות)
      const upcomingRes = await fetch(
        `/api/public/events?type=show&_t=${timestamp}`,
        { cache: 'no-store' }
      );
      const upcomingData = await upcomingRes.json();
      
      // הצגות היסטוריות
      const now = new Date();
      const pastDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString(); // 6 חודשים אחורה
      const historyRes = await fetch(
        `/api/public/events?type=show&include_history=true&to=${now.toISOString()}&from=${pastDate}&_t=${timestamp}`,
        { cache: 'no-store' }
      );
      const historyData = await historyRes.json();
      
      setUpcomingShows(upcomingData.events || []);
      setHistoricalShows(historyData.events || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = (show: Show, ticketType: 'show_only' | 'show_and_playground') => {
    const params = new URLSearchParams({
      item: show.id,
      type: 'show',
      ticket_type: ticketType,
      price: (ticketType === 'show_only' ? show.price_show_only : show.price_show_and_playground).toString()
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  const getAvailableSeats = (show: Show) => {
    const sold = show.registrations_count || 0;
    return show.capacity - sold;
  };

  const isShowPast = (show: Show) => {
    return new Date(show.start_at) < new Date();
  };

  const isShowFull = (show: Show) => {
    // אם הסטטוס הוא 'full' - המכירה נעצרה ידנית
    if (show.status === 'full') return true;
    // אחרת בדיקה לפי מקומות
    const seats = getAvailableSeats(show);
    return seats <= 0;
  };

  const renderShowCard = (show: Show, isPast = false) => {
    const seats = getAvailableSeats(show);
    const soldOut = isShowFull(show);
    const almostSoldOut = seats <= 10 && seats > 0 && !soldOut;
    const past = isPast || isShowPast(show);

    return (
      <div
        key={show.id}
        className={`group relative bg-background-light border-2 border-border rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none overflow-hidden transition-all duration-300 ${past ? 'opacity-70' : 'hover:shadow-lg hover:border-secondary/40 hover:-translate-y-1'}`}
      >
        {/* Image */}
        {show.banner_image_url ? (
          <div className="relative w-full h-52 bg-background overflow-hidden">
            <Image
              src={show.banner_image_url}
              alt={show.title}
              fill
              className={`object-cover transition-transform duration-500 ${past ? '' : 'group-hover:scale-105'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
            {past && (
              <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                <span className="bg-background-light/90 text-primary font-bold px-5 py-2 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-sm flex items-center gap-2">
                  <History className="w-4 h-4" />
                  הסתיים
                </span>
              </div>
            )}
            {soldOut && !past && (
              <div className="absolute top-4 left-4">
                <span className="bg-error/90 text-white font-bold px-4 py-2 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none text-sm shadow-md">
                  אזל המלאי
                </span>
              </div>
            )}
            {almostSoldOut && !soldOut && !past && (
              <div className="absolute top-4 left-4">
                <span className="bg-secondary text-white font-medium px-3 py-1.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none text-xs shadow-md">
                  נותרו {seats} מקומות בלבד
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative w-full h-52 bg-gradient-to-br from-secondary/20 via-background to-accent/10 flex items-center justify-center overflow-hidden">
            <Ticket className="w-20 h-20 text-secondary/20" />
            {past && (
              <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                <span className="bg-background-light/90 text-primary font-bold px-5 py-2 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-sm flex items-center gap-2">
                  <History className="w-4 h-4" />
                  הסתיים
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Title */}
          <h3 className="text-xl font-bold text-primary leading-snug">{show.title}</h3>

          {/* Description */}
          {show.description && (
            <div>
              <p className={`text-sm text-text-light/60 leading-relaxed ${expandedDescriptions.has(show.id) ? '' : 'line-clamp-2'}`}>
                {show.description}
              </p>
              {show.description.length > 80 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedDescriptions(prev => {
                      const next = new Set(prev);
                      if (next.has(show.id)) next.delete(show.id);
                      else next.add(show.id);
                      return next;
                    });
                  }}
                  className="text-xs text-secondary font-medium hover:underline mt-1"
                >
                  {expandedDescriptions.has(show.id) ? 'הצג פחות' : 'קרא עוד...'}
                </button>
              )}
            </div>
          )}

          {/* Details */}
          <div className="bg-background rounded-xl p-3 space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-text-light/80">
              <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="font-medium" suppressHydrationWarning>{formatDate(show.start_at)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-text-light/80">
              <Clock className="w-4 h-4 text-accent flex-shrink-0" />
              <span suppressHydrationWarning>{formatTime(show.start_at)} - {formatTime(show.end_at)}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-text-light/80">
              <Users className="w-4 h-4 text-accent flex-shrink-0" />
              <span className={soldOut && !past ? 'font-bold text-error' : ''}>
                {past
                  ? `${show.registrations_count || 0} השתתפו`
                  : soldOut
                    ? 'אזל המלאי'
                    : `${seats} מקומות זמינים מתוך ${show.capacity}`}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-1.5">
            {(show.price_show_only ?? 0) > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-light/60">הצגה בלבד</span>
                <span className="font-bold text-primary">₪{show.price_show_only}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-light/60">הצגה + גימבורי</span>
              <span className="font-bold text-primary text-lg">₪{show.price_show_and_playground}</span>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => !past && !soldOut && setSelectedShow(show)}
            disabled={soldOut || past}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none font-medium text-sm transition-colors ${
              past
                ? 'bg-background text-text-light/40 cursor-default'
                : soldOut
                  ? 'bg-error/10 text-error cursor-not-allowed border border-error/20'
                  : 'bg-primary text-primary-foreground hover:bg-secondary'
            }`}
          >
            {past ? (
              <>
                <History className="w-4 h-4" />
                הצגה הסתיימה
              </>
            ) : soldOut ? (
              'אזל המלאי'
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                רכישת כרטיס
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-light">טוען הצגות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-3">הצגות לילדים</h1>
          <p className="text-lg text-text-light/80 max-w-2xl mx-auto">
            הצטרפו אלינו להצגות מרתקות ומהנות! מתאים מגיל שנה ו-8 חודשים עד 3 שנים
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full" dir="rtl">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upcoming" className="text-base">
              הצגות קרובות
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              ארכיון
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingShows.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none shadow-sm p-12 max-w-md mx-auto">
                  <Ticket className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <p className="text-xl font-bold text-primary mb-2">אין הצגות מתוכננות כרגע</p>
                  <p className="text-text-light/70">חזרו בקרוב לעדכונים!</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingShows.map((show) => renderShowCard(show, false))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {historicalShows.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none shadow-sm p-12 max-w-md mx-auto">
                  <History className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <p className="text-xl font-bold text-primary mb-2">אין הצגות קודמות להצגה</p>
                  <p className="text-text-light/70">זו תהיה ההצגה הראשונה שלנו!</p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historicalShows.map((show) => renderShowCard(show, true))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Ticket Type Selection Dialog */}
      {selectedShow && (
        <Dialog open={!!selectedShow} onOpenChange={() => setSelectedShow(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">
                בחר סוג כרטיס
              </DialogTitle>
              <DialogDescription className="text-base">
                {selectedShow?.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              {(selectedShow.price_show_only ?? 0) > 0 && (
                <button
                  onClick={() => handleBuyTicket(selectedShow, 'show_only')}
                  className="w-full p-5 border-2 border-accent/30 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none hover:border-accent hover:bg-accent/5 transition-all text-right"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-lg mb-1 text-primary">כרטיס להצגה בלבד 🎭</p>
                      <p className="text-sm text-text-light/70">כניסה למופע בלבד</p>
                    </div>
                    <div className="text-left">
                      <p className="text-3xl font-bold text-accent">
                        ₪{selectedShow?.price_show_only}
                      </p>
                    </div>
                  </div>
                </button>
              )}

              <button
                onClick={() => handleBuyTicket(selectedShow, 'show_and_playground')}
                className="w-full p-5 border-2 border-accent rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none hover:bg-accent/5 transition-all text-right relative"
              >
                {(selectedShow.price_show_only ?? 0) > 0 && (
                  <div className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded font-bold">
                    מומלץ ⭐
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg mb-1 text-primary">הצגה + כניסה לגימבורי 🎪</p>
                    <p className="text-sm text-text-light/70">מופע + משחק חופשי</p>
                  </div>
                  <div className="text-left">
                    <p className="text-3xl font-bold text-accent">
                      ₪{selectedShow?.price_show_and_playground}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
