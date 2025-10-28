import type { Metadata } from 'next'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const FlipBook = dynamic(() => import('@/components/menu/FlipBook').then(mod => ({ default: mod.FlipBook })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mx-auto mb-4" />
        <p className="text-text-light">טוען תפריט...</p>
      </div>
    </div>
  )
})

export const metadata: Metadata = {
  title: 'תפריט',
  description: 'תפריט משקאות ומזון טרי ב-CoffeeLand. קפה איכותי, מאפים ביתיים וארוחות קלות.',
}

export default function MenuPage() {
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
              דפדפו בתפריט הדיגיטלי שלנו
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
              ארוחה קלה וקפה איכותי
            </h2>
            <p className="text-lg text-text-light/80 leading-relaxed">
              בזמן שהילדים משחקים תוכלו להנות מקפה טרי, מאפים ביתיים ואוכל איכותי.
            </p>
          </div>
        </div>
      </section>

      {/* FlipBook Menu */}
      <section className="relative py-12 sm:py-20 bg-background overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <Image src="/palmLeaf2.svg" alt="" width={200} height={200} className="absolute -top-10 right-20 rotate-45" />
          <Image src="/BananaLeaf1.svg" alt="" width={180} height={180} className="absolute bottom-10 -left-10 -rotate-12" />
          <Image src="/coldshake2.svg" alt="" width={130} height={130} className="absolute top-1/2 right-10 rotate-6" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">
            התפריט שלנו
          </h2>
          <FlipBook pdfUrl="/menu.pdf" />
        </div>
      </section>

      {/* Notes */}
      <section className="relative py-12 sm:py-16 bg-background-light overflow-hidden">
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none opacity-12">
          <Image src="/coldshake3.svg" alt="" width={140} height={140} className="absolute top-10 left-10 -rotate-6" />
          <Image src="/coffebeans.svg" alt="" width={100} height={100} className="absolute bottom-20 right-20 rotate-45" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl mx-auto bg-secondary/10 p-6 rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none">
            <h3 className="text-lg font-semibold text-primary mb-3">שימו לב:</h3>
            <ul className="space-y-2 text-sm text-text-light/80">
              <li>• הכניסה למשחקיה עד גיל 5</li>
              <li>• המקום תחת כשרות מהדרין</li>
              <li>• מומלץ להודיע על אלרגיות מראש</li>
              <li>• התפריט עשוי להשתנות בהתאם לעונה והזמינות</li>
              <li>• לא ניתן להכנס עם אוכל ושתייה למתחם המשחקיה</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

