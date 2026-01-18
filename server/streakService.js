import { Octokit } from "@octokit/rest";

// Simple cache for streak data
const streakCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getRealtimeStreak(accessToken) {
  const cacheKey = `streak_${accessToken.slice(-8)}`;
  const cached = streakCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('Returning cached streak data');
    return cached.data;
  }

  const octokit = new Octokit({ 
    auth: accessToken,
    request: { timeout: 15000, retries: 1 }
  });

  try {
    const query = `
      query {
        viewer {
          contributionsCollection {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response = await Promise.race([
      octokit.graphql(query),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000))
    ]);

    const weeks = response.viewer.contributionsCollection.contributionCalendar.weeks;
    const days = weeks.flatMap((week) => week.contributionDays).reverse();
    
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Calculate Streak
    let streak = 0;
    for (const day of days) {
      if (day.date > today) continue;
      if (day.contributionCount > 0) {
        streak++;
      } else {
        if (day.date === today) continue;
        break;
      }
    }

    // 2. Calculate Today's Count
    const todayData = days.find(d => d.date === today);
    const todayCount = todayData ? todayData.contributionCount : 0;

    // 3. Calculate This Week's Count
    // Get start of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const weekCount = days
      .filter(d => d.date >= startOfWeekStr && d.date <= today)
      .reduce((acc, d) => acc + d.contributionCount, 0);

    // 4. Find Last Contribution Date
    const lastContrib = days.find(d => d.contributionCount > 0);
    const lastContributionDate = lastContrib ? lastContrib.date : null;

    const result = { 
        streak, 
        todayCount, 
        weekCount, 
        lastContributionDate 
    };

    streakCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error("Failed to calc streak:", error);
    return { streak: 0, todayCount: 0, weekCount: 0, error: true };
  }
}