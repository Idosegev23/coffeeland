'use client'

import * as React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { MessageCircle, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { generateWhatsAppLink } from '@/lib/utils'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const packages = [
  {
    id: 'basic',
    name: 'חבילה בסיסית',
    price: 1200,
    duration: 2,
    capacity: 15,
    includes: [
      'שימוש במשחקייה למשך 2 שעות',
      'עוגת יום הולדת',
      'שתייה קלה לילדים',
      'צלחות וכוסות חד-פעמיות',
      'קישוט בסיסי',
    ],
  },
  {
    id: 'premium',
    name: 'חבילה פרימיום',
    price: 2000,
    duration: 3,
    capacity: 25,
    popular: true,
    includes: [
      'שימוש במשחקייה למשך 3 שעות',
      'עוגת יום הולדת מעוצבת',
      'שתייה קלה ומאפים לילדים',
      'קפה ועוגה להורים',
      'קישוט מלא של האולם',
      'מנחה/מנחה לפעילות',
      'מוזיקה ומערכת הגברה',
    ],
  },
  {
    id: 'vip',
    name: 'חבילת VIP',
    price: 3500,
    duration: 4,
    capacity: 35,
    includes: [
      'שימוש במשחקייה למשך 4 שעות',
      'עוגת יום הולדת מעוצבת מיוחדת',
      'מזנון מלא לילדים והורים',
      'קפה, שתייה ועוגות',
      'קישוט מלא + בלונים מעופפים',
      'מנחה מקצועי + פעילות מובילה',
      'מוזיקה ומערכת הגברה',
      'צלם מקצועי (1 שעה)',
      'מתנות לאורחים',
    ],
  },
]

const extras = [
  { name: 'צלם מקצועי', price: 400, unit: 'לשעה' },
  { name: 'מופע קוסם', price: 600, unit: 'למופע' },
  { name: 'פעילות אומנות', price: 300, unit: 'לקבוצה' },
  { name: 'הופעת דמות מוכרת', price: 500, unit: 'ל-30 דקות' },
  { name: 'עוגה מיוחדת גדולה', price: 200, unit: 'מחיר נוסף' },
]

const features = [
  {
    lottie: '/lottie/birthday.json',
    title: 'חבילות גמישות',
    description: 'התאמה מושלמת לכל תקציב וסגנון',
  },
  {
    lottie: '/lottie/fresh.json',
    title: 'ללא מאמץ',
    description: 'אנחנו מטפלים בכל הפרטים - אתם פשוט נהנים',
  },
  {
    lottie: '/lottie/people.json',
    title: 'מקום מושלם',
    description: 'משחקייה גדולה, מוגנת ומלאה באטרקציות',
  },
  {
    lottie: '/lottie/coffee.json',
    title: 'אוכל מעולה',
    description: 'עוגות מדהימות, אוכל טעים ושתייה לכולם',
  },
  {
    lottie: '/lottie/gallery.json',
    title: 'רגעים מושלמים',
    description: 'זיכרונות בלתי נשכחים לכל החיים',
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

export default function EventsPage() {
  const whatsappLink = generateWhatsAppLink(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '972501234567',
    'שלום, אני מעוניין/ת לקבל מידע נוסף על חבילות ימי הולדת'
  )

  return (
    <>
      {/* Hero */}
      <section className="relative h-[300px] sm:h-[400px] bg-secondary overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image src="/BananaLeaf1.svg" alt="" width={300} height={300} className="absolute -top-10 -left-10 rotate-12" />
          <Image src="/palmLeaf.svg" alt="" width={250} height={250} className="absolute top-20 -right-10 -rotate-12" />
        </div>
        
        <Image
          src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&h=400&fit=crop"
          alt="אירועים וימי הולדת"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-end pb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-text-dark mb-3">
              אירועים וימי הולדת
            </h1>
            <p className="text-xl text-text-dark/90 max-w-2xl">
              חגיגה בלתי נשכחת עם כל הפינוקים
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
              חגיגה בלתי נשכחת במקום מושלם
            </h2>
            <p className="text-lg text-text-light/80 leading-relaxed">
              אנחנו מציעים חבילות יום הולדת מושלמות במשחקייה הגדולה והמאובזרת שלנו.
              הילדים ישחקו וייהנו במרחב הבטוח והמהנה, בזמן שאתם תירגעו עם קפה ועוגה טעימה.
              כל הפרטים מטופלים - אתם פשוט צריכים להגיע וליהנות מהחגיגה!
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Bento */}
      <section className="relative py-12 sm:py-16 bg-background overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Image src="/palmLeaf2.svg" alt="" width={200} height={200} className="absolute -top-10 right-20 rotate-45" />
          <Image src="/BananaLeaf1.svg" alt="" width={180} height={180} className="absolute bottom-10 -left-10 -rotate-12" />
          <Image src="/coldshake2.svg" alt="" width={130} height={130} className="absolute top-1/2 right-10 rotate-6" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            למה לחגוג אצלנו?
          </h2>
          <div className="max-w-4xl mx-auto">
            {/* Bento Grid - פריסה סימטרית במובייל ודסקטופ */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* קארד 1 - שמאל למעלה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[0].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[0].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-2">{features[0].description}</p>
              </Card>

              {/* קארד 2 - ימין למעלה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[1].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[1].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-2">{features[1].description}</p>
              </Card>

              {/* קארד 3 - רחב באמצע */}
              <Card className="col-span-2 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
                  <LottieIcon src={features[2].lottie} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-text-dark mb-0.5">{features[2].title}</h3>
                  <p className="text-xs sm:text-sm text-text-dark/80 line-clamp-2">{features[2].description}</p>
                </div>
              </Card>

              {/* קארד 4 - שמאל למטה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[3].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[3].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-2">{features[3].description}</p>
              </Card>

              {/* קארד 5 - ימין למטה */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[4].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[4].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-2">{features[4].description}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="relative py-12 sm:py-16 bg-background-light overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-12">
          <Image src="/coldshake3.svg" alt="" width={140} height={140} className="absolute top-10 left-10 -rotate-6" />
          <Image src="/coffebeans.svg" alt="" width={100} height={100} className="absolute bottom-20 right-20 rotate-45" />
          <Image src="/palmLeaf.svg" alt="" width={160} height={160} className="absolute bottom-10 left-1/3 rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">
              חבילות יום הולדת
            </h2>
            <p className="text-lg text-text-light/70">
              בחרו את החבילה המתאימה לכם
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none ${pkg.popular ? 'border-accent border-2 relative' : 'relative'}`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    הכי פופולרי
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-accent mt-2">
                    ₪{pkg.price.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-light/70 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {pkg.duration} שעות
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      עד {pkg.capacity}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-primary">כולל:</p>
                    <ul className="space-y-2">
                      {pkg.includes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-accent mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      שריינו תאריך
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Extras */}
      <section className="relative py-12 sm:py-16 bg-background overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Image src="/palmLeaf2.svg" alt="" width={200} height={200} className="absolute -top-10 right-20 rotate-45" />
          <Image src="/BananaLeaf1.svg" alt="" width={180} height={180} className="absolute bottom-10 -left-10 -rotate-12" />
          <Image src="/coldshake2.svg" alt="" width={130} height={130} className="absolute top-1/2 right-10 rotate-6" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">
              תוספות אופציונליות
            </h2>
            <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {extras.map((extra) => (
                    <div
                      key={extra.name}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <span className="font-medium">{extra.name}</span>
                      <span className="text-accent font-semibold">
                        ₪{extra.price} {extra.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
          <div className="w-16 h-16 mx-auto mb-4">
            <LottieIcon src="/lottie/birthday.json" />
          </div>
          <h2 className="text-3xl font-bold mb-4">בואו נתכנן את החגיגה המושלמת</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            צרו קשר עכשיו לבדיקת זמינות ולקבלת ייעוץ אישי
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                שלחו לנו הודעה
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-transparent border-accent-foreground text-accent-foreground hover:bg-accent-foreground hover:text-accent"
            >
              <a href="/#calendar">לוח זמינות</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

