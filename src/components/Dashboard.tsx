import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, X, Activity, Lightbulb, LucideIcon } from 'lucide-react';
import API_URL from '../config';

// Component imports
import DashboardNavbar from './dashboard/DashboardNavbar';
import DashboardHeader from './dashboard/DashboardHeader';
import AutomationSettings from './dashboard/AutomationSettings'; // Updated path based on your structure
import ContributionHistory from './dashboard/ContributionHistory';
import StreakCard from './dashboard/StreakCard';
import ManualCheckIn from './dashboard/ManualCheckIn';
import MicroTaskGenerator from './dashboard/MicroTaskGenerator';
import DashboardFooter from './dashboard/DashboardFooter';

// --- Types ---
interface UserProfile {
  username: string;
  avatarUrl: string;
  streak?: number;
}

interface Strategy {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface DashboardProps {
  onLogout: () => void;
}

interface StreakStatsState {
  current: number;
  today: number;
  week: number;
  lastContribution: string | null;
}

// Interface for raw API response data for strategies
interface ApiStrategy {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  // --- State Management ---
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [streakStats, setStreakStats] = useState<StreakStatsState>({
    current: 0,
    today: 0,
    week: 0,
    lastContribution: null
  });

  const [todayCommitted, setTodayCommitted] = useState(false);
  const [isLoadingStreak, setIsLoadingStreak] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [targetRepo, setTargetRepo] = useState("");
  const [repos, setRepos] = useState<string[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("20:00");
  
  const [userTimezone, setUserTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return "UTC";
    }
  });

