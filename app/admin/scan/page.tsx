'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QRScanner } from '@/components/admin/QRScanner'
import { UserPassesModal } from '@/components/admin/UserPassesModal'

export default function AdminScanPage() {
  const router = useRouter()
  const [scannedUser, setScannedUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleScan = async (qrCode: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'QR לא תקין')
      }

      const data = await response.json()
      setScannedUser(data)
    } catch (err: any) {
      setError(err.message || 'שגיאה בסריקה')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setScannedUser(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none opacity-10 overflow-hidden">
        <Image src="/BananaLeaf1.svg" alt="" width={400} height={400} className="absolute top-10 left-10 rotate-12" />
        <Image src="/palmLeaf.svg" alt="" width={350} height={350} className="absolute bottom-20 right-10 -rotate-12" />
        <Image src="/coffebeans.svg" alt="" width={180} height={180} className="absolute top-1/3 right-1/4 rotate-45" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/admin" className="gap-2">
                <ArrowRight className="w-4 h-4" />
                חזרה לפאנל
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <Link href="/" className="gap-2">
                <Home className="w-4 h-4" />
                דף הבית
              </Link>
            </Button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
            סריקת QR
          </h1>
          <p className="text-text-light/70">
            סרוק את ה-QR של הלקוח כדי לנצל כרטיסייה או להוסיף חותמת
          </p>
        </div>

        {/* Scanner Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 bg-background-light">
            <QRScanner onScan={handleScan} />

            {/* Loading State */}
            {loading && (
              <div className="mt-4 text-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-text-light/70">מאמת QR...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
                {error}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* User Passes Modal */}
      {scannedUser && (
        <UserPassesModal
          user={scannedUser}
          onClose={handleClose}
        />
      )}
    </div>
  )
}

