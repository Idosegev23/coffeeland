import React from 'react';
import { Metadata } from 'next';
import { EventsContactForm } from '@/components/forms/EventsContactForm';

export const metadata: Metadata = {
  title: 'תיאום אירועים | CoffeLand',
  description: 'תאמו יום הולדת מיוחד או אירוע משפחתי ב-CoffeLand. חבילות מותאמות אישית עם משחקים, יצירה ועוגה טעימה.',
};

export default function EventsContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte py-12">
      <div className="container mx-auto px-4">
        <EventsContactForm />
      </div>
    </div>
  );
}
