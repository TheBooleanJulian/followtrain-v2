-- FollowTrain Supabase Schema - Security Enhanced Final Version

-- Ensure tables exist (safe to run even if they already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trains') THEN
        CREATE TABLE public.trains (
          id VARCHAR(6) PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          locked BOOLEAN DEFAULT FALSE,
          expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '72 hours'
        );
        RAISE NOTICE 'Table trains created';
    ELSE
        RAISE NOTICE 'Table trains already exists';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'participants') THEN
        CREATE TABLE public.participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          train_id VARCHAR(6) REFERENCES public.trains(id),
          display_name VARCHAR(100) NOT NULL,
          instagram_username VARCHAR(30),
          tiktok_username VARCHAR(50),
          twitter_username VARCHAR(50),
          linkedin_username VARCHAR(100),
          youtube_username VARCHAR(100),
          twitch_username VARCHAR(50),
          facebook_username VARCHAR(50),
          whatsapp_number VARCHAR(15),
          telegram_username VARCHAR(32),
          discord_id VARCHAR(20),
          github_username VARCHAR(39),
          bio VARCHAR(100),
          is_host BOOLEAN DEFAULT FALSE,
          admin_token VARCHAR(24), -- For host admin access
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          avatar_url TEXT -- Stored avatar URL for performance
        );
        RAISE NOTICE 'Table participants created';
    ELSE
        RAISE NOTICE 'Table participants already exists';
    END IF;
END $$;

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Drop the old permissive policies if they exist
DROP POLICY IF EXISTS "Allow all for trains" ON public.trains;
DROP POLICY IF EXISTS "Allow all for participants" ON public.participants;
-- Also drop the overly permissive insert policy
DROP POLICY IF EXISTS "Allow train creation" ON public.trains;

-- Trains table policies
-- Allow anyone to read trains (needed for join functionality)
CREATE POLICY "Allow read access to trains" ON public.trains
  FOR SELECT USING (true);

-- Secure train creation - only allow creating trains with valid data
-- Anyone can create a train, but we ensure proper data validation
CREATE POLICY "Allow train creation with validation" ON public.trains
  FOR INSERT WITH CHECK (
    id IS NOT NULL 
    AND name IS NOT NULL 
    AND name != ''
    AND LENGTH(TRIM(name)) > 0
    AND LENGTH(TRIM(name)) <= 50
    AND expires_at > NOW()
  );

-- Allow train hosts to update their own trains
CREATE POLICY "Allow train hosts to update" ON public.trains
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.participants 
      WHERE public.participants.train_id = public.trains.id 
      AND public.participants.is_host = true
      AND public.participants.admin_token = current_setting('request.headers', true)::json->>'x-admin-token'
    )
  );

-- Allow train hosts to delete their own trains
CREATE POLICY "Allow train hosts to delete" ON public.trains
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.participants 
      WHERE public.participants.train_id = public.trains.id 
      AND public.participants.is_host = true
      AND public.participants.admin_token = current_setting('request.headers', true)::json->>'x-admin-token'
    )
  );

-- Participants table policies
-- Allow reading participants of a specific train
CREATE POLICY "Allow reading train participants" ON public.participants
  FOR SELECT USING (
    train_id IN (
      SELECT id FROM public.trains
    )
  );

-- Allow anyone to join a train (insert participants) with proper validation
CREATE POLICY "Allow joining trains with validation" ON public.participants
  FOR INSERT WITH CHECK (
    train_id IN (
      SELECT id FROM public.trains WHERE locked = false
    )
    AND EXISTS (
      SELECT 1 FROM public.trains WHERE id = train_id AND expires_at > NOW()
    )
    AND display_name IS NOT NULL
    AND TRIM(display_name) != ''
    AND LENGTH(TRIM(display_name)) <= 100
  );

-- Allow users to update their own entries
CREATE POLICY "Allow users to update own entries" ON public.participants
  FOR UPDATE USING (
    -- Either they're the host with admin token
    (is_host = true AND admin_token = current_setting('request.headers', true)::json->>'x-admin-token')
    OR
    -- Or they're updating their own record (self-edit)
    -- Check if the header exists and the participant ID matches
    (
      current_setting('request.headers', true)::json IS NOT NULL
      AND (current_setting('request.headers', true)::json->>'x-participant-id') IS NOT NULL
      AND (current_setting('request.headers', true)::json->>'x-participant-id') != ''
      AND id::TEXT = (current_setting('request.headers', true)::json->>'x-participant-id')::TEXT
    )
  );

-- Allow hosts to remove participants from their train
CREATE POLICY "Allow hosts to remove participants" ON public.participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.participants p2
      WHERE p2.train_id = public.participants.train_id
      AND p2.is_host = true
      AND p2.admin_token = current_setting('request.headers', true)::json->>'x-admin-token'
    )
  );

-- Allow users to delete their own entries
CREATE POLICY "Allow users to delete own entries" ON public.participants
  FOR DELETE USING (
    -- Check if the header exists and the participant ID matches
    (current_setting('request.headers', true)::json->>'x-participant-id') IS NOT NULL
    AND (current_setting('request.headers', true)::json->>'x-participant-id') != ''
    AND id::TEXT = (current_setting('request.headers', true)::json->>'x-participant-id')::TEXT
  );

-- Enable Realtime on participants table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'participants') THEN
        ALTER publication supabase_realtime ADD TABLE public.participants;
        RAISE NOTICE 'Added participants table to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'participants table already exists in supabase_realtime publication';
    END IF;
END $$;

-- Create function to clean up expired trains with explicit search_path for security
CREATE OR REPLACE FUNCTION public.cleanup_expired_trains()
RETURNS void AS $$
BEGIN
  -- Delete participants of expired trains
  DELETE FROM public.participants WHERE train_id IN (
    SELECT id FROM public.trains WHERE expires_at < NOW()
  );
  
  -- Delete expired trains
  DELETE FROM public.trains WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql 
SECURITY DEFINER  -- Run with function owner's privileges
SET search_path = public, pg_catalog;  -- Explicit search path for security

-- Optionally enable the scheduled cleanup (uncomment if pg_cron is available)
-- SELECT cron.schedule(
--   'cleanup-expired-trains',
--   '0 * * * *',  -- Every hour
--   $$SELECT public.cleanup_expired_trains()$$
-- );