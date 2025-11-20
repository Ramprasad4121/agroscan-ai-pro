
import React, { useState } from 'react';
import { Shield, AlertOctagon, FlaskConical, Clock, CheckSquare, Droplets } from 'lucide-react';
import { getPesticideSafety } from '../services/gemini';
import { PesticideGuidance } from '../types';

interface Props {
  t: any;
  languageCode: string;
}

export const PesticideAdvisor: React.FC<Props> = ({ t, languageCode }) => {
  const [input, setInput] = useState('');
  const [guide, setGuide] = useState<PesticideGuidance | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      const data = await getPesticideSafety(input, lang);
      setGuide(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-100 text-red-600 mb-4">
          <Shield size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.pest_title}</h2>
        <p className="text-slate-500">{t.pest_desc}</p>
      </div>

      <div className="flex gap-2 mb-8">
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. Imidacloprid, or 'Aphids on Cotton'"
          className="flex-1 p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        />
        <button onClick={handleCheck} disabled={loading || !input} className="bg-red-600 text-white px-8 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-colors shadow-lg shadow-red-200 dark:shadow-none">
          {loading ? "Checking Safety..." : t.check_safety}
        </button>
      </div>

      {guide && (
        <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
           {/* Dosage Card */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FlaskConical className="text-blue-500" size={20} />
                Dosage & Mixing
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                   <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase block mb-1">Dose</span>
                   <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{guide.dosage}</p>
                </div>
                {guide.waterVolume && (
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
                     <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase block mb-1">Water / Acre</span>
                     <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{guide.waterVolume}</p>
                  </div>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">{t.mixing_rules} (WALES Method)</span>
                <ul className="list-decimal list-inside space-y-1 mt-2 text-slate-600 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  {guide.mixingOrder.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
              </div>
           </div>

           {/* Safety Gear */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="text-red-500" size={20} />
                {t.safety_gear}
              </h3>
              <div className="space-y-3">
                {guide.safetyGear.map((gear, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                    <CheckSquare size={18} className="text-green-500" />
                    {gear}
                  </div>
                ))}
              </div>
           </div>

           {/* Warning Footer */}
           <div className="md:col-span-2 flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-3">
                 <Clock className="text-amber-600 shrink-0 mt-1" size={20} />
                 <div>
                    <span className="font-bold text-amber-800 dark:text-amber-200 block mb-1">{t.waiting_period} (PHI)</span>
                    <p className="text-sm text-amber-700 dark:text-amber-300">Wait this many days before harvesting to ensure food safety.</p>
                    <p className="text-lg font-bold text-amber-900 dark:text-amber-100 mt-1">{guide.waitingPeriod}</p>
                 </div>
              </div>
              <div className="flex-1 bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-3">
                 <AlertOctagon className="text-red-600 shrink-0 mt-1" size={20} />
                 <div>
                    <span className="font-bold text-red-800 dark:text-red-200 block mb-1">Compatibility</span>
                    <p className="text-sm text-red-700 dark:text-red-300">{guide.compatibility}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
