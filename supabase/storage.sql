-- TradaHub Storage Configuration for Supabase
-- Run this in your Supabase SQL Editor after running schema.sql

-- ============================================
-- CREATE STORAGE BUCKET FOR AVATARS
-- ============================================

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket so images can be accessed via URL
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];


-- ============================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================

-- Allow users to view their own avatar and other public avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================
-- CREATE STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MB max file size for product images
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];


-- ============================================
-- STORAGE POLICIES FOR PRODUCTS BUCKET
-- ============================================

-- Allow public viewing of product images
CREATE POLICY "Product images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Allow authenticated users to upload product images
CREATE POLICY "Users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own product images
CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own product images
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);


-- ============================================
-- UPDATE PROFILES TABLE TO INCLUDE AVATAR_URL AND ADDITIONAL FIELDS
-- ============================================

-- Add avatar_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Add id_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN id_number TEXT;
  END IF;
END $$;

-- Add date_of_birth column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth DATE;
  END IF;
END $$;


-- ============================================
-- HELPER FUNCTION: Get public URL for storage object
-- ============================================

CREATE OR REPLACE FUNCTION get_avatar_url(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT;
BEGIN
  -- Get the Supabase project URL from settings or use default
  base_url := current_setting('app.settings.supabase_url', true);
  
  IF base_url IS NULL THEN
    -- Fallback: return the storage path
    RETURN 'avatars/' || user_id::text || '/avatar';
  END IF;
  
  RETURN base_url || '/storage/v1/object/public/avatars/' || user_id::text || '/avatar';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- NOTES
-- ============================================
--
-- File upload paths should follow this structure:
--   - Avatars: avatars/{user_id}/avatar.{ext}
--   - Products: products/{user_id}/{product_id}.{ext}
--
-- To get the public URL for an uploaded file:
--   {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
--
-- Example:
--   https://your-project.supabase.co/storage/v1/object/public/avatars/user-uuid/avatar.jpg
--
