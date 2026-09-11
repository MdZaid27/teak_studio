-- ==========================================================
-- KILN STUDIO — Database Migration: Customer Interactions
-- Milestone 4: Bespoke Inquiries, Swatch Box Requests & Newsletter
-- ==========================================================

-- 1. Bespoke Inquiries Table
CREATE TABLE IF NOT EXISTS bespoke_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  wood_preference VARCHAR(100),
  dimensions_notes TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'in_review', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Swatch Box Requests Table
CREATE TABLE IF NOT EXISTS swatch_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  status VARCHAR(50) NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'dispatched', 'delivered')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- Indexes for High-Performance Queries
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_bespoke_inquiries_email ON bespoke_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_bespoke_inquiries_created_at ON bespoke_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swatch_requests_phone ON swatch_requests(phone);
CREATE INDEX IF NOT EXISTS idx_swatch_requests_created_at ON swatch_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- ==========================================================
-- Row Level Security (RLS)
-- ==========================================================
ALTER TABLE bespoke_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE swatch_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert bespoke_inquiries') THEN
    CREATE POLICY "Public insert bespoke_inquiries" ON bespoke_inquiries FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert swatch_requests') THEN
    CREATE POLICY "Public insert swatch_requests" ON swatch_requests FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert newsletter_subscribers') THEN
    CREATE POLICY "Public insert newsletter_subscribers" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read newsletter_subscribers') THEN
    CREATE POLICY "Public read newsletter_subscribers" ON newsletter_subscribers FOR SELECT USING (true);
  END IF;
END $$;
