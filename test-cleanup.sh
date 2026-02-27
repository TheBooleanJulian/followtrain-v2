#!/bin/bash
# Test script for cleanup-trains Edge Function

# Get service role key from environment or prompt
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "SUPABASE_SERVICE_ROLE_KEY not found in environment variables"
    echo "Please set it first or enter it manually:"
    read -p "Enter your Supabase Service Role Key: " service_role_key
else
    service_role_key=$SUPABASE_SERVICE_ROLE_KEY
fi

if [ -z "$service_role_key" ]; then
    echo "Service Role Key is required to test the function"
    exit 1
fi

echo "Testing cleanup-trains Edge Function..."
curl -X POST \
  -H "Authorization: Bearer $service_role_key" \
  -H "Content-Type: application/json" \
  "https://wfxtdtngbkolwiutnhqi.supabase.co/functions/v1/cleanup-trains"

echo -e "\nDone!"