  const [contentMode, setContentMode] = useState("learning-log");
  const [availableStrategies, setAvailableStrategies] = useState<Strategy[]>([]);
  const [isBotActive, setIsBotActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const commonTimezones = [
    "UTC", "Asia/Kolkata", "America/Los_Angeles", "America/New_York",
    "Europe/London", "Europe/Berlin", "Asia/Tokyo", "Australia/Sydney"
  ];

  // --- Utility Functions ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/health`, { method: 'GET', credentials: 'include' });
      return response.ok;
    } catch {
      return false;
    }
  };

  // --- Data Fetching ---
  const fetchRepos = async () => {
    setIsLoadingRepos(true);
    try {
      const response = await fetch(`${API_URL}/api/repos`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setRepos(data.repos || []);
      }
    } catch (error) { console.error(error); } finally { setIsLoadingRepos(false); }
  };

  const refreshGitHubStreak = async () => {
    setIsLoadingStreak(true);
    try {
      const response = await fetch(`${API_URL}/api/user`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setStreakStats({
            current: data.streak || 0,
            today: data.todayCount || 0,
            week: data.weekCount || 0,
            lastContribution: data.lastContribution || null
          });
          setUserProfile(prev => prev ? { ...prev, streak: data.streak } : null);
          setTodayCommitted(data.todayCount > 0);
        }
      }
    } catch (error) { console.error(error); } finally { setIsLoadingStreak(false); }
  };

  // --- Initialization ---
  useEffect(() => {
    const initializeDashboard = async () => {
      // Default strategies fallback
      setAvailableStrategies([
        { id: 'learning-log', label: 'Learning Log', description: 'Daily learning entries', icon: Activity },
        { id: 'dev-tip', label: 'Dev Tips', description: 'Development insights', icon: Lightbulb }
      ]);

      // 1. Fetch User & Streak
      try {
        const userResponse = await fetch(`${API_URL}/api/user`, { credentials: 'include' });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.authenticated) {
             setUserProfile({ 
               username: userData.username, 
               avatarUrl: userData.avatarUrl, 
               streak: userData.streak 
             });
             
             setStreakStats({
                current: userData.streak || 0,
                today: userData.todayCount || 0,
                week: userData.weekCount || 0,
                lastContribution: userData.lastContribution || null
             });
             
             setTodayCommitted(userData.todayCount > 0);
             fetchRepos();
          }
        }
      } catch (error) { console.error('Failed to fetch user data:', error); } finally { setIsLoadingStreak(false); }

      // 2. Fetch Settings
      try {
        const settingsResponse = await fetch(`${API_URL}/api/schedule`, { credentials: 'include' });
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          if (settingsData.schedule) {
            setTargetRepo(settingsData.schedule.target_repo || "");
            setScheduleTime(settingsData.schedule.schedule_time || "20:00");
            setContentMode(settingsData.schedule.content_mode || "learning-log");
            setIsBotActive(settingsData.schedule.is_active || false);
            if (settingsData.schedule.timezone) setUserTimezone(settingsData.schedule.timezone);
          }
        }
      } catch (error) { console.error('Failed to fetch settings:', error); } finally { setIsLoadingSettings(false); }

      // 3. Fetch Strategies
      try {
        const strategiesResponse = await fetch(`${API_URL}/api/content-strategies`);
        if (strategiesResponse.ok) {
          const strategiesData = await strategiesResponse.json();
          const strategies: Strategy[] = (strategiesData.strategies || []).map((strategy: ApiStrategy) => ({
            id: strategy.id,
            label: strategy.label,
            description: strategy.description,
            icon: strategy.icon === 'Lightbulb' ? Lightbulb : Activity
          }));
          if (strategies.length > 0) setAvailableStrategies(strategies);
        }
      } catch (e) { /* silent fail */ }

      setIsInitialized(true);
    };

    initializeDashboard();
  }, []);

  // --- Handlers ---
  const handleManualCommit = async () => {
    if (streakStats.today > 0) {
      showToast("✅ Already committed today!", 'success');
      return;
    }
    if (!targetRepo?.trim()) {
      showToast("⚠️ Please select a target repository first!", 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/commit-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: targetRepo.trim(),
          message: "",
          contentStrategy: contentMode
        }),
        credentials: 'include'
      });

      if (response.ok) {
        showToast("✅ Commit pushed successfully!", 'success');
        await refreshGitHubStreak();
      } else {
        const errorData = await response.json();
        showToast(`❌ Failed: ${errorData.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Commit failed:', error);
      showToast("❌ Connection error. Please try again.", 'error');
    }
  };

  const handleSaveSettings = async () => {
    if (!targetRepo?.trim()) {
      showToast("⚠️ Please select a repository", 'error');
      return;
    }

    setIsSaving(true);
    
    // Check connectivity first
    const isServerUp = await checkServerConnection();
    if (!isServerUp) {
      showToast("❌ Cannot reach server. Please ensure the backend is running.", 'error');
      setIsSaving(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: targetRepo,
          scheduleTime,
          contentMode,
          timezone: userTimezone
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        setIsBotActive(true);
        showToast(`✅ Schedule saved for ${scheduleTime} (${userTimezone})`, 'success');
      } else {
        showToast(`❌ Error: ${data.error || 'Failed to save settings'}`, 'error');
      }
    } catch (error) {
      const err = error as Error;
      if (err.name === 'TypeError' && err.message.includes('fetch failed')) {
        showToast("❌ Cannot connect to server.", 'error');
      } else {
        showToast(`❌ Connection error: ${err.message}`, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-[#2ea043] selection:text-white relative overflow-hidden select-none bg-[#0d1117]">
      <div className="fixed inset-0 pointer-events-none z-0" style={{ 
        background: `radial-gradient(ellipse at top left, rgba(46, 160, 67, 0.05) 0%, transparent 50%), 
                     radial-gradient(ellipse at bottom right, rgba(35, 134, 54, 0.03) 0%, transparent 50%)`, 
        opacity: 0.4 
      }} />
      <div className="fixed inset-0 animated-gradient pointer-events-none z-0" />
      
      <div className="relative z-10">
        {toast && createPortal(
          <div className="fixed top-24 right-6 z-[10000] flex items-center gap-3 px-4 py-3 bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-right-5 fade-in duration-300">
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-[#39d353]/10' : 'bg-red-500/10'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={16} className="text-[#39d353]" /> : <AlertTriangle size={16} className="text-red-500" />}
            </div>
            <span className="text-xs font-medium text-gray-200">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-500 hover:text-white transition-colors"><X size={14} /></button>
          </div>, document.body
        )}

        <DashboardNavbar 
          user={userProfile ? {
            id: userProfile.username,
            github_username: userProfile.username,
            avatar_url: userProfile.avatarUrl
          } : null}
          onSignOut={onLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 sm:pt-24 min-h-[calc(100vh-80px)]">
           <div className="mb-8">
            <DashboardHeader userProfile={userProfile} />
          </div>

          {!isInitialized ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="loading-shimmer h-64 rounded-xl border border-gray-800"></div>
                <div className="loading-shimmer h-48 rounded-xl border border-gray-800"></div>
              </div>
              <div className="space-y-6">
                <div className="loading-shimmer h-48 rounded-xl border border-gray-800"></div>
                <div className="loading-shimmer h-80 rounded-xl border border-gray-800"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <AutomationSettings 
                  isLoadingSettings={isLoadingSettings}
                  targetRepo={targetRepo} setTargetRepo={setTargetRepo}
                  scheduleTime={scheduleTime} setScheduleTime={setScheduleTime}
                  userTimezone={userTimezone} setUserTimezone={setUserTimezone}
                  contentMode={contentMode} setContentMode={setContentMode}
                  availableStrategies={availableStrategies}
                  isBotActive={isBotActive} isSaving={isSaving}
                  handleSaveSettings={handleSaveSettings}
                  commonTimezones={commonTimezones}
                  repos={repos} fetchRepos={fetchRepos} isLoadingRepos={isLoadingRepos}
                />
                
                <div className="card-professional rounded-xl p-6">
                  <ContributionHistory />
                </div>
                
                <MicroTaskGenerator targetRepo={targetRepo} />
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                <StreakCard 
                  streakData={{
                    current: streakStats.current,
                    longest: streakStats.current, // You can expand API later for real longest streak
                    todayContributed: streakStats.today > 0,
                    contributions: {
                        today: streakStats.today,
                        yesterday: 0, 
                        thisWeek: streakStats.week,
                        thisMonth: 0
                    },
                    lastContribution: streakStats.lastContribution || undefined
                  }}
                  isLoadingStreak={isLoadingStreak} 
                  refreshStreak={refreshGitHubStreak}
                  username={userProfile?.username || 'Dev'}
                />
                
                <ManualCheckIn onManualCommit={handleManualCommit} />
              </div>
            </div>
          )}
        </main>
        <DashboardFooter />
      </div>
    </div>
  );
};

export default Dashboard;