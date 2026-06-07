# Short-Term Rental Booking Site

A lightweight booking site for short-term rental properties. List properties, sync availability from Airbnb/Booking.com via iCal, and let guests submit booking requests.

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (PostgreSQL + Storage)
- **Resend** (transactional emails)
- **Vercel** (hosting, cron jobs)
- **Tailwind CSS** (styling)

## Features

- Public property listing and detail pages
- Interactive availability calendar
- Booking request form with validation
- iCal sync from Airbnb/Booking.com (every 6 hours)
- Admin panel for property management and booking requests
- Email notifications (host + guest)
- All on free tiers (~$1/month for domain)

## Screenshots

### Properties Listing
![Properties Listing](/screenshots/properties.png)

### Property Detail
![Property Detail](/screenshots/property-detail.png)

### Property Detail (Cottage)
![Property Detail (Cottage)](/screenshots/property-detail-2.png)

### Admin — Booking Requests
![Admin Requests](/screenshots/admin-requests.png)

### Admin — Properties
![Admin Properties](/screenshots/admin-properties.png)

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Settings → API
3. Get your `SUPABASE_SERVICE_ROLE_KEY` from Settings → API (for server-side operations)

### 2. Run the database schema

1. Open your Supabase project's SQL Editor
2. Run the contents of `schema.sql`

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_admin_password
RESEND_API_KEY=your_resend_api_key
HOST_EMAIL=your_email@example.com
NEXT_PUBLIC_SITE_NAME=Your Site Name
NEXT_PUBLIC_DOMAIN=yourdomain.com
```

### 4. Set up Resend

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your domain (or use `@resend.dev` for testing)

### 5. Install dependencies and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/properties` to see the site.

## Admin Panel

Access the admin panel at `/admin`. You'll be prompted for the admin password (from `ADMIN_PASSWORD` env var).

From the admin panel you can:
- Add/edit properties
- Manage property images (via Supabase Storage)
- View and manage booking requests (approve/deny)
- Monitor iCal sync status

## Testing

```bash
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once
```

## Deployment

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Set environment variables in the Vercel dashboard
4. Deploy!

The cron job for iCal sync will run automatically every 6 hours.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── properties/         # Public property pages
│   ├── admin/              # Admin panel
│   ├── api/                # API routes (cron, availability)
│   └── booking/            # Booking confirmation
├── lib/                    # Server-side logic
│   ├── db.ts               # Supabase client
│   ├── ical.ts             # iCal parser
│   ├── availability.ts     # Availability queries
│   ├── actions.ts          # Server Actions (booking, approval)
│   ├── email.ts            # Resend email templates
│   └── validation.ts       # Zod schemas
└── components/             # Reusable UI components
__tests__/                  # Unit and integration tests
schema.sql                  # Database schema
```
