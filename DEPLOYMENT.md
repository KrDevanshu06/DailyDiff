# Production Environment Setup Guide

## Backend (Railway) Environment Variables
Set these in your Railway deployment:

```bash
GITHUB_CLIENT_ID= Github Client ID of Oauth
GITHUB_CLIENT_SECRET=Github Client Secret of Oauth
SUPABASE_URL= Supabase URL
SUPABASE_SERVICE_KEY=Secret Key 
SESSION_SECRET=super_secret_random_string_123_production
NODE_ENV=production

# Update these with your actual deployment URLs:
SERVER_URL= server deployment url   
CLIENT_URL= site deployment url
```

## Frontend (Vercel) Environment Variables
Set this in your Vercel deployment:

```bash
# Update with your Railway URL:
VITE_API_URL= site deployment url
```

## Security Features:
✅ API URLs are not hardcoded in source code
✅ Environment variables protect backend endpoints
✅ Production validation ensures all variables are set
✅ Flexible configuration for different deployment environments
