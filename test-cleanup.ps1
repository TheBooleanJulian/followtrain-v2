# Test script for cleanup-trains Edge Function (PowerShell version)

# Get service role key from environment or prompt
$serviceRoleKey = $env:SUPABASE_SERVICE_ROLE_KEY
if (-not $serviceRoleKey) {
    Write-Host "SUPABASE_SERVICE_ROLE_KEY not found in environment variables"
    Write-Host "Please set it first or enter it manually:"
    $serviceRoleKey = Read-Host "Enter your Supabase Service Role Key"
}

if (-not $serviceRoleKey) {
    Write-Host "Service Role Key is required to test the function"
    exit 1
}

Write-Host "Testing cleanup-trains Edge Function..."

try {
    $headers = @{
        "Authorization" = "Bearer $serviceRoleKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://wfxtdtngbkolwiutnhqi.supabase.co/functions/v1/cleanup-trains" -Method POST -Headers $headers
    Write-Host "Response:" $response
} catch {
    Write-Host "Error calling function:" $_.Exception.Message
}

Write-Host "Done!"