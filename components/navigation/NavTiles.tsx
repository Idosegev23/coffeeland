'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { analytics } from '@/lib/analytics'

interface NavTile {
  id: string
  name: string
  href: string
  lottieFile: string
  variant: 'light' | 'dark'
}

const tiles: NavTile[] = [
  {
    id: 'playground',
    name: 'משחקייה',
    href: '/playground',
    lottieFile: '/lottie/play.json',
    variant: 'light',
  },
  {
    id: 'events',
    name: 'אירועים וימי הולדת',
    href: '/events',
    lottieFile: '/lottie/birthday.json',
    variant: 'dark',
  },
  {
    id: 'menu',
    name: 'תפריט',
    href: '/menu',
    lottieFile: '/lottie/coffee.json',
    variant: 'light',
  },
  {
    id: 'workshops',
    name: 'סדנאות',
    href: '/workshops',
    lottieFile: '/lottie/workshops.json',
    variant: 'dark',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function LottiePlayer({ src }: { src: string }) {
  const [animationData, setAnimationData] = useState<any>(null)
  const [Lottie, setLottie] = useState<any>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Load lottie-react dynamically
    import('lottie-react')
      .then((module) => {
        setLottie(() => module.default)
      })
      .catch((err) => {
        console.error('Error loading lottie-react:', err)
        setError(true)
      })

    // Load animation data
    fetch(src)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${src}`)
        }
        return res.json()
      })
      .then((data) => {
        console.log('Loaded animation:', src)
        setAnimationData(data)
      })
      .catch((err) => {
        console.error('Error loading Lottie animation:', err)
        setError(true)
      })
  }, [src])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-primary opacity-50">
        🎬
      </div>
    )
  }

  if (!Lottie || !animationData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 bg-primary/20 rounded-full" />
      </div>
    )
  }

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid slice',
      }}
    />
  )
}

export function NavTiles() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {tiles.map((tile, index) => {
            const isLight = tile.variant === 'light'
            const isLastItem = index === tiles.length - 1
            
            // החלפת סדר במובייל: תפריט (index 2) וסדנאות (index 3)
            let mobileOrder = ''
            if (index === 2) mobileOrder = 'order-4 lg:order-none' // תפריט ירד למטה
            if (index === 3) mobileOrder = 'order-3 lg:order-none' // סדנאות יעלה למעלה

            return (
              <motion.div 
                key={tile.id} 
                variants={item}
                className={cn(
                  isLastItem && 'col-span-2 lg:col-span-1',
                  mobileOrder
                )}
              >
                <Link
                  href={tile.href}
                  onClick={() => analytics.navTileClick(tile.name, tile.href)}
                  className={cn(
                    'group relative block h-40 sm:h-48 lg:h-52 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none overflow-hidden shadow-md hover:shadow-xl transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
                    isLight ? 'bg-background' : 'bg-secondary'
                  )}
                  aria-label={`עבור ל${tile.name}`}
                >
                  {/* Background Pattern */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-5',
                      isLight ? 'bg-secondary' : 'bg-primary'
                    )}
                    style={{
                      backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6 gap-3 sm:gap-4">
                    {/* Lottie Animation */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28">
                      <LottiePlayer src={tile.lottieFile} />
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        'text-base sm:text-lg font-semibold text-center transition-colors',
                        isLight
                          ? 'text-primary group-hover:text-accent'
                          : 'text-text-dark group-hover:text-accent'
                      )}
                    >
                      {tile.name}
                    </h3>
                  </div>

                  {/* Hover Effect */}
                  <div
                    className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300',
                      'bg-accent'
                    )}
                  />
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
