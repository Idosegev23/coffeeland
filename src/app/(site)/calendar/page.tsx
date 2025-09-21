'use client';

import React, { useState } from 'react';
import { DayScroller } from '@/components/calendar/DayScroller';
import { EventList } from '@/components/calendar/EventList';
import { Button } from '@/components/ui/Button';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    priceMax: '',
    category: 'all',
    availableOnly: true,
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      ageMin: '',
      ageMax: '',
      priceMax: '',
      category: 'all',
      availableOnly: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-latte-100 to-latte">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-coffee-900 mb-2">לוח פעילויות</h1>
          <p className="text-lg text-coffee-700">
            גלו את הסדנאות והפעילויות המרתקות שלנו ותרשמו מקום עוד היום
          </p>
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>מסנני חיפוש</span>
          </Button>
          
          <div className="text-sm text-coffee-600">
            בחרו תאריך כדי לראות את הפעילויות המתוכננות
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="card p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Age Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-coffee-900">
                  גיל מינימום
                </label>
                <input
                  type="number"
                  value={filters.ageMin}
                  onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                  placeholder="גיל מינימום"
                  className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-coffee-900">
                  גיל מקסימום
                </label>
                <input
                  type="number"
                  value={filters.ageMax}
                  onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                  placeholder="גיל מקסימום"
                  className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-coffee-900">
                  מחיר מקסימום (₪)
                </label>
                <input
                  type="number"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  placeholder="מחיר מקסימום"
                  className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-coffee-900">
                  קטגוריה
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tropical-600"
                >
                  <option value="all">כל הקטגוריות</option>
                  <option value="yoga">יוגה</option>
                  <option value="crafts">יצירה</option>
                  <option value="music">מוזיקה</option>
                  <option value="story">סיפור</option>
                </select>
              </div>
            </div>

            {/* Available Only Checkbox */}
            <div className="flex items-center mt-4 space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="availableOnly"
                checked={filters.availableOnly}
                onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                className="rounded border-coffee-300 text-tropical-600 focus:ring-tropical-600"
              />
              <label htmlFor="availableOnly" className="text-sm text-coffee-900">
                הצג רק פעילויות עם מקומות פנויים
              </label>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end mt-4">
              <Button variant="ghost" onClick={clearFilters} size="sm">
                נקה מסננים
              </Button>
            </div>
          </div>
        )}

        {/* Date Scroller */}
        <div className="mb-8">
          <DayScroller 
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Events List */}
        <EventList selectedDate={selectedDate} />

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-coffee-900 mb-4">
              לא מצאתם מה שחיפשתם?
            </h3>
            <p className="text-coffee-700 mb-6">
              צרו קשר איתנו ונעזור לכם למצוא את הפעילות המושלמת או ליצור אירוע מותאם אישית
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="tel:08-1234567">התקשרו אלינו</a>
              </Button>
              <Button asChild variant="outline">
                <a href="mailto:info@coffeeland.co.il">שלחו מייל</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
