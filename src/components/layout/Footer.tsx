'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, MapPin, Phone, Mail, Clock, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-coffee-900 text-latte">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="flex items-center justify-center w-10 h-10 bg-tropical-600 rounded-lg">
                <Coffee className="w-6 h-6 text-latte" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold">CoffeLand</span>
                <span className="text-sm text-latte/80">בית קפה משחקייה</span>
              </div>
            </div>
            <p className="text-sm text-latte/80 leading-relaxed">
              מקום מיוחד לכל המשפחה - קפה איכותי, משחקים מהנים וסדנאות מעשירות בלב אשקלון.
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-latte/10 hover:bg-tropical-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="פייסבוק"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-latte/10 hover:bg-tropical-600 rounded-lg flex items-center justify-center transition-colors"
                aria-label="אינסטגרם"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">קישורים מהירים</h3>
            <nav className="space-y-2">
              <Link href="/workshops" className="block text-sm text-latte/80 hover:text-latte transition-colors">
                סדנאות
              </Link>
              <Link href="/services" className="block text-sm text-latte/80 hover:text-latte transition-colors">
                חבילות יום הולדת
              </Link>
              <Link href="/gallery" className="block text-sm text-latte/80 hover:text-latte transition-colors">
                גלריה
              </Link>
              <Link href="/calendar" className="block text-sm text-latte/80 hover:text-latte transition-colors">
                לוח פעילויות
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">יצירת קשר</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm">
                <MapPin className="w-4 h-4 text-tropical-400 flex-shrink-0" />
                <span className="text-latte/80">בן גוריון 7, אשקלון</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm">
                <Phone className="w-4 h-4 text-tropical-400 flex-shrink-0" />
                <a href="tel:08-1234567" className="text-latte/80 hover:text-latte transition-colors">
                  08-123-4567
                </a>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm">
                <Mail className="w-4 h-4 text-tropical-400 flex-shrink-0" />
                <a href="mailto:info@coffeeland.co.il" className="text-latte/80 hover:text-latte transition-colors">
                  info@coffeeland.co.il
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">שעות פתיחה</h3>
            <div className="space-y-2 text-sm text-latte/80">
              <div className="flex justify-between">
                <span>ראשון - חמישי</span>
                <span>8:00 - 20:00</span>
              </div>
              <div className="flex justify-between">
                <span>שישי</span>
                <span>8:00 - 14:00</span>
              </div>
              <div className="flex justify-between">
                <span>שבת</span>
                <span>19:00 - 23:00</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-tropical-400">
              <Clock className="w-4 h-4" />
              <span>עכשיו פתוח</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-latte/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-latte/60">
              © {currentYear} CoffeLand. כל הזכויות שמורות.
            </p>
            <nav className="flex space-x-6 rtl:space-x-reverse text-sm">
              <Link href="/privacy" className="text-latte/60 hover:text-latte transition-colors">
                מדיניות פרטיות
              </Link>
              <Link href="/terms" className="text-latte/60 hover:text-latte transition-colors">
                תקנון
              </Link>
              <Link href="/cookies" className="text-latte/60 hover:text-latte transition-colors">
                מדיניות קוקיז
              </Link>
              <Link href="/data-requests" className="text-latte/60 hover:text-latte transition-colors">
                בקשות נתונים
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
