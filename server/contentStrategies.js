import axios from 'axios';

/**
 * Content Strategy System - Dynamic content generation to avoid duplicacy
 * Each strategy generates unique, meaningful content for GitHub commits
 */

// Helper function to get current date in various formats
function getDateFormats() {
  const now = new Date();
  return {
    iso: now.toISOString().split('T')[0], // 2025-11-22
    readable: now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), // Friday, November 22, 2025
    short: now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }), // Nov 22
    dayOfYear: Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24))
  };
}

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * STRATEGY 1: Learning Log - Generates programming learning entries
 */
async function generateLearningLog() {
  const dates = getDateFormats();
  
  const learningTopics = [
    "TypeScript advanced generics and conditional types",
    "React Server Components and streaming patterns",
    "Node.js performance optimization techniques",
    "GraphQL schema design best practices",
    "Docker containerization strategies",
    "PostgreSQL query optimization",
    "Redis caching implementation",
    "AWS Lambda serverless architecture",
    "Git workflow optimization",
    "Testing patterns with Jest and Cypress",
    "CSS Grid and Flexbox mastery",
    "JavaScript async/await error handling",
    "API rate limiting and throttling",
    "Database indexing strategies",
    "Security best practices for web apps",
    "Code refactoring techniques",
    "Performance monitoring and debugging",
    "CI/CD pipeline automation",
    "Microservices architecture patterns",
    "Frontend state management solutions"
  ];

  const actionPhrases = [
    "Deep dive into",
    "Explored",
    "Implemented",
    "Studied",
    "Practiced",
    "Experimented with",
    "Researched",
    "Built a demo for",
    "Debugged issues with",
    "Optimized"
  ];

  const insightPhrases = [
    "Key insight: Better error boundaries improve UX significantly",
    "Learned: Proper indexing can speed up queries by 10x",
    "Discovery: Memoization reduces unnecessary re-renders",
    "Takeaway: Type safety prevents 60% of runtime errors",
    "Observation: Code splitting improves initial load time",
    "Finding: Proper caching strategy reduces server load",
    "Realization: Clean architecture speeds up development",
    "Note: Testing early saves debugging time later",
    "Insight: Performance monitoring reveals bottlenecks",
    "Lesson: Documentation is code for future developers"
  ];

  const topic = getRandomItem(learningTopics);
  const action = getRandomItem(actionPhrases);
  const insight = getRandomItem(insightPhrases);

  return `📚 ${action} ${topic} | ${insight} [Day ${dates.dayOfYear}/365]`;
}

/**
 * STRATEGY 2: Daily Dev Tip - Generates practical coding tips
 */
async function generateDevTip() {
  const dates = getDateFormats();
  
  const tipCategories = {
    javascript: [
      "Use `Object.freeze()` to make objects immutable and prevent accidental mutations",
      "Leverage `Array.from()` with a mapping function to create and transform arrays in one go",
      "Use `Promise.allSettled()` instead of `Promise.all()` when you need all results regardless of failures",
      "Implement debouncing with `setTimeout` and `clearTimeout` for better performance in search inputs",
      "Use `structuredClone()` for deep cloning objects without external libraries"
    ],
    react: [
      "Use `React.memo()` for components that render the same result given the same props",
      "Implement error boundaries to gracefully handle component failures",
      "Use `useCallback` and `useMemo` wisely - only when you have actual performance issues",
      "Prefer composition over inheritance with React components",
      "Use `React.Suspense` for code splitting and lazy loading components"
    ],
    nodejs: [
      "Use `process.env.NODE_ENV` to conditionally load development vs production configs",
      "Implement proper error handling with try-catch blocks in async functions",
      "Use `cluster` module to leverage multiple CPU cores in Node.js applications",
      "Stream large files instead of loading them entirely into memory",
      "Use `helmet` middleware to secure Express applications with proper HTTP headers"
    ],
    general: [
      "Write self-documenting code - good variable names are better than comments",
      "Follow the DRY principle but don't over-abstract too early",
      "Use meaningful git commit messages that explain 'why' not 'what'",
      "Implement feature flags for safer production deployments",
      "Regular code reviews catch bugs and improve team knowledge sharing"
    ],
    performance: [
      "Optimize images with WebP format and lazy loading for better performance",
      "Use browser caching with proper Cache-Control headers",
      "Minimize bundle size with tree shaking and code splitting",
      "Implement virtual scrolling for large lists in web applications",
      "Use CDN for static assets to reduce server load and improve speed"
    ]
  };

  const categories = Object.keys(tipCategories);
  const category = getRandomItem(categories);
  const tip = getRandomItem(tipCategories[category]);
  
  const emojis = {
    javascript: "⚡",
    react: "⚛️",
    nodejs: "🟢",
    general: "💡",
    performance: "🚀"
  };

  return `${emojis[category]} Dev Tip: ${tip} #${category.toUpperCase()} [${dates.short}]`;
}

