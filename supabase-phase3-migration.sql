-- Phase 3: WOD storage table
-- Execute in Supabase SQL Editor after previous migrations

-- Create wods table
CREATE TABLE public.wods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wod JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for user queries (list history ordered by date)
CREATE INDEX idx_wods_user_created ON public.wods (user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.wods ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see their own WODs
CREATE POLICY "Users can view own wods"
  ON public.wods FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: Users can insert their own WODs
CREATE POLICY "Users can insert own wods"
  ON public.wods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can delete their own WODs
CREATE POLICY "Users can delete own wods"
  ON public.wods FOR DELETE
  USING (auth.uid() = user_id);
