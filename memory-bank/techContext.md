# CoffeeLand - Technical Context

## Technology Stack

### Core Framework
- **Next.js 14.2+** - React framework with App Router
- **React 18.3+** - UI library with Server Components
- **TypeScript 5.5+** - Type-safe JavaScript
- **Node.js 20+** - Runtime environment

### Styling
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **autoprefixer** - Vendor prefix automation

### UI Components
- **shadcn/ui** - Customizable component library (Radix UI primitives)
  - @radix-ui/react-dialog
  - @radix-ui/react-tabs
  - @radix-ui/react-slot
  - @radix-ui/react-separator
- **lucide-react** - Icon library
- **class-variance-authority** - CVA for variant styling
- **clsx** - Conditional className utility
- **tailwind-merge** - Tailwind class merging

### Animation
- **framer-motion** - Animation library for React
- **Supports:** Gestures, transitions, layout animations, scroll triggers

### Forms & Validation
- **react-hook-form** - Performant form library
- **zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Zod integration for react-hook-form

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting (optional, not enforced)
- **TypeScript ESLint** - TypeScript-specific linting rules

### Build & Development
- **Turbopack** - Next.js dev server (fast refresh)
- **SWC** - Fast TypeScript/JavaScript compiler
- **Sharp** - Image optimization (auto-installed by Next.js)

## Package.json Structure

```json
{
  "name": "coffeeland",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.3.0",
    "lucide-react": "^0.424.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "tailwindcss": "^3.4.4",
    "postcss": "^8.4.39",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5"
  }
}
```

## Project Structure

```
coffeeland/
├── memory-bank/              # Project documentation
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   ├── activeContext.md
│   └── progress.md
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   ├── (public)/            # Public-facing pages
│   │   ├── layout.tsx       # Public layout (Header + Footer)
│   │   ├── page.tsx         # Homepage
│   │   ├── playground/
│   │   ├── events/
│   │   ├── workshops/
│   │   ├── menu/
│   │   ├── gallery/
│   │   ├── terms/
│   │   ├── privacy/
│   │   └── cookies/
│   └── api/                 # API routes
│       ├── calendar/
│       │   ├── availability/
│       │   └── classes/
│       └── contact/
├── components/              # React components
│   ├── ui/                 # shadcn base components
│   ├── layout/             # Header, Footer
│   ├── hero/               # HeroCarousel
│   ├── navigation/         # NavTiles
│   ├── gallery/            # Gallery, Lightbox
│   ├── calendar/           # Calendar components
│   ├── floating/           # FloatingPassButton
│   ├── dialogs/            # ExitIntentDialog
│   └── forms/              # ContactMiniForm
├── lib/                    # Utility functions
│   ├── utils.ts           # cn() and helpers
│   ├── analytics.ts       # Google Analytics
│   ├── gcal.ts           # Calendar data fetching
│   └── calendar-mock-data.ts
├── types/                  # TypeScript types
│   └── calendar.ts
├── public/                 # Static assets
│   ├── images/
│   │   ├── hero/
│   │   ├── gallery/
│   │   └── placeholder.svg
│   └── fonts/             # If using local fonts
├── .env.local             # Environment variables (not committed)
├── .env.example           # Example env vars
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── package.json
└── README.md
```

## TypeScript Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Key Settings Explained

- **strict: true** - Enables all strict type checking
- **paths** - Import aliases (`@/` instead of `../../../`)
- **moduleResolution: bundler** - Modern resolution (Next.js 14+)
- **jsx: preserve** - Let Next.js handle JSX transformation

## Tailwind Configuration

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4C2C21',
          foreground: '#F9F7F3',
        },
        secondary: {
          DEFAULT: '#8D5A40',
          foreground: '#F9F7F3',
        },
        background: {
          DEFAULT: '#E8DED1',
          light: '#F9F7F3',
        },
        accent: {
          DEFAULT: '#5F614C',
          foreground: '#F9F7F3',
        },
        text: {
          light: '#2A1C15',
          dark: '#F9F7F3',
        },
        border: 'rgba(77, 44, 33, 0.2)',
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