/**
 * STRATEGY 3: GitHub Stats - Generates contribution and activity updates
 */
async function generateGithubStats(accessToken, username) {
  const dates = getDateFormats();
  
  try {
    // Fetch user's recent activity from GitHub API
    const headers = { Authorization: `Bearer ${accessToken}` };
    
    // Get user stats
    const userResponse = await axios.get(`https://api.github.com/users/${username}`, { headers });
    const user = userResponse.data;
    
    // Get recent repositories
    const reposResponse = await axios.get(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, 
      { headers }
    );
    const recentRepos = reposResponse.data.slice(0, 3);
    
    // Get recent commits (from events)
    const eventsResponse = await axios.get(
      `https://api.github.com/users/${username}/events/public?per_page=10`, 
      { headers }
    );
    const pushEvents = eventsResponse.data.filter(event => event.type === 'PushEvent');
    const recentCommits = pushEvents.slice(0, 2);

    // Calculate streak (simplified - based on recent activity)
    const activeDays = new Set();
    eventsResponse.data.forEach(event => {
      const eventDate = new Date(event.created_at).toISOString().split('T')[0];
      activeDays.add(eventDate);
    });

    const statTemplates = [
      `📊 GitHub Activity: ${recentCommits.length} recent commits across ${recentRepos.length} repositories | Active streak: ${activeDays.size} days`,
      `🔥 Contribution Update: ${user.public_repos} public repos, ${user.followers} followers | Recent work on: ${recentRepos.map(r => r.name).join(', ')}`,
      `⚡ Development Stats: ${pushEvents.length} recent pushes | Most active in: ${recentRepos[0]?.name || 'various projects'}`,
      `📈 Progress Tracking: ${user.public_gists} gists shared | Latest commits in ${recentRepos.slice(0,2).map(r => r.name).join(' & ')}`,
      `🚀 Coding Journey: Day ${dates.dayOfYear} of 2025 | Recent activity: ${activeDays.size} active days this period`
    ];

    const template = getRandomItem(statTemplates);
    return `${template} [${dates.readable}]`;
    
  } catch (error) {
    console.error('Error fetching GitHub stats:', error.message);
    
    // Fallback stats when API fails
    const fallbackStats = [
      `📊 Daily Coding Update: Continuing the journey of consistent development`,
      `🔥 Progress Check: Building momentum with daily commits and learning`,
      `⚡ Development Log: Staying active in the coding community`,
      `📈 Streak Maintenance: Another day of growth and contribution`,
      `🚀 Consistency Update: Maintaining daily development habits`
    ];
    
    const fallback = getRandomItem(fallbackStats);
    return `${fallback} [Day ${dates.dayOfYear}/365]`;
  }
}

/**
 * STRATEGY 4: Project Progress - Generates project-specific updates
 */
