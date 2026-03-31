import { Coin, Folder, Timeline } from './types';

const now = new Date().toISOString();

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'folder-commemorative', name: 'Commemorative', icon: '🏆', lastOpenedAt: now, addedAt: now },
  { id: 'folder-rare', name: 'Rare Finds', icon: '💎', lastOpenedAt: now, addedAt: now },
  { id: 'folder-circulating', name: 'Circulating', icon: '🔄', lastOpenedAt: now, addedAt: now },
  { id: 'folder-purchased', name: 'Coins Purchased', icon: '🛍️', lastOpenedAt: now, addedAt: now }
];

export const INITIAL_COINS: Coin[] = [
  {
    id: '50p-kew-gardens',
    title: 'Kew Gardens',
    denomination: '50p',
    year: 2009,
    summary: 'The rarest 50p in circulation, featuring the famous Chinese Pagoda at the Royal Botanic Gardens. Only 210,000 were minted, making it a holy grail for collectors.',
    isCollected: false,
    isRare: true,
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
  },
  {
    id: '50p-olympic-football',
    title: 'Olympic Football',
    denomination: '50p',
    year: 2011,
    summary: 'Explains the offside rule in football. Part of the 29-coin series released for the London 2012 Olympics.',
    isCollected: false,
    isRare: true,
    category: '50p',
    folderId: 'folder-rare',
    addedAt: now
  },
  {
    id: '2-commonwealth-games-scotland',
    title: 'Commonwealth Games Scotland',
    denomination: '£2',
    year: 2002,
    summary: 'One of the rarest £2 coins, representing Scotland in the 2002 Commonwealth Games series.',
    isCollected: false,
    isRare: true,
    category: '£2',
    folderId: 'folder-rare',
    addedAt: now
  }
];

export const TIMELINES: Timeline[] = [
  {
    id: 'numismatic-journey',
    title: 'Numismatic Journey',
    description: 'From your first pocket find to a curated gallery of history.',
    category: 'journey',
    events: [
      { year: 'Day 1', event: 'The Spark', note: 'Found a shiny 2018 Paddington 50p in change. The hunt begins.' },
      { year: 'Month 1', event: 'First Folder', note: 'Organized the first 10 commemorative coins. Realized how many are out there.' },
      { year: 'Year 1', event: 'The Rare One', note: 'Finally secured a Kew Gardens 50p. Officially a serious collector.' },
      { year: 'Year 2', event: 'Expert Status', note: 'Can identify a fake £2 coin from across the room. Knowledge is power.' }
    ]
  },
  {
    id: 'coin-evolution',
    title: 'Coin Evolution',
    description: 'How physical currency transformed through the ages.',
    category: 'evolution',
    events: [
      { year: '600 BC', event: 'Lydian Lion', note: 'The first true coins appear in Lydia (modern Turkey), made of electrum.' },
      { year: '1971', event: 'Decimalisation', note: 'The UK switches to a decimal system. Goodbye shillings and pence.' },
      { year: '2017', event: 'The New Pound', note: 'The 12-sided £1 coin is introduced, the most secure in the world.' },
      { year: 'Future', event: 'Digital Shift', note: 'Physical coins become rare artifacts as digital payments dominate.' }
    ]
  },
  {
    id: 'coin-conspiracy',
    title: 'Coin Conspiracy',
    description: 'Uncovering the hidden symbols and secret minting stories.',
    category: 'conspiracy',
    events: [
      { year: '1933', event: 'The Missing Penny', note: 'Only 7 pennies were minted. Where are the others? Some say they were buried in foundations.' },
      { year: '1983', event: 'New Pence Error', note: 'A small batch of 2p coins said "New Pence" instead of "Two Pence". A valuable mistake.' },
      { year: '2008', event: 'The Dateless 20p', note: 'A production error left 200,000 coins without a date. A modern mystery.' }
    ]
  },
  {
    id: 'time-loop-collector',
    title: 'Time Loop Collector',
    description: 'Tracking the same designs as they reappear across decades.',
    category: 'collector',
    events: [
      { year: '1953', event: 'Coronation', note: 'The first portrait of Queen Elizabeth II appears on coins.' },
      { year: '1977', event: 'Silver Jubilee', note: 'Special crown coins released, echoing the 1953 celebration.' },
      { year: '2002', event: 'Golden Jubilee', note: 'The portrait has aged, but the tradition remains unbroken.' },
      { year: '2022', event: 'Platinum Jubilee', note: 'The final jubilee coins of a historic 70-year reign.' }
    ]
  },
  {
    id: 'design-evolution',
    title: 'Design Evolution Timeline',
    description: 'The artistic shift from traditional to modern numismatics.',
    category: 'design',
    events: [
      { year: 'Victorian', event: 'Gothic Revival', note: 'Intricate, busy designs reflecting the grandeur of the empire.' },
      { year: '1960s', event: 'Modernist Shift', note: 'Cleaner lines and simpler heraldry begin to appear.' },
      { year: '2008', event: 'The Shield', note: 'Matthew Dent’s design splits the Royal Shield across six coins.' },
      { year: '2023', event: 'King Charles III', note: 'A new era of design begins with the first portrait of the King.' }
    ]
  },
  {
    id: 'mint-mark-detective',
    title: 'Mint Mark Detective',
    description: 'Hunting for the tiny marks that define a coin’s origin.',
    category: 'detective',
    events: [
      { year: 'Ancient', event: 'City Marks', note: 'Roman coins used mint marks to track which city produced the currency.' },
      { year: '1800s', event: 'Branch Mints', note: 'The Royal Mint opened branches in Sydney and Perth to process gold.' },
      { year: 'Modern', event: 'Llantrisant', note: 'The Royal Mint moves to Wales, changing the production landscape forever.' }
    ]
  }
];
