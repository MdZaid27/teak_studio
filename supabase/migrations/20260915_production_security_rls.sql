-- ==============================================================================
-- TEAK HAUS ATELIER — PRODUCTION DATABASE SECURITY & RLS POLICIES
-- Migration: 20260915_production_security_rls.sql
-- 
-- DESCRIPTION:
-- Complete production hardening of Row-Level Security (RLS) policies.
-- 1. Dynamically purges all existing/legacy policies on affected tables.
-- 2. Strictly validates data types:
--    - orders.user_id [TEXT]
--    - patron_addresses.user_id [TEXT]
--    - patron_wishlists.user_id [TEXT]
--    - patron_profiles.id [TEXT]
--    - order_items.order_id [UUID]
-- 3. Uses scalar subqueries (SELECT auth.uid()) for query plan caching and casts to ::text
--    only where column type is TEXT.
-- 4. Removes public/anonymous INSERT policies on orders and order_items: orders must be
--    created server-side via service_role key with verified pricing, stock, and totals.
-- 5. Preserves public INSERT only for legitimate public submissions (bespoke inquiries,
--    studio bookings, newsletter subscriptions, swatch requests).
-- 6. Enforces customer data isolation: patrons can only read/manage their own records.
-- 7. Enforces server-controlled administrative authorization:
--    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
--
-- IMPORTANT:
-- Do NOT run automatically against live production.
-- Review and execute manually in the Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. DYNAMIC PURGE OF ALL EXISTING POLICIES
-- Ensures no development-era, permissive, or unexpectedly named policies linger.
-- ------------------------------------------------------------------------------

DO $$
DECLARE
    r RECORD;
    target_tables TEXT[] := ARRAY[
        'orders',
        'order_items',
        'patron_profiles',
        'patron_addresses',
        'patron_wishlists',
        'bespoke_inquiries',
        'studio_bookings',
        'newsletter_subscribers',
        'swatch_requests',
        'categories',
        'timbers',
        'products',
        'product_images',
        'product_timber_options'
    ];
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = ANY(target_tables)
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I;', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Explicit drops for static verification & audit trail
DROP POLICY IF EXISTS "Public read orders" ON public.orders;
DROP POLICY IF EXISTS "Public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow insert orders" ON public.orders;
DROP POLICY IF EXISTS "Users read own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins delete orders" ON public.orders;
DROP POLICY IF EXISTS "Admins insert orders" ON public.orders;
DROP POLICY IF EXISTS "orders_user_policy" ON public.orders;

DROP POLICY IF EXISTS "Public read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Public insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins update order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins delete order_items" ON public.order_items;

DROP POLICY IF EXISTS "Public read patron profiles" ON public.patron_profiles;
DROP POLICY IF EXISTS "Allow public read patron profiles" ON public.patron_profiles;
DROP POLICY IF EXISTS "Allow insert patron profiles" ON public.patron_profiles;
DROP POLICY IF EXISTS "Allow update patron profiles" ON public.patron_profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.patron_profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.patron_profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.patron_profiles;
DROP POLICY IF EXISTS "Admins delete profile" ON public.patron_profiles;

DROP POLICY IF EXISTS "Public read patron addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Allow public read patron addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Allow insert patron addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Allow update patron addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Allow delete patron addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Users read own addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Users insert own addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Users update own addresses" ON public.patron_addresses;
DROP POLICY IF EXISTS "Users delete own addresses" ON public.patron_addresses;

DROP POLICY IF EXISTS "Public read patron wishlists" ON public.patron_wishlists;
DROP POLICY IF EXISTS "Allow public read patron wishlists" ON public.patron_wishlists;
DROP POLICY IF EXISTS "Allow insert patron wishlists" ON public.patron_wishlists;
DROP POLICY IF EXISTS "Allow delete patron wishlists" ON public.patron_wishlists;
DROP POLICY IF EXISTS "Users read own wishlist" ON public.patron_wishlists;
DROP POLICY IF EXISTS "Users insert own wishlist" ON public.patron_wishlists;
DROP POLICY IF EXISTS "Users delete own wishlist" ON public.patron_wishlists;

