# Design Guidelines: BookIt - Universal Booking Platform

## Design Approach
**Reference-Based Approach**: Drawing inspiration from Airbnb's booking flow clarity, Linear's clean typography, and modern mobile-first platforms. The existing mobile container design establishes the foundation - expand this aesthetic across all new screens while maintaining the established visual language.

## Core Design Principles
1. **Mobile-First Excellence**: All screens designed for mobile viewport first (max-w-md), then adapt for desktop/tablet admin panels
2. **Category Identity**: Each business category maintains its unique gradient background (already established in HTML)
3. **Smooth Transitions**: Maintain existing fade and transform animations for screen changes
4. **Card-Based Hierarchy**: Continue the soft-shadow card system for all content blocks

## Typography System
- **Headings**: Bold weight for all headers (font-bold)
- **Primary Text**: text-base for body, text-lg for section headers
- **Secondary Text**: text-sm for metadata, text-xs for supporting info
- **Hierarchy**: Maintain 3-level system (h1: text-2xl, h2: text-lg, h3: text-base)

## Layout & Spacing
**Spacing Primitives**: Use Tailwind units of **2, 4, 6, and 8** consistently
- Component padding: p-4 to p-6
- Section spacing: mb-6 to mb-8
- Container padding: px-6
- Card gaps: gap-4
- Vertical rhythm: py-8 for major sections

**Layout Structure**:
- Mobile container: max-w-md, max-h-[740px], rounded-[40px]
- Content scrolling: flex-1 overflow-y-auto with pb-24 for nav clearance
- Horizontal scrolling: overflow-x-auto for cards/categories

## Component Library

### Navigation
- **Bottom Navigation Bar**: Fixed at bottom, 4-5 icons (Home, Bookings, Search, Profile)
- Height: h-20, backdrop blur effect
- Active state: Color change on icon and label
- Position: absolute bottom-0 with safe area padding

### Cards & Containers
- **Primary Cards**: rounded-2xl, soft-shadow class (0 4px 16px rgba(0,0,0,0.06))
- **Interactive Cards**: Add hover lift (translateY(-4px)) and enhanced shadow
- **Category Cards**: w-44 for horizontal scroll, gradient backgrounds per category
- **Business Cards**: w-64, includes image area (h-36) and info section (p-4)

### Forms & Inputs
- **Search Bar**: pl-12 (icon space), py-3.5, rounded-2xl, bg-[#F8FAFC]
- **Focus States**: 2px border on focus, outline-offset-2
- **Input Groups**: Stack vertically with mb-4 spacing
- **Buttons**: rounded-xl primary actions, rounded-lg secondary, min-h-12 for touch targets

### Calendar & Time Selection
- **Calendar Grid**: 7-column grid for days, p-2 for each day cell
- **Day Cells**: w-10 h-10, rounded-full, hover scale(1.1)
- **Time Slots**: Horizontal scroll of rounded-lg buttons, py-2 px-4
- **Selected State**: Solid background with white text
- **Disabled State**: Reduced opacity (opacity-40), no interaction

### Lists & Data Display
- **Booking List Items**: Divide with subtle borders, py-4 spacing
- **Status Badges**: rounded-full, px-2.5 py-1, text-xs font-bold
- **Metadata Rows**: Flex layout with justify-between, text-sm
- **Ratings**: Star icon + number + review count in flex row

### Modals & Overlays
- **Confirmation Modals**: Centered, max-w-sm, rounded-3xl, p-6
- **Bottom Sheets**: Slide up from bottom, rounded-t-3xl
- **Backdrop**: Semi-transparent overlay (bg-black/40)

## Screen-Specific Guidelines

### Booking Flow Screens
1. **Business Detail**: Hero image (h-64), scrollable content, sticky book button at bottom
2. **Date Selection**: Calendar grid taking main content area, "Continue" button below
3. **Time Selection**: Scrollable time slots, selected time highlighted, availability indicators
4. **Confirmation**: Summary card with all details, total at bottom, "Confirm Booking" CTA

### Dashboard Screens
- **User Bookings**: Tab navigation (Upcoming/Past), card list of bookings with quick actions
- **Business Admin**: Stats cards at top (3-column grid), table/list view for reservations
- **Desktop Admin**: Expand to full width on large screens, sidebar navigation

### Authentication
- **Login/Register**: Centered form, single column, max-w-sm
- **Social Auth**: Button stack below primary form
- **Profile**: Avatar at top, form fields below, save button fixed at bottom

## Images
**Hero Images**: 
- Business detail pages: Use high-quality photos of the establishment (h-64 on mobile)
- Category showcases: Use in business listing cards (h-36)
- Profile sections: Circular avatars (w-20 h-20 for large, w-11 h-11 for nav)

**Image Treatment**:
- All images use object-cover for consistent aspect ratios
- Overlay gradient on hero images for text legibility
- Blur backdrop for buttons over images: backdrop-blur-sm with bg-white/80

## Accessibility
- All interactive elements: min-h-11 (44px) for touch targets
- Focus rings: 2px solid with offset on all focusable elements
- Labels: Always include sr-only labels for icon-only buttons
- Semantic HTML: Proper heading hierarchy, form labels, ARIA attributes

## Animations
**Minimal Animation Strategy**:
- Screen transitions: fade + translateX (0.35s ease)
- Card hovers: translateY + shadow change (0.3s cubic-bezier)
- Button press: slight scale down (active state)
- No scroll-triggered or complex animations
- Loading states: Simple spinner, no skeleton screens

## Responsive Behavior
- **Mobile (base)**: Primary design target, full feature set
- **Tablet (md:)**: Expand modal widths, show more cards per row
- **Desktop (lg:)**: Admin panels use full width, multi-column layouts for dashboards, side-by-side booking flow