-- ==========================================================
-- KILN STUDIO — Database Migration: Patron Lifecycle System
-- Profiles, Saved Delivery Residences & Atelier Wishlists
-- ==========================================================

-- 1. Patron Profiles Table
CREATE TABLE IF NOT EXISTS public.patron_profiles (
  id TEXT PRIMARY KEY, -- accommodates Supabase auth UUIDs and mock/phone identifiers
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  marketing_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Patron Addresses Table (Saved Delivery Residences)
CREATE TABLE IF NOT EXISTS public.patron_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  floor_building TEXT NOT NULL,
  area_street TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  save_as VARCHAR(50) NOT NULL DEFAULT 'Home' CHECK (save_as IN ('Home', 'Work', 'Others')),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Trigger to ensure only one default address per patron
CREATE OR REPLACE FUNCTION public.handle_default_patron_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.patron_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_patron_address_default ON public.patron_addresses;
CREATE TRIGGER trg_patron_address_default
BEFORE INSERT OR UPDATE OF is_default ON public.patron_addresses
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION public.handle_default_patron_address();

-- 4. Patron Wishlists Table
CREATE TABLE IF NOT EXISTS public.patron_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id VARCHAR(255) NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  selected_timber_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_patron_wishlist_item UNIQUE (user_id, product_id)
);

-- ==========================================================
-- Indexes for High-Performance Queries
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_patron_profiles_phone ON public.patron_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_patron_profiles_email ON public.patron_profiles(email);
CREATE INDEX IF NOT EXISTS idx_patron_addresses_user_id ON public.patron_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_patron_addresses_pincode ON public.patron_addresses(pincode);
CREATE INDEX IF NOT EXISTS idx_patron_wishlists_user_id ON public.patron_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_patron_wishlists_product_id ON public.patron_wishlists(product_id);

-- ==========================================================
-- Row Level Security (RLS)
-- ==========================================================
ALTER TABLE public.patron_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patron_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patron_wishlists ENABLE ROW LEVEL SECURITY;

-- Patron Profiles Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read patron profiles') THEN
    CREATE POLICY "Allow public read patron profiles" ON public.patron_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow insert patron profiles') THEN
    CREATE POLICY "Allow insert patron profiles" ON public.patron_profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow update patron profiles') THEN
    CREATE POLICY "Allow update patron profiles" ON public.patron_profiles FOR UPDATE USING (true);
  END IF;
END $$;

-- Patron Addresses Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read patron addresses') THEN
    CREATE POLICY "Allow public read patron addresses" ON public.patron_addresses FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow insert patron addresses') THEN
    CREATE POLICY "Allow insert patron addresses" ON public.patron_addresses FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow update patron addresses') THEN
    CREATE POLICY "Allow update patron addresses" ON public.patron_addresses FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow delete patron addresses') THEN
    CREATE POLICY "Allow delete patron addresses" ON public.patron_addresses FOR DELETE USING (true);
  END IF;
END $$;

-- Patron Wishlists Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read patron wishlists') THEN
    CREATE POLICY "Allow public read patron wishlists" ON public.patron_wishlists FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow insert patron wishlists') THEN
    CREATE POLICY "Allow insert patron wishlists" ON public.patron_wishlists FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow delete patron wishlists') THEN
    CREATE POLICY "Allow delete patron wishlists" ON public.patron_wishlists FOR DELETE USING (true);
  END IF;
END $$;
