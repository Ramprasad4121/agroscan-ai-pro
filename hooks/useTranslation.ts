
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  defaultTranslations,
  LANGUAGE_OVERRIDES,
  PRIORITY_TRANSLATION_KEYS,
  isSupportedLanguage,
  getLanguageName,
} from '../translations';
import { TranslationService } from '../services/translationService';

const applyOverrides = (
  dict: Record<string, string>,
  languageCode: string
): Record<string, string> => ({
  ...dict,
  ...(LANGUAGE_OVERRIDES[languageCode] || {}),
});

/**
 * Loads the UI dictionary for the selected language.
 *
 * - English is instant (source strings).
 * - Other Indian languages are translated by Gemini and cached in the browser.
 * - The visible shell (landing, header, assistant) is translated first and
 *   pushed into the UI as soon as it lands, so the screen never sits empty.
 * - Hand-written overrides (Hindi/Marathi) are applied on top of the
 *   machine translation.
 */
export const useTranslation = (languageCode: string | null) => {
  const [t, setT] = useState<Record<string, string>>(defaultTranslations);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    const loadTranslations = async () => {
      if (!languageCode || languageCode === 'en' || !isSupportedLanguage(languageCode)) {
        setT(defaultTranslations);
        setIsTranslating(false);
        setError(null);
        setTargetLanguage(null);
        return;
      }

      setIsTranslating(true);
      setError(null);
      setTargetLanguage(languageCode);

      // Hand-written overrides (Hindi/Marathi) are applied immediately so the
      // visible shell switches language instantly, even before (or without)
      // the machine translation of the long tail.
      setT(applyOverrides(defaultTranslations, languageCode));

      try {
        const dynamicData = await TranslationService.translateDictionary(defaultTranslations, languageCode, {
          priorityKeys: PRIORITY_TRANSLATION_KEYS,
          onPartial: (partial) => {
            // Only the newest request may write to the UI
            if (id !== requestId.current) return;
            setT(applyOverrides(partial, languageCode));
          },
          onFailure: (failed, total) => {
            if (id !== requestId.current) return;
            setError(
              failed >= total
                ? `Couldn't translate the app to ${getLanguageName(languageCode)}. Showing English for now.`
                : `Some parts are still in English. Retry to finish translating to ${getLanguageName(languageCode)}.`
            );
          },
        });

        if (id !== requestId.current) return;
        setT(applyOverrides(dynamicData, languageCode));
      } catch (e) {
        if (id !== requestId.current) return;
        console.error('Translation failed:', e);
        // Keep whatever is on screen and let the user retry
        setError(
          `Couldn't translate the app to ${getLanguageName(languageCode)}. Showing English for now.`
        );
      } finally {
        if (id === requestId.current) setIsTranslating(false);
      }
    };

    loadTranslations();
  }, [languageCode]);

  const retry = useCallback(() => {
    // Nudge the effect by moving to English and back is risky; instead
    // re-run the translation for the current language directly.
    const lang = languageCode;
    if (!lang || lang === 'en') return;
    const id = ++requestId.current;
    setIsTranslating(true);
    setError(null);
    TranslationService.translateDictionary(defaultTranslations, lang, {
      priorityKeys: PRIORITY_TRANSLATION_KEYS,
      onPartial: (partial) => {
        if (id !== requestId.current) return;
        setT(applyOverrides(partial, lang));
      },
      onFailure: (failed, total) => {
        if (id !== requestId.current) return;
        setError(
          failed >= total
            ? `Couldn't translate the app to ${getLanguageName(lang)}. Showing English for now.`
            : `Some parts are still in English. Retry to finish translating to ${getLanguageName(lang)}.`
        );
      },
    })
      .then((data) => {
        if (id !== requestId.current) return;
        setT(applyOverrides(data, lang));
      })
      .catch((e) => {
        if (id !== requestId.current) return;
        console.error('Translation retry failed:', e);
        setError(`Couldn't translate the app to ${getLanguageName(lang)}. Showing English for now.`);
      })
      .finally(() => {
        if (id === requestId.current) setIsTranslating(false);
      });
  }, [languageCode]);

  return { t, isTranslating, error, retry, targetLanguage };
};
