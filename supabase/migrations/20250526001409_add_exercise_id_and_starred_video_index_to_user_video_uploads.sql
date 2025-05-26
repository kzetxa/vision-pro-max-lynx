-- Add exercise_id and starred_video_index columns to user_video_uploads
ALTER TABLE public.user_video_uploads
ADD COLUMN exercise_id TEXT;

ALTER TABLE public.user_video_uploads
ADD COLUMN starred_video_index INTEGER;

-- Ensure uniqueness per client and exercise
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_video_uploads_client_exercise
ON public.user_video_uploads(client_id, exercise_id);
