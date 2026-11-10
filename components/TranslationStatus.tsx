
import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { getLanguageName } from '../translations';

interface TranslationStatusProps {
  t: any;
  isTranslating: boolean;
  error: string | null;
  targetLanguage: string | null;
  onRetry: () => void;
}

/**
 * Non-blocking feedback while the app switches language: a small chip in the
 * corner (never a full-screen blocker) plus a retry affordance if the
 * translation failed.
 */
export const TranslationStatus: React.FC<TranslationStatusProps> = ({
  t,
  isTranslating,
  error,
  targetLanguage,
  onRetry,
}) => {
  if (!isTranslating && !error) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="translation-status"
      className="fixed top-20 right-4 z-[60] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-tech-card/95 border border-tech-cyan/40 shadow-xl backdrop-blur animate-fade-in max-w-xs"
    >
      {isTranslating ? (
        <>
          <Loader2 size={16} className="text-tech-cyan animate-spin shrink-0" />
          <span className="text-xs text-tech-primary">
            {t.translation_loading || "Translating the app to"}{' '}
            <span className="text-tech-cyan font-bold">
              {targetLanguage ? getLanguageName(targetLanguage) : ''}
            </span>
          </span>
        </>
      ) : (
        <>
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <span className="text-xs text-tech-primary flex-1">{error}</span>
          <button
            onClick={onRetry}
            className="text-[10px] font-bold uppercase tracking-wider text-tech-cyan hover:underline shrink-0"
          >
            {t.translation_retry || "Retry"}
          </button>
        </>
      )}
    </div>
  );
};
