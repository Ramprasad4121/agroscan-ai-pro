
import React, { useState } from 'react';
import { Sprout, TrendingUp, AlertTriangle, Coins, Warehouse, Wallet, PieChart } from 'lucide-react';
import { predictYield } from '../services/gemini';
import { YieldPrediction } from '../types';

interface Props {
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const YieldEstimator: React.FC<Props> = ({ t, languageCode, userLocation }) => {
  const [form, setForm] = useState({ 
    crop: '', 
    seed: '', 
    sownDate: '', 
    acres: '', 
    irrigation: 'Rainfed',
    soilHealth: '',
    pestHistory: ''
  });
  const [result, setResult] = useState<YieldPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!userLocation) return alert(t.location_req);
    setLoading(true);
    try {
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      const data = await predictYield(
        form.crop, form.seed, form.sownDate, form.acres, form.irrigation,
        form.soilHealth, form.pestHistory,
        userLocation.lat, userLocation.lng, lang
      );
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
          <TrendingUp size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.yield_title}</h2>
        <p className="text-slate-500">{t.yield_desc}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="md:col-span-1 space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit">
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Farm Details</h3>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.plant_id}</label>
            <input type="text" className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" 
              value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} placeholder="e.g. Wheat, Cotton" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.seed_type}</label>
            <input type="text" className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" 
              value={form.seed} onChange={e => setForm({...form, seed: e.target.value})} placeholder="e.g. Hybrid 303" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.sowing_date}</label>
            <input type="date" className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" 
              value={form.sownDate} onChange={e => setForm({...form, sownDate: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.acres}</label>
               <input type="number" className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" 
                 value={form.acres} onChange={e => setForm({...form, acres: e.target.value})} placeholder="2.5" />
             </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.irrigation_type}</label>
               <select className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  value={form.irrigation} onChange={e => setForm({...form, irrigation: e.target.value})}>
                 <option value="Rainfed">Rainfed</option>
                 <option value="Tube Well">Tube Well</option>
                 <option value="Canal">Canal</option>
                 <option value="Drip">Drip</option>
               </select>
             </div>
          </div>

          {/* New Inputs for Advanced Accuracy */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-500 mb-3">Agronomy Factors</h4>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Soil Health</label>
                    <input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" 
                    value={form.soilHealth} onChange={e => setForm({...form, soilHealth: e.target.value})} placeholder="e.g. Sandy, Nitrogen low" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Pest History</label>
                    <input type="text" className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" 
                    value={form.pestHistory} onChange={e => setForm({...form, pestHistory: e.target.value})} placeholder="e.g. Bollworm last year" />
                </div>
            </div>
          </div>

          <button onClick={handlePredict} disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none">
            {loading ? "Analyzing Market & Soil..." : t.predict_yield}
          </button>
        </div>

        {/* Results */}
        <div className="md:col-span-2">
          {result ? (
            <div className="space-y-6 animate-slide-up">
              {/* Profit & Revenue Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                    <Wallet size={18} />
                    <span className="font-bold text-xs uppercase tracking-wide">Net Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{result.netProfit}</p>
                  <p className="text-xs text-green-600 mt-1">Projected Income</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
                    <Coins size={18} />
                    <span className="font-bold text-xs uppercase tracking-wide">{t.revenue_est}</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{result.revenueEstimate}</p>
                  <p className="text-xs text-indigo-600 mt-1">Total Sales</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border border-orange-100 dark:border-orange-800">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-2">
                    <PieChart size={18} />
                    <span className="font-bold text-xs uppercase tracking-wide">Cultivation Cost</span>
                  </div>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{result.costOfCultivation}</p>
                  <p className="text-xs text-orange-600 mt-1">Inputs + Labor</p>
                </div>
              </div>

              {/* Detailed Yield Info */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                 <div>
                    <span className="text-sm text-slate-500 font-bold uppercase">Expected Yield</span>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{result.expectedYield}</h3>
                 </div>
                 <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400">
                        {result.confidenceScore}% Confidence
                    </div>
                 </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                   <AlertTriangle size={20} className="text-red-500" />
                   {t.risk_factors}
                 </h3>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{result.riskAssessment}</p>
                 <div className="mt-4 flex flex-wrap gap-2">
                   {result.factors.map((f, i) => (
                     <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{f}</span>
                   ))}
                 </div>
              </div>

              {/* Storage Advice */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                 <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                   <Warehouse size={20} />
                   Post-Harvest: Store or Sell?
                 </h3>
                 <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed font-medium">{result.storageAdvice}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10">
              <TrendingUp size={48} className="opacity-20 mb-4" />
              <p className="text-center max-w-xs">{t.ai_insights || "Enter crop details to get yield, cost, and profit analysis."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
