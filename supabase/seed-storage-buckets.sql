-- Run this in the Supabase SQL Editor to create the required storage buckets.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', true),
  ('staff-documents', 'staff-documents', true),
  ('leave-documents', 'leave-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload/read files in all buckets
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('documents', 'staff-documents', 'leave-documents'));

CREATE POLICY "Authenticated users can read documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('documents', 'staff-documents', 'leave-documents'));

CREATE POLICY "Authenticated users can update documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id IN ('documents', 'staff-documents', 'leave-documents'));
