# CoffeeLand - Active Context

**Last Updated:** October 23, 2025  
**Current Phase:** Full System Expansion - Classes, Workshops & POS  
**Status:** 🟢 Active Development

## Current Focus

מערכת מלאה לבית קפה משפחתי כעת כוללת:
- ✅ משחקייה וכרטיסיות נאמנות (קיים)
- ✅ חוגים וסדנאות עם הרשמה אונליין (חדש!)
- ✅ POS וירטואלי למכירה בקופה (חדש!)
- ✅ סנכרון אוטומטי ליומן Google Calendar (חדש!)
- ✅ תשלומים mockup - מוכן לחיבור Green Invoice (חדש!)

### What We're Building Right Now

**Immediate Task:** Creating the foundational structure

1. ✅ **Memory Bank Complete** - All 6 documentation files created
2. ⏳ **Next.js Project Bootstrap** - Setting up the initial project structure
3. ⏳ **Base Infrastructure** - Creating layouts, global styles, utilities
4. ⏳ **Component Library** - Installing and customizing shadcn/ui components

### What's Working

- **Documentation:** Comprehensive Memory Bank covering all aspects of the project
- **Plan:** Clear 20-step implementation plan with dependencies mapped
- **Vision:** Well-defined design system with warm, family-friendly aesthetic

### What's Not Yet Built

Everything. We're starting fresh. No existing code to refactor or work around.

## Recent Decisions

### Design System Choices

