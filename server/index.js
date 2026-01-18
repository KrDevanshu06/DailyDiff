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
const PORT = process.env.PORT || 3000;

// --- 1. CONFIGURATION ---
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_BRANCH, 
  'http://localhost:5173', 
  'http://127.0.0.1:5173'
].filter(Boolean);

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

// --- HEALTH CHECK ROUTE ---
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

app.set('trust proxy', 1); 

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'daily_diff_secure_key_fallback'],
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  httpOnly: true
}));

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

// Log startup configuration
const environment = process.env.NODE_ENV || 'development';
console.log(`🔧 [CONFIG] Environment: ${environment}`);
console.log(`🔧 [CONFIG] Server URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
console.log('---');

// ================================================================
// IN-MEMORY CACHES
// ================================================================
const streakCache = new Map();

// --- 2. AUTH ROUTES ---

app.get('/auth/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
  const redirectUri = `${serverUrl}/auth/github/callback`;
  const scope = 'repo user'; 
  
  console.log(`🔐 GitHub OAuth initiated - Redirect URI: ${redirectUri}`);
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&prompt=consent`);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) return res.status(400).send("No code provided by GitHub");
  
  try {
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) throw new Error("Failed to get access token");

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const githubUser = userResponse.data;

    const { error } = await supabase
      .from('users')
      .upsert({
        github_id: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url, 
        access_token: accessToken
      });

    if (error) console.error("Supabase Error:", error);

    req.session.githubId = githubUser.id.toString();
    req.session.username = githubUser.login;
    req.session.avatarUrl = githubUser.avatar_url;
    req.session.token = accessToken; 

    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard?login=success`);

  } catch (error) {
    console.error("❌ GitHub OAuth failed:", error.message);
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

// ================================================================
// UPDATED /api/user ROUTE (Includes detailed stats)
// ================================================================
app.get('/api/user', async (req, res) => {
  if (req.session.githubId) {
    
    let streakData = { 
      streak: 0,
      todayCount: 0,
      weekCount: 0,
      lastContributionDate: null
    };
    
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
          const freshData = await getRealtimeStreak(req.session.token);
          
          if (!freshData.error) {
            streakData = freshData;
            streakCache.set(cacheKey, { 
              timestamp: Date.now(), 
              data: streakData 
            });
          }
        } catch (error) {
          console.error("Error fetching streak:", error.message);
          if (cached) streakData = cached.data;
        }
      }
    }

    res.json({ 
      authenticated: true, 
      username: req.session.username,
      githubId: req.session.githubId,
      avatarUrl: req.session.avatarUrl,
      streak: streakData.streak,
      // Pass these specific fields to frontend
      todayCount: streakData.todayCount,
      weekCount: streakData.weekCount,
      lastContribution: streakData.lastContributionDate
    });
  } else {
    res.json({ authenticated: false });
  }
});

// --- 3. FEATURE ROUTES ---
// ... (Rest of the file remains exactly the same as before)
// Copy everything below this line from your original file: 
// /api/schedule, /api/commit-now, /api/contributions, cron job, etc.

// Get Schedule
app.get('/api/schedule', async (req, res) => {
  if (!req.session.githubId) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabase.from('schedules').select('*').eq('user_github_id', req.session.githubId).single(); 
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  res.json({ schedule: data });
});

// Save Schedule
app.post('/api/schedule', async (req, res) => {
  if (!req.session.githubId) return res.status(401).json({ error: "Unauthorized" });
  const { repoName, scheduleTime, contentMode, timezone } = req.body;
  const { error } = await supabase.from('schedules').upsert({
      user_github_id: req.session.githubId,
      target_repo: repoName,
      schedule_time: scheduleTime,
      content_mode: contentMode,
      timezone: timezone || 'UTC',
      is_active: true
    }, { onConflict: 'user_github_id' });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ status: "success", message: "Schedule active" });
});

// Content Strategies
app.get('/api/content-strategies', (req, res) => {
  const strategies = getAvailableStrategies();
  res.json({ strategies });
});

// Get Repos
app.get('/api/repos', async (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${req.session.token}`, Accept: 'application/vnd.github.v3+json' },
      params: { sort: 'updated', per_page: 100, affiliation: 'owner', visibility: 'all' }
    });
    const repos = response.data.map(repo => repo.full_name);
    res.json({ repos });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// Commit Now
