
import { getLanguageName } from '../translations';
import { getAI } from './gemini';
import { STORAGE_KEYS } from '../utils';

interface CacheEntry {
  [text: string]: string;
}

interface TranslationCache {
  [languageCode: string]: CacheEntry;
}

const CACHE_KEY = STORAGE_KEYS.translationCache;

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
   *
   * Priority keys are translated first so the shell of the UI switches to the
   * new language quickly; the remaining keys follow in parallel chunks. Each
   * finished chunk is cached and pushed through `onPartial`, so a slow or
   * rate-limited request never blocks the whole screen.
   */
  static async translateDictionary(
    sourceDict: Record<string, string>,
    targetLang: string,
    options: {
      priorityKeys?: string[];
      onPartial?: (partial: Record<string, string>) => void;
      /** Called when one or more chunks could not be translated. */
      onFailure?: (failedChunks: number, totalChunks: number) => void;
    } = {}
  ): Promise<Record<string, string>> {
    if (targetLang === 'en') return sourceDict;

    const result: Record<string, string> = { ...sourceDict };
    const { priorityKeys = [], onPartial, onFailure } = options;

    // 1. Check Cache first
    if (!this.cache[targetLang]) this.cache[targetLang] = {};

    const keysToTranslate: string[] = [];

    Object.entries(sourceDict).forEach(([key, text]) => {
      if (this.cache[targetLang][text]) {
        result[key] = this.cache[targetLang][text];
      } else {
        keysToTranslate.push(key);
      }
    });

    if (keysToTranslate.length === 0) return result;

    const language = getLanguageName(targetLang);
    const PRIORITY_SIZE = 60;
    const CHUNK_SIZE = 120;
    const CONCURRENCY = 3;

    const prioritySet = new Set(priorityKeys);
    const priority = keysToTranslate.filter((k) => prioritySet.has(k)).slice(0, PRIORITY_SIZE);
    const rest = keysToTranslate.filter((k) => !priority.includes(k));

    const buildChunks = (keys: string[]): string[][] => {
      const chunks: string[][] = [];
      for (let i = 0; i < keys.length; i += CHUNK_SIZE) chunks.push(keys.slice(i, i + CHUNK_SIZE));
      return chunks;
    };

    const translateChunk = async (chunkKeys: string[]): Promise<boolean> => {
      const dictJson = JSON.stringify(
        Object.fromEntries(chunkKeys.map((k) => [k, sourceDict[k]]))
      );
      const prompt = `Translate the VALUES of this JSON object to ${language}:\n\n${dictJson}`;
      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          temperature: 0.1,
          systemInstruction: `You are a professional agricultural translation engine for Indian farmers. Translate each VALUE in the provided JSON object from English to ${language}. Rules:
1. Keep every KEY exactly as-is (do not translate keys).
2. Keep the output a single valid JSON object with the identical keys.
3. Use natural, simple farmer-friendly ${language}. Keep numbers, units (%, kg, ₹, quintal) and crop names sensible for Indian farmers.
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
          const originalText = sourceDict[key];
          result[key] = translated.trim();
          if (originalText) {
            this.cache[targetLang][originalText] = translated.trim();
          }
        }
      });
      this.saveCache();
      return true;
    };

    // Translate one chunk with a single retry (free-tier limits are per-minute)
    const translateChunkWithRetry = async (chunkKeys: string[]): Promise<boolean> => {
      let lastErr: unknown = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await translateChunk(chunkKeys);
          return true;
        } catch (e) {
          lastErr = e;
          if (attempt < 2) await new Promise((r) => setTimeout(r, 12000));
        }
      }
      console.error(`Batch translation failed for ${chunkKeys.length} keys`, lastErr);
      return false;
    };

    let failedChunks = 0;
    let totalChunks = 0;

    // 2a. Priority keys first — the visible shell of the app
    if (priority.length > 0) {
      totalChunks++;
      const ok = await translateChunkWithRetry(priority);
      if (ok) onPartial?.({ ...result });
      else failedChunks++;
    }

    // 2b. Remaining keys in parallel chunks
    const chunks = buildChunks(rest);
    for (let i = 0; i < chunks.length; i += CONCURRENCY) {
      const group = chunks.slice(i, i + CONCURRENCY);
      totalChunks += group.length;
      const settled = await Promise.all(group.map((chunk) => translateChunkWithRetry(chunk)));
      settled.forEach((ok) => { if (!ok) failedChunks++; });
      if (settled.some(Boolean)) onPartial?.({ ...result });
    }

    if (failedChunks > 0) onFailure?.(failedChunks, totalChunks);

    return result;
  }
}
