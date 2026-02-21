import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Create base Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced client with security headers
export const createSecureSupabaseClient = (adminToken = null, participantId = null) => {
  const headers = {};
  
  if (adminToken) {
    headers['x-admin-token'] = adminToken;
  }
  
  if (participantId) {
    headers['x-participant-id'] = participantId;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: headers
    }
  });
};