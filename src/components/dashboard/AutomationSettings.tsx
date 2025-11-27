import { useState, useEffect } from 'react';
import { Settings, GitBranch, Clock, Globe, Zap, AlertTriangle, Save, RefreshCw, ChevronDown, Loader2, Search, CheckCircle2 } from 'lucide-react';

interface AutomationSettingsProps {
  isLoadingSettings: boolean;
  targetRepo: string;
  setTargetRepo: (val: string) => void;
  scheduleTime: string;
  setScheduleTime: (val: string) => void;
  userTimezone: string;
  setUserTimezone: (val: string) => void;
  contentMode: string;
  setContentMode: (val: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availableStrategies: Array<{ id: string; label: string; description: string; icon: any }>;
  isBotActive: boolean;
  isSaving: boolean;
  handleSaveSettings: () => void;
  commonTimezones: string[];
  repos: string[];
  fetchRepos: () => void;
  isLoadingRepos: boolean;
}

const AutomationSettings = ({
  isLoadingSettings,
  targetRepo,
  setTargetRepo,
  scheduleTime,
  setScheduleTime,
  userTimezone,
  setUserTimezone,
  contentMode,
  setContentMode,
  availableStrategies,
  isBotActive,
  isSaving,
  handleSaveSettings,
  commonTimezones,
  repos,
  fetchRepos,
  isLoadingRepos
}: AutomationSettingsProps) => {
  
  // Repository dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Timezone dropdown state
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');
  const [timezoneSelectedIndex, setTimezoneSelectedIndex] = useState(-1);
  
  // Time picker state
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(14);
  const [selectedMinute, setSelectedMinute] = useState(50);

  // Time picker constants
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i).filter(m => m % 5 === 0);
  const commonTimes = [
    { label: "Morning (9:00 AM)", hour: 9, minute: 0 },
    { label: "Lunch (12:00 PM)", hour: 12, minute: 0 },
    { label: "Afternoon (2:30 PM)", hour: 14, minute: 30 },
    { label: "Evening (6:00 PM)", hour: 18, minute: 0 },
    { label: "Night (9:00 PM)", hour: 21, minute: 0 },
  ];

  // Computed filtered arrays
  const filteredRepos = repos.filter(repo => 
    repo.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  const filteredTimezones = commonTimezones.filter(tz => 
    tz.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  // Sync time values with scheduleTime
  useEffect(() => {
    if (scheduleTime) {
      const [hours, minutes] = scheduleTime.split(':').map(Number);
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    }
  }, [scheduleTime]);

  // Update scheduleTime when hour/minute changes
  const updateScheduleTime = (hour: number, minute: number) => {
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setScheduleTime(timeString);
    setSelectedHour(hour);
    setSelectedMinute(minute);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.repository-dropdown')) {
        setIsDropdownOpen(false);
      }
      if (!target.closest('.timezone-dropdown')) {
        setIsTimezoneDropdownOpen(false);
      }
      if (!target.closest('.time-picker-dropdown')) {
        setIsTimePickerOpen(false);
      }
    };

    if (isDropdownOpen || isTimezoneDropdownOpen || isTimePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isTimezoneDropdownOpen, isTimePickerOpen]);

  // Reset selected indices when search changes
  useEffect(() => {
    setSelectedIndex(-1);
  }, [dropdownSearch]);

  useEffect(() => {
    setTimezoneSelectedIndex(-1);
  }, [timezoneSearch]);

