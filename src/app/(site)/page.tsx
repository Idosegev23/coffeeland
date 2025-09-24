import React from 'react';
import { Metadata } from 'next';
import { HotBanner } from '@/components/banner/HotBanner';
import { HeroCarousel } from '@/components/hero/HeroCarousel';
import { DayScroller } from '@/components/calendar/DayScroller';
import { EventList } from '@/components/calendar/EventList';
import { Button } from '@/components/ui/Button';
import { StatsSection } from '@/components/stats/StatsSection';
import { Calendar, Users, Camera, Gift, Coffee, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CoffeLand - בית קפה משחקייה באשקלון',
  description: 'בית קפה משחקייה מיוחד לכל המשפחה באשקלון. קפה איכותי, משחקים מהנים, סדנאות מעשירות וחבילות יום הולדת בלתי נשכחות.',
};

export default function HomePage() {
  const today = new Date();

  return (
    <div className="min-h-screen">
      {/* Hot Banner */}
      <HotBanner />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <HeroCarousel />
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Today's Events */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-coffee-900">פעילויות היום</h2>
          <Button asChild variant="outline">
            <Link href="/calendar" className="flex items-center space-x-2 rtl:space-x-reverse">
              <span>לוח פעילויות מלא</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <DayScroller />
        </div>

        <EventList />
      </section>

      {/* Features Grid */}
      <section className="bg-gradient-to-br from-latte-100 to-latte-200 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-coffee-900 mb-4">למה CoffeLand?</h2>
            <p className="text-lg text-coffee-700 max-w-2xl mx-auto">
              אנחנו לא רק בית קפה - אנחנו מקום שבו המשפחות נפגשות, יוצרות זכרונות ונהנות יחד
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Workshops */}
            <div className="card-hover p-8 text-center">
              <div className="w-20 h-20 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-latte" />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-4">סדנאות מעשירות</h3>
              <p className="text-coffee-700 mb-6 leading-relaxed">
                יוגה הורה-ילד, יצירה חכמה, סיפור ומוזיקה - פעילויות שמחברות ומעשירות את כל המשפחה
              </p>
              <Button asChild>
                <Link href="/workshops">גלה סדנאות</Link>
              </Button>
            </div>

            {/* Birthday Parties */}
            <div className="card-hover p-8 text-center">
              <div className="w-20 h-20 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-latte" />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-4">ימי הולדת מיוחדים</h3>
              <p className="text-coffee-700 mb-6 leading-relaxed">
                חבילות מותאמות אישית עם משחקים, יצירה ועוגה טעימה - יום הולדת שלא ישכחו
              </p>
              <Button asChild>
                <Link href="/services">חבילות יום הולדת</Link>
              </Button>
            </div>

            {/* Gallery */}
            <div className="card-hover p-8 text-center">
              <div className="w-20 h-20 bg-tropical-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-latte" />
              </div>
              <h3 className="text-xl font-semibold text-coffee-900 mb-4">רגעים מיוחדים</h3>
              <p className="text-coffee-700 mb-6 leading-relaxed">
                צפו בגלריה שלנו ותראו את השמחה והחיוכים של הילדים וההורים במהלך הפעילויות
              </p>
              <Button asChild>
                <Link href="/gallery">צפה בגלריה</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-tropical-600 text-latte py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">מוכנים לחוויה בלתי נשכחת?</h2>
          <p className="text-xl mb-8 opacity-90">
            הצטרפו אלינו לחוויה משפחתית מיוחדת בלב אשקלון
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-latte text-tropical-600 hover:bg-latte-200 text-lg px-8"
            >
              <Link href="/calendar">הירשמו לסדנה</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-latte text-latte hover:bg-latte hover:text-tropical-600 text-lg px-8"
            >
              <Link href="/events-contact">צרו קשר לאירוע</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="container mx-auto px-4 py-12">
        <div className="card p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-coffee-900 mb-4">בואו לבקר אותנו</h3>
              <div className="space-y-3 text-coffee-700">
                <p className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-medium">כתובת:</span>
                  <span>בן גוריון 7, אשקלון</span>
                </p>
                <p className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-medium">טלפון:</span>
                  <a href="tel:08-1234567" className="hover:text-tropical-600">08-123-4567</a>
                </p>
                <p className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="font-medium">שעות פתיחה:</span>
                  <span>ראשון-חמישי 8:00-20:00, שישי 8:00-14:00, שבת 19:00-23:00</span>
                </p>
              </div>
            </div>
            <div className="bg-latte-200 rounded-lg h-48 flex items-center justify-center">
              <p className="text-coffee-600">מפה תוטמע כאן</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
