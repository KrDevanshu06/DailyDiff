import { useState } from 'react';
import { Zap, MessageCircle, Loader2, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

interface ManualCheckInProps {
  onManualCommit: (message?: string) => Promise<void>;
}

const ManualCheckIn = ({ onManualCommit }: ManualCheckInProps) => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [lastCommitTime, setLastCommitTime] = useState<Date | null>(null);
  const [commitSuccess, setCommitSuccess] = useState<boolean | null>(null);

  const handleManualCommit = async (customMessage?: string) => {
    if (isCommitting) return;
    
    setIsCommitting(true);
    setCommitSuccess(null);
    
    try {
      await onManualCommit(customMessage);
      setLastCommitTime(new Date());
      setCommitSuccess(true);
      setCommitMessage(''); // Clear the input after successful commit
    } catch (error) {
      console.error('Manual commit failed:', error);
      setCommitSuccess(false);
    } finally {
      setIsCommitting(false);
    }
  };

  const quickCommitMessages = [
    "Minor improvements and fixes",
    "Updated documentation",
    "Code cleanup and refactoring",
    "Bug fixes and optimizations",
    "Daily progress update"
  ];

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="card-professional rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="p-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
          <Zap className="text-yellow-500 w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h2 className="heading-secondary text-xl sm:text-2xl">Manual Check-in</h2>
          <p className="text-xs sm:text-sm text-muted-enhanced">Quick actions for instant commits</p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted-enhanced uppercase tracking-wider">Quick Actions</div>
          
          {/* Instant Commit Button */}
          <button 
            onClick={() => handleManualCommit()}
            disabled={isCommitting}
            className={`w-full p-4 sm:p-5 rounded-xl font-bold text-sm transition-all relative overflow-hidden ${
              isCommitting 
                ? 'btn-secondary text-gray-400 cursor-not-allowed opacity-50' 
                : 'btn-primary text-white shadow-lg'
            }`}
          >
            {isCommitting ? (
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating commit...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-5 h-5" />
                <span>Quick Commit Now</span>
              </div>
            )}
          </button>

          {/* Quick Message Buttons */}
          <div className="grid grid-cols-1 gap-3">
            {quickCommitMessages.slice(0, 4).map((message, index) => (
              <button
                key={index}
                onClick={() => handleManualCommit(message)}
                disabled={isCommitting}
                className="btn-secondary p-3 text-xs text-left rounded-xl interactive-element disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
                    <MessageCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  </div>
                  <span className="text-white truncate font-medium">{message}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted-enhanced uppercase tracking-wider">Custom Message</div>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && commitMessage.trim() && !isCommitting) {
                  handleManualCommit(commitMessage.trim());
                }
              }}
              placeholder="Enter your commit message..."
              className="flex-1 input-enhanced rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
              disabled={isCommitting}
            />
            <button
              onClick={() => commitMessage.trim() && handleManualCommit(commitMessage.trim())}
              disabled={!commitMessage.trim() || isCommitting}
              className="btn-primary px-5 py-3 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all flex items-center gap-2"
            >
              {isCommitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {commitSuccess !== null && (
          <div className={`p-4 rounded-xl ${
            commitSuccess 
              ? 'notification-success' 
              : 'notification-error'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                {commitSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium">
                {commitSuccess 
                  ? 'Commit created successfully!' 
                  : 'Failed to create commit. Please try again.'
                }
              </span>
            </div>
          </div>
        )}

        {/* Last Commit Info */}
        {lastCommitTime && (
          <div className="pt-3 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Last manual commit:</span>
              <span>{formatTimeAgo(lastCommitTime)}</span>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="pt-3 border-t border-gray-800">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <MessageCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              Manual commits help maintain your GitHub streak when the automated system isn't running. 
              These will count towards your daily contributions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualCheckIn;
