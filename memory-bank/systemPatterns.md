# CoffeeLand - System Patterns

## Architecture Overview

CoffeeLand is built as a **modern, server-rendered Next.js application** using the App Router architecture. The system prioritizes performance, accessibility, and maintainability.

### High-Level Architecture

```
┌─────────────────────────────────────────────┐
│          Browser (User Device)              │
│  ┌────────────┐  ┌──────────────────────┐  │
│  │ React UI   │  │ Framer Motion        │  │
│  │ Components │  │ Animations           │  │
│  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│          Next.js App Router                 │
│  ┌────────────┐  ┌──────────────────────┐  │
│  │ SSR Pages  │  │ API Routes           │  │
│  │ (RSC)      │  │ (/api/calendar, etc) │  │
│  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│          Data Layer (Phase 1)               │
│  ┌────────────┐  ┌──────────────────────┐  │
│  │ Mock Data  │  │ Static JSON          │  │
│  │ Files      │  │ (calendar events)    │  │
│  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────┘
```

### Future State (Phase 2+)

```
Data Layer → [Google Calendar API, Supabase/DB, Payment Gateway]
```

## Key Technical Decisions

### 1. Next.js App Router
**Decision:** Use Next.js 14+ with App Router (not Pages Router)

**Rationale:**
- Modern React Server Components for performance
- Improved routing and layouts
- Better developer experience
- Built-in optimizations (images, fonts, analytics)

**Impact:**
- All pages in `/app` directory
- Server components by default (mark 'use client' only when needed)
- Route groups for organization: `(public)`, `(admin-future)`

### 2. TypeScript Throughout
**Decision:** Strict TypeScript for all code

**Rationale:**
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

**Impact:**
- All files use `.ts` or `.tsx`
- Strict mode enabled
- Shared types in `/types` directory

### 3. Tailwind CSS + shadcn/ui
**Decision:** Tailwind for styling, shadcn/ui for base components

**Rationale:**
- Rapid development with utility classes
- Consistent design system
- No CSS-in-JS runtime overhead
- shadcn components are customizable (copy-paste, not NPM package)

**Impact:**
- Custom color palette in `tailwind.config.ts`
- shadcn components in `/components/ui`
- Global styles minimal (just resets and CSS variables)

### 4. Framer Motion for Animations
**Decision:** Use Framer Motion for complex animations

**Rationale:**
- Declarative animation API
- Gestures (swipe, drag) built-in
- AnimatePresence for enter/exit
- Excellent mobile performance

**Impact:**
- Import from 'framer-motion'
- Used for: carousel, dialogs, hover effects, scroll animations
- Respects `prefers-reduced-motion`

### 5. Mock Data First, API Ready
**Decision:** Start with static data, architect for future API integration

**Rationale:**
- Fast initial development
- No external dependencies yet
- Easy to swap mock with real API later

**Impact:**
- `/lib/calendar-mock-data.ts` contains sample events
- API routes structure (`/app/api/calendar/*`) ready for real integration
- Clear separation: data layer → API routes → UI components

## Component Architecture

### Component Organization

```
/components
  /ui               # shadcn base components (Button, Dialog, etc.)
  /layout           # Header, Footer, Container
  /hero             # HeroCarousel
  /navigation       # NavTiles
  /gallery          # Gallery, Lightbox
  /calendar         # CalendarTabs, EventCard, etc.
  /floating         # FloatingPassButton, PassDialog
  /dialogs          # ExitIntentDialog
  /forms            # ContactMiniForm
```

### Component Patterns

#### Server Components (Default)
Used for: Layouts, static content, data fetching
```tsx
// No 'use client' directive
// Can fetch data directly
// Cannot use hooks or event handlers
```

#### Client Components
Used for: Interactivity, animations, state
```tsx
'use client'
// Can use useState, useEffect, event handlers
// Cannot fetch data server-side
```

#### Compound Components
Used for: Complex UI with sub-components
```tsx
<Calendar>
  <Calendar.Tabs />
  <Calendar.View />
  <Calendar.EventCard />
</Calendar>
```

### State Management

**Local State (useState):** For component-specific state (open/closed, selected tab)

**URL State (searchParams):** For shareable state (calendar date, filters)

**Context (React Context):** For theme, analytics, global UI state (future)

**No Global State Library:** Not needed for Phase 1. Avoid Redux/Zustand complexity.

### Data Fetching Pattern

```
Page (Server Component)
  ↓ fetch data
API Route (/app/api/calendar/availability/route.ts)
  ↓ process
Mock Data File (lib/calendar-mock-data.ts)
  ↓ return
CalendarEvent[] (typed)
```

Future: Replace mock data file with Google Calendar API calls

## Design Patterns

### 1. Composition Over Configuration
Components accept children and compose together:
```tsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Body</Card.Content>
</Card>
```

### 2. Render Props for Flexibility
```tsx
<Gallery
  renderItem={(image) => <CustomImageCard image={image} />}
/>
```

### 3. Custom Hooks for Logic Reuse
```tsx
useExitIntent() → tracks mouse leave
useCalendarEvents(type) → fetches calendar data
useWhatsApp(message) → generates WhatsApp link
```

### 4. Variants with CVA (Class Variance Authority)
```tsx
const buttonVariants = cva("base-classes", {
  variants: {
    color: { primary: "...", secondary: "..." },
    size: { sm: "...", lg: "..." }
  }
})
```

## Styling System

### Color Palette (CSS Variables)

```css
:root {
  --color-primary: #4C2C21;       /* חום כהה */
  --color-secondary: #8D5A40;     /* קפוצ'ינו */
  --color-background: #E8DED1;    /* לאטה */
  --color-accent: #5F614C;        /* ירוק טרופי */
  --color-text-light: #2A1C15;
  --color-text-dark: #F9F7F3;
}
```

