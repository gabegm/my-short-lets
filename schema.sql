-- Short-Term Rental Booking Site — Database Schema
-- Run this in your Supabase SQL Editor

-- Properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  price_per_night decimal(10,2) NOT NULL DEFAULT 0,
  max_guests int NOT NULL DEFAULT 1,
  amenities jsonb NOT NULL DEFAULT '[]',
  house_rules text NOT NULL DEFAULT '',
  check_in_time text NOT NULL DEFAULT '15:00',
  check_out_time text NOT NULL DEFAULT '11:00',
  is_active boolean NOT NULL DEFAULT true,
  airbnb_ical_url text,
  booking_com_ical_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Property images table
CREATE TABLE property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false
);

-- Blocked dates table (from iCal sync or manual)
CREATE TABLE blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  synced_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_overlapping_blocks UNIQUE (property_id, start_date, end_date),
  CONSTRAINT valid_date_range CHECK (end_date > start_date)
);

-- Index for fast availability queries
CREATE INDEX idx_blocked_dates_property_dates ON blocked_dates(property_id, start_date, end_date);

-- Booking requests table
CREATE TABLE booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests_count int NOT NULL DEFAULT 1,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for admin filtering
CREATE INDEX idx_booking_requests_property_status ON booking_requests(property_id, status);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);

-- Sync logs table (for debugging iCal sync)
CREATE TABLE sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  events_parsed int NOT NULL DEFAULT 0,
  error_message text,
  run_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_logs_property ON sync_logs(property_id);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Public can read properties and blocked_dates
CREATE POLICY "Public can read active properties" ON properties
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read blocked dates" ON blocked_dates
  FOR SELECT USING (true);

-- Authenticated users (admin) can read/write everything
-- (We handle admin auth via env variable, not Supabase Auth)
-- These policies allow the server-side service role to bypass RLS
-- by using the service role key in lib/db.ts

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_requests_updated_at
  BEFORE UPDATE ON booking_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC function: get all unblocked nights for a property in a date range
CREATE OR REPLACE FUNCTION get_available_nights(
  p_property_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS TABLE (available_night date)
LANGUAGE sql
STABLE
AS $$
  SELECT gs::date AS available_night
  FROM generate_series(
    p_start_date,
    p_end_date - INTERVAL '1 day',
    '1 day'
  ) AS gs
  WHERE NOT EXISTS (
    SELECT 1 FROM blocked_dates
    WHERE property_id = p_property_id
      AND start_date < p_end_date
      AND end_date > gs::date
  );
$$;
