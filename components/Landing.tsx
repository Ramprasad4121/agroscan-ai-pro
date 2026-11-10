
import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  Landmark,
  Wallet,
  Store,
  Globe,
  ArrowRight,
  Bot,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  Check,
} from 'lucide-react';
import { AgroAssistant } from './AgroAssistant';
import { LANGUAGES } from '../translations';

interface LandingProps {
  t: any;
  onEnterPortal: () => void;
  /** Currently selected UI language (null = not chosen yet). */
  language?: string | null;
  onLanguageChange?: (code: string) => void;
  isTranslating?: boolean;
}

const PILLARS = [
  { icon: Droplets, key: 'pillar_land' },
  { icon: Sprout, key: 'pillar_crops' },
  { icon: Landmark, key: 'pillar_schemes' },
  { icon: Wallet, key: 'pillar_finance' },
  { icon: Store, key: 'pillar_inputs' },
  { icon: Globe, key: 'pillar_markets' },
];

export const Landing: React.FC<LandingProps> = ({
  t,
  onEnterPortal,
  language,
  onLanguageChange,
  isTranslating = false,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <div className="min-h-screen bg-tech-pattern text-tech-primary flex flex-col">
      {/* ── Top bar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-tech-bg/80 border-b border-tech-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tech-card border border-tech-cyan/40 flex items-center justify-center">
              <Sprout size={18} className="text-tech-cyan" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-tech-primary tracking-tight">
                AGRO <span className="text-tech-cyan">AI</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-tech-secondary hidden sm:block">
                {t.landing_tagline || "Everything a Farmer Needs"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-[10px] uppercase tracking-[0.18em] text-tech-secondary">
              {t.landing_top_cta_hint || "For farmers, FPOs, buyers, banks & government"}
            </span>

            {/* Language picker */}
            {onLanguageChange && (
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen((v) => !v)}
                  aria-label={t.select_language || "Select language"}
                  aria-expanded={langMenuOpen}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-tech-card border border-tech-border text-[11px] font-bold text-tech-secondary hover:border-tech-cyan/50 transition-colors"
                  title={t.select_language || "Select language"}
                >
                  <Globe size={13} className="text-tech-cyan" />
                  <span className="hidden sm:inline">{currentLang?.localName || 'English'}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 max-h-72 overflow-y-auto bg-tech-card border border-tech-border rounded-xl shadow-2xl z-50 custom-scrollbar">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs hover:bg-tech-bg flex items-center justify-between gap-3 transition-colors ${
                          language === lang.code ? 'text-tech-cyan' : 'text-tech-secondary'
                        }`}
                      >
                        <span>{lang.name}</span>
                        <span className="text-[10px] opacity-70">{lang.localName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button onClick={onEnterPortal} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-1.5">
              {t.landing_choose_portal || "Choose your portal"}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tech-card border border-tech-cyan/30 text-tech-cyan text-[10px] font-bold uppercase tracking-[0.18em]">
            <Sparkles size={12} />
            {t.landing_eyebrow || "One conversation away"}
          </span>

          <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-tech-primary leading-[1.1] tracking-tight">
            {t.landing_headline || "Everything a Farmer Needs. One Conversation Away."}
          </h1>

          <p className="mt-5 text-tech-secondary leading-relaxed max-w-xl">
            {t.landing_intro ||
              "Agro AI is an AI-powered platform built to simplify every aspect of a farmer's life."}
          </p>
          <p className="mt-3 text-tech-secondary/80 leading-relaxed max-w-xl text-sm">
            {t.landing_intro2 ||
              "From managing agricultural land and understanding soil health to growing crops, accessing government schemes, finding financial assistance, purchasing inputs, discovering market opportunities and connecting with essential services — all in one place."}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#ask"
              className="btn-primary px-5 py-3 rounded-lg flex items-center gap-2"
            >
              <Bot size={16} />
              {t.landing_cta_ask || "Ask Agro AI"}
            </a>
            <button onClick={onEnterPortal} className="btn-secondary px-5 py-3 rounded-lg flex items-center gap-2">
              {t.landing_cta_portal || "Enter your dashboard"}
              <ArrowRight size={16} />
            </button>
          </div>

          <p className="mt-6 text-xs text-tech-secondary/70 flex items-center gap-2">
            <MessageCircle size={13} className="text-tech-cyan/70 shrink-0" />
            {t.landing_just_ask || "No navigating multiple websites. No switching between dozens of applications. Just ask."}
          </p>
        </div>

        {/* Assistant panel */}
        <div id="ask" className="animate-fade-in">
          <AgroAssistant
            t={t}
            languageCode={language || 'en'}
            onLanguageChange={onLanguageChange}
          />
        </div>
      </section>

      {/* ── Pillars ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.key}
              className="tech-card p-4 rounded-xl flex flex-col gap-3 hover:border-tech-cyan/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-tech-bg border border-tech-border flex items-center justify-center">
                <pillar.icon size={16} className="text-tech-cyan" />
              </div>
              <h3 className="text-xs font-bold text-tech-primary uppercase tracking-wide leading-snug">
                {t[pillar.key]}
              </h3>
              <p className="text-[11px] text-tech-secondary/80 leading-relaxed">{t[`${pillar.key}_desc`]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Just ask band ─────────────────────────────────────── */}
      <section className="border-y border-tech-border bg-tech-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div>
            <h2 className="text-xl font-display font-bold text-tech-primary">{t.landing_just_ask_title || "Just ask."}</h2>
            <p className="text-sm text-tech-secondary mt-2 leading-relaxed">
              {t.landing_just_ask_body ||
                "Agro AI understands, guides and helps get things done — in the language you speak."}
            </p>
          </div>
          <ul className="space-y-3">
            {['landing_point_1', 'landing_point_2', 'landing_point_3'].map((key) => (
              <li key={key} className="flex items-start gap-2.5 text-sm text-tech-secondary">
                <ShieldCheck size={16} className="text-tech-cyan mt-0.5 shrink-0" />
                <span>{t[key]}</span>
              </li>
            ))}
          </ul>
          <button onClick={onEnterPortal} className="btn-secondary px-5 py-3 rounded-lg flex items-center justify-center gap-2 md:justify-self-end">
            {t.landing_cta_portal2 || "Get started"}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Vision ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-tech-secondary leading-relaxed">{t.landing_vision}</p>
        <p className="mt-6 text-lg font-display font-bold text-tech-primary">{t.landing_belief}</p>
        <h2 className="mt-6 text-2xl sm:text-3xl font-display font-bold text-tech-cyan tracking-tight">
          {t.landing_tagline_line || "One Platform. One AI. Everything for Farmers."}
        </h2>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-tech-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-tech-secondary">
            © 2025 Agro AI. {t.rights || "All rights reserved."}
          </p>
          <p className="text-[11px] text-tech-secondary/70">{t.landing_vision_short}</p>
        </div>
      </footer>
    </div>
  );
};
