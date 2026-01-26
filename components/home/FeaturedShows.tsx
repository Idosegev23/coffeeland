'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles } from 'lucide-react';

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
      const res = await fetch(
        `/api/public/events?type=show&is_featured=true&status=active&from=${encodeURIComponent(now)}&limit=3`
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
    <section className="py-12 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-8 h-8 text-pink-600" />
          <h2 className="text-3xl font-bold text-center">הצגות מיוחדות</h2>
          <Sparkles className="w-8 h-8 text-pink-600" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {shows.map(show => (
            <Card key={show.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              {show.banner_image_url && (
                <div className="relative w-full h-64">
                  <Image 
                    src={show.banner_image_url} 
                    alt={show.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    הצגה מיוחדת ⭐
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{show.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{show.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(show.start_at)}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">החל מ-</p>
                    <p className="text-2xl font-bold text-pink-600">
                      ₪{show.price_show_only}
                    </p>
                  </div>
                  <Button asChild size="lg">
                    <Link href="/shows">
                      לרכישת כרטיסים
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg" className="bg-white">
            <Link href="/shows">
              צפה בכל ההצגות
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
