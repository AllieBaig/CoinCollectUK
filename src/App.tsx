/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Coin, AppState, Folder, UserPreferences } from './types';
import { INITIAL_COINS, INITIAL_FOLDERS } from './constants';

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    isDarkMode: false,
    sortBy: 'recently-added',
    activeFolderId: 'all'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'collected' | 'missing'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingCoinId, setEditingCoinId] = useState<string | null>(null);
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
        if (parsed.preferences) {
          setPreferences(parsed.preferences);
          if (parsed.preferences.isDarkMode) {
            document.documentElement.classList.add('dark');
          }
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
        
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setPreferences(prev => ({ ...prev, isDarkMode: isDark }));
        if (isDark) document.documentElement.classList.add('dark');
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

  // Save data
  useEffect(() => {
    if (coins.length > 0 || folders.length > 0) {
      const state: AppState = {
        coins,
        folders,
        preferences,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('uk-coin-collection-v2', JSON.stringify(state));
    }
  }, [coins, folders, preferences]);

  const toggleTheme = () => {
    const newMode = !preferences.isDarkMode;
    setPreferences(prev => ({ ...prev, isDarkMode: newMode }));
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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
      lastOpenedAt: new Date().toISOString()
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
    const state: AppState = { coins, folders, preferences, lastUpdated: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uk-coins-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported: AppState = JSON.parse(e.target?.result as string);
        if (imported.coins && Array.isArray(imported.coins)) {
          setCoins(imported.coins);
          if (imported.folders) setFolders(imported.folders);
          if (imported.preferences) setPreferences(imported.preferences);
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
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
    if (preferences.sortBy === 'recently-opened-folder') {
      return [...folders].sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime());
    }
    return folders;
  }, [folders, preferences.sortBy]);

  const filteredCoins = useMemo(() => {
    let result = coins.filter(coin => {
      const matchesSearch = coin.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           coin.denomination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' ? true : 
                           filter === 'collected' ? coin.isCollected : !coin.isCollected;
      const matchesFolder = preferences.activeFolderId === 'all' ? true : coin.folderId === preferences.activeFolderId;
      
      return matchesSearch && matchesFilter && matchesFolder;
    });

    if (preferences.sortBy === 'recently-added') {
      result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    } else if (preferences.sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [coins, searchQuery, filter, preferences.activeFolderId, preferences.sortBy]);

  const stats = useMemo(() => {
    const total = coins.length;
    const collected = coins.filter(c => c.isCollected).length;
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    return { total, collected, percentage };
  }, [coins]);

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
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
                <button 
                  onClick={() => setPreferences(prev => ({ ...prev, sortBy: 'recently-added' }))}
                  className={cn("p-1.5 rounded-full transition-all", preferences.sortBy === 'recently-added' ? "bg-white dark:bg-slate-700 shadow-sm text-amber-500" : "text-slate-400")}
                  title="Sort by Recently Added"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPreferences(prev => ({ ...prev, sortBy: 'recently-opened-folder' }))}
                  className={cn("p-1.5 rounded-full transition-all", preferences.sortBy === 'recently-opened-folder' ? "bg-white dark:bg-slate-700 shadow-sm text-amber-500" : "text-slate-400")}
                  title="Sort by Recently Opened Folder"
                >
                  <FolderIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPreferences(prev => ({ ...prev, sortBy: 'title' }))}
                  className={cn("p-1.5 rounded-full transition-all", preferences.sortBy === 'title' ? "bg-white dark:bg-slate-700 shadow-sm text-amber-500" : "text-slate-400")}
                  title="Sort by Title"
                >
                  <TypeIcon className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h2 className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Collection Progress</h2>
                <p className="text-2xl font-black">{stats.collected} / {stats.total} <span className="text-sm font-normal text-slate-400">Coins</span></p>
              </div>
              <span className="text-3xl font-black text-amber-500">{stats.percentage}%</span>
            </div>
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredCoins.map((coin) => (
                <motion.div
                  key={coin.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "group relative bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-300 overflow-hidden",
                    coin.isCollected 
                      ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5" 
                      : "border-slate-200 dark:border-slate-800 hover:border-amber-500/50"
                  )}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col flex-1 mr-2">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">
                          {coin.denomination} • {coin.year}
                        </span>
                        {editingCoinId === coin.id ? (
                          <input 
                            autoFocus
                            defaultValue={coin.title}
                            onBlur={(e) => updateCoinTitle(coin.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') updateCoinTitle(coin.id, e.currentTarget.value);
                              if (e.key === 'Escape') setEditingCoinId(null);
                            }}
                            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500 w-full"
                          />
                        ) : (
                          <h3 className="text-lg font-bold flex items-center gap-2 leading-tight">
                            {coin.title}
                            <button 
                              onClick={() => setEditingCoinId(coin.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-amber-500 transition-all"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </h3>
                        )}
                      </div>
                      <button 
                        onClick={() => toggleCollected(coin.id)}
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shrink-0",
                          coin.isCollected 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500"
                        )}
                      >
                        {coin.isCollected ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                      </button>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 italic leading-relaxed">
                      {coin.summary}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                          coin.isCollected 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {coin.isCollected ? 'Collected' : 'Missing'}
                        </span>
                        {coin.folderId && (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            {folders.find(f => f.id === coin.folderId)?.name || 'Folder'}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteCoin(coin.id)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

        {/* Floating Add Button */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-amber-500 text-white rounded-full shadow-2xl shadow-amber-500/40 flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>

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
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Preferences</h3>
                    <button 
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        {preferences.isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                        <span className="font-bold">{preferences.isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", preferences.isDarkMode ? "bg-amber-500" : "bg-slate-200")}>
                        <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", preferences.isDarkMode ? "translate-x-6" : "translate-x-0")} />
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
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-amber-50"
                      >
                        <RefreshCw className="w-6 h-6 text-emerald-500" />
                        <span className="text-xs font-bold">Refresh</span>
                      </button>
                      <button 
                        onClick={clearCache}
                        className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:bg-red-50"
                      >
                        <Trash2 className="w-6 h-6 text-red-500" />
                        <span className="text-xs font-bold text-red-500">Reset</span>
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
                    const newCoin: Coin = {
                      id: `custom-${Date.now()}`,
                      title: formData.get('title') as string,
                      denomination: formData.get('denomination') as string,
                      year: parseInt(formData.get('year') as string),
                      summary: formData.get('summary') as string,
                      isCollected: false,
                      category: 'Other',
                      folderId: formData.get('folderId') as string || undefined,
                      addedAt: new Date().toISOString()
                    };
                    setCoins(prev => [newCoin, ...prev]);
                    setIsAddModalOpen(false);
                  }} className="space-y-5">
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
      </div>
  );
}
