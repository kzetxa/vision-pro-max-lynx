-- Drop old thumbnail columns
ALTER TABLE public.exercise_library
DROP COLUMN IF EXISTS thumbnail_small_url,
DROP COLUMN IF EXISTS thumbnail_large_url,
DROP COLUMN IF EXISTS thumbnail_full_url;

-- Add new thumbnail column
ALTER TABLE public.exercise_library
ADD COLUMN IF NOT EXISTS thumbnail TEXT; 