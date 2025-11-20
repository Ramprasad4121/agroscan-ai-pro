
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Globe, ExternalLink, Volume2, StopCircle, Loader2 } from 'lucide-react';
import { PlantDiagnosis, ChatMessage } from '../types';
import { chatWithAgronomist, chatWithSearch, speakText } from '../services/gemini';
import { playAudio } from '../utils';
import { LANGUAGES } from '../translations';
import { VoiceInput, TextToSpeech } from './VoiceControls';

interface ChatInterfaceProps {
  diagnosisContext: PlantDiagnosis;
  t: any;
  languageCode: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ diagnosisContext, t, languageCode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chat message when language or context changes, but only if empty
  useEffect(() => {
    if (messages.length === 0) {
      const initMsg = languageCode === 'en' 
        ? `Hello! I've analyzed your ${diagnosisContext.plantName}. Do you have any specific questions?`
        : `${t.chat_title}: ${diagnosisContext.plantName}`;
        
      setMessages([{ role: 'model', text: initMsg }]);
    }
  }, [diagnosisContext, languageCode, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const selectedLang = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';
      let responseText = '';
      let groundingMetadata = null;

      if (useSearch) {
        // Use Search Grounding Model
        const result = await chatWithSearch(
          messages.map(m => ({ role: m.role, text: m.text })), 
          input, 
          selectedLang
        );
        responseText = result.text || "I found no specific results.";
        groundingMetadata = result.groundingMetadata;
      } else {
        // Use Diagnosis Context Model
        responseText = await chatWithAgronomist(
          messages.map(m => ({ role: m.role, text: m.text })), 
          input, 
          diagnosisContext, 
          selectedLang
        );
      }

      setMessages(prev => [...prev, { 
        role: 'model', 
        text: responseText,
        groundingMetadata: groundingMetadata
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 transition-colors">
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-end">
        <button
          onClick={() => setUseSearch(!useSearch)}
          className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
            useSearch 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' 
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Globe size={14} />
          {t.enable_search} {useSearch ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-agro-100 dark:bg-agro-900/30 text-agro-600 dark:text-agro-400'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed group ${
                msg.role === 'user' 
                  ? 'bg-slate-900 dark:bg-slate-700 text-white rounded-tr-none' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>

            {/* Actions & Metadata for Model Messages */}
            {msg.role === 'model' && (
              <div className="ml-11 flex flex-col gap-2 max-w-[85%]">
                 {/* Reusable TTS Component */}
                 <div className="mt-1">
                    <TextToSpeech text={msg.text} languageCode={languageCode} label="Read" small />
                 </div>

                 {/* Render Grounding Citations if available */}
                 {msg.groundingMetadata && msg.groundingMetadata.groundingChunks && (
                   <div className="mt-1">
                     <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                       <ExternalLink size={10} /> {t.search_sources}
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) => (
                         chunk.web?.uri ? (
                           <a 
                             key={i} 
                             href={chunk.web.uri} 
                             target="_blank" 
                             rel="noreferrer"
                             className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded border border-blue-100 dark:border-blue-900 hover:underline truncate max-w-full"
                           >
                             {chunk.web.title || new URL(chunk.web.uri).hostname}
                           </a>
                         ) : null
                       ))}
                     </div>
                   </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm ml-11">
            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce delay-150"></div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex gap-2 items-center">
          <VoiceInput onInput={setInput} languageCode={languageCode} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={useSearch ? "Ask about market prices, weather..." : t.chat_placeholder}
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-agro-500/20 focus:border-agro-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-agro-600 text-white p-2.5 rounded-xl hover:bg-agro-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