  return (
    <div className="card-professional rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-gradient-to-br from-[#39d353]/20 to-[#2ea043]/20 rounded-xl">
          <Settings className="text-[#39d353] w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="heading-secondary text-xl sm:text-2xl">Automation Settings</h2>
          <p className="text-xs sm:text-sm text-muted-enhanced">Configure your automated GitHub contributions</p>
        </div>
      </div>

      {isLoadingSettings ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="loading-shimmer h-12 sm:h-14 rounded-xl w-full"></div>
          <div className="loading-shimmer h-12 sm:h-14 rounded-xl w-full"></div>
          <div className="loading-shimmer h-20 sm:h-24 rounded-xl w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Repository Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-2">
                <GitBranch size={12} className="sm:w-3.5 sm:h-3.5" /> Target Repository
              </label>
              <button onClick={fetchRepos} className="text-[10px] text-[#39d353] hover:underline flex items-center gap-1" disabled={isLoadingRepos}>
                {isLoadingRepos ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />} Refresh
              </button>
            </div>
            
            <div className="relative repository-dropdown">
              <div className="relative">
                <div className="absolute left-3 top-3 sm:top-3.5 text-gray-400 pointer-events-none z-10">
                  {isLoadingRepos ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                </div>
                <input
                  type="text"
                  value={dropdownSearch}
                  onChange={(e) => setDropdownSearch(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder={targetRepo || "Search repositories..."}
                  className="w-full glass-morphism-light rounded-lg pl-9 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-[#39d353] focus:ring-2 focus:ring-[#39d353]/30 outline-none transition-all backdrop-blur-sm"
                  disabled={isLoadingRepos}
                />
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="absolute right-3 top-3 sm:top-3.5 text-gray-400 hover:text-white transition-colors"
                  disabled={isLoadingRepos}
                >
                  <ChevronDown size={14} className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Repository Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full mt-2 w-full animate-in" style={{zIndex: 9999}}>
                  <div className="dropdown-blur rounded-lg shadow-2xl max-h-64 overflow-hidden">
                    {dropdownSearch && (
                      <div className="px-3 sm:px-4 py-2 border-b border-gray-700/30 text-[10px] sm:text-xs text-gray-400">
                        {filteredRepos.length} repositories found
                      </div>
                    )}
                    
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredRepos.length > 0 ? (
                        filteredRepos.map((repo, index) => (
                          <button
                            key={repo}
                            onClick={() => {
                              setTargetRepo(repo);
                              setDropdownSearch('');
                              setIsDropdownOpen(false);
                              setSelectedIndex(-1);
                            }}
                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm text-white hover:bg-[#39d353]/15 active:bg-[#39d353]/25 transition-all duration-150 border-b border-gray-700/20 last:border-b-0 flex items-center justify-between group ${
                              targetRepo === repo ? 'bg-[#39d353]/20 border-[#39d353]/20' : ''
                            } ${
                              selectedIndex === index ? 'bg-[#39d353]/10' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <GitBranch size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{repo}</span>
                            </div>
                            {targetRepo === repo && (
                              <CheckCircle2 size={14} className="text-[#39d353] ml-2 flex-shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 sm:px-4 py-6 text-xs sm:text-sm text-gray-400 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <GitBranch size={16} className="text-gray-500" />
                            <span>{repos.length === 0 ? 'No repositories found' : 'No matching repositories'}</span>
                            {dropdownSearch && (
                              <button 
                                onClick={() => setDropdownSearch('')}
                                className="text-[10px] text-[#39d353] hover:underline"
                              >
                                Clear search
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Select a repository where the bot will commit.</p>
          </div>
          
          {/* Time and Timezone Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-2">
              <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> Schedule Time (Daily)
            </label>
            <div className="flex gap-2">
              {/* Professional Time Picker */}
              <div className="relative flex-1 time-picker-dropdown">
                <button
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                  className="w-full glass-morphism-light rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-[#39d353] focus:ring-2 focus:ring-[#39d353]/30 outline-none transition-all backdrop-blur-sm text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span>{scheduleTime || "Select time"}</span>
                    {scheduleTime && (
                      <span className="text-[10px] text-gray-400">
                        ({new Date(`1970-01-01T${scheduleTime}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })})
                      </span>
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-gray-400 group-hover:text-white transition-all ${isTimePickerOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Time Picker Dropdown */}
                {isTimePickerOpen && (
                  <div className="absolute top-full mt-2 w-full animate-in" style={{zIndex: 9999}}>
                    <div className="dropdown-blur rounded-lg shadow-2xl overflow-hidden">
                      {/* Quick Time Presets */}
                      <div className="p-3 border-b border-gray-700/30">
                        <div className="text-[10px] text-gray-400 mb-2 font-semibold uppercase tracking-wider">Quick Select</div>
                        <div className="grid grid-cols-1 gap-1">
                          {commonTimes.map((time) => {
                            const isSelected = selectedHour === time.hour && selectedMinute === time.minute;
                            return (
                              <button
                                key={time.label}
                                onClick={() => {
                                  updateScheduleTime(time.hour, time.minute);
                                  setIsTimePickerOpen(false);
                                }}
                                className={`px-2 py-1.5 text-left text-xs text-white hover:bg-[#39d353]/15 active:bg-[#39d353]/25 rounded transition-all duration-150 flex items-center justify-between ${
                                  isSelected ? 'bg-[#39d353]/20 border border-[#39d353]/30' : ''
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  {time.label}
                                  {isSelected && <CheckCircle2 size={10} className="text-[#39d353]" />}
                                </span>
                                <span className="text-[10px] text-gray-400">{String(time.hour).padStart(2, '0')}:{String(time.minute).padStart(2, '0')}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Time Selection */}
                      <div className="p-3">
                        <div className="text-[10px] text-gray-400 mb-3 font-semibold uppercase tracking-wider">Custom Time</div>
                        <div className="flex gap-3 items-center">
                          {/* Hour Selector */}
                          <div className="flex-1">
                            <div className="text-[9px] text-gray-500 mb-1">Hour</div>
                            <div className="relative">
                              <select
                                value={selectedHour}
                                onChange={(e) => updateScheduleTime(parseInt(e.target.value), selectedMinute)}
                                className="w-full glass-morphism-light rounded-lg px-3 py-2 text-xs text-white focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353]/30 outline-none transition-all backdrop-blur-sm appearance-none cursor-pointer"
                              >
                                {hours.map(hour => (
                                  <option key={hour} value={hour} className="bg-gray-900">
                                    {String(hour).padStart(2, '0')} ({hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`})
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="text-gray-400 text-sm">:</div>

                          {/* Minute Selector */}
                          <div className="flex-1">
                            <div className="text-[9px] text-gray-500 mb-1">Minute</div>
                            <div className="relative">
                              <select
                                value={selectedMinute}
                                onChange={(e) => updateScheduleTime(selectedHour, parseInt(e.target.value))}
                                className="w-full glass-morphism-light rounded-lg px-3 py-2 text-xs text-white focus:border-[#39d353] focus:ring-1 focus:ring-[#39d353]/30 outline-none transition-all backdrop-blur-sm appearance-none cursor-pointer"
                              >
                                {minutes.map(minute => (
                                  <option key={minute} value={minute} className="bg-gray-900">
                                    {String(minute).padStart(2, '0')}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Professional Timezone Selector */}
              <div className="relative w-1/2 timezone-dropdown">
                <div className="relative">
                  <div className="absolute left-2.5 top-3 sm:top-3.5 text-gray-400 pointer-events-none z-10">
                    <Globe size={12} />
                  </div>
                  <input
                    type="text"
                    value={timezoneSearch}
                    onChange={(e) => setTimezoneSearch(e.target.value)}
                    onFocus={() => setIsTimezoneDropdownOpen(true)}
                    placeholder={userTimezone || "Search timezone..."}
                    className="w-full glass-morphism-light rounded-lg pl-8 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm text-white focus:border-[#39d353] focus:ring-2 focus:ring-[#39d353]/30 outline-none transition-all backdrop-blur-sm truncate"
                  />
                  <button
                    onClick={() => setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen)}
                    className="absolute right-2 top-3 sm:top-3.5 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronDown size={12} className={`transform transition-transform ${isTimezoneDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                {/* Timezone Dropdown Menu */}
                {isTimezoneDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full animate-in" style={{zIndex: 9999}}>
                    <div className="dropdown-blur rounded-lg shadow-2xl max-h-48 overflow-hidden">
                      {timezoneSearch && (
                        <div className="px-3 py-2 border-b border-gray-700/30 text-[10px] text-gray-400">
                          {filteredTimezones.length} timezones found
                        </div>
                      )}
                      
                      <div className="max-h-44 overflow-y-auto custom-scrollbar">
                        {filteredTimezones.length > 0 ? (
                          filteredTimezones.map((tz, index) => (
                            <button
                              key={tz}
                              onClick={() => {
                                setUserTimezone(tz);
                                setTimezoneSearch('');
                                setIsTimezoneDropdownOpen(false);
                                setTimezoneSelectedIndex(-1);
                              }}
                              className={`w-full px-3 py-2.5 text-left text-xs text-white hover:bg-[#39d353]/15 active:bg-[#39d353]/25 transition-all duration-150 border-b border-gray-700/20 last:border-b-0 flex items-center justify-between group ${
                                userTimezone === tz ? 'bg-[#39d353]/20 border-[#39d353]/20' : ''
                              } ${
                                timezoneSelectedIndex === index ? 'bg-[#39d353]/10' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Globe size={10} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate text-xs">{tz}</span>
                              </div>
                              {userTimezone === tz && (
                                <CheckCircle2 size={12} className="text-[#39d353] ml-2 flex-shrink-0" />
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-xs text-gray-400 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Globe size={14} className="text-gray-500" />
                              <span>No matching timezones</span>
                              {timezoneSearch && (
                                <button 
                                  onClick={() => setTimezoneSearch('')}
                                  className="text-[9px] text-[#39d353] hover:underline"
                                >
                                  Clear search
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[9px] sm:text-[10px] text-gray-500">Choose when the bot should create daily commits in your timezone.</p>
          </div>

          {/* Content Strategy Selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 sm:gap-2">
              <Zap size={12} className="sm:w-3.5 sm:h-3.5" /> Content Strategy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {availableStrategies.map((strategy) => (
                <button 
                  key={strategy.id} 
                  onClick={() => setContentMode(strategy.id)} 
                  className={`p-2.5 sm:p-3 rounded-lg text-left transition-all gentle-hover ${
                    contentMode === strategy.id 
                      ? 'glass-morphism border-[#238636] text-white ring-1 ring-[#238636]/30' 
                      : 'glass-morphism-light text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="font-bold text-[10px] sm:text-xs mb-1 flex items-center gap-1.5">
                    <strategy.icon size={14} className="text-current" />
                    <span>{strategy.label}</span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] opacity-70">{strategy.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Save Button Section */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
         <div className="flex items-center gap-2 text-yellow-500/70 text-[10px] sm:text-xs glass-morphism-light ring-1 ring-yellow-500/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg max-w-xs backdrop-blur-sm">
           <AlertTriangle size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
           <span className="leading-tight">Use responsibly. Purely automated commits may be flagged by GitHub.</span>
         </div>
         <button 
           onClick={handleSaveSettings} 
           disabled={isSaving || isLoadingSettings} 
           className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold text-xs sm:text-sm transition-all gentle-hover backdrop-blur-sm w-full sm:w-auto ${
             isSaving || isLoadingSettings 
               ? 'glass-morphism-light text-gray-400 cursor-not-allowed' 
               : 'bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#238636] text-white shadow-lg hover:shadow-[#2ea043]/20'
           }`}
         >
           {isSaving ? (
             <>Saving Config...</>
           ) : (
             <>
               <Save size={14} className="sm:w-4 sm:h-4" />
               {isBotActive ? 'Update Schedule' : 'Activate Automation'}
             </>
           )}
         </button>
      </div>
    </div>
  );
};

export default AutomationSettings;