### Tailwind Configuration

```js
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      // ...
    }
  }
}
```

### Typography Scale

- **H1:** 28-34px mobile / 40-48px desktop
- **H2:** 22-26px mobile / 32-36px desktop
- **Body:** 16-18px (comfortable reading)
- **Small:** 14px (metadata, captions)

**Font:** Heebo (Google Fonts) - supports Hebrew, Latin, numbers

### Spacing Scale

Based on Tailwind's default (4px base unit):
- **xs:** 8px (2)
- **sm:** 12px (3)
- **md:** 16px (4)
- **lg:** 24px (6)
- **xl:** 32px (8)
- **2xl:** 48px (12)

### Responsive Breakpoints

- **sm:** 640px (large phones)
- **md:** 768px (tablets)
- **lg:** 1024px (small desktops)
- **xl:** 1280px (large desktops)

Mobile-first: Write mobile styles first, add `md:` and `lg:` for larger screens

## Accessibility Patterns

### Focus Management

```tsx
// Trap focus in dialogs
<Dialog>
  <FocusTrap>...</FocusTrap>
</Dialog>

// Restore focus after closing
onClose={() => {
  previousFocusRef.current?.focus()
}}
```

### ARIA Labels

```tsx
<button aria-label="Close dialog">✕</button>
<div role="region" aria-label="Event calendar">...</div>
<img src="..." alt="Children playing in playground" />
```

### Keyboard Navigation

- All interactive elements focusable
- Logical tab order
- Escape closes dialogs
- Arrow keys navigate carousel/gallery
- Enter/Space activates buttons

### Screen Reader Support

```tsx
<div aria-live="polite" aria-atomic="true">
  Slide 2 of 3: Birthday Parties
</div>
```

## Performance Patterns

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/images/hero-1.jpg"
  alt="..."
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
  placeholder="blur"
/>
```

### Code Splitting

```tsx
// Heavy components loaded only when needed
const Gallery = dynamic(() => import('@/components/gallery/Gallery'), {
  loading: () => <GallerySkeleton />,
  ssr: false // Client-only if needed
})
```

### Data Caching

```tsx
// API routes with revalidation
export async function GET() {
  const events = await fetchCalendarEvents()
  return NextResponse.json(events, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
    }
  })
}
```

## Analytics Architecture

### Event Tracking

```tsx
// lib/analytics.ts
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }
}

// Usage in components
trackEvent('cta_click', {
  cta_location: 'hero',
  cta_text: 'Book Your Date'
})
```

### Key Events

- `page_view` - Automatic (Next.js)
- `hero_slide_view` - Which slide user saw
- `cta_click` - All call-to-action buttons
- `calendar_tab_change` - Availability vs Classes
- `event_open` - Opening event details
- `lead_submit` - Form submission
- `whatsapp_click` - WhatsApp CTA clicked
- `exit_intent_shown` - Popup displayed
- `exit_intent_convert` - User took action

## Error Handling

### Client-Side Errors

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentThatMightError />
</ErrorBoundary>
```

### API Errors

```ts
try {
  const events = await fetchEvents()
  return NextResponse.json(events)
} catch (error) {
  console.error('Failed to fetch events:', error)
  return NextResponse.json(
    { error: 'Failed to load calendar' },
    { status: 500 }
  )
}
```

### Form Validation

```ts
const formSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  phone: z.string().regex(/^05\d{8}$/, 'Invalid Israeli phone')
})
```

## Security Considerations

### Form Submissions

- Rate limiting (future: middleware)
- reCAPTCHA v3 (invisible)
- Input sanitization
- CSRF protection (Next.js built-in)

### Content Security

- No user-generated content (Phase 1)
- All images served from trusted sources
- WhatsApp links validated and sanitized

### API Routes

- Validate all inputs
- Return minimal error details (no stack traces in production)
- Use environment variables for sensitive data

## Testing Strategy (Future)

### Unit Tests
- Utility functions (`lib/utils.ts`, `lib/analytics.ts`)
- Form validation schemas

### Integration Tests
- API routes with mock data
- Critical user flows (calendar booking, form submission)

### E2E Tests
- Full user journeys (Playwright)
- Mobile and desktop viewports
- Accessibility audits

### Visual Regression
- Chromatic or Percy
- Catch unintended UI changes

## Deployment Architecture

### Vercel (Recommended)

```
Git Push → GitHub
  ↓
Vercel Auto-Deploy
  ↓
Edge Network (Global CDN)
  ↓
Users Worldwide (Fast)
```

### Environment Variables

```
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXX
NEXT_PUBLIC_WHATSAPP_NUMBER=972501234567
GOOGLE_CALENDAR_API_KEY=xxx (future)
RECAPTCHA_SECRET_KEY=xxx (future)
```

### Build Optimization

- Static page generation for all public pages
- Image optimization (WebP, AVIF)
- Font subsetting (Heebo)
- CSS purging (Tailwind)
- JS minification and tree-shaking

## Future System Evolution

### Phase 2: Dynamic Data
- Connect to Google Calendar API (read)
- Implement booking API (write to calendar)
- Add Supabase for form submissions storage

### Phase 3: Advanced Features
- User authentication (NextAuth.js)
- Payment integration (Stripe)
- Admin dashboard (protected routes)
- Email automation (Resend, SendGrid)

### Phase 4: Scale
- Database migration (Postgres)
- CDN for user-uploaded images
- Advanced analytics (Mixpanel, PostHog)
- A/B testing framework

---

This system is designed to start simple and scale gracefully as business needs grow.

