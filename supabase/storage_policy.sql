-- Run in Supabase SQL editor after creating the 'recipe-photos' storage bucket
-- Bucket should be set to PUBLIC in the Supabase dashboard

-- Allow public to read any file in recipe-photos
CREATE POLICY "public read recipe photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-photos');

-- Allow authenticated (Ashley) to upload
CREATE POLICY "admin upload recipe photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recipe-photos' AND auth.role() = 'authenticated');

-- Allow authenticated to update (replace) photos
CREATE POLICY "admin update recipe photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recipe-photos' AND auth.role() = 'authenticated');

-- Allow authenticated to delete photos
CREATE POLICY "admin delete recipe photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recipe-photos' AND auth.role() = 'authenticated');
