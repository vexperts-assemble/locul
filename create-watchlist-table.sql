-- Create watchlist table to track user's saved series
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT watchlists_user_series_unique UNIQUE (user_id, series_id)
);

-- Enable RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view and manage their own watchlist
CREATE POLICY "Users can view their own watchlist" ON public.watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist" ON public.watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist" ON public.watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_series_id ON public.watchlists(series_id);






