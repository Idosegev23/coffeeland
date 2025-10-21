import Image from 'next/image'

const decorations = [
  // עלי בננה
  { src: '/BananaLeaf1.svg', mobileSize: 180, desktopSize: 550, opacity: 0.2, top: '5%', left: '-10%', rotation: 25 },
  { src: '/BananaLeaf1.svg', mobileSize: 160, desktopSize: 500, opacity: 0.18, top: '55%', left: '90%', rotation: -35 },
  
  // עלי דקל
  { src: '/palmLeaf.svg', mobileSize: 200, desktopSize: 600, opacity: 0.22, top: '0%', left: '85%', rotation: -20 },
  { src: '/palmLeaf2.svg', mobileSize: 170, desktopSize: 520, opacity: 0.2, top: '65%', left: '-12%', rotation: 40 },
  { src: '/palmLeaf.svg', mobileSize: 160, desktopSize: 480, opacity: 0.18, top: '35%', left: '82%', rotation: 15 },
  { src: '/palmLeaf2.svg', mobileSize: 150, desktopSize: 450, opacity: 0.17, top: '85%', left: '88%', rotation: -30 },
  
  // משקאות קרים
  { src: '/coldshake.svg', mobileSize: 100, desktopSize: 320, opacity: 0.24, top: '20%', left: '3%', rotation: 12 },
  { src: '/coldshake2.svg', mobileSize: 95, desktopSize: 300, opacity: 0.22, top: '78%', left: '85%', rotation: -18 },
  { src: '/coldshake3.svg', mobileSize: 100, desktopSize: 310, opacity: 0.23, top: '48%', left: '1%', rotation: -10 },
  { src: '/coldDrinks.svg', mobileSize: 90, desktopSize: 280, opacity: 0.21, top: '82%', left: '6%', rotation: 25 },
  
  // פולי קפה
  { src: '/coffebeans.svg', mobileSize: 80, desktopSize: 240, opacity: 0.26, top: '12%', left: '8%', rotation: 30 },
  { src: '/coffebeans.svg', mobileSize: 70, desktopSize: 220, opacity: 0.25, top: '42%', left: '88%', rotation: -25 },
  { src: '/coffebeans.svg', mobileSize: 75, desktopSize: 230, opacity: 0.25, top: '72%', left: '10%', rotation: 15 },
]

