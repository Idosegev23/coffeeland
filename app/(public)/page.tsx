import Link from 'next/link'
import { HeroCarousel } from '@/components/hero/HeroCarousel'
import { NavTiles } from '@/components/navigation/NavTiles'
import { CalendarTabs } from '@/components/calendar/CalendarTabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <NavTiles />
      
      <Separator className="my-0" />

      <CalendarTabs />

      {/* Pass/Membership Section */}
      <section className="py-12 sm:py-16 lg:py-20" id="passes">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            כרטיסיות ומנויים
          </h2>
          <p className="text-lg text-primary/90 max-w-2xl mx-auto mb-8">
            בקרו יותר, חסכו יותר! כרטיסיות ומנויים במחירים מיוחדים
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/passes">רכישת כרטיסיות</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/my-account">איזור אישי</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

