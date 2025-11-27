import { useState } from 'react';
import { User, LogOut, Settings, Github, ChevronDown, ExternalLink } from 'lucide-react';

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

  const handleSignOut = () => {
    setIsProfileMenuOpen(false);
    onSignOut();
  };

  return (
    <nav className="card-professional rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10 relative overflow-hidden">
      <div className="flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center gap-4 interactive-element">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#39d353] to-[#2ea043] rounded-xl flex items-center justify-center shadow-lg shadow-[#39d353]/20">
            <Github className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="heading-primary text-xl sm:text-2xl font-bold">DailyDiff</h1>
            <p className="text-xs sm:text-sm text-muted-enhanced font-medium hidden sm:block">GitHub Contribution Automation</p>
          </div>
        </div>

        {/* User Profile Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="btn-secondary flex items-center gap-3 p-3 rounded-xl interactive-element"
            >
              {/* Avatar */}
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.github_username}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full ring-2 ring-[#39d353]/30 shadow-lg"
                />
              ) : (
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                </div>
              )}
              
              {/* User Info */}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold heading-secondary">
                  {user.name || user.github_username}
                </div>
                <div className="text-xs text-muted-enhanced font-medium">
                  @{user.github_username}
                </div>
              </div>

              <ChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 top-full mt-2 w-64 animate-in z-50">
                  <div className="dropdown-blur rounded-lg shadow-2xl overflow-hidden">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-gray-700/30">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.github_username}
                            className="w-12 h-12 rounded-full ring-2 ring-[#39d353]/20"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {user.name || user.github_username}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            @{user.github_username}
                          </div>
                          {user.email && (
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <a
                        href={`https://github.com/${user.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gray-700/30 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Github className="w-4 h-4 text-gray-400" />
                        <span>GitHub Profile</span>
                        <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                      </a>

                      <button
                        className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-gray-700/30 transition-colors w-full text-left"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span>Settings</span>
                      </button>

                      <div className="border-t border-gray-700/30 my-2"></div>

                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Welcome Message */}
      {user && (
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-medium text-white">
                Welcome back, {user.name?.split(' ')[0] || user.github_username}! 👋
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Ready to maintain your GitHub streak?
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {new Date().toLocaleTimeString(undefined, { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DashboardNavbar;