// For sections - relative positioning within section
export function SectionDecorations() {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {decorations.map((decoration, index) => (
        <div
          key={index}
          className="absolute transition-all duration-300"
          style={{
            top: decoration.top,
            left: decoration.left,
            opacity: decoration.opacity,
            transform: `rotate(${decoration.rotation}deg)`,
          }}
        >
          {/* Mobile */}
          <div className="block sm:hidden" style={{ width: decoration.mobileSize, height: decoration.mobileSize }}>
            <Image
              src={decoration.src}
              alt=""
              fill
              className="object-contain"
              loading="lazy"
            />
          </div>
          {/* Desktop */}
          <div className="hidden sm:block" style={{ width: decoration.desktopSize, height: decoration.desktopSize }}>
            <Image
              src={decoration.src}
              alt=""
              fill
              className="object-contain"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// For global page background - fixed positioning seamless across entire page
export function GlobalDecorations() {
  // More decorations for full page coverage - מפוזר יותר!
  const globalDecorations = [
    // עלי בננה - גם בצדדים וגם באמצע
    { src: '/BananaLeaf1.svg', mobileSize: 180, desktopSize: 550, opacity: 0.2, top: '5%', left: '-10%', rotation: 25 },
    { src: '/BananaLeaf1.svg', mobileSize: 160, desktopSize: 500, opacity: 0.18, top: '25%', left: '92%', rotation: -35 },
    { src: '/BananaLeaf1.svg', mobileSize: 140, desktopSize: 420, opacity: 0.16, top: '40%', left: '45%', rotation: 15 },
    { src: '/BananaLeaf1.svg', mobileSize: 170, desktopSize: 520, opacity: 0.19, top: '55%', left: '-8%', rotation: 30 },
    { src: '/BananaLeaf1.svg', mobileSize: 165, desktopSize: 510, opacity: 0.17, top: '75%', left: '90%', rotation: -25 },
    { src: '/BananaLeaf1.svg', mobileSize: 150, desktopSize: 450, opacity: 0.15, top: '90%', left: '30%', rotation: 40 },
    
    // עלי דקל - מפוזרים יותר
    { src: '/palmLeaf.svg', mobileSize: 200, desktopSize: 600, opacity: 0.22, top: '2%', left: '88%', rotation: -20 },
    { src: '/palmLeaf2.svg', mobileSize: 170, desktopSize: 520, opacity: 0.2, top: '18%', left: '-10%', rotation: 40 },
    { src: '/palmLeaf.svg', mobileSize: 140, desktopSize: 420, opacity: 0.17, top: '30%', left: '60%', rotation: -35 },
    { src: '/palmLeaf.svg', mobileSize: 160, desktopSize: 480, opacity: 0.18, top: '35%', left: '85%', rotation: 15 },
    { src: '/palmLeaf2.svg', mobileSize: 150, desktopSize: 450, opacity: 0.17, top: '48%', left: '-12%', rotation: -30 },
    { src: '/palmLeaf2.svg', mobileSize: 130, desktopSize: 400, opacity: 0.16, top: '60%', left: '35%', rotation: 20 },
    { src: '/palmLeaf.svg', mobileSize: 180, desktopSize: 550, opacity: 0.19, top: '65%', left: '87%', rotation: 25 },
    { src: '/palmLeaf2.svg', mobileSize: 175, desktopSize: 530, opacity: 0.18, top: '82%', left: '-9%', rotation: -35 },
    { src: '/palmLeaf.svg', mobileSize: 145, desktopSize: 430, opacity: 0.17, top: '95%', left: '65%', rotation: -15 },
    
    // משקאות קרים - גם באמצע
    { src: '/coldshake.svg', mobileSize: 100, desktopSize: 320, opacity: 0.24, top: '12%', left: '5%', rotation: 12 },
    { src: '/coldshake2.svg', mobileSize: 85, desktopSize: 260, opacity: 0.21, top: '20%', left: '50%', rotation: -25 },
    { src: '/coldshake2.svg', mobileSize: 95, desktopSize: 300, opacity: 0.22, top: '28%', left: '3%', rotation: -18 },
    { src: '/coldshake3.svg', mobileSize: 90, desktopSize: 280, opacity: 0.22, top: '38%', left: '70%', rotation: 18 },
    { src: '/coldshake3.svg', mobileSize: 100, desktopSize: 310, opacity: 0.23, top: '42%', left: '2%', rotation: -10 },
    { src: '/coldDrinks.svg', mobileSize: 90, desktopSize: 280, opacity: 0.21, top: '58%', left: '6%', rotation: 25 },
    { src: '/coldshake.svg', mobileSize: 85, desktopSize: 270, opacity: 0.2, top: '66%', left: '55%', rotation: -20 },
    { src: '/coldshake.svg', mobileSize: 95, desktopSize: 300, opacity: 0.23, top: '72%', left: '4%', rotation: 15 },
    { src: '/coldshake2.svg', mobileSize: 100, desktopSize: 310, opacity: 0.22, top: '88%', left: '87%', rotation: -20 },
    
    // פולי קפה - מפוזרים בכל המסך
    { src: '/coffebeans.svg', mobileSize: 80, desktopSize: 240, opacity: 0.26, top: '8%', left: '10%', rotation: 30 },
    { src: '/coffebeans.svg', mobileSize: 65, desktopSize: 200, opacity: 0.24, top: '15%', left: '40%', rotation: -10 },
    { src: '/coffebeans.svg', mobileSize: 70, desktopSize: 220, opacity: 0.25, top: '22%', left: '88%', rotation: -25 },
    { src: '/coffebeans.svg', mobileSize: 68, desktopSize: 210, opacity: 0.23, top: '32%', left: '25%', rotation: 40 },
    { src: '/coffebeans.svg', mobileSize: 75, desktopSize: 230, opacity: 0.25, top: '38%', left: '12%', rotation: 15 },
    { src: '/coffebeans.svg', mobileSize: 70, desktopSize: 215, opacity: 0.24, top: '50%', left: '50%', rotation: -30 },
    { src: '/coffebeans.svg', mobileSize: 78, desktopSize: 235, opacity: 0.24, top: '52%', left: '90%', rotation: -15 },
    { src: '/coffebeans.svg', mobileSize: 72, desktopSize: 225, opacity: 0.26, top: '68%', left: '11%', rotation: 20 },
    { src: '/coffebeans.svg', mobileSize: 68, desktopSize: 210, opacity: 0.23, top: '78%', left: '45%', rotation: 35 },
    { src: '/coffebeans.svg', mobileSize: 76, desktopSize: 228, opacity: 0.25, top: '85%', left: '89%', rotation: -30 },
  ]

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {globalDecorations.map((decoration, index) => (
        <div
          key={index}
          className="absolute transition-all duration-300"
          style={{
            top: decoration.top,
            left: decoration.left,
            opacity: decoration.opacity,
            transform: `rotate(${decoration.rotation}deg)`,
          }}
        >
          {/* Mobile */}
          <div className="block sm:hidden" style={{ width: decoration.mobileSize, height: decoration.mobileSize }}>
            <Image
              src={decoration.src}
              alt=""
              fill
              className="object-contain"
              loading="lazy"
            />
          </div>
          {/* Desktop */}
          <div className="hidden sm:block" style={{ width: decoration.desktopSize, height: decoration.desktopSize }}>
            <Image
              src={decoration.src}
              alt=""
              fill
              className="object-contain"
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

