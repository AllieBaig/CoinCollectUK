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

export interface UserPreferences {
  isDarkMode: boolean;
  themeMode: 'light' | 'dark' | 'system';
  sortBy: 'recently-added' | 'recently-opened-folder' | 'title';
  activeFolderId: string | 'all';
  showBottomMenu: boolean;
  isCompactUI: boolean;
  isTextMode: boolean;
  enableBgRemoval: boolean;
  isPurchaseMode: boolean;
  showPriceInNormalMode: boolean;
}

export interface AppState {
  coins: Coin[];
  folders: Folder[];
  preferences: UserPreferences;
  lastUpdated: string;
  recoveryCode?: string;
  streak: {
    count: number;
    lastVisitDate: string;
  };
  missions: Mission[];
  achievements: Achievement[];
  lastLuckySpinDate?: string;
}
