# Design Guidelines: Tourism Marketplace Web Application

## Design Approach

**Reference-Based Strategy**: Drawing from leading tourism and marketplace platforms:
- **Airbnb**: Card-based tour listings, clean navigation, trust-building elements
- **GetYourGuide**: Tour-focused presentation, guide profiles, booking flow
- **Booking.com**: Search prominence, filter systems, urgency indicators

**Core Principle**: Create an inspiring, trustworthy platform that showcases travel experiences while maintaining clear functionality for three distinct user roles.

## Typography System

**Font Stack**: 
- Primary: Inter (headings, UI elements) - clean, modern, professional
- Secondary: System fonts for body text - optimal readability

**Hierarchy**:
- Hero Headlines: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Tour Titles: text-xl to text-2xl, font-semibold
- Body Text: text-base, regular weight
- Metadata (price, duration, location): text-sm to text-base, medium weight

## Layout System

**Spacing Units**: Consistent use of Tailwind units: 4, 6, 8, 12, 16, 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Card gaps: gap-6 to gap-8

**Grid Structures**:
- Tour listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Featured tours: grid-cols-1 lg:grid-cols-2 (larger cards)
- Dashboard metrics: grid-cols-1 md:grid-cols-3 lg:grid-cols-4

**Container Strategy**:
- Public pages: max-w-7xl mx-auto
- Dashboard content: max-w-6xl mx-auto
- Forms: max-w-md mx-auto

## Component Library

### Navigation
**Public Header**: 
- Logo left, search bar center (prominent), auth buttons + user menu right
- Sticky navigation on scroll
- Categories/filters dropdown below main nav

**Dashboard Navigation**:
- Left sidebar (fixed) with role-specific menu items
- Top bar with user profile, notifications, search
- Breadcrumb navigation for deep pages

### Tour Cards
**Standard Listing Card**:
- High-quality tour image (16:9 aspect ratio, rounded corners)
- Location badge overlay (top-left)
- Guide avatar (circular, bottom-right corner of image)
- Title, rating stars, review count
- Price (prominent), duration, group size
- Quick book button

**Featured Tour Card** (larger):
- Wide format (2:1 ratio)
- Multiple images in carousel
- Expanded details visible without clicking

### Search & Filters
**Search Bar**:
- Destination input with autocomplete
- Date range picker
- Guest count selector
- Prominent search button
- Appears in hero and sticky header

**Filter Panel**:
- Sidebar or drawer on mobile
- Price range slider
- Duration checkboxes
- Tour type tags
- Guide rating filter
- Instant results update

### Booking Flow
**Steps**: Search → Tour Details → Date Selection → Guest Info → Payment → Confirmation

**Tour Details Page**:
- Image gallery (grid layout with main image + thumbnails)
- Booking card (sticky on scroll, right sidebar)
- Guide profile section with verification badges
- Itinerary timeline
- What's included/excluded lists
- Reviews section with photos
- Map showing meeting point

### Dashboard Components

**Guide Dashboard**:
- Tour performance metrics cards
- Upcoming bookings table
- Create/edit tour forms
- Earnings chart
- Calendar availability manager

**Client Dashboard**:
- Upcoming trips timeline
- Past bookings grid
- Saved/wishlisted tours
- Review prompts for completed tours

**Admin Dashboard**:
- System-wide metrics (large stat cards)
- User management table with role badges
- Tour approval queue
- Revenue charts
- Activity feed

### Forms
- Clear field labels above inputs
- Input validation with inline error messages
- Required field indicators
- Multi-step forms with progress indicator
- Floating action buttons for save/submit

### Trust Elements
- Verification badges for guides
- Review ratings with star displays
- Secure payment indicators
- Money-back guarantee badges
- Customer support contact (chat bubble, bottom-right)

## Images

**Hero Section**: 
Full-width hero image showcasing vibrant travel destination (mountain landscape, beach, or iconic cityscape). Height: 70vh. Overlay gradient for text readability. Centered search bar over image with blurred background container.

**Tour Images**:
- High-quality destination photos
- Guide profile photos (professional headshots)
- Customer review photos (authentic travel moments)
- Location thumbnails in search results

**Dashboard**:
- Empty state illustrations when no data exists
- Icon-based metrics (minimal, not photo-heavy)

## Page Structures

**Homepage**:
- Hero with search
- Featured destinations (6-8 cards)
- Popular tours grid (9-12 items)
- Why book with us (3-column benefits)
- Guide signup CTA section
- Customer testimonials (3-column)
- Footer with links, social, newsletter

**Dashboard Layouts**:
- Sidebar navigation (240px width)
- Main content area with page header
- Action buttons in top-right
- Responsive: sidebar collapses to hamburger on mobile

**Tour Details**:
- Sticky booking card (desktop right sidebar)
- Full-width image gallery
- Content sections with clear headings
- Related tours at bottom

## Interactions

- Hover states on cards: subtle shadow lift, scale(1.02)
- Image zoom on hover for tour cards
- Smooth scroll to sections
- Loading skeletons for data fetching
- Toast notifications for actions (booking confirmed, tour saved)
- Modal overlays for login/signup
- Minimal animations: focus on performance