DROP POLICY IF EXISTS "Public insert bespoke_inquiries" ON public.bespoke_inquiries;
DROP POLICY IF EXISTS "Public Insert Bespoke Inquiries" ON public.bespoke_inquiries;
DROP POLICY IF EXISTS "Admin Full Control Bespoke Inquiries" ON public.bespoke_inquiries;
DROP POLICY IF EXISTS "Admins read bespoke_inquiries" ON public.bespoke_inquiries;
DROP POLICY IF EXISTS "Admins update bespoke_inquiries" ON public.bespoke_inquiries;
DROP POLICY IF EXISTS "Admins delete bespoke_inquiries" ON public.bespoke_inquiries;

DROP POLICY IF EXISTS "Public insert studio_bookings" ON public.studio_bookings;
DROP POLICY IF EXISTS "Public Insert Studio Bookings" ON public.studio_bookings;
DROP POLICY IF EXISTS "Admin Full Control Studio Bookings" ON public.studio_bookings;
DROP POLICY IF EXISTS "Admins read studio_bookings" ON public.studio_bookings;
DROP POLICY IF EXISTS "Admins update studio_bookings" ON public.studio_bookings;
DROP POLICY IF EXISTS "Admins delete studio_bookings" ON public.studio_bookings;

DROP POLICY IF EXISTS "Public insert newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Public read newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins read newsletter_subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins delete newsletter_subscribers" ON public.newsletter_subscribers;

DROP POLICY IF EXISTS "Public insert swatch_requests" ON public.swatch_requests;
DROP POLICY IF EXISTS "Admins read swatch_requests" ON public.swatch_requests;
DROP POLICY IF EXISTS "Admins update swatch_requests" ON public.swatch_requests;
DROP POLICY IF EXISTS "Admins delete swatch_requests" ON public.swatch_requests;

-- Ensure Row Level Security is enabled across all tables
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patron_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patron_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patron_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bespoke_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.studio_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.swatch_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_timber_options ENABLE ROW LEVEL SECURITY;

-- Performance indexes for foreign keys & RLS query predicates
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_patron_addresses_user_id ON public.patron_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_patron_wishlists_user_id ON public.patron_wishlists(user_id);

-- ==============================================================================
-- 1. ORDERS TABLE
-- Column types:
--   id: UUID (PK)
--   user_id: TEXT (accommodates Supabase auth UUIDs and patron session IDs)
--
-- Security Model:
-- - NO public/anonymous INSERT. Order creation is strictly performed server-side
--   via POST /api/orders using the service-role client (which has BYPASSRLS) after
--   validating prices, quantities, and totals against catalog items.
-- - Authenticated patrons can SELECT only their own orders: user_id = (SELECT auth.uid())::text
-- - Authenticated admins have full management privileges (SELECT, INSERT, UPDATE, DELETE).
-- ==============================================================================

-- Patrons read only their own orders; Admins can read all orders
CREATE POLICY "Users read own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admins can manually insert orders (direct administrative orders)
CREATE POLICY "Admins insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can update order status and fulfillment metadata
CREATE POLICY "Admins update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admins can delete orders if necessary
CREATE POLICY "Admins delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 2. ORDER ITEMS TABLE
-- Column types:
--   id: UUID (PK)
--   order_id: UUID (FK -> orders.id [UUID])
--
-- Security Model:
-- - NO public/anonymous INSERT. Created server-side with service-role key.
-- - Authenticated patrons can SELECT items belonging to orders they own.
-- - Order ownership is verified via join: orders.id = order_items.order_id (UUID = UUID).
-- - Admins have full access.
-- ==============================================================================

CREATE POLICY "Users read own order items"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND (
          o.user_id = (SELECT auth.uid())::text
          OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
        )
    )
  );

CREATE POLICY "Admins insert order_items"
  ON public.order_items
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins update order_items"
  ON public.order_items
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins delete order_items"
  ON public.order_items
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 3. PATRON PROFILES TABLE
-- Column types:
--   id: TEXT (PK, stores Supabase auth UUID as text or patron ID)
--
-- Security Model:
-- - Patrons can SELECT and UPDATE only their own profile record (id = (SELECT auth.uid())::text).
-- - Patrons can INSERT their own profile record upon signup.
-- - Admins have full access (SELECT, INSERT, UPDATE, DELETE).
-- - Anonymous users CANNOT read or manipulate customer profiles.
-- ==============================================================================

