-- ==========================================================
-- TEAK HAUS Atelier — Product Media Storage & Schema Alignment
-- Migration: 20260913_storage_setup.sql
-- ==========================================================

-- 1. Create public storage bucket 'product-media' if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']::text[];

-- 2. Storage RLS Policies for 'product-media' bucket
-- Allow public read access to all images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public Access for Product Media'
  ) THEN
    CREATE POLICY "Public Access for Product Media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-media');
  END IF;

  -- Allow authenticated admins to upload imagery
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Admin Upload for Product Media'
  ) THEN
    CREATE POLICY "Admin Upload for Product Media"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-media');
  END IF;

  -- Allow authenticated admins to update/replace imagery
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Admin Update for Product Media'
  ) THEN
    CREATE POLICY "Admin Update for Product Media"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'product-media');
  END IF;

  -- Allow authenticated admins to delete imagery
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Admin Delete for Product Media'
  ) THEN
    CREATE POLICY "Admin Delete for Product Media"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'product-media');
  END IF;
END $$;

-- 3. Schema alignment: ensure products table supports image_url / gallery_urls alias columns if queried directly
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_urls JSONB DEFAULT '[]'::jsonb;
