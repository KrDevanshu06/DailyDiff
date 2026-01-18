import { Octokit } from "@octokit/rest";

// Centralized Cache
const streakCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getRealtimeStreak(accessToken) {
  const cacheKey = `streak_${accessToken.slice(-8)}`;
  const cached = streakCache.get(cacheKey);
  
  // 1. Return cached data if fresh
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('⚡ Returning cached streak data from Service');
    return cached.data;
  }

  const octokit = new Octokit({ 
    auth: accessToken,
    request: { timeout: 15000 }
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

    const response = await octokit.graphql(query);
    const weeks = response.viewer.contributionsCollection.contributionCalendar.weeks;
    const days = weeks.flatMap((week) => week.contributionDays).reverse();
    
    const today = new Date().toISOString().split('T')[0];
    
    // 2. Calculate Stats
    let streak = 0;
    for (const day of days) {
      if (day.date > today) continue;
      if (day.contributionCount > 0) streak++;
      else if (day.date !== today) break;
    }

    const todayData = days.find(d => d.date === today);
    const todayCount = todayData ? todayData.contributionCount : 0;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const weekCount = days
      .filter(d => d.date >= startOfWeekStr && d.date <= today)
      .reduce((acc, d) => acc + d.contributionCount, 0);

    const lastContrib = days.find(d => d.contributionCount > 0);

    const result = { 
        streak, 
        todayCount, 
        weekCount, 
        lastContributionDate: lastContrib ? lastContrib.date : null 
    };

    // 3. Save to Cache
    streakCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error("Streak calculation failed:", error.message);
    return { streak: 0, todayCount: 0, weekCount: 0, lastContributionDate: null, error: true };
  }
}