
import React, { useState } from 'react';
import { ArrowRight, Sprout, Video, Mic, Globe, Calendar, BookOpen, Camera, ChevronRight, Droplets, TrendingUp, Calculator, Shield, Warehouse, Store, PieChart, Zap, FileText, Users, MessageCircle, Plane, Info, Activity, Leaf, Coins, Briefcase } from 'lucide-react';
import { ViewState } from '../types';
import { WeatherWidget, MandiTicker } from './DashboardWidgets';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
  t: any;
  userLocation?: { lat: number; lng: number } | null;
  userName?: string;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, t, userLocation, userName }) => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 17 ? "Good Afternoon" : "Good Evening";

  // Define Categories for cleaner layout
  const categories = [
    {
      title: "Smart Management",
      subtitle: "Optimize your daily farming operations",
      items: [
        { id: 'water', title: t.water_title, desc: t.water_desc, icon: Droplets, path: 'water', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'calendar', title: t.calendar_title, desc: t.calendar_desc, icon: Calendar, path: 'calendar', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        { id: 'fertilizer', title: t.fert_title, desc: t.fert_desc, icon: Calculator, path: 'fertilizer', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { id: 'pesticide', title: t.pest_title, desc: t.pest_desc, icon: Shield, path: 'pesticide', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
        { id: 'yield', title: t.yield_title, desc: t.yield_desc, icon: TrendingUp, path: 'yield', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { id: 'recommend', title: t.rec_title, desc: t.rec_desc, icon: Sprout, path: 'recommend', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
      ]
    },
    {
      title: "Market & Finance",
      subtitle: "Maximize profits and secure funding",
      items: [
        { id: 'market', title: t.market_title, desc: t.market_desc, icon: Globe, path: 'market', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        { id: 'profit', title: t.profit_title, desc: t.profit_desc, icon: PieChart, path: 'profit', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
        { id: 'marketplace', title: t.market_place_title, desc: t.market_place_desc, icon: Store, path: 'marketplace', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { id: 'storage', title: t.storage_title, desc: t.storage_desc, icon: Warehouse, path: 'storage', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
        { id: 'schemes', title: t.schemes_title, desc: t.schemes_desc, icon: BookOpen, path: 'schemes', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
      ]
    },
    {
      title: "Services & Community",
      subtitle: "Connect and access essential services",
      items: [
        { id: 'passport', title: t.passport_title, desc: t.passport_desc, icon: FileText, path: 'passport', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { id: 'drones', title: t.drone_title, desc: t.drone_desc, icon: Plane, path: 'drones', color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
        { id: 'electricity', title: t.power_title, desc: t.power_desc, icon: Zap, path: 'electricity', color: 'text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { id: 'community', title: t.community_title, desc: t.community_desc, icon: Users, path: 'community', color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
      ]
    }
  ];

  return (
    <div className="relative bg-transparent min-h-screen pb-20 transition-colors duration-300 font-sans">
      
      {/* Header Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 pb-8 pt-6 px-4 md:px-8 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
                {t.welcome_farmer || greeting}, <span className="text-agro-600">{userName || 'Farmer'}</span>
              </h1>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
               <button 
                 onClick={() => onNavigate('live')}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300 px-5 py-2.5 rounded-xl font-bold transition-colors"
               >
                  <Mic size={18} />
                  <span>{t.live_title}</span>
               </button>
               <button 
                 onClick={() => onNavigate('scan')}
                 className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 dark:shadow-none transition-all"
               >
                  <Camera size={18} />
                  <span>{t.quick_scan}</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">
        
        {/* Priority Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="h-40 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <WeatherWidget userLocation={userLocation || null} t={t} />
           </div>
           <div className="h-40 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <MandiTicker userLocation={userLocation || null} t={t} />
           </div>
        </div>

        {/* Primary Action Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              onClick={() => onNavigate('scan')}
              className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-agro-600 to-emerald-700 rounded-3xl p-8 text-white shadow-xl shadow-agro-200 dark:shadow-none group cursor-pointer hover:scale-[1.01] transition-transform"
            >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Leaf size={180} />
                </div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                   <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-3 border border-white/10">AI Diagnosis</span>
                      <h2 className="text-3xl font-bold mb-2">{t.diagnose_now || "Check Crop Health"}</h2>
                      <p className="text-agro-100 max-w-md text-sm md:text-base leading-relaxed">
                        {t.analyzing_desc || "Take a photo of your plant. Our AI will detect diseases, pests, and nutrient deficiencies instantly."}
                      </p>
                   </div>
                   <div className="mt-6 flex items-center gap-3">
                      <span className="bg-white text-agro-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm">
                         <Camera size={18} /> Start Scan
                      </span>
                   </div>
                </div>
            </div>

            <div 
               onClick={() => onNavigate('video')}
               className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm group cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-colors relative overflow-hidden"
            >
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                     <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        <Video size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t.video_title}</h3>
                     <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{t.video_desc}</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                     <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ArrowRight size={18} />
                     </div>
                  </div>
               </div>
            </div>
        </div>

        {/* Categorized Features */}
        {categories.map((cat, idx) => (
           <div key={idx} className="space-y-4 animate-slide-up" style={{animationDelay: `${idx * 100}ms`}}>
              <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                    <p className="text-slate-400 text-xs hidden sm:block">{cat.subtitle}</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 {cat.items.map((item: any) => (
                    <FeatureCard 
                       key={item.id}
                       item={item}
                       onClick={() => onNavigate(item.path)}
                    />
                 ))}
              </div>
           </div>
        ))}
        
        {/* WhatsApp FAB is handled in App.tsx, but we can add a banner here if needed */}
      </div>
    </div>
  );
};

interface FeatureCardProps {
  item: any;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ item, onClick }) => {
   const [showInfo, setShowInfo] = useState(false);

   return (
      <div 
         onClick={onClick}
         className="relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-md transition-all group cursor-pointer overflow-hidden h-full flex flex-col"
      >
         <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.bg} ${item.color} transition-transform group-hover:scale-110`}>
               <item.icon size={24} />
            </div>
            <button 
               className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 transition-colors p-1"
               onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
               }}
               onMouseEnter={() => setShowInfo(true)}
               onMouseLeave={() => setShowInfo(false)}
            >
               <Info size={16} />
            </button>
         </div>
         
         <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-agro-600 dark:group-hover:text-agro-400 transition-colors relative z-10">
            {item.title}
         </h4>
         <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 relative z-10">
            {item.desc}
         </p>

         {/* Reveal Description Overlay */}
         <div className={`absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-5 flex flex-col justify-center items-center text-center transition-opacity duration-200 ${showInfo ? 'opacity-100 visible' : 'opacity-0 invisible'} z-20`}>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
               {item.desc}
            </p>
            <span className="mt-3 text-[10px] font-bold text-agro-600 uppercase tracking-wider">Click to Open</span>
         </div>
      </div>
   );
}