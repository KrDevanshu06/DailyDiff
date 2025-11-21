import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { Flame, GitBranch, CheckCircle2 } from 'lucide-react';

type ViewState = 'landing' | 'dashboard';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState('');
  
  // Ref to track if we've already handled the OAuth redirect this session
  const hasProcessedLogin = useRef(false);

  useEffect(() => {
    const verifySession = async () => {
      try {
        // Ask backend: "Do I have a valid cookie?"
        const response = await fetch('http://localhost:3000/api/user', {
          credentials: 'include' 
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Session Check:", data);
          
          if (data.authenticated) {
            setView('dashboard');
          } else {
            // Only reset to landing if we aren't already there
            setView((prev) => prev === 'dashboard' ? 'landing' : 'landing');
          }
        }
      } catch (error) {
        console.error("Network error verifying session:", error);
        setView('landing');
      } finally {
        setIsLoading(false);
      }
    };

    const initAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const loginParam = params.get('login');

      // SCENARIO 1: Just came back from GitHub (URL has ?login=success)
      if (loginParam === 'success') {
        if (hasProcessedLogin.current) return; // Prevent double-fire
        hasProcessedLogin.current = true;

        console.log("🎉 OAuth redirect detected. Starting professional auth flow...");
        
        // Start professional authentication sequence
        setIsAuthenticating(true);
        setIsLoading(true);
        
        // Step 1: Verifying credentials
        setAuthStep('Verifying credentials...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Step 2: Setting up workspace
        setAuthStep('Setting up workspace...');
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Step 3: Syncing with GitHub
        setAuthStep('Syncing with GitHub...');
        await verifySession();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Step 4: Finalizing setup
        setAuthStep('Finalizing setup...');
        await new Promise(resolve => setTimeout(resolve, 400));

        // 2. Clean URL so a refresh doesn't re-trigger this
        window.history.replaceState({}, '', '/');
        
        // 3. Complete authentication and show dashboard
        setView('dashboard');
        setIsAuthenticating(false);
        setIsLoading(false);
        return;
      }

      // SCENARIO 2: Normal page load (No URL params)
      await verifySession();
    };

    initAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/logout', { 
        method: 'POST',
        credentials: 'include' // This ensures cookies are sent to be cleared
      });
      setView('landing');
    } catch (error) {
      console.error("Logout failed", error);
      setView('landing'); // Still redirect to landing even if logout request fails
    }
  };

  if (isLoading) {
    return (
      <>
        <style>
          {`
            @keyframes fadeInScale {
              0% {
                opacity: 0;
                transform: scale(0.9) translateY(10px);
              }
              100% {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }
            
            @keyframes breathe {
              0%, 100% {
                transform: scale(1);
                opacity: 0.8;
              }
              50% {
                transform: scale(1.1);
                opacity: 1;
              }
            }
            
            @keyframes progressBar {
              0% { width: 0%; }
              25% { width: 25%; }
              50% { width: 50%; }
              75% { width: 75%; }
              100% { width: 100%; }
            }

            .loading-container {
              background: 
                radial-gradient(ellipse at top left, rgba(46, 160, 67, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(35, 134, 54, 0.08) 0%, transparent 50%),
                #0d1117;
            }
          `}
        </style>
        <div className="loading-container min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
          {/* Background ambient elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-2 h-2 bg-[#39d353] rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-[#2ea043] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-[#238636] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 right-20 w-1 h-1 bg-[#39d353] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>

          {/* Main loading content */}
          <div className="relative z-10 flex flex-col items-center" style={{ animation: 'fadeInScale 0.6s ease-out' }}>
            {/* Logo and brand */}
            <div className="mb-8 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#2ea043] to-[#238636] rounded-xl" style={{ animation: 'breathe 2s ease-in-out infinite' }}>
                <Flame className="w-8 h-8 text-white fill-white" />
              </div>
              <div className="text-2xl font-bold tracking-tight">
                Daily<span className="text-[#39d353]">Diff</span>
              </div>
            </div>

            {/* Loading spinner */}
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-[#39d353] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 w-12 h-12 border-2 border-[#2ea043] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>

            {/* Status text */}
            {isAuthenticating ? (
              <div className="text-center mb-6">
                <p className="text-lg font-medium text-white mb-2">Welcome back!</p>
                <p className="text-sm text-gray-400 animate-pulse">{authStep}</p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <p className="text-lg font-medium text-white mb-2">Loading DailyDiff</p>
                <p className="text-sm text-gray-400 animate-pulse">Preparing your workspace...</p>
              </div>
            )}

            {/* Progress bar */}
            {isAuthenticating && (
              <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#2ea043] to-[#39d353] rounded-full"
                  style={{ 
                    animation: 'progressBar 2.5s ease-in-out forwards',
                    boxShadow: '0 0 10px rgba(46, 160, 67, 0.5)'
                  }}
                ></div>
              </div>
            )}

            {/* Features preview */}
            <div className="mt-12 grid grid-cols-3 gap-8 opacity-60">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#39d353]/20 to-[#2ea043]/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <GitBranch className="w-5 h-5 text-[#39d353]" />
                </div>
                <p className="text-xs text-gray-500">Auto Commits</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#39d353]/20 to-[#2ea043]/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <Flame className="w-5 h-5 text-[#39d353]" />
                </div>
                <p className="text-xs text-gray-500">Streak Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-[#39d353]/20 to-[#2ea043]/20 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <CheckCircle2 className="w-5 h-5 text-[#39d353]" />
                </div>
                <p className="text-xs text-gray-500">Smart Automation</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes appFadeIn {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div style={{ animation: 'appFadeIn 0.5s ease-out' }}>
        {view === 'landing' ? (
          <LandingPage />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )}
      </div>
    </>
  );
}

export default App;