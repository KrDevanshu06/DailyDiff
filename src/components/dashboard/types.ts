// Shared types for dashboard components

export interface UserProfile {
  username: string;
  avatarUrl: string;
  streak?: number;
}

export interface User {
  id: string;
  github_username: string;
  avatar_url?: string;
  name?: string;
  email?: string;
}

export interface Strategy {
  id: string;
  label: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
}

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

export interface StreakData {
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

export interface TaskIdea {
  id: string;
  title: string;
  description: string;
  category: 'code' | 'docs' | 'refactor' | 'feature';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  tags: string[];
}

export interface ContributionDay {
  date: string;
  count: number;
}
