import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Github, 
  Shield, 
  Clock, 
  Zap, 
  Activity,
  ArrowRight, 
  Terminal,
  GitCommit
} from 'lucide-react';

const LandingPage = ({ onLogin }: { onLogin: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const renderHeroGrid = () => {
    return (
      <div className="flex flex-wrap gap-1.5 justify-center opacity-80">
        {[...Array(35)].map((_, i) => {
          const intensity = [0, 1, 2, 3, 4][Math.floor(Math.random() * 5)];
          const colors = ['bg-[#161b22]', 'bg-[#0e4429]', 'bg-[#006d32]', 'bg-[#26a641]', 'bg-[#39d353]'];
          return (
            <div 
              key={i}
              onMouseEnter={() => setHoveredDay(i)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`
                w-4 h-4 sm:w-6 sm:h-6 rounded-sm transition-all duration-300 cursor-pointer
                ${colors[intensity]}
                ${hoveredDay === i ? 'scale-125 shadow-[0_0_10px_rgba(57,211,83,0.5)] z-10' : 'scale-100'}
              `}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-sans selection:bg-[#2ea043] selection:text-white overflow-x-hidden">
       {/* Background Ambience */}
       <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#2ea043]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0d1117]/80 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent border-transparent border-b'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 bg-gradient-to-br from-[#2ea043] to-[#238636] rounded-lg group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Daily<span className="text-[#39d353]">Diff</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button 
              onClick={onLogin}
              className="bg-[#238636] hover:bg-[#2ea043] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(46,160,67,0.4)] flex items-center gap-2 border border-white/10"
            >
              <Github className="w-4 h-4" />
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f2937]/50 border border-gray-700 text-sm text-[#39d353] font-medium mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39d353] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39d353]"></span>
            </span>
            Ethical Contribution Tracking
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1]">
            Keep your GitHub streak <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39d353] to-[#2ea043] text-glow">
              burning bright.
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            The intelligent companion for developers who want to build a consistent coding habit. 
            Smart reminders and micro-tasks. <span className="text-white font-medium">No bots. No fake commits.</span>
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white transition-all flex items-center justify-center gap-2 hover:bg-[#161b22]">
              View Demo
            </button>
          </div>

          {/* Visual Demo Widget */}
          <div className="animate-fade-in-up delay-300 mt-20 relative w-full max-w-3xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#2ea043] to-blue-500 rounded-2xl blur opacity-20"></div>
            <div className="relative bg-[#0d1117] border border-gray-800 rounded-2xl p-8 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                   <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <div className="h-6 w-px bg-gray-800 mx-2"></div>
                  <span className="text-xs text-gray-500 font-mono">dashboard/overview</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-[#39d353] animate-pulse"></div>
                  Live Preview
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-left">
                  <div className="inline-block px-3 py-1 rounded-md bg-[#39d353]/10 text-[#39d353] text-xs font-bold uppercase tracking-wider">
                    Current Status
                  </div>
                  <h3 className="text-3xl font-bold text-white">12 Day Streak!</h3>
                  <p className="text-gray-400 text-sm">
                    You're on fire! Push one more commit today to reach your personal best.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 bg-[#161b22] p-2 rounded border border-gray-800 w-fit">
                    <Clock className="w-3 h-3" />
                    Next reminder: 20:00 Local Time
                  </div>
                </div>
                <div className="bg-[#161b22] p-4 rounded-xl border border-gray-800/50">
                  {renderHeroGrid()}
                  <div className="mt-4 flex justify-between text-[10px] text-gray-600 font-mono uppercase">
                    <span>Less</span>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="how-it-works" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 tracking-tight">Build the habit. <br /><span className="text-[#39d353]">Keep the green.</span></h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group md:col-span-1 glass-panel rounded-3xl p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Github size={120} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#2ea043]/20 flex items-center justify-center mb-6 text-[#39d353]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Secure Connect</h3>
              <p className="text-gray-400 leading-relaxed">
                One-click OAuth login. We only read public contribution timestamps. Your private code stays private.
              </p>
            </div>

            {/* Card 2 (Wide) */}
            <div className="group md:col-span-2 glass-panel rounded-3xl p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Intelligent Scheduling</h3>
                <p className="text-gray-400 leading-relaxed">
                  Set your "Golden Hour". We'll nudge you exactly when you're most likely to code, respecting your timezone and weekends.
                </p>
              </div>
              <div className="flex-1 w-full bg-[#0d1117] rounded-xl border border-gray-800 p-4 shadow-lg transform group-hover:scale-[1.02] transition-transform duration-500">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center">
                    <Terminal size={14} className="text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-300">Notification</div>
                    <div className="text-[10px] text-gray-500">Now</div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  🔥 <span className="font-bold text-white">Streak Risk!</span> You haven't committed yet.
                </div>
              </div>
            </div>

            {/* Card 3 (Wide) */}
            <div className="group md:col-span-2 glass-panel rounded-3xl p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 bg-[#39d353]/10 w-64 h-64 rounded-full blur-3xl group-hover:bg-[#39d353]/20 transition-colors"></div>
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">The "Micro-Task" Engine</h3>
                <p className="text-gray-400 leading-relaxed max-w-lg">
                  Writer's block for code? We generate legitimate, small tasks to keep you moving.
                </p>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Refactor variable names', 'Update README.md', 'Add JSDoc comments', 'Fix indentation'].map((task, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-[#010409] p-2 rounded border border-gray-800">
                      <GitCommit size={12} className="text-gray-600" />
                      {task}
                    </div>
                  ))}
                </div>
               </div>
            </div>

            {/* Card 4 */}
            <div className="group md:col-span-1 glass-panel rounded-3xl p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 text-orange-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Visual Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Go beyond the green squares. See your most productive hours and languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1117] border-t border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-6 h-6 text-[#39d353]" />
                <span className="font-bold text-xl tracking-tight text-white">Daily<span className="text-[#39d353]">Diff</span></span>
              </div>
              <p className="text-gray-500 max-w-xs">
                Helping developers build lasting habits, one commit at a time.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#39d353] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#39d353] transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-[#39d353] transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#39d353] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#39d353] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">© 2025 DailyDiff. All rights reserved.</p>
            <div className="flex gap-6">
              <Github className="w-5 h-5 text-gray-600 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;