
import React, { useState } from 'react';
import { PlantDiagnosis, GroundingResult } from '../types';
import { CheckCircle2, AlertTriangle, Thermometer, Activity, AlertCircle, Volume2, StopCircle, Loader2, Search, MapPin, Landmark, AlertOctagon, ExternalLink, Bug, FlaskConical } from 'lucide-react';
import { speakText, getDiagnosisAssistance } from '../services/gemini';
import { playAudio } from '../utils';
import { LANGUAGES } from '../translations';

interface AnalysisResultProps {
  diagnosis: PlantDiagnosis;
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ diagnosis, t, languageCode, userLocation }) => {
  const isHealthy = diagnosis.isHealthy;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  
  // Assistance State
  const [loadingAssistance, setLoadingAssistance] = useState(false);
  const [assistanceData, setAssistanceData] = useState<GroundingResult | null>(null);
  const [assistanceError, setAssistanceError] = useState(false);

  const handleSpeak = async () => {
    // Stop if currently playing
    if (isPlaying && audioSource) {
      try {
        audioSource.stop();
      } catch (e) {}
      setIsPlaying(false);
      setAudioSource(null);
      return;
    }

    if (isLoadingAudio) return;

    setIsLoadingAudio(true);
    try {
      // Construct text to read in the correct language context
      const textToRead = `${diagnosis.plantName}. ${diagnosis.isHealthy ? t.healthy : diagnosis.diseaseName}. ${diagnosis.expertAdvice}`;
      
      const selectedLang = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';
      const audioBase64 = await speakText(textToRead, selectedLang);
      
      const source = await playAudio(audioBase64);
      setAudioSource(source);
      setIsPlaying(true);
      
      source.onended = () => {
        setIsPlaying(false);
        setAudioSource(null);
      };
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleFetchAssistance = async () => {
    if (!userLocation) return;
    setLoadingAssistance(true);
    setAssistanceError(false);
    try {
      const selectedLang = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';
      const result = await getDiagnosisAssistance(
        diagnosis.plantName,
        diagnosis.diseaseName || 'general crop care',
        userLocation,
        selectedLang
      );
      setAssistanceData(result);
    } catch (e) {
      console.error(e);
      setAssistanceError(true);
    } finally {
      setLoadingAssistance(false);
    }
  };

  const getDiagnosisIcon = () => {
    if (isHealthy) return <CheckCircle2 size={28} />;
    switch (diagnosis.issueType) {
      case 'Pest': return <Bug size={28} />;
      case 'Deficiency': return <FlaskConical size={28} />;
      default: return <AlertTriangle size={28} />;
    }
  };

  const getDiagnosisColor = () => {
    if (isHealthy) return 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400';
    switch (diagnosis.issueType) {
      case 'Deficiency': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400';
      case 'Pest': return 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400';
      default: return 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Main Diagnosis Card */}
      <div className={`rounded-2xl p-6 border ${
        isHealthy 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50' 
          : diagnosis.issueType === 'Deficiency' 
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50'
            : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${getDiagnosisColor()}`}>
              {getDiagnosisIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                  {isHealthy ? t.healthy : diagnosis.diseaseName || t.issue_detected}
                </h2>
                {!isHealthy && diagnosis.issueType && diagnosis.issueType !== 'Other' && (
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/50 dark:bg-black/20 border border-black/5">
                     {diagnosis.issueType}
                   </span>
                )}
              </div>
              <p className={`${isHealthy ? 'text-green-700 dark:text-green-300' : 'text-slate-600 dark:text-slate-300'}`}>
                {isHealthy 
                  ? (languageCode === 'en' ? 'Your plant looks vibrant and well-nourished.' : t.healthy)
                  : (languageCode === 'en' ? 'Potential issue detected by AI.' : t.issue_detected)}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSpeak}
            disabled={isLoadingAudio}
            className={`p-3 rounded-full transition-all backdrop-blur-sm shadow-sm flex items-center justify-center min-w-[48px] min-h-[48px] ${
               isLoadingAudio 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-wait' 
                : 'bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 text-slate-600 dark:text-slate-300 hover:text-agro-600 dark:hover:text-agro-400'
            }`}
            title="Listen to Diagnosis"
          >
            {isLoadingAudio ? (
              <Loader2 size={24} className="animate-spin text-agro-600 dark:text-agro-400" />
            ) : isPlaying ? (
              <StopCircle size={24} className="animate-pulse text-red-600 dark:text-red-400" />
            ) : (
              <Volume2 size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Symptoms Refactored - Card Grid */}
      {!isHealthy && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="text-amber-500" size={20} />
            {t.symptoms}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {diagnosis.symptoms.map((symptom, idx) => (
              <div key={idx} className="group relative bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:border-red-200 dark:hover:border-red-900/30 flex items-start gap-3">
                 {/* Background decorative icon */}
                 <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Search size={40} className="text-slate-900 dark:text-white" />
                 </div>
                 
                 <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm shrink-0">
                    {idx + 1}
                 </div>
                 <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                       {t.symptoms || "Observation"}
                    </span>
                    <p className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                       {symptom}
                    </p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatments & Prevention Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Thermometer className="text-agro-500" size={20} />
            {t.treatments}
          </h3>
          <ul className="space-y-3">
            {diagnosis.treatments.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 group">
                <div className="min-w-[6px] h-[6px] mt-2 rounded-full bg-agro-500 group-hover:scale-150 transition-transform" />
                <span className="group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertCircle className="text-blue-500" size={20} />
            {t.prevention}
          </h3>
          <ul className="space-y-3">
            {diagnosis.preventiveMeasures.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 group">
                <div className="min-w-[6px] h-[6px] mt-2 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                <span className="group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expert Advice */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-6">
        <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-3">{t.expert_advice}</h3>
        <p className="text-indigo-800 dark:text-indigo-200 leading-relaxed text-sm md:text-base">
          {diagnosis.expertAdvice}
        </p>
      </div>

      {/* Local Support & Resources Section - NEW */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-amber-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-amber-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
             <Landmark size={20} className="text-orange-600" />
             Local Support & Smart Actions
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Get info on nearby KVKs, pest outbreaks, and government schemes.
          </p>
        </div>

        <div className="p-6">
           {!assistanceData ? (
             <div className="text-center">
               {!userLocation ? (
                 <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
                   <MapPin size={16} />
                   Enable location to find local resources.
                 </p>
               ) : (
                 <button 
                   onClick={handleFetchAssistance}
                   disabled={loadingAssistance}
                   className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-70"
                 >
                   {loadingAssistance ? (
                     <>
                       <Loader2 size={18} className="animate-spin" /> 
                       Checking Regional Status...
                     </>
                   ) : (
                     <>
                       <MapPin size={18} />
                       Locate Nearby Help & Schemes
                     </>
                   )}
                 </button>
               )}
               {assistanceError && (
                  <p className="text-xs text-red-500 mt-3">Failed to fetch local data. Try again.</p>
               )}
             </div>
           ) : (
             <div className="space-y-6 animate-fade-in">
               <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                    {assistanceData.text}
                  </div>
               </div>
               
               {assistanceData.chunks && assistanceData.chunks.length > 0 && (
                 <div className="flex flex-wrap gap-2 pt-4 border-t border-amber-100 dark:border-slate-700">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
                      <ExternalLink size={12} /> Verified Sources
                   </span>
                   {assistanceData.chunks.map((chunk, i) => (
                     chunk.web?.uri ? (
                       <a 
                         key={i} 
                         href={chunk.web.uri} 
                         target="_blank" 
                         rel="noreferrer"
                         className="px-3 py-1 bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-600 rounded-lg text-xs font-medium text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-slate-700 truncate max-w-[200px] transition-colors"
                       >
                         {chunk.web.title || "Source"}
                       </a>
                     ) : null
                   ))}
                 </div>
               )}

               {/* Alert Banner if content suggests outbreak */}
               {(assistanceData.text.toLowerCase().includes("outbreak") || assistanceData.text.toLowerCase().includes("alert")) && (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3 items-start">
                     <AlertOctagon size={24} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                     <div>
                        <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">Regional Alert Detected</h4>
                        <p className="text-xs text-red-700 dark:text-red-200">
                           Please verify local reports immediately. There might be widespread issues in your district.
                        </p>
                     </div>
                  </div>
               )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
