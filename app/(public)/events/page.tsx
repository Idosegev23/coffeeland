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

const eventTypes = [
  {
    id: 'basic',
    name: 'חבילה בסיסית',
    price: '1,000 ₪',
    duration: '2 שעות',
    capacity: 'עד 20 ילדים',
    description: 'החבילה המושלמת לחגיגה קטנה ואינטימית',
    includes: [
      'עד 20 ילדים (כל ילד נוסף 35 ₪)',
      '7 פיצות',
      'כוס ברד לכל ילד',
      'כניסה לג׳ימבורי (משחקייה)',
      'שהייה של 2 שעות במתחם',
    ],
  },
  {
    id: 'standard',
    name: 'חבילה סטנדרטית',
    price: '1,500 ₪',
    duration: '2 שעות',
    capacity: 'עד 20 ילדים + 20 מבוגרים',
    popular: true,
    description: 'החבילה הפופולרית ביותר - כל מה שצריך ליום הולדת מושלם',
    includes: [
      'עד 20 ילדים (כל ילד נוסף 35 ₪)',
      'עד 20 מבוגרים',
      '15 פיצות',
      'כוס ברד לכל ילד',
      'שתייה קלה',
      'קפה לכל מבוגר',
      'כניסה לג׳ימבורי (משחקייה)',
      'שהייה של 2 שעות במתחם',
    ],
  },
]

const premiumAddons = [
  {
    name: 'עוגה מעוצבת אישית',
    price: '300 ₪',
    description: 'עוגה מעוצבת בהתאמה אישית לפי הקונספט שבחרתם',
  },
  {
    name: 'בובת ענק',
    price: '500 ₪',
    description: 'בובת מתנפחת ענקית למשחקי ילדים',
  },
  {
    name: 'מגשי אירוח למבוגרים',
    price: 'החל מ-500 ₪',
    description: 'מגוון מגשים לאירוח המבוגרים',
  },
  {
    name: 'עיצוב בלונים',
    price: '300 ₪',
    description: 'עיצוב מלא של האירוע בבלונים צבעוניים',
  },
  {
    name: 'פנקייקים/קינוחים אישיים',
    price: 'החל מ-200 ₪',
    description: 'פנקייקים או קינוחים אישיים מעוצבים',
  },
]

