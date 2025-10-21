import type { Metadata } from 'next'
import Image from 'next/image'
import { MagicBento } from '@/components/gallery/MagicBento'

export const metadata: Metadata = {
  title: 'גלריה',
  description: 'צפו בתמונות מהמשחקייה, אירועים וסדנאות ב-CoffeeLand. קבלו הצצה למתקנים שלנו.',
}

export default function GalleryPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[300px] sm:h-[400px] bg-secondary">
        <Image
          src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=400&fit=crop"
          alt="גלריה"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-dark mb-3">
              גלריית תמונות
            </h1>
            <p className="text-xl text-text-dark/90 max-w-2xl">
              רגעים מתוקים מה-CoffeeLand שלנו
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-lg text-text-light/80 leading-relaxed mb-4">
              הציצו לתוך המשחקייה שלנו, צפו בתמונות מאירועים שונים ומסדנאות שהתקיימו
              אצלנו. כל תמונה מספרת סיפור של שמחה, יצירה והנאה משפחתית.
            </p>
            <p className="text-sm text-text-light/60">
              העבר עכבר על כרטיס לצפייה בכותרת ותיאור • אפקט Spotlight ו-Border Glow אינטראקטיבי
            </p>
          </div>

          <MagicBento
            cards={[
              {
                id: '1',
                image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
                label: 'משחקייה',
                title: 'אזור משחק מרכזי',
                description: 'מתקני משחק מגוונים ובטוחים לכל הגילאים'
              },
              {
                id: '2',
                image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
                label: 'סדנאות',
                title: 'סדנת יצירה',
                description: 'פעילויות יצירה והעשרה לילדים'
              },
              {
                id: '3',
                image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop',
                label: 'ימי הולדת',
                title: 'חגיגות שמחות',
                description: 'ימי הולדת בלתי נשכחים עם אירוח מלא'
              },
              {
                id: '4',
                image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
                label: 'בית קפה',
                title: 'פינת הקפה',
                description: 'קפה איכותי ועוגות ביתיות טריות'
              },
              {
                id: '5',
                image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=600&fit=crop',
                label: 'חוגים',
                title: 'חוגי העשרה',
                description: 'חוגים קבועים ופעילויות שבועיות'
              },
              {
                id: '6',
                image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=600&fit=crop',
                label: 'אירועים',
                title: 'אירועים משפחתיים',
                description: 'מקום מושלם לכל חגיגה משפחתית'
              },
              {
                id: '7',
                image: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=600&fit=crop',
                label: 'משחקים',
                title: 'פינת משחקים',
                description: 'משחקי חשיבה ויצירתיות לכל המשפחה'
              },
              {
                id: '8',
                image: 'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800&h=600&fit=crop',
                label: 'קפה',
                title: 'מתקני הקפה',
                description: 'מכונות קפה מקצועיות וברמה גבוהה'
              },
              {
                id: '9',
                image: 'https://images.unsplash.com/photo-1551506448-074afa034c05?w=800&h=600&fit=crop',
                label: 'עוגות',
                title: 'עוגות ומאפים',
                description: 'עוגות טריות ומאפים ביתיים מדי יום'
              },
              {
                id: '10',
                image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&h=600&fit=crop',
                label: 'אווירה',
                title: 'עיצוב חמים',
                description: 'אווירה ביתית ונעימה למשפחות'
              },
              {
                id: '11',
                image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
                label: 'פעילויות',
                title: 'פעילויות מגוונות',
                description: 'מגוון פעילויות והפתעות לילדים'
              },
              {
                id: '12',
                image: 'https://images.unsplash.com/photo-1445633629932-0029acc44e88?w=800&h=600&fit=crop',
                label: 'אווירה',
                title: 'מקום משפחתי',
                description: 'מתאים למשפחות עם ילדים בכל גיל'
              },
            ]}
            textAutoHide={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            clickEffect={true}
            spotlightRadius={300}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">
            רוצים להצטרף לתמונות הבאות?
          </h2>
          <p className="text-lg text-text-light/70 mb-8 max-w-2xl mx-auto">
            בואו לבקר אותנו ולהיות חלק מהקהילה המשפחתית החמה שלנו
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/playground"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 h-12 px-8 py-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm active:scale-[0.98]"
            >
              למשחקייה
            </a>
            <a
              href="/events"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 h-12 px-8 py-2 border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
            >
              לימי הולדת
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

