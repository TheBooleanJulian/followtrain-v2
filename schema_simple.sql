-- FollowTrain Supabase Schema - Simple and Reliable Version

-- Ensure tables exist (safe to run even if they already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trains') THEN
        CREATE TABLE trains (
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
        CREATE TABLE participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          train_id VARCHAR(6) REFERENCES trains(id),
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
ALTER TABLE trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Drop the old permissive policies if they exist
DROP POLICY IF EXISTS "Allow all for trains" ON trains;
DROP POLICY IF EXISTS "Allow all for participants" ON participants;

-- Trains table policies
-- Allow anyone to read trains (needed for join functionality)
CREATE POLICY "Allow read access to trains" ON trains
  FOR SELECT USING (true);

-- Allow anyone to create trains (no auth required)
CREATE POLICY "Allow train creation" ON trains
  FOR INSERT WITH CHECK (true);

-- Allow train hosts to update their own trains
CREATE POLICY "Allow train hosts to update" ON trains
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.train_id = trains.id 
      AND participants.is_host = true
      AND participants.admin_token = current_setting('request.headers', true)::json->>'x-admin-token'
    )
  );

-- Allow train hosts to delete their own trains
CREATE POLICY "Allow train hosts to delete" ON trains
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM participants 
      WHERE participants.train_id = trains.id 
      AND participants.is_host = true
      AND participants.admin_token = current_setting('request.headers', true)::json->>'x-admin-token'
    )
  );

-- Participants table policies
-- Allow reading participants of a specific train
CREATE POLICY "Allow reading train participants" ON participants
  FOR SELECT USING (
    train_id IN (
      SELECT id FROM trains
    )
  );

-- Allow anyone to join a train (insert participants)
CREATE POLICY "Allow joining trains" ON participants
  FOR INSERT WITH CHECK (
    train_id IN (
      SELECT id FROM trains WHERE locked = false
    )
    AND EXISTS (
      SELECT 1 FROM trains WHERE id = train_id AND expires_at > NOW()
    )
  );

-- Allow users to update their own entries
CREATE POLICY "Allow users to update own entries" ON participants
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
CREATE POLICY "Allow hosts to remove participants" ON participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM participants p2
      WHERE p2.train_id = participants.train_id
      AND p2.is_host = true
      AND p2.admin_token = current_setting('request.headers', true)::json->>'x-admin-token'
    )
  );

-- Allow users to delete their own entries
CREATE POLICY "Allow users to delete own entries" ON participants
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
        ALTER publication supabase_realtime ADD TABLE participants;
        RAISE NOTICE 'Added participants table to supabase_realtime publication';
    ELSE
        RAISE NOTICE 'participants table already exists in supabase_realtime publication';
    END IF;
END $$;

-- Create function to clean up expired trains
CREATE OR REPLACE FUNCTION cleanup_expired_trains()
RETURNS void AS $$
BEGIN
  -- Delete participants of expired trains
  DELETE FROM participants WHERE train_id IN (
    SELECT id FROM trains WHERE expires_at < NOW()
  );
  
  -- Delete expired trains
  DELETE FROM trains WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optionally enable the scheduled cleanup (uncomment if pg_cron is available)
-- SELECT cron.schedule(
--   'cleanup-expired-trains',
--   '0 * * * *',  -- Every hour
--   $$SELECT cleanup_expired_trains()$$
-- );