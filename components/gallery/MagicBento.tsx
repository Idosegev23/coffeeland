'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BentoCard {
  id: string
  image: string
  label?: string
  title: string
  description?: string
}

interface MagicBentoProps {
  cards: BentoCard[]
  textAutoHide?: boolean
  enableStars?: boolean
  enableSpotlight?: boolean
  enableBorderGlow?: boolean
  enableTilt?: boolean
  enableMagnetism?: boolean
  clickEffect?: boolean
  spotlightRadius?: number
  particleCount?: number
}

export function MagicBento({
  cards,
  textAutoHide = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  clickEffect = true,
  spotlightRadius = 300,
}: MagicBentoProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enableSpotlight) return

    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [enableSpotlight])

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableBorderGlow) return

    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    card.style.setProperty('--glow-x', `${x}%`)
    card.style.setProperty('--glow-y', `${y}%`)
    card.style.setProperty('--glow-intensity', '1')
  }

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    card.style.setProperty('--glow-intensity', '0')
  }

  return (
    <div className="bento-section relative" ref={containerRef}>
      <style>{`
        .card-grid {
          display: grid;
          gap: 0.5em;
          padding: 0.75em;
          max-width: 54em;
          margin: 0 auto;
          font-size: clamp(1rem, 0.9rem + 0.5vw, 1.5rem);
        }

        .card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          width: 100%;
          max-width: 100%;
          padding: 1.25em;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 0;
          background: rgba(232, 222, 209, 0.5);
          backdrop-filter: blur(10px);
          font-weight: 300;
          overflow: hidden;
          transition: all 0.3s ease;

          --glow-x: 50%;
          --glow-y: 50%;
          --glow-intensity: 0;
          --glow-radius: ${spotlightRadius}px;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(76, 44, 33, 0.2);
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 0;
        }

        .card__image {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 1;
          transition: opacity 0.3s ease, filter 0.3s ease;
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 0;
        }

        .card:hover .card__image {
          opacity: 0.6;
          filter: blur(2px);
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          border-bottom-left-radius: 28px;
          border-bottom-right-radius: 0;
        }

        .card__header,
        .card__content {
          display: flex;
          position: relative;
          z-index: 1;
          color: #2A1C15;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .card:hover .card__header,
        .card:hover .card__content {
          opacity: 1;
        }

        .card__header {
          gap: 0.75em;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card__content {
          flex-direction: column;
          gap: 0.5em;
          background: rgba(232, 222, 209, 0.95);
          backdrop-filter: blur(8px);
          padding: 1em;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 0;
        }

        .card__label {
          font-size: 12px;
          font-weight: 600;
          color: #5F614C;
          background: rgba(95, 97, 76, 0.2);
          padding: 0.25em 0.75em;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card__title {
          font-weight: 700;
          font-size: 16px;
          margin: 0;
          color: #4C2C21;
        }

        .card__description {
          font-size: 13px;
          line-height: 1.4;
          opacity: 0.9;
          color: #2A1C15;
        }

        .card--text-autohide .card__title,
        .card--text-autohide .card__description {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card--text-autohide .card__title {
          -webkit-line-clamp: 2;
          line-clamp: 2;
        }

        .card--text-autohide .card__description {
          -webkit-line-clamp: 3;
          line-clamp: 3;
        }

        @media (max-width: 599px) {
          .card-grid {
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: 100px;
            width: 96%;
            margin: 0 auto;
            padding: 0.5em;
            gap: 0.5em;
          }

          .card {
            width: 100%;
            height: 100%;
            min-height: unset;
            padding: 0.75em;
          }

          /* Mobile Bento Layout - מגוון גדלים */
          .card:nth-child(1) {
            grid-column: span 2;
            grid-row: span 2;
          }

          .card:nth-child(2) {
            grid-column: span 2;
            grid-row: span 2;
          }

          .card:nth-child(3) {
            grid-column: span 4;
            grid-row: span 1;
          }

          .card:nth-child(4) {
            grid-column: span 2;
            grid-row: span 2;
          }

          .card:nth-child(5) {
            grid-column: span 2;
            grid-row: span 2;
          }

          .card:nth-child(6) {
            grid-column: span 4;
            grid-row: span 2;
          }

          .card__title {
            font-size: 13px;
          }

          .card__description {
            font-size: 10px;
          }

          .card__label {
            font-size: 9px;
            padding: 0.2em 0.5em;
          }

          .card__content {
            padding: 0.6em;
          }
        }

        @media (min-width: 600px) and (max-width: 1023px) {
          .card-grid {
            grid-template-columns: repeat(6, 1fr);
            grid-auto-rows: 140px;
          }

          /* Tablet Bento Layout */
          .card:nth-child(1) {
            grid-column: span 3;
            grid-row: span 2;
          }

          .card:nth-child(2) {
            grid-column: span 3;
            grid-row: span 1;
          }

          .card:nth-child(3) {
            grid-column: span 2;
            grid-row: span 2;
          }

          .card:nth-child(4) {
            grid-column: span 4;
            grid-row: span 1;
          }

          .card:nth-child(5) {
            grid-column: span 2;
            grid-row: span 1;
          }

          .card:nth-child(6) {
            grid-column: span 2;
            grid-row: span 2;
          }

          .card:nth-child(7) {
            grid-column: span 2;
            grid-row: span 1;
          }

          .card:nth-child(8) {
            grid-column: span 2;
            grid-row: span 1;
          }

          .card:nth-child(9) {
            grid-column: span 3;
            grid-row: span 2;
          }

          .card:nth-child(10) {
            grid-column: span 3;
            grid-row: span 1;
          }

          .card:nth-child(11) {
            grid-column: span 3;
            grid-row: span 1;
          }

          .card:nth-child(12) {
            grid-column: span 3;
            grid-row: span 2;
          }
        }

        @media (min-width: 1024px) {
          .card-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .card {
            aspect-ratio: 4/3;
            min-height: 200px;
          }

          /* Desktop Bento Layout - MagicBento Original */
          .card:nth-child(3) {
            grid-column: span 2;
            grid-row: span 2;
          }

          .card:nth-child(4) {
            grid-column: 1 / span 2;
            grid-row: 2 / span 2;
          }

          .card:nth-child(6) {
            grid-column: 4;
            grid-row: 3;
          }
        }

        /* Border glow effect */
        .card--border-glow::after {
          content: '';
          position: absolute;
          inset: 0;
          padding: 6px;
          background: radial-gradient(
            var(--glow-radius) circle at var(--glow-x) var(--glow-y),
            rgba(95, 97, 76, calc(var(--glow-intensity) * 0.6)) 0%,
            rgba(95, 97, 76, calc(var(--glow-intensity) * 0.3)) 30%,
            transparent 60%
          );
          border-radius: inherit;
          mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          mask-composite: subtract;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 2;
        }

        .card--border-glow:hover::after {
          opacity: 1;
        }

        ${enableSpotlight ? `
          .global-spotlight {
            position: fixed;
            width: ${spotlightRadius * 2}px;
            height: ${spotlightRadius * 2}px;
            border-radius: 50%;
            background: radial-gradient(
              circle,
              rgba(95, 97, 76, 0.15) 0%,
              transparent 70%
            );
            pointer-events: none;
            z-index: 100;
            mix-blend-mode: screen;
            transition: opacity 0.3s ease;
          }
        ` : ''}

        @media (prefers-reduced-motion: reduce) {
          .card,
          .card__image,
          .global-spotlight {
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      {enableSpotlight && (
        <div
          className="global-spotlight"
          style={{
            left: mousePosition.x - spotlightRadius,
            top: mousePosition.y - spotlightRadius,
          }}
        />
      )}

      <div className="card-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={cn(
              'card',
              textAutoHide && 'card--text-autohide',
              enableBorderGlow && 'card--border-glow'
            )}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            onClick={clickEffect ? () => {} : undefined}
          >
            <div className="card__image">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                loading="lazy"
              />
            </div>

            <div className="card__header">
              {card.label && <span className="card__label">{card.label}</span>}
            </div>

            <div className="card__content">
              <h3 className="card__title">{card.title}</h3>
              {card.description && (
                <p className="card__description">{card.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

