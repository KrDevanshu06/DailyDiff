import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  Calendar, 
  LogOut, 
  User, 
  Zap, 
  RefreshCw, 
  Activity,
  Settings,
  GitBranch,
  Clock,
  Save,
  AlertTriangle
} from 'lucide-react';

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  // --- State ---
  const [streak, setStreak] = useState(12);
  const [todayCommitted, setTodayCommitted] = useState(false);
  
  // Automation Settings State
  const [targetRepo, setTargetRepo] = useState("krdevanshu06/daily-log");
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [contentMode, setContentMode] = useState("learning-log"); // 'learning-log' | 'dev-tip' | 'weather'
  const [isBotActive, setIsBotActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Micro-Task State
  const [currentIdea, setCurrentIdea] = useState<{title: string, desc: string} | null>(null);
  const [loadingIdea, setLoadingIdea] = useState(false);

  const ideas = [
    { title: "Readme Polish", desc: "Fix typos or improve formatting in a project's README.md" },
    { title: "Dependency Audit", desc: "Check for outdated packages and run a minor update" },
    { title: "Comment Cleanup", desc: "Remove commented-out code or add JSDoc to a function" },
    { title: "Variable Rename", desc: "Rename a vague variable (e.g., 'data') to something specific" },
  ];

  // --- Handlers ---
  const handleGenerateIdea = () => {
    setLoadingIdea(true);
    setTimeout(() => {
      const random = ideas[Math.floor(Math.random() * ideas.length)];
      setCurrentIdea(random);
      setLoadingIdea(false);
    }, 600);
  };

  const toggleCommit = () => {
    setStreak(s => todayCommitted ? s - 1 : s + 1);
    setTodayCommitted(!todayCommitted);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate Backend API Call
    setTimeout(() => {
      setIsBotActive(true);
      setIsSaving(false);
      // In a real app, this would POST to your backend to set up the Cron Job
    }, 1500);
  };

  useEffect(() => {
    if (!currentIdea) handleGenerateIdea();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans selection:bg-[#2ea043] selection:text-white animate-fade-in-up">
      {/* Dashboard Nav */}
      <nav className="bg-[#161b22]/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-gradient-to-br from-[#2ea043] to-[#238636] rounded-lg">
              <Flame className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Daily<span className="text-[#39d353]">Diff</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 border rounded-full text-xs transition-colors ${isBotActive ? 'bg-[#238636]/10 border-[#238636] text-[#39d353]' : 'bg-[#0d1117] border-gray-800 text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isBotActive ? 'bg-[#39d353] animate-pulse' : 'bg-gray-600'}`}></div>
              {isBotActive ? `Auto-Commit: ${scheduleTime}` : 'Automation Paused'}
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <div className="w-8 h-8 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center">
              <User size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Greeting Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Welcome back, Dev!</h1>
            <p className="text-gray-400 mt-1">Configure your automation or log a manual update.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-[#161b22] px-4 py-2 rounded-lg border border-gray-800">
             <Calendar size={16} />
             <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- AUTOMATION CONFIGURATION PANEL (New Feature) --- */}
          <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-[#39d353] w-5 h-5" />
              <h2 className="text-xl font-bold text-white">Automation Settings</h2>
            </div>

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
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353] outline-none transition-all font-mono"
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
                  className="w-full bg-[#0d1117] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353] outline-none transition-all"
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
                      className={`p-3 rounded-lg border text-left transition-all ${
                        contentMode === mode.id 
                        ? 'bg-[#238636]/10 border-[#238636] text-white' 
                        : 'bg-[#0d1117] border-gray-700 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-bold text-xs mb-1">{mode.label}</div>
                      <div className="text-[10px] opacity-70">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save & Activate */}
            <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
               <div className="flex items-center gap-2 text-yellow-500/80 text-xs bg-yellow-500/10 px-3 py-2 rounded-lg max-w-xs">
                 <AlertTriangle size={14} className="flex-shrink-0" />
                 <span>Use responsibly. Purely automated commits may be flagged by GitHub.</span>
               </div>
               
               <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all
                  ${isSaving 
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#238636] hover:bg-[#2ea043] text-white shadow-lg hover:shadow-[#2ea043]/20'}
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

          {/* --- RIGHT COLUMN: STATUS & MANUAL --- */}
          <div className="space-y-6">
            
            {/* Streak Card */}
            <div className="bg-[#0d1117] border border-gray-800 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Flame size={120} />
              </div>
              <div className="text-center relative z-10">
                <div className="mb-2 flex justify-center">
                  <div className="p-3 bg-orange-500/10 rounded-full">
                    <Flame className="text-orange-500 w-8 h-8" />
                  </div>
                </div>
                <div className="text-5xl font-bold text-white mb-1">{streak}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider font-medium">Day Streak</div>
              </div>
            </div>

            {/* Manual Override */}
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl p-6">
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
                className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  todayCommitted 
                  ? 'bg-[#238636]/20 text-[#39d353] border border-[#238636]' 
                  : 'bg-[#21262d] text-white hover:bg-[#30363d] border border-gray-700'
                }`}
              >
                {todayCommitted ? (
                  <><CheckCircle2 size={16} /> Commited for Today</>
                ) : (
                  "Push Instant Update"
                )}
              </button>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;