async function generateProjectProgress() {
  const dates = getDateFormats();
  
  const projectTypes = [
    "Full-stack web application",
    "Mobile app with React Native",
    "API microservice",
    "Data visualization dashboard",
    "Chrome extension",
    "CLI tool",
    "Component library",
    "Documentation site",
    "E-commerce platform",
    "Real-time chat application"
  ];

  const progressActions = [
    "Refactored authentication module for better security",
    "Implemented responsive design for mobile compatibility",
    "Added comprehensive error handling and logging",
    "Optimized database queries for improved performance",
    "Enhanced user interface with modern design patterns",
    "Integrated third-party API for extended functionality",
    "Added automated testing with high coverage",
    "Implemented caching strategy for faster load times",
    "Updated dependencies to latest stable versions",
    "Added comprehensive documentation and examples"
  ];

  const statusEmojis = ["🔨", "⚙️", "🏗️", "🚧", "✨", "🔧", "📝", "🎨", "🔍", "🚀"];

  const project = getRandomItem(projectTypes);
  const action = getRandomItem(progressActions);
  const emoji = getRandomItem(statusEmojis);

  return `${emoji} Project Update: ${action} for ${project} | Continuous improvement cycle [${dates.short}]`;
}

/**
 * STRATEGY 5: Code Quality - Generates code quality and maintenance updates
 */
async function generateCodeQuality() {
  const dates = getDateFormats();
  
  const qualityActions = [
    "Reduced technical debt by refactoring legacy components",
    "Improved code coverage from 75% to 85% with additional unit tests",
    "Enhanced accessibility with proper ARIA labels and semantic HTML",
    "Optimized bundle size by implementing tree shaking and lazy loading",
    "Standardized coding style with ESLint and Prettier configurations",
    "Added comprehensive JSDoc comments for better developer experience",
    "Implemented design patterns for better code maintainability",
    "Enhanced error handling with custom exception classes",
    "Improved performance by eliminating unnecessary re-renders",
    "Added integration tests for critical user workflows"
  ];

  const qualityMetrics = [
    "Code complexity reduced by 20%",
    "Build time improved by 15%",
    "Test coverage increased",
    "Security vulnerabilities patched",
    "Performance score improved",
    "Accessibility compliance enhanced",
    "Code duplication eliminated",
    "Documentation completeness increased",
    "CI/CD pipeline optimized",
    "Developer experience enhanced"
  ];

  const action = getRandomItem(qualityActions);
  const metric = getRandomItem(qualityMetrics);

  return `🏆 Code Quality: ${action} | Result: ${metric} [Quality-focused development on ${dates.short}]`;
}

/**
 * Main content strategy router
 * Dynamically generates content based on the selected strategy
 */
export async function generateContent(strategy, accessToken = null, username = null) {
  console.log(`🎯 Generating ${strategy} content...`);
  
  try {
    switch (strategy) {
      case 'learning-log':
        return await generateLearningLog();
        
      case 'dev-tip':
        return await generateDevTip();
        
      case 'stats':
        return await generateGithubStats(accessToken, username);
        
      case 'project-progress':
        return await generateProjectProgress();
        
      case 'code-quality':
        return await generateCodeQuality();
        
      default:
        console.warn(`Unknown strategy: ${strategy}, falling back to learning-log`);
        return await generateLearningLog();
    }
  } catch (error) {
    console.error(`Error generating content for ${strategy}:`, error.message);
    
    // Fallback content
    const dates = getDateFormats();
    return `📝 Daily Development Update: Continuing the journey of consistent coding and learning [${dates.readable}]`;
  }
}

/**
 * Get list of available content strategies with descriptions
 */
export function getAvailableStrategies() {
  return [
    {
      id: 'learning-log',
      label: 'Learning Log',
      description: 'Daily learning entries about programming concepts and technologies',
      icon: 'BookOpen'
    },
    {
      id: 'dev-tip',
      label: 'Daily Dev Tip',
      description: 'Practical coding tips and best practices',
      icon: 'Lightbulb'
    },
    {
      id: 'stats',
      label: 'GitHub Stats',
      description: 'Personalized activity and contribution updates',
      icon: 'BarChart3'
    },
    {
      id: 'project-progress',
      label: 'Project Progress',
      description: 'Updates on ongoing development projects',
      icon: 'Rocket'
    },
    {
      id: 'code-quality',
      label: 'Code Quality',
      description: 'Focus on code improvement and technical excellence',
      icon: 'Award'
    }
  ];
}
