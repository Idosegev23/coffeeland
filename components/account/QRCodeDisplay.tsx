'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface QRCodeDisplayProps {
  qrCode: string
  userName: string
}

export function QRCodeDisplay({ qrCode, userName }: QRCodeDisplayProps) {
  const handleDownload = () => {
    const svg = document.getElementById('user-qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    canvas.width = 512
    canvas.height = 512

    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `coffeeland-qr-${qrCode}.png`
        a.click()
        URL.revokeObjectURL(url)
      })
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Card className="rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none p-6 bg-background-light">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold text-primary">ה-QR שלך</h3>
        <p className="text-sm text-text-light/70">
          הראו את הקוד הזה לצוות ב-CoffeeLand בכל ביקור
        </p>

        {/* QR Code */}
        <div className="bg-white p-6 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none inline-block">
          <QRCodeSVG
            id="user-qr-code"
            value={qrCode}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* User Name */}
        <p className="text-lg font-semibold text-primary">{userName}</p>
        <p className="text-xs text-text-light/60 font-mono">ID: {qrCode}</p>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          הורד QR
        </Button>
      </div>
    </Card>
  )
}

