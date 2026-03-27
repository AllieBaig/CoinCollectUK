import { Coin, Folder } from './types';

const now = new Date().toISOString();

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'folder-commemorative', name: 'Commemorative', icon: '🏆', lastOpenedAt: now },
  { id: 'folder-rare', name: 'Rare Finds', icon: '💎', lastOpenedAt: now },
  { id: 'folder-circulating', name: 'Circulating', icon: '🔄', lastOpenedAt: now },
  { id: 'folder-purchased', name: 'Coins Purchased', icon: '🛍️', lastOpenedAt: now }
];

export const INITIAL_COINS: Coin[] = [
  {
    id: '50p-kew-gardens',
    title: 'Kew Gardens',
    denomination: '50p',
    year: 2009,
    summary: 'The rarest 50p in circulation, featuring the famous Chinese Pagoda at the Royal Botanic Gardens. Only 210,000 were minted, making it a holy grail for collectors.',
    isCollected: false,
    category: '50p',
    folderId: 'folder-rare',
    addedAt: now
  },
  {
    id: '50p-paddington-station',
    title: 'Paddington at the Station',
    denomination: '50p',
    year: 2018,
    summary: 'Part of a series celebrating the 60th anniversary of Paddington Bear. This coin depicts the beloved bear sitting on his suitcase at Paddington Station.',
    isCollected: false,
    category: '50p',
    folderId: 'folder-commemorative',
    addedAt: now
  },
  {
    id: '2-great-fire',
    title: 'Great Fire of London',
    denomination: '£2',
    year: 2016,
    summary: 'Commemorating the 350th anniversary of the 1666 fire that reshaped London. The design captures the intensity of the flames engulfing the city skyline.',
    isCollected: false,
    category: '£2',
    folderId: 'folder-commemorative',
    addedAt: now
  },
  {
    id: '2-shakespeare-tragedies',
    title: 'Shakespeare Tragedies',
    denomination: '£2',
    year: 2016,
    summary: 'One of three coins marking 400 years of William Shakespeare. This design features a skull and rose, representing his iconic tragic works.',
    isCollected: false,
    category: '£2',
    folderId: 'folder-commemorative',
    addedAt: now
  },
  {
    id: '50p-brexit',
    title: 'Withdrawal from the EU',
    denomination: '50p',
    year: 2020,
    summary: 'Marking the UK’s departure from the European Union on January 31st. It bears the inscription "Peace, prosperity and friendship with all nations."',
    isCollected: false,
    category: '50p',
    folderId: 'folder-circulating',
    addedAt: now
  },
  {
    id: '1-nations-of-uk',
    title: 'Nations of the UK',
    denomination: '£1',
    year: 2017,
    summary: 'The first of the new 12-sided pound coins, featuring symbols of the four nations. It includes the English rose, Welsh leek, Scottish thistle, and Northern Irish shamrock.',
    isCollected: false,
    category: '£1',
    folderId: 'folder-circulating',
    addedAt: now
  }
];
