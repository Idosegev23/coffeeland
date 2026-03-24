'use client';

/**
 * עמוד חוגים וסדנאות - רישום ללקוחות
 */

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, Users, DollarSign, User } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'class' | 'workshop' | 'event';
  start_at: string;
  end_at: string;
  is_recurring: boolean;
  instructor?: { name: string };
  room?: { name: string; location?: string };
  capacity?: number;
  min_age?: number;
  max_age?: number;
  price?: number;
  status: string;
  registrations_count?: number;
}

interface Child {
  id: string;
  name: string;
  age: number;
}

export default function ClassesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'class' | 'workshop'>('all');

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadData();
  }, [filterType]);

  const loadData = async () => {
    try {
      // טעינת משתמש
      const { data: { user: userData } } = await supabase.auth.getUser();
      setUser(userData);

      // טעינת אירועים
      const nowIso = new Date().toISOString();
      const eventsUrl = filterType === 'all' 
        ? `/api/public/events?status=active&from=${encodeURIComponent(nowIso)}&limit=50`
        : `/api/public/events?status=active&type=${filterType}&from=${encodeURIComponent(nowIso)}&limit=50`;
      const eventsRes = await fetch(eventsUrl);
      const eventsData = await eventsRes.json();
      setEvents(eventsData.events || []);

      // טעינת ילדים אם מחובר
      if (userData) {
        const childrenRes = await fetch('/api/children');
        const childrenData = await childrenRes.json();
        setChildren(childrenData.children || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!user) {
      window.location.href = '/login?redirect=/classes';
      return;
    }
    if (!selectedEvent) return;

    // Redirect to checkout for payment
    const params = new URLSearchParams({
      type: 'event',
      id: selectedEvent.id,
      quantity: seats.toString(),
    });
    window.location.href = `/checkout?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>טוען חוגים וסדנאות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* כותרת */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">חוגים וסדנאות</h1>
          <p className="text-xl text-white/90">פעילויות מגוונות לכל המשפחה</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* סינון */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
          >
            הכל
          </Button>
          <Button
            variant={filterType === 'class' ? 'default' : 'outline'}
            onClick={() => setFilterType('class')}
          >
            חוגים
          </Button>
          <Button
            variant={filterType === 'workshop' ? 'default' : 'outline'}
            onClick={() => setFilterType('workshop')}
          >
            סדנאות
          </Button>
        </div>

        {/* רשימת אירועים */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">אין אירועים זמינים כרגע</p>
            </div>
          ) : (
            events.map(event => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary flex-1">
                      {event.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      event.type === 'class' ? 'bg-blue-100 text-blue-700' :
                      event.type === 'workshop' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {event.type === 'class' ? 'חוג' : event.type === 'workshop' ? 'סדנה' : 'אירוע'}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-gray-700" suppressHydrationWarning>
                      <Calendar size={16} className="ml-2 text-accent" />
                      {new Date(event.start_at).toLocaleDateString('he-IL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </div>

                    <div className="flex items-center text-gray-700" suppressHydrationWarning>
                      <Clock size={16} className="ml-2 text-accent" />
                      {new Date(event.start_at).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {event.instructor && (
                      <div className="flex items-center text-gray-700">
                        <User size={16} className="ml-2 text-accent" />
                        מדריך: {event.instructor.name}
                      </div>
                    )}

                    {event.room && (
                      <div className="flex items-center text-gray-700">
                        <MapPin size={16} className="ml-2 text-accent" />
                        {event.room.name}
                      </div>
                    )}

                    {event.capacity && (
                      <div className="flex items-center text-gray-700">
                        <Users size={16} className="ml-2 text-accent" />
                        {(() => {
                          const sold = event.registrations_count || 0;
                          const available = Math.max(0, event.capacity - sold);
                          return `נותרו ${available} מתוך ${event.capacity}`;
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    {event.price ? (
                      <span className="text-2xl font-bold text-accent">
                        ₪{event.price}
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-green-600">חינם</span>
                    )}

                    <Button
                      onClick={() => setSelectedEvent(event)}
                      className="bg-accent hover:bg-accent/90"
                    >
                      רכישת כרטיס
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* דיאלוג רישום */}
        <Dialog
          open={!!selectedEvent}
          onOpenChange={() => setSelectedEvent(null)}
        >
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle>רישום ל-{selectedEvent?.title}</DialogTitle>
            </DialogHeader>

            {selectedEvent && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">תאריך ושעה</span>
                  </div>
                  <p className="font-medium" suppressHydrationWarning>
                    {new Date(selectedEvent.start_at).toLocaleDateString('he-IL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                    {' '}
                    בשעה{' '}
                    {new Date(selectedEvent.start_at).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">כמות מקומות</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={seats}
                    onChange={(e) => setSeats(parseInt(e.target.value || '1'))}
                    className="w-full px-4 py-2 border rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    התשלום מתבצע באשראי בלבד
                  </p>
                </div>

                {selectedEvent.price && (
                  <div className="p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">מחיר</span>
                      <span className="text-2xl font-bold text-accent">
                        ₪{selectedEvent.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      תשלום באשראי
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedEvent(null)}
              >
                ביטול
              </Button>
              <Button
                onClick={handleRegister}
                className="bg-accent hover:bg-accent/90"
              >
                המשך לתשלום
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* דיאלוג הצלחה הוסר - תשלום מתבצע בcheckout */}
      </div>
    </div>
  );
}

