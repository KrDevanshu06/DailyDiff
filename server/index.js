import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import cookieSession from 'cookie-session';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import { pushDailyUpdate } from './commitBot.js';
import { getRealtimeStreak } from './streakService.js';
import { getAvailableStrategies } from './contentStrategies.js';
import { promises as fs } from 'fs';
import path from 'path'; 

// Load environment variables with local development priority
const environment = process.env.NODE_ENV || 'development';
if (environment === 'development') {
  // Try .env.local first for local development
  const result = dotenv.config({ path: '.env.local' });
  console.log('📁 Loading local development environment (.env.local)');
  console.log('🔍 Environment loading result:', result.error ? result.error.message : `Loaded ${Object.keys(result.parsed || {}).length} variables`);
  console.log('🔍 SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
  console.log('🔍 SUPABASE_URL value:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
} else {
  // Use default .env for production
  dotenv.config();
  console.log('📁 Loading production environment (.env)');
}

// Initialize Express app and configuration constants
const app = express();
const PORT = process.env.PORT || 3000;

// Dynamic URL Configuration (must be after dotenv.config())
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// --- REQUEST LOGGING MIDDLEWARE ---
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  const origin = req.headers.origin || 'Direct';
  console.log(`📢 [${timestamp}] ${req.method} ${req.path} from ${origin}`);
  next();
});

// --- 1. CONFIGURATION ---
const allowedOrigins = [
  process.env.CLIENT_URL, // Production frontend URL from environment
  process.env.CLIENT_URL_BRANCH, // Branch deployment URL (optional)
  'http://localhost:5173', // Local development
  'http://127.0.0.1:5173'
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

// --- HEALTH CHECK ROUTE (For Cron Jobs) ---
app.get('/', (req, res) => {
  res.status(200).send('✅ DailyDiff Backend is Active');
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'active', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.set('trust proxy', 1); // Critical for Railway/Heroku cookies

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'daily_diff_secure_key_fallback'],
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production', // Secure only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  httpOnly: true
}));

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

// Log startup configuration with enhanced URL info
console.log(`🔧 [CONFIG] Environment: ${environment}`);
console.log(`🔧 [CONFIG] Server URL: ${SERVER_URL}`);
console.log(`🔧 [CONFIG] Client URL: ${CLIENT_URL}`);
console.log(`🔧 [CONFIG] Allowed origins: ${allowedOrigins.join(', ')}`);
console.log(`🔧 [CONFIG] Supabase connected: ${process.env.SUPABASE_URL ? '✅' : '❌'}`);
console.log(`🔧 [CONFIG] GitHub OAuth: ${process.env.GITHUB_CLIENT_ID ? '✅' : '❌'}`);

// Enhanced environment validation
if (environment === 'production') {
  const requiredVars = ['SERVER_URL', 'CLIENT_URL', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error(`� [CONFIG] Missing required environment variables: ${missing.join(', ')}`);
  }
}
console.log('---');

// ================================================================
// IN-MEMORY CACHES FOR RATE LIMIT PREVENTION
// ================================================================
const streakCache = new Map();

// --- 2. AUTH ROUTES ---

