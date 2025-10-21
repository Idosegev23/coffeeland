import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GlobalDecorations } from '@/components/layout/BackgroundDecorations'
import { FloatingPassButton } from '@/components/floating/FloatingPassButton'
import { ExitIntentDialog } from '@/components/dialogs/ExitIntentDialog'
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <GlobalDecorations />
        <Header />
        <main id="main-content" className="min-h-screen relative" style={{ zIndex: 1 }}>
          {children}
        </main>
        <Footer />
        <FloatingPassButton />
        <ExitIntentDialog />
      </div>
    </AuthProvider>
  )
}

