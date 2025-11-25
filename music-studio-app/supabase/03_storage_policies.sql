-- ============================================
-- STEP 3: STORAGE POLICIES
-- Run this after creating the 'recordings' bucket
-- ============================================

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'recordings');

-- Allow authenticated users to read their own recordings
CREATE POLICY "Users can read their own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'recordings');

-- Allow users to delete their own recordings
CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'recordings');
