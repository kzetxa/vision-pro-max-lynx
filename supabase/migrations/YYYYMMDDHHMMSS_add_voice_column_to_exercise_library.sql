-- Add voice column to exercise_library table
ALTER TABLE public.exercise_library
ADD COLUMN IF NOT EXISTS voice TEXT; 