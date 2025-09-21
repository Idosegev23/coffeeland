import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';
// import { ThemeProvider } from '@/styles/theme';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';

const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CoffeLand - בית קפה משחקייה באשקלון',
    template: '%s | CoffeLand',
  },
  description: 'בית קפה משחקייה מיוחד לכל המשפחה באשקלון. קפה איכותי, משחקים מהנים, סדנאות מעשירות וחבילות יום הולדת בלתי נשכחות.',
  keywords: ['בית קפה', 'משחקייה', 'אשקלון', 'סדנאות', 'יום הולדת', 'ילדים', 'משפחה', 'קפה'],
  authors: [{ name: 'CoffeLand Team' }],
  creator: 'CoffeLand',
  publisher: 'CoffeLand',
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
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'CoffeLand',
    title: 'CoffeLand - בית קפה משחקייה באשקלון',
    description: 'בית קפה משחקייה מיוחד לכל המשפחה באשקלון. קפה איכותי, משחקים מהנים, סדנאות מעשירות וחבילות יום הולדת בלתי נשכחות.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CoffeLand - בית קפה משחקייה',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoffeLand - בית קפה משחקייה באשקלון',
    description: 'בית קפה משחקייה מיוחד לכל המשפחה באשקלון',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <body className="min-h-screen bg-gradient-to-br from-latte-100 to-latte antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#4c2c21',
              color: '#f3ede4',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '14px',
              fontFamily: 'Heebo, system-ui, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#5f614c',
                secondary: '#f3ede4',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3ede4',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
