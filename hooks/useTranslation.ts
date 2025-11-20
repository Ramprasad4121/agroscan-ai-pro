
import { useState, useEffect } from 'react';
import { defaultTranslations, TRANSLATIONS, LanguageCode } from '../translations';
import { TranslationService } from '../services/translationService';

export const useTranslation = (languageCode: string | null) => {
  // Start with English or the static translation if available immediately
  const [t, setT] = useState(
    (languageCode && TRANSLATIONS[languageCode as LanguageCode]) 
      ? TRANSLATIONS[languageCode as LanguageCode] 
      : defaultTranslations
  );
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      if (!languageCode || languageCode === 'en') {
        setT(defaultTranslations);
        return;
      }

      // 1. Check if we have a hardcoded static file for this language
      // We cast to any because languageCode might be a dynamic one not in the strict Type
      const staticData = (TRANSLATIONS as any)[languageCode];
      if (staticData) {
        setT(staticData);
        // Even if static exists, we might want to translate missing keys dynamically in future
        return;
      }

      // 2. Dynamic Translation for unsupported static languages (e.g. French, Spanish)
      setIsTranslating(true);
      try {
        // Translate the default English dictionary to the target language
        const dynamicData = await TranslationService.translateDictionary(defaultTranslations, languageCode);
        setT(dynamicData as typeof defaultTranslations);
      } catch (error) {
        console.error("Translation hook error:", error);
        // Fallback to English on error
        setT(defaultTranslations);
      } finally {
        setIsTranslating(false);
      }
    };

    loadTranslations();
  }, [languageCode]);

  return { t, isTranslating };
};
