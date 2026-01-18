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

// Load environment config
const environment = process.env.NODE_ENV || 'development';
if (environment === 'development') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// --- MIDDLEWARE ---
const allowedOrigins = [
  CLIENT_URL,
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
  credentials: true
}));

app.use(express.json());
app.set('trust proxy', 1); 

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'daily_diff_secure_key'],
  maxAge: 24 * 60 * 60 * 1000,
  secure: environment === 'production', 
  sameSite: environment === 'production' ? 'none' : 'lax',
  httpOnly: true
}));

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY
);

// --- ROUTES ---

app.get('/', (req, res) => res.status(200).send('✅ DailyDiff Backend is Active'));
app.get('/health', (req, res) => res.status(200).json({ status: 'active', timestamp: new Date() }));

// 1. Auth Routes
app.get('/auth/github', (req, res) => {
  const redirectUri = `${SERVER_URL}/auth/github/callback`;
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=repo user&prompt=consent`);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");
  
  try {
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }, { headers: { Accept: 'application/json' } });

    const accessToken = tokenRes.data.access_token;
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const user = userRes.data;

    // Save/Update User in DB
    await supabase.from('users').upsert({
        github_id: user.id.toString(),
        username: user.login,
        email: user.email,
        avatar_url: user.avatar_url, 
        access_token: accessToken
    });

    req.session.githubId = user.id.toString();
    req.session.username = user.login;
    req.session.avatarUrl = user.avatar_url;
    req.session.token = accessToken; 

    res.redirect(`${CLIENT_URL}/dashboard?login=success`);
  } catch (error) {
    console.error("Auth failed:", error.message);
    res.redirect(`${CLIENT_URL}?error=auth_failed`);
  }
});

// 2. User Stats Route (CLEANED)
app.get('/api/user', async (req, res) => {
  if (!req.session.githubId) return res.json({ authenticated: false });

  let stats = { streak: 0, todayCount: 0, weekCount: 0, lastContributionDate: null };

  if (req.session.token) {
    // FIX: Redundant caching removed. We trust streakService to handle it.
    try {
      const data = await getRealtimeStreak(req.session.token);
      if (!data.error) stats = data;
    } catch (e) {
      console.error("Streak fetch error:", e.message);
    }
  }

  res.json({ 
    authenticated: true, 
    username: req.session.username,
    githubId: req.session.githubId,
    avatarUrl: req.session.avatarUrl,
    streak: stats.streak,
    todayCount: stats.todayCount,
    weekCount: stats.weekCount,
    lastContribution: stats.lastContributionDate
  });
});

app.post('/api/logout', (req, res) => {
  req.session = null;
  res.json({ status: "logged out" });
});

// 3. Settings & Content Routes
app.get('/api/schedule', async (req, res) => {
  if (!req.session.githubId) return res.status(401).json({ error: "Unauthorized" });
  const { data, error } = await supabase.from('schedules').select('*').eq('user_github_id', req.session.githubId).single(); 
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  res.json({ schedule: data });
});

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
  
  console.log(`✅ Schedule saved for ${req.session.username}`);
  res.json({ status: "success", message: "Schedule active" });
});

app.get('/api/content-strategies', (req, res) => {
  res.json({ strategies: getAvailableStrategies() });
});

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
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});

app.post('/api/commit-now', async (req, res) => {
  if (!req.session.token) return res.status(401).json({ error: "Unauthorized" });
  const { repoName, message, contentStrategy } = req.body;
  
  const result = await pushDailyUpdate(
    req.session.token, 
    repoName, 
    message, 
    contentStrategy || 'learning-log', 
    req.session.username
  );
  
  if (result.success) {
    if (req.session.githubId) {
       await supabase.from('schedules')
         .update({ last_run_at: new Date().toISOString() })
         .eq('user_github_id', req.session.githubId);
    }
    res.json({ status: 'success', content: result.content });
  } else {
    res.status(500).json({ status: 'error', message: result.error });
  }
});

// 4. Contribution Graph (Disk Cached)
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
    
    // Save to disk
    let cache = {};
    try { cache = JSON.parse(await fs.readFile(CACHE_FILE, 'utf-8')); } catch (e) {}
    cache[cacheKey] = { timestamp: Date.now(), data: allDays.map(d => ({ date: d.date, count: d.contributionCount })) };
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));

    res.json({ contributions: cache[cacheKey].data });
  } catch (error) {
    res.json({ contributions: [], error: error.message });
  }
});

// --- CRON JOB ---
cron.schedule('* * * * *', async () => {
  console.log(`⏰ Tick: ${new Date().toISOString()}`);
  try {
    const { data: schedules } = await supabase.from('schedules').select('*, users(access_token, username)').eq('is_active', true);
    if (!schedules) return;

    for (const job of schedules) {
      // Timezone Aware Check
      const userTime = new Date().toLocaleTimeString('en-US', { 
        timeZone: job.timezone || 'UTC', 
        hour: '2-digit', minute: '2-digit', hour12: false 
      });
      
      const [uH, uM] = userTime.split(':');
      const [sH, sM] = job.schedule_time.split(':');

      if (uH == sH && uM == sM && job.users?.access_token) {
           console.log(`🚀 Executing job for ${job.users.username}`);
           const res = await pushDailyUpdate(job.users.access_token, job.target_repo, "", job.content_mode, job.users.username);
           
           // Update timestamp regardless of success to prevent infinite retries
           await supabase.from('schedules').update({ last_run_at: new Date().toISOString() }).eq('id', job.id);
      }
    }
  } catch (e) { console.error("Cron failed", e.message); }
});

app.listen(PORT, () => {
  console.log(`\n🚀 DailyDiff Backend Running on ${SERVER_URL}`);
  console.log(`🔗 Frontend expected at ${CLIENT_URL}\n`);
});