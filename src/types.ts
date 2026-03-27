export interface Coin {
  id: string;
  title: string;
  denomination: string;
  year: number;
  summary: string;
  isCollected: boolean;
  category: '50p' | '£2' | '£1' | 'Other';
  folderId?: string;
  addedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  icon: string;
  lastOpenedAt: string;
}

export interface UserPreferences {
  isDarkMode: boolean;
  sortBy: 'recently-added' | 'recently-opened-folder' | 'title';
  activeFolderId: string | 'all';
}

export interface AppState {
  coins: Coin[];
  folders: Folder[];
  preferences: UserPreferences;
  lastUpdated: string;
}
