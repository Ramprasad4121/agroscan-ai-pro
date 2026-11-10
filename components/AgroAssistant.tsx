
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Globe, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { askAgroAI } from '../services/gemini';
import { LANGUAGES, getLanguageName } from '../translations';
import { stripMarkdown } from '../utils';
import { ChatMessage } from '../types';

interface AgroAssistantProps {
  t: any;
  /** Initial language for the conversation (falls back to English). */
  languageCode?: string;
  /** Compact mode for tight spaces. */
  compact?: boolean;
}

const SUGGESTION_KEYS = [
  'ask_soil_health',
  'ask_scheme',
  'ask_mandi_price',
  'ask_crop_problem',
  'ask_credit',
  'ask_harvest',
];

export const AgroAssistant: React.FC<AgroAssistantProps> = ({ t, languageCode = 'en', compact = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(languageCode);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Greeting when the panel first opens
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'model',
          text: t.assistant_greeting || "Ask me anything about your farm — soil, crops, schemes, prices or inputs. I'll answer in plain language.",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      const result = await askAgroAI(
        messages.map((m) => ({ role: m.role, text: m.text })),
        question,
        getLanguageName(language)
      );
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: stripMarkdown(result.text || (t.assistant_no_answer || "I could not find a clear answer. Try asking differently.")),
          groundingMetadata: result.groundingMetadata,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      const quota = /429|RESOURCE_EXHAUSTED|quota/i.test(String(err?.message || ''));
      setError(
        quota
          ? (t.assistant_quota || "The assistant is busy right now. Please try again in a minute.")
          : (t.assistant_error || "Sorry, I hit a problem. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const languageName = getLanguageName(language);

  return (
    <div className={`flex flex-col overflow-hidden bg-tech-card border border-tech-border rounded-2xl shadow-2xl ${compact ? 'h-[420px]' : 'h-full max-h-[560px]'}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-tech-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-tech-bg border border-tech-cyan/40 flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-tech-cyan" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-tech-primary truncate">{t.assistant_title || "Ask Agro AI"}</h3>
            <p className="text-[10px] text-tech-secondary truncate">
              {t.assistant_subtitle || "One conversation, all farm services"}
            </p>
          </div>
        </div>

        {/* Language picker */}
        <div className="relative shrink-0">
          <button
            onClick={() => setLangMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-tech-bg border border-tech-border text-[10px] font-bold text-tech-secondary hover:border-tech-cyan/50 transition-colors"
            title={t.assistant_language || "Conversation language"}
          >
            <Globe size={12} className="text-tech-cyan" />
            {languageName}
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 max-h-64 overflow-y-auto bg-tech-card border border-tech-border rounded-xl shadow-xl z-50 custom-scrollbar">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-tech-bg flex items-center justify-between transition-colors ${
                    language === lang.code ? 'text-tech-cyan' : 'text-tech-secondary'
                  }`}
                >
                  <span>{lang.name}</span>
                  <span className="text-[10px] opacity-60">{lang.localName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-start gap-2.5 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-tech-cyan text-tech-bg' : 'bg-tech-bg border border-tech-border text-tech-cyan'
                }`}
              >
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-tech-cyan text-tech-bg rounded-tr-none font-medium'
                    : 'bg-tech-bg border border-tech-border text-tech-primary rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>

            {msg.role === 'model' && msg.groundingMetadata?.groundingChunks?.length > 0 && (
              <div className="ml-9 mt-1.5">
                <div className="text-[10px] font-bold text-tech-secondary/70 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <ExternalLink size={9} /> {t.search_sources || "Sources"}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {msg.groundingMetadata.groundingChunks.map((chunk: any, i: number) =>
                    chunk.web?.uri ? (
                      <a
                        key={i}
                        href={chunk.web.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] bg-tech-bg border border-tech-border px-2 py-1 rounded-md text-tech-secondary hover:text-tech-cyan hover:border-tech-cyan/40 transition-colors truncate max-w-[190px]"
                      >
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-tech-secondary text-xs ml-9">
            <Loader2 size={14} className="animate-spin text-tech-cyan" />
            {t.assistant_thinking || "Thinking..."}
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {SUGGESTION_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleSend(t[key])}
              disabled={loading}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-tech-bg border border-tech-border text-tech-secondary hover:border-tech-cyan/50 hover:text-tech-cyan transition-colors disabled:opacity-50"
            >
              {t[key]}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mx-4 mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Composer */}
      <div className="p-3 border-t border-tech-border flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={t.assistant_placeholder || "Ask about your farm..."}
          className="flex-1 bg-tech-bg border border-tech-border rounded-xl px-3.5 py-2.5 text-sm text-tech-primary placeholder:text-tech-secondary/60 focus:outline-none focus:border-tech-cyan/60 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl bg-tech-cyan text-tech-bg flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          title={t.assistant_send || "Send"}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
