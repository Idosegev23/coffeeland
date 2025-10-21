import type { Metadata } from 'next'
import Image from 'next/image'
import { CalendarTabs } from '@/components/calendar/CalendarTabs'
import { Button } from '@/components/ui/button'
import { Palette, Music, ChefHat, Microscope, Heart, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'סדנאות וחוגים',
  description: 'סדנאות הורה-ילד וחוגים שבועיים ב-CoffeeLand. אומנות, מוזיקה, בישול, מדע ועוד.',
}

const categories = [
  {
    icon: Palette,
    title: 'אומנות ויצירה',
    description: 'ציור, פיסול, קולאז\' ועבודות יד יצירתיות',
    color: 'bg-accent/20 text-accent',
  },
  {
    icon: Music,
    title: 'מוזיקה ותנועה',
    description: 'שירה, ריקוד, כלי הקשה ותנועה יצירתית',
    color: 'bg-secondary/20 text-secondary',
  },
  {
    icon: ChefHat,
    title: 'בישול והכנת מאפים',
    description: 'סדנאות קולינריה מהנות ומעשירות',
    color: 'bg-[#F5A219]/20 text-[#F5A219]',
  },
  {
    icon: Microscope,
    title: 'מדע וגילוי',
    description: 'ניסויים מדעיים וגילוי עולם הטבע',
    color: 'bg-accent/20 text-accent',
  },
]

const benefits = [
  'מדריכים מקצועיים ומנוסים',
  'קבוצות קטנות - תשומת לב אישית',
  'חומרים איכותיים בכל סדנה',
  'אווירה חמה ותומכת',
  'פיתוח יכולות ומיומנויות',
  'זמן איכות הורה-ילד',
]

export default function WorkshopsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[300px] sm:h-[400px] bg-secondary">
        <Image
          src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=400&fit=crop"
          alt="סדנאות וחוגים"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-dark mb-3">
              סדנאות וחוגים
            </h1>
            <p className="text-xl text-text-dark/90 max-w-2xl">
              למידה, יצירה ושמחה ביחד
            </p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12 sm:py-16 bg-background-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              חוגים וסדנאות לכל המשפחה
            </h2>
            <p className="text-lg text-text-light/80 leading-relaxed">
              ב-CoffeeLand אנחנו מציעים מגוון רחב של חוגים וסדנאות שבועיות לילדים ולהורים
              יחד. כל הסדנאות שלנו מתמקדות בלמידה דרך משחק, יצירתיות והנאה. המדריכים
              שלנו מקצועיים, מנוסים ומלאי אהבה למה שהם עושים.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            סוגי הסדנאות שלנו
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 space-y-3">
                    <div className={`w-14 h-14 ${category.color} rounded-full flex items-center justify-center mx-auto`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-primary text-lg">
                      {category.title}
                    </h3>
                    <p className="text-sm text-text-light/70">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Calendar */}
      <CalendarTabs />

      {/* Benefits */}
      <section className="py-12 sm:py-16 bg-background-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-8 text-center">
              למה להצטרף לחוגים שלנו?
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-background p-4 rounded-lg"
                >
                  <Star className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-text-light/80">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">בואו ליצור ולגלות ביחד</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            בדקו את לוח השיעורים למעלה ובחרו את החוג המתאים לכם
          </p>
          <Button
            variant="secondary"
            size="lg"
            asChild
          >
            <a href="/#calendar">לצפייה בלוח שיעורים</a>
          </Button>
        </div>
      </section>
    </>
  )
}

