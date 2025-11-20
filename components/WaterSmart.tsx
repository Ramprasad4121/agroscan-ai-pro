
import React, { useState, useEffect } from 'react';
import { Droplets, MapPin, CloudRain, Sun, AlertTriangle, CheckCircle, TrendingUp, RefreshCw } from 'lucide-react';
import { analyzeWaterStress } from '../services/gemini';
import { WaterStressAnalysis } from '../types';

interface WaterSmartProps {
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const WaterSmart: React.FC<WaterSmartProps> = ({ t, languageCode, userLocation }) => {
  const [analysis, setAnalysis] = useState<WaterStressAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!userLocation) {
      setError(t.location_req || "Location required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const langName = languageCode === 'hi' ? 'Hindi' : 'English';
      const data = await analyzeWaterStress(userLocation.lat, userLocation.lng, langName);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
      setError(t.error_generic || "Failed to analyze water stress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation && !analysis) {
      fetchAnalysis();
    }
  }, [userLocation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'Low': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      case 'Good': return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
      case 'Saturated': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
          <Droplets size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.water_title || "Water Smart"}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.water_desc || "Satellite-based irrigation alerts."}</p>
      </div>

      {!userLocation ? (
         <div className="text-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <MapPin size={40} className="mx-auto text-slate-400 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">{t.location_req}</p>
         </div>
      ) : loading ? (
         <div className="flex flex-col items-center justify-center py-20">
             <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <CloudRain className="absolute inset-0 m-auto text-blue-500" size={32} />
             </div>
             <p className="text-lg font-medium text-slate-600 dark:text-slate-300 animate-pulse">{t.analyzing_water || "Analyzing weather & satellite models..."}</p>
         </div>
      ) : error ? (
         <div className="text-center p-10 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600">
            <p>{error}</p>
            <button onClick={fetchAnalysis} className="mt-4 px-6 py-2 bg-white dark:bg-red-950 rounded-full shadow text-sm font-bold">Try Again</button>
         </div>
      ) : analysis && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Current Status */}
            <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 z-10 relative">{t.soil_status || "Soil Moisture"}</h3>
               
               {/* Gauge Visualization */}
               <div className="relative w-48 h-48 mb-6 z-10">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path 
                      className={`${analysis.soilMoistureLevel < 30 ? 'text-red-500' : analysis.soilMoistureLevel < 50 ? 'text-amber-500' : 'text-emerald-500'} transition-all duration-1000 ease-out`}
                      strokeDasharray={`${analysis.soilMoistureLevel}, 100`} 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-bold text-slate-900 dark:text-white">{analysis.soilMoistureLevel}%</span>
                     <span className={`text-xs font-bold px-2 py-1 rounded-full mt-1 ${getStatusColor(analysis.status)}`}>
                       {analysis.status === 'Critical' && t.moisture_critical || analysis.status}
                     </span>
                  </div>
               </div>
               
               {/* Status Message */}
               <div className={`p-4 rounded-xl w-full text-sm font-medium border ${getStatusColor(analysis.status)} z-10`}>
                  {analysis.status === 'Critical' ? "Immediate Irrigation Required" : analysis.status === 'Low' ? "Plan Irrigation Soon" : "Soil Moisture Optimal"}
               </div>

               {/* Background Wave */}
               <div className={`absolute bottom-0 left-0 w-full h-1/3 opacity-10 ${analysis.status === 'Critical' ? 'bg-red-500' : 'bg-blue-500'} rounded-b-2xl`}></div>
            </div>

            {/* Card 2: Today's Advice */}
            <div className="md:col-span-2 flex flex-col gap-6">
               <div className={`flex-1 rounded-2xl p-8 shadow-sm border flex flex-col md:flex-row items-center gap-8 relative overflow-hidden ${
                  analysis.irrigationToday 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-500 shadow-blue-200' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
               }`}>
                  {/* Icon Circle */}
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center shrink-0 ${
                     analysis.irrigationToday 
                       ? 'bg-white/20 backdrop-blur-md border border-white/30' 
                       : 'bg-green-50 dark:bg-green-900/20 text-green-600'
                  }`}>
                     {analysis.irrigationToday ? (
                       <Droplets size={48} className="animate-bounce" />
                     ) : (
                       <CheckCircle size={48} />
                     )}
                  </div>

                  <div className="text-center md:text-left z-10">
                     <h3 className="text-lg font-bold opacity-90 uppercase tracking-wider mb-1">{t.irrigation_advice || "Today's Advice"}</h3>
                     <h2 className={`text-3xl md:text-4xl font-display font-bold mb-3 ${analysis.irrigationToday ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                       {analysis.irrigationToday 
                         ? `${t.irrigate_now || "Irrigate Now"}: ${analysis.amount}` 
                         : t.skip_irrigation || "Skip Irrigation"}
                     </h2>
                     <p className={`text-lg ${analysis.irrigationToday ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                       {analysis.reason}
                     </p>
                  </div>

                  {/* Background Decoration for Yes */}
                  {analysis.irrigationToday && (
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>
                  )}
               </div>

               {/* Chart: 7 Day Plan */}
               <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" />
                        {t.water_plan || "7-Day Water Requirement"}
                     </h3>
                  </div>
                  
                  <div className="flex items-end justify-between gap-2 h-48 pt-4">
                     {analysis.weeklyForecast.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                           {/* Weather Icon */}
                           <div className="text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {day.condition.toLowerCase().includes('rain') ? <CloudRain size={16} /> : <Sun size={16} />}
                           </div>
                           
                           {/* Bar */}
                           <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-full flex items-end overflow-hidden">
                              {day.waterMm > 0 && (
                                <div 
                                  className="w-full bg-blue-500 hover:bg-blue-600 transition-all rounded-t-lg"
                                  style={{ height: `${Math.min(day.waterMm * 3, 100)}%` }}
                                >
                                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                      {day.waterMm}mm
                                   </div>
                                </div>
                              )}
                              {/* Rain Indicator pattern if rain expected but 0 irrigation needed? */}
                              {day.waterMm === 0 && day.condition.toLowerCase().includes('rain') && (
                                 <div className="w-full h-12 bg-blue-200/50 dark:bg-blue-900/30 flex items-end justify-center pb-1">
                                    <CloudRain size={12} className="text-blue-400" />
                                 </div>
                              )}
                           </div>
                           
                           {/* Day Label */}
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                              {day.day.slice(0, 3)}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
