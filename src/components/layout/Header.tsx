'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, Calendar, Coffee, Users, Camera, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'בית', href: '/', icon: Coffee },
  { name: 'לוח פעילויות', href: '/calendar', icon: Calendar },
  { name: 'סדנאות', href: '/workshops', icon: Users },
  { name: 'שירותים', href: '/services', icon: Phone },
  { name: 'גלריה', href: '/gallery', icon: Camera },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Close mobile menu on route change
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Load cart count from localStorage
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const cartData = JSON.parse(cart);
          const count = cartData.items?.reduce((sum: number, item: any) => sum + (item.qty || 0), 0) || 0;
          setCartCount(count);
        } catch (e) {
          setCartCount(0);
        }
      }
    };

    updateCartCount();
    
    // Listen for cart updates
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-latte-100/95 backdrop-blur supports-[backdrop-filter]:bg-latte-100/60 border-b border-coffee-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="flex items-center justify-center w-10 h-10 bg-tropical-600 rounded-lg">
              <Coffee className="w-6 h-6 text-latte" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-coffee-900">CoffeLand</span>
              <span className="text-xs text-coffee-600 -mt-1">בית קפה משחקייה</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-tropical-600 text-latte'
                      : 'text-coffee-700 hover:text-coffee-900 hover:bg-latte-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-tropical-600 text-latte text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="פתח תפריט"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-coffee-200 py-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 rtl:space-x-reverse px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-tropical-600 text-latte'
                      : 'text-coffee-700 hover:text-coffee-900 hover:bg-latte-200'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