## Next.js Configuration

### next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  // Experimental features (optional)
  experimental: {
    // optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
```

## Environment Variables

### .env.local (Not committed)

```bash
# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Contact
NEXT_PUBLIC_WHATSAPP_NUMBER=972501234567

# Future: Google Calendar
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=

# Future: reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

### .env.example (Committed)

```bash
# Copy this file to .env.local and fill in the values

# Analytics (Optional for development)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Contact (Required)
NEXT_PUBLIC_WHATSAPP_NUMBER=

# Future integrations
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

## Development Setup

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later (comes with Node.js)
- Git

### Installation Steps

```bash
# 1. Clone repository (or navigate to project directory)
cd coffeeland

# 2. Install dependencies
npm install

# 3. Create environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run development server
npm run dev

# 5. Open browser
# http://localhost:3000
```

### Development Commands

```bash
# Start dev server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server (requires build first)
npm run start

# Lint code
npm run lint

# Type check (no emitting files)
npx tsc --noEmit
```

## Code Style Guidelines

### File Naming
- **Components:** PascalCase (`HeroCarousel.tsx`)
- **Utilities:** camelCase (`utils.ts`, `analytics.ts`)
- **Pages:** lowercase (`page.tsx`, `layout.tsx`)

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal components
4. Internal utilities
5. Types
6. Styles (if any)

```tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { trackEvent } from '@/lib/analytics'
import type { CalendarEvent } from '@/types/calendar'
```

### Component Structure
```tsx
'use client' // Only if needed

import { ... }

interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()
  
  // Event handlers
  const handleClick = () => { ... }
  
  // Render
  return (
    <div>...</div>
  )
}
```

## Performance Budgets

### Target Metrics
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **Total Bundle Size:** < 200KB (initial load, gzipped)

### Optimization Techniques
- Server components by default
- Dynamic imports for heavy components
- Image optimization (next/image)
- Font optimization (next/font)
- Code splitting (automatic in Next.js)
- Static generation where possible

## Browser Support

### Target Browsers
- Chrome/Edge (last 2 versions)
- Safari (last 2 versions)
- Firefox (last 2 versions)
- Mobile Safari (iOS 15+)
- Mobile Chrome (Android 10+)

### Fallbacks
- CSS Grid (with flexbox fallback if needed)
- Modern JavaScript (ES2017+, transpiled by Next.js)
- WebP/AVIF images (with JPEG fallback)

## Accessibility Standards

### Target Compliance
- **WCAG 2.1 Level AA**

### Key Requirements
- Color contrast ≥ 4.5:1 (text)
- Color contrast ≥ 3:1 (UI components)
- Keyboard navigation for all interactive elements
- Screen reader compatibility
- Alt text for images
- Proper heading hierarchy
- Focus indicators
- No motion for `prefers-reduced-motion` users

## Deployment

### Recommended Platform
**Vercel** - Optimized for Next.js

### Alternative Platforms
- Netlify
- AWS Amplify
- Self-hosted (Node.js server)

### Build Configuration
```bash
# Build command
npm run build

# Output directory
.next

# Node version
20.x
```

### Environment Variables (Production)
Set in deployment platform dashboard:
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- Any future API keys

## Monitoring & Analytics (Future)

### Recommended Tools
- **Vercel Analytics** - Real User Monitoring (RUM)
- **Google Analytics 4** - User behavior tracking
- **Sentry** - Error tracking
- **LogRocket** - Session replay (for debugging)

## Future Technical Enhancements

### Phase 2
- Add database (Supabase or PostgreSQL)
- Google Calendar API integration
- Email service (Resend or SendGrid)
- Payment gateway (Stripe)

### Phase 3
- Authentication (NextAuth.js)
- Admin dashboard
- Image upload and storage (Cloudinary or Supabase Storage)
- Advanced analytics

---

This technical foundation is designed for rapid development while maintaining production-ready quality and future scalability.

