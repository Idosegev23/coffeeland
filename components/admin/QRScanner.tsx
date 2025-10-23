'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Camera, CameraOff, Keyboard } from 'lucide-react'

interface QRScannerProps {
  onScan: (code: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const startScanning = async () => {
    setError('')
    console.log('🎥 Attempting to start QR scanner...')
    
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('הדפדפן שלך לא תומך בגישה למצלמה')
      }

      // Request camera permission first
      console.log('📹 Requesting camera permission...')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      console.log('✅ Camera permission granted')
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop())

      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner

      console.log('🔍 Starting HTML5 QR Code scanner...')
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          console.log('✅ QR Code scanned:', decodedText)
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Ignore scan errors (happens when no QR is visible)
        }
      )

      setIsScanning(true)
      console.log('✅ Scanner started successfully')
    } catch (err: any) {
      console.error('❌ Error starting scanner:', err)
      const errorMsg = err.name === 'NotAllowedError' 
        ? 'נדרשת הרשאת גישה למצלמה. אנא אפשר גישה והתחל שוב.'
        : err.name === 'NotFoundError'
        ? 'לא נמצאה מצלמה במכשיר.'
        : err.message || 'שגיאה בהפעלת המצלמה'
      
      setError(errorMsg)
      alert(errorMsg + '\n\nהשתמש בהזנה ידנית במקום.')
      setManualMode(true)
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current = null
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
    setIsScanning(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      setManualCode('')
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  if (manualMode) {
    return (
      <div className="space-y-4">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              הזן QR Code ידנית
            </label>
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="הזן את קוד ה-QR"
              className="w-full px-4 py-3 border-2 border-border rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none bg-background-light text-primary focus:border-accent focus:outline-none text-center font-mono"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={!manualCode.trim()}>
              אמת קוד
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setManualMode(false)}
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Scanner Container */}
      <div
        id="qr-reader"
        className={`w-full ${isScanning ? 'block' : 'hidden'} rounded-tl-3xl rounded-tr-3xl rounded-bl-3xl rounded-br-none overflow-hidden bg-black`}
        style={{ 
          minHeight: isScanning ? '400px' : '0',
          maxWidth: '100%'
        }}
      />

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-300 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {!isScanning ? (
          <>
            <Button onClick={startScanning} className="flex-1 gap-2" size="lg">
              <Camera className="w-5 h-5" />
              הפעל מצלמה
            </Button>
            <Button
              variant="outline"
              onClick={() => setManualMode(true)}
              className="gap-2"
              size="lg"
            >
              <Keyboard className="w-5 h-5" />
              הזנה ידנית
            </Button>
          </>
        ) : (
          <Button onClick={stopScanning} variant="outline" className="flex-1 gap-2" size="lg">
            <CameraOff className="w-5 h-5" />
            עצור סריקה
          </Button>
        )}
      </div>

      {/* Instructions */}
      {!isScanning && (
        <p className="text-sm text-text-light/70 text-center">
          מקם את ה-QR של הלקוח מול המצלמה או הזן את הקוד ידנית
        </p>
      )}
    </div>
  )
}

