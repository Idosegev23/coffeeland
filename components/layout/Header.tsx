'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Home, Scan, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const navigation = [
  { name: 'ראשי', href: '/' },
  { name: 'משחקייה', href: '/playground' },
  { name: 'אירועים', href: '/events' },
  { name: 'סדנאות', href: '/workshops' },
  { name: 'תפריט', href: '/menu' },
  { name: 'גלריה', href: '/gallery' },
]

export function Header() {
  const supabase = createClientComponentClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()
  const { user, userData } = useAuth()

  // Check if user is admin
  React.useEffect(() => {
    if (user) {
      supabase
        .from('admins')
        .select('is_active')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setIsAdmin(data?.is_active === true))
    } else {
      setIsAdmin(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

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

            {/* CTA Buttons (Desktop) */}
            <div className="hidden md:flex md:gap-2">
              {pathname !== '/' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/" className="gap-2">
                    <Home className="w-4 h-4" />
                    דף הבית
                  </Link>
                </Button>
              )}
              
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="default" size="sm" asChild>
                      <Link href="/admin/scan" className="gap-2">
                        <Scan className="w-4 h-4" />
                        סרוק QR
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={isAdmin ? '/admin' : '/my-account'} className="gap-2">
                      <User className="w-4 h-4" />
                      {userData?.full_name || 'איזור אישי'}
                    </Link>
                  </Button>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="gap-2">
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">התנתק</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login">התחבר</Link>
                  </Button>
                  <Button variant="default" size="sm" asChild>
                    <Link href="/passes">כרטיסייה</Link>
                  </Button>
                </>
              )}
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
                {pathname !== '/' && (
                  <Link
                    href="/"
                    className="block px-3 py-2 text-base font-medium rounded-md transition-colors text-primary hover:bg-secondary/20 hover:text-accent flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="w-4 h-4" />
                    דף הבית
                  </Link>
                )}
                
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
                <div className="pt-2 space-y-2">
                  {user ? (
                    <>
                      {isAdmin && (
                        <Button variant="default" size="default" className="w-full gap-2" asChild>
                          <Link href="/admin/scan" onClick={() => setMobileMenuOpen(false)}>
                            <Scan className="w-4 h-4" />
                            סרוק QR
                          </Link>
                        </Button>
                      )}
                      <Button variant="outline" size="default" className="w-full gap-2" asChild>
                        <Link href={isAdmin ? '/admin' : '/my-account'} onClick={() => setMobileMenuOpen(false)}>
                          <User className="w-4 h-4" />
                          {userData?.full_name || 'איזור אישי'}
                        </Link>
                      </Button>
                      <Button onClick={handleLogout} variant="ghost" size="default" className="w-full gap-2">
                        <LogOut className="w-4 h-4" />
                        התנתק
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="default" className="w-full" asChild>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          התחבר
                        </Link>
                      </Button>
                      <Button variant="default" size="default" className="w-full" asChild>
                        <Link href="/passes" onClick={() => setMobileMenuOpen(false)}>
                          כרטיסייה
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

