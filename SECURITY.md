# Security Model Documentation

## Overview
FollowTrain implements a comprehensive security model using Supabase Row Level Security (RLS) policies to protect data integrity and ensure proper access controls without requiring traditional user authentication.

## Authentication Headers

### Admin Operations
- **Header**: `x-admin-token`
- **Usage**: Host operations (lock/unlock trains, rename, kick users, clear train)
- **Validation**: Matches the `admin_token` stored in the participants table for the host user

### Self-Edit Operations
- **Header**: `x-participant-id`
- **Usage**: Individual user operations (editing own profile, deleting own entry)
- **Validation**: Matches the `id` field in the participants table

## RLS Policy Details

### Trains Table
- **SELECT**: Available to all users (for train discovery)
- **INSERT**: Validated with data constraints (non-empty name, valid expiration date)
- **UPDATE**: Only accessible to train host via admin token validation
- **DELETE**: Only accessible to train host via admin token validation

### Participants Table
- **SELECT**: Available for all participants in a train
- **INSERT**: Validated with train existence, unlocked status, and non-expiration
- **UPDATE**: Accessible either by host (admin token) or self (participant ID)
- **DELETE**: Accessible either by host (admin token) or self (participant ID)

## Security Measures

### Input Validation
- All user inputs are sanitized to prevent injection attacks
- Platform-specific username validation for each social media platform
- Length constraints on all text fields

### Data Expiration
- All trains automatically expire after 72 hours
- Expired trains and their participants are cleaned up by the `cleanup_expired_trains()` function

### Deployment Security
- Source maps disabled in production builds to prevent code exposure
- Environment variables properly managed with secure deployment practices
- No sensitive credentials stored in version control

## Secure Function Implementation
The `cleanup_expired_trains()` function implements:
- Explicit search_path for security (`SET search_path = public, pg_catalog`)
- SECURITY DEFINER to run with function owner's privileges
- Parameterized queries to prevent injection

## Threat Mitigation
- **Unauthorized Data Access**: Prevented through RLS policies
- **Data Tampering**: Prevented through header validation
- **Injection Attacks**: Prevented through input sanitization
- **Information Disclosure**: Prevented through source map disabling
- **Policy Bypass**: Prevented through proper validation instead of `WITH CHECK (true)`