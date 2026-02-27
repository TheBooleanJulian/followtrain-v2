-- Setup cron jobs for FollowTrain - Run this AFTER installing pg_cron extension
-- This file should be run separately from schema.sql when cron is available

-- Enable pg_cron extension (requires superuser privileges)
-- Uncomment the line below if you have superuser access:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to your database user (replace 'postgres' with your username)
-- GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule cleanup job if it doesn't already exist
DO $$
BEGIN
  -- Check if cron extension is available
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'cron') AND 
     EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    
    -- Check if job already exists to avoid duplicates
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-trains') THEN
      PERFORM cron.schedule(
        'cleanup-expired-trains',
        '0 * * * *',  -- Every hour
        $$SELECT public.cleanup_expired_trains()$$
      );
      RAISE NOTICE 'Scheduled cleanup_expired_trains to run hourly';
    ELSE
      RAISE NOTICE 'cleanup_expired_trains job already exists';
    END IF;
    
    -- Optional: Add more cron jobs here if needed
    -- Example: Daily analytics report
    -- IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-analytics-report') THEN
    --   PERFORM cron.schedule(
    --     'daily-analytics-report',
    --     '0 0 * * *',  -- Every day at midnight
    --     $$SELECT public.generate_daily_report()$$
    --   );
    -- END IF;
    
  ELSE
    RAISE NOTICE 'pg_cron extension not available';
    RAISE NOTICE 'Please install pg_cron extension and run this script again';
    RAISE NOTICE 'On Supabase: This requires contacting support for extension installation';
  END IF;
END $$;

-- View current cron jobs
-- SELECT * FROM cron.job;