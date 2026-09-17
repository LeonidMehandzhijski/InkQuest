-- ============================================================
-- InkQuest Storage Bucket - Migration 003
-- Run AFTER 002_rls_policies.sql
-- ============================================================

-- Create the public storage bucket for tattoo images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tattoo-images',
  'tattoo-images',
  TRUE,   -- public bucket: images are readable without auth
  5242880, -- 5MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = TRUE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================================
-- Storage RLS Policies
-- ============================================================

-- Public: anyone can view/download tattoo images
CREATE POLICY "tattoo-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tattoo-images');

-- Admins only: can upload, update, delete
CREATE POLICY "tattoo-images: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tattoo-images'
    AND public.is_admin()
  );

CREATE POLICY "tattoo-images: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tattoo-images'
    AND public.is_admin()
  );

CREATE POLICY "tattoo-images: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tattoo-images'
    AND public.is_admin()
  );
