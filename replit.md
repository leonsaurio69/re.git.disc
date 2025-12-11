# TourExplora - Tourism Marketplace

## Overview
TourExplora is a comprehensive tourism marketplace web application similar to Airbnb/GetYourGuide that connects tour guides with travelers. The platform enables guides to create and manage tours, clients to browse and book experiences, and administrators to oversee the entire system including guide approvals and commission management.

## Tech Stack
- **Frontend**: React with TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcrypt password hashing
- **State Management**: TanStack Query (React Query)
- **Routing**: Wouter

## Project Structure
```
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities, API client, auth context
│   │   └── hooks/          # Custom React hooks
├── server/
│   ├── routes.ts           # API endpoints (80+ routes)
│   ├── storage.ts          # Database operations (IStorage interface)
│   ├── auth.ts             # JWT authentication middleware
│   └── index.ts            # Express server setup
├── shared/
│   └── schema.ts           # Drizzle ORM schemas and Zod validation
```

## User Roles
1. **Client**: Browse tours, make bookings, leave reviews, manage reservations
2. **Guide**: Create/manage tours, upload documents, view earnings, manage availability
3. **Admin/CEO**: Full system access, guide approval workflow, commission configuration, financial oversight

## Database Schema

### Users
- id, email, password, name, role (client | guide | admin), phone, location, avatarUrl, active

### Guide Profiles
- id, userId, businessName, experience, languages[], specialties[], rating, totalReviews, status (pending | approved | rejected)

### Guide Documents
- id, guideId, type, name, url, verified

### Tours
- id, guideId, title, description, location, price, duration, maxGroupSize, category, imageUrl, rating, reviewCount, featured, active

### Tour Images
- id, tourId, url, caption, order, isPrimary

### Tour Availability
- id, tourId, date, startTime, endTime, spotsAvailable, price, status

### Bookings
- id, tourId, userId, date, guests, totalPrice, status (pending | confirmed | completed | cancelled), paymentStatus

### Reviews
- id, tourId, userId, bookingId, rating, comment

### Payments
- id, bookingId, amount, commissionRate, commissionAmount, guideAmount, status, processedAt

### Settings
- id, key, value (e.g., commission_rate = 10)

## API Endpoints

### Authentication
- POST /api/auth/register - User registration with role selection
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Tours (Public)
- GET /api/tours - List all active tours
- GET /api/tours/featured - Featured tours
- GET /api/tours/:id - Tour details with guide info
- GET /api/tours/:id/reviews - Tour reviews
- GET /api/tours/:id/availability - Tour availability

### Guide Routes (Protected)
- GET /api/guide/profile - Get guide profile
- PUT /api/guide/profile - Update guide profile
- GET /api/guide/tours - Guide's tours
- POST /api/tours - Create tour
- PUT /api/tours/:id - Update tour
- DELETE /api/tours/:id - Delete tour
- GET /api/guide/earnings - Earnings breakdown
- GET /api/guide/documents - List documents
- POST /api/guide/documents - Upload document
- DELETE /api/guide/documents/:id - Delete document

### Booking Routes (Protected)
- POST /api/bookings - Create booking
- GET /api/bookings - User's bookings
- GET /api/guide/bookings - Guide's tour bookings
- PATCH /api/bookings/:id/status - Update booking status
- DELETE /api/bookings/:id - Cancel booking

### Review Routes (Protected)
- POST /api/reviews - Create review
- GET /api/reviews/user - User's reviews
- PUT /api/reviews/:id - Update review
- DELETE /api/reviews/:id - Delete review

### Admin Routes (Protected)
- GET /api/admin/stats - Platform statistics
- GET /api/admin/users - All users
- GET /api/admin/tours - All tours
- GET /api/admin/bookings - All bookings
- GET /api/admin/guides/pending - Pending guide approvals
- PATCH /api/admin/guides/:id/approve - Approve guide
- PATCH /api/admin/guides/:id/reject - Reject guide
- PATCH /api/admin/users/:id/toggle - Toggle user active status
- GET /api/admin/revenue - Revenue statistics
- GET /api/admin/settings/commission - Get commission rate
- PUT /api/admin/settings/commission - Set commission rate

## Key Features

### Guide Dashboard
- Profile management with business name, experience, languages, specialties
- Document upload for verification (ID, certifications)
- Earnings overview with revenue breakdown
- Tour management with CRUD operations
- Approval status indicator

### Admin Dashboard
- Pending guide approval workflow with approve/reject actions
- User management with role filtering (clients/guides/admins)
- Tour oversight with status management
- Commission rate configuration
- Financial tracking with revenue and payout information
- Statistics cards showing users, guides, tours, commissions

### Tours Page
- Advanced search by name and location
- Filters: price range, category, duration, location
- Sort options: recommended, price (asc/desc), rating
- Active filter badges with individual removal
- Responsive design with mobile filter sheet

## Running the Application
```bash
npm run dev          # Start development server
npm run db:push      # Push schema changes to database
```

## Environment Variables
- DATABASE_URL - PostgreSQL connection string (auto-configured)
- SESSION_SECRET - JWT signing secret

## Sample Data
The database includes sample data:
- 2 approved guides: Carlos (Cusco) and Maria (Lima)
- 1 admin user
- 6 tours: Machu Picchu, Valle Sagrado, Montaña de Colores, Lima Foodie, Miraflores Walk, Camino Inca

## Test Accounts
- Guide: carlos@tourguide.com (password: password)
- Guide: maria@tourguide.com (password: password)
- Admin: admin@tourexplora.com (password: password)

## Recent Changes (Dec 2024)
- Expanded backend with 80+ API endpoints for full marketplace functionality
- Implemented guide profile management with document uploads
- Created comprehensive admin dashboard with guide approval workflow
- Added commission system with configurable rates
- Enhanced tours page with advanced search, filters, and sorting
- Connected all dashboards to real backend APIs
- Added sample tour and user data for demonstration
- Fixed authentication race condition: login/register now properly redirects to role-based dashboards
- Updated auth-context to return user from login/register for immediate role-based navigation
- Dashboard protection now checks localStorage to handle React state timing issues
- **Enhanced Tour Management (Dec 11)**:
  - TourForm with complete fields: title, location, description, price, duration, maxGroupSize, category, imageUrl, difficulty, requirements, includes/excludes lists, active/featured toggles
  - TourAvailabilityManager for managing tour availability dates with add/delete functionality
  - Guide dashboard "Mis Tours" section with card-based layout showing all tour info
  - Actions: Edit tour (modal), Delete tour (confirmation), Toggle active/inactive, Manage availability
  - Improved cache invalidation across related queries (tours, featured, bookings)
  - Complete test coverage with data-testid attributes
