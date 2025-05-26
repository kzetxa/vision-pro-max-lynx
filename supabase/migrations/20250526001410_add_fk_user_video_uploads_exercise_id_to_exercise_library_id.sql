-- Migration to change user_video_uploads.exercise_id to UUID and add foreign key to exercise_library.id

BEGIN;

-- Step 1: Alter the column type of exercise_id in user_video_uploads to UUID.
-- This assumes all existing values in exercise_id are valid UUID strings.
-- If not, you must clean up the data first, or this command will fail.
ALTER TABLE public.user_video_uploads
ALTER COLUMN exercise_id TYPE UUID USING (exercise_id::uuid);

-- Step 2: Add the foreign key constraint
-- Ensure exercise_library.id is already a PRIMARY KEY or has a UNIQUE constraint of type UUID.
ALTER TABLE public.user_video_uploads
ADD CONSTRAINT fk_exercise_library_id
FOREIGN KEY (exercise_id)
REFERENCES public.exercise_library(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- Step 3: Add comments for clarity
COMMENT ON COLUMN public.user_video_uploads.exercise_id IS 'Foreign key referencing the id of the exercise in exercise_library. Changed to UUID type.';
COMMENT ON CONSTRAINT fk_exercise_library_id ON public.user_video_uploads IS 'Ensures that exercise_id in user_video_uploads refers to a valid id in exercise_library.';

COMMIT; 