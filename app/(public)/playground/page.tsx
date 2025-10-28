'use client'

import * as React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { generateWhatsAppLink } from '@/lib/utils'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

interface CardType {
  id: string
  name: string
  price: number
  sale_price: number | null
  entries_count: number
  description: string | null
  type: string
  is_active: boolean
}

const features = [
  {
    lottie: '/lottie/safty.json',
    title: 'בטיחות מקסימלית',
    description: 'ציוד מותאם במיוחד לגילאי 0-5, משטחי משחק רכים ופיקוח מתמיד',
  },
  {
    lottie: '/lottie/people.json',
    title: 'מותאם במיוחד לגילאי 0-5',
    description: 'אזורי משחק מותאמים לתינוקות, פעוטות וילדים עד גיל 5',
  },
  {
    lottie: '/lottie/parentseasy.json',
    title: 'נוח להורים',
    description: 'פינות ישיבה נעימות עם קפה איכותי, תפריט מגוון וWi-Fi',
  },
  {
    lottie: '/lottie/hours.json',
    title: 'שעות גמישות',
    description: 'א׳-ה׳: 07:30-21:00 | ו׳: 07:30-15:00 | ש׳: סגור',
  },
]


function LottieIcon({ src }: { src: string }) {
  const [animationData, setAnimationData] = React.useState<any>(null)

  React.useEffect(() => {
    fetch(src)
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error('Error loading Lottie:', err))
  }, [src])

  if (!animationData) {
    return <div className="w-full h-full animate-pulse bg-accent/20 rounded-full" />
  }

  return (
    <Lottie
      animationData={animationData}
      loop={true}
      autoplay={true}
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default function PlaygroundPage() {
  const supabase = createClientComponentClient()
  const [cardTypes, setCardTypes] = React.useState<CardType[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    loadCardTypes()
  }, [])

  const loadCardTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('card_types')
        .select('*')
        .eq('type', 'playground')
        .eq('is_active', true)
        .order('entries_count', { ascending: true })

      if (error) throw error

      setCardTypes(data || [])
    } catch (err) {
      console.error('Error loading card types:', err)
    } finally {
      setLoading(false)
    }
  }

  const whatsappLink = generateWhatsAppLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972501234567',
    'שלום, אני מעוניין/ת לקבל מידע נוסף על המשחקייה'
  )

  return (
    <>
      {/* Hero */}
      <section className="relative h-[300px] sm:h-[400px] bg-secondary overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image src="/BananaLeaf1.svg" alt="" width={300} height={300} className="absolute -top-10 -left-10 rotate-12" style={{ animationDelay: '0s' }} />
          <Image src="/palmLeaf.svg" alt="" width={250} height={250} className="absolute top-20 -right-10 -rotate-12" style={{ animationDelay: '1s' }} />
        </div>
        
        <Image
          src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=1200&h=400&fit=crop"
          alt="משחקייה"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-dark mb-3">
              המשחקייה שלנו
            </h1>
            <p className="text-xl text-text-dark/90 max-w-2xl">
              מקום בטוח ומהנה לילדים, נוח ונעים להורים
            </p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="relative py-12 sm:py-16 bg-background-light overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <Image src="/coffebeans.svg" alt="" width={120} height={120} className="absolute top-10 left-10 rotate-45" />
          <Image src="/coldshake.svg" alt="" width={150} height={150} className="absolute bottom-10 right-10 -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              מרחב משחק מושלם לגיל הרך
            </h2>
            <p className="text-lg text-text-light/80 leading-relaxed">
              המשחקייה של CoffeeLand היא מרחב בטוח ונקי לילדים מגיל 0-5. אנחנו מציעים 
              שטח משחק גדול עם מתקנים מתנפחים, משטחים רכים ומתקני משחק מעוצבים. 
              בזמן שהילדים נהנים, ההורים יכולים להירגע בבית הקפה שלנו עם מבט לילדים שלהם.
            </p>
          </div>
          
          {/* Placeholder Image */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=600&fit=crop"
                alt="משחקייה CoffeeLand"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-12 sm:py-16 bg-background overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Image src="/palmLeaf2.svg" alt="" width={200} height={200} className="absolute -top-10 right-20 rotate-45" />
          <Image src="/BananaLeaf1.svg" alt="" width={180} height={180} className="absolute bottom-10 -left-10 -rotate-12" />
          <Image src="/coldshake2.svg" alt="" width={130} height={130} className="absolute top-1/2 right-10 rotate-6" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            למה להגיע אלינו?
          </h2>
          <div className="max-w-4xl mx-auto">
            {/* Bento Grid - 4 קלפים */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* קארד 1 - שמאל למעלה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[0].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[0].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-3">{features[0].description}</p>
              </Card>

              {/* קארד 2 - ימין למעלה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[1].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[1].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-3">{features[1].description}</p>
              </Card>

              {/* קארד 3 - שמאל למטה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[2].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[2].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-3">{features[2].description}</p>
              </Card>

              {/* קארד 4 - ימין למטה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[3].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[3].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-3">{features[3].description}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-12 sm:py-16 bg-background-light overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-12">
          <Image src="/coldshake3.svg" alt="" width={140} height={140} className="absolute top-10 left-10 -rotate-6" />
          <Image src="/coffebeans.svg" alt="" width={100} height={100} className="absolute bottom-20 right-20 rotate-45" />
          <Image src="/palmLeaf.svg" alt="" width={160} height={160} className="absolute bottom-10 left-1/3 rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-primary text-center mb-4">
            מחירים
          </h2>
          <p className="text-center text-text-light/70 mb-12 max-w-2xl mx-auto">
            בחרו את האופציה המתאימה לכם
          </p>
          
          {loading ? (
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cardTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-light/70">אין כרטיסיות זמינות כרגע</p>
              <p className="text-sm text-text-light/50 mt-2">צרו איתנו קשר לפרטים</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {cardTypes.map((card, index) => {
                const displayPrice = card.sale_price || card.price
                const hasDiscount = card.sale_price && card.sale_price < card.price
                const isPopular = index === 1 // אמצעי הוא הפופולרי
                
                return (
                  <Card
                    key={card.id}
                    className={`rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none ${isPopular ? 'border-accent border-2' : ''}`}
                  >
                    {isPopular && (
                      <div className="bg-accent text-accent-foreground px-3 py-1 text-sm font-semibold text-center rounded-t-lg">
                        הכי משתלם
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{card.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold text-accent">
                          ₪{displayPrice}
                        </div>
                        {hasDiscount && (
                          <div className="text-lg text-text-light/50 line-through">
                            ₪{card.price}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-text-light/70">
                        {card.entries_count} כניסות
                      </p>
                      {card.description && (
                        <p className="text-xs text-text-light/60">{card.description}</p>
                      )}
                      {hasDiscount && (
                        <div className="text-xs font-semibold text-accent">
                          חיסכון של ₪{card.price - (card.sale_price || 0)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                רכשו כרטיסייה
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 bg-accent text-accent-foreground overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image src="/BananaLeaf1.svg" alt="" width={250} height={250} className="absolute -top-10 left-10 rotate-12" />
          <Image src="/palmLeaf2.svg" alt="" width={220} height={220} className="absolute -bottom-10 right-10 -rotate-45" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">מוכנים להגיע?</h2>
          <p className="text-lg mb-8 opacity-90">
            אין צורך בהזמנה מראש - פשוט מגיעים ונהנים!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                שאלו אותנו
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent">
              <a href="/gallery">לגלריית תמונות</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

