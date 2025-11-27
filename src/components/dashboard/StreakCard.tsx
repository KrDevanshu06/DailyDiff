import { useState } from 'react';
import { Flame, Trophy, Calendar, RefreshCw, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';

interface StreakData {
  current: number;
  longest: number;
  todayContributed: boolean;
  contributions: {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
  };
  lastContribution?: string;
}

interface StreakCardProps {
  streakData: StreakData | null;
  isLoadingStreak: boolean;
  refreshStreak: () => void;
  username: string;
}

const StreakCard = ({
  streakData,
  isLoadingStreak,
  refreshStreak,
  username
}: StreakCardProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshStreak();
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const getStreakStatus = () => {
    if (!streakData) return { color: 'text-gray-400', message: 'No data available' };
    
    if (streakData.current === 0) {
      return { 
        color: 'text-red-400', 
        message: 'Streak broken! Time to make a new commit.' 
      };
    }
    
    if (!streakData.todayContributed) {
      return { 
        color: 'text-yellow-400', 
        message: "Haven't contributed today yet!" 
      };
    }
    
    if (streakData.current >= 365) {
      return { 
        color: 'text-purple-400', 
        message: 'Legendary streak! 🏆' 
      };
    }
    
    if (streakData.current >= 100) {
      return { 
        color: 'text-blue-400', 
        message: 'Amazing consistency! 💎' 
      };
    }
    
    if (streakData.current >= 30) {
      return { 
        color: 'text-[#39d353]', 
        message: 'Great momentum! 🚀' 
      };
    }
    
    if (streakData.current >= 7) {
      return { 
        color: 'text-orange-400', 
        message: 'Building a habit! 🔥' 
      };
    }
    
    return { 
      color: 'text-[#39d353]', 
      message: 'Keep it up! 💪' 
    };
  };

  const formatLastContribution = (lastContribution?: string) => {
    if (!lastContribution) return 'Never';
    
    try {
      const date = new Date(lastContribution);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const status = getStreakStatus();

  return (
    <div className="streak-card rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
            <Flame className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="heading-secondary text-xl sm:text-2xl">GitHub Streak</h2>
            <p className="text-xs sm:text-sm text-muted-enhanced">Track your coding consistency</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoadingStreak || isRefreshing}
          className="btn-secondary p-3 rounded-xl interactive-element disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh streak data"
        >
          <RefreshCw 
            className={`w-4 h-4 text-gray-400 hover:text-white transition-colors ${
              (isLoadingStreak || isRefreshing) ? 'animate-spin' : ''
            }`} 
          />
        </button>
      </div>

      {isLoadingStreak && !streakData ? (
        <div className="space-y-6 animate-pulse">
          <div className="flex justify-between">
            <div className="loading-shimmer h-16 rounded-xl w-28"></div>
            <div className="loading-shimmer h-16 rounded-xl w-28"></div>
          </div>
          <div className="loading-shimmer h-12 rounded-lg w-full"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="loading-shimmer h-20 rounded-xl"></div>
            <div className="loading-shimmer h-20 rounded-xl"></div>
          </div>
        </div>
      ) : streakData ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="text-center p-4 sm:p-6 card-professional rounded-xl interactive-element">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl">
                  <Flame className="text-orange-500 w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold heading-primary mb-1">{streakData.current}</div>
                  <div className="text-xs sm:text-sm text-muted-enhanced font-medium">Current Streak</div>
                </div>
              </div>
            </div>
            
            <div className="text-center p-4 sm:p-6 card-professional rounded-xl interactive-element">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl">
                  <Trophy className="text-yellow-500 w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold heading-primary mb-1">{streakData.longest}</div>
                  <div className="text-xs sm:text-sm text-muted-enhanced font-medium">Longest Streak</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-4 sm:p-5 card-professional rounded-xl text-center ${status.color}`}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                streakData.todayContributed 
                  ? 'bg-[#39d353] shadow-lg shadow-[#39d353]/50 animate-pulse' 
                  : 'bg-gray-400'
              }`}></div>
              <span className="text-sm sm:text-base font-bold">{status.message}</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-enhanced font-medium">
              Last contribution: <span className="text-[#f0f6fc]">{formatLastContribution(streakData.lastContribution)}</span>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 card-professional rounded-xl interactive-element">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg">
                  <Calendar className="text-blue-400 w-4 h-4" />
                </div>
                <span className="text-2xl font-bold heading-primary">{streakData.contributions.today}</span>
              </div>
              <div className="text-xs text-muted-enhanced font-medium">Today</div>
            </div>
            
            <div className="p-4 card-professional rounded-xl interactive-element">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                  <TrendingUp className="text-purple-400 w-4 h-4" />
                </div>
                <span className="text-2xl font-bold heading-primary">{streakData.contributions.thisWeek}</span>
              </div>
              <div className="text-xs text-muted-enhanced font-medium">This Week</div>
            </div>
          </div>

          {/* Profile Link */}
          <div className="pt-2 sm:pt-4 border-t border-gray-800">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-[#39d353] hover:underline flex items-center justify-center gap-2 py-2 gentle-hover"
            >
              View full GitHub profile
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 space-y-3">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto opacity-50" />
          <div>
            <p className="text-sm text-gray-400 mb-2">Unable to load streak data</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs text-[#39d353] hover:underline flex items-center gap-2 mx-auto"
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreakCard;
