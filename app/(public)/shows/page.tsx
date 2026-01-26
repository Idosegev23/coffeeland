'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, Ticket } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
    year: 'numeric' 
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
      setShows(data || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = (show: Show, ticketType: 'show_only' | 'show_and_playground') => {
    // Redirect to checkout with show + ticket type
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p>טוען הצגות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-primary">הצגות ומופעים</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          הצטרפו אלינו להצגות מרתקות ומהנות לילדים! כל ההצגות מתאימות לגילאים 3-8.
        </p>
      </div>
      
      {shows.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">אין הצגות מתוכננות כרגע. חזרו בקרוב!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map(show => {
            const availableSeats = getAvailableSeats(show);
            const isFull = availableSeats <= 0;
            
            return (
              <Card key={show.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {show.banner_image_url && (
                  <div className="relative w-full h-48">
                    <Image 
                      src={show.banner_image_url} 
                      alt={show.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{show.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{show.description}</p>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span>{formatDate(show.start_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>{formatTime(show.start_at)} - {formatTime(show.end_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span className={isFull ? 'text-red-600 font-medium' : ''}>
                        {availableSeats} מקומות פנויים מתוך {show.capacity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">החל מ-</p>
                    <p className="text-2xl font-bold text-accent">₪{show.price_show_only}</p>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedShow(show)}
                    className="w-full"
                    disabled={isFull}
                  >
                    {isFull ? (
                      'אזל מהמלאי'
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

      {/* Ticket Type Selection Dialog */}
      {selectedShow && (
        <Dialog open={!!selectedShow} onOpenChange={() => setSelectedShow(null)}>
          <DialogContent className="max-w-md" dir="rtl">
            <h2 className="text-2xl font-bold mb-2">{selectedShow.title}</h2>
            <p className="text-sm text-gray-600 mb-6">בחר את סוג הכרטיס המתאים לך:</p>
            
            <div className="space-y-4">
              <Card 
                className="p-4 cursor-pointer hover:border-accent hover:shadow-md transition-all"
                onClick={() => handleBuyTicket(selectedShow, 'show_only')}
              >
                <h3 className="font-bold text-lg mb-2">כרטיס להצגה בלבד</h3>
                <p className="text-sm text-gray-600 mb-3">
                  כניסה להצגה בלבד
                </p>
                <p className="text-3xl font-bold text-accent">
                  ₪{selectedShow.price_show_only}
                </p>
              </Card>
              
              <Card 
                className="p-4 cursor-pointer hover:border-accent hover:shadow-md transition-all border-2 border-accent/30"
                onClick={() => handleBuyTicket(selectedShow, 'show_and_playground')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">כרטיס להצגה + כניסה לג׳ימבורי</h3>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                    מומלץ ⭐
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  כולל כניסה להצגה + משחק חופשי במשחקייה לאחר ההצגה
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-accent">
                    ₪{selectedShow.price_show_and_playground}
                  </p>
                  {selectedShow.price_show_and_playground > selectedShow.price_show_only && (
                    <span className="text-sm text-green-600 font-medium">
                      (חיסכון של ₪{(selectedShow.price_show_and_playground - selectedShow.price_show_only).toFixed(0)})
                    </span>
                  )}
                </div>
              </Card>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setSelectedShow(null)}
              className="w-full mt-4"
            >
              ביטול
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
