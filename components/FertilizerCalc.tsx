
import React, { useState } from 'react';
import { Sprout, Calculator, Leaf, Coins } from 'lucide-react';
import { calculateFertilizer } from '../services/gemini';
import { FertilizerPlan } from '../types';

interface Props {
  t: any;
  languageCode: string;
}

export const FertilizerCalc: React.FC<Props> = ({ t, languageCode }) => {
  const [form, setForm] = useState({ crop: '', stage: '', acres: '' });
  const [plan, setPlan] = useState<FertilizerPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalc = async () => {
    setLoading(true);
    try {
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      const data = await calculateFertilizer(form.crop, form.stage, form.acres, lang);
      setPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
          <Calculator size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.fert_title}</h2>
        <p className="text-slate-500">{t.fert_desc}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.plant_id}</label>
            <input type="text" className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} placeholder="e.g. Rice" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.crop_stage}</label>
            <input type="number" className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} placeholder="30" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{t.acres}</label>
            <input type="number" className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              value={form.acres} onChange={e => setForm({...form, acres: e.target.value})} placeholder="1" />
          </div>
        </div>
        <button onClick={handleCalc} disabled={loading || !form.crop} className="w-full mt-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50">
          {loading ? "Calculating..." : t.calc_dose}
        </button>
      </div>

      {plan && (
        <div className="space-y-6 animate-slide-up">
          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold">
                 <tr>
                   <th className="px-6 py-3">Product</th>
                   <th className="px-6 py-3">Dose / Acre</th>
                   <th className="px-6 py-3">Cost</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {plan.recommendations.map((rec, i) => (
                   <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                     <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{rec.product}</td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{rec.dosagePerAcre}</td>
                     <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{rec.costEstimate}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-100 dark:border-emerald-800 flex justify-between items-center">
               <span className="font-bold text-emerald-800 dark:text-emerald-200">Total Estimated Cost</span>
               <span className="font-bold text-xl text-emerald-700 dark:text-emerald-300">{plan.totalCost}</span>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Leaf className="text-green-500" size={20} />
                  {t.organic_alt}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                  {plan.organicAlternatives.map((alt, i) => <li key={i}>{alt}</li>)}
                </ul>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Coins className="text-amber-500" size={20} />
                  ROI Tip
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{plan.roiTips}</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
