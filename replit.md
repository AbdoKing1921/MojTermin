# MojTermin - Professional Service Booking Platform

## Overview

MojTermin is a mobile-first booking platform for professional services in Serbia. The application enables users to discover and book appointments with various service providers including cafes, beauty salons, barbers, wellness centers, and sports facilities. Built with a focus on mobile-first design with Serbian language support (Cyrillic optimization), the platform follows a hybrid design approach combining Linear's sharp typography with Airbnb's booking clarity.

The application uses a full-stack TypeScript architecture with React on the frontend and Express on the backend, with PostgreSQL as the database via Neon serverless. Authentication is handled through Replit's OIDC system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching (5-minute stale time)

**UI Component System**
- Shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Mobile-first responsive design (max-width: 28rem for mobile container)
- Custom gradient treatments for category distinction
- Focus on accessibility with ARIA labels and semantic HTML

**Design System**
- Neutral color base with CSS variables for theming
- Custom spacing primitives (2, 4, 6, 8 Tailwind units)
- Sharp typography hierarchy optimized for Cyrillic characters
- Professional color palette with subtle gradients for visual distinction

**State Management Strategy**
- React Query for all server state (API data, caching, background refetching)
- Local React state (useState) for UI-only state (form inputs, modals, selections)
- Authentication state managed via custom useAuth hook wrapping React Query
- No global state management library needed due to server-state-first approach

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- HTTP server using Node's native http module
- Custom logging middleware for request/response tracking
- Static file serving in production (Vite dev server in development)

**API Design Pattern**
- RESTful API endpoints under `/api` prefix
- Consistent error handling with HTTP status codes
- JSON request/response format
- Route organization in single `routes.ts` file with logical grouping

**Authentication & Authorization**
- Replit OIDC (OpenID Connect) for authentication via `openid-client`
- Passport.js strategy integration for session management
- Session storage in PostgreSQL using connect-pg-simple
- 7-day session TTL with secure, httpOnly cookies
- `isAuthenticated` middleware for protected routes

**Data Access Layer**
- Storage abstraction via `IStorage` interface in `storage.ts`
- Centralized database operations isolating business logic from routes
- Type-safe operations using schema types from shared layer

### Database Architecture

**Database Provider**
- Neon serverless PostgreSQL with WebSocket support
- Connection pooling via @neondatabase/serverless Pool
- Database schema managed through Drizzle ORM

**Schema Design**
- **users**: Core user data with role-based access (customer, business_owner, admin)
- **categories**: Service categories with localization (Serbian/English) and visual identity
- **businesses**: Service provider details with owner relationship and location data
- **services**: Offerings per business with pricing and duration
- **bookings**: Appointment records linking users, businesses, and services with status tracking
- **reviews**: User feedback system with ratings
- **blockedSlots**: Availability management for businesses
- **sessions**: Server-side session storage for Replit Auth

**ORM Strategy**
- Drizzle ORM for type-safe database queries
- Schema defined in shared layer for client/server type sharing
- Drizzle-Zod integration for runtime validation
- Relations defined for foreign key relationships
- Migration files in `/migrations` directory

**Data Validation**
- Zod schemas for runtime type validation
- Insert schemas generated from Drizzle schema via createInsertSchema
- Validation at API boundaries before database operations

### External Dependencies

**Third-Party UI Libraries**
- Radix UI primitives for accessible component foundations (dialogs, dropdowns, tooltips, etc.)
- Lucide React for consistent icon system
- date-fns for date manipulation
- class-variance-authority for component variant management
- tailwind-merge via clsx for dynamic className composition

**Authentication Service**
- Replit OIDC provider (https://replit.com/oidc) for user authentication
- openid-client for OIDC protocol implementation
- Passport.js for Express session integration

**Database Service**
- Neon serverless PostgreSQL via DATABASE_URL environment variable
- WebSocket connection using `ws` package for Neon's serverless architecture
- connect-pg-simple for PostgreSQL session store

**Development Tools**
- Replit-specific plugins for development environment integration
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer and @replit/vite-plugin-dev-banner for Replit IDE features

**Build & Deployment**
- esbuild for server bundling with selective dependency bundling (allowlist approach)
- Vite for client bundling with code splitting
- tsx for TypeScript execution in development

**Session Management**
- express-session with PostgreSQL store
- SESSION_SECRET environment variable for session encryption
- 7-day cookie lifetime with secure flag

**Email Notifications**
- Email service implemented in `server/email.ts` using Resend API
- Sends booking confirmations to customers on new bookings
- Notifies business owners of new bookings
- Sends status update emails when bookings are confirmed/cancelled
- **Configuration**: Set `RESEND_API_KEY` secret to enable email sending
- **Optional**: Set `FROM_EMAIL` env var for custom sender address (defaults to noreply@bookit.app)
- Logs email content to console when RESEND_API_KEY is not configured

**Admin Panel**
- Available at `/admin` route for business owners
- Allows creating new businesses, viewing booking stats, and managing reservations
- Profile page links to admin panel for easy access
- Ownership verification enforced on all admin API routes

**SMS Notifications**
- SMS service implemented in `server/sms.ts` using Twilio API
- Sends booking confirmation SMS to customers
- Notifies business owners of new bookings via SMS
- Sends status update SMS when bookings are confirmed/cancelled
- **Configuration**: Set these secrets to enable SMS:
  - `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
  - `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
  - `TWILIO_PHONE_NUMBER` - Your Twilio phone number (e.g., +12025551234)
- Logs SMS content to console when Twilio is not configured
- Automatically formats phone numbers for Bosnia (+387)

**Analytics & Reporting**
- Analytics page at `/admin/analytics` for business owners
- Shows bookings by date, status, and service
- Key metrics: total revenue, average booking value, completion rate
- Date range filters: 7, 30, or 90 days
- Accessible from Admin Dashboard

**Planned/Optional Integrations**
- Payment processing via Stripe (TODO - user can set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY secrets when ready)
- Real-time features via WebSocket (ws package)