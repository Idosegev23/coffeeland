'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles, Star, Ticket } from 'lucide-react';

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
    <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-amber-50">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-pink-500 animate-pulse" />
            <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-amber-600 bg-clip-text text-transparent">
              הצגות מיוחדות
            </h2>
            <Sparkles className="w-10 h-10 text-purple-500 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            הופעות מרהיבות לילדים 🎭 חוויה בלתי נשכחת של קסם ומופע
          </p>
        </div>
        
        {/* Shows Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {shows.map((show, idx) => (
            <div
              key={show.id}
              className="group animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white border-2 border-transparent hover:border-pink-200">
                {show.banner_image_url ? (
                  <div className="relative w-full h-72 overflow-hidden">
                    <Image 
                      src={show.banner_image_url} 
                      alt={show.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-bounce">
                      <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                      מיוחד
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-2xl font-black text-white drop-shadow-lg">
                        {show.title}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-72 bg-gradient-to-br from-pink-400 via-purple-400 to-amber-400 flex items-center justify-center">
                    <Ticket className="w-24 h-24 text-white/50" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-black text-white drop-shadow-lg">
                        {show.title}
                      </h3>
                    </div>
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <p className="text-gray-700 line-clamp-2 min-h-[3rem]">
                    {show.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 rounded-lg p-3">
                    <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="font-medium">{formatDate(show.start_at)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">החל מ-</p>
                      <p className="text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        ₪{show.price_show_only}
                      </p>
                    </div>
                    <Button 
                      asChild 
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                      <Link href="/shows">
                        <Ticket className="w-4 h-4 ml-2" />
                        קנה כרטיס
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <Button 
            asChild 
            size="lg"
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 hover:from-pink-600 hover:via-purple-600 hover:to-amber-600 text-white font-bold text-lg px-8 py-6 rounded-2xl shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-105"
          >
            <Link href="/shows" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              צפה בכל ההצגות
              <Sparkles className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }
      `}</style>
    </section>
  );
}
