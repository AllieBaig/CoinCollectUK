export interface Coin {
  id: string;
  title: string;
  denomination: string;
  year: number;
  summary: string;
  isCollected: boolean;
  isRare?: boolean;
  category: string;
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
  sortBy: 'recently-added' | 'recently-opened-folder' | 'title' | 'year' | 'denomination' | 'date-added' | 'month-added';
  groupBy: 'none' | 'year' | 'denomination' | 'date-added' | 'month-added';
  isGrouped: boolean;
  activeFolderId: string | 'all';
  showBottomMenu: boolean;
  isCompactUI: boolean;
  isTextMode: boolean;
  enableBgRemoval: boolean;
  isPurchaseMode: boolean;
  showPriceInNormalMode: boolean;
  denominationPrices: Record<string, number>;
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

export interface GameMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
}

export interface EraChallenge {
  id: string;
  title: string;
  description: string;
  requirement: number;
  isCompleted: boolean;
}

export interface Era {
  id: string;
  name: string;
  startYear: number;
  endYear: number;
  challenges: EraChallenge[];
  isUnlocked: boolean;
  loreCard?: string;
  badge?: string;
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
    gameStreak?: number;
    lastGameVisitDate?: string;
  };
  missions: Mission[];
  achievements: Achievement[];
  lastLuckySpinDate?: string;
  lastOpenedTimelineId?: string;
  lastOpenedStoryId?: string;
  lastOpenedGameModeId?: string;
  timelineProgress: { [timelineId: string]: number };
  gameProgress: { [gameId: string]: number };
  storyProgress: { [storyId: string]: number };
  eraProgress: { [eraId: string]: number };
  timelinePoints?: number;
  storyPoints?: number;
  gamePoints?: number;
}
