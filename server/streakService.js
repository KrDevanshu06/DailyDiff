import { Octokit } from "@octokit/rest";

export async function getRealtimeStreak(accessToken) {
  const octokit = new Octokit({ 
    auth: accessToken,
    request: {
      timeout: 15000, // 15 second timeout
      retries: 2,     // Retry up to 2 times on failure
    }
  });

  try {
    // 1. GraphQL Query to get the last year of contributions
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
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('GraphQL request timeout')), 20000)
      )
    ]);
    const weeks = response.viewer.contributionsCollection.contributionCalendar.weeks;

    // 2. Flatten the weeks into a single array of days (reverse order: newest first)
    const days = weeks
      .flatMap((week) => week.contributionDays)
      .reverse(); 

    // 3. Calculate the Streak
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if the first day (today) has contributions, or if we need to look at yesterday
    // (Sometimes 'today' in the array is tomorrow depending on TZ, so we check the first valid entry)
    
    for (const day of days) {
      // Skip days in the future (if any exist due to timezone differences)
      if (day.date > today) continue;

      if (day.contributionCount > 0) {
        streak++;
      } else {
        // If we hit a 0 contribution day, STOP counting.
        // Exception: If the 0 contribution day is TODAY, we don't break yet 
        // (because the user might still commit today). 
        if (day.date === today) {
          continue; 
        }
        break;
      }
    }

    return { streak, lastContributionDate: days.find(d => d.contributionCount > 0)?.date };

  } catch (error) {
    console.error("Failed to calc streak:", error);
    return { streak: 0, error: true };
  }
}
