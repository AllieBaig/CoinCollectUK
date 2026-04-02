export interface Coin {
  id: string;
  title: string;
  denomination: string;
  year: number;
  summary: string;
  isCollected: boolean;
  isRare?: boolean;
  category: '50p' | '£2' | '£1' | 'Other';
  folderId?: string;
  addedAt: string;
  imageUrl?: string;
  amountPaid?: number;
  purchaseDate?: string;
  points?: number;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  lastOpenedAt: string;
  addedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  isCompleted: boolean;
  type: 'daily' | 'weekly';
}

export interface TimelineEvent {
  year: string;
  event: string;
  note: string;
}

export interface Timeline {
  id: string;
  title: string;
  description: string;
  events: TimelineEvent[];
  category: 'journey' | 'evolution' | 'conspiracy' | 'collector' | 'design' | 'detective' | 'my-story' | 'game';
  isDynamic?: boolean;
  type?: 'timeline' | 'game';
  unlockRequirement?: {
    type: 'coins' | 'timeline' | 'points';
    value: number | string;
    label: string;
  };
}

export interface UserPreferences {
  isDarkMode: boolean;
  themeMode: 'light' | 'dark' | 'system';
  themeTexture: 'none' | 'paper' | 'glass' | 'wood' | 'metal' | 'fabric';
  sortBy: 'recently-added' | 'recently-opened-folder' | 'title';
  activeFolderId: string | 'all';
  showBottomMenu: boolean;
  isCompactUI: boolean;
  isTextMode: boolean;
  enableBgRemoval: boolean;
  isPurchaseMode: boolean;
  showPriceInNormalMode: boolean;
}

export interface StoryChapter {
  id: string;
  title: string;
  content: string;
  coinId?: string; // The coin that unlocks this chapter
  isUnlocked: boolean;
  order: number;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  icon: string;
  chapters: StoryChapter[];
  category: 'journey' | 'mystery' | 'traveler' | 'diary';
  progress: number;
}

export interface AppState {
  version?: number;
  coins: Coin[];
  folders: Folder[];
  preferences: UserPreferences;
  lastUpdated: string;
  recoveryCode?: string;
  streak: {
    count: number;
    lastVisitDate: string;
    timelineStreak?: number;
    lastTimelineVisitDate?: string;
    storyStreak?: number;
    lastStoryVisitDate?: string;
  };
  missions: Mission[];
  achievements: Achievement[];
  lastLuckySpinDate?: string;
  lastOpenedTimelineId?: string;
  lastOpenedStoryId?: string;
  timelineProgress: { [timelineId: string]: number };
  gameProgress: { [gameId: string]: number };
  storyProgress: { [storyId: string]: number };
  timelinePoints?: number;
  storyPoints?: number;
}
