'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, Users, Ticket, Star } from 'lucide-react';

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
  registrations_count?: number; // מספר כרטיסים שנמכרו
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
  const [shows, setShows] = useState<Show[]>([]);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      const timestamp = Date.now(); // למניעת cache
      const res = await fetch(
        `/api/public/events?type=show&status=active&_t=${timestamp}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      setShows(data.events || []);
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
    // להצגות: registrations_count = כרטיסים שנמכרו (confirmed)
    const sold = show.registrations_count || 0;
    return show.capacity - sold;
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

        {shows.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none shadow-sm p-12 max-w-md mx-auto">
              <Ticket className="w-16 h-16 text-secondary mx-auto mb-4" />
              <p className="text-xl font-bold text-primary mb-2">אין הצגות מתוכננות כרגע</p>
              <p className="text-text-light/70">חזרו בקרוב לעדכונים!</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shows.map((show) => {
              const seats = getAvailableSeats(show);
              const soldOut = seats <= 0;
              const almostSoldOut = seats <= 10 && seats > 0;

              return (
                <Card 
                  key={show.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow bg-white border rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none"
                >
                  {show.banner_image_url ? (
                    <div className="relative w-full h-56 bg-background">
                      <Image 
                        src={show.banner_image_url} 
                        alt={show.title}
                        fill
                        className="object-cover"
                      />
                      {soldOut && (
                        <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                          <Badge className="text-lg px-6 py-2 bg-error text-white">
                            אזל המלאי
                          </Badge>
                        </div>
                      )}
                      {almostSoldOut && !soldOut && (
                        <div className="absolute top-4 left-4 bg-error text-white px-3 py-1 rounded text-sm font-bold">
                          נותרו {seats} מקומות בלבד!
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-accent text-white px-3 py-1 rounded text-sm font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        מיוחד
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-56 bg-secondary/20 flex items-center justify-center relative">
                      <Ticket className="w-16 h-16 text-secondary/30" />
                      {almostSoldOut && !soldOut && (
                        <div className="absolute top-4 left-4 bg-error text-white px-3 py-1 rounded text-sm font-bold">
                          נותרו {seats} מקומות!
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-accent text-white px-3 py-1 rounded text-sm font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        מיוחד
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <h3 className="text-xl font-bold text-primary">{show.title}</h3>
                    
                    {show.description && (
                      <p className="text-sm text-text-light/70 line-clamp-2">
                        {show.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-text-light/80 bg-background rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{formatDate(show.start_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{formatTime(show.start_at)} - {formatTime(show.end_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{seats} מקומות זמינים מתוך {show.capacity}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-light/70">כרטיס להצגה בלבד</span>
                        <span className="font-bold text-accent">₪{show.price_show_only}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-light/70">הצגה + גימבורי</span>
                        <span className="font-bold text-accent">₪{show.price_show_and_playground}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setSelectedShow(show)}
                      disabled={soldOut}
                      className="w-full bg-accent hover:bg-accent/90"
                      size="lg"
                    >
                      {soldOut ? (
                        'אזל המלאי'
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 ml-2" />
                          קנה כרטיס
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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

              <button
                onClick={() => handleBuyTicket(selectedShow, 'show_and_playground')}
                className="w-full p-5 border-2 border-accent rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none hover:bg-accent/5 transition-all text-right relative"
              >
                <div className="absolute top-2 left-2 bg-secondary text-white text-xs px-2 py-1 rounded font-bold">
                  מומלץ ⭐
                </div>
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
