-- Enhanced Supabase Security Policies for FollowTrain

-- Enable RLS (should already be enabled but let's ensure it)
ALTER TABLE trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

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
    -- Or they have the participant ID (for self-edit)
    id = current_setting('request.headers', true)::json->>'x-participant-id'::uuid
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
    id = current_setting('request.headers', true)::json->>'x-participant-id'::uuid
  );

-- Additional security functions

-- Function to validate train access
CREATE OR REPLACE FUNCTION validate_train_access(train_id_param VARCHAR(6))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM trains 
    WHERE id = train_id_param 
    AND expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to validate host access
CREATE OR REPLACE FUNCTION validate_host_access(train_id_param VARCHAR(6), admin_token_param VARCHAR(24))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM participants 
    WHERE train_id = train_id_param 
    AND is_host = true 
    AND admin_token = admin_token_param
  );
END;
$$ LANGUAGE plpgsql;

-- Drop the old permissive policies
DROP POLICY IF EXISTS "Allow all for trains" ON trains;
DROP POLICY IF EXISTS "Allow all for participants" ON participants;