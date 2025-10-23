'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [FlipBookComponent, setFlipBookComponent] = useState<any>(null)

  // Load FlipBook library on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-pageflip').then((module) => {
        console.log('FlipBook loaded:', module)
        console.log('FlipBook default:', module.default)
        setFlipBookComponent(() => module.default)
      }).catch(err => {
        console.error('Failed to load FlipBook:', err)
      })
    }
  }, [])

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768
      if (isMobile) {
        // Mobile: full width
        const width = window.innerWidth - 20
        const height = window.innerHeight * 0.8
        setDimensions({ width: Math.floor(width), height: Math.floor(height) })
      } else {
        // Desktop: each page is 600px wide = 1200px book
        setDimensions({ width: 600, height: 850 })
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
        setTotalPages(pages.length)
        setLoading(false)
      } catch (error) {
        console.error('Error loading PDF:', error)
        setLoading(false)
      }
    }

    loadPDF()
  }, [pdfUrl])

  const nextPage = () => {
    console.log('Next page - bookRef:', bookRef.current)
    if (bookRef.current) {
      try {
        const book = bookRef.current
        console.log('Book methods:', Object.keys(book))

        // Try pageFlip() method
        if (typeof book.pageFlip === 'function') {
          const flip = book.pageFlip()
          console.log('Flip object:', flip, 'methods:', flip ? Object.keys(flip) : 'none')
          if (flip && typeof flip.flipNext === 'function') {
            flip.flipNext()
            return
          }
        }

        // Try direct flipNext
        if (typeof book.flipNext === 'function') {
          book.flipNext()
          return
        }

        // Fallback - just update state
        if (currentPage < totalPages - 1) {
          setCurrentPage(currentPage + 1)
        }
      } catch (e) {
        console.error('Error in nextPage:', e)
      }
    }
  }

  const prevPage = () => {
    console.log('Prev page - bookRef:', bookRef.current)
    if (bookRef.current) {
      try {
        const book = bookRef.current
        console.log('Book methods:', Object.keys(book))

        // Try pageFlip() method
        if (typeof book.pageFlip === 'function') {
          const flip = book.pageFlip()
          console.log('Flip object:', flip, 'methods:', flip ? Object.keys(flip) : 'none')
          if (flip && typeof flip.flipPrev === 'function') {
            flip.flipPrev()
            return
          }
        }

        // Try direct flipPrev
        if (typeof book.flipPrev === 'function') {
          book.flipPrev()
          return
        }

        // Fallback - just update state
        if (currentPage > 0) {
          setCurrentPage(currentPage - 1)
        }
      } catch (e) {
        console.error('Error in prevPage:', e)
      }
    }
  }

  const onFlip = (e: any) => {
    setCurrentPage(e.data)
  }

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

      {!loading && pdfPages.length > 0 && FlipBookComponent && (
        <div className="relative" style={{ transform: 'scaleX(-1)' }}>
          <FlipBookComponent
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
            onFlip={onFlip}
            className=""
            style={{}}
            startPage={currentPage}
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
          </FlipBookComponent>
        </div>
      )}

      {!loading && pdfPages.length > 0 && !FlipBookComponent && (
        <div className="text-center p-8">
          <p className="text-text-light">Loading FlipBook library...</p>
        </div>
      )}

      {/* Navigation Arrows */}
      {!loading && pdfPages.length > 0 && (
        <div className="relative w-full flex justify-center mt-4">
          <div className="relative w-full max-w-md flex justify-between items-center px-4">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="bg-primary text-text-dark p-4 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
              aria-label="עמוד קודם"
              type="button"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <span className="text-text-light text-sm">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1}
              className="bg-primary text-text-dark p-4 rounded-full shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
              aria-label="עמוד הבא"
              type="button"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
