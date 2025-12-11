# TourExplora - Tourism Marketplace

## Overview
TourExplora is a full-stack tourism marketplace web application that connects tour guides with travelers. The platform enables guides to create and manage tours, clients to browse and book experiences, and administrators to oversee the entire system.

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
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations (IStorage interface)
│   ├── auth.ts             # JWT authentication middleware
│   └── index.ts            # Express server setup
├── shared/
│   └── schema.ts           # Drizzle ORM schemas and Zod validation
```

## User Roles
1. **Client (user)**: Browse tours, make bookings, manage reservations
2. **Guide**: Create/manage tours, view bookings for their tours, manage availability
3. **Admin**: Full system access, user management, view all bookings and stats

## Database Schema

### Users
- id (serial, primary key)
- email (unique)
- password (hashed with bcrypt)
- name
- role (user | guide | admin)
- avatarUrl (optional)

### Tours
- id (serial, primary key)
- title
- description
- price (decimal)
- duration (string)
- location
- guideId (foreign key to users)
- imageUrl (optional)
- maxGroupSize (optional)
- featured (boolean)

### Bookings
- id (serial, primary key)
- tourId (foreign key to tours)
- userId (foreign key to users)
- date (date)
- guests (integer)
- totalPrice (decimal)
- status (pending | confirmed | completed | cancelled)

## API Endpoints

### Authentication
- POST /api/auth/register - User registration (with role selection)
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user

### Tours (Public)
- GET /api/tours - List all tours
- GET /api/tours/featured - Featured tours
- GET /api/tours/:id - Tour details

### Tours (Guide - Protected)
- POST /api/tours - Create tour
- PUT /api/tours/:id - Update tour
- DELETE /api/tours/:id - Delete tour
- GET /api/guide/tours - List guide's own tours

### Bookings (Protected)
- POST /api/bookings - Create booking
- GET /api/bookings - User's bookings
- GET /api/guide/bookings - Bookings for guide's tours
- PATCH /api/bookings/:id/status - Update booking status
- DELETE /api/bookings/:id - Cancel booking

### Admin (Protected)
- GET /api/admin/stats - Platform statistics
- GET /api/admin/users - All users
- GET /api/admin/bookings - All bookings
- PATCH /api/admin/users/:id - Update user
- DELETE /api/admin/users/:id - Delete user

## Running the Application
```bash
npm run dev          # Start development server
npm run db:push      # Push schema changes to database
```

## Environment Variables
- DATABASE_URL - PostgreSQL connection string (auto-configured)
- SESSION_SECRET - JWT signing secret

## Recent Changes (Dec 2024)
- Implemented full JWT authentication with bcrypt
- Created role-based access control middleware
- Connected all frontend pages to real backend APIs
- Removed mock data from frontend components
- Added AuthContext for global authentication state
- Implemented booking creation with validation
- Created dashboard pages for users, guides, and admins
