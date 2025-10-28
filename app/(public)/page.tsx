import Link from 'next/link'
import { HeroCarousel } from '@/components/hero/HeroCarousel'
import { NavTiles } from '@/components/navigation/NavTiles'
import { MagicBento } from '@/components/gallery/MagicBento'
import { CalendarTabs } from '@/components/calendar/CalendarTabs'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <NavTiles />
      
      <Separator className="my-0" />
      
      {/* Gallery Preview Section */}
      <section className="py-12 sm:py-16 lg:py-20" id="gallery-preview">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
              הציצו לתוך המשחקייה
            </h2>
          </div>
          
          <MagicBento
            cards={[
              {
                id: '1',
                image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
                label: 'משחקייה',
                title: 'מתקני משחק מגוונים',
                description: 'מגלשות, טרמפולינות ופינות משחק מאובטחות לכל הגילאים'
              },
              {
                id: '2',
                image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
                label: 'סדנאות',
                title: 'יצירה והנאה',
                description: 'סדנאות יצירה מגוונות לילדים בכל גיל'
              },
              {
                id: '3',
                image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop',
                label: 'ימי הולדת',
                title: 'חגיגות בלתי נשכחות',
                description: 'חבילות מלאות לימי הולדת עם אירוח חם ומקצועי'
              },
              {
                id: '4',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
                label: 'בית קפה',
                title: 'תפריט מגוון',
                description: 'קפה איכותי, עוגות טריות וארוחות קלות להורים וילדים'
              },
              {
                id: '5',
                image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop',
                label: 'חוגים',
                title: 'פעילויות שבועיות',
                description: 'חוגים קבועים ופעילויות העשרה לילדים'
              },
              {
                id: '6',
                image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=600&fit=crop',
                label: 'אירועים',
                title: 'מקום לכל אירוע',
                description: 'מתאים לימי הולדת, חגיגות משפחתיות ואירועים מיוחדים'
              },
            ]}
            textAutoHide={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            clickEffect={true}
            spotlightRadius={300}
          />
          
          <div className="text-center mt-8">
            <a
              href="/gallery"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 h-10 px-6 py-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm active:scale-[0.98]"
            >
              לכל הגלריה
            </a>
          </div>
        </div>
      </section>

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

