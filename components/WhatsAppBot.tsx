
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image as ImageIcon, Camera, MoreVertical, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { analyzePlantImage, chatWithAgronomist, searchAgriculturalData } from '../services/gemini';
import { fileToGenerativePart, compressImage } from '../utils';
import { LANGUAGES } from '../translations';
import { PlantDiagnosis } from '../types';

interface WhatsAppBotProps {
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
  onClose: () => void;
}

interface WAMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'audio';
  imageUrl?: string;
  diagnosis?: PlantDiagnosis;
}

export const WhatsAppBot: React.FC<WhatsAppBotProps> = ({ t, languageCode, userLocation, onClose }) => {
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial Greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = languageCode === 'en' 
        ? "Namaste! I am your AgriScan Assistant. 🌱\n\nI can help you with:\n1. 📸 Crop Diagnosis (Send Photo)\n2. 💰 Mandi Rates\n3. 📜 Scheme Eligibility\n\nType 'Hi' or upload a photo to start."
        : t.wa_upload_prompt; // Use localized greeting
      
      setTimeout(() => {
         addBotMessage(greeting);
      }, 800);
    }
  }, [languageCode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addBotMessage = (text: string, diagnosis?: PlantDiagnosis) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        diagnosis
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const text = input;
    setInput('');
    
    // Add User Message
    const userMsg: WAMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'read'
    };
    setMessages(prev => [...prev, userMsg]);

    // Process Intent
    if (text.toLowerCase().includes('mandi') || text.toLowerCase().includes('price') || text.toLowerCase().includes('rate') || text.toLowerCase().includes('ભાવ')) {
       const locationStr = userLocation ? `near ${userLocation.lat}, ${userLocation.lng}` : "in India";
       const lang = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';
       setIsTyping(true);
       try {
          const data = await searchAgriculturalData(`Current Mandi prices for common crops ${locationStr}. Concise list. Respond in ${lang}.`);
          addBotMessage(data.text);
       } catch(e) {
          addBotMessage("Could not fetch rates. Try again.");
       }
    } else {
       // General Chat using Gemini
       const lang = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';
       try {
         const response = await chatWithAgronomist(
            [{ role: 'user', text }], 
            text, 
            { plantName: 'General Query', isHealthy: true, confidence: 0, symptoms: [], treatments: [], preventiveMeasures: [], expertAdvice: '' },
            lang
         );
         addBotMessage(response);
       } catch(e) {
         addBotMessage("Sorry, I am having trouble connecting. Please try again.");
       }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Show User Image immediately
    const imageUrl = URL.createObjectURL(file);
    const userMsg: WAMessage = {
      id: Date.now().toString(),
      text: '📷 Image',
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'read',
      type: 'image',
      imageUrl: imageUrl
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
       const compressed = await compressImage(file);
       const { inlineData } = await fileToGenerativePart(compressed);
       const lang = LANGUAGES.find(l => l.code === languageCode)?.name || 'English';
       
       const result = await analyzePlantImage(inlineData.data, inlineData.mimeType, lang, userLocation);
       
       const replyText = result.isHealthy 
          ? `✅ *${result.plantName}*: ${t.healthy}\n\n${result.expertAdvice}`
          : `⚠️ *${result.plantName}*: ${result.diseaseName}\n\n💊 *Treatment*: ${result.treatments.join(', ')}`;
          
       addBotMessage(replyText, result);
       
    } catch (e) {
       addBotMessage("❌ Could not analyze image. Please try again with a clearer photo.");
    } finally {
       setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center p-0 md:p-4 animate-fade-in">
      {/* Mobile Container */}
      <div className="w-full h-full md:h-[80vh] md:w-[400px] bg-[#E5DDD5] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white p-3 flex items-center justify-between shadow-md z-20">
           <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                 <ArrowLeft size={24} />
              </button>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                 <img src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png" alt="Bot" className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="font-bold text-base leading-tight">AgroScan Bot ✅</h3>
                 <p className="text-xs text-white/80">Online</p>
              </div>
           </div>
           <div className="flex gap-3">
              <Camera size={20} className="text-white" />
              <MoreVertical size={20} className="text-white" />
           </div>
        </div>

        {/* Chat Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#E5DDD5] relative" 
          ref={scrollRef}
          style={{ backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`, backgroundBlendMode: 'soft-light' }}
        >
           {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div 
                    className={`max-w-[80%] rounded-lg p-2 px-3 shadow-sm relative text-sm ${
                       msg.sender === 'user' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'
                    }`}
                 >
                    {msg.type === 'image' && (
                       <div className="mb-2 rounded-lg overflow-hidden">
                          <img src={msg.imageUrl} alt="Upload" className="w-full h-auto" />
                       </div>
                    )}
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                       {msg.text}
                    </p>
                    <div className="flex justify-end items-center gap-1 mt-1">
                       <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                       {msg.sender === 'user' && (
                          <CheckCheck size={14} className="text-blue-500" />
                       )}
                    </div>
                 </div>
              </div>
           ))}
           {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-white rounded-lg p-3 rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                       <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Input Area */}
        <div className="bg-[#F0F0F0] p-2 flex items-center gap-2 z-20">
           <div className="bg-white flex-1 rounded-full flex items-center px-4 py-2 shadow-sm">
              <button className="text-slate-400 mr-2">
                 <span role="img" aria-label="emoji">😊</span>
              </button>
              <input 
                 type="text" 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 placeholder="Message"
                 className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400"
                 onKeyPress={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-slate-500 hover:text-teal-600 mx-2"
              >
                 <Paperclip size={20} />
              </button>
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*" 
                 onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
              <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="text-slate-500 hover:text-teal-600"
              >
                 <Camera size={20} />
              </button>
           </div>
           <button 
             onClick={handleSend}
             className="w-12 h-12 bg-[#075E54] rounded-full flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
           >
             {input.trim() ? <Send size={20} /> : <Mic size={20} />}
           </button>
        </div>

        {/* Quick Actions Chips Overlay */}
        {messages.length < 3 && (
           <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar z-10">
              <button onClick={() => setInput("Get Mandi Rates")} className="bg-white border border-[#128C7E] text-[#128C7E] px-4 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                 💰 {t.wa_mandi}
              </button>
              <button onClick={() => setInput("Check Schemes")} className="bg-white border border-[#128C7E] text-[#128C7E] px-4 py-1.5 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                 📜 {t.wa_schemes}
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
