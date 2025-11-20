
import React, { useState, useRef } from 'react';
import { Video, Upload, Play, BrainCircuit, FileVideo } from 'lucide-react';
import { analyzeVideo } from '../services/gemini';
import { fileToGenerativePart } from '../utils';

interface VideoAnalyzerProps {
  t: any;
}

export const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ t }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    try {
      const { inlineData } = await fileToGenerativePart(videoFile);
      const result = await analyzeVideo(inlineData.data, inlineData.mimeType, "Analyze this agricultural video. Identify the crop, potential issues, growth stage, and provide recommendations.");
      setAnalysis(result);
    } catch (error) {
      setAnalysis(t.video_analyze_error || "Failed to analyze.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mb-4">
          <Video size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900">{t.video_title_page}</h2>
        <p className="text-slate-500 mt-2">{t.video_desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] bg-slate-50 hover:bg-white hover:border-blue-400 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="video/*" 
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
            />
            
            {previewUrl ? (
              <video src={previewUrl} controls className="w-full rounded-lg max-h-[250px]" />
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <p className="font-medium text-slate-700">{t.click_upload}</p>
                <p className="text-sm text-slate-400 mt-1">MP4, WebM, MOV</p>
              </>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!videoFile || isAnalyzing}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isAnalyzing ? (
              <>
                <BrainCircuit className="animate-pulse" /> {t.analyzing_video}
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" /> {t.start_analysis}
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileVideo className="text-slate-400" />
            {t.analysis_results}
          </h3>
          
          {analysis ? (
            <div className="prose prose-slate prose-sm max-w-none">
               <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">{analysis}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-10">
              <BrainCircuit size={48} className="mb-4 opacity-20" />
              <p>{t.ai_insights}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
