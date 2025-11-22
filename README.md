# DailyDiff 🔥

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_%2B_Vite-61DAFB)
![Node](https://img.shields.io/badge/backend-Node.js_%2B_Express-339933)
![Supabase](https://img.shields.io/badge/database-Supabase-3ECF8E)

> **Build the habit. Keep the green.**

**DailyDiff** is an intelligent coding companion designed to help developers maintain consistent programming habits. Unlike simple "commit bots," DailyDiff focuses on meaningful activity, offering micro-task suggestions, learning logs, and timezone-aware automation to ensure your GitHub contribution graph reflects your true dedication.

---

## 🚀 Features

* **🔐 Secure Authentication:** Privacy-first login via GitHub OAuth. We never store your password or source code.
* **🔥 Streak Tracking:** Real-time calculation of your current contribution streak using the GitHub GraphQL API.
* **⚡ Smart Automation:**
    * **Timezone Aware:** Commits are scheduled based on *your* local time (e.g., US-West, IST), ensuring accuracy.
    * **Content Strategies:** Choose between Learning Logs, Daily Dev Tips, or Project Updates.
* **🧠 Micro-Task Engine:** Stuck? Get suggested coding tasks (refactoring, documentation, testing) to unblock your flow.
* **📊 Visual Analytics:** A beautiful, GitHub-style contribution grid to visualize your progress over the last 9 months.
* **🛡️ Rate Limit Protection:** Intelligent caching system (Client-side & Disk-based) to prevent GitHub API exhaustion.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** [React 18](https://react.dev/) (via [Vite](https://vitejs.dev/))
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (GitHub Dark Mode aesthetic)
* **Routing:** React Router v6
* **Icons:** Lucide React
* **Deployment:** Vercel

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** Supabase (PostgreSQL)
* **Scheduling:** `node-cron` (Long-running process)
* **API:** Octokit (GitHub REST/GraphQL)
* **Deployment:** Render / Railway

---

## 📸 Screenshots

| **Landing Page** | **Developer Dashboard** |
|:---:|:---:|
| *[Insert Screenshot of Landing Page]* | *[Insert Screenshot of Dashboard]* |

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
    git clone [https://github.com/yourusername/dailydiff.git](https://github.com/yourusername/dailydiff.git)
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

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.