CREATE POLICY "Users read own profile"
  ON public.patron_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users insert own profile"
  ON public.patron_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users update own profile"
  ON public.patron_profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins delete profile"
  ON public.patron_profiles
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 4. PATRON ADDRESSES TABLE (Saved Delivery Residences)
-- Column types:
--   id: UUID (PK)
--   user_id: TEXT (stores Supabase auth UUID as text or patron ID)
--
-- Security Model:
-- - Patrons can SELECT, INSERT, UPDATE, and DELETE only their own addresses
--   (user_id = (SELECT auth.uid())::text).
-- - Admins have full access.
-- - Anonymous users CANNOT read or access patron delivery residences.
-- ==============================================================================

CREATE POLICY "Users read own addresses"
  ON public.patron_addresses
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users insert own addresses"
  ON public.patron_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users update own addresses"
  ON public.patron_addresses
  FOR UPDATE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users delete own addresses"
  ON public.patron_addresses
  FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );


-- ==============================================================================
-- 5. PATRON WISHLISTS TABLE
-- Column types:
--   id: UUID (PK)
--   user_id: TEXT
--   product_id: VARCHAR(255)
--
-- Security Model:
-- - Patrons can SELECT, INSERT, and DELETE only their own wishlist items
--   (user_id = (SELECT auth.uid())::text).
-- - Admins have full access.
-- - Anonymous users CANNOT read or manipulate patron wishlists.
-- ==============================================================================

CREATE POLICY "Users read own wishlist"
  ON public.patron_wishlists
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users insert own wishlist"
  ON public.patron_wishlists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Users delete own wishlist"
  ON public.patron_wishlists
  FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())::text
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );


-- ==============================================================================
-- 6. BESPOKE ARCHITECTURAL INQUIRIES TABLE
-- Security Model:
-- - Public (anon + authenticated) can INSERT inquiries (consultation briefs).
-- - ONLY Admins can SELECT, UPDATE, or DELETE records.
-- - Prevents unauthorized access or customer-to-customer data exposure.
-- ==============================================================================

CREATE POLICY "Public insert bespoke_inquiries"
  ON public.bespoke_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read bespoke_inquiries"
  ON public.bespoke_inquiries
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins update bespoke_inquiries"
  ON public.bespoke_inquiries
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins delete bespoke_inquiries"
  ON public.bespoke_inquiries
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 7. STUDIO BOOKINGS TABLE (Showroom Walkthroughs)
-- Security Model:
-- - Public (anon + authenticated) can INSERT studio walkthrough reservations.
-- - ONLY Admins can SELECT, UPDATE, or DELETE bookings.
-- - Prevents calendar enumeration and customer phone/email leaks.
-- ==============================================================================

CREATE POLICY "Public insert studio_bookings"
  ON public.studio_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read studio_bookings"
  ON public.studio_bookings
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins update studio_bookings"
  ON public.studio_bookings
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins delete studio_bookings"
  ON public.studio_bookings
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 8. NEWSLETTER SUBSCRIBERS TABLE
-- Security Model:
-- - Public (anon + authenticated) can INSERT their email to subscribe.
-- - ONLY Admins can SELECT or DELETE subscriber emails.
-- - Closes email list scraping vulnerability completely.
-- ==============================================================================

CREATE POLICY "Public insert newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins delete newsletter_subscribers"
  ON public.newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 9. SWATCH REQUESTS TABLE (Timber Sample Boxes)
-- Security Model:
-- - Public (anon + authenticated) can INSERT swatch sample requests.
-- - ONLY Admins can SELECT or UPDATE dispatch tracking.
-- ==============================================================================

CREATE POLICY "Public insert swatch_requests"
  ON public.swatch_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read swatch_requests"
  ON public.swatch_requests
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins update swatch_requests"
  ON public.swatch_requests
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins delete swatch_requests"
  ON public.swatch_requests
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');


-- ==============================================================================
-- 10. CATALOGUE TABLES (Products, Timbers, Categories, Gallery, Options)
-- Security Model:
-- - Public read access (SELECT) is required for store catalogue browsing.
-- - INSERT, UPDATE, DELETE are strictly restricted to authenticated Admins.
-- ==============================================================================

-- Categories
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Timbers
CREATE POLICY "Public read timbers" ON public.timbers FOR SELECT USING (true);
CREATE POLICY "Admins manage timbers" ON public.timbers FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Products
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Product Images
CREATE POLICY "Public read product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins manage product_images" ON public.product_images FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Product Timber Variation Options
CREATE POLICY "Public read product_timber_options" ON public.product_timber_options FOR SELECT USING (true);
CREATE POLICY "Admins manage product_timber_options" ON public.product_timber_options FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
