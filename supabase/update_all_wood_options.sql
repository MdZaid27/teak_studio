-- ==========================================================
-- KILN STUDIO — Database Migration: Standardize All 3 Wood Options
-- Timbers: Indian Rosewood, Hunsur Teak, Assam Teak
-- File: supabase/update_all_wood_options.sql
-- ==========================================================

-- 1. Ensure wood_options JSONB column exists on products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS wood_options JSONB DEFAULT '[]'::jsonb;

-- 2. Populate / backfill wood_options JSONB array for all existing products
UPDATE products
SET wood_options = jsonb_build_array(
  jsonb_build_object(
    'id', 'rosewood',
    'slug', 'indian-rosewood',
    'name', 'Indian Rosewood',
    'origin', 'Malabar / Western Ghats',
    'region', 'Malabar / Western Ghats',
    'swatchImage', '/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png',
    'price_delta', 0
  ),
  jsonb_build_object(
    'id', 'teak',
    'slug', 'hunsur-teak',
    'name', 'Hunsur Teak',
    'origin', 'Mysore / Karnataka',
    'region', 'Mysore / Karnataka',
    'swatchImage', '/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png',
    'price_delta', -2000
  ),
  jsonb_build_object(
    'id', 'assam',
    'slug', 'assam-teak',
    'name', 'Assam Teak',
    'origin', 'North-East Foothills',
    'region', 'North-East Foothills',
    'swatchImage', '/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png',
    'price_delta', -3500
  )
)
WHERE true;

-- 3. Ensure all 3 timber master records exist in timbers table
INSERT INTO timbers (id, name, provenance, swatch_url, description) VALUES
  ('indian-rosewood', 'Indian Rosewood', 'Malabar / Western Ghats', '/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png', 'Dense burgundy-chocolate heartwood with natural dramatic swirl grain.'),
  ('hunsur-teak', 'Hunsur Teak', 'Mysore / Karnataka', '/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png', 'Golden amber tones with straight linear grain and high natural oils.'),
  ('assam-teak', 'Assam Teak', 'North-East Foothills', '/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png', 'Muted olive-golden hues with calm, serene minimalist grain fiber.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provenance = EXCLUDED.provenance,
  swatch_url = EXCLUDED.swatch_url,
  description = EXCLUDED.description;

-- 4. Upsert all 24 relational options into product_timber_options
INSERT INTO product_timber_options (product_id, timber_id, price, description) VALUES
  -- 1. Malabar Rattan Dining Chair
  ('malabar-dining-chair', 'indian-rosewood', 28500, 'Dense burgundy-chocolate heartwood with natural dramatic swirl grain.'),
  ('malabar-dining-chair', 'hunsur-teak', 26500, 'Golden amber tones with straight linear grain and high natural oils.'),
  ('malabar-dining-chair', 'assam-teak', 25000, 'Muted olive-golden hues with calm, serene minimalist grain fiber.'),

  -- 2. Hunsur Architectural Dining Table
  ('hunsur-teak-dining-table', 'indian-rosewood', 98000, 'Dramatic dark chocolate swirls with natural amber chatoyancy.'),
  ('hunsur-teak-dining-table', 'hunsur-teak', 85000, 'Rich honey gold with deep natural oils and high water resistance.'),
  ('hunsur-teak-dining-table', 'assam-teak', 78000, 'Muted olive-golden tones with tranquil linear grain, seasoned to perfection.'),

  -- 3. Fluted Tambour Credenza Sideboard
  ('fluted-tambour-credenza', 'indian-rosewood', 79000, 'Dark ebony-violet grain contrasted against aged brushed brass.'),
  ('fluted-tambour-credenza', 'hunsur-teak', 72000, 'Warm golden hue with satin natural sheen and turned solid brass pulls.'),
  ('fluted-tambour-credenza', 'assam-teak', 67000, 'Subtle olive-gold heartwood grain paired with unlacquered brass hardware.'),

  -- 4. Kaveri Low-Slung Coffee Table
  ('kaveri-coffee-table', 'indian-rosewood', 46000, 'Dramatic swirling heartwood grain with warm burgundy luster.'),
  ('kaveri-coffee-table', 'hunsur-teak', 43000, 'Calm golden hue with silky hand-rubbed wax finish.'),
  ('kaveri-coffee-table', 'assam-teak', 39500, 'Minimalist pale olive teak planks showing exposed joinery pins.'),

  -- 5. Assam Floating Platform Bed
  ('assam-platform-bed', 'indian-rosewood', 112000, 'Noble dark rosewood frame providing regal contrast with rattan headboard.'),
  ('assam-platform-bed', 'hunsur-teak', 104000, 'Rich honey amber with high natural protective resins.'),
  ('assam-platform-bed', 'assam-teak', 96000, 'Calm, blonde-olive teak timber with uniform tight grain structure.'),

  -- 6. Bellandur Penthouse Low Table
  ('penthouse-coffee-table', 'indian-rosewood', 58000, 'Deep chocolate heartwood with rich organic streaks.'),
  ('penthouse-coffee-table', 'hunsur-teak', 52000, 'Warm honey timber seasoned to perfection.'),
  ('penthouse-coffee-table', 'assam-teak', 47500, 'Silky olive teak slab with natural chatoyancy.'),

  -- 7. Cubbon Rattan Lounger Armchair
  ('teak-armchair-cane', 'indian-rosewood', 37000, 'Rich dark tone with subtle amber undertones.'),
  ('teak-armchair-cane', 'hunsur-teak', 34000, 'Resilient golden teak with natural organic oils.'),
  ('teak-armchair-cane', 'assam-teak', 31500, 'Tranquil pale olive frame matching light natural cotton upholstery.'),

  -- 8. Indiranagar Fluted Console
  ('atelier-credenza-alt', 'indian-rosewood', 74000, 'Bold violet-chocolate heartwood grain.'),
  ('atelier-credenza-alt', 'hunsur-teak', 68000, 'Smooth hand-planed teak with silky beeswax protection.'),
  ('atelier-credenza-alt', 'assam-teak', 63000, 'Warm olive-toned timber featuring fine fluted tambour texture.')
ON CONFLICT (product_id, timber_id) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description;
