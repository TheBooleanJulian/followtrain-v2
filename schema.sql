-- FollowTrain Supabase Schema

-- Create trains table
CREATE TABLE trains (
  id VARCHAR(6) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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