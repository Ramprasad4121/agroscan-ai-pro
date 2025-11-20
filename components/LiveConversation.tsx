
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Radio, Volume2, Globe, Languages } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { getLanguageName } from '../translations';

interface LiveConversationProps {
  t: any;
  languageCode: string;
}

export const LiveConversation: React.FC<LiveConversationProps> = ({ t, languageCode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [isListening, setIsListening] = useState(false); // User is speaking/mic active
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Re-connect if language changes while connected to ensure model instruction updates
  useEffect(() => {
    if (isConnected) {
      disconnect();
      setTimeout(() => connect(), 500);
    }
  }, [languageCode]);

  const connect = async () => {
    try {
      // 1. Setup Input Audio (16kHz)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputContextRef.current = inputCtx;
      
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = scriptProcessor;
      
      // 2. Setup Output Audio (24kHz)
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 3. Resolve Full Language Name for Prompting
      const activeLanguage = getLanguageName(languageCode);

      // 4. Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: `You are an experienced agricultural consultant named "Kissan AI". 
          CRITICAL INSTRUCTION: You MUST speak and respond ONLY in ${activeLanguage}.
          Even if the user speaks another language, try to respond in ${activeLanguage} or politely ask them to speak ${activeLanguage}.
          Help farmers diagnose issues, understand market trends (Mandi rates), and improve crop yields.
          Keep your answers concise, encouraging, and conversational (under 30 seconds).`,
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setIsConnected(true);
            setIsListening(true);
            
            // Start streaming audio data
            scriptProcessor.onaudioprocess = (e) => {
               const inputData = e.inputBuffer.getChannelData(0);
               // Calculate volume for visualizer
               let sum = 0;
               for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
               const rms = Math.sqrt(sum / inputData.length);
               setVolume(Math.min(rms * 5, 1)); // Boost sensitivity for visualizer

               const pcmBlob = createBlob(inputData);
               sessionPromise.then(session => {
                 session.sendRealtimeInput({ media: pcmBlob });
               });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              setIsSpeaking(true);
              const audioCtx = audioContextRef.current;
              if (!audioCtx) return;

              const pcmValues = decode(audioData);
              const audioBuffer = await decodeAudioData(pcmValues, audioCtx, 24000, 1);
              
              // Schedule playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
              
              const sourceNode = audioCtx.createBufferSource();
              sourceNode.buffer = audioBuffer;
              sourceNode.connect(audioCtx.destination);
              
              sourceNode.addEventListener('ended', () => {
                sourcesRef.current.delete(sourceNode);
                if (sourcesRef.current.size === 0) {
                  setIsSpeaking(false);
                }
              });

              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: () => {
            console.log("Live Session Closed");
            setIsConnected(false);
            setIsListening(false);
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setIsConnected(false);
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Failed to connect:", error);
      alert("Could not access microphone or connect to API.");
    }
  };

  const disconnect = () => {
    // Stop Input
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    
    // Stop Output
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();

    // Reset UI state
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setVolume(0);
  };

  // Helpers
  function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 animate-fade-in bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${isConnected ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="text-center mb-12 relative z-10">
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 text-sm font-bold">
            <Radio size={14} className={isConnected ? "text-rose-500 animate-pulse" : "text-slate-400"} />
            Gemini Live
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-bold">
            <Languages size={14} />
            {getLanguageName(languageCode)} Mode
          </div>
        </div>
        
        <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
          {t.live_title}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
          {t.live_desc}
        </p>
      </div>

      {/* Main Visualizer Interface */}
      <div className="relative mb-12 z-10">
        {/* Outer Rings */}
        {isConnected && (
           <>
             <div className="absolute inset-0 rounded-full border border-rose-500/20 scale-150 animate-[ping_3s_linear_infinite]"></div>
             <div className="absolute inset-0 rounded-full border border-rose-500/10 scale-125 animate-[ping_2s_linear_infinite_reverse]"></div>
           </>
        )}

        <button 
          onClick={isConnected ? disconnect : connect}
          className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 relative ${
          isConnected 
            ? 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-[0_0_60px_rgba(244,63,94,0.4)] scale-110' 
            : 'bg-white dark:bg-slate-800 shadow-2xl hover:scale-105'
        }`}>
          {isConnected ? (
            <div className="relative flex items-center justify-center w-full h-full">
              {/* Audio Reactive Core */}
              <div 
                className="absolute inset-0 rounded-full bg-white/20 blur-md transition-transform duration-75" 
                style={{ transform: `scale(${1 + volume * 1.5})` }}
              ></div>
              
              {isSpeaking ? (
                <div className="flex items-center justify-center gap-1">
                   <div className="w-1.5 bg-white rounded-full animate-[bounce_1s_infinite]" style={{height: '20px'}}></div>
                   <div className="w-1.5 bg-white rounded-full animate-[bounce_1s_infinite_0.1s]" style={{height: '32px'}}></div>
                   <div className="w-1.5 bg-white rounded-full animate-[bounce_1s_infinite_0.2s]" style={{height: '20px'}}></div>
                </div>
              ) : (
                <div className="absolute inset-0 rounded-full border-4 border-white/30 scale-90 animate-pulse"></div>
              )}
              
              <Mic size={48} className="text-white relative z-10" />
            </div>
          ) : (
            <Mic size={48} className="text-slate-400 dark:text-slate-500" />
          )}
        </button>

        {/* Status Badge */}
        {isConnected && (
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-6 py-2 bg-white dark:bg-slate-900 rounded-full shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white whitespace-nowrap animate-fade-in-up">
            <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'} animate-pulse`}></span>
            {isSpeaking ? t.speaking : t.listening}
          </div>
        )}
      </div>

      {/* Instructions */}
      {!isConnected && (
         <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs text-center animate-pulse">
            Tap the microphone to start speaking in <strong>{getLanguageName(languageCode)}</strong>
         </p>
      )}
    </div>
  );
};
