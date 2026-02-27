# Cron Extension Troubleshooting Guide

## Error: `schema "cron" does not exist`

This error occurs when the `pg_cron` extension is not installed or available in your PostgreSQL database.

## What is pg_cron?

`pg_cron` is a PostgreSQL extension that allows you to schedule jobs (like cleanup tasks) to run automatically at specified intervals, similar to cron on Unix systems.

## Why This Error Occurs

The FollowTrain schema includes optional cron job scheduling for automatic cleanup of expired trains. However, many database providers (including Supabase free tier) don't have the `pg_cron` extension installed by default.

## Solution

### Option 1: Use Supabase Edge Functions (Recommended)

The preferred approach is now to use Supabase Edge Functions instead of pg_cron:

1. Deploy the Edge Function from `supabase/functions/cleanup-trains.ts`
2. Set up scheduling using one of the methods described in `SUPABASE_SCHEDULING.md`
3. The schema will continue to work normally without pg_cron

### Option 2: Manual Cleanup

You can run the cleanup function manually when needed:

```sql
-- Run this whenever you want to clean up expired trains
SELECT public.cleanup_expired_trains();
```

Or call the Edge Function endpoint directly.

### Option 3: Legacy pg_cron Approach

If you specifically want to use pg_cron:

#### For Self-Hosted PostgreSQL:
```sql
-- Connect as superuser and run:
CREATE EXTENSION IF NOT EXISTS pg_cron;
GRANT USAGE ON SCHEMA cron TO your_username;
```

Then run: `\i migrations/setup_cron_jobs.sql`

## Verifying Cron Setup

To check if cron jobs are working:

```sql
-- View current cron jobs
SELECT * FROM cron.job;

-- Check job run logs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

## File Reference

- `schema.sql` - Main schema file (handles missing cron gracefully)
- `migrations/setup_cron_jobs.sql` - Manual cron setup script
- `migrations/add_wechat_line_columns.sql` - Additional migrations

## Best Practices

1. **Development**: Ignore the cron error - it's expected and handled properly
2. **Production**: Consider enabling pg_cron for automatic cleanup
3. **Monitoring**: Set up alerts for when trains expire if running cleanup manually
4. **Backup**: Always test schema changes in a development environment first

## Need Help?

If you're still having issues:
1. Check that you're running the latest `schema.sql`
2. Verify your database connection settings
3. Ensure you have proper permissions for schema modifications
4. Contact your database provider about pg_cron availability