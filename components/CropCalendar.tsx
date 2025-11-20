
import React, { useState } from 'react';
import { Calendar, Droplets, Sprout, Scissors, CheckCircle } from 'lucide-react';
import { generateCropCalendar } from '../services/gemini';
import { CalendarEvent } from '../types';

interface CropCalendarProps {
  t: any;
  languageCode: string;
}

export const CropCalendar: React.FC<CropCalendarProps> = ({ t, languageCode }) => {
  const [cropName, setCropName] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!cropName || !sowingDate) return;
    setLoading(true);
    try {
      const langName = languageCode === 'hi' ? 'Hindi' : 'English';
      const result = await generateCropCalendar(cropName, sowingDate, langName);
      setEvents(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'irrigation': return <Droplets className="text-blue-500" size={20} />;
      case 'fertilizer': return <Sprout className="text-green-500" size={20} />;
      case 'harvest': return <Scissors className="text-orange-500" size={20} />;
      default: return <CheckCircle className="text-slate-500" size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-100 text-orange-600 mb-4">
          <Calendar size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.calendar_title || "Crop Calendar"}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.calendar_desc || "Plan your farming activities."}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t.crop_name || "Crop Name"}
            </label>
            <input 
              type="text" 
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Wheat, Cotton"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t.sowing_date || "Sowing Date"}
            </label>
            <input 
              type="date" 
              value={sowingDate}
              onChange={(e) => setSowingDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !cropName || !sowingDate}
            className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               t.generate_calendar || "Generate"
            )}
          </button>
        </div>
      </div>

      {events.length > 0 && (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent dark:before:via-slate-800">
          {events.map((event, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
               {/* Icon */}
               <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {getActivityIcon(event.type)}
               </div>
               
               {/* Card */}
               <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group-hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-orange-600 dark:text-orange-400 text-sm uppercase tracking-wider">{event.date}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">{event.type}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">{event.activity}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{event.description}</p>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};