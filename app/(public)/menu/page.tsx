import type { Metadata } from 'next'
import Image from 'next/image'
import { Coffee, Sandwich, Croissant, IceCream } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'תפריט',
  description: 'תפריט משקאות ומזון טרי ב-CoffeeLand. קפה איכותי, מאפים ביתיים וארוחות קלות.',
}

const menuCategories = [
  {
    title: 'משקאות חמים',
    icon: Coffee,
    items: [
      { name: 'אספרסו', price: 12 },
      { name: 'אמריקנו', price: 14 },
      { name: 'קפה הפוך', price: 16 },
      { name: 'קפוצ\'ינו', price: 16 },
      { name: 'לאטה', price: 18 },
      { name: 'תה', price: 12 },
      { name: 'שוקו חם', price: 16 },
    ],
  },
  {
    title: 'משקאות קרים',
    icon: IceCream,
    items: [
      { name: 'קפה קר', price: 18 },
      { name: 'אייס לאטה', price: 20 },
      { name: 'פרפה', price: 24 },
      { name: 'מיץ טבעי', price: 16 },
      { name: 'לימונדה', price: 14 },
      { name: 'שייק', price: 22 },
    ],
  },
  {
    title: 'מאפים',
    icon: Croissant,
    items: [
      { name: 'קרואסון', price: 12 },
      { name: 'עוגיות ביתיות', price: 10 },
      { name: 'עוגת שוקולד', price: 18 },
      { name: 'עוגת גבינה', price: 20 },
      { name: 'מאפין', price: 14 },
      { name: 'בורקס', price: 16 },
    ],
  },
  {
    title: 'כריכים וארוחות',
    icon: Sandwich,
    items: [
      { name: 'כריך טונה', price: 28 },
      { name: 'כריך גבינה', price: 24 },
      { name: 'כריך ביצה', price: 22 },
      { name: 'סלט ירקות', price: 32 },
      { name: 'טוסט', price: 20 },
      { name: 'פיצה אישית', price: 26 },
    ],
  },
]

const kidsFavorites = [
  { name: 'שוקו', price: 12 },
  { name: 'מיץ', price: 10 },
  { name: 'עוגיות', price: 8 },
  { name: 'פיצה אישית', price: 20 },
  { name: 'גלידה', price: 14 },
]

export default function MenuPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[300px] sm:h-[400px] bg-secondary">
        <Image
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=400&fit=crop"
          alt="תפריט"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-dark mb-3">
              תפריט המזון והשתייה
            </h1>
            <p className="text-xl text-text-dark/90 max-w-2xl">
              קפה איכותי, מאפים טריים וארוחות קלות
            </p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-12 sm:py-16 bg-background-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              ארוחה קלה וקפה איכותי
            </h2>
            <p className="text-lg text-text-light/80 leading-relaxed">
              בזמן שהילדים משחקים, תוכלו ליהנות מקפה טרי מהקלייה שלנו, מאפים ביתיים
              ואוכל איכותי. כל המנות מוכנות טריות ומהחומרים הטובים ביותר.
            </p>
          </div>
        </div>
      </section>

      {/* Main Menu */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            התפריט שלנו
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {menuCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.title} className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {category.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                          <span>{item.name}</span>
                          <span className="text-accent font-semibold">
                            ₪{item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Kids Favorites */}
      <section className="py-12 sm:py-16 bg-background-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">
              הפייבוריטים של הילדים
            </h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {kidsFavorites.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="text-accent font-semibold">
                        ₪{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto bg-secondary/10 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-primary mb-3">שימו לב:</h3>
            <ul className="space-y-2 text-sm text-text-light/80">
              <li>• כל כרטיסייה כוללת משקה חם אחד להורה</li>
              <li>• ניתן להזמין אוכל ושתייה נוספים בנפרד</li>
              <li>• אנחנו דואגים לכשרות ונקיון מוקפדים</li>
              <li>• מומלץ להודיע על אלרגיות מראש</li>
              <li>• התפריט עשוי להשתנות בהתאם לעונה ולזמינות</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

