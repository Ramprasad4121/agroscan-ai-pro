
import React from 'react';
import { Camera, Mic, Video, Droplets, Calendar, Calculator, Shield, Warehouse, Globe, Store, PieChart, Zap, Users, FileText, Plane, Leaf, ArrowRight, TrendingUp, CloudSun } from 'lucide-react';
import { ViewState } from '../types';
import { WeatherWidget, MandiTicker } from './DashboardWidgets';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
  t: any;
  userLocation?: { lat: number; lng: number } | null;
  userName?: string;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate, t, userLocation, userName }) => {
  const tools = [
    { id: 'water', title: t.water_title, icon: Droplets, path: 'water' },
    { id: 'calendar', title: t.calendar_title, icon: Calendar, path: 'calendar' },
    { id: 'fertilizer', title: t.fert_title, icon: Calculator, path: 'fertilizer' },
    { id: 'pesticide', title: t.pest_title, icon: Shield, path: 'pesticide' },
    { id: 'yield', title: t.yield_title, icon: Leaf, path: 'yield' },
    { id: 'market', title: t.market_title, icon: Globe, path: 'market' },
    { id: 'profit', title: t.profit_title, icon: PieChart, path: 'profit' },
    { id: 'electricity', title: t.power_title, icon: Zap, path: 'electricity' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Welcome Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end border-b border-tech-border pb-6">
        <div>
           <h2 className="text-tech-cyan font-bold text-sm uppercase tracking-[0.2em] mb-1">Dashboard</h2>
           <h1 className="text-3xl md:text-5xl font-display font-bold text-tech-primary">
             {userName || 'Farmer Unit'}
           </h1>
        </div>
        <div className="text-right mt-4 md:mt-0">
           <p className="text-tech-secondary text-sm font-mono">{new Date().toDateString()}</p>
           <p className="text-tech-amber text-sm font-bold uppercase flex items-center justify-end gap-1">
             <span className="w-2 h-2 bg-tech-amber rounded-full animate-pulse"></span> System Active
           </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Main Action: AI Scanner */}
        <div onClick={() => onNavigate('scan')} className="col-span-12 lg:col-span-6 tech-card p-8 relative overflow-hidden group cursor-pointer">
           <div className="absolute inset-0 bg-gradient-to-r from-tech-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
           <div className="relative z-10 flex justify-between items-start h-full">
              <div className="flex flex-col justify-between h-full min-h-[180px]">
                 <div>
                    <span className="bg-tech-cyan/20 text-tech-cyan text-[10px] font-bold px-2 py-1 rounded border border-tech-cyan/30 uppercase">AI Diagnosis</span>
                    <h3 className="text-3xl font-display font-bold text-tech-primary mt-3 leading-tight">SCAN CROP<br/>HEALTH</h3>
                 </div>
                 <div className="flex items-center gap-3 text-tech-cyan font-bold uppercase text-sm tracking-wider">
                    Initiate <ArrowRight size={18} />
                 </div>
              </div>
              <div className="w-24 h-24 rounded-full bg-tech-bg border border-tech-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(77,208,225,0.1)] group-hover:scale-110 transition-transform">
                 <Camera size={40} className="text-tech-cyan" />
              </div>
           </div>
        </div>

        {/* Live Assistant */}
        <div onClick={() => onNavigate('live')} className="col-span-12 md:col-span-6 lg:col-span-3 tech-card p-6 cursor-pointer hover:border-tech-amber/50 group">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-tech-bg rounded-lg border border-tech-border group-hover:border-tech-amber/50">
                 <Mic size={24} className="text-tech-amber" />
              </div>
              <span className="text-[10px] font-bold text-tech-secondary uppercase tracking-widest">Voice</span>
           </div>
           <h3 className="text-xl font-bold text-tech-primary mb-1">Assistant</h3>
           <p className="text-xs text-tech-secondary">Talk to AI Expert</p>
        </div>

        {/* Schemes */}
        <div onClick={() => onNavigate('schemes')} className="col-span-12 md:col-span-6 lg:col-span-3 tech-card p-6 cursor-pointer hover:border-white/30 group">
           <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-tech-bg rounded-lg border border-tech-border group-hover:border-white/30">
                 <FileText size={24} className="text-white" />
              </div>
              <span className="text-[10px] font-bold text-tech-secondary uppercase tracking-widest">Finance</span>
           </div>
           <h3 className="text-xl font-bold text-tech-primary mb-1">Schemes</h3>
           <p className="text-xs text-tech-secondary">Loans & Subsidy</p>
        </div>

        {/* Weather Widget Area */}
        <div className="col-span-12 md:col-span-8 h-40">
           <WeatherWidget userLocation={userLocation || null} t={t} />
        </div>

        {/* Mandi Ticker */}
        <div className="col-span-12 md:col-span-4 h-40">
           <MandiTicker userLocation={userLocation || null} t={t} />
        </div>

      </div>

      {/* Tools Grid */}
      <div className="mt-10">
         <h3 className="text-tech-secondary text-xs font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-tech-border"></span>
            Operational Tools
            <span className="h-px flex-1 bg-tech-border"></span>
         </h3>
         
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {tools.map((tool) => (
               <div 
                  key={tool.id}
                  onClick={() => onNavigate(tool.path as ViewState)}
                  className="tech-card p-4 flex flex-col items-center justify-center text-center gap-3 hover:bg-tech-cardHover cursor-pointer group min-h-[140px]"
               >
                  <div className="text-tech-secondary group-hover:text-tech-cyan transition-colors">
                     <tool.icon size={28} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-bold text-tech-primary uppercase tracking-wide group-hover:text-white">{tool.title}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