const invitations = [
  '/invitations/1.png',
  '/invitations/2.png',
  '/invitations/3.png',
  '/invitations/4.png',
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
    title: 'מרחב מושלם',
    description: 'משחקייה מעוצבת בסטייל עם שולחנות מעוצבים לאירוע',
  },
  {
    lottie: '/lottie/coffee.json',
    title: 'אוכל מעולה',
    description: 'תפריט אוכל ושתייה מגוון, עוגה מעוצבת אישית פי קונספט ושירותי בר',
  },
  {
    lottie: '/lottie/gallery.json',
    title: 'תוספות מושלמות',
    description: 'הפעלות, בלונים, בובות מתנפחות, צלמים ועוד מגוון רחב',
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
    '972525636067',
    'שלום, אני מעוניין/ת לקבל מידע נוסף על אירועים וימי הולדת'
  )

  return (
    <>
      {/* Hero */}
      <section className="relative h-[400px] sm:h-[500px] bg-secondary overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <Image src="/BananaLeaf1.svg" alt="" width={300} height={300} className="absolute -top-10 -left-10 rotate-12" />
          <Image src="/palmLeaf.svg" alt="" width={250} height={250} className="absolute top-20 -right-10 -rotate-12" />
        </div>
        
        <Image
          src="/images/untitled-28.webp"
          alt="אירועים וימי הולדת"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative h-full container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-dark mb-4">
              ימי הולדת
            </h1>
            <p className="text-xl sm:text-2xl text-text-dark/90 max-w-2xl mx-auto mb-6">
              חגיגה בלתי נשכחת במקום הכי כיפי בעיר
            </p>
            <p className="text-base sm:text-lg text-text-dark/80 max-w-xl mx-auto">
              אנחנו מטפלים בכל הפרטים - אתם פשוט נהנים ויוצרים זיכרונות
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
              אנחנו מציעים אירועי יום הולדת מושלמים במשחקייה הגדולה והמאובזרת שלנו.
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
            {/* Bento Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* קארד 1 */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[0].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[0].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-2">{features[0].description}</p>
              </Card>

              {/* קארד 2 */}
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

              {/* קארד 4 */}
              <Card className="aspect-square rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none bg-[#4C2C21] border-[#4C2C21] flex flex-col justify-center p-3 sm:p-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mb-2 mx-auto">
                  <LottieIcon src={features[3].lottie} />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-text-dark text-center mb-1">{features[3].title}</h3>
                <p className="text-xs text-text-dark/80 text-center line-clamp-2">{features[3].description}</p>
              </Card>

              {/* קארד 5 */}
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

      {/* Event Types */}
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
              סוגי אירועים
            </h2>
            <p className="text-lg text-text-light/70">
              כל אירוע מותאם במיוחד עבורכם - בחרו את הסגנון שמתאים לכם
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {eventTypes.map((event) => (
              <Card
                key={event.id}
                className={`rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none ${event.popular ? 'border-accent border-2 relative' : 'relative'}`}
              >
                {event.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 bg-accent">
                    הכי פופולרי
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl sm:text-2xl text-center">{event.name}</CardTitle>
                  <p className="text-2xl sm:text-3xl font-bold text-accent text-center mt-2">
                    {event.price}
                  </p>
                  <p className="text-sm text-text-light/70 text-center italic mt-2">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-light/70 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.capacity}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-semibold text-primary text-sm sm:text-base">כולל:</p>
                    <ul className="space-y-2">
                      {event.includes.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                          <span className="text-accent mt-0.5 text-base">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Addons */}
      <section className="relative py-12 sm:py-16 bg-background overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Image src="/BananaLeaf1.svg" alt="" width={180} height={180} className="absolute top-10 left-10 rotate-12" />
          <Image src="/palmLeaf.svg" alt="" width={160} height={160} className="absolute bottom-10 right-10 -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-3">
              תוספות פרימיום
            </h2>
            <p className="text-lg text-text-light/70">
              הפכו את האירוע למושלם עם תוספות מיוחדות
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {premiumAddons.map((addon, index) => (
              <Card
                key={index}
                className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg text-center">{addon.name}</CardTitle>
                  <p className="text-xl font-bold text-accent text-center mt-2">
                    {addon.price}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-light/70 text-center">
                    {addon.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Invitations Gallery - Phone Mockup with Auto-scroll */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-3">
              הזמנות מעוצבות
            </h2>
            <p className="text-base sm:text-lg text-text-light/70 max-w-2xl mx-auto">
              תוכלו לבחור הזמנה מעוצבת ממגוון ההזמנות שלנו
            </p>
          </div>

          {/* Phone Mockup Container */}
          <div className="max-w-xs mx-auto">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative mx-auto" style={{ width: '280px', height: '580px' }}>
                {/* Phone Border and Notch */}
                <div className="absolute inset-0 bg-gray-900 rounded-[45px] shadow-2xl p-3">
                  {/* Screen */}
                  <div className="relative w-full h-full bg-white rounded-[35px] overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-10" />
                    
                    {/* Scrolling Container */}
                    <div className="flex flex-col animate-scroll-invitations">
                      {/* Duplicate images for seamless loop */}
                      {[...invitations, ...invitations].map((invitation, idx) => (
                        <div key={idx} className="relative flex-shrink-0" style={{ width: '100%', height: '580px' }}>
                          <Image
                            src={invitation}
                            alt={`הזמנה ${(idx % invitations.length) + 1}`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-gray-700 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 bg-accent text-accent-foreground overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <Image src="/BananaLeaf1.svg" alt="" width={250} height={250} className="absolute top-10 left-10 rotate-12" />
          <Image src="/palmLeaf.svg" alt="" width={220} height={220} className="absolute bottom-10 right-10 -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              מוכנים לחגוג אצלנו?
            </h2>
            <p className="text-xl mb-8 text-accent-foreground/90">
              רוצים לשמוע עוד? צרו איתנו קשר ונתאים את האירוע המושלם בשבילכם!
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              asChild
            >
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                בואו נדבר!
              </a>
            </Button>
            <p className="text-sm text-accent-foreground/70 mt-4">
              נשמח לספר לכם יותר ולהתאים את האירוע בדיוק בשבילכם
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
