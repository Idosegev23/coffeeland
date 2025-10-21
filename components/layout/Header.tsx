'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'ראשי', href: '/' },
  { name: 'משחקייה', href: '/playground' },
  { name: 'אירועים', href: '/events' },
  { name: 'סדנאות', href: '/workshops' },
  { name: 'תפריט', href: '/menu' },
  { name: 'גלריה', href: '/gallery' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full bg-background-light/95 backdrop-blur supports-[backdrop-filter]:bg-background-light/80 border-b-2 border-border shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="ניווט ראשי">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-90 transition-all group -my-4"
            aria-label="CoffeeLand - עמוד הבית"
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 group-hover:scale-105 transition-transform">
              <Image
                src="/logo.svg"
                alt="CoffeeLand Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-2 lg:gap-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-all hover:bg-secondary/20',
                    isActive
                      ? 'text-accent bg-accent/10'
                      : 'text-primary hover:text-accent'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:block">
            <Button variant="default" size="sm" asChild>
              <Link href="/#passes">כרטיסייה</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-primary hover:bg-secondary/20 focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="תפריט ניווט"
          >
            {mobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 pt-2 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'block px-3 py-2 text-base font-medium rounded-md transition-colors',
                      isActive
                        ? 'text-accent bg-accent/10'
                        : 'text-primary hover:bg-secondary/20 hover:text-accent'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <div className="pt-2">
                <Button variant="default" size="default" className="w-full" asChild>
                  <Link href="/#passes" onClick={() => setMobileMenuOpen(false)}>
                    כרטיסייה
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

