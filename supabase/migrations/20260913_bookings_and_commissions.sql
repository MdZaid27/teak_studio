-- ==========================================================
-- TEAK HAUS Atelier — Studio Walkthroughs & Bespoke Commissions
-- Migration: 20260913_bookings_and_commissions.sql
-- ==========================================================

-- 1. Studio Walkthrough Bookings Table
CREATE TABLE IF NOT EXISTS public.studio_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  studio_location TEXT NOT NULL, -- e.g. "Indiranagar Atelier" or "VR Whitefield Studio"
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL, -- e.g. "11:00 AM - 12:30 PM"
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bespoke Architectural Inquiries Table
CREATE TABLE IF NOT EXISTS public.bespoke_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_name TEXT,
  name TEXT, -- backward compatibility
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  project_type TEXT DEFAULT 'Custom Dining', -- Residential, Commercial, Custom Dining, Architectural
  timber_preference TEXT,
  wood_preference TEXT, -- backward compatibility
  approx_dimensions TEXT,
  dimensions_notes TEXT, -- backward compatibility
  budget_range TEXT,
  reference_file_url TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- new, in_review, contacted, closed, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure existing bespoke_inquiries has the new columns
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bespoke_inquiries') THEN
    ALTER TABLE public.bespoke_inquiries ADD COLUMN IF NOT EXISTS patron_name TEXT;
    ALTER TABLE public.bespoke_inquiries ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'Custom Dining';
    ALTER TABLE public.bespoke_inquiries ADD COLUMN IF NOT EXISTS timber_preference TEXT;
    ALTER TABLE public.bespoke_inquiries ADD COLUMN IF NOT EXISTS approx_dimensions TEXT;
    ALTER TABLE public.bespoke_inquiries ADD COLUMN IF NOT EXISTS budget_range TEXT;
    ALTER TABLE public.bespoke_inquiries ADD COLUMN IF NOT EXISTS reference_file_url TEXT;
    ALTER TABLE public.bespoke_inquiries ADD COLUMN IF NOT EXISTS message TEXT;
  END IF;
END $$;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.studio_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bespoke_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for studio_bookings
DO $$
BEGIN
  -- Allow public patrons to create bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'studio_bookings' AND policyname = 'Public Insert Studio Bookings'
  ) THEN
    CREATE POLICY "Public Insert Studio Bookings"
    ON public.studio_bookings FOR INSERT
    WITH CHECK (true);
  END IF;

  -- Allow authenticated admins full control
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'studio_bookings' AND policyname = 'Admin Full Control Studio Bookings'
  ) THEN
    CREATE POLICY "Admin Full Control Studio Bookings"
    ON public.studio_bookings FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 5. RLS Policies for bespoke_inquiries
DO $$
BEGIN
  -- Allow public patrons to create bespoke inquiries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bespoke_inquiries' AND policyname = 'Public Insert Bespoke Inquiries'
  ) THEN
    CREATE POLICY "Public Insert Bespoke Inquiries"
    ON public.bespoke_inquiries FOR INSERT
    WITH CHECK (true);
  END IF;

  -- Allow authenticated admins full control
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bespoke_inquiries' AND policyname = 'Admin Full Control Bespoke Inquiries'
  ) THEN
    CREATE POLICY "Admin Full Control Bespoke Inquiries"
    ON public.bespoke_inquiries FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_studio_bookings_preferred_date ON public.studio_bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_studio_bookings_status ON public.studio_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bespoke_inquiries_status ON public.bespoke_inquiries(status);
