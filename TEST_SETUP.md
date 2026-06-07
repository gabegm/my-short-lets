# Local Test Setup

This guide walks you through setting up the project locally for testing.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Step 1: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project**
3. Fill in:
   - **Name**: anything (e.g., "My Short Lets Test")
   - **Region**: pick the closest to you
   - **Database password**: save this somewhere safe — you'll need it to reset if needed
4. Wait for provisioning (~2 minutes)

## Step 2: Get your API credentials

1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Copy these three values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Run the database schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Open `schema.sql` from this project and copy all its contents
4. Paste into the SQL Editor and click **Run**

This creates 5 tables:
- `properties` — your listings
- `property_images` — property photos
- `blocked_dates` — booked dates (from iCal sync or manual approval)
- `booking_requests` — guest booking requests
- `sync_logs` — iCal sync history

## Step 4: Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```
# Supabase (from Step 2)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Mock data mode (set to true to test WITHOUT Supabase)
USE_MOCK_DATA=true

# Admin (pick a password for /admin access)
ADMIN_PASSWORD=change_me_in_production

# Email (optional — skip for local testing, emails fail silently)
RESEND_API_KEY=your_resend_api_key
HOST_EMAIL=your_email@example.com

# Site (optional)
NEXT_PUBLIC_SITE_NAME=Short Lets
NEXT_PUBLIC_DOMAIN=localhost
```

> **Tip:** Set `USE_MOCK_DATA=true` to test the entire site locally without any external services. The mock layer provides 3 sample properties, images, blocked dates, and a pending booking request. Set it to `false` (or remove it) when you connect to real Supabase.

## Step 5: Seed test properties

In your Supabase **SQL Editor**, run:

```sql
INSERT INTO properties (name, slug, description, price_per_night, max_guests, amenities, house_rules)
VALUES
  ('Cozy Downtown Loft', 'cozy-downtown-loft', 'A beautiful loft in the city center with skyline views. Perfect for couples or small families.', 150, 4, '["WiFi", "Kitchen", "Parking", "TV", "Air conditioning"]', 'No smoking. Quiet hours 10pm-8am. Self check-in with lockbox.'),
  ('Beachside Cottage', 'beachside-cottage', 'Steps from the sand. Perfect for a relaxing getaway. Features a private patio and outdoor shower.', 200, 2, '["WiFi", "Kitchen", "Beach access", "Outdoor shower"]', 'No pets. Please remove shoes inside. Beach chairs provided.'),
  ('Mountain Cabin', 'mountain-cabin', 'Rustic cabin with forest views and a stone fireplace. Great for hiking and stargazing.', 175, 6, '["WiFi", "Fireplace", "Hiking trails", "BBQ grill"]', 'Check-in self-service. Bring firewood. No parties or events.');
```

## Step 6: Install and run

```bash
npm install
npm run dev
```

The dev server starts on `http://localhost:3000`.

## Step 7: Verify everything works

| URL | What you see |
|---|---|
| `http://localhost:3000/properties` | Grid of 3 test properties |
| `http://localhost:3000/properties/cozy-downtown-loft` | Property detail with calendar and booking form |
| `http://localhost:3000/admin` | Admin dashboard (enter `ADMIN_PASSWORD` from `.env.local`) |
| `http://localhost:3000/admin/requests` | List of booking requests (empty at first) |
| `http://localhost:3000/admin/sync` | iCal sync status (no syncs yet) |

## Step 8: Test a booking

1. Go to any property page
2. Pick check-in and check-out dates on the calendar
3. Fill in the booking form (name, email, etc.)
4. Click **Send Booking Request**
5. You should see a confirmation page
6. Go to `/admin/requests` — your request appears with status `pending`
7. Click **Approve** — the dates get blocked
8. Try booking the same dates again — you should see an error

## Skipping emails for local testing

If you skip setting `RESEND_API_KEY`:
- Emails will fail silently (errors logged to console)
- Booking requests still get created in the database
- The full flow works — you just won't receive emails

## Testing iCal sync (optional)

If you want to test the iCal sync feature:

1. Get an iCal URL from Airbnb or Booking.com:
   - **Airbnb**: Property → Calendar → Share and Export → Copy iCal address
   - **Booking.com**: Calendar → Export → Copy iCal link
2. In the admin panel, edit a property and paste the iCal URL
3. Trigger sync manually: visit `http://localhost:3000/api/cron/ical`
4. Check `/admin/sync` — blocked dates from the external calendar should appear

## Troubleshooting

| Problem | Fix |
|---|---|
| "Failed to load properties" | Check that `schema.sql` was run in Supabase |
| Admin panel asks for password | Make sure `ADMIN_PASSWORD` is set in `.env.local` |
| Booking form submits but nothing happens | Check browser console for errors; verify Supabase credentials |
| iCal sync returns 403 | The cron endpoint checks the `Host` header. For local testing, visit the URL directly |
| Tests fail | Run `npm run test:run` — 30 tests should pass |

## Useful commands

```bash
npm run dev          # Start dev server
npm run test:run     # Run all tests
npx tsc --noEmit     # Check TypeScript
npm run build        # Build for production (webpack)
```
