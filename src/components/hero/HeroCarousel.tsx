'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  video_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  sort_order: number;
}

interface HeroCarouselProps {
  className?: string;
}

export function HeroCarousel({ className }: HeroCarouselProps) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isPlaying]);

  const fetchSlides = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockSlides: HeroSlide[] = [
        {
          id: '1',
          title: 'ברוכים הבאים ל-CoffeLand',
          subtitle: 'המקום המושלם לכל המשפחה - קפה איכותי, משחקים מהנים וזכרונות בלתי נשכחים',
          image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2047&q=80',
          video_url: null,
          cta_text: 'גלה את התפריט',
          cta_url: '/products',
          sort_order: 1,
        },
        {
          id: '2',
          title: 'סדנאות מעשירות לילדים',
          subtitle: 'יוגה הורה-ילד, יצירה חכמה וסיפורים מרתקים - פעילויות שמחברות ומעשירות',
          image_url: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
          video_url: null,
          cta_text: 'רשמו לסדנה',
          cta_url: '/workshops',
          sort_order: 2,
        },
        {
          id: '3',
          title: 'חבילות יום הולדת מיוחדות',
          subtitle: 'יום הולדת בלתי נשכח עם משחקים, יצירה ועוגה טעימה במיוחד',
          image_url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80',
          video_url: null,
          cta_text: 'צרו קשר',
          cta_url: '/events-contact',
          sort_order: 3,
        },
      ];
      setSlides(mockSlides);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 3000);
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  }, [currentSlide, slides.length, goToSlide]);

  if (loading) {
    return (
      <div className="relative h-[60vh] md:h-[70vh] bg-latte-200 animate-pulse rounded-xl" />
    );
  }

  if (slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className={cn('relative h-[60vh] md:h-[70vh] overflow-hidden rounded-xl shadow-soft', className)}>
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        {currentSlideData.video_url ? (
          <video
            src={currentSlideData.video_url}
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : currentSlideData.image_url ? (
          <img
            src={currentSlideData.image_url}
            alt={currentSlideData.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-tropical-600 to-coffee-700" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
              {currentSlideData.title}
            </h1>
            {currentSlideData.subtitle && (
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed animate-slide-in">
                {currentSlideData.subtitle}
              </p>
            )}
            {currentSlideData.cta_text && currentSlideData.cta_url && (
              <div className="animate-slide-in">
                <Button
                  asChild
                  size="lg"
                  className="bg-tropical-600 hover:bg-tropical-700 text-white text-lg px-8 py-4"
                >
                  <Link href={currentSlideData.cta_url}>
                    {currentSlideData.video_url && <Play className="w-5 h-5 mr-2" />}
                    {currentSlideData.cta_text}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            onClick={prevSlide}
            aria-label="שקף קודם"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
            onClick={nextSlide}
            aria-label="שקף הבא"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}


      {/* Play/Pause Button */}
      {slides.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'השהה' : 'הפעל'}
        >
          {isPlaying ? (
            <div className="w-4 h-4 flex space-x-1">
              <div className="w-1 h-4 bg-current" />
              <div className="w-1 h-4 bg-current" />
            </div>
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
      )}
    </div>
  );
}
