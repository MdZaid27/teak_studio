-- ==========================================================
-- KILN STUDIO — Database Schema (PostgreSQL / Supabase)
-- Milestone 1: Product Catalogue & Material Pedigree
-- ==========================================================

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Timber / Wood Types Table
CREATE TABLE IF NOT EXISTS timbers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  provenance TEXT NOT NULL,
  swatch_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON UPDATE CASCADE,
  primary_timber_id TEXT NOT NULL REFERENCES timbers(id) ON UPDATE CASCADE,
  price INTEGER NOT NULL CHECK (price >= 0),
  primary_image TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  description TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  link TEXT NOT NULL,
  tagline TEXT,
  lead_time TEXT,
  features JSONB DEFAULT '[]'::JSONB,
  specs JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Gallery Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  alt TEXT NOT NULL,
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Product Timber Variation Options Table
CREATE TABLE IF NOT EXISTS product_timber_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  timber_id TEXT NOT NULL REFERENCES timbers(id) ON UPDATE CASCADE,
  price INTEGER NOT NULL CHECK (price >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, timber_id)
);

-- ==========================================================
-- Indexes for High Performance Queries & Filtering
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_primary_timber ON products(primary_timber_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_product_timber_options_product ON product_timber_options(product_id);

-- ==========================================================
-- Row Level Security (RLS) — Public Read Access
-- ==========================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE timbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_timber_options ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read categories') THEN
    CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read timbers') THEN
    CREATE POLICY "Public read timbers" ON timbers FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read products') THEN
    CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read product_images') THEN
    CREATE POLICY "Public read product_images" ON product_images FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read product_timber_options') THEN
    CREATE POLICY "Public read product_timber_options" ON product_timber_options FOR SELECT USING (true);
  END IF;
END $$;

-- ==========================================================
-- 6. Orders Table (Milestone 2)
-- ==========================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  delivery_address TEXT NOT NULL,
  pincode VARCHAR(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'offline',
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'production', 'dispatched', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================================
-- 7. Order Items Table (Milestone 2)
-- ==========================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) REFERENCES products(id) ON UPDATE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  timber_option VARCHAR(255),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  line_total INTEGER NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read orders') THEN
    CREATE POLICY "Public read orders" ON orders FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert orders') THEN
    CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read order_items') THEN
    CREATE POLICY "Public read order_items" ON order_items FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert order_items') THEN
    CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ==========================================================
-- 8. Customer Interaction Tables (Milestone 4)
-- ==========================================================
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

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bespoke_inquiries_email ON bespoke_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_bespoke_inquiries_created_at ON bespoke_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_swatch_requests_phone ON swatch_requests(phone);
CREATE INDEX IF NOT EXISTS idx_swatch_requests_created_at ON swatch_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

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


