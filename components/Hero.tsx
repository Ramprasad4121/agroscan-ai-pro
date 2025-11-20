
import React from 'react';
import { Camera, Mic, Video, Droplets, Calendar, Calculator, Shield, Warehouse, Globe, Store, PieChart, Zap, Users, FileText, Plane, Leaf, ArrowRight, TrendingUp, CloudSun, Landmark, Sprout } from 'lucide-react';
import { ViewState } from '../types';
import { WeatherWidget, MandiTicker } from './DashboardWidgets';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
  t: any;
  userLocation?: { lat: number; lng: number } | null;
  userName?: string;
  onOpenWhatsApp?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, t, userLocation, userName, onOpenWhatsApp }) => {
  const tools = [
    { id: 'passport', title: t.passport_title || "Agri Passport", icon: FileText, path: 'passport' },
    { id: 'schemes', title: t.schemes_title || "Finance & Schemes", icon: Landmark, path: 'schemes' },
    { id: 'recommend', title: t.rec_title, icon: Sprout, path: 'recommend' },
    { id: 'water', title: t.water_title, icon: Droplets, path: 'water' },
    { id: 'calendar', title: t.calendar_title, icon: Calendar, path: 'calendar' },
    { id: 'fertilizer', title: t.fert_title, icon: Calculator, path: 'fertilizer' },
    { id: 'pesticide', title: t.pest_title, icon: Shield, path: 'pesticide' },
    { id: 'yield', title: t.yield_title, icon: Leaf, path: 'yield' },
    { id: 'market', title: t.market_title, icon: Globe, path: 'market' },
    { id: 'profit', title: t.profit_title, icon: PieChart, path: 'profit' },
    { id: 'electricity', title: t.power_title, icon: Zap, path: 'electricity' },
  ];

  const formattedDate = new Date().toDateString().replace(/(\w{3}) (\w{3}) (\d{2}) (\d{4})/, "$1 $2 $3 $4");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Section: Dashboard User Card - Clickable to go to Passport */}
      <div 
         onClick={() => onNavigate('passport')}
         className="border border-tech-border bg-tech-card/50 rounded-xl p-6 mb-6 relative overflow-hidden backdrop-blur-sm cursor-pointer hover:border-tech-cyan/50 transition-all group"
      >
         {/* Background Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
         
         <div className="relative z-10 flex flex-col items-start text-left">
             <div className="flex justify-between w-full items-start">
                <div>
                    <h2 className="text-tech-cyan font-bold text-[10px] uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                       DASHBOARD 
                       <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] text-tech-secondary bg-tech-bg px-1 rounded border border-tech-border">VIEW PASSPORT</span>
                    </h2>
                    <h1 className="text-3xl font-display font-bold text-white mb-2">{userName || 'Ram Kishan'}</h1>
                    <p className="text-tech-secondary text-xs font-bold tracking-widest uppercase mb-1">{formattedDate}</p>
                </div>
                {/* Active Indicator */}
                <div className="hidden sm:block">
                   <div className="flex items-center gap-2 bg-tech-bg/50 px-3 py-1 rounded-full border border-tech-border">
                      <span className="w-2 h-2 bg-tech-amber rounded-full animate-pulse shadow-[0_0_8px_#FFC107]"></span>
                      <span className="text-tech-amber text-[10px] font-bold uppercase tracking-wider">System Active</span>
                   </div>
                </div>
             </div>
             
             {/* Mobile Active Indicator */}
             <div className="sm:hidden mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-tech-amber rounded-full animate-pulse shadow-[0_0_8px_#FFC107]"></span>
                <span className="text-tech-amber text-[10px] font-bold uppercase tracking-wider">System Active</span>
             </div>
         </div>
      </div>

      {/* Main Action: Scan Crop Health */}
      <div 
         id="tour-diagnose"
         onClick={() => onNavigate('scan')} 
         className="tech-card p-8 mb-6 relative overflow-hidden group cursor-pointer border border-tech-border hover:border-tech-cyan/50 transition-all duration-500 min-h-[220px] flex items-center"
      >
           {/* Background faint grid */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(77,208,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(77,208,225,0.03)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
           
           <div className="relative z-10 w-full flex justify-between items-center">
              <div className="flex flex-col justify-between h-full gap-6">
                 <div>
                    <span className="bg-tech-cyan/20 text-tech-cyan text-[10px] font-bold px-3 py-1 rounded border border-tech-cyan/30 uppercase tracking-wide">AI DIAGNOSIS</span>
                    <h3 className="text-4xl font-display font-bold text-white mt-4 leading-none">SCAN CROP<br/>HEALTH</h3>
                 </div>
                 <div className="flex items-center gap-3 text-tech-cyan font-bold uppercase text-sm tracking-wider group-hover:translate-x-2 transition-transform">
                    INITIATE <ArrowRight size={18} />
                 </div>
              </div>
              
              {/* Camera Circle */}
              <div className="w-28 h-28 rounded-full bg-tech-bg border-2 border-tech-cyan/30 flex items-center justify-center shadow-[0_0_30px_rgba(77,208,225,0.1)] group-hover:shadow-[0_0_50px_rgba(77,208,225,0.2)] transition-all">
                 <Camera size={48} className="text-tech-cyan" />
              </div>
           </div>
      </div>

      {/* Bottom Action Row: Assistant */}
      <div className="mb-10">
         {/* Assistant (Mic) */}
         <div 
            onClick={() => onNavigate('live')}
            className="tech-card p-6 cursor-pointer group hover:bg-tech-cardHover transition-colors flex items-center gap-6"
         >
            <div className="w-16 h-16 bg-tech-bg rounded-2xl border border-tech-border flex items-center justify-center group-hover:border-tech-amber/50 transition-colors shrink-0">
               <Mic size={32} className="text-tech-amber" />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-white mb-1">Assistant</h3>
                <p className="text-tech-secondary text-xs uppercase tracking-wider">Talk to AI Expert</p>
            </div>
         </div>
      </div>

      {/* Quick Stats Row (Weather & Market) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
         <div className="h-32">
             <WeatherWidget userLocation={userLocation || null} t={t} />
         </div>
         <div className="h-32">
             <MandiTicker userLocation={userLocation || null} t={t} />
         </div>
      </div>

      {/* Tools Grid */}
      <div className="mt-8 border-t border-tech-border pt-8">
         <h3 className="text-tech-secondary text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-tech-border"></span>
            Operational Tools
            <span className="h-px flex-1 bg-tech-border"></span>
         </h3>
         
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tools.map((tool) => (
               <div 
                  key={tool.id}
                  id={`tour-${tool.id}`}
                  onClick={() => onNavigate(tool.path as ViewState)}
                  className="tech-card p-4 flex flex-col items-center justify-center text-center gap-3 hover:bg-tech-cardHover cursor-pointer group min-h-[120px]"
               >
                  <div className="text-tech-secondary group-hover:text-tech-cyan transition-colors">
                     <tool.icon size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-bold text-tech-primary uppercase tracking-wide group-hover:text-white">{tool.title}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
