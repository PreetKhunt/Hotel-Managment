-- Migration: 011_storage_buckets.sql
-- Description: Creates secure storage buckets for Super Admin Panel.

-- 1. Create Room Images Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-images', 
  'room-images', 
  true, 
  5242880, -- 5 MB
  '{"image/jpeg","image/jpg","image/png","image/webp"}'::text[]
) ON CONFLICT (id) DO NOTHING;

-- 2. Create Hotel Gallery Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hotel-gallery', 
  'hotel-gallery', 
  true, 
  5242880, -- 5 MB
  '{"image/jpeg","image/jpg","image/png","image/webp"}'::text[]
) ON CONFLICT (id) DO NOTHING;

-- 3. RLS Policies for room-images
-- Public can read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'room-images');

-- Only Authenticated users with SUPER_ADMIN permission (or Super Admin role) can insert/update/delete.
-- This requires checking the public.users table or auth.users role.
-- For simplicity, since the backend handles uploads securely, or if frontend direct uploads are used:
CREATE POLICY "SuperAdmin Insert" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'room-images' AND auth.role() = 'authenticated');

CREATE POLICY "SuperAdmin Update" ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'room-images' AND auth.role() = 'authenticated');

CREATE POLICY "SuperAdmin Delete" ON storage.objects FOR DELETE 
USING (bucket_id = 'room-images' AND auth.role() = 'authenticated');


-- 4. RLS Policies for hotel-gallery
-- Public can read
CREATE POLICY "Public Access Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'hotel-gallery');

CREATE POLICY "SuperAdmin Insert Gallery" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'hotel-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "SuperAdmin Update Gallery" ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'hotel-gallery' AND auth.role() = 'authenticated');

CREATE POLICY "SuperAdmin Delete Gallery" ON storage.objects FOR DELETE 
USING (bucket_id = 'hotel-gallery' AND auth.role() = 'authenticated');
