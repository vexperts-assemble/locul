-- Create videos table for Mux integration
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

-- Create index for better performance
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
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
