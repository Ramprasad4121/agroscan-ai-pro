
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, StopCircle, Loader2, Pause } from 'lucide-react';
import { blobToBase64, playAudio } from '../utils';
import { transcribeAudio, speakText } from '../services/gemini';
import { getLanguageName } from '../translations';

interface VoiceInputProps {
  onInput: (text: string) => void;
  languageCode: string;
  placeholder?: string;
  compact?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onInput, languageCode, placeholder, compact }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
        setIsProcessing(true);
        try {
           const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
           const blob = new Blob(chunksRef.current, { type: mimeType });
           const base64 = await blobToBase64(blob);
           const langName = getLanguageName(languageCode);
           
           const text = await transcribeAudio(base64, mimeType, langName);
           if (text) onInput(text);
        } catch (error) {
           console.error("Transcription failed", error);
        } finally {
           setIsProcessing(false);
        }
        
        // Stop tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isProcessing}
      className={`flex items-center justify-center transition-all duration-300 ${
        compact 
          ? 'p-2 rounded-full' 
          : 'p-3 rounded-xl'
      } ${
        isRecording 
          ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse' 
          : isProcessing 
            ? 'bg-slate-200 text-slate-500 cursor-wait'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
      title={isRecording ? "Stop Listening" : "Tap to Speak"}
      type="button"
    >
      {isProcessing ? (
        <Loader2 size={compact ? 16 : 20} className="animate-spin" />
      ) : isRecording ? (
        <StopCircle size={compact ? 16 : 20} fill="currentColor" />
      ) : (
        <Mic size={compact ? 16 : 20} />
      )}
    </button>
  );
};

interface TextToSpeechProps {
  text: string;
  languageCode: string;
  label?: string;
  small?: boolean;
}

export const TextToSpeech: React.FC<TextToSpeechProps> = ({ text, languageCode, label, small }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleToggle = async () => {
    if (isPlaying) {
       if (audioSourceRef.current) {
         try { audioSourceRef.current.stop(); } catch(e) {}
         audioSourceRef.current = null;
       }
       setIsPlaying(false);
       return;
    }

    setIsLoading(true);
    try {
       const langName = getLanguageName(languageCode);
       const audioData = await speakText(text, langName);
       const source = await playAudio(audioData);
       
       audioSourceRef.current = source;
       setIsPlaying(true);
       
       source.onended = () => {
          setIsPlaying(false);
          audioSourceRef.current = null;
       };
    } catch (e) {
       console.error("TTS Error", e);
    } finally {
       setIsLoading(false);
    }
  };

  useEffect(() => {
     return () => {
        if (audioSourceRef.current) {
           try { audioSourceRef.current.stop(); } catch(e) {}
        }
     };
  }, []);

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || !text}
      className={`flex items-center gap-2 font-bold transition-colors ${
        small 
          ? 'text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700'
          : 'text-sm px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
      } ${isPlaying ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}`}
    >
      {isLoading ? (
         <Loader2 size={small ? 12 : 16} className="animate-spin" />
      ) : isPlaying ? (
         <Pause size={small ? 12 : 16} fill="currentColor" />
      ) : (
         <Volume2 size={small ? 12 : 16} />
      )}
      {label && <span>{isPlaying ? 'Stop' : label}</span>}
    </button>
  );
};
