
import React, { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, PieChart, ArrowRight, Coins, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculateProfitability } from '../services/gemini';
import { CostBreakdown, ProfitAnalysis } from '../types';

interface Props {
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const ProfitCalculator: React.FC<Props> = ({ t, languageCode, userLocation }) => {
  const [crop, setCrop] = useState('');
  const [acres, setAcres] = useState('1');
  const [yieldVal, setYieldVal] = useState('');
  
  const [costs, setCosts] = useState<CostBreakdown>({
    seeds: 0,
    fertilizers: 0,
    pesticides: 0,
    labor: 0,
    irrigation: 0,
    transport: 0,
    machinery: 0,
    other: 0,
    total: 0
  });

  const [result, setResult] = useState<ProfitAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const updateCost = (field: keyof CostBreakdown, value: string) => {
    const val = parseFloat(value) || 0;
    const newCosts = { ...costs, [field]: val };
    
    // Recalculate total
    const total = newCosts.seeds + newCosts.fertilizers + newCosts.pesticides + 
                  newCosts.labor + newCosts.irrigation + newCosts.transport + 
                  newCosts.machinery + newCosts.other;
    
    setCosts({ ...newCosts, total });
  };

  const handleCalculate = async () => {
    if (!crop) return;
    setLoading(true);
    try {
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      const analysis = await calculateProfitability(
        crop, 
        parseFloat(acres) || 1, 
        costs, 
        yieldVal ? parseFloat(yieldVal) : null, 
        userLocation, 
        lang
      );
      setResult(analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(languageCode === 'en' ? 'en-IN' : languageCode, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
          <Calculator size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.profit_title || "Profit Calculator"}</h2>
        <p className="text-slate-500">{t.profit_desc || "Track costs and project your real farming profit."}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* INPUT SECTION */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <SproutIcon /> Farm Details
             </h3>
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Crop Name</label>
                   <input type="text" value={crop} onChange={e => setCrop(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="e.g. Cotton" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Area (Acres)</label>
                   <input type="number" value={acres} onChange={e => setAcres(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="1" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exp. Yield (Optional)</label>
                   <input type="number" value={yieldVal} onChange={e => setYieldVal(e.target.value)} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="Quintals" />
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                 <Coins className="text-amber-500" /> Cost of Cultivation
               </h3>
               <div className="text-right">
                  <span className="text-xs text-slate-500 block uppercase">Total Cost</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(costs.total)}</span>
               </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <CostInput label="Seeds" value={costs.seeds} onChange={v => updateCost('seeds', v)} />
                <CostInput label="Fertilizers" value={costs.fertilizers} onChange={v => updateCost('fertilizers', v)} />
                <CostInput label="Pesticides" value={costs.pesticides} onChange={v => updateCost('pesticides', v)} />
                <CostInput label="Labor" value={costs.labor} onChange={v => updateCost('labor', v)} />
                <CostInput label="Irrigation" value={costs.irrigation} onChange={v => updateCost('irrigation', v)} />
                <CostInput label="Transport" value={costs.transport} onChange={v => updateCost('transport', v)} />
                <CostInput label="Machinery" value={costs.machinery} onChange={v => updateCost('machinery', v)} />
                <CostInput label="Other" value={costs.other} onChange={v => updateCost('other', v)} />
             </div>

             <button 
               onClick={handleCalculate} 
               disabled={!crop || loading}
               className="w-full mt-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 disabled:opacity-50"
             >
               {loading ? "Analyzing Market & Costs..." : "Calculate Profit"} <ArrowRight size={20} />
             </button>
          </div>
        </div>

        {/* RESULTS SECTION */}
        <div className="space-y-6">
           {result ? (
             <div className="animate-slide-up space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Net Profit</span>
                      <div className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{result.netProfit}</div>
                      <div className="text-sm text-green-700 dark:text-green-300 mt-2 flex items-center gap-1">
                         <TrendingUp size={16} /> ROI: {result.roi}
                      </div>
                   </div>
                   <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Revenue</span>
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{result.totalRevenue}</div>
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                         @ {result.marketPriceUsed} (Mandi Price)
                      </div>
                   </div>
                </div>

                {/* Analysis Chart (Simple CSS Bar) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <PieChart size={20} /> Cost Distribution
                   </h3>
                   <div className="space-y-3">
                      {Object.entries(costs).filter(([k, v]) => k !== 'total' && typeof v === 'number' && v > 0).map(([key, val]) => (
                         <div key={key}>
                            <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-400 capitalize">
                               <span>{key}</span>
                               <span>{Math.round(((val as number) / costs.total) * 100)}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                               <div 
                                 className="bg-indigo-500 h-2 rounded-full transition-all duration-1000" 
                                 style={{ width: `${((val as number) / costs.total) * 100}%` }}
                               ></div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* AI Insights */}
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                   <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-3 flex items-center gap-2">
                      <CheckCircle2 size={20} /> AI Cost Assessment
                   </h3>
                   <p className="text-indigo-800 dark:text-indigo-300 text-sm leading-relaxed mb-4">
                      {result.costAssessment}
                   </p>
                   
                   <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                      <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Optimization Tips</span>
                      <ul className="space-y-2">
                         {result.optimizationTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                               <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                               {tip}
                            </li>
                         ))}
                      </ul>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 min-h-[400px]">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                   <DollarSign size={32} className="opacity-30" />
                </div>
                <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300 mb-2">Ready to Calculate</h3>
                <p className="text-center max-w-xs text-sm">
                   Enter your farm costs on the left. AI will fetch current market prices to show your potential profit.
                </p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const CostInput = ({ label, value, onChange }: { label: string, value: number, onChange: (v: string) => void }) => (
  <div>
     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</label>
     <div className="relative">
       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
       <input 
         type="number" 
         value={value || ''} 
         onChange={e => onChange(e.target.value)} 
         className="w-full pl-6 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
         placeholder="0"
       />
     </div>
  </div>
);

const SproutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.2.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1.7-1.3 2.9-3.3 3-5.5-1.4-1.9-3.5-3-6.2-2z"/></svg>
);