**Color Palette Finalized:**
- Primary (חום כהה): `#4C2C21` - Main text, dark CTAs, logo
- Secondary (קפוצ'ינו): `#8D5A40` - Secondary backgrounds, highlights
- Background (לאטה): `#E8DED1` - Main background, light sections
- Accent (ירוק טרופי): `#5F614C` - Action buttons, highlights, icons
- Text Light: `#2A1C15` - High contrast on light backgrounds
- Text Dark: `#F9F7F3` - White-cream on dark backgrounds

This palette creates a warm, coffee-shop atmosphere that's inviting and family-friendly.

**Typography:**
- Primary font: **Heebo** (Google Fonts)
- Supports Hebrew, Latin, and numbers
- Clean, modern, highly readable
- Sizes: H1 (28-34/40-48), H2 (22-26/32-36), Body (16-18)

**Spacing Philosophy:**
- Mobile-first design
- Generous padding (16-24px mobile, 32-48px desktop)
- Rounded corners everywhere (8px, 12px, 16px)
- Soft shadows instead of hard borders

### Technical Stack Confirmed

- **Framework:** Next.js 14+ with App Router (modern, optimal)
- **Language:** TypeScript (strict mode for reliability)
- **Styling:** Tailwind CSS + shadcn/ui (rapid development, consistent design)
- **Animation:** Framer Motion (smooth, gesture-aware)
- **Forms:** React Hook Form + Zod (performant, type-safe)
- **Icons:** Lucide React (consistent line icons)

### Data Strategy

**Phase 1 (Current):**
- Mock data in static files (`lib/calendar-mock-data.ts`)
- API routes ready for future integration
- No external dependencies yet

**Future Phases:**
- Connect to Google Calendar API
- Add database for form submissions
- Payment processing integration

## Active Challenges & Solutions

### Challenge 1: Placeholder Content
**Issue:** Need realistic content and images without actual business assets yet

**Solution:**
- Use Unsplash API for placeholder images (coffee shop, kids playing, birthday parties)
- Write realistic Hebrew placeholder text that sets the right tone
- Create 12-15 diverse gallery images showing different aspects
- All content clearly marked as "placeholder" for easy replacement

### Challenge 2: Calendar Without Real Data
**Issue:** Need to show functional calendar but no Google Calendar connected yet

**Solution:**
- Create comprehensive mock data with realistic event structure
- Build calendar components that work with CalendarEvent interface
- API routes return mock data now, will swap to real API later
- Architecture is API-ready—just swap the data source

### Challenge 3: RTL (Right-to-Left) Hebrew Support
**Issue:** Hebrew content requires RTL layout, but mixed with LTR elements (images, numbers)

**Solution:**
- Set `dir="rtl"` on root HTML for Hebrew pages
- Use logical properties in CSS (`inline-start` vs `left`)
- Test all components in RTL mode
- English content (if any) gets `dir="ltr"` wrapper

### Challenge 4: Mobile Performance on Slow Connections
**Issue:** Target audience often on mobile with varying connection speeds

**Solution:**
- Aggressive image optimization (next/image with AVIF/WebP)
- Lazy loading for gallery and below-fold content
- Dynamic imports for heavy components
- Minimal JavaScript—prefer server components
- Target: < 3 seconds on 4G connection

## Next Immediate Steps

### This Session Goals

1. **Bootstrap Project** ✅
   - Run `npx create-next-app@latest`
   - Configure TypeScript, Tailwind, ESLint
   - Set up project structure

2. **Install shadcn/ui** ✅
   - Initialize shadcn
   - Install core components (Button, Dialog, Tabs, Card, Badge, Skeleton, Sheet)
   - Customize theme with our color palette

3. **Create Base Files** ✅
   - `app/layout.tsx` with Heebo font
   - `app/globals.css` with CSS variables
   - `lib/utils.ts`, `lib/analytics.ts`
   - `types/calendar.ts`

4. **Build First Components** ✅
   - Header with navigation
   - Footer with contact info
   - Basic page layout

5. **Hero Carousel** 🎯 Next Priority
   - 3 slides with placeholder images
   - Auto-advance with pause/play
   - Accessible (ARIA, keyboard navigation)

## Upcoming Priorities (Next Session)

1. **5 Navigation Tiles** - Visual, tappable grid navigation
2. **Gallery Component** - Lightbox viewing with lazy loading
3. **Calendar System** - Mock data + API routes + display components
4. **Floating Pass Button** - Persistent CTA
5. **Exit Intent Popup** - Last-chance engagement

## Dependencies & Blockers

### Dependencies
- None currently! We're self-contained for Phase 1

### Future Dependencies (Phase 2+)
- Google Calendar API credentials
- WhatsApp Business number
- Google Analytics property ID
- reCAPTCHA keys

### Blockers
- None at this time

## Open Questions

None currently—all initial decisions have been made and documented.

## Testing Approach

### Current Phase (Manual Testing)
- Visual inspection in browser
- Test on multiple screen sizes (mobile, tablet, desktop)
- Keyboard navigation testing
- Screen reader testing (NVDA/VoiceOver)
- RTL layout verification

### Future (Automated Testing)
- Component unit tests (Jest + React Testing Library)
- E2E tests for critical flows (Playwright)
- Visual regression testing (Chromatic)
- Accessibility audits (Lighthouse CI)

## Development Environment

### Local Setup
```bash
Node.js: 20.x
npm: 10.x
Editor: VS Code (recommended)
Browser: Chrome DevTools for debugging
```

### Useful Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check
```

### Browser DevTools Usage
- Mobile device emulation (375px, 428px, 768px, 1024px)
- Network throttling (Fast 3G, Slow 4G)
- Lighthouse audits (Performance, Accessibility, SEO)

## Code Quality Standards

### We're Maintaining
- **TypeScript strict mode** - Catch errors early
- **ESLint rules** - Consistent code style
- **Component modularity** - Small, focused, reusable
- **Accessibility first** - ARIA, keyboard, screen reader from start
- **Performance budgets** - Monitor bundle size, image sizes

### We're Avoiding
- Premature optimization
- Over-engineering (YAGNI principle)
- Inline styles (use Tailwind)
- Any CSS-in-JS runtime libraries
- Large third-party dependencies without evaluation

## Communication with Stakeholders

### Owner Needs to Provide (Later)
- Actual business name and logo
- Real photos of facility
- Menu items and pricing
- Operating hours
- Contact information
- Google Calendar access (Phase 2)

### We'll Provide to Owner
- Fully functional website
- Admin instructions (how to update content)
- Documentation for future developers
- Google Calendar integration guide
- Deployment instructions

## Success Metrics for This Phase

### Phase 1 Complete When:
- ✅ All 20 steps in plan are implemented
- ✅ Website works perfectly on mobile and desktop
- ✅ All interactive elements function smoothly
- ✅ Accessibility audit passes (WCAG AA)
- ✅ Performance targets met (LCP < 2.5s)
- ✅ Documentation complete and accurate
- ✅ Ready for content replacement (easy to swap placeholders)

## Notes & Observations

- The empty starting point is actually an advantage—no technical debt, clean architecture
- Hebrew RTL support must be tested early and often
- Mobile-first approach is critical for this audience
- WhatsApp integration is key—most users prefer it over forms
- Gallery images will be the primary trust-builder
- Calendar transparency reduces booking friction significantly

---

**Status Summary:** Strong start. Clear vision. Comprehensive plan. Ready to build. 🚀

