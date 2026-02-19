-- FollowTrain Supabase Schema

-- Create trains table
CREATE TABLE trains (
  id VARCHAR(6) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  locked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '72 hours'
);

-- Create participants table
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
  bio VARCHAR(100),
  is_host BOOLEAN DEFAULT FALSE,
  admin_token VARCHAR(24), -- For host admin access
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT -- Stored avatar URL for performance
);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since no auth required)
CREATE POLICY "Allow all for trains" ON trains
  FOR ALL USING (true);

CREATE POLICY "Allow all for participants" ON participants
  FOR ALL USING (true);

-- Enable Realtime on participants table
ALTER publication supabase_realtime ADD TABLE participants;

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

-- Create a scheduled job to run cleanup every hour
-- Requires pg_cron extension to be enabled
-- COMMENT OUT IF PG_CRON IS NOT AVAILABLE
-- SELECT cron.schedule(
--   'cleanup-expired-trains',
--   '0 * * * *',  -- Every hour
--   $$SELECT cleanup_expired_trains()$$
-- );