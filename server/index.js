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

dotenv.config();

const app = express();
const PORT = 3000;

// --- 1. CONFIGURATION ---
app.use(cors({
  // Allow both localhost variations to prevent cookie blocking
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
  credentials: true 
}));

app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'daily_diff_secure_key'], 
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

// ================================================================
// IN-MEMORY CACHES FOR RATE LIMIT PREVENTION
// ================================================================
const streakCache = new Map();

// --- 2. AUTH ROUTES ---

app.get('/auth/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = 'http://localhost:3000/auth/github/callback';
  const scope = 'repo user'; 
  
  console.log("Initiating GitHub Auth...");
  
  // CHANGE IS HERE: Added "&prompt=consent"
  // This forces the GitHub permission screen to show every time
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
        // avatar_url: githubUser.avatar_url, // Temporarily commented until DB column is added
        access_token: accessToken
      });

    if (error) console.error("Supabase Error:", error);

    // D. Set Session Cookie
    req.session.githubId = githubUser.id.toString();
    req.session.username = githubUser.login;
    req.session.avatarUrl = githubUser.avatar_url;
    req.session.token = accessToken; 

    console.log(`User ${githubUser.login} logged in!`);
    
    // E. Redirect back to Frontend
    res.redirect('http://localhost:5173/?login=success');

  } catch (error) {
    console.error("Auth Failed:", error.message);
    res.status(500).send(`Authentication failed: ${error.message}`);
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

  const { repoName, scheduleTime, contentMode } = req.body;
  
  const { error } = await supabase
    .from('schedules')
    .upsert({
      user_github_id: req.session.githubId,
      target_repo: repoName,
      schedule_time: scheduleTime,
      content_mode: contentMode,
      is_active: true
    }, { onConflict: 'user_github_id' });

  if (error) return res.status(500).json({ error: error.message });
  
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
  
  console.log(`⏰ Checking schedules for ${currentTime}...`);

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
            users (access_token)
          `)
          .eq('is_active', true)
          .eq('schedule_time', currentTime);
        
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

    if (schedules && schedules.length > 0) {
      console.log(`🚀 Found ${schedules.length} jobs to run!`);
      
      // 2. Run jobs with individual error handling
      for (const job of schedules) {
        const token = job.users?.access_token;
        
        if (token) {
          try {
            console.log(`   -> Processing job for repo: ${job.target_repo}`);
            
            // Add timeout wrapper for the entire operation
            const result = await Promise.race([
              pushDailyUpdate(
                token, 
                job.target_repo, 
                "", // Empty message to use content strategy
                job.content_mode || 'learning-log', // Use configured content strategy
                job.users?.username // Pass username for personalized content
              ),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Job timeout after 30 seconds')), 30000)
              )
            ]);

            // 3. UPDATE DB TIMESTAMP ON SUCCESS
            if (result.success) {
              const { error: updateError } = await supabase
                .from('schedules')
                .update({ last_run_at: new Date().toISOString() })
                .eq('id', job.id);
                
              if (updateError) console.error("   ❌ Failed to update DB timestamp:", updateError);
              else console.log("   ✅ Database timestamp updated.");
            } else {
              console.error(`   ❌ Job failed for ${job.target_repo}:`, result.error);
            }
          } catch (jobError) {
            console.error(`   ❌ Critical error processing job for ${job.target_repo}:`, {
              message: jobError.message,
              details: jobError.stack?.substring(0, 200) + '...' || 'No stack trace'
            });
            
            // Continue processing other jobs even if one fails
            continue;
          }
        } else {
          console.warn(`   ⚠️ No access token found for job ID: ${job.id}`);
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
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});