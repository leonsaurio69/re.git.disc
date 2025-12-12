# TourExplora - Tourism Marketplace

A comprehensive tourism marketplace web application that connects tour guides with travelers. Built with React, Express, and PostgreSQL.

## Overview

TourExplora enables:
- **Travelers**: Browse tours, make bookings, leave reviews
- **Tour Guides**: Create/manage tours, handle bookings, track earnings
- **Administrators**: Approve guides, configure commissions, oversee platform

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| Authentication | JWT with bcrypt password hashing |
| State Management | TanStack Query (React Query) |
| Routing | Wouter |

## Project Structure

```
tourexplora/
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── lib/            # API client, auth context, utilities
│       └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── routes.ts           # API endpoints (80+ routes)
│   ├── storage.ts          # Database operations (IStorage interface)
│   ├── auth.ts             # JWT authentication middleware
│   ├── db.ts               # Database connection
│   └── index.ts            # Express server setup
├── shared/                 # Shared code between frontend/backend
│   └── schema.ts           # Drizzle ORM schemas and Zod validation
└── drizzle.config.ts       # Drizzle configuration
```

## Business Logic Location

| Logic | Location |
|-------|----------|
| Database schemas & validation | `shared/schema.ts` |
| API routes & authentication | `server/routes.ts` |
| Database operations (CRUD) | `server/storage.ts` |
| JWT middleware | `server/auth.ts` |
| Frontend API client | `client/src/lib/api.ts` |
| Auth context & state | `client/src/lib/auth-context.tsx` |

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd tourexplora

# Install dependencies
npm install

# Set up environment variables (see below)

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication (required)
SESSION_SECRET=your-secret-key-min-32-characters

# Optional PostgreSQL individual vars (if not using DATABASE_URL)
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=tourexplora
```

## Deployment Outside Replit

### Frontend Deployment (Vercel, Netlify, etc.)

1. Build the frontend:
```bash
cd client
npm run build
```

2. Deploy the `client/dist` folder to your hosting provider

3. Set the API URL environment variable:
```env
VITE_API_URL=https://your-backend-url.com
```

### Backend Deployment (Railway, Render, Heroku, etc.)

1. Ensure these environment variables are set:
   - `DATABASE_URL`
   - `SESSION_SECRET`

2. Build and start:
```bash
npm run build
npm start
```

3. The server runs on port 5000 by default (configure via `PORT` env var)

### Database Setup

1. Create a PostgreSQL database
2. Set `DATABASE_URL` in your environment
3. Run migrations: `npm run db:push`

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Guide | carlos@tourguide.com | password |
| Guide | maria@tourguide.com | password |
| Admin | admin@tourexplora.com | password |

## API Overview

### Public Endpoints
- `GET /api/tours` - List all active tours
- `GET /api/tours/:id` - Tour details
- `GET /api/tours/:id/availability` - Tour availability
- `GET /api/guides` - List approved guides

### Protected Endpoints (require authentication)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - User's bookings
- `DELETE /api/bookings/:id` - Cancel booking

### Guide Endpoints (require guide role)
- `GET /api/guide/profile` - Get guide profile
- `GET /api/guide/tours` - Guide's tours
- `POST /api/tours` - Create tour
- `PATCH /api/bookings/:id/status` - Update booking status

### Admin Endpoints (require admin role)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/guides/pending` - Pending guide approvals
- `PATCH /api/admin/guides/:id/approve` - Approve guide
- `PUT /api/admin/settings/commission` - Set commission rate

## Features

- User registration with role selection (client/guide)
- Tour creation with availability management
- Booking system with status workflow (pending → confirmed → completed)
- Automatic spot management
- Commission calculation (configurable rate)
- Guide approval workflow
- Responsive design for mobile and desktop

## License

MIT
