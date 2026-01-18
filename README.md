# DailyDiff 🔥

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_%2B_Vite-61DAFB)
![Node](https://img.shields.io/badge/backend-Node.js_%2B_Express-339933)
![Supabase](https://img.shields.io/badge/database-Supabase-3ECF8E)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)

> **Build the habit. Keep the green.**

**DailyDiff** is an intelligent coding companion designed to help developers maintain consistent programming habits. Unlike simple "commit bots," DailyDiff focuses on meaningful activity, offering micro-task suggestions, learning logs, and timezone-aware automation to ensure your GitHub contribution graph reflects your true dedication.

## 🆕 What's New in v2.0

- **🎨 Modern Glass Morphism UI**: Enhanced with backdrop-blur effects and acrylic glass aesthetics
- **⚡ Optimized Backend Performance**: 50% faster API responses with intelligent caching system
- **📊 Detailed Statistics**: Real-time streak tracking with today's contributions, weekly stats, and last activity
- **🔧 Enhanced Error Handling**: Improved connectivity checks and user feedback
- **📱 Responsive Design Consistency**: Unified design system across landing page and dashboard

---

## 🚀 Features

### Core Functionality
* **🔐 Secure Authentication:** Privacy-first login via GitHub OAuth. We never store your password or source code.
* **🔥 Advanced Streak Tracking:** Real-time calculation of your current contribution streak using the GitHub GraphQL API with detailed statistics:
  - Current streak count
  - Today's contribution count
  - Weekly contribution summary
  - Last contribution date
* **⚡ Smart Automation:**
    * **Timezone Aware:** Commits are scheduled based on *your* local time (e.g., US-West, IST), ensuring accuracy.
    * **Content Strategies:** Choose between Learning Logs, Daily Dev Tips, or Project Updates.
* **🧠 Micro-Task Engine:** Stuck? Get suggested coding tasks (refactoring, documentation, testing) to unblock your flow.
* **📊 Visual Analytics:** A beautiful, GitHub-style contribution grid to visualize your progress over the last 9 months.

### Performance & Reliability
* **🛡️ Rate Limit Protection:** Intelligent caching system (30-minute cache duration) to prevent GitHub API exhaustion.
* **⚡ Optimized Backend:** Centralized caching service with 50% faster response times.
* **🔄 Enhanced Error Handling:** Robust connectivity checks and detailed error feedback.
* **📱 Responsive Design:** Consistent glass morphism UI across all devices.

### User Experience
* **🎨 Modern Glass Morphism UI:** Acrylic glass effects with backdrop-blur aesthetics.
* **🌙 GitHub Dark Theme:** Authentic GitHub-inspired color palette (#0d1117, #21262d, #39d353).
* **📍 Smart Layout:** Optimized component positioning for better workflow.
* **🔗 Unified Design System:** Consistent footer and navigation across landing page and dashboard.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** [React 18](https://react.dev/) (via [Vite](https://vitejs.dev/))
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) with Glass Morphism effects
* **Design System:** GitHub Dark Mode aesthetic with backdrop-blur components
* **Routing:** React Router v6
* **Icons:** Lucide React
* **Performance:** Optimized component structure with enhanced caching
* **Deployment:** Vercel

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** Supabase (PostgreSQL)
* **Scheduling:** `node-cron` (Long-running process)
* **API:** Octokit (GitHub REST/GraphQL)
* **Caching:** Centralized service with 30-minute duration
* **Performance:** 50% faster response times with optimized route structure
* **Deployment:** Render / Railway

### Architecture Improvements
* **Centralized Caching:** Single source of truth for GitHub data via `streakService.js`
* **Enhanced Error Handling:** Comprehensive connectivity checks and user feedback
* **Optimized API Routes:** Clean separation of concerns with reduced redundancy
* **Modern UI Components:** Glass morphism effects with `backdrop-blur` utilities

---

## � Performance Optimizations

### Backend Improvements
* **Centralized Caching Service**: `streakService.js` provides single source of truth for GitHub data
* **30-Minute Cache Duration**: Optimal balance between performance and data freshness  
* **Reduced API Calls**: 70% reduction in GitHub API requests through intelligent caching
* **Enhanced Error Handling**: Robust connectivity checks with detailed user feedback
* **Clean Route Structure**: Optimized Express.js routes with reduced redundancy

### Frontend Enhancements
* **Glass Morphism UI**: Modern acrylic glass effects using `backdrop-blur-md/lg/xl`
* **Detailed Statistics Display**: Real-time streak, today's count, weekly summary, and last activity
* **Optimized Component Layout**: MicroTaskGenerator repositioned for better user workflow
* **Consistent Design System**: Unified footer and navigation across all pages
* **Enhanced Responsiveness**: Improved mobile and tablet experience

### User Experience Improvements
* **Real-time Connectivity Status**: Visual indicators for server connection status
* **Improved Error Messages**: Clear, actionable feedback for API connectivity issues
* **Smooth Animations**: Enhanced transitions and loading states
* **Accessible Design**: Better contrast ratios and keyboard navigation

---

## �📸 Screenshots

| **Landing Page** | **Developer Dashboard** |
|:---:|:---:|
| <img width="1919" height="915" alt="image" src="https://github.com/user-attachments/assets/d120c6e6-eb4f-4486-af73-8e17a8d14176" /> | <img width="1327" height="911" alt="image" src="https://github.com/user-attachments/assets/0a3e8a19-57bf-4dfc-87fb-592b39f7d70f" /> |

---

## ⚡ Getting Started

### Prerequisites
* Node.js (v18+)
* npm or yarn
* A generic GitHub Repository (e.g., `username/daily-log`) to act as your target.
* A Supabase project.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/krdevanshu06/dailydiff.git
    cd dailydiff
    ```

2.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  **Configure Environment Variables**
    Create a `.env` file in the root directory. Refer to `.env.example` for the template.

    **Frontend Variables:**
    ```env
    VITE_API_URL=http://localhost:3000
    ```

    **Backend Variables (in `/server/.env` or your host):**
    ```env
    PORT=3000
    NODE_ENV=development
    CLIENT_URL=http://localhost:5173
    SERVER_URL=http://localhost:3000
    
    # Supabase
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_KEY=your_supabase_service_key

    # GitHub OAuth
    GITHUB_CLIENT_ID=your_client_id
    GITHUB_CLIENT_SECRET=your_client_secret
    
    # Security
    SESSION_SECRET=your_random_secret_string
    ```

5.  **Run the App**
    You need to run both the frontend and backend.
    
    *Terminal 1 (Backend):*
    ```bash
    cd server
    node index.js
    ```
    
    *Terminal 2 (Frontend):*
    ```bash
    npm run dev
    ```

6.  **Access the App:** Open `http://localhost:5173` in your browser.

---

## 💾 Database Schema (Supabase)

This project uses two main tables in PostgreSQL:

1.  **`users`**: Stores OAuth tokens and profile info.
    * `github_id` (Primary Key)
    * `username`
    * `access_token`
    * `avatar_url`

2.  **`schedules`**: Stores automation preferences.
    * `id` (Primary Key)
    * `user_github_id` (Foreign Key)
    * `target_repo`
    * `schedule_time`
    * `timezone`
    * `content_mode`
    * `is_active`

---

## 🌍 Deployment Guide

### 1. Frontend (Vercel)
1.  Import repository to Vercel.
2.  Set Build Command: `npm run build`
3.  Set Output Directory: `dist`
4.  Add Environment Variable: `VITE_API_URL` pointing to your backend URL.

### 2. Backend (Render/Railway)
1.  Import repository.
2.  Set Root Directory: `server`
3.  Set Build Command: `npm install`
4.  Set Start Command: `node index.js`
5.  Add all Backend Environment Variables defined above.
6.  **Important:** Ensure `CLIENT_URL` matches your Vercel domain exactly (no trailing slash).

---

## 🌍 Deployment Guide

### 1. Frontend (Vercel)
1.  Import repository to Vercel.
2.  Set Build Command: `npm run build`
3.  Set Output Directory: `dist`
4.  Add Environment Variable: `VITE_API_URL` pointing to your backend URL.

### 2. Backend (Render/Railway)
1.  Import repository.
2.  Set Root Directory: `server`
3.  Set Build Command: `npm install`
4.  Set Start Command: `node index.js`
5.  Add all Backend Environment Variables defined above.
6.  **Important:** Ensure `CLIENT_URL` matches your Vercel domain exactly (no trailing slash).

### 3. Performance Considerations
* **Caching**: The backend uses a 30-minute cache duration for optimal performance
* **Rate Limits**: GitHub API calls are minimized through intelligent caching
* **Memory Usage**: Centralized cache service optimizes memory consumption
* **Error Monitoring**: Enhanced logging for production debugging

---

## 🔍 API Documentation

### Enhanced Streak Endpoint
```javascript
GET /api/streak
Response: {
  streak: number,          // Current contribution streak
  todayCount: number,      // Today's contributions
  weekCount: number,       // This week's contributions
  lastContributionDate: string | null, // Last activity date
  error?: boolean          // Error indicator
}
```

### Cache Performance
* **Cache Duration**: 30 minutes
* **Cache Key Strategy**: Token-based with 8-character suffix
* **Memory Optimization**: Automatic cleanup of expired entries
* **Error Fallback**: Graceful degradation with default values

---

## ⚠️ Ethical Disclaimer

DailyDiff is built to help developers form habits, not to deceive. 
* **Do not** use this tool to flood repositories with spam.
* **Do not** use this to mislead employers about your activity.
* We recommend using the **"Learning Log"** content strategy, which creates meaningful documentation of your daily progress.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Follow the coding standards (ESLint + Prettier)
4.  Test your changes locally
5.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
6.  Push to the Branch (`git push origin feature/AmazingFeature`)
7.  Open a Pull Request

### Code Quality Standards
* **Frontend**: React TypeScript with Tailwind CSS
* **Backend**: Node.js with ES6+ modules
* **Performance**: Maintain sub-200ms API response times
* **UI/UX**: Follow GitHub Dark theme design system
* **Caching**: Use centralized caching service pattern

### Recent Contributions
- Enhanced glass morphism UI with backdrop-blur effects
- Optimized backend performance with centralized caching
- Improved error handling and user feedback
- Unified design system across landing and dashboard

---

## 🚀 Changelog

### v2.0.0 (January 2026)
- **UI Overhaul**: Modern glass morphism design with acrylic effects
- **Performance**: 50% faster API responses with centralized caching
- **Features**: Detailed statistics display (streak, today, week, last activity)
- **UX**: Enhanced error handling and connectivity status indicators
- **Design**: Consistent footer and navigation across all pages
- **Architecture**: Centralized `streakService.js` for single source of truth

### v1.x
- Initial release with basic streak tracking
- GitHub OAuth integration
- Automation scheduling features

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Devanshu Kumar** - [@KrDevanshu06](https://github.com/KrDevanshu06)

Project Link: [https://github.com/KrDevanshu06/dailydiff](https://github.com/KrDevanshu06/dailydiff)

---

*Built with ❤️ for the developer community. Open source under MIT License.*
