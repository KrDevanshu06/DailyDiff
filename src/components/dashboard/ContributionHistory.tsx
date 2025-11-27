import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity } from 'lucide-react';
import API_URL from '../../config';

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
      else if (rand > 0.7) count = Math.floor(Math.random() * 4) + 1;
      data.push({ date: date.toISOString().split('T')[0], count });
    }
    return data;
  };

  useEffect(() => {
    const fetchContributions = async () => {
      console.log("📊 Fetching contribution data...");
      
      // Set mock data immediately to prevent disappearing
      const mockData = generateMockData();
      setContributionData(mockData);
      setIsLoading(false);

      try {
        const response = await fetch(`${API_URL}/api/contributions`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Contribution data received:", data);
          if (data.rateLimited || data.error) {
            console.warn('GitHub API rate limited or error, keeping mock data');
            // Keep mock data already set
          } else if (data.contributions && data.contributions.length > 0) {
            setContributionData(data.contributions);
          }
        } else {
          console.warn('API failed, keeping mock data');
          // Keep mock data already set
        }
      } catch (error) {
        console.error('❌ Failed to fetch contributions:', error);
        // Keep mock data already set
      }
    };
    
    fetchContributions();
  }, []);

  const getLevelColor = (count: number) => {
    if (count === 0) return 'bg-[#161b22] border border-gray-800/50';
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
        <div 
          className="fixed z-[9999] bg-gray-900 border border-gray-500 rounded-lg px-3 py-2 text-xs text-white shadow-2xl pointer-events-none whitespace-nowrap backdrop-blur-md select-none" 
          style={{ 
            left: mousePosition.x, 
            top: mousePosition.y - 50, 
            transform: 'translateX(-50%)', 
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
          }}
        >
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

export default ContributionHistory;
