-- ==========================================================
-- KILN STUDIO — Database Seed SQL (Strictly from src/data/products.ts)
-- ==========================================================

-- 1. Insert Categories
INSERT INTO categories (id, name) VALUES
  ('dining', 'Dining'),
  ('living', 'Living'),
  ('storage', 'Storage'),
  ('bedroom', 'Bedroom')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Insert Timbers / Wood Types
INSERT INTO timbers (id, name, provenance, swatch_url, description) VALUES
  ('hunsur-teak', 'Hunsur Teak', 'Mysore / Karnataka', '/images/stitch_screen_a0a5379e8eea47e393610be2c57ca04b.png', 'Golden amber tones with straight linear grain and high natural oils.'),
  ('indian-rosewood', 'Indian Rosewood', 'Malabar / Western Ghats', '/images/stitch_screen_c6908ee15beb41a1b62131d90c81d62f.png', 'Dense burgundy-chocolate heartwood with natural dramatic swirl grain.'),
  ('assam-teak', 'Assam Teak', 'North-East Foothills', '/images/stitch_screen_7f0ae18667fc429fbc3c8441ebfd9093.png', 'Muted olive-golden hues with calm, serene minimalist grain fiber.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  provenance = EXCLUDED.provenance,
  swatch_url = EXCLUDED.swatch_url,
  description = EXCLUDED.description;

-- 3. Insert Products
INSERT INTO products (
  id, name, category_id, primary_timber_id, price, primary_image,
  dimensions, description, is_popular, link, tagline, lead_time, features, specs
) VALUES
(
  'malabar-dining-chair',
  'The Astrid Cane Dining Chair',
  'dining',
  'indian-rosewood',
  28500,
  '/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png',
  'W 54cm × D 56cm × H 82cm',
  'Curved woven cane backrest with tapered legs and hand-cut mortise and tenon joinery.',
  true,
  '/products/malabar-dining-chair',
  'Ergonomic rattan backrest sculpted for Bengaluru dinner gatherings.',
  'In Stock — 48hr Bangalore Delivery',
  '["100% Solid Indian Hardwood — zero veneers, zero MDF", "Six-Way Hand-Woven Calamus rotang natural rattan back", "Traditional blind mortise & tenon joinery pinned with hardwood dowels", "Naturally seasoned to 8–10% equilibrium moisture content"]'::jsonb,
  '[{"label": "Width", "value": "54 cm (21.2 inches)"}, {"label": "Depth", "value": "56 cm (22.0 inches)"}, {"label": "Total Height", "value": "82 cm (32.3 inches)"}, {"label": "Seat Height", "value": "45 cm (Standard Dining)"}, {"label": "Weight", "value": "7.2 kg solid heartwood"}, {"label": "Finish", "value": "Hand-rubbed organic beeswax & tung oil"}]'::jsonb
),
(
  'hunsur-teak-dining-table',
  'The Monolith Architectural Dining Table',
  'dining',
  'hunsur-teak',
  85000,
  '/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png',
  'L 220cm × W 95cm × H 76cm',
  'Solid 45mm thick Hunsur teak tabletop with chamfered undercut edge and bridge base.',
  true,
  '/products/hunsur-teak-dining-table',
  'Monolithic timber slab table anchored with solid trestle joinery.',
  'Built to Order — 10 to 14 Days',
  '["Continuous grain-matched planks selected from single teak logs", "Breadboard ends with expansion slots allowing seasonal breathability", "Chamfered undercut rim providing lightweight visual floating stance", "Seated capacity: Comfortably accommodates 8 diners"]'::jsonb,
  '[{"label": "Length", "value": "220 cm (86.6 inches)"}, {"label": "Width", "value": "95 cm (37.4 inches)"}, {"label": "Height", "value": "76 cm (30 inches)"}, {"label": "Tabletop Thickness", "value": "45 mm monolithic solid wood"}, {"label": "Weight", "value": "68 kg solid timber"}, {"label": "Finish", "value": "Food-safe natural wax and hardwax oil"}]'::jsonb
),
(
  'fluted-tambour-credenza',
  'The Soren Fluted Media Credenza',
  'storage',
  'hunsur-teak',
  72000,
  '/images/stitch_screen_3450da53a7364a12896a5cedc3f366cb.png',
  'L 180cm × D 45cm × H 65cm',
  'Seamless sliding fluted wood tambour doors with solid brass turned pill pulls.',
  true,
  '/products/fluted-tambour-credenza',
  'Precision tactile wood slats sliding silently along curved beech tracks.',
  'In Stock — 48hr Bangalore Delivery',
  '["Custom hand-milled tambour slats bonded with natural linen canvas backing", "Concealed rear wire management grommets for media & vinyl turntables", "Adjustable interior shelves crafted from solid teak planks", "Turned solid brass cylindrical handles with brushed finish"]'::jsonb,
  '[{"label": "Length", "value": "180 cm (70.8 inches)"}, {"label": "Depth", "value": "45 cm (17.7 inches)"}, {"label": "Height", "value": "65 cm (25.6 inches)"}, {"label": "Shelving", "value": "2 Removable Solid Wood Shelves"}, {"label": "Weight", "value": "48 kg"}, {"label": "Hardware", "value": "Unlacquered Solid Brass"}]'::jsonb
),
(
  'kaveri-coffee-table',
  'The Solis Dual-Tier Coffee Table',
  'living',
  'indian-rosewood',
  46000,
  '/images/stitch_screen_7a4f3197cdd546acae59563d24b1dc02.png',
  'L 130cm × W 70cm × H 38cm',
  'Floating under-tier shelf with exposed through-tenon joint pins and hand-wax finish.',
  false,
  '/products/kaveri-coffee-table',
  'Low-profile centerpiece with dual-tier storage for art books and ceramics.',
  'In Stock — 48hr Bangalore Delivery',
  '["Exposed mortise and tenon through-joints pegged with contrasting timber", "Lower slatted timber magazine shelf providing open visual airiness", "Softened radius corners preventing accidental bumps in living areas"]'::jsonb,
  '[{"label": "Length", "value": "130 cm (51.2 inches)"}, {"label": "Width", "value": "70 cm (27.5 inches)"}, {"label": "Height", "value": "38 cm (15.0 inches)"}, {"label": "Lower Clearance", "value": "14 cm under-tier shelf"}, {"label": "Weight", "value": "29 kg solid heartwood"}, {"label": "Finish", "value": "Hand-rubbed natural beeswax"}]'::jsonb
),
(
  'assam-platform-bed',
  'The Haven Floating Platform Bed',
  'bedroom',
  'assam-teak',
  96000,
  '/images/stitch_screen_b675956f7c6d401fb8ca491a37683d86.png',
  'King Size (L 210cm × W 195cm × H 90cm)',
  'Japandi low-profile frame with integrated cane rattan headboard and concealed cantilevers.',
  true,
  '/products/assam-platform-bed',
  'Low gravity architectural platform creating serene sleeping sanctuaries.',
  'Built to Order — 12 to 16 Days',
  '["Concealed inset cantilever legs giving the illusion of a weightlessly floating bed", "Hand-stretched natural rattan cane headboard with gentle 8-degree recline", "Solid timber slat mattress foundation engineered for optimal airflow", "Wide perimeter ledge providing integrated bedside holding areas"]'::jsonb,
  '[{"label": "Mattress Size", "value": "King (180 × 200 cm standard)"}, {"label": "Overall Length", "value": "210 cm (82.7 inches)"}, {"label": "Overall Width", "value": "195 cm (76.8 inches)"}, {"label": "Platform Height", "value": "28 cm (Low Japandi stance)"}, {"label": "Headboard Height", "value": "90 cm (35.4 inches)"}, {"label": "Weight", "value": "85 kg solid hardwood"}]'::jsonb
),
(
  'penthouse-coffee-table',
  'The Atelier Monolith Low Table',
  'living',
  'hunsur-teak',
  52000,
  '/images/stitch_screen_237f1c60dc03452ba8e1e49e64d1e647.png',
  'L 140cm × W 80cm × H 36cm',
  'Oversized solid slab table featured in Architectural Digest India residential installation.',
  false,
  '/products/penthouse-coffee-table',
  'Architectural monolithic geometry anchored with solid cylindrical legs.',
  'In Stock — 48hr Bangalore Delivery',
  '["Monolithic 40mm thick solid slab top", "Sturdy 120mm diameter turned cylindrical legs with heavy mortise pockets", "Micro-beveled perimeter edge crafted by master carvers"]'::jsonb,
  '[{"label": "Length", "value": "140 cm (55.1 inches)"}, {"label": "Width", "value": "80 cm (31.5 inches)"}, {"label": "Height", "value": "36 cm (14.2 inches)"}, {"label": "Weight", "value": "36 kg"}, {"label": "Finish", "value": "Non-toxic organic plant oil & beeswax"}]'::jsonb
),
(
  'teak-armchair-cane',
  'The Pierre Cane Lounge Chair',
  'living',
  'hunsur-teak',
  34000,
  '/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png',
  'W 68cm × D 72cm × H 75cm',
  'Relaxed recline posture with woven side panels and organic cotton cushioned seat.',
  false,
  '/products/teak-armchair-cane',
  'Comfortable recline angles with breathable woven wicker sides.',
  'In Stock — 48hr Bangalore Delivery',
  '["Ergonomically tuned 105-degree recline for reading and afternoon relaxation", "Hand-woven Calamus rotang panels across flanking armrest sides", "High-density natural latex cushion upholstered in organic washed linen"]'::jsonb,
  '[{"label": "Width", "value": "68 cm (26.8 inches)"}, {"label": "Depth", "value": "72 cm (28.3 inches)"}, {"label": "Height", "value": "75 cm (29.5 inches)"}, {"label": "Seat Height", "value": "40 cm with cushion"}, {"label": "Weight", "value": "11.5 kg"}, {"label": "Upholstery", "value": "100% Organic Unbleached Cotton Linen"}]'::jsonb
),
(
  'atelier-credenza-alt',
  'The Linea Fluted Entryway Console',
  'storage',
  'hunsur-teak',
  68000,
  '/images/stitch_screen_22974d8e0b504e5381e51d990c411be0.png',
  'L 160cm × D 42cm × H 75cm',
  'Narrow hallway and living console with twin sliding tambour cabinets.',
  false,
  '/products/atelier-credenza-alt',
  'Compact architectural console designed for Bengaluru entryways and foyer niches.',
  'In Stock — 48hr Bangalore Delivery',
  '["Slim 42cm depth specifically calculated for urban apartments and wide corridors", "Twin smooth-gliding tambour doors disappearing neatly into side housings", "Integrated solid brass leveling glides for marble and tile floors"]'::jsonb,
  '[{"label": "Length", "value": "160 cm (63.0 inches)"}, {"label": "Depth", "value": "42 cm (16.5 inches)"}, {"label": "Height", "value": "75 cm (29.5 inches)"}, {"label": "Weight", "value": "42 kg solid hardwood"}, {"label": "Finish", "value": "Zero-VOC Beeswax & Linseed Oil"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  primary_timber_id = EXCLUDED.primary_timber_id,
  price = EXCLUDED.price,
  primary_image = EXCLUDED.primary_image,
  dimensions = EXCLUDED.dimensions,
  description = EXCLUDED.description,
  is_popular = EXCLUDED.is_popular,
  link = EXCLUDED.link,
  tagline = EXCLUDED.tagline,
  lead_time = EXCLUDED.lead_time,
  features = EXCLUDED.features,
  specs = EXCLUDED.specs;

-- 4. Insert Product Gallery Images
DELETE FROM product_images;
INSERT INTO product_images (product_id, src, alt, title, display_order) VALUES
  ('malabar-dining-chair', '/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png', 'The Astrid Cane Dining Chair in solid Indian Rosewood with curved cane rattan backrest', '45° Studio Perspective', 0),
  ('malabar-dining-chair', '/images/stitch_screen_e1a112d35ebd4db8b6f1fd9abded5f9e.png', 'The Astrid Cane Dining Chair side profile showing tapered legs and curved back spine', 'Side Profile & Spine', 1),
  ('malabar-dining-chair', '/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png', 'The Astrid Cane Dining Chair front alignment photography', 'Front Alignment', 2),
  ('malabar-dining-chair', '/images/stitch_screen_9e6fefca1fcd4a72bece565d08906c86.png', 'The Astrid Cane Dining Chair in contemporary dining room setting', 'In-Situ: Penthouse Residence', 3),

  ('hunsur-teak-dining-table', '/images/stitch_screen_7a14c48526084213a0e259e6d583adef.png', 'The Monolith Architectural Dining Table in bright dining space', 'Architectural Perspective', 0),
  ('hunsur-teak-dining-table', '/images/img_037_stitch.png', 'Artisans hand-planing monolithic teak slab', 'Workshop Slab Selection', 1),
  ('hunsur-teak-dining-table', '/images/img_040_stitch.png', 'Joinery and edge profile detailing', 'Hand Jack-Planing Detail', 2),

  ('fluted-tambour-credenza', '/images/stitch_screen_3450da53a7364a12896a5cedc3f366cb.png', 'Fluted Tambour Credenza in Hunsur Teak with sliding curved doors', 'Front View & Brass Accents', 0),
  ('fluted-tambour-credenza', '/images/stitch_screen_22974d8e0b504e5381e51d990c411be0.png', 'Console profile with fluted textures', 'Fluting & Texture Detail', 1),
  ('fluted-tambour-credenza', '/images/img_027_stitch.png', 'Credenza in residential interior', 'Living Room Setting', 2),

  ('kaveri-coffee-table', '/images/stitch_screen_7a4f3197cdd546acae59563d24b1dc02.png', 'Kaveri Coffee Table in solid Indian Rosewood', 'Studio Angle', 0),
  ('kaveri-coffee-table', '/images/stitch_screen_237f1c60dc03452ba8e1e49e64d1e647.png', 'Low-slung living room table', 'Proportions & Undershelf', 1),
  ('kaveri-coffee-table', '/images/img_024_stitch.png', 'Coffee table styled with ceramics and magazines', 'Living Room Ambiance', 2),

  ('assam-platform-bed', '/images/stitch_screen_b675956f7c6d401fb8ca491a37683d86.png', 'Assam Floating Platform Bed in solid Assam Teak with woven cane headboard', 'Platform & Rattan Headboard', 0),
  ('assam-platform-bed', '/images/img_026_stitch.png', 'Sanctuary bedroom styling with platform bed', 'Bedroom Setting', 1),
  ('assam-platform-bed', '/images/stitch_screen_5176c23da1f34decb0b0abd6d0e8bcfb.png', 'Wood joinery and floating base detail', 'Floating Cantilever Base', 2),

  ('penthouse-coffee-table', '/images/stitch_screen_237f1c60dc03452ba8e1e49e64d1e647.png', 'Bellandur Penthouse Low Table in Hunsur Teak', 'Perspective View', 0),
  ('penthouse-coffee-table', '/images/stitch_screen_7a4f3197cdd546acae59563d24b1dc02.png', 'Top grain inspection of teak slab', 'Solid Slab Grain', 1),
  ('penthouse-coffee-table', '/images/img_024_stitch.png', 'In living room setting with sunlight', 'Architectural Interior', 2),

  ('teak-armchair-cane', '/images/stitch_screen_8a65f0befe1a49a1bbfb8674068b19b8.png', 'Cubbon Rattan Lounger Armchair in Hunsur Teak', 'Front Angle Studio', 0),
  ('teak-armchair-cane', '/images/stitch_screen_bf6e65da57e84be4850e1f3a0c37bc46.png', 'Chair profile showing armrest curve', 'Curved Armrest Detail', 1),
  ('teak-armchair-cane', '/images/img_024_stitch.png', 'Armchair next to sunlit window', 'Reading Nook Placement', 2),

  ('atelier-credenza-alt', '/images/stitch_screen_22974d8e0b504e5381e51d990c411be0.png', 'Indiranagar Fluted Console in Hunsur Teak', 'Front View', 0),
  ('atelier-credenza-alt', '/images/stitch_screen_3450da53a7364a12896a5cedc3f366cb.png', 'Tambour cabinet fluting detail', 'Tambour Texture', 1),
  ('atelier-credenza-alt', '/images/img_027_stitch.png', 'Console in hallway setting', 'Entryway Placement', 2);

-- 5. Insert Product Timber Options
DELETE FROM product_timber_options;
INSERT INTO product_timber_options (product_id, timber_id, price, description) VALUES
  ('malabar-dining-chair', 'indian-rosewood', 28500, 'Dense burgundy-chocolate heartwood with natural dramatic swirl grain.'),
  ('malabar-dining-chair', 'hunsur-teak', 26500, 'Golden amber tones with straight linear grain and high natural oils.'),
  ('malabar-dining-chair', 'assam-teak', 25000, 'Muted olive-golden hues with calm, serene minimalist grain fiber.'),

  ('hunsur-teak-dining-table', 'indian-rosewood', 98000, 'Dramatic dark chocolate swirls with natural amber chatoyancy.'),
  ('hunsur-teak-dining-table', 'hunsur-teak', 85000, 'Rich honey gold with deep natural oils and high water resistance.'),
  ('hunsur-teak-dining-table', 'assam-teak', 78000, 'Muted olive-golden tones with tranquil linear grain, seasoned to perfection.'),

  ('fluted-tambour-credenza', 'indian-rosewood', 79000, 'Dark ebony-violet grain contrasted against aged brushed brass.'),
  ('fluted-tambour-credenza', 'hunsur-teak', 72000, 'Warm golden hue with satin natural sheen and turned solid brass pulls.'),
  ('fluted-tambour-credenza', 'assam-teak', 67000, 'Subtle olive-gold heartwood grain paired with unlacquered brass hardware.'),

  ('kaveri-coffee-table', 'indian-rosewood', 46000, 'Dramatic swirling heartwood grain with warm burgundy luster.'),
  ('kaveri-coffee-table', 'hunsur-teak', 43000, 'Calm golden hue with silky hand-rubbed wax finish.'),
  ('kaveri-coffee-table', 'assam-teak', 39500, 'Minimalist pale olive teak planks showing exposed joinery pins.'),

  ('assam-platform-bed', 'indian-rosewood', 112000, 'Noble dark rosewood frame providing regal contrast with rattan headboard.'),
  ('assam-platform-bed', 'hunsur-teak', 104000, 'Rich honey amber with high natural protective resins.'),
  ('assam-platform-bed', 'assam-teak', 96000, 'Calm, blonde-olive teak timber with uniform tight grain structure.'),

  ('penthouse-coffee-table', 'indian-rosewood', 58000, 'Deep chocolate heartwood with rich organic streaks.'),
  ('penthouse-coffee-table', 'hunsur-teak', 52000, 'Warm honey timber seasoned to perfection.'),
  ('penthouse-coffee-table', 'assam-teak', 47500, 'Silky olive teak slab with natural chatoyancy.'),

  ('teak-armchair-cane', 'indian-rosewood', 37000, 'Rich dark tone with subtle amber undertones.'),
  ('teak-armchair-cane', 'hunsur-teak', 34000, 'Resilient golden teak with natural organic oils.'),
  ('teak-armchair-cane', 'assam-teak', 31500, 'Tranquil pale olive frame matching light natural cotton upholstery.'),

  ('atelier-credenza-alt', 'indian-rosewood', 74000, 'Bold violet-chocolate heartwood grain.'),
  ('atelier-credenza-alt', 'hunsur-teak', 68000, 'Smooth hand-planed teak with silky beeswax protection.'),
  ('atelier-credenza-alt', 'assam-teak', 63000, 'Warm olive-toned timber featuring fine fluted tambour texture.');
