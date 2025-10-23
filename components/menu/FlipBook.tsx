'use client'

import React, { useRef, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import HTMLFlipBook to avoid SSR issues
const HTMLFlipBook = dynamic(() => import('react-pageflip'), {
  ssr: false,
})

interface PageProps {
  children: React.ReactNode
}

const Page = React.forwardRef<HTMLDivElement, PageProps>(({ children }, ref) => {
  return (
    <div
      ref={ref}
      className="flex items-center justify-center relative"
      style={{
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {children}
    </div>
  )
})

Page.displayName = 'Page'

interface FlipBookProps {
  pdfUrl: string
}

export function FlipBook({ pdfUrl }: FlipBookProps) {
  const bookRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [pdfPages, setPdfPages] = useState<string[]>([])
  const [dimensions, setDimensions] = useState({ width: 550, height: 733 })

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        // Mobile: full width
        const width = window.innerWidth - 20
        const height = window.innerHeight * 0.8
        setDimensions({ width: Math.floor(width), height: Math.floor(height) })
      } else {
        // Desktop: MASSIVE - each page is 800px wide = 1600px book!
        setDimensions({ width: 800, height: 1130 })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const loadPDF = async () => {
      try {
        // Dynamically import pdfjs only on client side
        const pdfjsLib = await import('pdfjs-dist')

        // Set worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

        // Load PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl)
        const pdf = await loadingTask.promise

        const numPages = pdf.numPages
        const pages: string[] = []

        // Render each page to canvas and convert to image with MAXIMUM quality
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdf.getPage(pageNum)
          const viewport = page.getViewport({ scale: 3.5 }) // MAXIMUM quality

          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          if (!context) continue

          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise

          pages.push(canvas.toDataURL('image/jpeg', 0.98)) // Maximum quality JPEG
        }

        setPdfPages(pages)
        setLoading(false)
      } catch (error) {
        console.error('Error loading PDF:', error)
        setLoading(false)
      }
    }

    loadPDF()
  }, [pdfUrl])

  return (
    <div className="flex flex-col items-center gap-6">
      {loading && (
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mx-auto mb-4" />
            <p className="text-text-light">טוען תפריט...</p>
          </div>
        </div>
      )}

      {!loading && pdfPages.length > 0 && (
        <div className="relative" style={{ transform: 'scaleX(-1)' }}>
          <HTMLFlipBook
            ref={bookRef}
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            minWidth={300}
            maxWidth={2400}
            minHeight={400}
            maxHeight={3500}
            maxShadowOpacity={0.2}
            showCover={true}
            mobileScrollSupport={true}
            className=""
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={700}
            usePortrait={true}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {pdfPages.map((pageUrl, index) => (
              <Page key={index}>
                <img
                  src={pageUrl}
                  alt={`עמוד ${index + 1}`}
                  className="w-full h-full object-contain"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </Page>
            ))}
          </HTMLFlipBook>
        </div>
      )}
    </div>
  )
}
