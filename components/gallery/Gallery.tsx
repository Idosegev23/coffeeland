'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Lightbox } from './Lightbox'
import { analytics } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface GalleryImage {
  src: string
  alt: string
}

// Placeholder gallery images
const galleryImages: GalleryImage[] = [
  {
    src: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    alt: 'ילדים משחקים במשחקייה',
  },
  {
    src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
    alt: 'חגיגת יום הולדת',
  },
  {
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop',
    alt: 'קפה טרי ומאפים',
  },
  {
    src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
    alt: 'ילדה יצירתית בסדנה',
  },
  {
    src: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop',
    alt: 'משטח משחק צבעוני',
  },
  {
    src: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=600&fit=crop',
    alt: 'קפה לאטה עם ציור',
  },
  {
    src: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop',
    alt: 'ילדים בפעילות קבוצתית',
  },
  {
    src: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800&h=600&fit=crop',
    alt: 'עוגת יום הולדת צבעונית',
  },
  {
    src: 'https://images.unsplash.com/photo-1551506448-074afa034c05?w=800&h=600&fit=crop',
    alt: 'משחקי ילדים',
  },
  {
    src: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&h=600&fit=crop',
    alt: 'פינת קריאה נעימה',
  },
  {
    src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
    alt: 'סדנת אומנות',
  },
  {
    src: 'https://images.unsplash.com/photo-1445633629932-0029acc44e88?w=800&h=600&fit=crop',
    alt: 'קפה עם חברים',
  },
]

interface GalleryProps {
  images?: GalleryImage[]
  columns?: 2 | 3 | 4
  preview?: boolean
  maxImages?: number
}

export function Gallery({
  images = galleryImages,
  columns = 3,
  preview = false,
  maxImages,
}: GalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const displayImages = maxImages ? images.slice(0, maxImages) : images

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
    analytics.galleryImageOpen(index)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const columnClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <>
      <div
        className={cn(
          'grid gap-4',
          columnClass[columns]
        )}
      >
        {displayImages.map((image, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openLightbox(index)}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-accent transition-all shadow-sm hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            aria-label={`פתח תמונה: ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes={`(max-width: 640px) 50vw, (max-width: 1024px) ${100 / columns}vw, ${100 / columns}vw`}
              loading={preview || index < 6 ? 'eager' : 'lazy'}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-primary/0 hover:bg-primary/20 transition-colors flex items-center justify-center">
              <span className="text-text-dark opacity-0 hover:opacity-100 transition-opacity font-semibold text-sm">
                לחץ להגדלה
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          currentIndex={currentImageIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrevious={previousImage}
        />
      )}
    </>
  )
}

