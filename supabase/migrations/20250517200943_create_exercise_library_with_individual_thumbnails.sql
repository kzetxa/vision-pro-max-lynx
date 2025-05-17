-- Add the new thumbnail URL columns
ALTER TABLE public.exercise_library
ADD COLUMN IF NOT EXISTS thumbnail_small_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_large_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_full_url TEXT;
