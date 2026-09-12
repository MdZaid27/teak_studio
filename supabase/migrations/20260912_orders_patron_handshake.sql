-- ==========================================================
-- KILN STUDIO — Database Migration: Orders Patron Handshake
-- Supports patron user_id association, white-glove address details, and rich item metadata
-- ==========================================================

-- 1. Extend orders table with user_id and regional address fields
ALTER TABLE IF EXISTS public.orders 
  ADD COLUMN IF NOT EXISTS user_id TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Bengaluru',
  ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Karnataka',
  ADD COLUMN IF NOT EXISTS total_amount INTEGER;

-- 2. Extend order_items table with product title, timber title, and image url
ALTER TABLE IF EXISTS public.order_items
  ADD COLUMN IF NOT EXISTS product_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS timber_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 3. Indexes for patron order history
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
