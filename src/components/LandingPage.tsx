import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Github, 
  Shield, 
  Clock, 
  Zap, 
  Activity,
  Terminal,
  GitCommit,
  Check,
  Star,
  Users,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check cookie consent and authentication status
  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === 'accepted') {
      setShowCookieConsent(false);
    } else {
      setShowCookieConsent(true);
    }

    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/user', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated || false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const sections = ['hero', 'demo', 'how-it-works', 'features'];
    const observers = sections.map(sectionId => {
      const element = document.getElementById(sectionId);
      if (!element) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionId);
          }
        },
        { 
          threshold: 0.2, 
          rootMargin: '-80px 0px -20% 0px' // Account for navbar height and improve detection
        }
      );
      
      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  // Enhanced smooth scroll to section with offset for fixed navbar
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      let offsetTop;
      
      // Special positioning for demo section to center it on screen
      if (sectionId === 'demo') {
        const viewportHeight = window.innerHeight;
        const elementHeight = element.offsetHeight;
        // Center the demo section with some padding from navbar
        offsetTop = element.offsetTop - (viewportHeight / 2) + (elementHeight / 2) - 40;
      } else {
        offsetTop = element.offsetTop - 80; // Standard offset for other sections
      }
      
      // Use smoother scroll with custom easing
      const start = window.pageYOffset;
      const distance = offsetTop - start;
      const duration = Math.min(Math.abs(distance) / 2, 800); // Dynamic duration, max 800ms
      let startTime: number | null = null;

      function smoothScroll(currentTime: number) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Cubic bezier easing for professional feel
        const easeInOutCubic = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, start + distance * easeInOutCubic);
        
        if (timeElapsed < duration) {
          requestAnimationFrame(smoothScroll);
        }
      }
      
      requestAnimationFrame(smoothScroll);
    }
  };



  // Handle referral tracking and authentication
  const handleSignUp = (source: string) => {
    // If user is already authenticated, navigate to dashboard
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    // Otherwise, proceed with OAuth
    const params = new URLSearchParams({
      utm_source: 'landing_page',
      utm_medium: 'web',
      utm_campaign: source,
      utm_content: 'github_oauth'
    });
    
    window.location.href = `http://localhost:3000/auth/github?${params.toString()}`;
  };

  // Handle cookie consent acceptance
  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieConsent(false);
  };

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
    <>
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <h1>DailyDiff - Ethical GitHub Streak Tracker for Developers</h1>
        <meta name="description" content="Build consistent coding habits with DailyDiff. Smart reminders, micro-tasks, and streak tracking without fake commits. Privacy-first GitHub integration." />
        <meta name="keywords" content="github streak, coding habits, developer productivity, commit tracker, programming consistency" />
      </div>

    <div className="min-h-screen bg-[#0d1117] text-gray-100 font-inter selection:bg-[#2ea043] selection:text-white overflow-x-hidden">
       {/* Background Ambience */}
       <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#2ea043]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0d1117]/80 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent border-transparent border-b'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#2ea043] to-[#238636] rounded-lg group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight">Daily<span className="text-[#39d353]">Diff</span></span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-400">
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className={`hover:text-white transition-colors duration-300 px-2 lg:px-3 py-2 ${
                activeSection === 'how-it-works' ? 'text-[#39d353] font-semibold' : ''
              }`}
            >
              How it works
            </button>
            <button 
              onClick={() => scrollToSection('demo')}
              className={`hover:text-white transition-colors duration-300 px-2 lg:px-3 py-2 ${
                activeSection === 'demo' ? 'text-[#39d353] font-semibold' : ''
              }`}
            >
              Demo
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className={`hover:text-white transition-colors duration-300 px-2 lg:px-3 py-2 ${
                activeSection === 'features' ? 'text-[#39d353] font-semibold' : ''
              }`}
            >
              Features
            </button>
          </div>

          {/* Mobile and Desktop CTA */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* CTA Button */}
            <button 
              onClick={() => handleSignUp('navbar_cta')}
              className="group bg-[#238636] hover:bg-[#2ea043] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 hover:shadow-[0_0_25px_rgba(46,160,67,0.5)] flex items-center gap-1.5 sm:gap-2 border border-white/10 hover:scale-105 transform hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
              aria-label={isAuthenticated ? "Go to your dashboard" : "Start your free GitHub streak tracking"}
            >
              <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:rotate-12" />
              <span className="hidden sm:inline">{isAuthenticated ? 'Dashboard' : 'Start Free'}</span>
              <span className="sm:hidden">{isAuthenticated ? 'Go' : 'Start'}</span>
            </button>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="fixed top-16 left-4 right-4 bg-[#161b22] border border-gray-700 rounded-xl p-4 z-50 md:hidden shadow-2xl">
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      scrollToSection('how-it-works');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    How it works
                  </button>
                  <button 
                    onClick={() => {
                      scrollToSection('demo');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Demo
                  </button>
                  <button 
                    onClick={() => {
                      scrollToSection('features');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Features
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-24 pb-16 sm:pt-32 sm:pb-32 lg:pt-48 lg:pb-48 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f2937]/50 border border-gray-700 text-xs sm:text-sm text-[#39d353] font-medium mb-6 sm:mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39d353] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39d353]"></span>
            </span>
            <span className="hidden sm:inline">Ethical Contribution Tracking</span>
            <span className="sm:hidden">Ethical Tracking</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 max-w-4xl leading-[1.1]">
            Keep your GitHub streak <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39d353] to-[#2ea043] text-glow">
              burning bright.
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-base sm:text-xl text-gray-400 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-4 sm:px-0">
            The intelligent companion for developers who want to build a consistent coding habit. 
            Smart reminders and micro-tasks. <span className="text-white font-medium">No bots. No fake commits.</span>
          </p>

          {/* Social Proof */}
          <div className="animate-fade-in-up delay-250 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-10 text-xs sm:text-sm text-gray-500 px-4" role="complementary" aria-label="Platform statistics">
            <div className="flex items-center gap-2 hover:text-[#39d353] transition-colors cursor-pointer group relative" tabIndex={0}>
              <Users className="w-4 h-4 text-[#39d353] group-hover:scale-110 transition-transform" />
              <span className="font-medium">1,200+ developers</span>
              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs bg-[#39d353] text-black px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-300 shadow-lg z-50">
                Active monthly users
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#39d353]"></div>
              </div>
            </div>
            <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center gap-2 hover:text-yellow-500 transition-colors cursor-pointer group relative" tabIndex={0}>
              <Star className="w-4 h-4 text-yellow-500 fill-current group-hover:scale-110 transition-transform" />
              <span className="font-medium">4.9/5 rating</span>
              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs bg-yellow-500 text-black px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-300 shadow-lg z-50">
                Average user rating
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-yellow-500"></div>
              </div>
            </div>
            <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer group relative" tabIndex={0}>
              <Sparkles className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium whitespace-nowrap">50M+ commits tracked</span>
              <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 text-xs bg-blue-400 text-black px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-300 shadow-lg z-50">
                Total commits analyzed
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-400"></div>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto">
            <button 
              onClick={() => handleSignUp('hero_primary_cta')}
              className="group w-full sm:w-auto bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0d1117]"
              aria-label={isAuthenticated ? "Go to your dashboard" : "Sign up with GitHub to start tracking your coding streak"}
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              <span className="whitespace-nowrap">{isAuthenticated ? 'Go to Dashboard' : 'Continue with GitHub'}</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </button>
            <button 
              onClick={() => scrollToSection('demo')}
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 hover:bg-[#161b22] hover:-translate-y-0.5 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="View live demo of DailyDiff dashboard"
            >
              View Demo
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-y-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Visual Demo Widget */}
          <div id="demo" className="animate-fade-in-up delay-300 mt-16 sm:mt-32 lg:mt-48 relative w-full max-w-4xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#2ea043] to-blue-500 rounded-2xl blur opacity-30 animate-pulse"></div>
            <div className="relative bg-[#0d1117]/90 backdrop-blur-xl border border-gray-700 rounded-2xl p-4 sm:p-8 shadow-2xl overflow-hidden hover:border-gray-600 transition-all duration-500">
              <div className="flex items-center justify-between mb-4 sm:mb-8 border-b border-gray-800 pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                   <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <div className="h-4 sm:h-6 w-px bg-gray-800 mx-1 sm:mx-2"></div>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-mono">dashboard/overview</span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-mono text-gray-500">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#39d353] animate-pulse"></div>
                  <span className="hidden sm:inline">Live </span>Preview
                </div>
              </div>
              
              <div className="grid lg:grid-cols-5 gap-4 sm:gap-8 items-start">
                {/* Left side - Status and Stats */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="space-y-4 text-left">
                    <div className="inline-block px-3 py-1 rounded-md bg-[#39d353]/10 text-[#39d353] text-xs font-bold uppercase tracking-wider animate-pulse">
                      Current Status
                    </div>
                    <h3 className="text-4xl font-bold text-white">12 Day Streak! 🔥</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      You're on fire! Push one more commit today to reach your personal best. 
                      Your consistency is improving week over week.
                    </p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="bg-[#161b22] p-4 rounded-lg border border-gray-800">
                        <div className="text-2xl font-bold text-[#39d353]">87%</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Weekly Goal</div>
                      </div>
                      <div className="bg-[#161b22] p-4 rounded-lg border border-gray-800">
                        <div className="text-2xl font-bold text-blue-400">4.2h</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Session</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 bg-[#161b22] p-3 rounded-lg border border-gray-800 w-fit">
                      <Clock className="w-4 h-4 text-[#39d353]" />
                      <span className="font-medium text-white">Next reminder:</span> 20:00 Local Time
                    </div>
                  </div>
                </div>

                {/* Right side - Activity Grid */}
                <div className="lg:col-span-2">
                  <div className="bg-[#161b22] p-6 rounded-xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-1">Activity Overview</h4>
                      <p className="text-xs text-gray-500">Last 5 weeks</p>
                    </div>
                    {renderHeroGrid()}
                    <div className="mt-4 flex justify-between text-[10px] text-gray-600 font-mono uppercase">
                      <span>Less</span>
                      <span>More</span>
                    </div>
                    
                    {/* Suggested Task */}
                    <div className="mt-4 p-3 bg-[#0d1117] rounded-lg border border-gray-800 hover:border-[#39d353]/50 transition-colors group cursor-pointer">
                      <div className="text-xs text-gray-500 mb-1 group-hover:text-[#39d353] transition-colors">💡 Suggested micro-task:</div>
                      <div className="text-xs text-gray-300 font-medium group-hover:text-white transition-colors">"Add TypeScript types to utils.js"</div>
                      <button className="mt-2 text-[10px] bg-[#39d353] text-black px-2 py-1 rounded font-bold hover:bg-[#2ea043] transition-colors opacity-0 group-hover:opacity-100">
                        Accept Task
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="how-it-works" className="pt-16 sm:pt-24 lg:pt-32 pb-16 sm:pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight px-4">
              Build the habit. <br />
              <span className="text-[#39d353]">Keep the green.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Card 1 */}
            <div className="group md:col-span-1 glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden cursor-pointer">
              {/* Hover Tooltip */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                <div className="bg-[#0d1117] border border-[#39d353]/50 rounded-xl px-4 py-3 text-sm text-gray-300 shadow-2xl backdrop-blur-md max-w-xs">
                  <div className="text-[#39d353] font-semibold mb-1">🔐 Enterprise-Grade Security</div>
                  <p className="text-xs leading-relaxed">
                    Zero access to your private repositories. We use GitHub's official OAuth flow and only read public contribution data. Your source code never leaves GitHub.
                  </p>
                </div>
                <div className="w-3 h-3 bg-[#0d1117] border-r border-b border-[#39d353]/50 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Github size={120} />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#2ea043]/20 flex items-center justify-center mb-6 text-[#39d353] group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#39d353] transition-colors duration-300">Secure Connect</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                One-click OAuth login. We only read public contribution timestamps. Your private code stays private.
              </p>
            </div>

            {/* Card 2 (Wide) */}
            <div className="group md:col-span-2 glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8 cursor-pointer">
              {/* Hover Tooltip */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                <div className="bg-[#0d1117] border border-blue-400/50 rounded-xl px-4 py-3 text-sm text-gray-300 shadow-2xl backdrop-blur-md max-w-sm">
                  <div className="text-blue-400 font-semibold mb-1">⏰ Smart Timing Algorithm</div>
                  <p className="text-xs leading-relaxed">
                    Our AI analyzes your past coding patterns, timezone, and schedule to find your optimal "Golden Hour" - the time you're most likely to be productive and creative.
                  </p>
                </div>
                <div className="w-3 h-3 bg-[#0d1117] border-r border-b border-blue-400/50 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors duration-300">Intelligent Scheduling</h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
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
            <div className="group md:col-span-2 glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden cursor-pointer">
               {/* Hover Tooltip */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                <div className="bg-[#0d1117] border border-purple-400/50 rounded-xl px-4 py-3 text-sm text-gray-300 shadow-2xl backdrop-blur-md max-w-sm">
                  <div className="text-purple-400 font-semibold mb-1">⚡ AI-Powered Suggestions</div>
                  <p className="text-xs leading-relaxed">
                    Our engine analyzes your codebase and suggests meaningful micro-tasks like refactoring, documentation, or code quality improvements - never empty commits.
                  </p>
                </div>
                <div className="w-3 h-3 bg-[#0d1117] border-r border-b border-purple-400/50 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
               <div className="absolute -right-10 -bottom-10 bg-[#39d353]/10 w-64 h-64 rounded-full blur-3xl group-hover:bg-[#39d353]/20 transition-colors"></div>
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors duration-300">The "Micro-Task" Engine</h3>
                <p className="text-gray-400 leading-relaxed max-w-lg group-hover:text-gray-300 transition-colors duration-300">
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
            <div className="group md:col-span-1 glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:bg-[#161b22] transition-all duration-500 relative overflow-hidden cursor-pointer">
              {/* Hover Tooltip */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
                <div className="bg-[#0d1117] border border-orange-400/50 rounded-xl px-4 py-3 text-sm text-gray-300 shadow-2xl backdrop-blur-md max-w-xs">
                  <div className="text-orange-400 font-semibold mb-1">📊 Deep Insights</div>
                  <p className="text-xs leading-relaxed">
                    Discover your coding patterns: peak productivity hours, favorite languages, commit frequency trends, and streak health metrics.
                  </p>
                </div>
                <div className="w-3 h-3 bg-[#0d1117] border-r border-b border-orange-400/50 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 text-orange-400 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-orange-400 transition-colors duration-300">Visual Analytics</h3>
              <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                Go beyond the green squares. See your most productive hours and languages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative z-10 bg-[#0d1117]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-white">
              Loved by developers <span className="text-[#39d353]">worldwide</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Join thousands of developers who've transformed their coding habits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <article className="glass-panel rounded-2xl p-6 hover:bg-[#161b22] transition-all duration-300 group hover:scale-105 hover:shadow-2xl cursor-pointer" tabIndex={0}>
              <div className="flex items-center gap-1 mb-4" role="img" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-300 mb-6 leading-relaxed italic">
                "DailyDiff helped me maintain a 365+ day streak. The gentle reminders and micro-tasks 
                made all the difference when motivation was low."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2ea043] to-[#238636] flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
                  SK
                </div>
                <div>
                  <cite className="font-semibold text-white not-italic">Sarah Kim</cite>
                  <div className="text-xs text-gray-500">Full Stack Developer at Meta</div>
                </div>
              </div>
            </article>

            {/* Testimonial 2 */}
            <article className="glass-panel rounded-2xl p-6 hover:bg-[#161b22] transition-all duration-300 group hover:scale-105 hover:shadow-2xl cursor-pointer" tabIndex={0}>
              <div className="flex items-center gap-1 mb-4" role="img" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-300 mb-6 leading-relaxed italic">
                "Finally, a streak tracker that doesn't encourage meaningless commits. 
                The task suggestions are genuinely helpful for code quality."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
                  MR
                </div>
                <div>
                  <cite className="font-semibold text-white not-italic">Marcus Rodriguez</cite>
                  <div className="text-xs text-gray-500">Senior Engineer at Stripe</div>
                </div>
              </div>
            </article>

            {/* Testimonial 3 */}
            <article className="glass-panel rounded-2xl p-6 hover:bg-[#161b22] transition-all duration-300 group hover:scale-105 hover:shadow-2xl cursor-pointer" tabIndex={0}>
              <div className="flex items-center gap-1 mb-4" role="img" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                ))}
              </div>
              <blockquote className="text-gray-300 mb-6 leading-relaxed italic">
                "The timezone-aware reminders are perfect. I never miss my 'golden hour' 
                for coding, and my productivity has improved significantly."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm" aria-hidden="true">
                  LC
                </div>
                <div>
                  <cite className="font-semibold text-white not-italic">Lisa Chen</cite>
                  <div className="text-xs text-gray-500">Frontend Lead at Vercel</div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Features Comparison Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight text-white">
              Why choose <span className="text-[#39d353]">DailyDiff</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Not all streak trackers are created equal
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* DailyDiff Column */}
            <div className="glass-panel rounded-2xl p-8 relative overflow-hidden border-2 border-[#39d353]/50">
              <div className="absolute top-4 right-4 bg-[#39d353] text-black px-3 py-1 rounded-full text-xs font-bold">
                RECOMMENDED
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">DailyDiff</h3>
                <p className="text-gray-400">Ethical & Intelligent</p>
              </div>
              
              <div className="space-y-4">
                {[
                  'Smart micro-task suggestions',
                  'Timezone-aware reminders',
                  'No fake commit encouragement',
                  'Privacy-first (OAuth only)',
                  'Visual analytics dashboard',
                  'Free forever'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#39d353] flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Native Column */}
            <div className="glass-panel rounded-2xl p-8 opacity-75">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">GitHub Native</h3>
                <p className="text-gray-400">Basic Tracking</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { text: 'Shows contribution graph', available: true },
                  { text: 'No smart suggestions', available: false },
                  { text: 'No reminders', available: false },
                  { text: 'No streak protection', available: false },
                  { text: 'Limited analytics', available: false },
                  { text: 'Free', available: true }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {feature.available ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 flex-shrink-0 rounded-full border-2 border-gray-600"></div>
                    )}
                    <span className={feature.available ? "text-gray-300" : "text-gray-500"}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other Apps Column */}
            <div className="glass-panel rounded-2xl p-8 opacity-75">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Other Apps</h3>
                <p className="text-gray-400">Quantity Over Quality</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { text: 'Encourages fake commits', available: false, warning: true },
                  { text: 'Generic reminders only', available: false },
                  { text: 'Privacy concerns', available: false, warning: true },
                  { text: 'Expensive subscriptions', available: false, warning: true },
                  { text: 'Limited customization', available: false },
                  { text: 'Not developer-focused', available: false }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 flex-shrink-0 rounded-full border-2 ${feature.warning ? 'border-red-500 bg-red-500/20' : 'border-gray-600'}`}>
                      {feature.warning && <span className="block w-full h-full text-red-500 text-center text-xs leading-[18px]">!</span>}
                    </div>
                    <span className={feature.warning ? "text-red-400" : "text-gray-500"}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass-panel rounded-2xl sm:rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2ea043]/20 to-blue-500/20 opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">
                Ready to build your <br />
                <span className="text-[#39d353]">coding habit?</span>
              </h2>
              <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                Join thousands of developers who've transformed their consistency with DailyDiff. 
                Start your streak today - it's completely free.
              </p>
              <button 
                onClick={() => handleSignUp('final_cta')}
                className="bg-white text-black px-6 sm:px-10 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2 sm:gap-3 mx-auto hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(255,255,255,0.2)] group focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0d1117] w-full sm:w-auto max-w-sm sm:max-w-none"
                aria-label={isAuthenticated ? "Go to your dashboard" : "Sign up with GitHub and start your coding streak today"}
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                <span className="whitespace-nowrap">{isAuthenticated ? 'Go to Your Dashboard' : 'Start Your Streak Today'}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                <span>✓ Free forever</span>
                <span className="hidden sm:inline">•</span>
                <span>✓ No credit card required</span>
                <span className="hidden sm:inline">•</span>
                <span>✓ Privacy-first</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1117] border-t border-gray-800 pt-12 sm:pt-16 pb-6 sm:pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 sm:mb-12">
            {/* Brand Column - Takes 2 columns on larger screens */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#2ea043] to-[#238636] rounded-lg">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
                </div>
                <span className="font-bold text-lg sm:text-xl tracking-tight text-white">Daily<span className="text-[#39d353]">Diff</span></span>
              </div>
              <p className="text-gray-500 max-w-sm mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Helping developers build lasting habits, one commit at a time. 
                Ethical streak tracking for the modern developer.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                   className="text-gray-600 hover:text-white transition-colors duration-300 hover:scale-110 transform"
                   aria-label="Visit our GitHub">
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-white transition-colors duration-300 hover:scale-110 transform"
                   aria-label="Follow us on Twitter">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div className="flex flex-col">
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <button 
                    onClick={() => scrollToSection('features')}
                    className="text-gray-500 hover:text-[#39d353] transition-colors duration-300 cursor-pointer text-left"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('how-it-works')}
                    className="text-gray-500 hover:text-[#39d353] transition-colors duration-300 cursor-pointer text-left"
                  >
                    How it Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('demo')}
                    className="text-gray-500 hover:text-[#39d353] transition-colors duration-300 cursor-pointer text-left"
                  >
                    Live Demo
                  </button>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="flex flex-col">
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Press Kit
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="flex flex-col">
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-500 hover:text-[#39d353] transition-colors duration-300">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-6 sm:pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
              <p className="text-gray-600 text-xs sm:text-sm order-2 lg:order-1">
                © 2025 DailyDiff. All rights reserved. Made with <span className="text-red-500">❤️</span> for developers.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 order-1 lg:order-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#39d353]"></div>
                  <span>Privacy-first</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>No fake commits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {scrolled && (
        <button
          onClick={() => scrollToSection('hero')}
          className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 bg-[#2ea043] hover:bg-[#238636] text-white p-2.5 sm:p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:ring-offset-2 focus:ring-offset-[#0d1117] z-50"
          aria-label="Back to top"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-gray-700 p-3 sm:p-4 z-50">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-300">
                <span className="font-semibold text-white">🍪 We respect your privacy.</span> DailyDiff only uses essential cookies for authentication via GitHub OAuth. No tracking, no ads, no data selling.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowCookieConsent(false)}
                className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors underline order-2 sm:order-1"
              >
                Learn more
              </button>
              <button
                onClick={handleAcceptCookies}
                className="bg-[#2ea043] hover:bg-[#238636] text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors order-1 sm:order-2 w-full sm:w-auto"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility: Skip to main content link */}
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#2ea043] text-white px-4 py-2 rounded-md font-medium z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
    </div>
    </>
  );
};

export default LandingPage;