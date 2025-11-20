import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pushDailyUpdate } from './commitBot.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json());

// --- ROUTES ---

// 1. Trigger a manual commit (Called when user clicks "Push Instant Update")
app.post('/api/commit-now', async (req, res) => {
  const { userToken, repoName, message } = req.body;

  if (!userToken || !repoName) {
    return res.status(400).json({ error: "Missing token or repo name" });
  }

  const result = await pushDailyUpdate(userToken, repoName, message || "Manual check-in via DailyDiff");
  
  if (result.success) {
    res.json({ status: "success" });
  } else {
    res.status(500).json({ status: "error", message: result.error });
  }
});

// 2. Save Schedule (Called when user clicks "Activate Automation")
// In a real app, this would save to a Database (Postgres/MongoDB)
app.post('/api/schedule', (req, res) => {
  const { userId, scheduleTime, repoName } = req.body;
  console.log(`📅 Scheduled job for User ${userId} at ${scheduleTime} on ${repoName}`);
  
  // TODO: Add database logic here to store this preference
  
  res.json({ status: "scheduled", time: scheduleTime });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// 4. How to run this?

// You need to initialize the backend folder with `package.json`.

// 1.  Open your terminal in the `krdevanshu06-dailydiff` root.
// 2.  Run these commands:

// ```bash
// cd server
// npm init -y
// npm install express cors dotenv @octokit/rest