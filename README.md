# CoffeeLand Website

A modern, family-friendly website for CoffeeLand - a playground, café, and workshops space.

## 🎨 Design System

### Color Palette
- **Primary (חום כהה):** `#4C2C21` - Main text, dark CTAs, logo
- **Secondary (קפוצ'ינו):** `#8D5A40` - Secondary backgrounds, highlights  
- **Background (לאטה):** `#E8DED1` - Main background, light sections
- **Accent (ירוק טרופי):** `#5F614C` - Action buttons, highlights, icons
- **Text Light:** `#2A1C15` - High contrast on light backgrounds
- **Text Dark:** `#F9F7F3` - White-cream on dark backgrounds

### Typography
- **Font:** Heebo (Google Fonts) - Supports Hebrew, Latin, numbers
- **H1:** 28-34px (mobile) / 40-48px (desktop)
- **H2:** 22-26px (mobile) / 32-36px (desktop)
- **Body:** 16-18px
- **Small:** 14px

## 🚀 Getting Started

### Prerequisites
- Node.js 20.x or later
- npm 10.x or later

### Installation

```bash
# Install dependencies
npm install

# Create environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
coffeeland/
├── memory-bank/              # Project documentation
├── app/                      # Next.js App Router
│   ├── (public)/            # Public-facing pages
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
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
├── types/                  # TypeScript types
└── public/                 # Static assets
```

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Key Features

- **Hero Carousel:** 3 rotating slides for playground, events, workshops
- **5 Navigation Tiles:** Quick access to main sections
- **Calendar System:** Availability view and recurring classes schedule
- **Gallery:** Photo showcase with lightbox viewing
- **Floating Pass Button:** Always-accessible CTA for passes/memberships
- **Exit Intent Popup:** Last-chance engagement before user leaves
- **Contact Forms:** Quick inquiry with WhatsApp integration
- **Mobile-First:** Optimized for mobile devices

## 📱 Responsive Breakpoints

- **sm:** 640px (large phones)
- **md:** 768px (tablets)
- **lg:** 1024px (small desktops)
- **xl:** 1280px (large desktops)

## ♿ Accessibility

Built to WCAG 2.1 Level AA standards:
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast ≥ 4.5:1
- Focus indicators
- Skip to content link

## 🔧 Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## 📊 Performance Targets

- **FCP (First Contentful Paint):** < 1.5s
- **LCP (Largest Contentful Paint):** < 2.5s
- **TTI (Time to Interactive):** < 3.5s
- **CLS (Cumulative Layout Shift):** < 0.1
- **Bundle Size:** < 200KB (initial, gzipped)

## 🔮 Future Enhancements

### Phase 2
- Real Google Calendar API integration
- Online booking system
- Payment processing for passes
- Email confirmations

### Phase 3
- User accounts
- Admin dashboard
- Analytics dashboard
- Customer reviews

## 📝 Content Management

### Replacing Placeholder Content

**Images:**
- Hero images: `public/images/hero/`
- Gallery images: `public/images/gallery/`

**Text Content:**
- Homepage: `app/(public)/page.tsx`
- Other pages: `app/(public)/[page]/page.tsx`

**Calendar Events:**
- Mock data: `lib/calendar-mock-data.ts`
- API routes: `app/api/calendar/*/route.ts`

### Connecting Google Calendar

See `memory-bank/techContext.md` for detailed instructions on connecting your Google Calendar to replace mock data.

## 🌐 Deployment

### Recommended: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard.

### Alternative Platforms
- Netlify
- AWS Amplify
- Self-hosted (Node.js server)

## 📚 Documentation

Comprehensive documentation available in `memory-bank/`:
- `projectbrief.md` - Project overview and objectives
- `productContext.md` - User experience and product vision
- `systemPatterns.md` - Architecture and design patterns
- `techContext.md` - Technology stack and setup
- `activeContext.md` - Current focus and decisions
- `progress.md` - Development progress tracker

## 📄 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For questions or support, contact the project owner.

---

**Built with ❤️ for families**

