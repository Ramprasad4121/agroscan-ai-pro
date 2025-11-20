
import React, { useState } from 'react';
import { Warehouse, Thermometer, TrendingUp, Calculator, MapPin, Search, DollarSign, AlertCircle } from 'lucide-react';
import { getStorageAdvice, findNearbyResources } from '../services/gemini';
import { StorageAdvice, GroundingResult } from '../types';

interface Props {
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const StorageGuide: React.FC<Props> = ({ t, languageCode, userLocation }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'calculator' | 'locator'>('guide');
  
  // Guide State
  const [crop, setCrop] = useState('');
  const [advice, setAdvice] = useState<StorageAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Locator State
  const [warehouses, setWarehouses] = useState<GroundingResult | null>(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // Calculator State
  const [calc, setCalc] = useState({ quantity: '', rate: '', months: '' });
  const [totalCost, setTotalCost] = useState<number | null>(null);
  const [breakEven, setBreakEven] = useState<number | null>(null);

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      const data = await getStorageAdvice(crop, userLocation, lang);
      setAdvice(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdvice(false);
    }
  };

  const handleFindWarehouses = async () => {
    if (!userLocation) return;
    setLoadingLoc(true);
    try {
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      const query = `Cold storage and warehouses for agricultural produce near me`;
      const data = await findNearbyResources(query, userLocation.lat, userLocation.lng);
      setWarehouses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLoc(false);
    }
  };

  const calculateRent = () => {
    const q = parseFloat(calc.quantity);
    const r = parseFloat(calc.rate);
    const m = parseFloat(calc.months);
    
    if (q && r && m) {
      const cost = q * r * m;
      setTotalCost(cost);
      setBreakEven(cost / q); // Price increase per quintal needed
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-100 text-sky-600 mb-4">
          <Warehouse size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.storage_title || "Storage & Post-Harvest"}</h2>
        <p className="text-slate-500">{t.storage_desc || "Minimize losses & maximize profit."}</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 inline-flex">
          <button onClick={() => setActiveTab('guide')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'guide' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 'text-slate-500'}`}>
            Advice
          </button>
          <button onClick={() => setActiveTab('locator')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'locator' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 'text-slate-500'}`}>
            Find Warehouse
          </button>
          <button onClick={() => setActiveTab('calculator')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'calculator' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 'text-slate-500'}`}>
            Rent Calculator
          </button>
        </div>
      </div>

      {/* ADVICE TAB */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Crop Name</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={crop} 
                  onChange={e => setCrop(e.target.value)} 
                  placeholder="e.g. Potato, Onion, Wheat"
                  className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <button 
                  onClick={handleGetAdvice} 
                  disabled={loadingAdvice || !crop}
                  className="bg-sky-600 text-white px-6 rounded-xl font-bold hover:bg-sky-700 disabled:opacity-50"
                >
                  {loadingAdvice ? "Analyzing..." : "Analyze"}
                </button>
              </div>
           </div>

           {advice && (
             <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
                {/* Conditions Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                     <Thermometer size={20} className="text-orange-500" />
                     Optimal Conditions
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                         <span className="text-xs font-bold text-slate-500 uppercase">Temperature</span>
                         <p className="font-bold text-slate-900 dark:text-white">{advice.optimalConditions.temperature}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                         <span className="text-xs font-bold text-slate-500 uppercase">Humidity</span>
                         <p className="font-bold text-slate-900 dark:text-white">{advice.optimalConditions.humidity}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                         <span className="text-xs font-bold text-slate-500 uppercase">Grain Moisture</span>
                         <p className="font-bold text-slate-900 dark:text-white">{advice.optimalConditions.moistureContent}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                         <span className="text-xs font-bold text-slate-500 uppercase">Shelf Life</span>
                         <p className="font-bold text-slate-900 dark:text-white">{advice.optimalConditions.shelfLife}</p>
                      </div>
                   </div>
                </div>

                {/* Sell vs Store Decision */}
                <div className={`p-6 rounded-2xl border ${
                   advice.marketAnalysis.recommendation === 'STORE' 
                     ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                     : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}>
                   <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                     <TrendingUp size={20} />
                     Market Recommendation
                   </h3>
                   <div className="text-center py-4">
                      <span className={`inline-block px-6 py-2 rounded-full text-xl font-black mb-2 ${
                        advice.marketAnalysis.recommendation === 'STORE'
                          ? 'bg-green-500 text-white'
                          : 'bg-amber-500 text-white'
                      }`}>
                        {advice.marketAnalysis.recommendation}
                      </span>
                      <p className="font-bold text-slate-700 dark:text-slate-300 mt-2">
                        Trend: {advice.marketAnalysis.trend}
                      </p>
                   </div>
                   <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                     {advice.marketAnalysis.reason}
                   </p>
                </div>

                {/* Tips */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <h3 className="font-bold text-slate-900 dark:text-white mb-3">Expert Tips to Reduce Loss</h3>
                   <ul className="space-y-2">
                     {advice.tips.map((tip, i) => (
                       <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                         <AlertCircle size={16} className="text-sky-500 shrink-0 mt-0.5" />
                         {tip}
                       </li>
                     ))}
                   </ul>
                </div>
             </div>
           )}
        </div>
      )}

      {/* LOCATOR TAB */}
      {activeTab === 'locator' && (
        <div className="space-y-6">
           {!userLocation ? (
              <div className="text-center p-10 text-slate-500">
                 <MapPin size={40} className="mx-auto mb-2 opacity-50" />
                 {t.location_req}
              </div>
           ) : (
             <div className="text-center">
                <button 
                  onClick={handleFindWarehouses} 
                  disabled={loadingLoc}
                  className="bg-sky-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-700 disabled:opacity-50 shadow-lg shadow-sky-200 dark:shadow-none"
                >
                   {loadingLoc ? "Searching..." : "Find Warehouses Nearby"}
                </button>
             </div>
           )}

           {warehouses && warehouses.chunks.length > 0 && (
              <div className="grid gap-4 mt-6">
                 {warehouses.chunks.map((chunk, i) => (
                    chunk.maps ? (
                       <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:shadow-md transition-all">
                          <div>
                             <h4 className="font-bold text-slate-900 dark:text-white">{chunk.maps.title}</h4>
                             {chunk.maps.rating && <span className="text-xs text-amber-500 font-bold">★ {chunk.maps.rating}</span>}
                          </div>
                          <a 
                            href={chunk.maps.googleMapsUri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sky-600 bg-sky-50 dark:bg-sky-900/20 px-4 py-2 rounded-lg font-bold text-sm"
                          >
                            View Map
                          </a>
                       </div>
                    ) : null
                 ))}
              </div>
           )}
        </div>
      )}

      {/* CALCULATOR TAB */}
      {activeTab === 'calculator' && (
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl mx-auto">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <Calculator size={20} /> Storage Cost Estimator
            </h3>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Quantity (Quintals)</label>
                  <input type="number" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800" 
                    value={calc.quantity} onChange={e => setCalc({...calc, quantity: e.target.value})} placeholder="e.g. 100" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Rent Rate (₹ per Quintal/Month)</label>
                  <input type="number" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800" 
                    value={calc.rate} onChange={e => setCalc({...calc, rate: e.target.value})} placeholder="e.g. 40 (Cold Storage approx)" />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1">Duration (Months)</label>
                  <input type="number" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-50 dark:bg-slate-800" 
                    value={calc.months} onChange={e => setCalc({...calc, months: e.target.value})} placeholder="e.g. 3" />
               </div>

               <button onClick={calculateRent} className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl mt-4">
                  Calculate
               </button>
            </div>

            {totalCost !== null && (
               <div className="mt-8 p-5 bg-slate-50 dark:bg-slate-800 rounded-xl text-center">
                  <p className="text-sm text-slate-500 mb-1">Total Estimated Rent</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mb-4">₹{totalCost.toLocaleString()}</p>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                     <p className="text-xs text-slate-500 mb-1">Break-Even Analysis</p>
                     <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Market price must rise by <span className="font-bold text-green-600">₹{breakEven?.toFixed(1)} / Quintal</span> to cover storage cost.
                     </p>
                  </div>
               </div>
            )}
         </div>
      )}
    </div>
  );
};
