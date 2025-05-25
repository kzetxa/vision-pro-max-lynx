-- Create the table "user_video_uploads"
CREATE TABLE public.user_video_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL, -- This will typically reference an ID from your clients/users table
    vimeo_video_urls TEXT[] DEFAULT ARRAY[]::TEXT[], -- An array to store multiple Vimeo video URLs
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.user_video_uploads IS 'Stores a list of Vimeo video URLs uploaded by each client.';
COMMENT ON COLUMN public.user_video_uploads.client_id IS 'Identifier for the client who uploaded the videos.';
COMMENT ON COLUMN public.user_video_uploads.vimeo_video_urls IS 'An array of full Vimeo video URLs associated with the client.';

-- Create an index on client_id for faster querying
CREATE INDEX idx_user_video_uploads_client_id ON public.user_video_uploads(client_id);

-- Optional: If your clients are directly Supabase authenticated users,
-- you might want to set up a foreign key relationship to the auth.users table.
-- If client_id refers to a user in auth.users, uncomment and adapt the following:
--
-- ALTER TABLE public.user_video_uploads
-- ADD CONSTRAINT fk_client_auth_user
-- FOREIGN KEY (client_id) REFERENCES auth.users(id)
-- ON DELETE CASCADE; -- Or ON DELETE SET NULL, depending on desired behavior
--
-- COMMENT ON COLUMN public.user_video_uploads.client_id IS 'References the authenticated user (client) from auth.users table.';


-- Function to automatically update the updated_at timestamp
-- Ensure this function is created only if it doesn't already exist, or use CREATE OR REPLACE
-- For simplicity in a migration, we assume it might not exist or that CREATE OR REPLACE is safe for your setup.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row modification
CREATE TRIGGER trigger_update_user_video_uploads_updated_at
BEFORE UPDATE ON public.user_video_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
