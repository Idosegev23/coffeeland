import type { Metadata } from 'next'
import { Heebo } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  variable: '--font-heebo',
  display: 'swap',
})

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export const metadata: Metadata = {
  title: {
    default: 'CoffeeLand | משחקייה, קפה וסדנאות למשפחות',
    template: '%s | CoffeeLand',
  },
  description:
    'CoffeeLand - מקום חם ומזמין למשפחות. משחקייה בטוחה לילדים, קפה איכותי, ימי הולדת בלתי נשכחים וסדנאות יצירתיות.',
  keywords: [
    'משחקייה',
    'קפה משפחתי',
    'ימי הולדת',
    'סדנאות ילדים',
    'פעילויות הורה-ילד',
    'CoffeeLand',
  ],
  authors: [{ name: 'CoffeeLand' }],
  creator: 'CoffeeLand',
  publisher: 'CoffeeLand',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    title: 'CoffeeLand | משחקייה, קפה וסדנאות למשפחות',
    description: 'מקום חם ומזמין למשפחות - משחקייה, קפה, ימי הולדת וסדנאות',
    siteName: 'CoffeeLand',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoffeeLand | משחקייה, קפה וסדנאות למשפחות',
    description: 'מקום חם ומזמין למשפחות - משחקייה, קפה, ימי הולדת וסדנאות',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-md"
        >
          דלג לתוכן הראשי
        </a>
        {children}
        
        {/* Google Analytics */}
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}

