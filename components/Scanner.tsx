
import React, { useRef, useState } from 'react';
import { Camera, Upload, ImageIcon, X } from 'lucide-react';
import { fileToGenerativePart, compressImage } from '../utils';
import { analyzePlantImage } from '../services/gemini';
import { PlantDiagnosis } from '../types';
import { LANGUAGES } from '../translations';

interface ScannerProps {
  onAnalyzeStart: () => void;
  onAnalyzeComplete: (result: PlantDiagnosis, image: string) => void;
  onError: (error: any) => void;
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const Scanner: React.FC<ScannerProps> = ({ onAnalyzeStart, onAnalyzeComplete, onError, t, languageCode, userLocation }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t.error_file || "Please upload a valid image file.");
      return;
    }
    setError(null);

    try {
      onAnalyzeStart();
      
      // LOW BANDWIDTH STRATEGY: Compress image before processing
      // Reduces 5MB photo -> ~200KB for faster upload
      const compressedFile = await compressImage(file, 0.7, 1024);
      
      const { inlineData } = await fileToGenerativePart(compressedFile);
      
      // Find language name from code
      const selectedLang = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';
      
      // Analyze
      const result = await analyzePlantImage(inlineData.data, inlineData.mimeType, selectedLang, userLocation);
      
      onAnalyzeComplete(result, `data:${inlineData.mimeType};base64,${inlineData.data}`);
    } catch (err) {
      console.error(err);
      setError(t.error_generic || "Failed to analyze image. Please try again.");
      onError(err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 shadow-sm animate-shake">
           <div className="w-2 h-2 bg-red-500 rounded-full"></div>
           <p className="text-sm font-bold">{error}</p>
           <button onClick={() => setError(null)} className="ml-auto hover:bg-red-100 dark:hover:bg-red-900/40 p-1 rounded-full transition-colors">
            <X size={16} />
           </button>
        </div>
      )}

      <div 
        className={`relative group w-full min-h-[420px] border-3 border-dashed rounded-[2rem] transition-all duration-500 flex flex-col items-center justify-center p-10 text-center overflow-hidden ${
          dragActive 
            ? 'border-agro-500 bg-agro-50 dark:bg-agro-900/20 scale-[1.01] shadow-xl' 
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-agro-300 dark:hover:border-agro-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:shadow-lg'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <div className="relative w-24 h-24 mb-8 group-hover:scale-110 transition-transform duration-500">
          <div className="absolute inset-0 bg-agro-100 dark:bg-agro-900/30 rounded-full opacity-50 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center bg-agro-50 dark:bg-slate-800 rounded-full border border-agro-100 dark:border-agro-900 text-agro-600 dark:text-agro-400 shadow-sm">
            <Upload size={40} strokeWidth={1.5} />
          </div>
        </div>

        <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">
          {t.upload_title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-10 text-base">
          {t.upload_desc}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md relative z-10">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3.5 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
          >
            <ImageIcon size={20} />
            {t.upload_btn}
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-3.5 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2.5"
          >
            <Camera size={20} />
            {t.camera_btn}
          </button>
        </div>
      </div>
    </div>
  );
};
