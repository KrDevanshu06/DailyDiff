import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, X, Activity, Lightbulb } from 'lucide-react';
import API_URL from '../config';

// Component imports
import DashboardNavbar from './dashboard/DashboardNavbar';
import DashboardHeader from './dashboard/DashboardHeader';
import AutomationSettings from './dashboard/AutomationSettings';
import ContributionHistory from './dashboard/ContributionHistory';
import StreakCard from './dashboard/StreakCard';
import ManualCheckIn from './dashboard/ManualCheckIn';
import MicroTaskGenerator from './dashboard/MicroTaskGenerator';

// Types
interface UserProfile {
  username: string;
  avatarUrl: string;
  streak?: number;
}

interface Strategy {
  id: string;
  label: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  // State management
  const [isInitialized, setIsInitialized] = useState(false);
  const [streak, setStreak] = useState(0);
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

  // --- CONSTANTS ---
  const commonTimezones = [
    "UTC",
    "Asia/Kolkata",
    "America/Los_Angeles", 
    "America/New_York",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Australia/Sydney"
  ];

  // --- UTILITY FUNCTIONS ---
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- DATA FETCHING ---
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
          setStreak(data.streak || 0);
          setUserProfile(prev => prev ? { ...prev, streak: data.streak } : null);
        }
      }
    } catch (error) { console.error(error); } finally { setIsLoadingStreak(false); }
  };

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log("🚀 Initializing Dashboard...");
      
      // Set default strategies immediately to prevent loading state issues
      setAvailableStrategies([
        { id: 'learning-log', label: 'Learning Log', description: 'Daily learning entries', icon: Activity },
        { id: 'dev-tip', label: 'Dev Tips', description: 'Development insights', icon: Lightbulb }
      ]);

      try {
        // Fetch user profile and streak
        console.log("📡 Fetching user data...");
        const userResponse = await fetch(`${API_URL}/api/user`, { credentials: 'include' });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log("✅ User data received:", userData);
          if (userData.authenticated) {
            setUserProfile({
              username: userData.username,
              avatarUrl: userData.avatarUrl,
              streak: userData.streak
            });
            setStreak(userData.streak || 0);
            setTodayCommitted(userData.todayCommitted || false);
            
            // Fetch repositories after confirming authentication
            console.log("📦 Fetching repositories...");
            fetchRepos();
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch user data:', error);
      } finally {
        setIsLoadingStreak(false);
      }

      try {
        // Fetch automation settings
        console.log("⚙️ Fetching settings...");
        const settingsResponse = await fetch(`${API_URL}/api/schedule`, { credentials: 'include' });
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          console.log("✅ Settings data received:", settingsData);
          if (settingsData.schedule) {
            setTargetRepo(settingsData.schedule.target_repo || "");
            setScheduleTime(settingsData.schedule.schedule_time || "20:00");
            setContentMode(settingsData.schedule.content_mode || "learning-log");
            setIsBotActive(settingsData.schedule.is_active || false);
            if (settingsData.schedule.timezone) {
              setUserTimezone(settingsData.schedule.timezone);
            }
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }

      try {
        // Fetch content strategies (optional - fallback already set)
        console.log("📋 Fetching content strategies...");
        const strategiesResponse = await fetch(`${API_URL}/api/content-strategies`);
        if (strategiesResponse.ok) {
          const strategiesData = await strategiesResponse.json();
          const strategies = (strategiesData.strategies || []).map((strategy: { icon: string }) => ({
            ...strategy,
            icon: strategy.icon === 'Lightbulb' ? Lightbulb : Activity
          }));
          if (strategies.length > 0) {
            setAvailableStrategies(strategies);
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch content strategies:', error);
        // Keep fallback strategies already set
      }

      console.log("🎉 Dashboard initialization complete!");
      setIsInitialized(true);
    };

    initializeDashboard();
  }, []);

  // Action handlers
  const handleManualCommit = async () => {
    if (todayCommitted) {
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
        setTodayCommitted(true);
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

      if (response.ok) {
        setIsBotActive(true);
        showToast(`✅ Schedule saved for ${scheduleTime} (${userTimezone})`, 'success');
      } else {
        const errorData = await response.json();
        showToast(`❌ Error: ${errorData.error || 'Failed to save settings'}`, 'error');
      }
    } catch (error) {
      console.error('Save settings failed:', error);
      showToast("❌ Network error. Please try again.", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-[#2ea043] selection:text-white relative overflow-hidden select-none">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ 
        background: `radial-gradient(ellipse at top left, rgba(46, 160, 67, 0.05) 0%, transparent 50%), 
                     radial-gradient(ellipse at bottom right, rgba(35, 134, 54, 0.03) 0%, transparent 50%)`, 
        opacity: 0.3 
      }} />
      <div className="fixed inset-0 animated-gradient pointer-events-none z-0" />
      
      <div className="relative z-10">
        {/* Toast Notifications */}
        {toast && createPortal(
          <div className="fixed top-20 right-6 z-[10000] flex items-center gap-3 px-4 py-3 bg-[#161b22] border border-gray-700 rounded-xl shadow-2xl backdrop-blur-xl" 
               style={{ animation: 'slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-[#39d353]/10' : 'bg-red-500/10'}`}>
              {toast.type === 'success' ? 
                <CheckCircle2 size={18} className="text-[#39d353]" /> : 
                <AlertTriangle size={18} className="text-red-500" />
              }
            </div>
            <span className="text-sm font-medium text-gray-200">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>, 
          document.body
        )}

        {/* Navigation */}
        <DashboardNavbar 
          user={userProfile ? {
            id: userProfile.username,
            github_username: userProfile.username,
            avatar_url: userProfile.avatarUrl
          } : null}
          onSignOut={onLogout}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 pt-18 sm:pt-20">
          <div className="animate-fade-in-up">
            <DashboardHeader userProfile={userProfile} />
          </div>

          {!isInitialized ? (
            // Initial loading state to prevent component disappearing
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <div className="loading-shimmer h-64 rounded-xl"></div>
                <div className="loading-shimmer h-96 rounded-xl"></div>
              </div>
              <div className="space-y-6 sm:space-y-8">
                <div className="loading-shimmer h-80 rounded-xl"></div>
                <div className="loading-shimmer h-64 rounded-xl"></div>
                <div className="loading-shimmer h-80 rounded-xl"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="animate-fade-in-up animate-delay-100">
                <AutomationSettings 
                  isLoadingSettings={isLoadingSettings}
                  targetRepo={targetRepo} 
                  setTargetRepo={setTargetRepo}
                  scheduleTime={scheduleTime} 
                  setScheduleTime={setScheduleTime}
                  userTimezone={userTimezone} 
                  setUserTimezone={setUserTimezone}
                  contentMode={contentMode} 
                  setContentMode={setContentMode}
                  availableStrategies={availableStrategies}
                  isBotActive={isBotActive} 
                  isSaving={isSaving}
                  handleSaveSettings={handleSaveSettings}
                  commonTimezones={commonTimezones}
                  repos={repos} 
                  fetchRepos={fetchRepos} 
                  isLoadingRepos={isLoadingRepos}
                />
              </div>
              
              <div className="card-professional rounded-xl sm:rounded-2xl p-6 sm:p-8 animate-fade-in-up animate-delay-200">
                <ContributionHistory />
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              <div className="animate-fade-in-up animate-delay-100">
                <StreakCard 
                  streakData={{
                    current: streak,
                    longest: streak,
                    todayContributed: todayCommitted,
                    contributions: {
                      today: todayCommitted ? 1 : 0,
                      yesterday: 0,
                      thisWeek: 0,
                      thisMonth: 0
                    }
                  }}
                  isLoadingStreak={isLoadingStreak} 
                  refreshStreak={refreshGitHubStreak}
                  username={userProfile?.username || 'Dev'}
                />
              </div>
              
              <div className="animate-fade-in-up animate-delay-200">
                <ManualCheckIn onManualCommit={handleManualCommit} />
              </div>
              
              <div className="animate-fade-in-up animate-delay-300">
                <MicroTaskGenerator targetRepo={targetRepo} />
              </div>
            </div>
          </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;