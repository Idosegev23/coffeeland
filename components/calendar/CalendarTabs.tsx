'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AvailabilityView } from './AvailabilityView'
import { ClassesView } from './ClassesView'
import { analytics } from '@/lib/analytics'

export function CalendarTabs() {
  const [activeTab, setActiveTab] = useState<'availability' | 'classes'>('availability')

  const handleTabChange = (value: string) => {
    const tab = value as 'availability' | 'classes'
    setActiveTab(tab)
    analytics.calendarTabChange(tab)
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20" id="calendar">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
            לוח זמנים
          </h2>
          <p className="text-lg text-text-light/70 max-w-2xl mx-auto">
            בדקו זמינות לאירועים או צפו בחוגים והסדנאות השבועיים
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="availability" className="text-base">
              זמינות לאירועים
            </TabsTrigger>
            <TabsTrigger value="classes" className="text-base">
              חוגים וסדנאות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="mt-6">
            <AvailabilityView />
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <ClassesView />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