app.get('/auth/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${SERVER_URL}/auth/github/callback`;
  const scope = 'repo user'; 
  
  console.log(`🔐 GitHub OAuth initiated - Redirect URI: ${redirectUri}`);
  
  // This forces the GitHub permission screen to show every time for better UX
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&prompt=consent`);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("No code provided by GitHub");
  
  try {
    // A. Exchange code for Access Token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) throw new Error("Failed to get access token");

    // B. Get User Details
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const githubUser = userResponse.data;

    // C. Save User to Supabase
    const { error } = await supabase
      .from('users')
      .upsert({
        github_id: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url, // Temporarily commented until DB column is added
        access_token: accessToken
      });

    if (error) console.error("Supabase Error:", error);

    // D. Set Session Cookie
    req.session.githubId = githubUser.id.toString();
    req.session.username = githubUser.login;
    req.session.avatarUrl = githubUser.avatar_url;
    req.session.token = accessToken; 

    console.log(`✅ User authentication successful: ${githubUser.login}`);
    
    // E. Redirect back to Frontend
    console.log(`🔄 Redirecting to frontend: ${CLIENT_URL}/dashboard`);
    res.redirect(`${CLIENT_URL}/dashboard?login=success`);

  } catch (error) {
    console.error("❌ GitHub OAuth failed:", error.message);
    res.redirect(`${CLIENT_URL}?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

// ================================================================
// REPLACE THE EXISTING '/api/user' ROUTE WITH THIS BLOCK
// ================================================================
app.get('/api/user', async (req, res) => {
  if (req.session.githubId) {
    
    let streakData = { streak: 0 };
    
    if (req.session.token) {
      const cacheKey = req.session.githubId;
      const cached = streakCache.get(cacheKey);
      const ONE_HOUR = 60 * 60 * 1000;

      // 1. CHECK CACHE FIRST
      if (cached && (Date.now() - cached.timestamp < ONE_HOUR)) {
        console.log(`⚡ Serving streak from cache for ${req.session.username}`);
        streakData = cached.data;
      } else {
        // 2. IF NO CACHE, FETCH FRESH DATA
        try {
          console.log(`🌍 Fetching fresh streak data for ${req.session.username}...`);
          streakData = await getRealtimeStreak(req.session.token);
          
          // 3. SAVE TO CACHE (Only if no error)
          if (!streakData.error) {
            streakCache.set(cacheKey, { 
              timestamp: Date.now(), 
              data: streakData 
            });
          }
        } catch (error) {
          console.error("Error fetching streak:", error.message);
          // If rate limited, try to return stale cache if it exists
          if (cached) {
             console.log("⚠️ API Failed, serving stale cache.");
             streakData = cached.data;
          }
        }
      }
    }

    res.json({ 
      authenticated: true, 
      username: req.session.username,
      githubId: req.session.githubId,
      avatarUrl: req.session.avatarUrl,
      streak: streakData.streak 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// --- 3. FEATURE ROUTES ---

// Get Schedule (Sync Frontend)
app.get('/api/schedule', async (req, res) => {
  if (!req.session.githubId) return res.status(401).json({ error: "Unauthorized" });

  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('user_github_id', req.session.githubId)
    .single(); 

  if (error && error.code !== 'PGRST116') { 
    return res.status(500).json({ error: error.message });
  }

  res.json({ schedule: data });
});

// Save Schedule
app.post('/api/schedule', async (req, res) => {
  if (!req.session.githubId) return res.status(401).json({ error: "Unauthorized" });

  const { repoName, scheduleTime, contentMode, timezone } = req.body;
  
  const { error } = await supabase
    .from('schedules')
    .upsert({
      user_github_id: req.session.githubId,
      target_repo: repoName,
      schedule_time: scheduleTime,
      content_mode: contentMode,
      timezone: timezone || 'UTC', // Default to UTC if no timezone provided
      is_active: true
    }, { onConflict: 'user_github_id' });

  if (error) return res.status(500).json({ error: error.message });
  
  console.log(`✅ Schedule saved for ${req.session.username}: ${scheduleTime} (${timezone || 'UTC'})`);
  res.json({ status: "success", message: "Schedule active" });
});

// Get Available Content Strategies
app.get('/api/content-strategies', (req, res) => {
  const strategies = getAvailableStrategies();
  res.json({ strategies });
});

// Manual Commit Route
app.post('/api/commit-now', async (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: "Unauthorized" });
  
  const { repoName, message, contentStrategy } = req.body;
  
  // Validate input
  if (!repoName || !repoName.trim()) {
    return res.status(400).json({ error: "Repository name is required" });
  }
  
  if (!repoName.includes('/') || repoName.split('/').length !== 2) {
    return res.status(400).json({ error: "Repository name must be in format: username/repository-name" });
  }

  console.log(`🚀 Manual commit requested for ${repoName} by ${req.session.username} using ${contentStrategy || 'default'} strategy`);
  
  // Get user's saved content strategy if not provided
  let strategyToUse = contentStrategy;
  if (!strategyToUse && req.session.githubId) {
    try {
      const { data: schedule } = await supabase
        .from('schedules')
        .select('content_mode')
        .eq('user_github_id', req.session.githubId)
        .single();
      
      strategyToUse = schedule?.content_mode || 'learning-log';
    } catch (err) {
      strategyToUse = 'learning-log'; // fallback
    }
  }
  
  const result = await pushDailyUpdate(
    req.session.token, 
    repoName.trim(), 
    message, 
    strategyToUse || 'learning-log',
    req.session.username
  );
  
  if (result.success) {
    // Update timestamp even for manual commits
    if (req.session.githubId) {
       await supabase.from('schedules')
         .update({ last_run_at: new Date().toISOString() })
         .eq('user_github_id', req.session.githubId);
    }
    res.json({ 
      status: 'success', 
      content: result.content,
      strategy: result.strategy 
    });
  } else {
    res.status(500).json({ status: 'error', message: result.error });
  }
});



// --- PERSISTENT DISK CACHE FOR CONTRIBUTION DATA ---
const CACHE_FILE = path.join(process.cwd(), 'cache_contributions.json');
const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour

// Helper: Read from Disk
async function getDiskCache(key) {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf-8');
    const cache = JSON.parse(raw);
    const entry = cache[key];
    
    if (entry && (Date.now() - entry.timestamp < CACHE_DURATION)) {
      return entry.data;
    }
    return null; // Expired or doesn't exist
  } catch (e) {
    return null; // File doesn't exist yet
  }
}

// Helper: Write to Disk
async function setDiskCache(key, data) {
  try {
    let cache = {};
    try {
      const raw = await fs.readFile(CACHE_FILE, 'utf-8');
      cache = JSON.parse(raw);
    } catch (e) { /* File doesn't exist, create new object */ }

    cache[key] = { timestamp: Date.now(), data };
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.error("Cache write failed:", e);
  }
}

app.get('/api/contributions', async (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: "Unauthorized" });
  
  const cacheKey = `contributions_${req.session.githubId}`;
  
  // 1. TRY DISK CACHE FIRST (Persists across restarts)
  const cachedData = await getDiskCache(cacheKey);
  if (cachedData) {
    console.log('💾 Serving PERSISTED cached data');
    return res.json({ contributions: cachedData });
  }
  
  try {
    console.log('🌍 Fetching fresh data from GitHub GraphQL...');
    const query = `
      query($username: String!) {
        user(login: $username) {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
        }
      }
    `;

    const response = await axios.post('https://api.github.com/graphql', {
      query,
      variables: { username: req.session.username }
    }, {
      headers: {
        'Authorization': `Bearer ${req.session.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      const error = response.data.errors[0];
      
      // 2. CRITICAL FIX: If Rate Limited, try to find STALE cache on disk
      if (error.type === 'RATE_LIMIT') {
        console.warn('⚠️ Rate Limit Hit! Attempting to serve stale cache...');
        
        // Force read raw file to get stale data ignoring timestamp
        try {
            const raw = await fs.readFile(CACHE_FILE, 'utf-8');
            const cache = JSON.parse(raw);
            if (cache[cacheKey]) {
                console.log('✅ Served STALE data to survive rate limit.');
                return res.json({ contributions: cache[cacheKey].data, rateLimited: true });
            }
        } catch(e) {}

        // If no stale cache, return empty to trigger frontend mock data
        return res.json({ contributions: [], rateLimited: true });
      }
      throw new Error(error.message);
    }

    const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks;
    const allDays = weeks.flatMap(week => week.contributionDays);
    
    // 3. SAVE TO DISK
    await setDiskCache(cacheKey, allDays.map(day => ({
        date: day.date,
        count: day.contributionCount
    })));
    
    console.log(`✅ Cached ${allDays.length} days to disk.`);
    
    res.json({ 
      contributions: allDays.map(day => ({
        date: day.date,
        count: day.contributionCount
      }))
    });

  } catch (error) {
    console.error('API Error:', error.message);
    // Fallback: Try to serve stale cache on any network error
    try {
        const raw = await fs.readFile(CACHE_FILE, 'utf-8');
        const cache = JSON.parse(raw);
        if (cache[cacheKey]) {
            return res.json({ contributions: cache[cacheKey].data, error: "Served stale due to error" });
        }
    } catch(e) {}

    res.json({ contributions: [], error: error.message });
  }
});

app.post('/api/logout', (req, res) => {
  req.session = null;
  res.json({ status: "logged out" });
});

// Debug endpoint to check active schedules
app.get('/api/debug/schedules', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        id,
        target_repo,
        content_mode,
        schedule_time,
        timezone,
        is_active,
        last_run_at,
        created_at,
        user_github_id,
        users!inner (
          username,
          access_token
        )
      `)
      .eq('is_active', true);

    if (error) throw error;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    res.json({ 
      currentTime,
      totalActiveSchedules: data?.length || 0,
      schedules: data?.map(schedule => ({
        id: schedule.id,
        target_repo: schedule.target_repo,
        content_mode: schedule.content_mode,
        schedule_time: schedule.schedule_time,
        timezone: schedule.timezone,
        last_run_at: schedule.last_run_at,
        created_at: schedule.created_at,
        username: schedule.users?.username,
        hasToken: !!schedule.users?.access_token
      })) || []
    });
  } catch (error) {
    console.error("Debug schedules error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for contribution data (no auth required)
app.get('/api/test-contributions', (req, res) => {
  console.log('🧪 Test contributions endpoint called');
  
  // Generate mock data similar to GitHub API response
  const mockData = [];
  const today = new Date();
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const rand = Math.random();
    let count = 0;
    if (rand > 0.85) count = Math.floor(Math.random() * 10) + 5;
    else if (rand > 0.5) count = Math.floor(Math.random() * 5) + 1;
    
    mockData.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }
  
  res.json({ 
    contributions: mockData,
    mock: true
  });
});

// --- 4. CRON JOB ---
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  
  console.log(`⏰ [CRON] Tick at server time (UTC): ${now.toISOString()} | Local: ${currentTime} (${process.env.NODE_ENV || 'dev'})`);

  try {
    // Quick network connectivity check
    try {
      await fetch('https://api.github.com/', { 
        method: 'HEAD', 
        signal: AbortSignal.timeout(5000) 
      });
    } catch (networkError) {
      console.warn(`   ⚠️ Network connectivity issue - skipping this cycle:`, networkError.message);
      return; // Skip this cron cycle if network is down
    }
    // 1. Fetch jobs scheduled for NOW with retry logic
    let schedules, error;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const result = await supabase
          .from('schedules')
          .select(`
            id,
            target_repo,
            content_mode,
            schedule_time,
            timezone,
            user_github_id,
            users!inner (
              access_token,
              username
            )
          `)
          .eq('is_active', true);
        
        schedules = result.data;
        error = result.error;
        break; // Success, exit retry loop
      } catch (dbError) {
        retryCount++;
        console.warn(`   ⚠️ Database connection attempt ${retryCount}/${maxRetries} failed:`, dbError.message);
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential backoff
        } else {
          throw dbError;
        }
      }
    }

    if (error) throw error;

    console.log(`   📊 Found ${schedules?.length || 0} active schedules`);
    
    if (schedules && schedules.length > 0) {
      // 2. Check each schedule with timezone conversion
      for (const job of schedules) {
        const token = job.users?.access_token;
        const username = job.users?.username;
        
        // --- TIMEZONE LOGIC START ---
        // Convert current UTC time to User's Timezone
        const userTimeString = new Date().toLocaleTimeString('en-US', {
          timeZone: job.timezone || 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false // 24h format "HH:MM"
        });
        
        // Compare "14:30" (User Time) with "14:30" (Schedule Time)
        const [userHour, userMinute] = userTimeString.split(':');
        const [schedHour, schedMinute] = job.schedule_time.split(':');
        
        const isTimeMatch = (userHour == schedHour) && (userMinute == schedMinute);
        // --- TIMEZONE LOGIC END ---

        if (isTimeMatch && token) {
          try {
            console.log(`   🚀 Triggering job for ${username} at ${userTimeString} (${job.timezone || 'UTC'}) - repo: ${job.target_repo}`);
            
            // Add timeout wrapper for the entire operation
            const result = await Promise.race([
              pushDailyUpdate(
                token, 
                job.target_repo, 
                "", // Empty message to use content strategy
                job.content_mode || 'learning-log', // Use configured content strategy
                username // Pass username for personalized content
              ),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Job timeout after 30 seconds')), 30000)
              )
            ]);

            if (result.success) {
              const { error: updateError } = await supabase
                .from('schedules')
                .update({ last_run_at: new Date().toISOString() })
                .eq('id', job.id);
                
              if (updateError) console.error("   ❌ Failed to update DB timestamp:", updateError);
              else console.log(`   ✅ Job success for ${username}`);
            } else {
              console.error(`   ❌ Job failed for ${username}:`, result.error);
            }
          } catch (jobError) {
            console.error(`   ❌ Critical error processing job for ${username}:`, {
              message: jobError.message,
              details: jobError.stack?.substring(0, 200) + '...' || 'No stack trace'
            });
          }
        }
      }
    }
  } catch (err) {
    console.error("Cron failed:", {
      message: err.message,
      details: err.stack?.substring(0, 300) + '...' || 'No detailed error information',
      hint: err.code === 'UND_ERR_CONNECT_TIMEOUT' ? 
        'GitHub API connection timeout - network or rate limit issue' : 
        'Check network connection and GitHub API status',
      code: err.code || 'UNKNOWN_ERROR'
    });
  }
});

app.listen(PORT, () => {
  console.log('\n🚀 DailyDiff Backend Server Started');
  console.log('=====================================');
  console.log(`📍 Environment: ${environment}`);
  console.log(`🌐 Server URL: ${SERVER_URL}`);
  console.log(`🔗 Frontend URL: ${CLIENT_URL}`);
  console.log(`⚡ Port: ${PORT}`);
  console.log(`🕐 Started at: ${new Date().toLocaleString()}`);
  
  // Show OAuth callback URL for easy setup
  console.log('\n🔗 GitHub OAuth Configuration:');
  console.log(`   Homepage URL: ${CLIENT_URL}`);
  console.log(`   Callback URL: ${SERVER_URL}/auth/github/callback`);
  console.log('=====================================\n');
  
  // Validate required environment variables in production
  if (environment === 'production') {
    const requiredEnvVars = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'SESSION_SECRET', 'SERVER_URL', 'CLIENT_URL'];
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      console.error('🚨 Missing required environment variables:', missing.join(', '));
      console.error('⚠️  Server may not function correctly without these variables');
    } else {
      console.log('✅ All required environment variables are set');
    }
  }
});