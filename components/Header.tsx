
import React, { useState, useEffect } from 'react';
import { Sprout, LogOut, User as UserIcon, Moon, Sun, Globe, Bell, Wifi, WifiOff, CheckCircle2, RefreshCw, ChevronDown, Languages, ArrowLeft, Menu } from 'lucide-react';
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
  // Theme toggle mostly for dev/consumer mode, forced dark for Pro
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncCount, setSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'Weather Alert', message: 'Heavy rain expected in Nashik district.', type: 'alert', timestamp: new Date(), read: false },
    { id: '2', title: 'Market Update', message: 'Onion prices up by 15%.', type: 'info', timestamp: new Date(Date.now() - 3600000), read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); handleSync(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const updateQueue = () => setSyncCount(offlineService.getQueueCount());
    window.addEventListener('sync-queue-updated', updateQueue);
    updateQueue();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sync-queue-updated', updateQueue);
    };
  }, []);

  const handleSync = async () => {
    if (offlineService.getQueueCount() > 0) {
      setIsSyncing(true);
      await offlineService.processQueue();
      setIsSyncing(false);
      setSyncCount(offlineService.getQueueCount());
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-tech-bg/95 backdrop-blur-md border-b border-tech-border h-16 md:h-20 flex items-center">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo & Back */}
        <div className="flex items-center gap-3">
           {currentView !== 'home' && user && (
              <button 
                onClick={() => onNavigate('home')}
                className="p-2 -ml-2 rounded-full hover:bg-tech-card text-tech-secondary hover:text-tech-cyan transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
           )}
           
           <div className="flex items-center gap-3 cursor-pointer group" onClick={() => user && onNavigate('home')}>
             <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-tech-card border border-tech-border text-tech-cyan group-hover:border-tech-cyan transition-colors shadow-lg">
               <Sprout size={20} strokeWidth={2} />
             </div>
             <div className="hidden md:block">
                <span className="font-display font-bold text-xl tracking-tight text-tech-primary">
                  AGROSCAN <span className="text-tech-cyan">AI</span>
                </span>
                <span className="block text-[10px] text-tech-secondary uppercase tracking-[0.2em] leading-none">Professional</span>
             </div>
           </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3 md:gap-5">
           
           {/* Network Status */}
           <div 
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer text-xs font-bold tracking-wide ${
                !isOnline 
                  ? 'bg-red-900/20 border-red-800 text-red-500' 
                  : syncCount > 0 
                    ? 'bg-tech-amber/10 border-tech-amber text-tech-amber'
                    : 'bg-tech-card border-tech-border text-tech-secondary'
              }`}
              onClick={handleSync}
           >
              {!isOnline ? <WifiOff size={14} /> : isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Wifi size={14} className="text-tech-cyan" />}
              <span>{isOnline ? (isSyncing ? 'SYNCING' : syncCount > 0 ? `${syncCount} PENDING` : 'ONLINE') : 'OFFLINE'}</span>
           </div>

          {/* Language */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-tech-primary hover:text-tech-cyan transition-colors uppercase tracking-wider">
              <Globe size={16} />
              <span className="hidden md:inline">{language}</span>
            </button>
            
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-tech-card border border-tech-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 max-h-96 overflow-y-auto">
               <div className="p-3 border-b border-tech-border text-xs font-bold text-tech-secondary uppercase">Select Language</div>
               {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-tech-bg flex items-center justify-between ${language === lang.code ? 'text-tech-cyan' : 'text-tech-secondary'}`}
                  >
                    <span>{lang.localName}</span>
                    {language === lang.code && <CheckCircle2 size={14} />}
                  </button>
               ))}
            </div>
          </div>

          {/* Notification Bell */}
          {user && (
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-tech-secondary hover:text-tech-cyan transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-tech-amber rounded-full animate-pulse shadow-[0_0_8px_#FFC107]"></span>
              )}
            </button>
          )}

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-tech-border">
               <div className="text-right hidden md:block">
                  <span className="block text-sm font-bold text-tech-primary leading-none">{user.name}</span>
                  <span className="text-[10px] text-tech-cyan uppercase tracking-wider">{user.role}</span>
               </div>
               <button 
                  onClick={onLogout}
                  className="p-2 text-tech-secondary hover:text-red-400 transition-colors"
                  title="Logout"
               >
                  <LogOut size={20} />
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Notification Dropdown */}
      {showNotifications && (
         <div className="absolute top-16 right-4 w-80 bg-tech-card border border-tech-border rounded-lg shadow-2xl z-50 animate-slide-up">
            <div className="p-3 border-b border-tech-border font-bold text-xs uppercase text-tech-secondary tracking-wider">Alerts</div>
            <div className="max-h-64 overflow-y-auto">
               {notifications.map(n => (
                  <div key={n.id} className="p-4 border-b border-tech-border hover:bg-tech-bg/50 transition-colors">
                     <h5 className={`text-sm font-bold mb-1 ${n.type === 'alert' ? 'text-red-400' : 'text-tech-primary'}`}>{n.title}</h5>
                     <p className="text-xs text-tech-secondary">{n.message}</p>
                  </div>
               ))}
            </div>
         </div>
      )}
    </header>
  );
};
