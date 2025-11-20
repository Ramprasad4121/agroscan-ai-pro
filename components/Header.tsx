
import React, { useState, useEffect } from 'react';
import { Sprout, Home, LogOut, User as UserIcon, Moon, Sun, Globe, Bell, Wifi, WifiOff, CheckCircle2, RefreshCw, ChevronDown, Languages, ArrowLeft } from 'lucide-react';
import { User, ViewState, Notification } from '../types';
import { LANGUAGES } from '../translations';
import { offlineService } from '../services/offline';

interface HeaderProps {
  user: User | null;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  currentView: ViewState;
  language: string;
  setLanguage: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout, currentView, language, setLanguage }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncCount, setSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Weather Alert', message: 'Heavy rain expected in Nashik district tomorrow.', type: 'alert', timestamp: new Date(), read: false },
    { id: '2', title: 'Market Update', message: 'Onion prices up by 15% in Lasalgaon Mandi.', type: 'info', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: '3', title: 'Loan Approved', message: 'Your KCC loan application #L-101 has been verified.', type: 'success', timestamp: new Date(Date.now() - 86400000), read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const updateQueue = () => setSyncCount(offlineService.getQueueCount());
    window.addEventListener('sync-queue-updated', updateQueue);
    updateQueue();

    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-queue-updated', updateQueue);
    };
  }, [theme]);

  const handleSync = async () => {
    if (offlineService.getQueueCount() > 0) {
      setIsSyncing(true);
      await offlineService.processQueue();
      setIsSyncing(false);
      setSyncCount(offlineService.getQueueCount());
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }, 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#388E3C] shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 text-white">
        
        <div className="flex items-center gap-1 md:gap-3">
           {currentView !== 'home' && (
              <button 
                onClick={() => onNavigate('home')}
                className="p-2 -ml-2 mr-1 rounded-full hover:bg-white/10 text-white transition-colors"
                aria-label="Go Back"
              >
                <ArrowLeft size={24} />
              </button>
           )}
           
           <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
             <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white text-[#388E3C] shadow-lg group-hover:scale-105 transition-transform">
               <Sprout size={20} className="md:w-[22px] md:h-[22px]" />
             </div>
             <span className="font-display font-bold text-lg md:text-xl tracking-tight text-white">
               AgroScan<span className="text-green-200">AI</span>
               <span className="hidden sm:inline-block ml-2 px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full align-middle border border-white/30">Pro</span>
             </span>
           </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4">
           {/* Sync / Network Status */}
           <div 
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 transition-all cursor-pointer ${
                !isOnline 
                  ? 'bg-red-500/20 text-white border-red-400' 
                  : syncCount > 0 
                    ? 'bg-amber-500/20 text-white border-amber-400'
                    : 'bg-white/10 text-white/80'
              }`}
              onClick={handleSync}
           >
              {!isOnline ? (
                <>
                  <WifiOff size={14} /> <span className="text-xs font-bold">Offline</span>
                </>
              ) : isSyncing ? (
                <>
                   <RefreshCw size={14} className="animate-spin" /> <span className="text-xs font-bold">Syncing...</span>
                </>
              ) : syncCount > 0 ? (
                <>
                   <RefreshCw size={14} /> <span className="text-xs font-bold">{syncCount} Pending</span>
                </>
              ) : (
                <>
                   <Wifi size={14} className="text-green-300" /> <span className="text-xs font-bold text-white/80">Synced</span>
                </>
              )}
           </div>

          {/* Enhanced Language Selector */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2 py-2 md:px-3 text-sm text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/20">
              <Globe size={18} className="text-white" />
              <span className="uppercase font-bold hidden md:inline-block text-xs tracking-wide">{language}</span>
              <ChevronDown size={14} className="text-white/70 group-hover:text-white transition-colors" />
            </button>
            
            <div className="absolute right-0 top-full mt-2 w-72 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50 origin-top-right">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Languages size={14} /> Select Language / भाषा चुनें
                 </h4>
              </div>
              <div className="p-2 max-h-[400px] overflow-y-auto grid grid-cols-2 gap-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all group/item ${
                      language === lang.code 
                        ? 'bg-green-50 dark:bg-green-900/20 text-[#388E3C] dark:text-green-400 border border-green-200 dark:border-green-800/50' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex flex-col">
                       <span className={`text-sm ${language === lang.code ? 'font-bold' : 'font-medium group-hover/item:text-slate-900 dark:group-hover/item:text-white'}`}>
                         {lang.localName}
                       </span>
                       <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{lang.name}</span>
                    </div>
                    {language === lang.code && <CheckCircle2 size={16} className="text-[#388E3C]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notification Bell */}
          {user && (
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="p-2 text-white hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#388E3C] rounded-full animate-pulse"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-slide-up origin-top-right">
                   <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white">
                      <h4 className="text-sm font-bold">Notifications</h4>
                      <span className="text-xs text-slate-500">Updated just now</span>
                   </div>
                   <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                             <div className="flex gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.type === 'alert' ? 'bg-red-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                <div>
                                   <h5 className={`text-sm font-bold mb-0.5 ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{n.title}</h5>
                                   <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                                   <span className="text-[10px] text-slate-400 mt-2 block">{n.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user && (
            <nav className="flex items-center gap-1 md:gap-4">
              <div className="h-6 w-px bg-white/20 hidden md:block"></div>

              <div className="flex items-center gap-2 pl-2 cursor-pointer" title="Verified Identity">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white">
                    <UserIcon size={16} />
                  </div>
                  {user.kycStatus === 'Verified' && (
                    <div className="absolute -bottom-1 -right-1 bg-white border-2 border-[#388E3C] rounded-full p-[2px]">
                      <CheckCircle2 size={8} className="text-[#388E3C]" />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-white hidden sm:block max-w-[100px] truncate">{user.name}</span>
                <button 
                  onClick={onLogout}
                  className="ml-1 md:ml-2 p-2 text-white/70 hover:text-red-200 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
