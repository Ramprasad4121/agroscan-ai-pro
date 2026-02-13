
import { LANGUAGES } from '../translations';

interface CacheEntry {
  [text: string]: string;
}

interface TranslationCache {
  [languageCode: string]: CacheEntry;
}

const CACHE_KEY = 'agroscan_translation_cache';
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

export class TranslationService {
  private static cache: TranslationCache = TranslationService.loadCache();

  // Load cache from LocalStorage
  private static loadCache(): TranslationCache {
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error("Failed to load translation cache", e);
      return {};
    }
  }

  // Save cache to LocalStorage
  private static saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch (e) {
      console.error("Failed to save translation cache", e);
    }
  }

  /**
   * Translates a single text string
   */
  static async translate(text: string, targetLang: string): Promise<string> {
    if (!text) return "";
    if (targetLang === 'en') return text;

    // 1. Check Cache
    if (this.cache[targetLang] && this.cache[targetLang][text]) {
      return this.cache[targetLang][text];
    }

    // 2. API Call (Using Google Cloud Translation API v2 for API Key simplicity)
    // Note: For V3, a backend proxy is recommended to handle auth tokens.
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          format: 'text'
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Google Translation API Error:", data.error);
        return text; // Fallback
      }

      const translatedText = data.data.translations[0].translatedText;

      // 3. Update Cache
      if (!this.cache[targetLang]) this.cache[targetLang] = {};
      this.cache[targetLang][text] = translatedText;
      this.saveCache();

      return translatedText;
    } catch (e) {
      console.error("Translation request failed", e);
      return text; // Fallback
    }
  }

  /**
   * Batch translates a dictionary object (values only)
   */
  static async translateDictionary(
    sourceDict: Record<string, string>, 
    targetLang: string
  ): Promise<Record<string, string>> {
    if (targetLang === 'en') return sourceDict;

    const result: Record<string, string> = { ...sourceDict };
    
    // Identify missing translations
    const textsToTranslate: string[] = [];
    const keysToMap: string[] = [];

    // 1. Check Cache first
    if (!this.cache[targetLang]) this.cache[targetLang] = {};
    
    Object.entries(sourceDict).forEach(([key, text]) => {
      if (this.cache[targetLang][text]) {
        result[key] = this.cache[targetLang][text];
      } else {
        textsToTranslate.push(text);
        keysToMap.push(key);
      }
    });

    if (textsToTranslate.length === 0) return result;

    // 2. Batch API Call
    try {
      // Google API allows multiple 'q' parameters
      // We might need to chunk this if the list is huge (limit usually 128 items per req)
      const CHUNK_SIZE = 100;
      
      for (let i = 0; i < textsToTranslate.length; i += CHUNK_SIZE) {
        const chunkTexts = textsToTranslate.slice(i, i + CHUNK_SIZE);
        const chunkKeys = keysToMap.slice(i, i + CHUNK_SIZE);

        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: chunkTexts,
            target: targetLang,
            format: 'text'
          })
        });

        const data = await response.json();
        
        if (data.data && data.data.translations) {
          data.data.translations.forEach((item: any, index: number) => {
             const originalText = chunkTexts[index];
             const translatedText = item.translatedText;
             const key = chunkKeys[index];

             // Update Result
             result[key] = translatedText;

             // Update Cache
             this.cache[targetLang][originalText] = translatedText;
          });
        }
      }
      
      this.saveCache();
    } catch (e) {
      console.error("Batch translation failed", e);
    }

    return result;
  }
}
