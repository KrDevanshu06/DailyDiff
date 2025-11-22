import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Activity,
  BookOpen,
  Lightbulb,
  BarChart3,
  Rocket,
  Award
} from 'lucide-react';

// --- MOVED OUTSIDE DASHBOARD (Prevents re-renders) ---
interface ContributionDay {
  date: string;
  count: number;
}

const ContributionHistory = () => {
  const [contributionData, setContributionData] = useState<ContributionDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const generateMockData = () => {
    const data: ContributionDay[] = [];
    const today = new Date();
    for (let i = 300; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const rand = Math.random();
      let count = 0;
      if (rand > 0.9) count = Math.floor(Math.random() * 8) + 4;
      else if (rand > 0.6) count = Math.floor(Math.random() * 3) + 1;
      data.push({ date: date.toISOString().split('T')[0], count });
    }
    return data;
  };

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/contributions', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
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
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoveredDay(day);
    setMousePosition({ x: rect.left + rect.width / 2, y: rect.top });
  };

  const renderMonths = () => {
    const monthsToRender = [];
    const today = new Date();
    for (let i = 8; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthsToRender.push(d);
    }
    const dataMap = new Map(contributionData.map(c => [c.date, c.count]));

    return (
      <div className="flex w-full justify-between">
        {monthsToRender.map((monthDate, monthIndex) => {
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
          const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
          const startDayOffset = monthDate.getDay(); 
          const slots = [];
          for (let k = 0; k < startDayOffset; k++) slots.push(null);
          for (let k = 1; k <= daysInMonth; k++) {
            const current = new Date(monthDate.getFullYear(), monthDate.getMonth(), k);
            const dateStr = current.toISOString().split('T')[0];
            slots.push({ date: dateStr, count: dataMap.get(dateStr) || 0 });
          }
          return (
            <div key={monthIndex} className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{monthName}</span>
              <div className="grid grid-rows-7 grid-flow-col gap-1" style={{ height: '84px' }}>
                {slots.map((slot, i) => {
                  if (!slot) return <div key={`e-${i}`} className="w-2.5 h-2.5" />;
                  return (
                    <div key={slot.date} onMouseEnter={(e) => handleMouseEnter(slot, e)} onMouseLeave={() => setHoveredDay(null)} className={`w-2.5 h-2.5 rounded-[2px] cursor-pointer transition-all duration-200 hover:scale-125 hover:z-10 ${getLevelColor(slot.count)}`} />
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="text-[#39d353] w-5 h-5" />
          <h3 className="text-xl font-bold text-white">Activity History</h3>
        </div>
        <div className="text-xs font-mono text-gray-500">Last 9 months</div>
      </div>
      <div className="w-full pb-2">
        {isLoading ? (
          <div className="flex justify-between animate-pulse opacity-50 w-full">
            {[...Array(9)].map((_, i) => <div key={i} className="h-20 w-12 bg-gray-800 rounded-lg"></div>)}
          </div>
        ) : renderMonths()}
      </div>
      {hoveredDay && createPortal(
        <div className="fixed z-[9999] bg-gray-900 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white shadow-2xl pointer-events-none whitespace-nowrap backdrop-blur-md select-none" style={{ left: mousePosition.x, top: mousePosition.y - 50, transform: 'translateX(-50%)', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' }}>
          <div className="font-semibold text-[#39d353] text-sm">{hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}</div>
          <div className="text-gray-300 text-xs mt-1">{new Date(hoveredDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>, document.body
      )}
      <div className="flex items-center justify-end gap-2 text-[10px] text-gray-500 mt-4">
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

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [streak, setStreak] = useState(0);
  const [todayCommitted, setTodayCommitted] = useState(false);
  const [isLoadingStreak, setIsLoadingStreak] = useState(true);
  
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatarUrl: string;
    streak?: number;
  } | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  
  const [targetRepo, setTargetRepo] = useState("");
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [contentMode, setContentMode] = useState("learning-log"); 
  const [availableStrategies, setAvailableStrategies] = useState<Array<{
    id: string;
    label: string;
    description: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
  }>>([]);
  const [isBotActive, setIsBotActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const [currentIdea, setCurrentIdea] = useState<{title: string, desc: string} | null>(null);
  const [loadingIdea, setLoadingIdea] = useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    handleGenerateIdea();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const menu = document.getElementById('user-profile-menu');
      const trigger = target.closest('[data-profile-menu]');
      
      if (isProfileMenuOpen && !trigger && menu && !menu.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

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

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/schedule', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.schedule) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const iconMap: { [key: string]: any } = {
      BookOpen,
      Lightbulb,
      BarChart3,
      Rocket,
      Award
    };

    const fetchContentStrategies = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/content-strategies');
        if (response.ok) {
          const data = await response.json();
          // Map icon names to actual icon components
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const strategiesWithIcons = (data.strategies || []).map((strategy: any) => ({
            ...strategy,
            icon: iconMap[strategy.icon] || BookOpen
          }));
          setAvailableStrategies(strategiesWithIcons);
        }
      } catch (error) {
        console.error("Failed to fetch content strategies:", error);
        // Fallback strategies
        setAvailableStrategies([
          { id: 'learning-log', label: 'Learning Log', description: 'Daily learning entries', icon: BookOpen },
          { id: 'dev-tip', label: 'Daily Dev Tip', description: 'Practical coding tips', icon: Lightbulb },
          { id: 'stats', label: 'GitHub Stats', description: 'Activity updates', icon: BarChart3 },
          { id: 'project-progress', label: 'Project Progress', description: 'Development updates', icon: Rocket },
          { id: 'code-quality', label: 'Code Quality', description: 'Quality improvements', icon: Award }
        ]);
      }
    };

    fetchSettings();
    fetchContentStrategies();
  }, []);

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

  const toggleCommit = async () => {
    if (todayCommitted) return; 

    if (!targetRepo || !targetRepo.trim()) {
      alert("⚠️ Please set a target repository in Automation Settings first!");
      return;
    }

    if (!targetRepo.includes('/') || targetRepo.split('/').length !== 2) {
      alert("⚠️ Repository name must be in format: username/repository-name");
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/commit-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: targetRepo.trim(), 
          message: "", // Empty message to use content strategy
          contentStrategy: contentMode
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        setTodayCommitted(true);
        alert("✅ Commit pushed successfully!");
        await refreshGitHubStreak();
      } else {
        const err = await response.json();
        alert("❌ Failed to push to GitHub: " + (err.message || err.error || "Unknown error"));
      }
    } catch (e) {
      console.error("Commit failed", e);
      alert("❌ Connection error. Please check if the backend is running.");
    }
  };

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
        credentials: 'include'
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

  return (
    <>
      <style>
        {`
          @keyframes dropdownFadeIn {
            0% { opacity: 0; transform: translateY(-12px) scale(0.92); filter: blur(4px); }
            60% { opacity: 0.8; transform: translateY(-2px) scale(0.98); filter: blur(1px); }
            100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
          @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
          @keyframes glowPulse { 0%, 100% { box-shadow: 0 0 20px rgba(46, 160, 67, 0.1), 0 0 40px rgba(46, 160, 67, 0.05), inset 0 0 20px rgba(255, 255, 255, 0.02); } 50% { box-shadow: 0 0 30px rgba(46, 160, 67, 0.15), 0 0 60px rgba(46, 160, 67, 0.08), inset 0 0 25px rgba(255, 255, 255, 0.03); } }
          .glass-morphism { background: rgba(22, 27, 34, 0.8); backdrop-filter: blur(16px) saturate(1.8); -webkit-backdrop-filter: blur(16px) saturate(1.8); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 1px rgba(255, 255, 255, 0.1) inset, 0 -1px 1px rgba(0, 0, 0, 0.1) inset; }
          .glass-morphism-light { background: rgba(13, 17, 23, 0.6); backdrop-filter: blur(12px) saturate(1.5); -webkit-backdrop-filter: blur(12px) saturate(1.5); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(255, 255, 255, 0.08) inset; }
          .animated-gradient { background: linear-gradient(-45deg, rgba(46, 160, 67, 0.008), rgba(35, 134, 54, 0.012), rgba(57, 211, 83, 0.006), rgba(46, 160, 67, 0.01)); background-size: 600% 600%; animation: gradientShift 20s ease infinite; }
          .subtle-glow { box-shadow: 0 0 20px rgba(46, 160, 67, 0.03); transition: box-shadow 0.3s ease; }
          .subtle-glow:hover { box-shadow: 0 0 25px rgba(46, 160, 67, 0.05); }
          .gentle-hover { transition: all 0.2s ease; }
          .gentle-hover:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(255, 255, 255, 0.05) inset; }
          body { background: radial-gradient(ellipse at top left, rgba(46, 160, 67, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(35, 134, 54, 0.08) 0%, transparent 50%), #0d1117; }
        `}
      </style>
      {/* FIX 1: Removed 'animate-fade-in-up' from here to prevent fixed element issues */}
      <div className="min-h-screen text-gray-100 font-sans selection:bg-[#2ea043] selection:text-white relative overflow-hidden select-none">
        <div className="fixed inset-0 pointer-events-none z-0" style={{ background: `radial-gradient(ellipse at top left, rgba(46, 160, 67, 0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(35, 134, 54, 0.03) 0%, transparent 50%)`, opacity: 0.3 }} />
        <div className="fixed inset-0 animated-gradient pointer-events-none z-0" />
        
        <div className="relative z-10">
          {/* FIX 2: Changed to 'fixed top-0 w-full' to persist on scroll */}
          <nav className="glass-morphism border-b border-white/10 z-50 backdrop-blur-xl bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80 shadow-2xl fixed top-0 w-full">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between relative">
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2ea043] to-[#39d353] rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative p-1.5 sm:p-2 bg-gradient-to-br from-[#2ea043] to-[#238636] rounded-xl shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300 group-hover:scale-105">
                    <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="relative">
                  <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-sm select-none">
                    Daily<span className="bg-gradient-to-r from-[#39d353] to-[#2ea043] bg-clip-text text-transparent">Diff</span>
                  </span>
                  <div className="absolute -bottom-1 left-0 h-0.5 w-0 bg-gradient-to-r from-[#2ea043] to-[#39d353] group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-6">
                {isLoadingSettings ? (
                   <div className="h-6 sm:h-7 w-20 sm:w-28 bg-gray-800/50 rounded-full animate-pulse hidden lg:block backdrop-blur-sm"></div>
                ) : (
                  <div className={`hidden lg:flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all duration-300 backdrop-blur-md shadow-lg ring-1 ${isBotActive ? 'bg-gradient-to-r from-[#238636]/20 to-[#2ea043]/20 ring-[#238636]/30 text-[#39d353] shadow-[#238636]/20' : 'bg-gray-800/40 ring-gray-700/50 text-gray-400 shadow-black/20'}`}>
                    <div className="relative flex items-center">
                      <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isBotActive ? 'bg-[#39d353]' : 'bg-gray-600'} transition-colors`}></div>
                      {isBotActive && <div className="absolute inset-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#39d353] rounded-full animate-ping opacity-40"></div>}
                    </div>
                    <span className="font-semibold tracking-wide whitespace-nowrap">{isBotActive ? `Auto-Commit: ${scheduleTime}` : 'Automation Paused'}</span>
                  </div>
                )}
                <div className="relative" data-profile-menu>
                  <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="group flex items-center gap-2 sm:gap-3 text-sm text-gray-300 hover:text-white transition-all duration-300 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/5 backdrop-blur-sm ring-1 ring-transparent hover:ring-white/10 shadow-lg hover:shadow-xl">
                    <div className="relative">
                      {userProfile?.avatarUrl && !avatarError ? (
                        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-gray-600 group-hover:border-[#39d353]/60 overflow-hidden bg-gray-800 flex-shrink-0 transition-all duration-300 shadow-lg group-hover:shadow-[#39d353]/20">
                          <img src={userProfile.avatarUrl} alt={`${userProfile.username}'s avatar`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={() => setAvatarError(true)} />
                        </div>
                      ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border-2 border-gray-600 group-hover:border-[#39d353]/60 flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-lg">
                          <User size={18} className="text-gray-400 group-hover:text-[#39d353] transition-colors" />
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#39d353] border-2 border-gray-900 rounded-full shadow-sm"></div>
                    </div>
                    <ChevronDown size={16} className={`transition-all duration-300 text-gray-500 group-hover:text-white ${isProfileMenuOpen ? 'rotate-180 text-[#39d353]' : ''}`} />
                  </button>

                  {isProfileMenuOpen && createPortal(
                    <div 
                      id="user-profile-menu"
                      className="fixed right-4 top-20 w-56 glass-morphism rounded-xl shadow-2xl py-2 z-[9999] ring-1 ring-white/10 overflow-hidden select-none"
                      style={{ animation: 'dropdownFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards', transformOrigin: 'top right', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="px-3 py-2 border-b border-white/15 bg-white/3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            {userProfile?.avatarUrl && !avatarError ? (
                              <div className="w-8 h-8 rounded-full border border-[#39d353]/30 overflow-hidden bg-gray-800 shadow-md">
                                <img src={userProfile.avatarUrl} alt={`${userProfile.username}'s avatar`} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full border border-[#39d353]/30 flex items-center justify-center shadow-md">
                                <User size={16} className="text-[#39d353]" />
                              </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#39d353] border border-gray-900 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-400 font-medium">Account</div>
                            <div className="text-sm text-white font-semibold truncate">{userProfile?.username || 'Loading...'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="py-1 px-2">
                        <a href={`https://github.com/${userProfile?.username}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:text-blue-300 transition-all duration-150 group rounded-xl hover:bg-blue-500/10" onClick={() => setIsProfileMenuOpen(false)}>
                          <div className="p-1.5 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                            <ExternalLink size={14} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                          </div>
                          <span className="font-medium">GitHub Profile</span>
                        </a>
                        <div className="mx-1 my-1 border-t border-white/15"></div>
                        <button onClick={() => { setIsProfileMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-200 hover:text-red-300 transition-all duration-150 text-left group rounded-xl hover:bg-red-500/10">
                          <div className="p-1.5 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                            <LogOut size={14} className="text-red-400 group-hover:text-red-300 transition-colors" />
                          </div>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* FIX 3: Moved 'animate-fade-in-up' here and added 'pt-20' to prevent hiding behind fixed nav */}
          <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 animate-fade-in-up pt-18 sm:pt-20">
            <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {userProfile?.username || 'Dev'}!</h1>
                <p className="text-gray-400 mt-1 text-sm sm:text-base">Configure your automation or log a manual update.</p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 glass-morphism-light px-3 sm:px-4 py-2 rounded-lg">
                 <Calendar size={14} className="sm:w-4 sm:h-4" />
                 <span className="whitespace-nowrap">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="glass-morphism rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden subtle-glow">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <Settings className="text-[#39d353] w-4 h-4 sm:w-5 sm:h-5" />
                    <h2 className="text-lg sm:text-xl font-bold text-white">Automation Settings</h2>
                  </div>

                  {isLoadingSettings ? (
                    <div className="space-y-3 sm:space-y-4 animate-pulse">
                      <div className="h-8 sm:h-10 bg-gray-800 rounded w-full"></div>
                      <div className="h-8 sm:h-10 bg-gray-800 rounded w-full"></div>
                      <div className="h-16 sm:h-20 bg-gray-800 rounded w-full"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-2">
                          <GitBranch size={12} className="sm:w-3.5 sm:h-3.5" /> Target Repository
                        </label>
                        <input 
                          type="text" 
                          value={targetRepo} 
                          onChange={(e) => setTargetRepo(e.target.value)} 
                          className="w-full glass-morphism-light rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-[#39d353] focus:ring-2 focus:ring-[#39d353]/30 outline-none transition-all font-mono backdrop-blur-sm select-text" 
                          placeholder="username/repository-name" 
                        />
                        <p className="text-[9px] sm:text-[10px] text-gray-500">The bot will append updates to the README.md of this repo.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-2">
                          <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> Schedule Time (Daily)
                        </label>
                        <input 
                          type="time" 
                          value={scheduleTime} 
                          onChange={(e) => setScheduleTime(e.target.value)} 
                          className="w-full glass-morphism-light rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-[#39d353] focus:ring-2 focus:ring-[#39d353]/30 outline-none transition-all backdrop-blur-sm select-text" 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-2">
                          <Zap size={12} className="sm:w-3.5 sm:h-3.5" /> Content Strategy
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                          {availableStrategies.map((strategy) => (
                            <button 
                              key={strategy.id} 
                              onClick={() => setContentMode(strategy.id)} 
                              className={`p-2.5 sm:p-3 rounded-lg text-left transition-all gentle-hover ${
                                contentMode === strategy.id 
                                  ? 'glass-morphism border-[#238636] text-white ring-1 ring-[#238636]/30' 
                                  : 'glass-morphism-light text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              <div className="font-bold text-[10px] sm:text-xs mb-1 flex items-center gap-1.5">
                                <strategy.icon size={14} className="text-current" />
                                <span>{strategy.label}</span>
                              </div>
                              <div className="text-[9px] sm:text-[10px] opacity-70">{strategy.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                     <div className="flex items-center gap-2 text-yellow-500/70 text-[10px] sm:text-xs glass-morphism-light ring-1 ring-yellow-500/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg max-w-xs backdrop-blur-sm">
                       <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                       <span className="leading-tight">Use responsibly. Purely automated commits may be flagged by GitHub.</span>
                     </div>
                     <button 
                       onClick={handleSaveSettings} 
                       disabled={isSaving || isLoadingSettings} 
                       className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all gentle-hover backdrop-blur-sm w-full sm:w-auto ${
                         isSaving || isLoadingSettings 
                           ? 'glass-morphism-light text-gray-400 cursor-not-allowed' 
                           : 'bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#238636] text-white shadow-lg hover:shadow-[#2ea043]/20'
                       }`}
                     >
                       {isSaving ? (
                         <>Saving Config...</>
                       ) : (
                         <>
                           <Save size={14} className="sm:w-4 sm:h-4" />
                           {isBotActive ? 'Update Schedule' : 'Activate Automation'}
                         </>
                       )}
                     </button>
                  </div>
                </div>
                <div className="glass-morphism rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <ContributionHistory />
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="glass-morphism-light rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden group subtle-glow">
                  <div className={`absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5"><Flame size={80} className="sm:w-[120px] sm:h-[120px]" /></div>
                  <button 
                    onClick={refreshGitHubStreak} 
                    disabled={isLoadingStreak} 
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50" 
                    title="Refresh GitHub streak"
                  >
                    <RefreshCw size={14} className={`sm:w-4 sm:h-4 ${isLoadingStreak ? 'animate-spin' : ''}`} />
                  </button>
                  <div className="text-center relative z-10">
                    <div className="mb-2 sm:mb-3 flex justify-center">
                      <div className="p-2.5 sm:p-3 bg-orange-500/10 rounded-full ring-1 ring-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                        <Flame className="text-orange-500 w-6 h-6 sm:w-8 sm:h-8 fill-orange-500/20" />
                      </div>
                    </div>
                    {isLoadingStreak ? (
                      <>
                        <div className="text-4xl sm:text-5xl font-bold text-gray-400 mb-1 animate-pulse tracking-tight">--</div>
                        <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider font-medium">Loading...</div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl sm:text-5xl font-bold text-white mb-1 tracking-tight">{streak}</div>
                        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider font-medium flex items-center gap-1.5 sm:gap-2 justify-center">
                          Current Streak
                          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500"></span>
                          </span>
                        </div>
                        {streak > 0 && <div className="text-[10px] sm:text-xs text-orange-400 mt-1 font-medium">🔥 Keep it going!</div>}
                        {streak === 0 && <div className="text-[10px] sm:text-xs text-gray-500 mt-1">Make your first commit today</div>}
                        <div className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-gray-500 glass-morphism-light py-1 sm:py-1.5 px-2 sm:px-3 rounded-full shadow-sm backdrop-blur-sm">Synced</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="glass-morphism rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-bold text-white flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                      <RefreshCw size={14} className="sm:w-4 sm:h-4 text-blue-400" /> 
                      Manual Check-in
                    </h3>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-3 sm:mb-4 leading-relaxed">
                    Bot failed or want to commit manually? Click below to push a timestamp update immediately.
                  </p>
                  <button 
                    onClick={toggleCommit} 
                    className={`w-full py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all gentle-hover backdrop-blur-sm ${
                      todayCommitted 
                        ? 'glass-morphism text-[#39d353] border border-[#238636] ring-1 ring-[#238636]/20' 
                        : 'glass-morphism-light text-white hover:ring-1 hover:ring-white/05'
                    }`}
                  >
                    {todayCommitted ? (
                      <>
                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4" /> 
                        Commited for Today
                      </>
                    ) : (
                      "Push Instant Update"
                    )}
                  </button>
                </div>

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
                    <button onClick={handleGenerateIdea} disabled={loadingIdea} className="w-full py-2 glass-morphism-light text-gray-200 text-sm font-bold rounded-lg transition-all gentle-hover hover:ring-1 hover:ring-white/05 flex items-center justify-center gap-2 backdrop-blur-sm">
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