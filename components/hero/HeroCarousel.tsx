'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { analytics } from '@/lib/analytics'

interface Slide {
  id: string
  title: string
  description: string
  image: string
  cta: {
    text: string
    href: string
  }
}

const slides: Slide[] = [
  {
    id: 'playground',
    title: 'ברוכים הבאים ל-CoffeeLand',
    description: 'מקום חם ומזמין למשפחות - משחקייה, קפה וסדנאות',
    image: '/images/untitled-10.webp',
    cta: {
      text: 'קנו כרטיסייה',
      href: '/#passes',
    },
  },
  {
    id: 'events',
    title: 'חוגגים יום הולדת?',
    description: 'אירועים בלתי נשכחים עם כל הפינוקים',
    image: '/images/untitled-30.webp',
    cta: {
      text: 'שריינו תאריך',
      href: '/events',
    },
  },
  {
    id: 'workshops',
    title: 'סדנאות הורה-ילד',
    description: 'פעילויות יצירתיות ומהנות לכל המשפחה',
    image: '/images/untitled-20.webp',
    cta: {
      text: 'לצפייה בלוח',
      href: '/workshops',
    },
  },
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [direction, setDirection] = useState(0)

  const nextSlide = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Auto-advance
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying, nextSlide])

  // Track slide views
  useEffect(() => {
    analytics.heroSlideView(currentIndex, slides[currentIndex].id)
  }, [currentIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') prevSlide()
      if (e.key === 'ArrowLeft') nextSlide()
      if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  const currentSlide = slides[currentIndex]

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <section
      className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full overflow-hidden bg-secondary"
      aria-roledescription="carousel"
      aria-label="תמונות בולטות"
    >
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              sizes="100vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-full items-end pb-12 sm:pb-16 lg:pb-20">
              <div className="max-w-2xl space-y-4">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-dark drop-shadow-lg"
                >
                  {currentSlide.title}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg sm:text-xl text-text-dark/90 drop-shadow-md"
                >
                  {currentSlide.description}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="default"
                    size="lg"
                    asChild
                    onClick={() =>
                      analytics.ctaClick('hero', currentSlide.cta.text, currentSlide.cta.href)
                    }
                  >
                    <a href={currentSlide.cta.href}>{currentSlide.cta.text}</a>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
        <button
          onClick={prevSlide}
          className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-text-dark/80 hover:bg-text-dark transition-colors flex items-center justify-center group"
          aria-label="שקופית קודמת"
        >
          <ChevronRight className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-text-dark/80 hover:bg-text-dark transition-colors flex items-center justify-center group"
          aria-label="שקופית הבאה"
        >
          <ChevronLeft className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              index === currentIndex
                ? 'bg-accent w-8'
                : 'bg-text-dark/50 hover:bg-text-dark/80'
            )}
            aria-label={`עבור לשקופית ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>

      {/* Play/Pause */}
      <button
        onClick={() => setIsPlaying((prev) => !prev)}
        className="absolute top-4 left-4 w-10 h-10 rounded-full bg-text-dark/80 hover:bg-text-dark transition-colors flex items-center justify-center"
        aria-label={isPlaying ? 'עצור אוטומטי' : 'הפעל אוטומטי'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-primary" />
        ) : (
          <Play className="w-5 h-5 text-primary" />
        )}
      </button>

      {/* Screen reader announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        שקופית {currentIndex + 1} מתוך {slides.length}: {currentSlide.title}
      </div>
    </section>
  )
}

