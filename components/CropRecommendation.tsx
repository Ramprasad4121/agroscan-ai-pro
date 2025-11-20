
import React, { useState, useEffect } from 'react';
import { Sprout, MapPin, Droplets, Sun, RefreshCw, RotateCcw } from 'lucide-react';
import { recommendCrops } from '../services/gemini';
import { CropRecommendation as CropRecType } from '../types';
import { TextToSpeech } from './VoiceControls';

interface CropRecommendationProps {
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const CropRecommendation: React.FC<CropRecommendationProps> = ({ t, languageCode, userLocation }) => {
  const [recommendations, setRecommendations] = useState<CropRecType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevCrop, setPrevCrop] = useState('');

  const handleGetRecommendations = async () => {
    if (!userLocation) {
      setError(t.location_req || "Location access is required for this feature.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const langName = languageCode === 'hi' ? 'Hindi' : 'English';
      const results = await recommendCrops(userLocation.lat, userLocation.lng, langName, prevCrop);
      setRecommendations(results);
    } catch (e) {
      console.error(e);
      setError(t.error_generic || "Failed to get recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Initial auto-fetch skipped if we want user to input prev crop first, 
  // but we can fetch general recs if prev crop is empty.
  useEffect(() => {
    if (userLocation && recommendations.length === 0 && !loading && !error) {
       handleGetRecommendations();
    }
  }, [userLocation]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 text-teal-600 mb-4">
          <Sprout size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.rec_title || "Crop Advisor"}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.rec_desc || "Best crops for your location & rotation."}</p>
      </div>

      {!userLocation ? (
         <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
            <MapPin className="mx-auto text-amber-500 mb-2" size={32} />
            <h3 className="font-bold text-amber-800 dark:text-amber-200">{t.location_req}</h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">Please enable location services to get personalized crop advice.</p>
         </div>
      ) : (
         <>
           {/* Rotation Input */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 max-w-xl mx-auto">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                 <RotateCcw size={16} />
                 Previous Crop (Optional)
              </label>
              <div className="flex gap-2">
                 <input 
                    type="text" 
                    value={prevCrop}
                    onChange={(e) => setPrevCrop(e.target.value)}
                    placeholder="e.g. Cotton (to plan rotation)"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                 />
                 <button 
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="bg-teal-600 text-white px-6 rounded-xl font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
                 >
                    {loading ? "..." : "Plan"}
                 </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Enter what you grew last season to get <strong>Crop Rotation</strong> advice that improves soil.</p>
           </div>

           {loading && (
             <div className="text-center py-12">
                <div className="relative w-20 h-20 mx-auto mb-6">
                   <div className="absolute inset-0 border-4 border-teal-100 dark:border-teal-900 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                   <Sprout className="absolute inset-0 m-auto text-teal-500" size={24} />
                </div>
                <p className="text-slate-500 font-medium animate-pulse">{t.rec_loading || "Analyzing soil and climate..."}</p>
             </div>
           )}

           {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-xl text-center mb-6">
                 {error}
                 <button onClick={handleGetRecommendations} className="block mx-auto mt-2 text-sm font-bold underline">Try Again</button>
              </div>
           )}

           {!loading && recommendations.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {recommendations.map((crop, idx) => (
                 <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden animate-slide-up" style={{animationDelay: `${idx * 100}ms`}}>
                    {/* Score Indicator */}
                    <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                       {crop.suitabilityScore}% {t.suitability}
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                       <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-xl">
                          {crop.cropName.charAt(0)}
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white">{crop.cropName}</h3>
                       <TextToSpeech text={`${crop.cropName}. ${crop.reason}. Season: ${crop.season}. Requirements: ${crop.requirements}`} languageCode={languageCode} small />
                    </div>

                    <div className="space-y-3">
                       <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-700">
                          {crop.reason}
                       </div>
                       
                       <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                             <Sun size={14} className="text-orange-400" />
                             {crop.season}
                          </div>
                          <div className="flex items-center gap-1.5">
                             <Droplets size={14} className="text-blue-400" />
                             {crop.requirements}
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
         </>
      )}
    </div>
  );
};
