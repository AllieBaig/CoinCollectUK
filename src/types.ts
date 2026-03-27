export interface Coin {
  id: string;
  title: string;
  denomination: string;
  year: number;
  summary: string;
  isCollected: boolean;
  category: '50p' | '£2' | '£1' | 'Other';
}

export interface AppState {
  coins: Coin[];
  lastUpdated: string;
}
