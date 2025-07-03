ALTER TABLE public.workout_progress
ADD COLUMN total_time_seconds INTEGER,
ADD COLUMN total_sets_completed INTEGER,
ADD COLUMN total_reps_completed INTEGER,
ADD COLUMN total_sets_skipped INTEGER; 