import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  userProfile: { username: string; avatarUrl: string; streak?: number; } | null;
}

const DashboardHeader = ({ userProfile }: DashboardHeaderProps) => {
  return (
    <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
      <div className="space-y-2">
        <h1 className="heading-primary text-3xl sm:text-4xl font-bold">
          Welcome back, <span className="text-[#39d353]">{userProfile?.username || 'Dev'}</span>!
        </h1>
        <p className="text-muted-enhanced text-base sm:text-lg font-medium leading-relaxed">
          Configure your automation or log a manual update.
        </p>
      </div>
      <div className="flex items-center gap-3 text-right">
         <div className="flex flex-col">
           <span className="text-sm font-medium text-[#f0f6fc]">Today</span>
           <span className="text-xs text-[#7d8590]">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
           </span>
         </div>
         <div className="w-8 h-8 flex items-center justify-center">
           <Calendar className="w-4 h-4 text-[#7d8590]" />
         </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
