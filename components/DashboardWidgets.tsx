
import React, { useState, useEffect } from 'react';
import { CloudSun, TrendingUp, MapPin, AlertTriangle, CloudRain, Wind, Snowflake, Flame, Navigation, ArrowUpRight } from 'lucide-react';
import { searchAgriculturalData } from '../services/gemini';

interface WidgetProps {
  userLocation: { lat: number; lng: number } | null;
  t: any;
}

export const WeatherWidget: React.FC<WidgetProps> = ({ userLocation, t }) => {
  const [weather, setWeather] = useState<string | null>(null);
  const [isAlert, setIsAlert] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!userLocation) return;
      try {
        const prompt = `Current weather and alerts for Lat: ${userLocation.lat}, Lng: ${userLocation.lng}. Short summary (max 15 words).`;
        const data = await searchAgriculturalData(prompt);
        setWeather(data.text);
        if (data.text.toLowerCase().includes('alert') || data.text.toLowerCase().includes('warning')) setIsAlert(true);
      } catch (e) {
        setWeather("Data Unavailable");
      }
    };
    fetchWeather();
  }, [userLocation]);

  return (
    <div className={`h-full w-full tech-card p-6 relative overflow-hidden flex items-center justify-between ${isAlert ? 'border-tech-amber/50' : ''}`}>
       <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
             <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isAlert ? 'bg-tech-amber text-tech-bg' : 'bg-tech-bg border border-tech-border text-tech-secondary'}`}>
                {isAlert ? 'Warning' : 'Live Weather'}
             </span>
          </div>
          <p className="text-lg font-bold text-tech-primary max-w-md leading-tight">
             {weather || <span className="animate-pulse text-tech-secondary">Scanning satellites...</span>}
          </p>
       </div>
       <div className="text-tech-cyan opacity-20">
          {isAlert ? <AlertTriangle size={60} /> : <CloudSun size={60} />}
       </div>
       {/* Grid Background specific to widget */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
    </div>
  );
};

export const MandiTicker: React.FC<WidgetProps> = ({ userLocation, t }) => {
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
       // Mock data or simple fetch for UI demo
       setPrice("Onion: ₹2400/Qt ▲ | Cotton: ₹6200/Qt ▼");
    };
    fetchPrice();
  }, []);

  return (
    <div className="h-full w-full tech-card p-6 flex flex-col justify-center relative overflow-hidden">
       <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-tech-secondary uppercase tracking-wider flex items-center gap-1">
             <TrendingUp size={12} /> Market Pulse
          </span>
          <div className="w-1.5 h-1.5 bg-tech-cyan rounded-full animate-ping"></div>
       </div>
       <div className="text-lg font-bold text-tech-primary font-mono whitespace-nowrap overflow-hidden">
          <div className="animate-marquee inline-block">
             {price || "Loading Market Data..."}
          </div>
       </div>
       <div className="mt-2 h-1 w-full bg-tech-bg rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-tech-cyan animate-[scan_2s_linear_infinite]"></div>
       </div>
    </div>
  );
};
