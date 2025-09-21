'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate, formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Workshop {
  id: string;
  title: string;
  slug: string;
  description_md: string | null;
  age_min: number | null;
  age_max: number | null;
  duration_min: number;
  base_price: number;
  cover_image_url: string | null;
  capacity_default: number;
}

interface WorkshopSession {
  id: string;
  workshop_id: string;
  start_at: string;
  end_at: string;
  capacity_override: number | null;
  price_override: number | null;
  location: string | null;
  status: 'scheduled' | 'cancelled' | 'completed';
  workshop: Workshop;
  registered_count?: number;
}

export function EventList() {
  const [selectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<WorkshopSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [selectedDate]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockSessions: WorkshopSession[] = [
        {
          id: '1',
          workshop_id: '1',
          start_at: new Date(selectedDate.getTime() + 10 * 60 * 60 * 1000).toISOString(), // 10 AM
          end_at: new Date(selectedDate.getTime() + 11.5 * 60 * 60 * 1000).toISOString(), // 11:30 AM
          capacity_override: null,
          price_override: null,
          location: 'אולם הסדנאות',
          status: 'scheduled',
          registered_count: 6,
          workshop: {
            id: '1',
            title: 'יוגה הורה-ילד',
            slug: 'yoga-parent-child',
            description_md: 'סדנת יוגה מיוחדת להורים וילדים - חיזוק הקשר והרגעה משותפת',
            age_min: 3,
            age_max: 8,
            duration_min: 90,
            base_price: 12000, // 120 ILS in cents
            cover_image_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
            capacity_default: 10,
          },
        },
        {
          id: '2',
          workshop_id: '2',
          start_at: new Date(selectedDate.getTime() + 14 * 60 * 60 * 1000).toISOString(), // 2 PM
          end_at: new Date(selectedDate.getTime() + 15.5 * 60 * 60 * 1000).toISOString(), // 3:30 PM
          capacity_override: 8,
          price_override: 10000, // 100 ILS
          location: 'פינת היצירה',
          status: 'scheduled',
          registered_count: 3,
          workshop: {
            id: '2',
            title: 'יצירה חכמה',
            slug: 'smart-crafts',
            description_md: 'סדנת יצירה המשלבת למידה ויצירתיות - פיתוח כישורים מוטוריים ויצירתיים',
            age_min: 5,
            age_max: 12,
            duration_min: 90,
            base_price: 8000, // 80 ILS
            cover_image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            capacity_default: 12,
          },
        },
        {
          id: '3',
          workshop_id: '3',
          start_at: new Date(selectedDate.getTime() + 16.5 * 60 * 60 * 1000).toISOString(), // 4:30 PM
          end_at: new Date(selectedDate.getTime() + 17.5 * 60 * 60 * 1000).toISOString(), // 5:30 PM
          capacity_override: null,
          price_override: null,
          location: 'פינת הסיפורים',
          status: 'scheduled',
          registered_count: 8,
          workshop: {
            id: '3',
            title: 'סיפור ומוזיקה',
            slug: 'story-and-music',
            description_md: 'שעת סיפור אינטראקטיבית עם מוזיקה וכלי נגינה - פיתוח דמיון ויצירתיות',
            age_min: 2,
            age_max: 6,
            duration_min: 60,
            base_price: 6000, // 60 ILS
            cover_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80',
            capacity_default: 15,
          },
        },
      ];

      // Filter sessions for selected date
      const dateStr = selectedDate.toISOString().split('T')[0];
      const filteredSessions = mockSessions.filter(session => {
        const sessionDate = new Date(session.start_at).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });

      setSessions(filteredSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (session: WorkshopSession) => {
    return session.price_override || session.workshop.base_price;
  };

  const getCapacity = (session: WorkshopSession) => {
    return session.capacity_override || session.workshop.capacity_default;
  };

  const getAgeRange = (workshop: Workshop) => {
    if (!workshop.age_min && !workshop.age_max) return null;
    if (workshop.age_min && workshop.age_max) {
      return `גילאי ${workshop.age_min}-${workshop.age_max}`;
    }
    if (workshop.age_min) return `מגיל ${workshop.age_min}`;
    if (workshop.age_max) return `עד גיל ${workshop.age_max}`;
    return null;
  };

  const getAvailableSpots = (session: WorkshopSession) => {
    const capacity = getCapacity(session);
    const registered = session.registered_count || 0;
    return Math.max(0, capacity - registered);
  };

  const addToCart = (session: WorkshopSession) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '{"items": []}');
      const existingItem = cart.items.find((item: any) => 
        item.ref_id === session.id && item.item_type === 'workshop_session'
      );
      
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        cart.items.push({
          item_type: 'workshop_session',
          ref_id: session.id,
          title_snapshot: `${session.workshop.title} - ${formatDate(session.start_at, 'long')}`,
          unit_price_cents: getPrice(session),
          qty: 1,
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="flex space-x-4 rtl:space-x-reverse">
              <div className="w-20 h-20 bg-latte-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-latte-200 rounded w-3/4" />
                <div className="h-3 bg-latte-200 rounded w-1/2" />
                <div className="h-3 bg-latte-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-coffee-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-coffee-900 mb-2">
          אין פעילויות מתוכננות
        </h3>
        <p className="text-coffee-600">
          ב{formatDate(selectedDate, 'long')} אין פעילויות מתוכננות.
          <br />
          בחר תאריך אחר או עקוב אחרי העדכונים שלנו.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-coffee-900 mb-4">
        פעילויות ב{formatDate(selectedDate, 'long')}
      </h3>
      
      {sessions.map((session) => {
        const availableSpots = getAvailableSpots(session);
        const ageRange = getAgeRange(session.workshop);
        const startTime = formatDate(session.start_at, 'time');
        const endTime = formatDate(session.end_at, 'time');
        
        return (
          <div key={session.id} className="card-hover p-6">
            <div className="flex space-x-4 rtl:space-x-reverse">
              {/* Workshop Image */}
              <div className="flex-shrink-0">
                {session.workshop.cover_image_url ? (
                  <img
                    src={session.workshop.cover_image_url}
                    alt={session.workshop.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-tropical-100 rounded-lg flex items-center justify-center">
                    <Star className="w-8 h-8 text-tropical-600" />
                  </div>
                )}
              </div>

              {/* Workshop Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-coffee-900">
                    {session.workshop.title}
                  </h4>
                  <div className="text-left">
                    <div className="text-xl font-bold text-tropical-600">
                      {formatPrice(getPrice(session))}
                    </div>
                    <div className="text-sm text-coffee-600">
                      לאדם
                    </div>
                  </div>
                </div>

                {session.workshop.description_md && (
                  <p className="text-coffee-700 text-sm mb-3 line-clamp-2">
                    {session.workshop.description_md}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-coffee-600 mb-4">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Clock className="w-4 h-4" />
                    <span>{startTime} - {endTime}</span>
                  </div>
                  
                  {session.location && (
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <MapPin className="w-4 h-4" />
                      <span>{session.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Users className="w-4 h-4" />
                    <span>{availableSpots} מקומות פנויים</span>
                  </div>

                  {ageRange && (
                    <div className="bg-tropical-100 text-tropical-700 px-2 py-1 rounded-full text-xs">
                      {ageRange}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {availableSpots > 0 ? (
                      <span className="text-green-600 text-sm font-medium">
                        ✓ זמין להרשמה
                      </span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">
                        ✗ מלא
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => addToCart(session)}
                    disabled={availableSpots === 0}
                    size="sm"
                  >
                    {availableSpots > 0 ? 'הירשם עכשיו' : 'מלא'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
