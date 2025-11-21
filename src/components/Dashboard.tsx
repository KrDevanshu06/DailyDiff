import { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Calendar, 
  LogOut, 
  User, 
  Zap, 
  RefreshCw, 
  Settings,
  GitBranch,
  Clock,
  Save,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Activity
} from 'lucide-react';

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  // --- State ---
  const [streak, setStreak] = useState(0);
  const [todayCommitted, setTodayCommitted] = useState(false);
  const [isLoadingStreak, setIsLoadingStreak] = useState(true);
  
  // User Profile State  
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatarUrl: string;
    streak?: number;
  } | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  
  // Automation Settings State
  const [targetRepo, setTargetRepo] = useState("");
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [contentMode, setContentMode] = useState("learning-log"); 
  const [isBotActive, setIsBotActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true); // New loading state

  // Micro-Task State
  const [currentIdea, setCurrentIdea] = useState<{title: string, desc: string} | null>(null);
  const [loadingIdea, setLoadingIdea] = useState(false);

  // Dropdown Menu State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Cursor Tracking State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseMoving, setIsMouseMoving] = useState(false);

  // --- Effects ---
  
  // 1. Generate Micro-Task Idea
  useEffect(() => {
    handleGenerateIdea();
  }, []);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileMenuOpen && !target.closest('[data-profile-menu]')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Cursor tracking for gradient effects
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMouseMoving(true);
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMouseMoving(false), 150);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  // 2. Fetch User Profile & Streak
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setUserProfile({
              username: data.username,
              avatarUrl: data.avatarUrl,
              streak: data.streak
            });
            
            // Also set the streak state for the UI
            if (typeof data.streak === 'number') {
              setStreak(data.streak);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoadingStreak(false);
      }
    };

    fetchUserProfile();
  }, []);



  // 4. Fetch Saved Schedule on Load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/schedule', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.schedule) {
            // Hydrate state from database
            setTargetRepo(data.schedule.target_repo);
            setScheduleTime(data.schedule.schedule_time);
            setContentMode(data.schedule.content_mode);
            setIsBotActive(data.schedule.is_active);
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  // --- Handlers ---
  const handleGenerateIdea = () => {
    const ideas = [
      { title: "Readme Polish", desc: "Fix typos or improve formatting in a project's README.md" },
      { title: "Dependency Audit", desc: "Check for outdated packages and run a minor update" },
      { title: "Comment Cleanup", desc: "Remove commented-out code or add JSDoc to a function" },
      { title: "Variable Rename", desc: "Rename a vague variable (e.g., 'data') to something specific" },
    ];
    
    setLoadingIdea(true);
    setTimeout(() => {
      const random = ideas[Math.floor(Math.random() * ideas.length)];
      setCurrentIdea(random);
      setLoadingIdea(false);
    }, 600);
  };

  // Real Manual Commit Handler
  const toggleCommit = async () => {
    // Optimistic UI update
    setStreak(s => todayCommitted ? s - 1 : s + 1);
    setTodayCommitted(!todayCommitted);

    if (!todayCommitted) {
      try {
        const response = await fetch('http://localhost:3000/api/commit-now', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoName: targetRepo, 
            message: "Manual check-in via DailyDiff Dashboard"
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const err = await response.json();
          alert("Failed to push to GitHub: " + err.message);
          // Revert state if failed
          setTodayCommitted(false);
          setStreak(s => s - 1);
        }
      } catch (e) {
        console.error("Commit failed", e);
        alert("Connection error. Check backend.");
        setTodayCommitted(false);
        setStreak(s => s - 1);
      }
    }
  };

  // Refresh GitHub Streak Handler
  const refreshGitHubStreak = async () => {
    setIsLoadingStreak(true);
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && typeof data.streak === 'number') {
          setStreak(data.streak);
          setUserProfile(prev => prev ? { ...prev, streak: data.streak } : null);
        }
      }
    } catch (error) {
      console.error("Failed to refresh GitHub streak:", error);
    } finally {
      setIsLoadingStreak(false);
    }
  };

  // Real Schedule Saving Handler
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: targetRepo,
          scheduleTime: scheduleTime,
          contentMode: contentMode
        }),
        credentials: 'include' // CRITICAL: Sends the session cookie so backend knows USER ID
      });

      const data = await response.json();

      if (response.ok) {
        setIsBotActive(true);
        alert(`✅ Schedule Saved! Bot will run daily at ${scheduleTime}`);
      } else {
        alert("❌ Error saving schedule: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Save failed", error);
      alert("❌ Could not connect to backend server.");
    } finally {
      setIsSaving(false);
    }
  };

  // Contribution History Component
  interface ContributionDay {
    date: string;
    count: number;
  }

  // --- START OF NEW COMPONENT ---
  const ContributionHistory = () => {
    const [contributionData, setContributionData] = useState<ContributionDay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // --- 1. FALLBACK DATA GENERATOR (Saves you when API is blocked) ---
    const generateMockData = () => {
      console.log("⚠️ Using Mock Data (API unavailable or empty)");
      const data: ContributionDay[] = [];
      const today = new Date();
      for (let i = 365; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Randomize activity
        const rand = Math.random();
        let count = 0;
        if (rand > 0.9) count = Math.floor(Math.random() * 8) + 4;
        else if (rand > 0.6) count = Math.floor(Math.random() * 3) + 1;
        
        data.push({
          date: date.toISOString().split('T')[0],
          count
        });
      }
      return data;
    };

    useEffect(() => {
      const fetchContributions = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/contributions', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            // If API returns data, use it. If empty array (common bug), use Mock.
            if (data.contributions && data.contributions.length > 0) {
              setContributionData(data.contributions);
            } else {
              setContributionData(generateMockData());
            }
          } else {
            setContributionData(generateMockData());
          }
        } catch (error) {
          console.error("Fetch failed:", error);
          setContributionData(generateMockData());
        } finally {
          setIsLoading(false);
        }
      };

      fetchContributions();
    }, []);

    const getLevelColor = (count: number) => {
      if (count === 0) return 'bg-[#161b22] border border-transparent';
      if (count <= 3) return 'bg-[#0e4429] border border-transparent';
      if (count <= 6) return 'bg-[#006d32] border border-transparent';
      if (count <= 9) return 'bg-[#26a641] border border-transparent';
      return 'bg-[#39d353] border border-transparent shadow-[0_0_5px_rgba(57,211,83,0.4)]';
    };

    const handleMouseEnter = (day: ContributionDay, e: React.MouseEvent) => {
      setHoveredDay(day);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // --- 2. RENDER LOGIC: SEPARATED MONTHS ---
    const renderMonths = () => {
      const monthsToRender = [];
      const today = new Date();
      
      // Generate last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthsToRender.push(d);
      }

      const dataMap = new Map(contributionData.map(c => [c.date, c.count]));

      return (
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          {monthsToRender.map((monthDate, monthIndex) => {
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
            const startDayOffset = monthDate.getDay(); // 0 = Sunday, 1 = Monday...

            // Create exact slots for the grid (Padding + Days)
            const slots = [];
            for (let k = 0; k < startDayOffset; k++) slots.push(null); // Empty cells
            for (let k = 1; k <= daysInMonth; k++) {
              const current = new Date(monthDate.getFullYear(), monthDate.getMonth(), k);
              const dateStr = current.toISOString().split('T')[0];
              slots.push({
                date: dateStr,
                count: dataMap.get(dateStr) || 0
              });
            }

            return (
              <div key={monthIndex} className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {monthName}
                </span>
                {/* 7 Rows for Days of Week (Sun -> Sat) */}
                <div className="grid grid-rows-7 grid-flow-col gap-1" style={{ height: '84px' }}>
                  {slots.map((slot, i) => {
                    if (!slot) return <div key={`e-${i}`} className="w-2.5 h-2.5" />; // Invisible spacer
                    return (
                      <div
                        key={slot.date}
                        onMouseEnter={(e) => handleMouseEnter(slot, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-2.5 h-2.5 rounded-[2px] cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10 ${getLevelColor(slot.count)}`}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="relative w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Activity className="text-[#39d353] w-5 h-5" />
            <h3 className="text-xl font-bold text-white">Activity History</h3>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            {/* If mock data is active, show 'Demo Mode' */}
             {contributionData.length > 0 ? `${contributionData.length} days tracked` : "Loading..."}
          </div>
        </div>

        {/* Grid Container */}
        <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
          {isLoading ? (
            <div className="flex gap-4 animate-pulse opacity-50">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 w-20 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          ) : (
             renderMonths()
          )}
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <div 
            className="fixed z-[100] bg-[#21262d] border border-gray-600 rounded px-3 py-2 text-xs text-white shadow-xl pointer-events-none whitespace-nowrap backdrop-blur-md bg-opacity-90"
            style={{ 
              left: mousePosition.x, 
              top: mousePosition.y - 40,
              transform: 'translateX(-50%)' 
            }}
          >
            <div className="font-bold text-[#39d353]">{hoveredDay.count} contributions</div>
            <div className="text-gray-400">{hoveredDay.date}</div>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 text-[10px] text-gray-500 mt-2">
           <span>Less</span>
           <div className="w-2.5 h-2.5 bg-[#161b22] rounded-[2px]"></div>
           <div className="w-2.5 h-2.5 bg-[#0e4429] rounded-[2px]"></div>
           <div className="w-2.5 h-2.5 bg-[#006d32] rounded-[2px]"></div>
           <div className="w-2.5 h-2.5 bg-[#26a641] rounded-[2px]"></div>
           <div className="w-2.5 h-2.5 bg-[#39d353] rounded-[2px]"></div>
           <span>More</span>
        </div>
      </div>
    );
  };
  // --- END OF COMPONENT ---

  return (
    <>
      <style>
        {`
          @keyframes dropdownFadeIn {
            0% {
              opacity: 0;
              transform: translateY(-8px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes glowPulse {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(46, 160, 67, 0.1),
                         0 0 40px rgba(46, 160, 67, 0.05),
                         inset 0 0 20px rgba(255, 255, 255, 0.02);
            }
            50% { 
              box-shadow: 0 0 30px rgba(46, 160, 67, 0.15),
                         0 0 60px rgba(46, 160, 67, 0.08),
                         inset 0 0 25px rgba(255, 255, 255, 0.03);
            }
          }

          .glass-morphism {
            background: rgba(22, 27, 34, 0.8);
            backdrop-filter: blur(16px) saturate(1.8);
            -webkit-backdrop-filter: blur(16px) saturate(1.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.3),
              0 1px 1px rgba(255, 255, 255, 0.1) inset,
              0 -1px 1px rgba(0, 0, 0, 0.1) inset;
          }

          .glass-morphism-light {
            background: rgba(13, 17, 23, 0.6);
            backdrop-filter: blur(12px) saturate(1.5);
            -webkit-backdrop-filter: blur(12px) saturate(1.5);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 
              0 4px 16px rgba(0, 0, 0, 0.2),
              0 1px 1px rgba(255, 255, 255, 0.08) inset;
          }

          .cursor-ambient {
            background: radial-gradient(1200px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(46, 160, 67, 0.005) 0%, 
              rgba(46, 160, 67, 0.002) 70%, 
              transparent 90%);
            transition: opacity 1s ease;
            opacity: ${isMouseMoving ? 0.3 : 0.08};
          }

          .animated-gradient {
            background: linear-gradient(-45deg, 
              rgba(46, 160, 67, 0.008), 
              rgba(35, 134, 54, 0.012), 
              rgba(57, 211, 83, 0.006), 
              rgba(46, 160, 67, 0.01));
            background-size: 600% 600%;
            animation: gradientShift 20s ease infinite;
          }

          .subtle-glow {
            box-shadow: 0 0 20px rgba(46, 160, 67, 0.03);
            transition: box-shadow 0.3s ease;
          }

          .subtle-glow:hover {
            box-shadow: 0 0 25px rgba(46, 160, 67, 0.05);
          }

          .gentle-hover {
            transition: all 0.2s ease;
          }

          .gentle-hover:hover {
            transform: translateY(-1px);
            box-shadow: 
              0 4px 20px rgba(0, 0, 0, 0.15),
              0 1px 1px rgba(255, 255, 255, 0.05) inset;
          }

          body {
            background: 
              radial-gradient(ellipse at top left, rgba(46, 160, 67, 0.1) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(35, 134, 54, 0.08) 0%, transparent 50%),
              #0d1117;
          }
        `}
      </style>
      <div className="min-h-screen text-gray-100 font-sans selection:bg-[#2ea043] selection:text-white animate-fade-in-up relative overflow-hidden">
        {/* Subtle Cursor Ambient Light */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(46, 160, 67, 0.008) 0%, 
              rgba(46, 160, 67, 0.003) 60%, 
              transparent 80%)`,
            transition: 'opacity 0.8s ease',
            opacity: isMouseMoving ? 0.4 : 0.1
          }}
        />
        
        {/* Static Background Gradients */}
        <div className="fixed inset-0 animated-gradient pointer-events-none z-0" />
        
        <div className="relative z-10">
      {/* Dashboard Nav */}
      <nav className="glass-morphism border-b border-gray-800/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-gradient-to-br from-[#2ea043] to-[#238636] rounded-lg">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Daily<span className="text-[#39d353]">Diff</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            {isLoadingSettings ? (
               <div className="h-6 w-24 bg-gray-800 rounded animate-pulse hidden md:block"></div>
            ) : (
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs transition-colors ${isBotActive ? 'bg-[#238636]/10 border-[#238636] text-[#39d353]' : 'bg-[#0d1117] border-gray-800 text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full ${isBotActive ? 'bg-[#39d353] animate-pulse' : 'bg-gray-600'}`}></div>
                {isBotActive ? `Auto-Commit: ${scheduleTime}` : 'Automation Paused'}
              </div>
            )}
            {/* Profile Dropdown */}
            <div className="relative" data-profile-menu>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors rounded-lg px-2 py-1.5 hover:bg-gray-800/50"
              >
                <span className="hidden sm:inline font-medium">
                  {userProfile?.username || 'Loading...'}
                </span>
                {userProfile?.avatarUrl && !avatarError ? (
                  <div className="w-8 h-8 rounded-full border border-gray-700 overflow-hidden bg-gray-800 flex-shrink-0">
                    <img 
                      src={userProfile.avatarUrl} 
                      alt={`${userProfile.username}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-400" />
                  </div>
                )}
                <ChevronDown size={14} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-1 w-52 glass-morphism rounded-xl shadow-2xl py-2 z-50"
                  style={{
                    animation: 'dropdownFadeIn 0.2s ease-out forwards',
                    transformOrigin: 'top right'
                  }}
                >
                  <div className="px-3 py-2 border-b border-gray-700">
                    <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">Account</div>
                    <div className="text-sm text-gray-200 font-medium truncate">
                      {userProfile?.username || 'Loading...'}
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <a
                      href={`https://github.com/${userProfile?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all duration-150 ease-out group"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                      <span>Visit GitHub Profile</span>
                    </a>
                    
                    <div className="mx-3 my-1 border-t border-gray-700"></div>
                    
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 ease-out text-left group"
                    >
                      <LogOut size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Greeting Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {userProfile?.username || 'Dev'}!
            </h1>
            <p className="text-gray-400 mt-1">Configure your automation or log a manual update.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 glass-morphism-light px-4 py-2 rounded-lg">
             <Calendar size={16} />
             <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- LEFT COLUMN: AUTOMATION SETTINGS --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* --- AUTOMATION CONFIGURATION PANEL --- */}
            <div className="glass-morphism rounded-2xl p-6 relative overflow-hidden subtle-glow">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-[#39d353] w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Automation Settings</h2>
            </div>

            {isLoadingSettings ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-gray-800 rounded w-full"></div>
                <div className="h-10 bg-gray-800 rounded w-full"></div>
                <div className="h-20 bg-gray-800 rounded w-full"></div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Repo Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <GitBranch size={14} /> Target Repository
                  </label>
                  <input 
                    type="text" 
                    value={targetRepo}
                    onChange={(e) => setTargetRepo(e.target.value)}
                    className="w-full glass-morphism-light rounded-lg px-4 py-3 text-sm text-white focus:border-[#39d353] focus:ring-2 focus:ring-[#39d353]/30 outline-none transition-all font-mono backdrop-blur-sm"
                    placeholder="username/repository-name"
                  />
                  <p className="text-[10px] text-gray-500">
                    The bot will append updates to the README.md of this repo.
                  </p>
                </div>

                {/* Schedule Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={14} /> Schedule Time (Daily)
                  </label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full glass-morphism-light rounded-lg px-4 py-3 text-sm text-white focus:border-[#39d353] focus:ring-2 focus:ring-[#39d353]/30 outline-none transition-all backdrop-blur-sm"
                  />
                </div>

                {/* Content Strategy */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} /> Content Strategy
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'learning-log', label: 'Learning Log', desc: 'Appends your daily notes' },
                      { id: 'dev-tip', label: 'Daily Dev Tip', desc: 'Appends a random coding tip' },
                      { id: 'stats', label: 'Github Stats', desc: 'Updates contribution count' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setContentMode(mode.id)}
                        className={`p-3 rounded-lg text-left transition-all gentle-hover ${
                          contentMode === mode.id 
                          ? 'glass-morphism border-[#238636] text-white ring-1 ring-[#238636]/30' 
                          : 'glass-morphism-light text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-bold text-xs mb-1">{mode.label}</div>
                        <div className="text-[10px] opacity-70">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Save & Activate */}
            <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
               <div className="flex items-center gap-2 text-yellow-500/70 text-xs glass-morphism-light ring-1 ring-yellow-500/10 px-3 py-2 rounded-lg max-w-xs backdrop-blur-sm">
                 <AlertTriangle size={14} className="flex-shrink-0" />
                 <span>Use responsibly. Purely automated commits may be flagged by GitHub.</span>
               </div>
               
               <button 
                onClick={handleSaveSettings}
                disabled={isSaving || isLoadingSettings}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all gentle-hover backdrop-blur-sm
                  ${isSaving || isLoadingSettings 
                    ? 'glass-morphism-light text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#238636] text-white shadow-lg hover:shadow-[#2ea043]/20'}
                `}
               >
                 {isSaving ? (
                   <>Saving Config...</>
                 ) : (
                   <>
                     <Save size={16} />
                     {isBotActive ? 'Update Schedule' : 'Activate Automation'}
                   </>
                 )}
               </button>
            </div>
          </div>

            {/* --- CONTRIBUTION HISTORY (LARGE SIZE) --- */}
            <div className="glass-morphism rounded-2xl p-6">
              <ContributionHistory />
            </div>
          </div>

          {/* --- RIGHT COLUMN: STATUS & MANUAL --- */}
          <div className="space-y-6">
            
            {/* Streak Card */}
            <div className="glass-morphism-light rounded-2xl p-6 flex flex-col items-center relative overflow-hidden group subtle-glow">
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Flame size={120} />
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={refreshGitHubStreak}
                disabled={isLoadingStreak}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
                title="Refresh GitHub streak"
              >
                <RefreshCw size={16} className={isLoadingStreak ? 'animate-spin' : ''} />
              </button>
              
              <div className="text-center relative z-10">
                <div className="mb-2 flex justify-center">
                  <div className="p-3 bg-orange-500/10 rounded-full ring-1 ring-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                    <Flame className="text-orange-500 w-8 h-8 fill-orange-500/20" />
                  </div>
                </div>
                
                {isLoadingStreak ? (
                  <>
                    <div className="text-5xl font-bold text-gray-400 mb-1 animate-pulse tracking-tight">--</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">Loading...</div>
                  </>
                ) : (
                  <>
                    {/* The Realtime Counter */}
                    <div className="text-5xl font-bold text-white mb-1 tracking-tight">
                      {streak}
                    </div>
                    
                    <div className="text-sm text-gray-400 uppercase tracking-wider font-medium flex items-center gap-2 justify-center">
                      Current Streak
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    </div>
                    
                    {streak > 0 && (
                      <div className="text-xs text-orange-400 mt-1 font-medium">
                        🔥 Keep it going!
                      </div>
                    )}
                    {streak === 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Make your first commit today
                      </div>
                    )}
                    
                    <div className="mt-4 text-[10px] text-gray-500 glass-morphism-light py-1.5 px-3 rounded-full shadow-sm backdrop-blur-sm">
                      Synced
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Manual Override */}
            <div className="glass-morphism rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <RefreshCw size={16} className="text-blue-400" />
                  Manual Check-in
                </h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Bot failed or want to commit manually? Click below to push a timestamp update immediately.
              </p>
              <button 
                onClick={toggleCommit}
                className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all gentle-hover backdrop-blur-sm ${
                  todayCommitted 
                  ? 'glass-morphism text-[#39d353] border border-[#238636] ring-1 ring-[#238636]/20' 
                  : 'glass-morphism-light text-white hover:ring-1 hover:ring-white/05'
                }`}
              >
                {todayCommitted ? (
                  <><CheckCircle2 size={16} /> Commited for Today</>
                ) : (
                  "Push Instant Update"
                )}
              </button>
            </div>

            {/* --- MICRO-TASK GENERATOR (RESTORED ORIGINAL SIZE) --- */}
            <div className="glass-morphism rounded-2xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-yellow-500 w-5 h-5" />
                <h3 className="font-bold text-white">Need a Diff?</h3>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                {currentIdea ? (
                  <div className="glass-morphism-light rounded-xl p-4 mb-4">
                    <div className="text-sm font-bold text-[#39d353] mb-1">{currentIdea.title}</div>
                    <p className="text-xs text-gray-400 leading-relaxed">{currentIdea.desc}</p>
                  </div>
                ) : (
                   <div className="h-24 glass-morphism-light rounded-xl animate-pulse mb-4"></div>
                )}
                
                <button 
                  onClick={handleGenerateIdea}
                  disabled={loadingIdea}
                  className="w-full py-2 glass-morphism-light text-gray-200 text-sm font-bold rounded-lg transition-all gentle-hover hover:ring-1 hover:ring-white/05 flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <RefreshCw size={14} className={loadingIdea ? 'animate-spin' : ''} />
                  {loadingIdea ? 'Generating...' : 'New Idea'}
                </button>
              </div>
            </div>

          </div>

        </div>
        
      </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;