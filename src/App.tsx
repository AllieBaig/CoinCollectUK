/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Coin, AppState } from './types';
import { INITIAL_COINS } from './constants';

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'collected' | 'missing'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCoinId, setEditingCoinId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // Safe Mode / Backup State
  const [safeModeData, setSafeModeData] = useState<AppState | null>(null);

  // Initialize data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('uk-coin-collection');
      const safeData = localStorage.getItem('uk-coin-collection-safe');
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setCoins(parsed.coins || INITIAL_COINS);
      } else {
        setCoins(INITIAL_COINS);
      }

      if (safeData) {
        setSafeModeData(JSON.parse(safeData));
      }

      // Theme initialization
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      console.error('Initialization error', e);
      setHasError(true);
    }
  }, []);

  // Save data
  useEffect(() => {
    if (coins.length > 0) {
      const state: AppState = {
        coins,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('uk-coin-collection', JSON.stringify(state));
    }
  }, [coins]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
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
    if (window.confirm('Are you sure you want to remove this coin from your list?')) {
      setCoins(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateCoinTitle = (id: string, newTitle: string) => {
    setCoins(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    setEditingCoinId(null);
  };

  const createSafeVersion = () => {
    const state: AppState = {
      coins,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('uk-coin-collection-safe', JSON.stringify(state));
    setSafeModeData(state);
    alert('Safe version created successfully!');
  };

  const restoreSafeVersion = () => {
    if (safeModeData && window.confirm('Restore to the last safe version? Current changes will be lost.')) {
      setCoins(safeModeData.coins);
    }
  };

  const exportData = () => {
    const state: AppState = { coins, lastUpdated: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uk-coin-collection-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const filteredCoins = useMemo(() => {
    return coins.filter(coin => {
      const matchesSearch = coin.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           coin.denomination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' ? true : 
                           filter === 'collected' ? coin.isCollected : !coin.isCollected;
      return matchesSearch && matchesFilter;
    });
  }, [coins, searchQuery, filter]);

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
        <h1 className="text-2xl font-bold mb-2 text-center">Something went wrong</h1>
        <p className="mb-6 text-center max-w-md">
          The app encountered an unexpected error. You can still export your data to keep it safe.
        </p>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg"
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm underline opacity-70 hover:opacity-100"
        >
          Try reloading the page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-bottom border-slate-200 dark:border-slate-800">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-white font-bold text-xl">£</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">UK Coin Collector</h1>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={exportData}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Export Data"
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={createSafeVersion}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-emerald-600"
                title="Save Safe Version"
              >
                <Save className="w-5 h-5" />
              </button>
              {safeModeData && (
                <button 
                  onClick={restoreSafeVersion}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-amber-600"
                  title="Restore Safe Version"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Stats & Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search coins by name or denomination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(['all', 'collected', 'missing'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize",
                      filter === f 
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" 
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-500"
                    )}
                  >
                    {f}
                  </button>
                ))}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Add Coin
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Progress</span>
                <span className="text-2xl font-bold text-amber-500">{stats.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentage}%` }}
                  className="h-full bg-amber-500"
                />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Collected <span className="font-bold text-slate-900 dark:text-white">{stats.collected}</span> of <span className="font-bold text-slate-900 dark:text-white">{stats.total}</span> coins
              </p>
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
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                          {coin.denomination} • {coin.year}
                        </span>
                        {editingCoinId === coin.id ? (
                          <div className="flex items-center gap-2">
                            <input 
                              autoFocus
                              defaultValue={coin.title}
                              onBlur={(e) => updateCoinTitle(coin.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateCoinTitle(coin.id, e.currentTarget.value);
                                if (e.key === 'Escape') setEditingCoinId(null);
                              }}
                              className="bg-slate-100 dark:bg-slate-800 border-none rounded px-2 py-1 text-lg font-bold outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        ) : (
                          <h3 className="text-lg font-bold flex items-center gap-2">
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
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                          coin.isCollected 
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500"
                        )}
                      >
                        {coin.isCollected ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-6 italic">
                      {coin.summary}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className={cn(
                        "text-xs font-semibold px-3 py-1 rounded-full",
                        coin.isCollected 
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {coin.isCollected ? 'In Collection' : 'Missing'}
                      </span>
                      <button 
                        onClick={() => deleteCoin(coin.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No coins found matching your search</p>
              <button 
                onClick={() => { setSearchQuery(''); setFilter('all'); }}
                className="mt-2 text-amber-500 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>

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
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add New Coin</h2>
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
                      category: 'Other'
                    };
                    setCoins(prev => [newCoin, ...prev]);
                    setIsAddModalOpen(false);
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-500">Coin Title</label>
                      <input name="title" required placeholder="e.g. Peter Rabbit" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-500">Denomination</label>
                        <input name="denomination" required placeholder="e.g. 50p" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-500">Year</label>
                        <input name="year" type="number" required placeholder="e.g. 2023" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-500">Summary (2 sentences)</label>
                      <textarea name="summary" required rows={3} placeholder="A brief description of the coin's design and history..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all mt-4">
                      Add to Collection
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-[10px] text-white font-bold">£</div>
              <span className="text-sm font-medium">UK Coin Collector v1.0</span>
            </div>
            
            <div className="flex gap-6 text-sm text-slate-500">
              <button onClick={exportData} className="hover:text-amber-500 transition-colors">Export JSON</button>
              <button onClick={() => {
                if (window.confirm('Reset all data to default? This cannot be undone.')) {
                  setCoins(INITIAL_COINS);
                  localStorage.removeItem('uk-coin-collection');
                }
              }} className="hover:text-red-500 transition-colors">Reset App</button>
            </div>
          </div>
        </footer>
      </div>
  );
}
