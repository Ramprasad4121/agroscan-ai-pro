
import React, { useState } from 'react';
import { LANGUAGES } from '../translations';
import { CheckCircle2, Sprout, Search } from 'lucide-react';

interface LanguageSelectorProps {
  onSelect: (code: string) => void;
  userName?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, userName }) => {
  const [search, setSearch] = useState('');

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.localName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-fade-in relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-200/30 dark:bg-green-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl w-full relative z-10 flex flex-col h-[85vh]">
        <div className="text-center mb-8 shrink-0">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-agro-500 to-agro-700 text-white mb-6 shadow-xl shadow-agro-200 dark:shadow-none">
             <Sprout size={40} />
          </div>
          
          {userName ? (
            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-3">
               Namaste, <span className="text-agro-600">{userName}</span>! 🙏
            </h1>
          ) : (
            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-3">
               Welcome / स्वागत हे
            </h1>
          )}
          
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-6">
             Select your preferred language.<br/>
             We support 30+ languages with AI translation.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Language / भाषा खोजें..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-agro-500/20 focus:border-agro-500 outline-none shadow-sm"
             />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 overflow-y-auto p-2 custom-scrollbar pb-20">
           {filteredLanguages.map((lang, idx) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="relative group flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 hover:border-agro-500 dark:hover:border-agro-500 hover:bg-agro-50 dark:hover:bg-agro-900/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full min-h-[160px]"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                 <div className="w-12 h-12 mb-4 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:text-agro-600 transition-colors">
                    {lang.localName.charAt(0)}
                 </div>
                 <span className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:scale-105 transition-transform text-center">
                    {lang.localName}
                 </span>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-agro-600 dark:group-hover:text-agro-400 transition-colors">
                    {lang.name}
                 </span>
                 
                 {/* Selection Ring Animation */}
                 <div className="absolute inset-0 border-2 border-agro-500 rounded-3xl opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-300 pointer-events-none"></div>
                 
                 <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-agro-500">
                    <CheckCircle2 size={24} fill="currentColor" className="text-white dark:text-slate-900" />
                 </div>
              </button>
           ))}
        </div>
        
        <div className="mt-auto pt-6 text-center shrink-0">
           <p className="text-xs font-medium text-slate-400 bg-white/50 dark:bg-slate-900/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm border border-slate-100 dark:border-slate-800">
             🔒 Secure Language Setting • Google Cloud Translation API
           </p>
        </div>
      </div>
    </div>
  );
};
