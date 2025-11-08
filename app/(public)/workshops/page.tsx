'use client'

import * as React from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ClassesView } from '@/components/calendar/ClassesView'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { generateWhatsAppLink } from '@/lib/utils'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const features = [
  {
    lottie: '/lottie/workshops.json',
    title: 'מדריכים מקצועיים',
    description: 'צוות מנוסה ואוהב שמלמד בהנאה',
  },
  {
    lottie: '/lottie/people.json',
    title: 'קבוצות קטנות',
    description: 'תשומת לב אישית לכל משתתף',
  },
  {
    lottie: '/lottie/fresh.json',
    title: 'תוכן איכותי',
    description: 'כל מה שצריך לסדנא מושלמת ומקיפה',
  },
  {
    lottie: '/lottie/parentseasy.json',
    title: 'זמן איכות',
    description: 'רגעי קסם משותפים להורה וילד',
  },
  {
    lottie: '/lottie/hours.json',
    title: 'גמישות מלאה',
    description: 'מגוון רחב של זמנים ונושאים',
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

export default function WorkshopsPage() {
  const whatsappLink = generateWhatsAppLink(
    '972525636067',
    'שלום, אני מעוניין/ת לקבל מידע נוסף על הסדנאות והחוגים'
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
          src="/images/untitled-18.jpg"
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
      <section className="relative py-12 sm:py-16 bg-background-light overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <Image src="/coffebeans.svg" alt="" width={120} height={120} className="absolute top-10 left-10 rotate-45" />
          <Image src="/coldshake.svg" alt="" width={150} height={150} className="absolute bottom-10 right-10 -rotate-12" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              חוגים וסדנאות לכל המשפחה
            </h2>
            <p className="text-lg text-text-light/80 leading-relaxed">
              ב-CoffeeLand אנחנו מציעים מגוון רחב של חוגים וסדנאות שבועיות לילדים ולהורים
              יחד. כל הסדנאות שלנו מתמקדות בלמידה דרך משחק, יצירתיות והנאה.
            </p>
          </div>
        </div>
      </section>

      {/* Features - Bento */}
      <section className="relative py-12 sm:py-16 bg-background overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Image src="/palmLeaf2.svg" alt="" width={200} height={200} className="absolute -top-10 right-20 rotate-45" />
          <Image src="/BananaLeaf1.svg" alt="" width={180} height={180} className="absolute bottom-10 -left-10 -rotate-12" />
          <Image src="/coldshake2.svg" alt="" width={130} height={130} className="absolute top-1/2 right-10 rotate-6" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            למה להצטרף אלינו?
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

      {/* Classes and Workshops */}
      <section className="py-12 sm:py-16 lg:py-20" id="classes">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-3">
              החוגים והסדנאות שלנו
            </h2>
            <p className="text-lg text-text-light/70 max-w-2xl mx-auto">
              צפו בחוגים והסדנאות השבועיים המתקיימים אצלנו
            </p>
          </div>
          <ClassesView />
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
          <h2 className="text-3xl font-bold mb-4">בואו ליצור ולגלות ביחד</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            בדקו את לוח השיעורים למעלה ובחרו את החוג המתאים לכם
          </p>
          <div className="flex justify-center">
            <Button variant="secondary" size="lg" asChild>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                <MessageCircle className="w-5 h-5" />
                שאלו אותנו
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}

