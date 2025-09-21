'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function DayScroller() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDates, setVisibleDates] = useState<Date[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateDates();
  }, [selectedDate]);

  const generateDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    
    // Generate 30 days starting from today
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    setVisibleDates(dates);
  };

  const scrollToDate = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getDayName = (date: Date) => {
    return new Intl.DateTimeFormat('he-IL', { weekday: 'short' }).format(date);
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const getMonthName = (date: Date) => {
    return new Intl.DateTimeFormat('he-IL', { month: 'short' }).format(date);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        {/* Left Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 ml-2"
          onClick={() => scrollToDate('left')}
          aria-label="גלול שמאלה"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Date Scroller */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-3 rtl:space-x-reverse py-2 px-1">
            {visibleDates.map((date, index) => {
              const selected = isSelected(date);
              const today = isToday(date);
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'flex-shrink-0 flex flex-col items-center p-3 rounded-lg min-w-[60px] transition-all duration-200',
                    selected
                      ? 'bg-tropical-600 text-latte shadow-md'
                      : today
                      ? 'bg-tropical-100 text-tropical-700 hover:bg-tropical-200'
                      : 'bg-latte-100 text-coffee-700 hover:bg-latte-200'
                  )}
                  aria-label={`בחר תאריך ${formatDate(date, 'long')}`}
                >
                  <span className="text-xs font-medium mb-1">
                    {getDayName(date)}
                  </span>
                  <span className="text-lg font-bold mb-1">
                    {getDayNumber(date)}
                  </span>
                  <span className="text-xs opacity-80">
                    {getMonthName(date)}
                  </span>
                  {today && !selected && (
                    <div className="w-1 h-1 bg-tropical-600 rounded-full mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Arrow */}
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 mr-2"
          onClick={() => scrollToDate('right')}
          aria-label="גלול ימינה"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
