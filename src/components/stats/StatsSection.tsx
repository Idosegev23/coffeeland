'use client';

import React from 'react';
import { Coffee, Calendar, PartyPopper, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  id: string;
  number: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const stats: StatItem[] = [
  {
    id: '1',
    number: '50+',
    label: 'משקאות וחטיפים',
    icon: <Coffee className="w-8 h-8" />,
    color: 'text-coffee-600',
  },
  {
    id: '2',
    number: '15+',
    label: 'סדנאות שבועיות',
    icon: <Calendar className="w-8 h-8" />,
    color: 'text-tropical-600',
  },
  {
    id: '3',
    number: '200+',
    label: 'ימי הולדת מוצלחים',
    icon: <PartyPopper className="w-8 h-8" />,
    color: 'text-accent-600',
  },
  {
    id: '4',
    number: '4.9',
    label: 'דירוג ממוצע',
    icon: <Star className="w-8 h-8 fill-current" />,
    color: 'text-yellow-500',
  },
];

interface StatsSectionProps {
  className?: string;
}

export function StatsSection({ className }: StatsSectionProps) {
  return (
    <section className={cn('py-16 bg-gradient-to-b from-latte-50 to-white', className)}>
      <div className="container mx-auto px-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="text-center p-8 rounded-2xl bg-white shadow-soft hover:shadow-warm transition-all duration-300 group"
            >
              <div className={cn('inline-flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300', stat.color)}>
                {stat.icon}
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-coffee-900">
                  {stat.number}
                </div>
                <div className="text-base text-coffee-600 font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decorative elements */}
        <div className="mt-16 flex justify-center">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <div className="w-2 h-2 rounded-full bg-tropical-300"></div>
            <div className="w-2 h-2 rounded-full bg-coffee-300"></div>
            <div className="w-2 h-2 rounded-full bg-accent-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
