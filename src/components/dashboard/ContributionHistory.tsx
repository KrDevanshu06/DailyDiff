import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity } from 'lucide-react';
import API_URL from '../../config';

interface ContributionDay {
  date: string;
  count: number;
}

const ContributionHistory = () => {
  // Helper to generate safe defaults
  const generateMockData = () => {
    const data: ContributionDay[] = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Random data logic
      const rand = Math.random();
      let count = 0;
      if (rand > 0.9) count = Math.floor(Math.random() * 8) + 4;
      else if (rand > 0.6) count = Math.floor(Math.random() * 3) + 1;
      data.push({ date: date.toISOString().split('T')[0], count });
    }
    return data;
  };

  // Initialize state
  const [contributionData, setContributionData] = useState<ContributionDay[]>(generateMockData());
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchContributions = async () => {
      const CACHE_KEY = 'dailydiff_client_cache';
      const CACHE_DURATION = 60 * 60 * 1000; // 1 Hour Cache
      
      // 1. Safe LocalStorage Check
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          if (parsed && Array.isArray(parsed.data)) {
             const age = Date.now() - (parsed.timestamp || 0);
             if (age < CACHE_DURATION) {
               setContributionData(parsed.data);
               return; 
             }
          }
        } catch {
          console.warn("Cache corrupted, clearing.");
          localStorage.removeItem(CACHE_KEY);
        }
      }

      // 2. API Fetch
      try {
        const response = await fetch(`${API_URL}/api/contributions`, { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.contributions && Array.isArray(data.contributions) && data.contributions.length > 0) {
            setContributionData(data.contributions);
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              data: data.contributions
            }));
          }
        }
      } catch {
        console.error("Fetch failed, keeping mock data");
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
    setMousePosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
  };

  const renderMonths = () => {
    // Generate last 9 months dynamically
    const monthsToRender = [];
    const today = new Date();
    // We want exactly 9 months including current
    for (let i = 8; i >= 0; i--) {
      // Create date set to the 1st of the month to avoid "31st" rollover bugs
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      monthsToRender.push(d);
    }

    // Create a Map for O(1) lookup
    const safeData = contributionData || [];
    const dataMap = new Map(safeData.map(c => [c.date, c.count]));

    return (
      <div className="flex flex-wrap w-full justify-between gap-y-6">
        {monthsToRender.map((monthDate, monthIndex) => {
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          
          // STRICT CALCULATION: Get exact days in this specific month (28, 29, 30, or 31)
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          // Calculate weekday offset (0=Sun, 1=Mon, etc) for the 1st of the month
          const startDayOffset = new Date(year, month, 1).getDay(); 
          
          const slots = [];
          
          // 1. Add invisible padding slots for weekday alignment
          for (let k = 0; k < startDayOffset; k++) {
            slots.push(null);
          }
          
          // 2. Add actual days (1 to 28/29/30/31)
          for (let k = 1; k <= daysInMonth; k++) {
            const current = new Date(year, month, k);
            // Format YYYY-MM-DD manually to avoid timezone shifting issues
            const dateStr = [
              current.getFullYear(),
              String(current.getMonth() + 1).padStart(2, '0'),
              String(current.getDate()).padStart(2, '0')
            ].join('-');
            
            slots.push({ 
              date: dateStr, 
              count: dataMap.get(dateStr) || 0,
              displayDate: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            });
          }

          return (
            <div key={`${year}-${month}`} className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {monthName}
              </span>
              {/* Grid: 7 Rows (Sun-Sat), Columns flow automatically */}
              <div className="grid grid-rows-7 grid-flow-col gap-1">
                {slots.map((slot, i) => {
                  if (!slot) {
                    // Render invisible placeholder for alignment
                    return <div key={`empty-${monthIndex}-${i}`} className="w-2.5 h-2.5" />;
                  }
                  return (
                    <div 
                        key={slot.date} 
                        // Tooltip title for native browser hover check
                        title={`${slot.displayDate}: ${slot.count} contributions`}
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="text-[#39d353] w-5 h-5" />
          <h3 className="text-xl font-bold text-white">Activity History</h3>
        </div>
        <div className="text-xs font-mono text-gray-500 hidden sm:block">Last 9 months</div>
      </div>
      
      {/* Scroll container for smaller screens */}
      <div className="w-full pb-2 overflow-x-auto custom-scrollbar">
         <div className="min-w-[700px]">
            {renderMonths()}
         </div>
      </div>

      {hoveredDay && createPortal(
        <div 
          className="fixed z-[9999] bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-xs text-white shadow-2xl pointer-events-none whitespace-nowrap backdrop-blur-md select-none" 
          style={{ 
            left: mousePosition.x, 
            top: mousePosition.y - 45, // Adjusted to float clearly above
            transform: 'translateX(-50%)', 
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' 
          }}
        >
          <div className="font-semibold text-[#39d353] text-sm">
            {hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}
          </div>
          <div className="text-gray-300 text-[10px] mt-0.5">
            {new Date(hoveredDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600" />
        </div>, document.body
      )}
      
      <div className="flex items-center justify-end gap-2 text-[10px] text-gray-500 mt-4">
         <span>Less</span>
         <div className="w-2.5 h-2.5 bg-[#161b22] rounded-[2px] border border-gray-800"></div>
         <div className="w-2.5 h-2.5 bg-[#0e4429] rounded-[2px] border border-transparent"></div>
         <div className="w-2.5 h-2.5 bg-[#006d32] rounded-[2px] border border-transparent"></div>
         <div className="w-2.5 h-2.5 bg-[#26a641] rounded-[2px] border border-transparent"></div>
         <div className="w-2.5 h-2.5 bg-[#39d353] rounded-[2px] border border-transparent"></div>
         <span>More</span>
      </div>
    </div>
  );
};

export default ContributionHistory;