app.post('/api/commit-now', async (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: "Unauthorized" });
  const { repoName, message, contentStrategy } = req.body;
  
  // Strategy Selection
  let strategyToUse = contentStrategy;
  if (!strategyToUse && req.session.githubId) {
    try {
      const { data } = await supabase.from('schedules').select('content_mode').eq('user_github_id', req.session.githubId).single();
      strategyToUse = data?.content_mode;
    } catch(e) {}
  }

  const result = await pushDailyUpdate(req.session.token, repoName.trim(), message, strategyToUse || 'learning-log', req.session.username);
  
  if (result.success) {
    if (req.session.githubId) {
       await supabase.from('schedules').update({ last_run_at: new Date().toISOString() }).eq('user_github_id', req.session.githubId);
    }
    res.json({ status: 'success', content: result.content, strategy: result.strategy });
  } else {
    res.status(500).json({ status: 'error', message: result.error });
  }
});

// Contributions Route
const CACHE_FILE = path.join(process.cwd(), 'cache_contributions.json');
const CACHE_DURATION = 60 * 60 * 1000; 

async function getDiskCache(key) {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf-8');
    const cache = JSON.parse(raw);
    if (cache[key] && (Date.now() - cache[key].timestamp < CACHE_DURATION)) return cache[key].data;
    return null; 
  } catch (e) { return null; }
}

async function setDiskCache(key, data) {
  try {
    let cache = {};
    try { cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf-8')); } catch (e) {}
    cache[key] = { timestamp: Date.now(), data };
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (e) { console.error("Cache write failed:", e); }
}

app.get('/api/contributions', async (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: "Unauthorized" });
  const cacheKey = `contributions_${req.session.githubId}`;
  const cachedData = await getDiskCache(cacheKey);
  if (cachedData) return res.json({ contributions: cachedData });
  
  try {
    const query = `query($username: String!) { user(login: $username) { contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`;
    const response = await axios.post('https://api.github.com/graphql', { query, variables: { username: req.session.username } }, { headers: { 'Authorization': `Bearer ${req.session.token}` } });
    
    if (response.data.errors) throw new Error(response.data.errors[0].message);
    
    const weeks = response.data.data.user.contributionsCollection.contributionCalendar.weeks;
    const allDays = weeks.flatMap(week => week.contributionDays);
    await setDiskCache(cacheKey, allDays.map(day => ({ date: day.date, count: day.contributionCount })));
    res.json({ contributions: allDays.map(day => ({ date: day.date, count: day.contributionCount })) });
  } catch (error) {
    res.json({ contributions: [], error: error.message });
  }
});

app.post('/api/logout', (req, res) => { req.session = null; res.json({ status: "logged out" }); });

// Cron Job
cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  console.log(`⏰ [CRON] Tick: ${now.toISOString()}`);

  try {
    const { data: schedules } = await supabase.from('schedules').select('*, users(access_token, username)').eq('is_active', true);
    if (schedules) {
      for (const job of schedules) {
        const userTime = new Date().toLocaleTimeString('en-US', { timeZone: job.timezone || 'UTC', hour: '2-digit', minute: '2-digit', hour12: false });
        const [uH, uM] = userTime.split(':');
        const [sH, sM] = job.schedule_time.split(':');
        
        if (uH == sH && uM == sM && job.users?.access_token) {
             console.log(`   🚀 Triggering job for ${job.users.username}`);
             const res = await pushDailyUpdate(job.users.access_token, job.target_repo, "", job.content_mode || 'learning-log', job.users.username);
             if(res.success) await supabase.from('schedules').update({ last_run_at: new Date().toISOString() }).eq('id', job.id);
        }
      }
    }
  } catch (e) { console.error("Cron failed", e); }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});