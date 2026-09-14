-- ==========================================================
-- TEAK HAUS Atelier — Admin Products Catalog & Inventory Management
-- Migration: 20260913_admin_products_management.sql
-- ==========================================================

-- 1. Ensure all categories exist to satisfy foreign key constraints
INSERT INTO categories (id, name) VALUES
  ('dining', 'Dining'),
  ('living', 'Living'),
  ('seating', 'Seating'),
  ('storage', 'Storage'),
  ('bedroom', 'Bedroom'),
  ('bespoke', 'Bespoke')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Ensure all 3 canonical timbers exist in timbers table
INSERT INTO timbers (id, name, provenance, swatch_url, description) VALUES
  ('hunsur-teak', 'Hunsur Teak', 'Mysore / Karnataka', '/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png', 'Golden amber tones with straight linear grain and high natural oils.'),
  ('indian-rosewood', 'Malabar Rosewood', 'Malabar / Western Ghats', '/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png', 'Dense burgundy-chocolate heartwood with natural dramatic swirl grain.'),
  ('assam-teak', 'Assam Teak', 'North-East Foothills', '/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png', 'Muted olive-golden hues with calm, serene minimalist grain fiber.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provenance = EXCLUDED.provenance,
  swatch_url = EXCLUDED.swatch_url,
  description = EXCLUDED.description;

-- 3. Extend products table with visibility, pricing, and inventory columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS compare_at_price INTEGER,
  ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS wood_options JSONB DEFAULT '[]'::jsonb;

-- 4. Create indexes for quick filtering
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);

-- 5. RLS Policies for admin write access
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert products') THEN
    CREATE POLICY "Admin insert products" ON products FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin update products') THEN
    CREATE POLICY "Admin update products" ON products FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin delete products') THEN
    CREATE POLICY "Admin delete products" ON products FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert product_timber_options') THEN
    CREATE POLICY "Admin insert product_timber_options" ON product_timber_options FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin update product_timber_options') THEN
    CREATE POLICY "Admin update product_timber_options" ON product_timber_options FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin delete product_timber_options') THEN
    CREATE POLICY "Admin delete product_timber_options" ON product_timber_options FOR DELETE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin insert product_images') THEN
    CREATE POLICY "Admin insert product_images" ON product_images FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin update product_images') THEN
    CREATE POLICY "Admin update product_images" ON product_images FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin delete product_images') THEN
    CREATE POLICY "Admin delete product_images" ON product_images FOR DELETE USING (true);
  END IF;
END $$;
