# Production Environment Setup Guide

## Backend (Railway) Environment Variables
Set these in your Railway deployment:

```bash
GITHUB_CLIENT_ID=Ov23liSexHFuf9odCWMS
GITHUB_CLIENT_SECRET=483dfa4b54a71af9f807ee8c9b78329a1c210d1b
SUPABASE_URL=https://fqulrtifodrbtwsnkexp.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdWxydGlmb2RyYnR3c25rZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzMwNDUsImV4cCI6MjA3OTIwOTA0NX0.G8MwYqi8rXh1_oWVmjQ3qjj-dFOOOzn5L5UF4waUkZk
SESSION_SECRET=super_secret_random_string_123_production
NODE_ENV=production

# Update these with your actual deployment URLs:
SERVER_URL=https://dailydiff-production.up.railway.app
CLIENT_URL=https://dailydiff.vercel.app
```

## Frontend (Vercel) Environment Variables
Set this in your Vercel deployment:

```bash
# Update with your Railway URL:
VITE_API_URL=https://dailydiff-production.up.railway.app
```

## Security Features:
✅ API URLs are not hardcoded in source code
✅ Environment variables protect backend endpoints
✅ Production validation ensures all variables are set
✅ Flexible configuration for different deployment environments
