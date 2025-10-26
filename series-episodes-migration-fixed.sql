-- Migration: Convert videos to series/episodes structure (FIXED VERSION)
-- Run this in Supabase SQL Editor

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create series table
CREATE TABLE IF NOT EXISTS series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  synopsis TEXT,
  tags TEXT[] DEFAULT '{}',
  poster_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create episodes table (replaces videos)
CREATE TABLE IF NOT EXISTS episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  synopsis TEXT,
  episode_number INTEGER,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  mux_upload_id TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create watch_progress table
CREATE TABLE IF NOT EXISTS watch_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  position_seconds INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, episode_id)
);

-- 5. Create watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, series_id)
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_episodes_series_id ON episodes(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON episodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);
CREATE INDEX IF NOT EXISTS idx_episodes_author_id ON episodes(author_id);
CREATE INDEX IF NOT EXISTS idx_series_created_by ON series(created_by);
CREATE INDEX IF NOT EXISTS idx_watch_progress_user_id ON watch_progress(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id, created_at DESC);

-- 7. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Series policies
DROP POLICY IF EXISTS "Anyone can view series" ON series;
CREATE POLICY "Anyone can view series" ON series FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create series" ON series;
CREATE POLICY "Users can create series" ON series FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own series" ON series;
CREATE POLICY "Users can update their own series" ON series FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can delete their own series" ON series;
CREATE POLICY "Users can delete their own series" ON series FOR DELETE USING (auth.uid() = created_by);

-- Episodes policies
DROP POLICY IF EXISTS "Anyone can view ready episodes" ON episodes;
CREATE POLICY "Anyone can view ready episodes" ON episodes FOR SELECT USING (status = 'ready');

DROP POLICY IF EXISTS "Users can view their own episodes" ON episodes;
CREATE POLICY "Users can view their own episodes" ON episodes FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can create episodes" ON episodes;
CREATE POLICY "Users can create episodes" ON episodes FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update their own episodes" ON episodes;
CREATE POLICY "Users can update their own episodes" ON episodes FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete their own episodes" ON episodes;
CREATE POLICY "Users can delete their own episodes" ON episodes FOR DELETE USING (auth.uid() = author_id);

-- Watch progress policies
DROP POLICY IF EXISTS "Users can manage their own watch progress" ON watch_progress;
CREATE POLICY "Users can manage their own watch progress" ON watch_progress FOR ALL USING (auth.uid() = user_id);

-- Watchlists policies
DROP POLICY IF EXISTS "Users can manage their own watchlists" ON watchlists;
CREATE POLICY "Users can manage their own watchlists" ON watchlists FOR ALL USING (auth.uid() = user_id);

-- 9. Create update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_series_updated_at ON series;
CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_episodes_updated_at ON episodes;
CREATE TRIGGER update_episodes_updated_at
  BEFORE UPDATE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Migrate existing videos to episodes
-- First, create a default series for existing videos
INSERT INTO series (id, title, synopsis, created_by)
SELECT 
  gen_random_uuid(),
  'My Videos',
  'Default series for migrated videos',
  user_id
FROM videos
WHERE user_id IS NOT NULL
GROUP BY user_id
ON CONFLICT DO NOTHING;

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

-- 11. Create profiles for existing users
INSERT INTO profiles (id, username, created_at)
SELECT 
  user_id,
  'user_' || substr(user_id::text, 1, 8),
  MIN(created_at)
FROM videos
WHERE user_id IS NOT NULL
GROUP BY user_id
ON CONFLICT (id) DO NOTHING;

-- 12. Verify migration
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







