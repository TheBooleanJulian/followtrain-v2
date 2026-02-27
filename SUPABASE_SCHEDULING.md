# Supabase Edge Function Scheduling for FollowTrain

This document explains how to deploy and schedule the cleanup function using Supabase Edge Functions instead of pg_cron.

## Edge Function Deployment

### 1. Deploy the Edge Function

The Edge Function has been successfully deployed to your Supabase project. The function is available at:
```
https://wfxtdtngbkolwiutnhqi.supabase.co/functions/v1/cleanup-trains
```

### 2. Environment Variables

The required environment variables are already configured:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 3. Test the Edge Function

You can test the function by calling its endpoint:

```bash
# Using curl
curl -X POST -H "Content-Type: application/json" "https://wfxtdtngbkolwiutnhqi.supabase.co/functions/v1/cleanup-trains"

# Using the test scripts
./test-cleanup.sh        # Linux/Mac
./test-cleanup.ps1       # Windows PowerShell
```

The function will:
- Find expired trains (excluding those with IDs starting with "DEMO")
- Delete related analytics, activity logs, and participants
- Delete the expired trains
- Return a JSON response with the count of cleaned trains

## Scheduling Options

### Option 1: GitHub Actions (Recommended)

A GitHub Actions workflow has been created at `.github/workflows/cleanup-trains.yml` that will automatically call the cleanup function every hour. To enable it:

1. Make sure your repository is connected to GitHub
2. The workflow will automatically run on schedule
3. You can also trigger it manually from the GitHub Actions tab

### Option 2: Supabase Scheduler

If your Supabase project supports the Scheduler feature:

1. Go to your Supabase Dashboard
2. Navigate to Functions → Scheduler
3. Create a new scheduled function
4. Set the function to `cleanup-trains`
5. Configure the schedule (e.g., every hour: `0 * * * *`)

### Option 3: Self-hosted Cron

If you have your own server, you can set up a cron job:

```bash
# Add to crontab to run every hour
0 * * * * curl -X POST -H "Content-Type: application/json" "https://wfxtdtngbkolwiutnhqi.supabase.co/functions/v1/cleanup-trains"
```

## Manual Cleanup

You can also call the cleanup function manually when needed:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  "https://<your-project-ref>.supabase.co/functions/v1/cleanup-trains"
```

## Function Details

The `cleanup-trains` Edge Function:

- Identifies trains that have expired (past their `expires_at` timestamp)
- Removes related analytics, activity logs, and participants
- Deletes the expired trains themselves
- Returns a count of cleaned-up trains
- Handles errors gracefully and continues processing even if partial failures occur

## Troubleshooting

### Function Not Found Error
- Ensure the function is deployed: `supabase functions deploy cleanup-trains`
- Check the function name matches exactly

### Permission Errors
- Verify that your `SUPABASE_SERVICE_ROLE_KEY` is correct
- The service role key is required for full table access

### Timeout Issues
- The function limits cleanup to 100 trains at a time to prevent timeouts
- Multiple calls will eventually clean up all expired trains

### Environment Variables Not Set
- Make sure to set the required environment variables: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Use `supabase secrets set` to securely store them