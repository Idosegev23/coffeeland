'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, Users, Ticket, Sparkles, Star, PartyPopper } from 'lucide-react';

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
      const res = await fetch('/api/public/events?type=show&status=active');
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
    const reserved = show.reserved_seats_count || 0;
    return show.capacity - reserved;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">טוען הצגות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-pink-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <PartyPopper className="w-12 h-12 text-pink-500 animate-bounce" />
            <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
              הצגות לילדים
            </h1>
            <Star className="w-12 h-12 text-amber-500 animate-pulse fill-amber-500" />
          </div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
            🎭 קסם על הבמה • חוויה בלתי נשכחת • רגעים של שמחה
          </p>
        </div>

        {shows.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <Ticket className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <p className="text-2xl font-bold text-gray-800 mb-2">אין הצגות מתוכננות כרגע</p>
              <p className="text-gray-500">חזרו בקרוב לעדכונים מרגשים!</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shows.map((show, idx) => {
              const seats = getAvailableSeats(show);
              const soldOut = seats <= 0;
              const almostSoldOut = seats <= 10 && seats > 0;

              return (
                <div
                  key={show.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white border-2 border-transparent hover:border-pink-200 group">
                    {show.banner_image_url ? (
                      <div className="relative w-full h-72 overflow-hidden">
                        <Image 
                          src={show.banner_image_url} 
                          alt={show.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        
                        {soldOut ? (
                          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                            <div className="text-center">
                              <Badge className="text-xl px-8 py-3 bg-red-500 border-0">
                                אזל המלאי 😢
                              </Badge>
                            </div>
                          </div>
                        ) : almostSoldOut && (
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse">
                            🔥 נותרו {seats} כרטיסים בלבד!
                          </div>
                        )}
                        
                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                          <Sparkles className="w-4 h-4" />
                          הצגה מיוחדת
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-3xl font-black text-white drop-shadow-2xl mb-2">
                            {show.title}
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-72 bg-gradient-to-br from-pink-400 via-purple-400 to-amber-400 flex items-center justify-center relative overflow-hidden">
                        <Ticket className="w-24 h-24 text-white/30 absolute" />
                        <div className="absolute bottom-6 left-6 right-6">
                          <h3 className="text-3xl font-black text-white drop-shadow-2xl">
                            {show.title}
                          </h3>
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <p className="text-gray-700 line-clamp-2 min-h-[3rem] leading-relaxed">
                        {show.description}
                      </p>

                      <div className="space-y-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Calendar className="w-5 h-5 text-pink-600 flex-shrink-0" />
                          <span className="font-medium">{formatDate(show.start_at)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          <span className="font-medium">{formatTime(show.start_at)} - {formatTime(show.end_at)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                          <Users className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <span className="font-medium">{seats} מקומות זמינים מתוך {show.capacity}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t-2 border-dashed border-gray-200 space-y-3">
                        <div className="flex justify-between items-center bg-pink-50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-700">כרטיס להצגה בלבד 🎭</span>
                          <span className="text-2xl font-black text-pink-600">₪{show.price_show_only}</span>
                        </div>
                        <div className="flex justify-between items-center bg-purple-50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-700">הצגה + גימבורי 🎪</span>
                          <span className="text-2xl font-black text-purple-600">₪{show.price_show_and_playground}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedShow(show)}
                        disabled={soldOut}
                        className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-amber-500 hover:from-pink-600 hover:via-purple-700 hover:to-amber-600 text-white font-bold text-lg py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        size="lg"
                      >
                        {soldOut ? (
                          <>😢 אזל המלאי</>
                        ) : (
                          <>
                            <Ticket className="w-5 h-5 ml-2" />
                            קנה כרטיס עכשיו
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </div>
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
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                בחר סוג כרטיס 🎫
              </DialogTitle>
              <DialogDescription className="text-lg">
                {selectedShow?.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <button
                onClick={() => handleBuyTicket(selectedShow, 'show_only')}
                className="w-full p-6 border-3 border-pink-300 rounded-2xl hover:border-pink-500 hover:bg-pink-50 transition-all text-right group hover:shadow-xl transform hover:scale-105"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-xl mb-2 flex items-center gap-2">
                      🎭 כרטיס להצגה בלבד
                    </p>
                    <p className="text-sm text-gray-600">כניסה למופע המרהיב שלנו</p>
                  </div>
                  <div className="text-left">
                    <p className="text-3xl font-black text-pink-600 group-hover:scale-110 transition-transform">
                      ₪{selectedShow?.price_show_only}
                    </p>
                    <p className="text-xs text-gray-500">לכרטיס</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleBuyTicket(selectedShow, 'show_and_playground')}
                className="w-full p-6 border-3 border-purple-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all text-right group hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                  💎 מומלץ ביותר
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <p className="font-bold text-xl mb-2 flex items-center gap-2">
                      🎪 הצגה + כניסה לגימבורי
                    </p>
                    <p className="text-sm text-gray-600">מופע + משחק חופשי בגימבורי</p>
                  </div>
                  <div className="text-left">
                    <p className="text-3xl font-black text-purple-600 group-hover:scale-110 transition-transform">
                      ₪{selectedShow?.price_show_and_playground}
                    </p>
                    <p className="text-xs text-gray-500">לכרטיס</p>
                  </div>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }
      `}</style>
    </div>
  );
}
