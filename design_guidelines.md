# Design Guidelines: BookIt - Professional Service Booking Platform

## Design Approach
**Hybrid Approach**: Linear's sharp typography and information hierarchy combined with Airbnb's booking clarity. Professional, business-grade aesthetic that communicates trust and efficiency. Serbian language interface requires careful attention to text length and Cyrillic readability.

## Core Design Principles
1. **Professional Excellence**: Clean, sophisticated interface that feels like a premium business tool
2. **Mobile-First Focus**: Primary design for mobile (max-w-md), expand gracefully to tablet/desktop admin
3. **Refined Simplicity**: Minimal decorative elements, maximum functional clarity
4. **Subtle Elegance**: Understated gradients and animations enhance without distraction
5. **Category Distinction**: Each service type (barber, salon, café, wellness, sports) maintains unique visual identity through subtle gradient treatments

## Typography System
**Sharp, Professional Hierarchy**:
- **Display**: text-3xl font-bold tracking-tight for hero headings
- **Headers**: text-xl font-semibold tracking-tight for section titles
- **Subheaders**: text-base font-semibold for card titles
- **Body**: text-base font-normal with leading-relaxed for readability
- **Metadata**: text-sm font-medium for labels, timestamps
- **Supporting**: text-xs font-normal for secondary info

**Cyrillic Optimization**: Ensure font selection supports Serbian characters with proper weight rendering. Use system fonts or Google Fonts with complete Cyrillic coverage.

## Layout & Spacing
**Spacing Primitives**: Tailwind units **2, 4, 6, 8**
- Mobile container: max-w-md, min-h-screen, rounded-none (full screen on mobile)
- Content padding: px-6 py-4
- Card spacing: gap-6 between major sections, gap-4 within cards
- Component padding: p-6 for major cards, p-4 for compact elements
- Vertical rhythm: mb-8 for sections, mb-6 for subsections

## Component Library

### Navigation
**Bottom Navigation Bar**:
- Height: h-16, fixed position with backdrop-blur-lg
- 5 primary actions: Početna, Rezervacije, Pretraga, Poruke, Profil
- Active state: Icon color shift + subtle text weight change
- Icons from Heroicons (outline for inactive, solid for active)

### Hero & Featured Content
**Business Detail Hero**:
- Full-width hero image: h-72 with subtle overlay gradient (top-to-bottom)
- Business logo overlay: Circular container (w-24 h-24) with white background, positioned at bottom-left of hero with -mb-12 offset
- Content starts below hero with pt-16 to accommodate logo overlap
- Floating action buttons over hero: backdrop-blur-md with bg-white/90 treatment

**Category Cards** (Horizontal Scroll):
- Width: w-56 per card with gap-4
- Image area: h-40 with rounded-2xl, object-cover
- Gradient overlay: Subtle category-specific gradient (opacity-20)
- Text overlay: Business name (font-semibold), category (text-sm), rating indicator

### Cards & Containers
**Primary Business Cards**:
- rounded-2xl with shadow-sm (subtle elevation)
- Image thumbnail: h-48 with rounded-t-2xl
- Content area: p-6 with structured info hierarchy
- Interactive state: Subtle shadow-md on press (no hover lift on mobile)

**Service Selection Cards**:
- Grid layout: 2 columns on mobile (grid-cols-2 gap-4)
- Compact height: p-4 with icon + title + price stacked
- Selected state: Border treatment (border-2) instead of background fill
- Duration and price: Flex row with justify-between

### Forms & Inputs
**Search & Input Fields**:
- Height: h-12 for all inputs (consistent touch targets)
- Rounded: rounded-xl with subtle border
- Background: Light neutral fill (not pure white)
- Icon placement: pl-12 for icon-prefixed inputs
- Focus: Single-pixel border color change, no shadow

**Date & Time Selection**:
- Calendar: 7-column grid with day cells (w-11 h-11)
- Time slots: Vertical list (not horizontal scroll) with clear AM/PM indicators
- Selected state: Filled background, rounded-lg
- Available slots: Border outline style
- Unavailable: Reduced opacity with strikethrough

### Booking Flow Specifics
**Confirmation Screen**:
- Sticky summary card at top with total and key details
- Itemized breakdown: Service name, duration, specialist, date/time
- Payment section: Clean button stack for payment methods
- CTA: Full-width button (h-12) fixed at bottom with safe-area padding

**Status & Feedback**:
- Booking status badges: rounded-full, px-3 py-1, text-xs font-semibold
- Status colors: Confirmed (subtle green), Pending (neutral), Cancelled (subtle red)
- Toast notifications: Slide from top, auto-dismiss after 3s

### Lists & Tables
**Booking List Items**:
- Card-per-booking: rounded-xl, p-4, mb-4
- Top row: Business name + status badge
- Second row: Date/time with calendar icon
- Third row: Service details
- Action buttons: Icon-only (3 dots) for more options

**Admin Dashboard** (Desktop):
- Sidebar navigation: w-64, fixed left
- Main content: Full-height scrollable area
- Stats grid: 4-column layout showing key metrics (total bookings, revenue, active services, ratings)
- Reservation table: Sortable columns, pagination, quick actions

## Images
**Hero Images** (Critical):
- Business detail pages: High-quality establishment photos showing ambiance
- Service category headers: Lifestyle photography representing service type
- Specialist profiles: Professional headshots in circular crops (w-16 h-16)

**Image Treatment**:
- All images: object-cover with consistent aspect ratios
- Hero overlays: Linear gradient from transparent to black/20 at bottom
- Thumbnail quality: Sharp, optimized for mobile bandwidth

## Screen Architecture

### Primary Screens
1. **Home**: Featured businesses, category navigation, recent bookings widget, search bar at top
2. **Category Browse**: Filtered business grid, map view toggle, sort/filter controls
3. **Business Detail**: Hero image, info section, services list, specialist selection, reviews, booking CTA
4. **Booking Flow**: 4-step wizard (service → date → time → confirm) with progress indicator
5. **My Bookings**: Tabbed view (Predstojece/Prošle), quick reschedule/cancel actions
6. **Messages**: Chat interface with business, threaded conversations
7. **Profile**: User info, payment methods, preferences, booking history

### Admin Screens (Desktop)
- **Dashboard**: Stats overview, today's schedule, quick actions
- **Calendar View**: Week/month grid with all reservations
- **Services Manager**: CRUD for services, pricing, availability
- **Customer Database**: Searchable client list with booking history

## Animations
**Minimal, Professional Motion**:
- Screen transitions: 0.3s fade only (no slide/transform)
- Button press: Subtle opacity change (0.9) on active state
- Card interactions: No animations, rely on visual state changes
- Loading: Simple spinner (1s rotation), no skeleton screens
- Modal appearance: 0.2s fade with backdrop

## Accessibility & Language
- Touch targets: min-h-11 (44px) for all interactive elements
- Focus indicators: 2px offset ring on all focusable elements
- Serbian text: Allow for longer text strings in buttons/labels (Cyrillic can be 20% longer)
- Form labels: Always visible, never placeholder-only
- Error states: Icon + text combination for clarity

## Responsive Strategy
- **Mobile (base)**: Full feature set, optimized for one-handed use
- **Tablet (md:)**: Expand cards to 3-column grid, show more content per view
- **Desktop (lg:)**: Admin panels utilize full width, side-by-side booking flow, persistent sidebar navigation