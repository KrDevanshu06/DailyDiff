import { Calendar } from 'lucide-react';

interface DashboardHeaderProps {
  userProfile: { username: string; avatarUrl: string; streak?: number; } | null;
}

const DashboardHeader = ({ userProfile }: DashboardHeaderProps) => {
  return (
    <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
      <div className="space-y-2">
        <h1 className="heading-primary text-3xl sm:text-4xl font-bold">
          Welcome back, <span className="text-[#39d353]">{userProfile?.username || 'Dev'}</span>! 👋
        </h1>
        <p className="text-muted-enhanced text-base sm:text-lg font-medium leading-relaxed">
          Configure your automation or log a manual update.
        </p>
      </div>
      <div className="card-professional px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center gap-3 interactive-element">
         <div className="p-2 bg-gradient-to-br from-[#39d353]/20 to-[#2ea043]/10 rounded-lg">
           <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#39d353]" />
         </div>
         <div className="flex flex-col">
           <span className="text-sm font-medium text-[#f0f6fc]">Today</span>
           <span className="text-xs text-muted-enhanced whitespace-nowrap">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
           </span>
         </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
