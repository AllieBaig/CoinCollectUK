/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { 
  Moon, 
  Sun, 
  Search, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Folder as FolderIcon,
  Settings,
  Upload,
  RefreshCw,
  WifiOff,
  ChevronRight,
  LayoutGrid,
  Clock,
  Type as TypeIcon,
  MoreHorizontal,
  Camera,
  Image as ImageIcon,
  PoundSterling,
  Calendar,
  User,
  LayoutList,
  Trophy,
  AlertTriangle,
  Monitor,
  ShieldAlert,
  Check,
  ShoppingBag,
  Table,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  Star,
  Database,
  ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Coin, AppState, Folder, UserPreferences, Mission, Achievement, Timeline, TimelineEvent } from './types';
import { INITIAL_COINS, INITIAL_FOLDERS, TIMELINES } from './constants';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.props = props;
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleExport = () => {
    const data = localStorage.getItem('uk-coin-collection-v2');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uk-coins-emergency-backup.json`;
      a.click();
    } else {
      alert("No data found in local storage to export.");
    }
  };

  handleSafeMode = () => {
    localStorage.setItem('uk-coin-collection-safe-mode', 'true');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl p-10 text-center space-y-8 border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tight">App Encountered a Problem</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Something went wrong. Don't worry, your coin collection data is safe. You can try entering Safe Mode or export your data as a backup.
              </p>
            </div>

            <div className="grid gap-3">
              <button 
                onClick={this.handleSafeMode}
                className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-500/30 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-5 h-5" />
                Enter Safe Mode
              </button>
              
              <button 
                onClick={this.handleExport}
                className="w-full py-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" />
                Export Emergency Backup
              </button>

              <button 
                onClick={() => window.location.reload()}
                className="w-full py-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-black uppercase tracking-widest text-xs transition-all"
              >
                Try Normal Restart
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Safe Mode loads a minimal version of the app
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <CoinCollectorApp />
    </ErrorBoundary>
  );
}

function CoinCollectorApp() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  
  const SettingSection = ({ 
    title, 
    icon: Icon, 
    isOpen, 
    onToggle, 
    children 
  }: { 
    title: string; 
    icon: any; 
    isOpen: boolean; 
    onToggle: () => void; 
    children: React.ReactNode 
  }) => (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-black text-lg tracking-tight">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-2 px-2 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const convertData = (data: any): AppState | null => {
    try {
      // Case 1: Raw array of coins (Very old format)
      if (Array.isArray(data)) {
        return {
          version: 3,
          coins: data.map(c => ({
            id: c.id || Math.random().toString(36).substr(2, 9),
            title: c.title || c.name || 'Untitled Coin',
            denomination: c.denomination || 'Unknown',
            year: c.year || new Date().getFullYear(),
            summary: c.summary || c.description || '',
            isCollected: c.isCollected !== undefined ? c.isCollected : true,
            isRare: c.isRare || false,
            category: c.category || 'Other',
            folderId: c.folderId || 'all',
            addedAt: c.addedAt || c.date || new Date().toISOString(),
            imageUrl: c.imageUrl || '',
            amountPaid: c.amountPaid !== undefined ? c.amountPaid : (c.price || 0),
            purchaseDate: c.purchaseDate || c.date || new Date().toISOString()
          })),
          folders: INITIAL_FOLDERS,
          preferences: {
            isDarkMode: false,
            themeMode: 'system',
            sortBy: 'recently-added',
            activeFolderId: 'all',
            showBottomMenu: true,
            isCompactUI: false,
            isTextMode: false,
            enableBgRemoval: true,
            isPurchaseMode: false,
            showPriceInNormalMode: true
          },
          lastUpdated: new Date().toISOString(),
          streak: { count: 0, lastVisitDate: new Date().toISOString() },
          missions: [],
          achievements: [],
          timelineProgress: {}
        };
      }

      // Case 2: Object with different keys or missing version
      if (typeof data === 'object' && data !== null) {
        const coins = data.coins || data.coinList || [];
        const folders = data.folders || INITIAL_FOLDERS;
        const preferences = data.preferences || {
          isDarkMode: false,
          themeMode: 'system',
          sortBy: 'recently-added',
          activeFolderId: 'all',
          showBottomMenu: true,
          isCompactUI: false,
          isTextMode: false,
          enableBgRemoval: true,
          isPurchaseMode: false,
          showPriceInNormalMode: true
        };

        return {
          version: 3,
          coins: coins.map((c: any) => ({
            id: c.id || Math.random().toString(36).substr(2, 9),
            title: c.title || c.name || 'Untitled Coin',
            denomination: c.denomination || 'Unknown',
            year: c.year || new Date().getFullYear(),
            summary: c.summary || c.description || '',
            isCollected: c.isCollected !== undefined ? c.isCollected : true,
            isRare: c.isRare || false,
            category: c.category || 'Other',
            folderId: c.folderId || 'all',
            addedAt: c.addedAt || c.date || new Date().toISOString(),
            imageUrl: c.imageUrl || '',
            amountPaid: c.amountPaid !== undefined ? c.amountPaid : (c.price || 0),
            purchaseDate: c.purchaseDate || c.date || new Date().toISOString()
          })),
          folders: folders,
          preferences: preferences,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
          recoveryCode: data.recoveryCode,
          streak: data.streak || { count: 0, lastVisitDate: new Date().toISOString() },
          missions: data.missions || [],
          achievements: data.achievements || [],
          lastLuckySpinDate: data.lastLuckySpinDate,
          timelineProgress: data.timelineProgress || {}
        };
      }

      return null;
    } catch (err) {
      console.error('Conversion error:', err);
      return null;
    }
  };

  const [preferences, setPreferences] = useState<UserPreferences>({
    isDarkMode: false,
    themeMode: 'system',
    sortBy: 'recently-added',
    activeFolderId: 'all',
    showBottomMenu: true,
    isCompactUI: false,
    isTextMode: false,
    enableBgRemoval: true,
    isPurchaseMode: false,
    showPriceInNormalMode: true
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'collected' | 'missing'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPhotoLibraryOpen, setIsPhotoLibraryOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [editingCoin, setEditingCoin] = useState<Coin | null>(null);
  const [editingCoinId, setEditingCoinId] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [openSettingSection, setOpenSettingSection] = useState<string | null>('display');

  // Gamification state
  const [streak, setStreak] = useState({ count: 0, lastVisitDate: '' });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lastLuckySpinDate, setLastLuckySpinDate] = useState<string | undefined>(undefined);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [activeTimelineId, setActiveTimelineId] = useState<string | null>(null);
  const [timelineProgress, setTimelineProgress] = useState<{ [key: string]: number }>({});
  const [timelinePoints, setTimelinePoints] = useState(0);
  const [lastOpenedTimelineId, setLastOpenedTimelineId] = useState<string | undefined>(undefined);
  const [expandedEventIdx, setExpandedEventIdx] = useState<number | null>(null);

  const myCoinStory = useMemo(() => {
    const collectedCoins = coins.filter(c => c.isCollected);
    const events: TimelineEvent[] = [];
    
    if (collectedCoins.length > 0) {
      const sortedByAdded = [...collectedCoins].sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime());
      
      const firstCoin = sortedByAdded[0];
      events.push({
        year: new Date(firstCoin.addedAt).getFullYear().toString(),
        event: 'The First Discovery',
        note: `Your collection journey began with the ${firstCoin.denomination} ${firstCoin.title}.`
      });

      const rareCoins = collectedCoins.filter(c => c.isRare);
      if (rareCoins.length > 0) {
        events.push({
          year: 'Rare Finds',
          event: 'Treasures Uncovered',
          note: `You've found ${rareCoins.length} rare coins, including the ${rareCoins[0].title}.`
        });
      }

      const counts: Record<string, number> = {};
      collectedCoins.forEach(c => {
        counts[c.category] = (counts[c.category] || 0) + 1;
      });
      const mostCollected = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (mostCollected) {
        events.push({
          year: 'Specialization',
          event: `The ${mostCollected[0]} Expert`,
          note: `You've collected ${mostCollected[1]} coins of the ${mostCollected[0]} type.`
        });
      }

      const months: Record<string, number> = {};
      collectedCoins.forEach(c => {
        const month = new Date(c.addedAt).toLocaleString('default', { month: 'long', year: 'numeric' });
        months[month] = (months[month] || 0) + 1;
      });
      Object.entries(months).forEach(([month, count]) => {
        events.push({
          year: month,
          event: 'Monthly Progress',
          note: `You added ${count} new coins to your collection this month.`
        });
      });
    }

    return {
      id: 'my-coin-story',
      title: 'My Coin Story',
      description: 'A personalized timeline of your numismatic achievements.',
      category: 'my-story' as any,
      events: events.length > 0 ? events : [{ year: 'Today', event: 'The Beginning', note: 'Start collecting to write your story!' }],
      isDynamic: true
    };
  }, [coins]);

  const allTimelines = useMemo(() => [myCoinStory, ...TIMELINES], [myCoinStory]);

  const getMyStoryStats = () => {
    const collectedCount = coins.filter(c => c.isCollected).length;
    let level = 'Beginner';
    if (collectedCount >= 50) level = 'Expert';
    else if (collectedCount >= 10) level = 'Collector';

    const badges = [];
    if (collectedCount >= 1) badges.push({ id: 'first', icon: '🌱', title: 'First Coin' });
    if (collectedCount >= 10) badges.push({ id: 'collector', icon: '📚', title: 'Collector' });
    if (collectedCount >= 50) badges.push({ id: 'expert', icon: '👑', title: 'Expert' });
    if (coins.some(c => c.isCollected && c.isRare)) badges.push({ id: 'rare', icon: '💎', title: 'Rare Hunter' });
    
    // New Timeline Badges
    const completedTimelines = Object.entries(timelineProgress).filter(([id, progress]) => {
      const t = allTimelines.find(tl => tl.id === id);
      return t && progress >= t.events.length;
    }).length;

    if (completedTimelines >= 1) badges.push({ id: 'explorer', icon: '🧭', title: 'History Explorer' });
    if (completedTimelines >= 3) badges.push({ id: 'master', icon: '🏛️', title: 'Mint Master' });
    if (timelinePoints >= 500) badges.push({ id: 'scholar', icon: '🎓', title: 'Numismatic Scholar' });

    const milestones = [
      { count: 10, title: '10 Coins' },
      { count: 50, title: '50 Coins' },
      { count: 100, title: '100 Coins' }
    ];

    return { level, badges, milestones, collectedCount };
  };

  const isTimelineLocked = (timeline: Timeline) => {
    if (!timeline.unlockRequirement) return false;
    const { type, value } = timeline.unlockRequirement;
    if (type === 'coins') {
      return coins.filter(c => c.isCollected).length < (value as number);
    }
    if (type === 'points') {
      return timelinePoints < (value as number);
    }
    if (type === 'timeline') {
      const requiredTimeline = allTimelines.find(t => t.id === value);
      if (!requiredTimeline) return false;
      const progress = timelineProgress[requiredTimeline.id] || 0;
      return progress < requiredTimeline.events.length;
    }
    return false;
  };

  const TimelineCard = ({ timeline }: { timeline: Timeline, key?: string }) => {
    const locked = isTimelineLocked(timeline);
    
    return (
      <button 
        onClick={() => {
          if (locked) return;
          setActiveTimelineId(timeline.id);
          setLastOpenedTimelineId(timeline.id);
        }}
        className={cn(
          "flex-shrink-0 w-64 p-6 rounded-[32px] text-left transition-all group relative overflow-hidden",
          lastOpenedTimelineId === timeline.id 
            ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20" 
            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-amber-500",
          locked && "opacity-60 grayscale cursor-not-allowed"
        )}
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-black line-clamp-1">{timeline.title}</h3>
            {locked && <ShieldAlert className="w-4 h-4 text-slate-400" />}
          </div>
          <p className={cn(
            "text-xs font-medium line-clamp-2",
            lastOpenedTimelineId === timeline.id ? "text-white/80" : "text-slate-500 dark:text-slate-400"
          )}>
            {locked ? timeline.unlockRequirement?.label : timeline.description}
          </p>
          {(timelineProgress[timeline.id] !== undefined || timeline.id === 'my-coin-story') && !locked ? (
            <div className="mt-4 h-1 w-full bg-black/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all" 
                style={{ 
                  width: timeline.id === 'my-coin-story' 
                    ? `${Math.min((coins.filter(c => c.isCollected).length / 100) * 100, 100)}%`
                    : `${(timelineProgress[timeline.id] / timeline.events.length) * 100}%` 
                }} 
              />
            </div>
          ) : null}
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Clock className="w-24 h-24" />
        </div>
      </button>
    );
  };

  const TimelineSection = ({ title, items }: { title: string, items: Timeline[] }) => (
    <div className="space-y-4">
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 px-6">{title}</h2>
      <div className="flex gap-4 overflow-x-auto px-6 pb-6 no-scrollbar">
        {items.map(t => <TimelineCard key={t.id} timeline={t} />)}
      </div>
    </div>
  );

  const generateRecoveryCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateCoin = (updatedCoin: Coin) => {
    setCoins(prev => prev.map(c => c.id === updatedCoin.id ? updatedCoin : c));
    setEditingCoin(null);
  };
  const [isSafeMode, setIsSafeMode] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize data
  useEffect(() => {
    try {
      const safeModeActive = localStorage.getItem('uk-coin-collection-safe-mode') === 'true';
      setIsSafeMode(safeModeActive);

      let savedData = localStorage.getItem('uk-coin-collection-v2');
      
      if (safeModeActive) {
        // In safe mode, try to load from the last known working state or the manual safe backup
        const lastWorking = localStorage.getItem('uk-coin-collection-last-working');
        const manualSafe = localStorage.getItem('uk-coin-collection-safe');
        savedData = lastWorking || manualSafe || savedData;
      }
      
      if (savedData) {
        let parsed: any = JSON.parse(savedData);
        
        // If version is missing or old, convert it
        if (!parsed.version || parsed.version < 3) {
          const converted = convertData(parsed);
          if (converted) {
            parsed = converted;
            // Save converted data back to storage
            localStorage.setItem('uk-coin-collection-v2', JSON.stringify(converted));
          }
        }

        setCoins(parsed.coins || INITIAL_COINS);
        setFolders(parsed.folders || INITIAL_FOLDERS);
        setRecoveryCode(parsed.recoveryCode || generateRecoveryCode());
        setStreak(parsed.streak || { count: 0, lastVisitDate: '' });
        setMissions(parsed.missions || []);
        setAchievements(parsed.achievements || []);
        setLastLuckySpinDate(parsed.lastLuckySpinDate);
        setTimelineProgress(parsed.timelineProgress || {});
        setTimelinePoints(parsed.timelinePoints || 0);
        setLastOpenedTimelineId(parsed.lastOpenedTimelineId);

        if (parsed.preferences) {
          setPreferences({
            ...parsed.preferences,
            themeMode: parsed.preferences.themeMode || 'system',
            showBottomMenu: parsed.preferences.showBottomMenu ?? true,
            isCompactUI: parsed.preferences.isCompactUI ?? false,
            isTextMode: parsed.preferences.isTextMode ?? false,
            enableBgRemoval: parsed.preferences.enableBgRemoval ?? true,
            isPurchaseMode: parsed.preferences.isPurchaseMode ?? false,
            showPriceInNormalMode: parsed.preferences.showPriceInNormalMode ?? true
          });
        }
      } else {
        // Migration or first load
        const oldData = localStorage.getItem('uk-coin-collection');
        if (oldData) {
          const parsed = JSON.parse(oldData);
          const converted = convertData(parsed);
          if (converted) {
            setCoins(converted.coins);
            setFolders(converted.folders);
            setPreferences(converted.preferences);
            setRecoveryCode(converted.recoveryCode || generateRecoveryCode());
            setStreak(converted.streak);
            setMissions(converted.missions);
            setAchievements(converted.achievements);
            setLastLuckySpinDate(converted.lastLuckySpinDate);
            setTimelineProgress(converted.timelineProgress || {});
            setLastOpenedTimelineId(converted.lastOpenedTimelineId);
          } else {
            setCoins(parsed.coins || INITIAL_COINS);
            setFolders(INITIAL_FOLDERS);
            setRecoveryCode(generateRecoveryCode());
            setTimelineProgress({});
          }
        } else {
          setCoins(INITIAL_COINS);
          setFolders(INITIAL_FOLDERS);
          setRecoveryCode(generateRecoveryCode());
          setTimelineProgress({});
        }
        
        setPreferences(prev => ({ ...prev, themeMode: 'system' }));
      }

      // Online/Offline listeners
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } catch (e) {
      console.error('Initialization error', e);
      setHasError(true);
    }
  }, []);

  // Theme management
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      let isDark = false;
      if (preferences.themeMode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = preferences.themeMode === 'dark';
      }
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      setPreferences(prev => ({ ...prev, isDarkMode: isDark }));
    };

    applyTheme();
    
    if (preferences.themeMode === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [preferences.themeMode]);

  // Save data and update last working state
  useEffect(() => {
    if (coins.length > 0 || folders.length > 0) {
      const state: AppState = {
        version: 3,
        coins,
        folders,
        preferences,
        recoveryCode,
        streak,
        missions,
        achievements,
        lastLuckySpinDate,
        lastOpenedTimelineId,
        timelineProgress,
        timelinePoints,
        lastUpdated: new Date().toISOString()
      };
      const stateStr = JSON.stringify(state);
      localStorage.setItem('uk-coin-collection-v2', stateStr);
      
      // Update last working state if not in safe mode
      if (!isSafeMode) {
        localStorage.setItem('uk-coin-collection-last-working', stateStr);
      }
    }
  }, [coins, folders, preferences, recoveryCode, streak, missions, achievements, lastLuckySpinDate, isSafeMode, lastOpenedTimelineId, timelineProgress, timelinePoints]);

  // Daily Backup Logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastBackupDate = localStorage.getItem('uk-coin-collection-last-backup-date');
    
    if (lastBackupDate !== today && !isSafeMode) {
      const savedData = localStorage.getItem('uk-coin-collection-v2');
      if (savedData) {
        localStorage.setItem(`uk-coin-collection-backup-${today}`, savedData);
        localStorage.setItem('uk-coin-collection-last-backup-date', today);
        // Keep only the most recent daily backup by removing old ones if needed
        // For simplicity, we just store it. In a real app we might prune.
      }
    }
  }, [isSafeMode]);

  // Streak logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (streak.lastVisitDate !== today) {
      const lastDate = streak.lastVisitDate ? new Date(streak.lastVisitDate) : null;
      const todayDate = new Date(today);
      
      let newCount = 1;
      if (lastDate) {
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          newCount = streak.count + 1;
        } else if (diffDays === 0) {
          newCount = streak.count;
        }
      }
      
      setStreak({ count: newCount, lastVisitDate: today });
      if (newCount > streak.count) {
        showToast(`Daily Streak: ${newCount} Days!`, 'info');
      }
    }
  }, []);

  // Mission generation
  useEffect(() => {
    if (missions.length === 0) {
      const initialMissions: Mission[] = [
        { id: 'm1', title: 'Daily Collector', description: 'Add a coin to your collection', points: 50, isCompleted: false, type: 'daily' },
        { id: 'm2', title: 'Folder Explorer', description: 'Open any folder', points: 20, isCompleted: false, type: 'daily' },
        { id: 'm3', title: 'Rare Hunter', description: 'Find a rare coin', points: 200, isCompleted: false, type: 'weekly' }
      ];
      setMissions(initialMissions);
    }
  }, [missions]);

  // Achievement logic
  useEffect(() => {
    const newAchievements: Achievement[] = [...achievements];
    let changed = false;

    const collectedCount = coins.filter(c => c.isCollected).length;
    const rareCount = coins.filter(c => c.isCollected && c.isRare).length;

    if (collectedCount >= 1 && !newAchievements.find(a => a.id === 'first-coin')) {
      newAchievements.push({ id: 'first-coin', title: 'First Coin', description: 'Collected your first coin', icon: '🪙', earnedAt: new Date().toISOString() });
      showToast('Achievement Unlocked: First Coin!', 'success');
      changed = true;
    }
    if (collectedCount >= 10 && !newAchievements.find(a => a.id === 'collector-10')) {
      newAchievements.push({ id: 'collector-10', title: 'Collector X', description: 'Collected 10 coins', icon: '🔟', earnedAt: new Date().toISOString() });
      showToast('Achievement Unlocked: Collector X!', 'success');
      changed = true;
    }
    if (rareCount >= 1 && !newAchievements.find(a => a.id === 'rare-finder')) {
      newAchievements.push({ id: 'rare-finder', title: 'Rare Finder', description: 'Found a rare coin', icon: '💎', earnedAt: new Date().toISOString() });
      showToast('Achievement Unlocked: Rare Finder!', 'success');
      changed = true;
    }
    if (streak.count >= 7 && !newAchievements.find(a => a.id === 'streak-7')) {
      newAchievements.push({ id: 'streak-7', title: 'Week Warrior', description: '7-day login streak', icon: '🔥', earnedAt: new Date().toISOString() });
      showToast('Achievement Unlocked: Week Warrior!', 'success');
      changed = true;
    }

    if (changed) {
      setAchievements(newAchievements);
    }
  }, [coins, streak.count]);

  const toggleCollected = (id: string) => {
    setCoins(prev => prev.map(c => c.id === id ? { ...c, isCollected: !c.isCollected } : c));
  };

  const deleteCoin = (id: string) => {
    if (window.confirm('Remove this coin?')) {
      setCoins(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateCoinTitle = (id: string, newTitle: string) => {
    setCoins(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    setEditingCoinId(null);
  };

  const addFolder = (name: string, icon: string) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      icon,
      lastOpenedAt: new Date().toISOString(),
      addedAt: new Date().toISOString()
    };
    setFolders(prev => [newFolder, ...prev]);
    setIsAddFolderModalOpen(false);
  };

  const deleteFolder = (id: string) => {
    if (window.confirm('Delete this folder? Coins inside will be moved to "Uncategorized".')) {
      setFolders(prev => prev.filter(f => f.id !== id));
      setCoins(prev => prev.map(c => c.folderId === id ? { ...c, folderId: undefined } : c));
      if (preferences.activeFolderId === id) {
        setPreferences(prev => ({ ...prev, activeFolderId: 'all' }));
      }
    }
  };

  const openFolder = (id: string | 'all') => {
    setPreferences(prev => ({ ...prev, activeFolderId: id }));
    if (id !== 'all') {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, lastOpenedAt: new Date().toISOString() } : f));
    }
  };

  const handleLuckySpin = () => {
    const today = new Date().toISOString().split('T')[0];
    if (lastLuckySpinDate === today) {
      showToast('Already spun today!', 'info');
      return;
    }
    
    const rewards = [50, 100, 200, 500];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    const bonusCoin: Coin = {
      id: `bonus-${Date.now()}`,
      title: 'Lucky Spin Reward',
      denomination: 'Bonus',
      year: new Date().getFullYear(),
      summary: `You won ${reward} points from the Lucky Spin!`,
      isCollected: true,
      points: reward / 10,
      addedAt: new Date().toISOString(),
      category: 'Other'
    };
    
    setCoins(prev => [...prev, bonusCoin]);
    setLastLuckySpinDate(today);
    showToast(`Lucky Spin: You won ${reward} points!`, 'success');
  };

  const exportData = () => {
    const state: AppState = { 
      version: 3,
      coins, 
      folders, 
      preferences, 
      recoveryCode, 
      streak, 
      missions, 
      achievements, 
      lastLuckySpinDate,
      lastOpenedTimelineId,
      timelineProgress,
      lastUpdated: new Date().toISOString() 
    };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    a.download = `uk-coins-backup-${dateStr}-${timeStr}.json`;
    a.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportProgress(0);
    const reader = new FileReader();
    
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setImportProgress(progress);
      }
    };

    reader.onload = (e) => {
      setImportProgress(100);
      setTimeout(() => {
        try {
          const rawData = JSON.parse(e.target?.result as string);
          
          // Check if it's the current version
          if (rawData.version === 3 && rawData.coins && Array.isArray(rawData.coins)) {
            const imported: AppState = rawData;
            setCoins(imported.coins);
            if (imported.folders) setFolders(imported.folders);
            if (imported.preferences) setPreferences(imported.preferences);
            if (imported.recoveryCode) setRecoveryCode(imported.recoveryCode);
            if (imported.streak) setStreak(imported.streak);
            if (imported.missions) setMissions(imported.missions);
            if (imported.achievements) setAchievements(imported.achievements);
            if (imported.lastLuckySpinDate) setLastLuckySpinDate(imported.lastLuckySpinDate);
            alert('Data imported successfully!');
          } else {
            // Old data detected
            if (window.confirm('Old data format detected. Would you like to convert it to the new version? A backup of your current data will be saved first.')) {
              // Backup current data
              const currentState: AppState = { 
                version: 3,
                coins, folders, preferences, recoveryCode, streak, missions, achievements, lastLuckySpinDate,
                lastOpenedTimelineId,
                timelineProgress,
                lastUpdated: new Date().toISOString() 
              };
              localStorage.setItem('uk-coin-collection-pre-conversion-backup', JSON.stringify(currentState));

              const converted = convertData(rawData);
              if (converted) {
                setCoins(converted.coins);
                setFolders(converted.folders);
                setPreferences(converted.preferences);
                if (converted.recoveryCode) setRecoveryCode(converted.recoveryCode);
                if (converted.streak) setStreak(converted.streak);
                if (converted.missions) setMissions(converted.missions);
                if (converted.achievements) setAchievements(converted.achievements);
                if (converted.lastLuckySpinDate) setLastLuckySpinDate(converted.lastLuckySpinDate);
                alert('Conversion successful! Your data has been updated to the new format.');
              } else {
                alert('Conversion failed. The file format is not recognized.');
              }
            }
          }
        } catch (err) {
          alert('Invalid JSON file.');
        } finally {
          setImportProgress(null);
          if (event.target) event.target.value = ''; // Reset input
        }
      }, 500);
    };
    
    reader.onerror = () => {
      alert('Error reading file.');
      setImportProgress(null);
    };

    reader.readAsText(file);
  };

  const clearCache = () => {
    if (window.confirm('Clear all data? This cannot be undone.')) {
      localStorage.removeItem('uk-coin-collection-v2');
      localStorage.removeItem('uk-coin-collection');
      localStorage.removeItem('uk-coin-collection-safe');
      localStorage.removeItem('uk-coin-collection-pre-conversion-backup');
      window.location.reload();
    }
  };

  const sortedFolders = useMemo(() => {
    // Default to recently opened for folders
    return [...folders].sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime());
  }, [folders]);

  const filteredCoins = useMemo(() => {
    let result = coins.filter(coin => {
      const matchesSearch = coin.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           coin.denomination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' ? true : 
                           filter === 'collected' ? coin.isCollected : !coin.isCollected;
      
      let matchesFolder = preferences.activeFolderId === 'all' ? true : coin.folderId === preferences.activeFolderId;
      
      // Smart Folder: Coins Purchased
      if (preferences.activeFolderId === 'folder-purchased') {
        matchesFolder = (coin.amountPaid || 0) > 0;
      }
      
      return matchesSearch && matchesFilter && matchesFolder;
    });

    // Default to recently added for coins
    if (preferences.sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    }

    return result;
  }, [coins, searchQuery, filter, preferences.activeFolderId, preferences.sortBy]);

  const stats = useMemo(() => {
    const total = coins.length;
    const collected = coins.filter(c => c.isCollected).length;
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    const totalSpent = coins.reduce((acc, c) => acc + (c.amountPaid || 0), 0);
    const totalPoints = coins.reduce((acc, c) => {
      if (!c.isCollected) return acc;
      const basePoints = c.points || 10;
      const rarityMultiplier = c.isRare ? 5 : 1;
      return acc + (basePoints * rarityMultiplier);
    }, 0);

    const levels = [
      { name: 'Beginner', min: 0, max: 500 },
      { name: 'Collector', min: 501, max: 2000 },
      { name: 'Specialist', min: 2001, max: 5000 },
      { name: 'Expert', min: 5001, max: 15000 },
      { name: 'Master', min: 15001, max: Infinity }
    ];

    const currentLevel = levels.find(l => totalPoints >= l.min && totalPoints <= l.max) || levels[0];
    const nextLevel = levels[levels.indexOf(currentLevel) + 1];
    const progressToNext = nextLevel 
      ? Math.min(100, Math.round(((totalPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100))
      : 100;

    return { total, collected, percentage, totalSpent, totalPoints, currentLevel, nextLevel, progressToNext };
  }, [coins]);

  const monthlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    coins.forEach(coin => {
      if (coin.amountPaid && coin.purchaseDate) {
        const date = new Date(coin.purchaseDate);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        totals[monthYear] = (totals[monthYear] || 0) + coin.amountPaid;
      }
    });
    return Object.entries(totals).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateB.getTime() - dateA.getTime();
    });
  }, [coins]);

  const [newCoinImage, setNewCoinImage] = useState<string | null>(null);
  const coinImageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCoinImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const exitSafeMode = () => {
    localStorage.removeItem('uk-coin-collection-safe-mode');
    window.location.reload();
  };

  if (isSafeMode) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-6 flex flex-col items-center">
        <div className="max-w-2xl w-full space-y-8">
          {/* Safe Mode Header */}
          <div className="bg-amber-500 text-white p-6 rounded-[32px] shadow-xl shadow-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">Safe Mode Active</h1>
                <p className="text-xs font-bold text-white/80 uppercase tracking-widest">Minimal Recovery Version</p>
              </div>
            </div>
            <button 
              onClick={exitSafeMode}
              className="px-6 py-3 bg-white text-amber-600 font-black rounded-2xl shadow-lg hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
            >
              Exit Safe Mode
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Your Collection</h2>
              <button 
                onClick={exportData}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl shadow-lg transition-all uppercase tracking-widest text-xs"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>

            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              You are in Safe Mode because the app encountered a problem. Your coin data is preserved. You can view your coins and export them for safety.
            </p>

            <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {coins.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest text-sm">No coins found</div>
              ) : (
                coins.map(coin => (
                  <div key={coin.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {coin.image ? (
                        <img src={coin.image} alt={coin.title} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-sm">{coin.title}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{coin.denomination} • {coin.year}</p>
                      </div>
                    </div>
                    {coin.isCollected && (
                      <div className="w-8 h-8 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              UK Coin Collector Recovery System v1.0
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-center">App Error</h1>
        <p className="mb-6 text-center max-w-md">The app encountered an error. Export your data to keep it safe.</p>
        <button onClick={exportData} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full shadow-lg">
          <Download className="w-5 h-5" /> Export Data
        </button>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm underline opacity-70">Reload App</button>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans pb-24",
      "safe-top safe-bottom" // Custom classes for iOS safe areas
    )}>
        {/* Offline Banner */}
        <AnimatePresence>
          {isOffline && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-500 text-white text-center py-2 text-xs font-bold flex items-center justify-center gap-2"
            >
              <WifiOff className="w-3 h-3" />
              Offline Mode - Changes saved locally
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-white font-bold text-xl">£</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">UK Coin Collector</h1>
            </div>

            <div className="flex items-center gap-2">
              {!preferences.isPurchaseMode && (
                <>
                  <button 
                    onClick={() => setIsPhotoLibraryOpen(true)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Photo Library"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Profile"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </>
              )}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          {preferences.isPurchaseMode ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Purchase Mode</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senior-Friendly View</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreferences(prev => ({ ...prev, isPurchaseMode: false }))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs uppercase tracking-widest"
                >
                  Exit
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all shadow-sm text-xl font-bold"
                />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-5 text-lg font-black uppercase tracking-widest text-slate-400">Coin</th>
                      <th className="px-6 py-5 text-lg font-black uppercase tracking-widest text-slate-400">Year</th>
                      <th className="px-6 py-5 text-lg font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoins.map((coin) => (
                      <tr 
                        key={coin.id} 
                        onClick={() => setSelectedCoin(coin)}
                        className={cn(
                          "border-b border-slate-100 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors",
                          !coin.isCollected && "bg-amber-50/30 dark:bg-amber-900/5"
                        )}
                      >
                        <td className="px-6 py-6">
                          <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">{coin.denomination}</span>
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{coin.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-2xl font-black text-slate-700 dark:text-slate-300">{coin.year}</span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex justify-end">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleCollected(coin.id); }}
                              className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all active:scale-95",
                                coin.isCollected 
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                  : "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                              )}
                            >
                              {coin.isCollected ? (
                                <>
                                  <CheckCircle2 className="w-5 h-5" />
                                  <span>Owned</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-5 h-5" />
                                  <span>Need</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCoins.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                          No coins found matching filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : isTimelineOpen ? (
            <div className="pb-32">
              <div className="px-6 pt-8 mb-8 flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black tracking-tight">Timeline Hub</h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Explore the history of British numismatics.</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-black text-amber-700 dark:text-amber-400">{timelinePoints} <span className="text-[10px] uppercase opacity-60">XP</span></span>
                  </div>
                  {streak.timelineStreak && streak.timelineStreak > 0 && (
                    <div className="mt-2 flex items-center gap-1 justify-end text-orange-500">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{streak.timelineStreak} Day Streak</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-10">
                {allTimelines.filter(t => timelineProgress[t.id] !== undefined && timelineProgress[t.id] < t.events.length).length > 0 && (
                  <TimelineSection 
                    title="Continue Exploring" 
                    items={allTimelines.filter(t => timelineProgress[t.id] !== undefined && timelineProgress[t.id] < t.events.length)} 
                  />
                )}
                <TimelineSection title="Popular Timelines" items={allTimelines.slice(0, 3)} />
                <TimelineSection title="All Timelines" items={allTimelines} />
              </div>
            </div>
          ) : (
            <>
              {/* Progress Card */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h2 className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Collection Progress</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black">{stats.collected} / {stats.total} <span className="text-sm font-normal text-slate-400">Coins</span></p>
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-widest">
                      {stats.currentLevel.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-black text-amber-500">{stats.percentage}%</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                    <Trophy className="w-3 h-3" />
                    <span>{stats.totalPoints} pts</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentage}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                />
              </div>
            </div>
          </div>

          {/* Folders Horizontal Scroll */}
          <div className="mb-8 overflow-x-auto pb-4 no-scrollbar">
            <div className="flex gap-4 min-w-max">
              <button
                onClick={() => openFolder('all')}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all min-w-[100px]",
                  preferences.activeFolderId === 'all'
                    ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="text-2xl"><LayoutGrid className="w-6 h-6" /></div>
                <span className="text-xs font-bold uppercase tracking-wider">All Coins</span>
              </button>

              {sortedFolders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => openFolder(folder.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    deleteFolder(folder.id);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all min-w-[100px] relative group",
                    preferences.activeFolderId === folder.id
                      ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  )}
                >
                  <div className="text-2xl">{folder.icon}</div>
                  <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[80px]">{folder.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </button>
              ))}

              <button
                onClick={() => setIsAddFolderModalOpen(true)}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all min-w-[100px]"
              >
                <Plus className="w-6 h-6" />
                <span className="text-xs font-bold uppercase tracking-wider">New Folder</span>
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-4 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search your collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm text-lg"
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'collected', 'missing'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-sm font-bold transition-all capitalize border",
                    filter === f 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg" 
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Coin Grid */}
          <div className={cn(
            "grid gap-6",
            preferences.isCompactUI 
              ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" 
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
            preferences.isTextMode && "grid-cols-1 gap-0"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredCoins.map((coin) => (
                <motion.div
                  key={coin.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedCoin(coin)}
                  className={cn(
                    "group relative bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer",
                    coin.isRare 
                      ? "border-amber-500/50 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/10" 
                      : coin.isCollected 
                        ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                        : "border-slate-200 dark:border-slate-800 hover:border-amber-500/50",
                    preferences.isCompactUI && "rounded-2xl",
                    preferences.isTextMode && "rounded-none border-0 border-b border-slate-100 dark:border-slate-800 p-4 bg-transparent dark:bg-transparent"
                  )}
                >
                  {preferences.isTextMode ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{coin.denomination}</span>
                          <span className="text-[10px] font-bold text-slate-400">{coin.year}</span>
                          {coin.isRare && <Trophy className="w-3 h-3 text-amber-500" />}
                        </div>
                        <h3 className="font-bold text-sm">{coin.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{coin.summary}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {coin.amountPaid !== undefined && preferences.showPriceInNormalMode && (
                          <span className="text-xs font-bold text-emerald-600">£{coin.amountPaid.toFixed(2)}</span>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleCollected(coin.id); }}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            coin.isCollected ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          )}
                        >
                          {coin.isCollected ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {coin.isRare && (
                        <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white p-1.5 rounded-xl shadow-lg shadow-amber-500/30">
                          <Trophy className="w-4 h-4" />
                        </div>
                      )}
                      {coins.filter(c => c.title === coin.title && c.denomination === coin.denomination).length > 1 && (
                        <div className="absolute top-3 right-14 z-10 bg-blue-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                          x{coins.filter(c => c.title === coin.title && c.denomination === coin.denomination).length}
                        </div>
                      )}
                      {coin.imageUrl && (
                        <div className={cn(
                          "w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative",
                          preferences.isCompactUI ? "h-32" : "h-48"
                        )}>
                          <img 
                            src={coin.imageUrl} 
                            alt={coin.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest">{coin.denomination}</span>
                          </div>
                        </div>
                      )}
                      <div className={cn(
                        "flex-1 flex flex-col",
                        preferences.isCompactUI ? "p-4" : "p-6"
                      )}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col flex-1 mr-2">
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">
                              {coin.denomination} • {coin.year}
                            </span>
                            <h3 className={cn(
                              "font-bold flex items-center gap-2 leading-tight",
                              preferences.isCompactUI ? "text-sm" : "text-lg"
                            )}>
                              {coin.title}
                              {coin.isRare && <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                            </h3>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleCollected(coin.id); }}
                            className={cn(
                              "rounded-2xl flex items-center justify-center transition-all shrink-0",
                              preferences.isCompactUI ? "w-8 h-8 rounded-xl" : "w-12 h-12 rounded-2xl",
                              coin.isCollected 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500"
                            )}
                          >
                            {coin.isCollected 
                              ? <CheckCircle2 className={preferences.isCompactUI ? "w-5 h-5" : "w-7 h-7"} /> 
                              : <Circle className={preferences.isCompactUI ? "w-5 h-5" : "w-7 h-7"} />
                            }
                          </button>
                        </div>

                        {!preferences.isCompactUI && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 italic leading-relaxed">
                            {coin.summary}
                          </p>
                        )}

                        {coin.amountPaid !== undefined && !preferences.isCompactUI && preferences.showPriceInNormalMode && (
                          <div className="flex items-center gap-4 mb-6 text-xs font-bold">
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <PoundSterling className="w-3.5 h-3.5" />
                              <span>{coin.amountPaid.toFixed(2)}</span>
                            </div>
                            {coin.purchaseDate && (
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(coin.purchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cn(
                          "mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800",
                          preferences.isCompactUI ? "pt-2" : "pt-4"
                        )}>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                              coin.isCollected 
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {coin.isCollected ? 'Collected' : 'Missing'}
                            </span>
                            {coin.folderId && !preferences.isCompactUI && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                {folders.find(f => f.id === coin.folderId)?.name || 'Folder'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingCoin(coin); }}
                              className="p-2 text-slate-300 hover:text-amber-500 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteCoin(coin.id); }}
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredCoins.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Search className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-xl font-bold">No coins found</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilter('all'); openFolder('all'); }}
                className="mt-4 text-amber-500 font-bold hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
            </>
          )}
        </main>

        {/* Bottom Navigation */}
        {preferences.showBottomMenu && !preferences.isPurchaseMode && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
            <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
              <button 
                onClick={() => {
                  openFolder('all');
                  setIsTimelineOpen(false);
                  setIsPhotoLibraryOpen(false);
                  setIsProfileOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  preferences.activeFolderId === 'all' && !isTimelineOpen && !isPhotoLibraryOpen && !isProfileOpen ? "text-amber-500" : "text-slate-400"
                )}
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
              </button>
              <button 
                onClick={() => {
                  setIsTimelineOpen(true);
                  setIsPhotoLibraryOpen(false);
                  setIsProfileOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isTimelineOpen ? "text-amber-500" : "text-slate-400"
                )}
              >
                <Clock className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Timeline</span>
              </button>
              <button 
                onClick={() => {
                  setIsPhotoLibraryOpen(true);
                  setIsTimelineOpen(false);
                  setIsProfileOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isPhotoLibraryOpen ? "text-amber-500" : "text-slate-400"
                )}
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Photos</span>
              </button>
              <div className="relative -top-8">
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-14 h-14 bg-amber-500 text-white rounded-full shadow-xl shadow-amber-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                >
                  <Plus className="w-8 h-8" />
                </button>
              </div>
              <button 
                onClick={() => setIsProfileOpen(true)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isProfileOpen ? "text-amber-500" : "text-slate-400"
                )}
              >
                <User className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isSettingsOpen ? "text-amber-500" : "text-slate-400"
                )}
              >
                <Settings className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
              </button>
            </div>
          </nav>
        )}

        {/* Floating Add Button (Fallback if bottom menu is disabled) */}
        {!preferences.showBottomMenu && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-amber-500 text-white rounded-full shadow-2xl shadow-amber-500/40 flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>
        )}

        {/* Settings Bottom Sheet */}
        <AnimatePresence>
          {isSettingsOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSettingsOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px]"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[40px] shadow-2xl p-8 pb-12 max-h-[90vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black">Settings</h2>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {importProgress !== null && (
                    <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Importing Data...</span>
                        <span className="text-xs font-black text-blue-600">{importProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-blue-100 dark:bg-blue-900/30 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${importProgress}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Display Settings */}
                  <SettingSection 
                    title="Display" 
                    icon={Monitor} 
                    isOpen={openSettingSection === 'display'} 
                    onToggle={() => setOpenSettingSection(openSettingSection === 'display' ? null : 'display')}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2 mb-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Theme Mode</label>
                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          {(['light', 'dark', 'system'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setPreferences(prev => ({ ...prev, themeMode: mode }))}
                              className={cn(
                                "flex flex-col items-center gap-1 py-3 rounded-xl transition-all",
                                preferences.themeMode === mode 
                                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                            >
                              {mode === 'light' && <Sun className="w-4 h-4" />}
                              {mode === 'dark' && <Moon className="w-4 h-4" />}
                              {mode === 'system' && <Monitor className="w-4 h-4" />}
                              <span className="text-[10px] font-black uppercase tracking-widest">{mode}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <LayoutGrid className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold">Compact UI</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Smaller cards, more grid</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, isCompactUI: !prev.isCompactUI }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            preferences.isCompactUI ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <motion.div 
                            animate={{ x: preferences.isCompactUI ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold">Text Mode UI</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Simple list layout</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, isTextMode: !prev.isTextMode }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            preferences.isTextMode ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <motion.div 
                            animate={{ x: preferences.isTextMode ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <LayoutList className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold">Bottom Menu</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Show navigation bar</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, showBottomMenu: !prev.showBottomMenu }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            preferences.showBottomMenu ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <motion.div 
                            animate={{ x: preferences.showBottomMenu ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold">Show Prices</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Display in normal mode</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, showPriceInNormalMode: !prev.showPriceInNormalMode }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            preferences.showPriceInNormalMode ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <motion.div 
                            animate={{ x: preferences.showPriceInNormalMode ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold">BG Removal</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Auto image processing</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, enableBgRemoval: !prev.enableBgRemoval }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            preferences.enableBgRemoval ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <motion.div 
                            animate={{ x: preferences.enableBgRemoval ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>
                    </div>
                  </SettingSection>

                  {/* Import/Export Settings */}
                  <SettingSection 
                    title="Import/Export" 
                    icon={Download} 
                    isOpen={openSettingSection === 'data'} 
                    onToggle={() => setOpenSettingSection(openSettingSection === 'data' ? null : 'data')}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={exportData}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-amber-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                          <Download className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">Export Data</span>
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-blue-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold">Import Data</span>
                        <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-purple-50 transition-colors col-span-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                            <RefreshCw className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold">Convert Old Data</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Migrate from legacy formats</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </SettingSection>

                  {/* Coin Management Settings */}
                  <SettingSection 
                    title="Coin Management" 
                    icon={Database} 
                    isOpen={openSettingSection === 'management'} 
                    onToggle={() => setOpenSettingSection(openSettingSection === 'management' ? null : 'management')}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-sm font-bold">Purchase Mode</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Optimized for shop use</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setPreferences(prev => ({ ...prev, isPurchaseMode: !prev.isPurchaseMode }))}
                          className={cn(
                            "w-12 h-6 rounded-full transition-colors relative",
                            preferences.isPurchaseMode ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                          <motion.div 
                            animate={{ x: preferences.isPurchaseMode ? 24 : 4 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sort Collection By</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          {(['recently-added', 'title'] as const).map((sort) => (
                            <button
                              key={sort}
                              onClick={() => setPreferences(prev => ({ ...prev, sortBy: sort }))}
                              className={cn(
                                "flex items-center justify-center gap-2 py-3 rounded-xl transition-all",
                                preferences.sortBy === sort 
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                                  : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                            >
                              <ArrowUpDown className="w-3 h-3" />
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {sort === 'recently-added' ? 'Recent' : 'Title'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => window.location.reload()}
                          className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-emerald-50 transition-colors"
                        >
                          <RefreshCw className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-bold">Refresh</span>
                        </button>
                        <button 
                          onClick={clearCache}
                          className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-red-500" />
                          <span className="text-xs font-bold text-red-500">Clear</span>
                        </button>
                      </div>
                    </div>
                  </SettingSection>

                  {/* Gamification Settings */}
                  <SettingSection 
                    title="Gamification" 
                    icon={Trophy} 
                    isOpen={openSettingSection === 'gamification'} 
                    onToggle={() => setOpenSettingSection(openSettingSection === 'gamification' ? null : 'gamification')}
                  >
                    <div className="space-y-3">
                      <button 
                        onClick={handleLuckySpin}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                            <RotateCcw className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold">Lucky Spin</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Win daily bonus points</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Streak</p>
                          <p className="text-2xl font-black text-amber-500">{streak.count} Days</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Points</p>
                          <p className="text-2xl font-black text-emerald-500">{stats.totalPoints}</p>
                        </div>
                      </div>
                    </div>
                  </SettingSection>

                  {/* Backup Settings */}
                  <SettingSection 
                    title="Backup" 
                    icon={ShieldAlert} 
                    isOpen={openSettingSection === 'backup'} 
                    onToggle={() => setOpenSettingSection(openSettingSection === 'backup' ? null : 'backup')}
                  >
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Recovery Code</p>
                        <p className="text-lg font-mono font-black tracking-wider text-amber-600 select-all">{recoveryCode}</p>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Save this code to restore your data on another device.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            const state: AppState = { 
                              version: 3,
                              coins, 
                              folders, 
                              preferences, 
                              recoveryCode, 
                              streak, 
                              missions, 
                              achievements, 
                              lastLuckySpinDate,
                              lastOpenedTimelineId,
                              timelineProgress,
                              lastUpdated: new Date().toISOString() 
                            };
                            localStorage.setItem('uk-coin-collection-safe', JSON.stringify(state));
                            showToast('Safe version saved locally!');
                          }}
                          className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-emerald-50 transition-colors"
                        >
                          <Save className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-bold">Save Safe</span>
                        </button>
                        <button 
                          onClick={() => {
                            const safeData = localStorage.getItem('uk-coin-collection-safe');
                            if (safeData && window.confirm('Restore to the last safe version? Current changes will be lost.')) {
                              const parsed: AppState = JSON.parse(safeData);
                              setCoins(parsed.coins);
                              setFolders(parsed.folders);
                              setPreferences(parsed.preferences);
                              if (parsed.recoveryCode) setRecoveryCode(parsed.recoveryCode);
                              if (parsed.streak) setStreak(parsed.streak);
                              if (parsed.missions) setMissions(parsed.missions);
                              if (parsed.achievements) setAchievements(parsed.achievements);
                              if (parsed.lastLuckySpinDate) setLastLuckySpinDate(parsed.lastLuckySpinDate);
                              showToast('Safe version restored!');
                            } else if (!safeData) {
                              alert('No safe version found.');
                            }
                          }}
                          className="flex flex-col items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-amber-50 transition-colors"
                        >
                          <RotateCcw className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-bold">Restore Safe</span>
                        </button>
                      </div>
                    </div>
                  </SettingSection>

                  <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 mt-4">
                    <h3 className="text-sm font-bold text-amber-600 mb-2">Standalone App</h3>
                    <p className="text-xs text-amber-700 leading-relaxed mb-4">
                      Add this app to your home screen for a full-screen, offline-capable experience. 
                      Tap the share icon and select "Add to Home Screen".
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-amber-600">
                      <CheckCircle2 className="w-3 h-3" /> Works Offline
                      <CheckCircle2 className="w-3 h-3" /> No Browser UI
                      <CheckCircle2 className="w-3 h-3" /> Fast Launch
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Timeline Detail Modal */}
        <AnimatePresence>
          {activeTimelineId && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 overflow-y-auto"
            >
              {(() => {
                const timeline = allTimelines.find(t => t.id === activeTimelineId);
                if (!timeline) return null;
                const progress = timeline.id === 'my-coin-story' ? timeline.events.length : (timelineProgress[timeline.id] || 0);
                const stats = getMyStoryStats();
                
                return (
                  <div className="max-w-2xl mx-auto p-8 pb-32">
                    <div className="flex justify-between items-center mb-10">
                      <button onClick={() => setActiveTimelineId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-6 h-6" />
                      </button>
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {timeline.id === 'my-coin-story' 
                          ? `${Math.min((stats.collectedCount / 100) * 100, 100)}% Collection Progress`
                          : `${Math.round((progress / timeline.events.length) * 100)}% Complete`
                        }
                      </div>
                    </div>

                    <div className="mb-12">
                      <h1 className="text-4xl font-black mb-4">{timeline.title}</h1>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{timeline.description}</p>
                    </div>

                    {timeline.id === 'my-coin-story' && (
                      <div className="mb-12 p-6 bg-amber-50 dark:bg-amber-900/20 rounded-[32px] border border-amber-100 dark:border-amber-800/50">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Current Level</span>
                            <h2 className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.level}</h2>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Coins Collected</span>
                            <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{stats.collectedCount}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Badges Earned</span>
                          <div className="flex flex-wrap gap-3">
                            {stats.badges.length > 0 ? stats.badges.map(badge => (
                              <div key={badge.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800/30">
                                <span className="text-xl">{badge.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-tight">{badge.title}</span>
                              </div>
                            )) : (
                              <p className="text-xs text-slate-400 font-bold italic">No badges yet. Keep collecting!</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-8 space-y-4">
                          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Next Milestones</span>
                          <div className="grid grid-cols-3 gap-2">
                            {stats.milestones.map(m => (
                              <div key={m.count} className={cn(
                                "p-3 rounded-xl border text-center transition-all",
                                stats.collectedCount >= m.count 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                              )}>
                                <p className="text-xs font-black">{m.title}</p>
                                {stats.collectedCount >= m.count && <Check className="w-3 h-3 mx-auto mt-1" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-12 relative">
                      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800" />
                      {timeline.events.map((event, idx) => (
                        <div 
                          key={idx} 
                          className={cn(
                            "relative pl-12 transition-all cursor-pointer group",
                            timeline.id !== 'my-coin-story' && idx >= progress ? "opacity-30 hover:opacity-60" : "opacity-100"
                          )}
                          onClick={() => {
                            if (timeline.id === 'my-coin-story') {
                              setExpandedEventIdx(expandedEventIdx === idx ? null : idx);
                            } else {
                              const newProgress = idx + 1;
                              const currentProgress = timelineProgress[timeline.id] || 0;
                              
                              if (newProgress > currentProgress) {
                                // Award points for new discovery
                                setTimelinePoints(prev => prev + 10);
                                setTimelineProgress(prev => ({ ...prev, [timeline.id]: newProgress }));
                                
                                // Update streak
                                const today = new Date().toDateString();
                                if (streak.lastTimelineVisitDate !== today) {
                                  setStreak(prev => ({
                                    ...prev,
                                    timelineStreak: (prev.timelineStreak || 0) + 1,
                                    lastTimelineVisitDate: today
                                  }));
                                }
                              }
                              setExpandedEventIdx(expandedEventIdx === idx ? null : idx);
                            }
                          }}
                        >
                          <div className={cn(
                            "absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 transition-colors",
                            (timeline.id === 'my-coin-story' || idx < progress) ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200"
                          )}>
                            {(timeline.id === 'my-coin-story' || idx < progress) ? <Check className="w-5 h-5" /> : <div className="w-2 h-2 bg-current rounded-full" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-amber-500 uppercase tracking-widest">{event.year}</span>
                              {idx < progress && timeline.id !== 'my-coin-story' && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[8px] font-black rounded uppercase tracking-widest">Discovered</span>
                              )}
                            </div>
                            <h3 className="text-xl font-black mt-1">{event.event}</h3>
                            <AnimatePresence>
                              {(expandedEventIdx === idx) && (
                                <motion.p 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed overflow-hidden"
                                >
                                  {event.note}
                                </motion.p>
                              )}
                            </AnimatePresence>
                            {expandedEventIdx !== idx && (
                              <p className="text-slate-400 mt-1 text-xs font-bold uppercase tracking-widest">Tap to explore details...</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent">
                      <button 
                        onClick={() => setActiveTimelineId(null)}
                        className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl shadow-xl uppercase tracking-widest"
                      >
                        Back to Hub
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Folder Modal */}
        <AnimatePresence>
          {isAddFolderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddFolderModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">New Folder</h2>
                    <button onClick={() => setIsAddFolderModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addFolder(formData.get('name') as string, formData.get('icon') as string);
                  }} className="space-y-6">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Folder Name</label>
                      <input name="name" required placeholder="e.g. My Rare Coins" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Emoji Icon</label>
                      <input name="icon" required placeholder="e.g. 💎" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold text-2xl text-center" />
                    </div>
                    <button type="submit" className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-500/30 transition-all uppercase tracking-widest">
                      Create Folder
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Coin Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">Add New Coin</h2>
                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const amountPaid = formData.get('amountPaid') ? parseFloat(formData.get('amountPaid') as string) : undefined;
                      const purchaseDate = formData.get('purchaseDate') as string || undefined;
                      
                      const newCoin: Coin = {
                        id: `custom-${Date.now()}`,
                        title: formData.get('title') as string,
                        denomination: formData.get('denomination') as string,
                        year: parseInt(formData.get('year') as string),
                        summary: formData.get('summary') as string,
                        isCollected: !!amountPaid || false,
                        isRare: formData.get('isRare') === 'on',
                        category: 'Other',
                        folderId: formData.get('folderId') as string || undefined,
                        addedAt: new Date().toISOString(),
                        imageUrl: newCoinImage || undefined,
                        amountPaid,
                        purchaseDate
                      };
                      setCoins(prev => [newCoin, ...prev]);
                      setIsAddModalOpen(false);
                      setNewCoinImage(null);
                      showToast('Coin added to collection!');
                    }} className="space-y-5">
                      <div className="flex justify-center mb-6">
                        <button 
                          type="button"
                          onClick={() => coinImageInputRef.current?.click()}
                          className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 overflow-hidden group hover:border-amber-500 transition-all"
                        >
                          {newCoinImage ? (
                            <img src={newCoinImage} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-slate-400 group-hover:text-amber-500" />
                              <span className="text-[10px] font-black text-slate-400 uppercase">Add Photo</span>
                            </>
                          )}
                        </button>
                        <input type="file" ref={coinImageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Coin Title</label>
                        <input name="title" required placeholder="e.g. Peter Rabbit" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Denomination</label>
                          <input name="denomination" required placeholder="e.g. 50p" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Year</label>
                          <input name="year" type="number" required placeholder="e.g. 2023" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount Paid (£)</label>
                          <input name="amountPaid" type="number" step="0.01" placeholder="0.00" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Purchase Date</label>
                          <input name="purchaseDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <input type="checkbox" name="isRare" id="isRare" className="w-5 h-5 accent-amber-500 rounded" />
                        <label htmlFor="isRare" className="text-sm font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Mark as Rare Coin (5x Points)
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Folder</label>
                        <select name="folderId" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold appearance-none">
                          <option value="">No Folder</option>
                          {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.icon} {f.name}</option>
                          ))}
                        </select>
                      </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Summary (2 sentences)</label>
                      <textarea name="summary" required rows={3} placeholder="A brief description..." className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none resize-none font-medium text-sm" />
                    </div>
                    <button type="submit" className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-500/30 transition-all mt-4 uppercase tracking-widest">
                      Add to Collection
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        <AnimatePresence>
          {isProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsProfileOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">My Profile</h2>
                    <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-black">Local Collector</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Device Profile</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                          <span className="text-amber-600 text-xs font-black uppercase tracking-widest">🔥 {streak.count} Day Streak</span>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Rank</p>
                            <h4 className="text-2xl font-black text-amber-500">{stats.currentLevel.name}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Points</p>
                            <p className="text-xl font-black">{stats.totalPoints} pts</p>
                          </div>
                        </div>
                        
                        {stats.nextLevel && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-400">Next: {stats.nextLevel.name}</span>
                              <span className="text-amber-500">{stats.progressToNext}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.progressToNext}%` }}
                                className="h-full bg-amber-500"
                              />
                            </div>
                            <p className="text-[9px] text-slate-400 text-center font-bold">
                              {stats.nextLevel.min - stats.totalPoints} more points to level up
                            </p>
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={handleLuckySpin}
                        disabled={lastLuckySpinDate === new Date().toISOString().split('T')[0]}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          lastLuckySpinDate === new Date().toISOString().split('T')[0]
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95"
                        )}
                      >
                        <RefreshCw className={cn("w-5 h-5", lastLuckySpinDate !== new Date().toISOString().split('T')[0] && "animate-spin-slow")} />
                        {lastLuckySpinDate === new Date().toISOString().split('T')[0] ? "Lucky Spin Claimed" : "Daily Lucky Spin"}
                      </button>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Active Missions</h4>
                        <div className="space-y-2">
                          {missions.map(mission => (
                            <div key={mission.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold">{mission.title}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{mission.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-amber-500">+{mission.points} pts</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{mission.type}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-2">Achievements</h4>
                        <div className="grid grid-cols-4 gap-3">
                          {achievements.map(achievement => (
                            <div key={achievement.id} className="flex flex-col items-center gap-1">
                              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl border border-amber-500/20">
                                {achievement.icon}
                              </div>
                              <span className="text-[8px] font-black text-center uppercase tracking-tighter text-slate-500">{achievement.title}</span>
                            </div>
                          ))}
                          {achievements.length === 0 && (
                            <div className="col-span-4 py-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              No achievements yet
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                      <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                        {stats.currentLevel.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stats.currentLevel.name}</p>
                        <h3 className="text-xl font-black">Local Collector</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Spent</p>
                        <p className="text-2xl font-black text-emerald-600">£{stats.totalSpent.toFixed(2)}</p>
                      </div>
                      <div className="p-6 bg-amber-500/10 rounded-3xl border border-amber-500/20">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Collected</p>
                        <p className="text-2xl font-black text-amber-600">{stats.collected} <span className="text-xs">coins</span></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Recovery Code</h4>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(recoveryCode);
                            showToast('Recovery code copied!');
                          }}
                          className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:underline"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                        <code className="text-lg font-mono font-black tracking-wider text-slate-700 dark:text-slate-300">
                          {recoveryCode}
                        </code>
                      </div>
                      <p className="text-[9px] text-slate-400 mt-3 font-bold text-center">
                        Keep this code safe. It can be used to recover your collection on another device.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Monthly Spending</h4>
                      <div className="space-y-3">
                        {monthlyTotals.map(([month, total]) => (
                          <div key={month} className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-500">{month}</span>
                            <span className="text-sm font-black">£{total.toFixed(2)}</span>
                          </div>
                        ))}
                        {monthlyTotals.length === 0 && <p className="text-xs text-slate-400 italic">No purchase history yet.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Photo Library Modal */}
        <AnimatePresence>
          {isPhotoLibraryOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPhotoLibraryOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="text-2xl font-black">Photo Library</h2>
                  <button onClick={() => setIsPhotoLibraryOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-8 overflow-y-auto flex-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {coins.filter(c => c.imageUrl).map(coin => (
                      <div 
                        key={coin.id} 
                        onClick={() => { setSelectedCoin(coin); setIsPhotoLibraryOpen(false); }}
                        className={cn(
                          "aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer group relative",
                          coin.isRare && "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900"
                        )}
                      >
                        {coin.isRare && (
                          <div className="absolute top-2 left-2 z-10 bg-amber-500 text-white p-1 rounded-lg shadow-lg">
                            <Trophy className="w-3 h-3" />
                          </div>
                        )}
                        <img src={coin.imageUrl} alt={coin.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                          <span className="text-white text-[10px] font-bold uppercase tracking-widest">{coin.title}</span>
                        </div>
                      </div>
                    ))}
                    {coins.filter(c => c.imageUrl).length === 0 && (
                      <div className="col-span-full py-20 text-center text-slate-400">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-bold">No photos in your library yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Coin Detail Modal */}
        <AnimatePresence>
          {selectedCoin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCoin(null)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
              >
                {selectedCoin.imageUrl && (
                  <div className="h-64 w-full relative">
                    <img src={selectedCoin.imageUrl} alt={selectedCoin.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button 
                      onClick={() => setSelectedCoin(null)}
                      className="absolute top-6 right-6 p-2 bg-black/20 backdrop-blur-md text-white rounded-full hover:bg-black/40 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-6 left-8 right-8">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber-400 text-xs font-black uppercase tracking-[0.2em]">
                          {selectedCoin.denomination} • {selectedCoin.year}
                        </span>
                        {selectedCoin.isRare && (
                          <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                            <Trophy className="w-2 h-2" /> Rare
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl font-black text-white">{selectedCoin.title}</h2>
                    </div>
                  </div>
                )}
                <div className="p-8">
                  {!selectedCoin.imageUrl && (
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-500 text-xs font-black uppercase tracking-[0.2em]">
                            {selectedCoin.denomination} • {selectedCoin.year}
                          </span>
                          {selectedCoin.isRare && (
                            <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-1">
                              <Trophy className="w-2 h-2" /> Rare
                            </span>
                          )}
                        </div>
                        <h2 className="text-3xl font-black">{selectedCoin.title}</h2>
                      </div>
                      <button onClick={() => setSelectedCoin(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                        selectedCoin.isCollected 
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {selectedCoin.isCollected ? 'Collected' : 'Missing'}
                      </div>
                      <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 text-xs font-black uppercase tracking-widest">
                        <Trophy className="w-3.5 h-3.5" />
                        <span>{selectedCoin.isCollected ? (selectedCoin.points || 10) : 0} Points</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Summary</h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {selectedCoin.summary}
                      </p>
                    </div>

                    {coins.filter(c => c.title === selectedCoin.title && c.denomination === selectedCoin.denomination).length > 1 && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duplicate History</h4>
                        <div className="space-y-2">
                          {coins
                            .filter(c => c.title === selectedCoin.title && c.denomination === selectedCoin.denomination)
                            .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
                            .map((dup, idx) => (
                              <div key={dup.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full font-bold">{idx + 1}</span>
                                  <span className="font-bold">{new Date(dup.purchaseDate || dup.addedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                                </div>
                                <span className="font-black text-emerald-500">£{(dup.amountPaid || 0).toFixed(2)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {selectedCoin.amountPaid !== undefined && (
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price Paid</h4>
                          <p className="text-xl font-black text-emerald-500">£{selectedCoin.amountPaid.toFixed(2)}</p>
                        </div>
                        {selectedCoin.purchaseDate && (
                          <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</h4>
                            <p className="text-sm font-bold">{new Date(selectedCoin.purchaseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => { toggleCollected(selectedCoin.id); setSelectedCoin(prev => prev ? { ...prev, isCollected: !prev.isCollected } : null); }}
                        className={cn(
                          "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all",
                          selectedCoin.isCollected 
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" 
                            : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        )}
                      >
                        {selectedCoin.isCollected ? 'Mark as Missing' : 'Mark as Collected'}
                      </button>
                      <button 
                        onClick={() => { setEditingCoin(selectedCoin); setSelectedCoin(null); }}
                        className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-colors"
                      >
                        <Edit2 className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Coin Modal */}
        <AnimatePresence>
          {editingCoin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingCoin(null)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black">Edit Coin</h2>
                    <button onClick={() => setEditingCoin(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const amountPaid = formData.get('amountPaid') ? parseFloat(formData.get('amountPaid') as string) : undefined;
                    
                    updateCoin({
                      ...editingCoin,
                      title: formData.get('title') as string,
                      denomination: formData.get('denomination') as string,
                      year: parseInt(formData.get('year') as string),
                      summary: formData.get('summary') as string,
                      amountPaid,
                      purchaseDate: formData.get('purchaseDate') as string || undefined,
                      folderId: formData.get('folderId') as string || undefined,
                      isCollected: !!amountPaid || editingCoin.isCollected,
                      imageUrl: newCoinImage || editingCoin.imageUrl,
                      isRare: formData.get('isRare') === 'on'
                    });
                    setNewCoinImage(null);
                    showToast('Coin updated!');
                  }} className="space-y-5">
                    <div className="flex justify-center mb-6">
                      <button 
                        type="button"
                        onClick={() => coinImageInputRef.current?.click()}
                        className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 overflow-hidden group hover:border-amber-500 transition-all"
                      >
                        {newCoinImage || editingCoin.imageUrl ? (
                          <img src={newCoinImage || editingCoin.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera className="w-8 h-8 text-slate-400 group-hover:text-amber-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Add Photo</span>
                          </>
                        )}
                      </button>
                      <input type="file" ref={coinImageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Coin Title</label>
                      <input name="title" required defaultValue={editingCoin.title} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Denomination</label>
                        <input name="denomination" required defaultValue={editingCoin.denomination} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Year</label>
                        <input name="year" type="number" required defaultValue={editingCoin.year} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Amount Paid (£)</label>
                        <input name="amountPaid" type="number" step="0.01" defaultValue={editingCoin.amountPaid} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Purchase Date</label>
                        <input name="purchaseDate" type="date" defaultValue={editingCoin.purchaseDate} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <input type="checkbox" name="isRare" id="editIsRare" defaultChecked={editingCoin.isRare} className="w-5 h-5 accent-amber-500 rounded" />
                      <label htmlFor="editIsRare" className="text-sm font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        Rare Coin (5x Points)
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Summary</label>
                      <textarea name="summary" required rows={3} defaultValue={editingCoin.summary} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none resize-none font-medium text-sm" />
                    </div>
                    <button type="submit" className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-500/30 transition-all mt-4 uppercase tracking-widest">
                      Save Changes
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isAddFolderModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddFolderModalOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <h2 className="text-2xl font-black mb-6">New Folder</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addFolder(formData.get('name') as string, formData.get('icon') as string || '📁');
                  }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Folder Name</label>
                      <input name="name" required placeholder="e.g. Rare Coins" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Icon (Emoji)</label>
                      <input name="icon" placeholder="📁" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none text-2xl text-center" />
                    </div>
                    <button type="submit" className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-500/30 transition-all mt-4 uppercase tracking-widest">
                      Create Folder
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-slate-900 text-white rounded-full shadow-2xl flex items-center gap-3 border border-slate-700"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
