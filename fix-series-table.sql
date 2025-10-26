-- Fix the series table by adding missing columns
-- Run this in Supabase SQL Editor

-- First, create profiles for existing users
INSERT INTO profiles (id, username, created_at)
SELECT 
  user_id,
  'user_' || substr(user_id::text, 1, 8),
  MIN(created_at)
FROM videos
WHERE user_id IS NOT NULL
GROUP BY user_id
ON CONFLICT (id) DO NOTHING;

-- Add missing columns to series table
ALTER TABLE series ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE series ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Fix the foreign key constraint to reference profiles instead of auth.users
ALTER TABLE series DROP CONSTRAINT IF EXISTS series_created_by_fkey;
ALTER TABLE series ADD CONSTRAINT series_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE;

-- Now run the migration for existing videos
-- First, create a default series for existing videos
INSERT INTO series (id, title, description, created_by)
SELECT 
  gen_random_uuid(),
  'My Videos',
  'Default series for migrated videos',
  user_id
FROM videos
WHERE user_id IS NOT NULL
GROUP BY user_id
ON CONFLICT DO NOTHING;

-- Create episodes table if it does not exist
CREATE TABLE IF NOT EXISTS episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  synopsis TEXT,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processing','ready','failed')),
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  mux_upload_id TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Then migrate videos to episodes
INSERT INTO episodes (
  id,
  series_id,
  author_id,
  title,
  synopsis,
  duration_seconds,
  status,
  mux_asset_id,
  mux_playback_id,
  mux_upload_id,
  thumbnail_url,
  file_size,
  created_at,
  updated_at
)
SELECT 
  v.id,
  s.id as series_id,
  v.user_id as author_id,
  v.title,
  v.description as synopsis,
  v.duration as duration_seconds,
  v.status,
  v.mux_asset_id,
  v.mux_playback_id,
  v.mux_upload_id,
  v.thumbnail_url,
  v.file_size,
  v.created_at,
  v.updated_at
FROM videos v
JOIN series s ON s.created_by = v.user_id AND s.title = 'My Videos'
WHERE v.user_id IS NOT NULL;

-- Verify migration
SELECT 
  'Series count' as table_name, 
  COUNT(*) as count 
FROM series
UNION ALL
SELECT 
  'Episodes count' as table_name, 
  COUNT(*) as count 
FROM episodes
UNION ALL
SELECT 
  'Profiles count' as table_name, 
  COUNT(*) as count 
FROM profiles;
