'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Ticket } from 'lucide-react';

interface Show {
  id: string;
  title: string;
  description: string;
  start_at: string;
  banner_image_url?: string;
  price_show_only: number;
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

export default function FeaturedShows() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedShows();
  }, []);

  const loadFeaturedShows = async () => {
    try {
      const now = new Date().toISOString();
      const timestamp = Date.now(); // למניעת cache
      // מחזיר הצגות מומלצות עתידיות (כולל מלאות)
      const res = await fetch(
        `/api/public/events?type=show&is_featured=true&from=${encodeURIComponent(now)}&limit=3&_t=${timestamp}`,
        { cache: 'no-store' }
      );
      const data = await res.json();
      setShows(data.events || []);
    } catch (error) {
      console.error('Error loading featured shows:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || shows.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">הצגות מיוחדות</h2>
            <p className="text-text-light/70 mt-1">הצגות קסומות לכל המשפחה</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/shows">לכל ההצגות</Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          {shows.map(show => (
            <Card 
              key={show.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow bg-white border rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none"
            >
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
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-bold text-primary">{show.title}</h3>
                  <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded font-medium whitespace-nowrap">
                    הצגה 🎭
                  </span>
                </div>
                
                {show.description && (
                  <p className="text-sm text-text-light/70 line-clamp-2 mb-4">{show.description}</p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-text-light/80 mb-4">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{formatDate(show.start_at)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-light/60">החל מ-</p>
                    <p className="text-2xl font-bold text-accent">
                      ₪{show.price_show_only}
                    </p>
                  </div>
                  <Button asChild className="bg-accent hover:bg-accent/90">
                    <Link href="/shows">
                      <Ticket className="w-4 h-4 ml-2" />
                      רכישה
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 sm:hidden">
          <Button variant="outline" asChild className="w-full">
            <Link href="/shows">לכל ההצגות</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
