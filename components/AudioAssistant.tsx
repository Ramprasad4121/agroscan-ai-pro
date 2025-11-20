
import React, { useState, useRef } from 'react';
import { Mic, Square, FileAudio, Type } from 'lucide-react';
import { blobToBase64 } from '../utils';
import { transcribeAudio as transcribeService } from '../services/gemini';

interface AudioAssistantProps {
  t: any;
}

export const AudioAssistant: React.FC<AudioAssistantProps> = ({ t }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // Get the actual mime type from the recorder (e.g., audio/webm;codecs=opus)
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const base64 = await blobToBase64(blob);
        handleTranscribe(base64, mimeType);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTranscription(null);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert(t.error_mic || "Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleTranscribe = async (base64: string, mimeType: string) => {
    setTranscription(t.transcribing || "Transcribing audio...");
    try {
      const text = await transcribeService(base64, mimeType);
      setTranscription(text);
    } catch (error) {
      setTranscription(t.transcribing_error || "Error transcribing audio.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-display font-bold text-slate-900">{t.voice_title}</h2>
        <p className="text-slate-500 mt-2">{t.voice_desc}</p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center bg-slate-50 border-b border-slate-100 min-h-[200px]">
           <div className={`relative w-24 h-24 flex items-center justify-center rounded-full transition-all duration-300 ${isRecording ? 'bg-red-50 text-red-500 scale-110 shadow-red-200 shadow-xl' : 'bg-slate-200 text-slate-500'}`}>
             {isRecording && <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></div>}
             <Mic size={40} />
           </div>
           <div className="mt-8">
             {!isRecording ? (
               <button 
                 onClick={startRecording}
                 className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300"
               >
                 {t.start_record}
               </button>
             ) : (
               <button 
                 onClick={stopRecording}
                 className="px-8 py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-all shadow-lg hover:shadow-red-200 flex items-center gap-2"
               >
                 <Square size={18} fill="currentColor" /> {t.stop_transcribe}
               </button>
             )}
           </div>
        </div>

        <div className="p-8">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Type size={16} /> {t.transcription_res}
           </h3>
           <div className="bg-slate-50 rounded-xl p-6 min-h-[100px] text-slate-700 leading-relaxed">
             {transcription || <span className="text-slate-400 italic">{t.gen_placeholder}</span>}
           </div>
        </div>
      </div>
    </div>
  );
};
