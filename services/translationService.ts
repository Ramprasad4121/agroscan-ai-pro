
import { getLanguageName } from '../translations';
import { getAI } from './gemini';

interface CacheEntry {
  [text: string]: string;
}

interface TranslationCache {
  [languageCode: string]: CacheEntry;
}

const CACHE_KEY = 'agroscan_translation_cache';

/**
 * AI translation via Gemini.
 * The Google Cloud Translation API (translation.googleapis.com) rejects
 * AI-Studio API keys (401 UNAUTHENTICATED), and adding a Cloud billing key was
 * not an option, so translations are produced with gemini-2.5-flash instead.
 */
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

    try {
      const language = getLanguageName(targetLang);
      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: `Translate the following text to ${language}. Return ONLY the translation, nothing else.\n\n${text}` }] },
        config: { temperature: 0.1 },
      });
      const translatedText = (response.text || '').trim();
      if (!translatedText) return text; // Fallback

      // Cache
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
   * Batch translates a dictionary object (values only).
   */
  static async translateDictionary(
    sourceDict: Record<string, string>,
    targetLang: string
  ): Promise<Record<string, string>> {
    if (targetLang === 'en') return sourceDict;

    const result: Record<string, string> = { ...sourceDict };

    // 1. Check Cache first
    if (!this.cache[targetLang]) this.cache[targetLang] = {};

    const textsToTranslate: string[] = [];
    const keysToMap: string[] = [];

    Object.entries(sourceDict).forEach(([key, text]) => {
      if (this.cache[targetLang][text]) {
        result[key] = this.cache[targetLang][text];
      } else {
        textsToTranslate.push(text);
        keysToMap.push(key);
      }
    });

    if (textsToTranslate.length === 0) return result;

    // 2. Gemini batch translation: one call per chunk of keys.
    // Each chunk is independently retried and cached so a single quota/error
    // failure doesn't discard the work of the other chunks.
    const language = getLanguageName(targetLang);
    const CHUNK_SIZE = 120;

    const translateChunk = async (chunkKeys: string[], chunkTexts: string[], attempt = 1): Promise<boolean> => {
      const dictJson = JSON.stringify(Object.fromEntries(chunkKeys.map((k, j) => [k, chunkTexts[j]])));
      const prompt = `Translate the VALUES of this JSON object to ${language}:\n\n${dictJson}`;
      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          temperature: 0.1,
          systemInstruction: `You are a professional agricultural translation engine. Translate each VALUE in the provided JSON object from English to ${language}. Rules:
1. Keep every KEY exactly as-is (do not translate keys).
2. Keep the output a single valid JSON object with the identical keys.
3. Use natural, simple farmer-friendly ${language}. Keep numbers, units (%, kg, ₹), crop names and UI labels sensible for farmers.
4. Keep responses very short where the source is very short (button labels, section titles).
5. Output ONLY the JSON object, no markdown, no explanations.`,
        },
      });

      let raw = (response.text || '').trim();
      // strip accidental code fences
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('Translation response was not JSON');

      const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, string>;

      chunkKeys.forEach((key) => {
        const translated = parsed[key];
        if (typeof translated === 'string' && translated.trim()) {
          const originalText = result[key] ?? sourceDict[key];
          result[key] = translated.trim();
          if (originalText) {
            this.cache[targetLang][originalText] = translated.trim();
          }
        }
      });
      this.saveCache();
      return true;
    };

    for (let i = 0; i < keysToMap.length; i += CHUNK_SIZE) {
      const chunkKeys = keysToMap.slice(i, i + CHUNK_SIZE);
      const chunkTexts = textsToTranslate.slice(i, i + CHUNK_SIZE);
      // Retry once after a short pause (free-tier rate limits are per-minute);
      // a still-failing chunk gracefully keeps its English text.
      let lastErr: unknown = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await translateChunk(chunkKeys, chunkTexts);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          if (attempt < 2) await new Promise((r) => setTimeout(r, 15000));
        }
      }
      if (lastErr) console.error(`Batch translation failed for chunk ${i / CHUNK_SIZE}`, lastErr);
    }

    return result;
  }
}
