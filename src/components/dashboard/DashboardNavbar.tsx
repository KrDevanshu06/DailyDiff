import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Github, ChevronDown, ExternalLink } from 'lucide-react';

interface User {
  id: string;
  github_username: string;
  avatar_url?: string;
  name?: string;
  email?: string;
}

interface DashboardNavbarProps {
  user: User | null;
  onSignOut: () => void;
}

const DashboardNavbar = ({ user, onSignOut }: DashboardNavbarProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    onSignOut();
  };

  // Enhanced click outside behavior
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <nav
      className="bg-[#0d1117]/80 border-b border-[#21262d] z-50 backdrop-blur-md backdrop-saturate-150 backdrop-brightness-110 fixed top-0 w-full shadow-lg"
      style={{
        background: 'rgba(13,17,23,0.80)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        backdropFilter: 'blur(16px) saturate(180%)',
        boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)'
      }}
    >
      {/* FIX: Matched max-width to 7xl for alignment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden">
            <img 
              src="/diff.png" 
              alt="DailyDiff Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-[#f0f6fc] text-lg font-semibold">DailyDiff</h1>
            <p className="text-xs text-[#7d8590] font-medium hidden sm:block">GitHub Contribution Automation</p>
          </div>
        </div>

        {/* User Profile Menu */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileMenuOpen(!isProfileMenuOpen);
              }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262d] border border-[#21262d] transition-all duration-200"
            >
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.github_username}
                  className="w-8 h-8 rounded-full ring-1 ring-[#30363d]"
                />
              ) : (
                <div className="w-8 h-8 bg-[#30363d] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-[#8b949e]" />
                </div>
              )}
              
              {/* User Info - Hidden on Mobile */}
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium text-[#f0f6fc]">
                  {user.name || user.github_username}
                </div>
              </div>

              <ChevronDown 
                className={`w-4 h-4 text-[#7d8590] transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu - Positioned Relative to Button */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="w-44 bg-[#161b22] rounded-lg shadow-2xl overflow-hidden border border-[#30363d]">
                    <div className="py-2">
                      <a
                        href={`https://github.com/${user.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#f0f6fc] hover:bg-[#21262d] transition-colors duration-150"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Github className="w-4 h-4 text-[#7d8590]" />
                        <span>GitHub Profile</span>
                        <ExternalLink className="w-3 h-3 text-[#7d8590] ml-auto" />
                      </a>

                      <div className="border-t border-[#21262d] my-1"></div>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#f85149] hover:bg-[#21262d] hover:text-[#ff7b72] transition-colors duration-150 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
            )}
          </div>
        )}
      </div>
      {/* REMOVED: The duplicate "Welcome back" section was deleted from here */}
    </nav>
  );
};

export default DashboardNavbar;
