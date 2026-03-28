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
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Coin, AppState, Folder, UserPreferences } from './types';
import { INITIAL_COINS, INITIAL_FOLDERS } from './constants';

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
    if (window.confirm("Safe Mode will reset your preferences but keep your coins. Continue?")) {
      const data = localStorage.getItem('uk-coin-collection-v2');
      if (data) {
        const parsed = JSON.parse(data);
        parsed.preferences = {
          isDarkMode: false,
          activeFolderId: 'all',
          sortBy: 'recently-added',
          showBottomMenu: true,
          isCompactUI: false
        };
        localStorage.setItem('uk-coin-collection-v2', JSON.stringify(parsed));
      }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            The app encountered an unexpected error. You can try exporting your data or entering Safe Mode.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button
              onClick={this.handleExport}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
            <button
              onClick={this.handleSafeMode}
              className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:bg-gray-900 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Use Safe Mode
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 font-medium hover:underline"
            >
              Try Refreshing
            </button>
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
  const [preferences, setPreferences] = useState<UserPreferences>({
    isDarkMode: false,
    themeMode: 'system',
    sortBy: 'recently-added',
    activeFolderId: 'all',
    showBottomMenu: true,
    isCompactUI: false
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
  const [hasError, setHasError] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('uk-coin-collection-v2');
      
      if (savedData) {
        const parsed: AppState = JSON.parse(savedData);
        setCoins(parsed.coins || INITIAL_COINS);
        setFolders(parsed.folders || INITIAL_FOLDERS);
        setRecoveryCode(parsed.recoveryCode || generateRecoveryCode());
        if (parsed.preferences) {
          setPreferences({
            ...parsed.preferences,
            themeMode: parsed.preferences.themeMode || 'system',
            showBottomMenu: parsed.preferences.showBottomMenu ?? true,
            isCompactUI: parsed.preferences.isCompactUI ?? false
          });
        }
      } else {
        // Migration or first load
        const oldData = localStorage.getItem('uk-coin-collection');
        if (oldData) {
          const parsed = JSON.parse(oldData);
          setCoins(parsed.coins || INITIAL_COINS);
        } else {
          setCoins(INITIAL_COINS);
        }
        setFolders(INITIAL_FOLDERS);
        setRecoveryCode(generateRecoveryCode());
        
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

  // Save data
  useEffect(() => {
    if (coins.length > 0 || folders.length > 0) {
      const state: AppState = {
        coins,
        folders,
        preferences,
        recoveryCode,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('uk-coin-collection-v2', JSON.stringify(state));
    }
  }, [coins, folders, preferences, recoveryCode]);

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

  const exportData = () => {
    const state: AppState = { coins, folders, preferences, recoveryCode, lastUpdated: new Date().toISOString() };
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
          const imported: AppState = JSON.parse(e.target?.result as string);
          if (imported.coins && Array.isArray(imported.coins)) {
            setCoins(imported.coins);
            if (imported.folders) setFolders(imported.folders);
            if (imported.preferences) setPreferences(imported.preferences);
            if (imported.recoveryCode) setRecoveryCode(imported.recoveryCode);
            alert('Data imported successfully!');
          }
        } catch (err) {
          alert('Invalid backup file.');
        } finally {
          setImportProgress(null);
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
      { name: 'Beginner', min: 0, max: 200 },
      { name: 'Collector', min: 201, max: 1000 },
      { name: 'Specialist', min: 1001, max: 3000 },
      { name: 'Expert', min: 3001, max: 7000 },
      { name: 'Master', min: 7001, max: Infinity }
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
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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
                    preferences.isCompactUI && "rounded-2xl"
                  )}
                >
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

                    {coin.amountPaid !== undefined && !preferences.isCompactUI && (
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
        </main>

        {/* Bottom Navigation */}
        {preferences.showBottomMenu && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
            <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
              <button 
                onClick={() => openFolder('all')}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  preferences.activeFolderId === 'all' ? "text-amber-500" : "text-slate-400"
                )}
              >
                <LayoutGrid className="w-6 h-6" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
              </button>
              <button 
                onClick={() => setIsPhotoLibraryOpen(true)}
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
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[40px] shadow-2xl p-8 pb-12 max-h-[90vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black">Settings</h2>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {importProgress !== null && (
                    <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20">
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

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Preferences</h3>
                    
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Theme Mode</label>
                      <div className="grid grid-cols-3 gap-2 p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                        {(['light', 'dark', 'system'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setPreferences(prev => ({ ...prev, themeMode: mode }))}
                            className={cn(
                              "flex flex-col items-center gap-1 py-3 rounded-xl transition-all",
                              preferences.themeMode === mode 
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" 
                                : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                            )}
                          >
                            {mode === 'light' && <Sun className="w-5 h-5" />}
                            {mode === 'dark' && <Moon className="w-5 h-5" />}
                            {mode === 'system' && <Monitor className="w-5 h-5" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{mode}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => setPreferences(prev => ({ ...prev, showBottomMenu: !prev.showBottomMenu }))}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutList className="w-5 h-5 text-slate-500" />
                        <span className="font-bold">Bottom Menu</span>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", preferences.showBottomMenu ? "bg-amber-500" : "bg-slate-200")}>
                        <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", preferences.showBottomMenu ? "translate-x-6" : "translate-x-0")} />
                      </div>
                    </button>

                    <button 
                      onClick={() => setPreferences(prev => ({ ...prev, isCompactUI: !prev.isCompactUI }))}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="w-5 h-5 text-slate-500" />
                        <span className="font-bold">Compact UI</span>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", preferences.isCompactUI ? "bg-amber-500" : "bg-slate-200")}>
                        <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", preferences.isCompactUI ? "translate-x-6" : "translate-x-0")} />
                      </div>
                    </button>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Data Management</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={exportData}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-amber-50"
                      >
                        <Download className="w-6 h-6 text-amber-500" />
                        <span className="text-xs font-bold">Export</span>
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-amber-50"
                      >
                        <Upload className="w-6 h-6 text-blue-500" />
                        <span className="text-xs font-bold">Import</span>
                        <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                      </button>
                      <button 
                        onClick={() => window.location.reload()}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-emerald-50"
                      >
                        <RefreshCw className="w-6 h-6 text-emerald-500" />
                        <span className="text-xs font-bold">Refresh App</span>
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Clear all app data? This cannot be undone.')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-red-50"
                      >
                        <Trash2 className="w-6 h-6 text-red-500" />
                        <span className="text-xs font-bold text-red-500">Clear Cache</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Safe Mode (Local Backup)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          const state: AppState = { coins, folders, preferences, lastUpdated: new Date().toISOString() };
                          localStorage.setItem('uk-coin-collection-safe', JSON.stringify(state));
                          alert('Safe version saved locally!');
                        }}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-emerald-50"
                      >
                        <Save className="w-6 h-6 text-emerald-500" />
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
                            alert('Safe version restored!');
                          } else if (!safeData) {
                            alert('No safe version found.');
                          }
                        }}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-amber-50"
                      >
                        <RotateCcw className="w-6 h-6 text-amber-500" />
                        <span className="text-xs font-bold">Restore Safe</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20">
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
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black">Device Profile</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Storage Only</p>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Level</p>
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
