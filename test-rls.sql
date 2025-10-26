-- Test RLS policies for videos table
-- Run this in Supabase SQL Editor to debug RLS issues

-- Check if the table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'videos' 
ORDER BY ordinal_position;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'videos';

-- Check existing policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'videos';

-- Test insert with current user (this will show if RLS is working)
-- Note: This should be run while authenticated as a user
INSERT INTO videos (title, description, user_id) 
VALUES ('Test Video', 'Test Description', auth.uid())
RETURNING *;





