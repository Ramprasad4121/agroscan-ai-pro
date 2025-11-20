
import React, { useState, useEffect } from 'react';
import { CloudSun, TrendingUp, MapPin, Droplets, Thermometer, Navigation, AlertTriangle, CloudRain, Wind, Snowflake, Flame } from 'lucide-react';
import { searchAgriculturalData } from '../services/gemini';
import { GroundingResult } from '../types';

interface WidgetProps {
  userLocation: { lat: number; lng: number } | null;
  t: any;
}

export const WeatherWidget: React.FC<WidgetProps> = ({ userLocation, t }) => {
  const [weather, setWeather] = useState<string | null>(null);
  const [isAlert, setIsAlert] = useState(false);
  const [alertType, setAlertType] = useState<'rain' | 'wind' | 'frost' | 'heat' | 'general'>('general');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!userLocation) {
        setLoading(false);
        return;
      }
      try {
        const prompt = `Check for severe weather alerts specifically for farmers at Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng} for the next 24-48 hours.
        Look for: Heavy Rain, Hailstorm, Frost, Heatwave, or High Winds.
        Response format:
        If there is a specific risk, start with "ALERT: [TYPE]" (Types: RAIN, WIND, FROST, HEAT). Then give advice.
        If no severe risk, start with "NORMAL:". Then give current temp, condition, and humidity.
        Keep it under 30 words.`;
        
        const data = await searchAgriculturalData(prompt);
        let text = data.text;

        if (text.trim().toUpperCase().includes("ALERT:")) {
           setIsAlert(true);
           if (text.toUpperCase().includes("RAIN") || text.toUpperCase().includes("HAIL")) setAlertType('rain');
           else if (text.toUpperCase().includes("WIND")) setAlertType('wind');
           else if (text.toUpperCase().includes("FROST") || text.toUpperCase().includes("COLD")) setAlertType('frost');
           else if (text.toUpperCase().includes("HEAT")) setAlertType('heat');
           else setAlertType('general');

           text = text.replace(/ALERT:\s*[A-Z]+\s*/i, "").replace(/ALERT:\s*/i, "");
        } else {
           setIsAlert(false);
           text = text.replace(/NORMAL:\s*/i, "");
        }

        setWeather(text);
      } catch (e) {
        console.error(e);
        setWeather("Unavailable");
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [userLocation]);

  const getAlertIcon = () => {
    switch(alertType) {
      case 'rain': return <CloudRain size={24} className="animate-bounce" />;
      case 'wind': return <Wind size={24} className="animate-pulse" />;
      case 'frost': return <Snowflake size={24} className="animate-spin-slow" />;
      case 'heat': return <Flame size={24} className="animate-pulse" />;
      default: return <AlertTriangle size={24} className="animate-bounce" />;
    }
  };

  const getBgClass = () => {
    if (!isAlert) return 'bg-blue-50 dark:bg-blue-900/20'; // Muted background for normal
    switch(alertType) {
      case 'rain': return 'bg-slate-800 text-white';
      case 'heat': return 'bg-orange-600 text-white';
      case 'frost': return 'bg-cyan-700 text-white';
      default: return 'bg-red-600 text-white';
    }
  };

  return (
    <div className={`p-6 h-full relative overflow-hidden transition-all duration-500 ${getBgClass()} flex flex-col justify-center`}>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <h3 className={`font-bold flex items-center gap-2 ${isAlert ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          {isAlert ? (
            <div className="flex items-center gap-2 font-extrabold tracking-wide uppercase text-sm">
              {getAlertIcon()}
              {t.weather_alert || "Warning"}
            </div>
          ) : (
            <>
              <CloudSun size={20} className="text-blue-500" /> 
              {t.weather_today}
            </>
          )}
        </h3>
        {userLocation && (
            <span className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold ${isAlert ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'}`}>
                <MapPin size={10} /> Local
            </span>
        )}
      </div>

      <div className="relative z-10">
        {loading ? (
          <div className="animate-pulse flex flex-col gap-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
        ) : !userLocation ? (
           <div className="text-sm text-slate-400 italic flex items-center gap-2">
             <Navigation size={16} />
             {t.location_req}
           </div>
        ) : (
          <div className={`text-sm leading-relaxed font-medium line-clamp-3 ${isAlert ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
            {weather}
          </div>
        )}
      </div>
    </div>
  );
};

export const MandiTicker: React.FC<WidgetProps> = ({ userLocation, t }) => {
  const [prices, setPrices] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const locationStr = userLocation ? `near ${userLocation.lat}, ${userLocation.lng}` : "in India";
        const prompt = `Latest Mandi prices (APMC rates) for Onion, Tomato, Potato, and Wheat ${locationStr}. Format: Crop - Rate/Qt. Keep it very short.`;
        const data = await searchAgriculturalData(prompt);
        setPrices(data.text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [userLocation]);

  return (
    <div className="p-6 h-full flex flex-col bg-emerald-50 dark:bg-emerald-900/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-600" /> {t.mandi_snapshot}
        </h3>
      </div>
      
      <div className="flex-grow flex items-center">
        {loading ? (
           <div className="animate-pulse space-y-2 w-full">
             <div className="h-4 bg-emerald-200 dark:bg-emerald-800 rounded w-full"></div>
             <div className="h-4 bg-emerald-200 dark:bg-emerald-800 rounded w-2/3"></div>
           </div>
        ) : (
           <div className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 whitespace-pre-wrap font-medium leading-relaxed">
             {prices || "Market data unavailable."}
           </div>
        )}
      </div>
    </div>
  );
};
