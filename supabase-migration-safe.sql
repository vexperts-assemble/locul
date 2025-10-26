-- Safe migration that handles existing objects
-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;

-- Create videos table if it doesn't exist
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'failed')),
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  mux_upload_id TEXT,
  file_size BIGINT,
  duration INTEGER, -- in seconds
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add description column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'description') THEN
        ALTER TABLE videos ADD COLUMN description TEXT;
    END IF;
END $$;

-- Add other columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'mux_asset_id') THEN
        ALTER TABLE videos ADD COLUMN mux_asset_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'mux_playback_id') THEN
        ALTER TABLE videos ADD COLUMN mux_playback_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'mux_upload_id') THEN
        ALTER TABLE videos ADD COLUMN mux_upload_id TEXT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'file_size') THEN
        ALTER TABLE videos ADD COLUMN file_size BIGINT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'duration') THEN
        ALTER TABLE videos ADD COLUMN duration INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'videos' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE videos ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_mux_asset_id ON videos(mux_asset_id);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own videos" ON videos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();





