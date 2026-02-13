
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { PlantDiagnosis, GroundingResult, CalendarEvent, CropRecommendation, WaterStressAnalysis, YieldPrediction, FertilizerPlan, PesticideGuidance, StorageAdvice, BuyerProfile, ProfitAnalysis, CostBreakdown, SchemeGuide, PowerSchedule, MarketForecast } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });

// --- UTILITY: Retry Logic for 429 Errors ---
async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Retry on Rate Limit (429) or Service Unavailable (503)
    if (retries > 0 && (error.status === 429 || error.status === 503 || error.message?.includes('429'))) {
      console.warn(`API Rate Limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const diagnosisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    plantName: { type: Type.STRING, description: "The common name of the identified plant." },
    isHealthy: { type: Type.BOOLEAN, description: "True if the plant is healthy, false otherwise." },
    diseaseName: { type: Type.STRING, description: "Name of the disease, pest, or nutrient deficiency if unhealthy. Null if healthy." },
    issueType: { 
      type: Type.STRING, 
      enum: ["Disease", "Pest", "Deficiency", "Healthy", "Other"],
      description: "Category of the detected issue." 
    },
    confidence: { type: Type.NUMBER, description: "Confidence score 0-100." },
    symptoms: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of observed symptoms (e.g. yellowing leaves, stunted growth)."
    },
    treatments: {
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of recommended treatments (fertilizers for deficiencies, pesticides for pests)."
    },
    preventiveMeasures: {
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of preventive measures."
    },
    expertAdvice: { 
      type: Type.STRING, 
      description: "A paragraph of detailed expert advice. For deficiencies, explain soil management." 
    }
  },
  required: ["plantName", "isHealthy", "confidence", "symptoms", "treatments", "preventiveMeasures", "expertAdvice"]
};

export const analyzePlantImage = async (
  base64Data: string, 
  mimeType: string, 
  language: string = 'English',
  location: { lat: number; lng: number } | null = null
): Promise<PlantDiagnosis> => {
  return retryWithBackoff(async () => {
    const modelId = 'gemini-2.5-flash'; 
    
    const isIndianLanguage = ['Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese'].includes(language);
    const isIndianLocation = location ? (location.lat >= 6 && location.lat <= 37 && location.lng >= 68 && location.lng <= 98) : false;
    const isIndianContext = isIndianLanguage || isIndianLocation;
    
    const locationContext = location 
      ? `The user is located at Latitude: ${location.lat}, Longitude: ${location.lng}. Consider local pests, diseases, and soil types.`
      : "";

    const contextInstruction = isIndianContext 
      ? `You are an expert Indian Agronomist (Kisan Mitra). Identify the plant. 
         DIAGNOSIS INSTRUCTIONS:
         1. Check for Diseases (Fungal, Bacterial, Viral).
         2. Check for Pests (Insects, Mites).
         3. CRITICAL: Check for NUTRIENT DEFICIENCIES (Nitrogen, Phosphorus, Potassium, Zinc, Iron, Magnesium). Look for specific signs like chlorosis patterns, burnt tips, or purple veins.
         
         ${locationContext} 
         
         IMPORTANT: Recommend treatments available in India. 
         - For DISEASES/PESTS: Suggest specific chemicals (e.g., Bavistin, Imidacloprid) AND organic remedies (Neem oil, Dashparni Ark).
         - For DEFICIENCIES: Suggest specific fertilizers (e.g., Urea for N, SSP/DAP for P, MOP for K, Zinc Sulfate, Ferrous Sulfate) and organic amendments (FYM, Vermicompost).
         - Be encouraging and respectful.` 
      : `Act as an expert agronomist. Identify the plant. Detect any diseases, pests, OR nutrient deficiencies (N-P-K, Micronutrients). ${locationContext}`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          {
            text: `Analyze this plant image. ${contextInstruction}
                   If the plant is healthy, set issueType to 'Healthy'.
                   If it is a deficiency, set issueType to 'Deficiency' and diseaseName to the specific deficiency (e.g., 'Potassium Deficiency').
                   Provide a confidence score. 
                   IMPORTANT: Provide the JSON response content in the ${language} language.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
        systemInstruction: `You are AgroScan AI, a world-class agricultural diagnostic tool. Be precise, helpful, and scientific yet accessible. Respond in ${language}.`
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text || "{}") as PlantDiagnosis;
  });
};

export const chatWithAgronomist = async (
  history: { role: 'user' | 'model', text: string }[], 
  newMessage: string,
  context: PlantDiagnosis,
  language: string = 'English'
) => {
  return retryWithBackoff(async () => {
    const contextString = `
      Current Context:
      Plant: ${context.plantName}
      Condition: ${context.isHealthy ? 'Healthy' : 'Unhealthy'}
      Issue Type: ${context.issueType || 'Unknown'}
      Disease/Issue: ${context.diseaseName || 'None'}
      Symptoms: ${context.symptoms.join(', ')}
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `You are an expert agronomist assistant helping a farmer who just scanned a plant. 
        Use the provided context to answer follow-up questions. 
        Your goal is to help the farmer save their crop, improve yield, and reduce costs.
        Be respectful and encouraging. Use simple language.
        Answer specifically in the ${language} language.
        ${contextString}`
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "";
  });
};

// --- NEW FEATURES ---

// 1. Chat with Search Grounding
export const chatWithSearch = async (
  history: { role: 'user' | 'model', text: string }[], 
  newMessage: string,
  language: string = 'English'
) => {
  return retryWithBackoff(async () => {
    // gemini-2.5-flash with googleSearch
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `You are an expert agricultural researcher. You have access to Google Search. 
        Use it to provide up-to-date information about market prices (Mandi rates), new diseases, government schemes (like PM-KISAN), or weather.
        When asked about schemes, explain eligibility and benefits clearly.
        When asked about prices in India, look for Mandi rates in INR/Quintal.
        Always cite your sources if provided by the tool. Respond in ${language}.`
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: newMessage });
    
    return {
      text: result.text || "",
      groundingMetadata: result.candidates?.[0]?.groundingMetadata
    };
  });
};

// 2. Image Generation
export const generateGardenImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  return retryWithBackoff(async () => {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!base64ImageBytes) throw new Error("Failed to generate image");
    
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  });
};

// 3. Search Grounding
export const searchAgriculturalData = async (query: string): Promise<GroundingResult> => {
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    return {
      text: response.text || "No results found.",
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

// 4. Maps Grounding
export const findNearbyResources = async (query: string, lat: number, lng: number): Promise<GroundingResult> => {
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    return {
      text: response.text || "No places found.",
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

// 5. TTS
export const speakText = async (text: string, language: string = 'English'): Promise<string> => {
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio generated");
    return audioData;
  });
};

// 6. Video Analysis (Gemini 3 Pro)
export const analyzeVideo = async (base64Data: string, mimeType: string, prompt: string): Promise<string> => {
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      },
    });
    return response.text || "Unable to analyze video.";
  });
};

// 7. Audio Transcription (Gemini 2.5 Flash)
export const transcribeAudio = async (base64Data: string, mimeType: string = 'audio/wav', languageName: string = 'English'): Promise<string> => {
  return retryWithBackoff(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: `Transcribe this audio exactly as spoken. The user might be speaking in ${languageName} or a mix of English and ${languageName}. Transcribe in the script used by the speaker (e.g. Devanagari for Hindi). Do not translate.` }
        ]
      },
    });
    return response.text || "";
  });
};

// 9. Crop Calendar Generator
const calendarSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: "Projected date in DD-MM-YYYY format" },
      activity: { type: Type.STRING, description: "Short title of activity (e.g., First Irrigation)" },
      description: { type: Type.STRING, description: "Detailed instructions." },
      type: { type: Type.STRING, enum: ['sowing', 'fertilizer', 'irrigation', 'harvest', 'general'] }
    },
    required: ["date", "activity", "description", "type"]
  }
};

export const generateCropCalendar = async (crop: string, sowingDate: string, language: string): Promise<CalendarEvent[]> => {
  return retryWithBackoff(async () => {
    const prompt = `Create a detailed farming calendar for '${crop}' sown on ${sowingDate}. 
    Include critical stages: Germination, Irrigation cycles, Fertilizer Application (N-P-K doses), Pest Management checks, and Harvest time. 
    Assume standard Indian farming conditions unless specified.
    Return the content in the ${language} language.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: calendarSchema,
        systemInstruction: "You are an expert agronomist creating a crop schedule. Be precise with dates relative to sowing."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No calendar generated");
    return JSON.parse(text || "[]") as CalendarEvent[];
  });
};

// 10. Crop Recommendation (Updated for Rotation)
const cropRecSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      cropName: { type: Type.STRING },
      suitabilityScore: { type: Type.NUMBER, description: "Score out of 100" },
      reason: { type: Type.STRING, description: "Why this crop is good here based on climate/soil" },
      season: { type: Type.STRING, description: "Best growing season (e.g. Kharif, Rabi)" },
      requirements: { type: Type.STRING, description: "Brief water/soil requirements" }
    },
    required: ["cropName", "suitabilityScore", "reason", "season", "requirements"]
  }
};

export const recommendCrops = async (lat: number, lng: number, language: string, previousCrop: string = ''): Promise<CropRecommendation[]> => {
  return retryWithBackoff(async () => {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    
    let rotationContext = "";
    if (previousCrop) {
      rotationContext = `CRITICAL: The farmer previously grew '${previousCrop}'. Suggest CROP ROTATION options that improve soil health (e.g. pulses to fix nitrogen after cotton/cereal). Do not suggest the same crop family again if it causes disease buildup.`;
    }

    const prompt = `I am at Latitude: ${lat}, Longitude: ${lng}. Today is ${month}.
    ${rotationContext}
    Recommend 4-5 suitable crops to grow in this region starting this month.
    Consider the local climate, soil type (implied by region), and water availability.
    Provide the output in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cropRecSchema,
        systemInstruction: "You are an expert agricultural consultant specializing in crop rotation and sustainable farming."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No recommendations generated");
    return JSON.parse(text || "[]") as CropRecommendation[];
  });
};

// 11. Financial Guidance
export const generateFinancialTip = async (topic: string, language: string): Promise<string> => {
  return retryWithBackoff(async () => {
    const prompt = `Create a simple, actionable financial guide for a small-scale farmer on the topic: '${topic}'. 
    Include 4-5 clear steps or principles. 
    Avoid complex financial jargon. Use analogies relevant to farming.
    Focus on practical application in a rural context.
    Respond in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a friendly, expert financial advisor for farmers. Keep advice short, encouraging, and easy to understand."
      }
    });

    return response.text || "Unable to generate advice.";
  });
};

// 12. Market News
export const fetchMarketNews = async (language: string, location: { lat: number; lng: number } | null): Promise<GroundingResult> => {
  return retryWithBackoff(async () => {
    const locationStr = location ? `near coordinates ${location.lat}, ${location.lng}` : "in India";
    const prompt = `Find the latest agricultural news, market price fluctuations, government policy updates, and expert opinions relevant to farmers ${locationStr}. 
    Summarize 4-5 key stories. 
    Focus on recent events (last 7 days).
    Respond in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text || "No news found.",
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

// 13. Diagnosis Context Assistance
export const getDiagnosisAssistance = async (
  plant: string,
  disease: string,
  location: { lat: number; lng: number },
  language: string
): Promise<GroundingResult> => {
  return retryWithBackoff(async () => {
    const prompt = `I am a farmer at Latitude: ${location.lat}, Longitude: ${location.lng}. 
    My ${plant} crop has ${disease}.
    
    Please find and summarize:
    1. Are there any current reports or pest alerts for ${disease} or similar outbreaks in my region?
    2. Provide details of the nearest Krishi Vigyan Kendra (KVK) or Agricultural Extension Officer (address/contact if available).
    3. Mention any specific government schemes or subsidies in India for treating this disease or compensating crop loss (e.g. PMFBY).
    
    Respond in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    return {
      text: response.text || "No specific local resources found.",
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  });
};

// 14. Water Stress Analysis
const waterSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    soilMoistureLevel: { type: Type.NUMBER, description: "Estimated soil moisture percentage (0-100)" },
    status: { type: Type.STRING, enum: ["Critical", "Low", "Good", "Saturated"] },
    irrigationToday: { type: Type.BOOLEAN },
    amount: { type: Type.STRING, description: "Amount to irrigate today (e.g. '15mm')" },
    reason: { type: Type.STRING, description: "Why? e.g., 'High heat expected' or 'Rain predicted'" },
    weeklyForecast: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          waterMm: { type: Type.NUMBER, description: "Irrigation needed in mm" },
          condition: { type: Type.STRING, description: "Short weather summary" }
        }
      }
    }
  },
  required: ["soilMoistureLevel", "status", "irrigationToday", "amount", "reason", "weeklyForecast"]
};

export const analyzeWaterStress = async (
  lat: number, 
  lng: number, 
  language: string
): Promise<WaterStressAnalysis> => {
  return retryWithBackoff(async () => {
    const searchPrompt = `Research current weather, recent rainfall (last 3 days), and weather forecast (next 7 days) for Latitude ${lat}, Longitude ${lng}. 
    Also look for soil moisture reports or drought conditions for this region.
    Calculate approximate Evapotranspiration (ET) based on temperature.
    Estimate irrigation needs for standard regional crops (like Wheat/Rice).`;
    
    const searchResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const researchData = searchResponse.text;

    const processPrompt = `Based on the following research data: 
    "${researchData}"
    
    Generate a water stress analysis and 7-day irrigation plan.
    Determine soil moisture level (0-100), status (Critical/Low/Good/Saturated), and if irrigation is needed today.
    Return JSON matching the schema. 
    Translate fields to ${language} where appropriate.`;

    const structuredResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: processPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: waterSchema
      }
    });
    
    return JSON.parse(structuredResponse.text || "{}") as WaterStressAnalysis;
  });
};

// 15. Yield Prediction (Updated for Profit Calc)
const yieldSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    expectedYield: { type: Type.STRING, description: "Range, e.g., '45-50 Quintals per acre'" },
    revenueEstimate: { type: Type.STRING, description: "Estimated revenue in INR" },
    costOfCultivation: { type: Type.STRING, description: "Estimated total cost (seeds, fert, labor) in INR" },
    netProfit: { type: Type.STRING, description: "Revenue - Cost in INR" },
    confidenceScore: { type: Type.NUMBER, description: "0-100" },
    factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Factors influencing this yield" },
    riskAssessment: { type: Type.STRING, description: "Summary of weather/pest risks" },
    storageAdvice: { type: Type.STRING, description: "Storage vs Selling advice based on price trends" }
  },
  required: ["expectedYield", "revenueEstimate", "costOfCultivation", "netProfit", "confidenceScore", "factors", "riskAssessment", "storageAdvice"]
};

export const predictYield = async (
  crop: string, seed: string, sownDate: string, area: string, irrigation: string,
  soilHealth: string, pestHistory: string,
  lat: number, lng: number, language: string
): Promise<YieldPrediction> => {
  return retryWithBackoff(async () => {
    const searchPrompt = `Research current market price (Mandi rate) for ${crop} in India. 
    Research weather forecast for Latitude ${lat}, Longitude ${lng} for the rest of the growing season.
    Research average cost of cultivation for ${crop} in India per acre.`;
    
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const prompt = `Based on: "${searchRes.text}" and User Inputs: 
    Crop: ${crop}, Seed: ${seed}, Sown: ${sownDate}, Area: ${area} acres, Irrigation: ${irrigation}.
    Soil Health: ${soilHealth}, Past Pests: ${pestHistory}.
    
    Task:
    1. Estimate Yield per acre.
    2. Calculate Revenue based on current prices.
    3. Estimate Cost of Cultivation (Seeds, Fertilizer, Pesticides, Labor).
    4. Calculate Net Profit.
    5. Provide Storage Advice: Is price likely to rise? Should they store or sell now?
    
    Return JSON. Translate to ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: yieldSchema }
    });
    return JSON.parse(response.text || "{}") as YieldPrediction;
  });
};

// 16. Fertilizer Calculator (Updated for Cost Optimization)
const fertilizerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    cropStage: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          product: { type: Type.STRING, description: "Urea, DAP, MOP, etc." },
          dosagePerAcre: { type: Type.STRING },
          method: { type: Type.STRING, description: "Broadcasting, Drip, Foliar" },
          costEstimate: { type: Type.STRING }
        }
      }
    },
    totalCost: { type: Type.STRING },
    organicAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
    roiTips: { type: Type.STRING, description: "Tips to reduce cost or improve efficiency." }
  },
  required: ["cropStage", "recommendations", "totalCost", "organicAlternatives", "roiTips"]
};

export const calculateFertilizer = async (
  crop: string, stage: string, area: string, language: string
): Promise<FertilizerPlan> => {
  return retryWithBackoff(async () => {
    const prompt = `Act as an Indian Agronomist. Calculate fertilizer dose for: ${crop}, Stage: ${stage} days, Area: ${area} acres.
    Use standard Indian government recommendations (NPK ratio).
    Suggest specific products like Urea, DAP, MOP, SSP. 
    Calculate approx cost in INR.
    Provide Cost Optimization tips and Organic alternatives (FYM, Bio-fertilizers).
    Return JSON. Translate to ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: fertilizerSchema }
    });
    return JSON.parse(response.text || "{}") as FertilizerPlan;
  });
};

// 17. Pesticide Safety Advisor (Updated for Mixing & PPE)
const pesticideSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    chemicalName: { type: Type.STRING },
    dosage: { type: Type.STRING, description: "Per liter and per acre" },
    waterVolume: { type: Type.STRING, description: "Water required per acre" },
    mixingOrder: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step by step mixing" },
    safetyGear: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of PPE" },
    waitingPeriod: { type: Type.STRING, description: "Pre-harvest interval (PHI)" },
    compatibility: { type: Type.STRING, description: "What NOT to mix with" }
  },
  required: ["chemicalName", "dosage", "waterVolume", "mixingOrder", "safetyGear", "waitingPeriod", "compatibility"]
};

export const getPesticideSafety = async (
  input: string, language: string
): Promise<PesticideGuidance> => {
  return retryWithBackoff(async () => {
    const prompt = `Provide safety guidelines for pesticide/pest: "${input}".
    Focus on: 
    1. Correct Dosage (ml/gm per liter water).
    2. Water Volume per acre.
    3. Mixing Order (WALES method).
    4. Personal Protection (PPE - Gloves, Mask, etc).
    5. Pre-harvest interval (Waiting period before eating).
    
    Return JSON. Translate to ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: pesticideSchema }
    });
    return JSON.parse(response.text || "{}") as PesticideGuidance;
  });
};

// 18. Storage and Post-Harvest Advice
const storageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    optimalConditions: {
      type: Type.OBJECT,
      properties: {
        temperature: { type: Type.STRING },
        humidity: { type: Type.STRING },
        moistureContent: { type: Type.STRING, description: "Recommended grain moisture %" },
        shelfLife: { type: Type.STRING },
      }
    },
    marketAnalysis: {
      type: Type.OBJECT,
      properties: {
        trend: { type: Type.STRING, enum: ["RISING", "FALLING", "STABLE"] },
        recommendation: { type: Type.STRING, enum: ["SELL", "STORE", "HOLD"] },
        reason: { type: Type.STRING, description: "Short analysis of why to sell or store based on supply/demand." },
      }
    },
    tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tips for reducing post-harvest losses." }
  },
  required: ["optimalConditions", "marketAnalysis", "tips"]
};

export const getStorageAdvice = async (
  crop: string, 
  location: { lat: number, lng: number } | null, 
  language: string
): Promise<StorageAdvice> => {
  return retryWithBackoff(async () => {
    const locationStr = location ? `at Latitude ${location.lat}, Longitude ${location.lng}` : "in India";
    
    const searchPrompt = `Research current market price trends and supply forecasts for '${crop}' ${locationStr}.
    Find optimal storage conditions (Temperature, Humidity, Moisture content) for '${crop}' to prevent spoilage.`;
    
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const prompt = `Based on research: "${searchRes.text}"
    
    Provide Post-Harvest guidance for ${crop}.
    1. Optimal Storage Conditions (Temp, Humidity, Grain Moisture).
    2. Sell vs Store analysis: Should the farmer sell now or store for better price? (RISING trend = STORE, FALLING = SELL).
    3. Tips to reduce losses.
    
    Return JSON. Translate to ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: storageSchema }
    });
    
    return JSON.parse(response.text || "{}") as StorageAdvice;
  });
};

// 19. Marketplace Matchmaker
const buyerSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Company/FPO Name" },
      type: { type: Type.STRING, enum: ["Trader", "FPO", "Company", "Bulk Buyer"] },
      distance: { type: Type.STRING, description: "e.g. 5 km away" },
      priceOffer: { type: Type.STRING, description: "Estimated offer price per quintal" },
      contactInfo: { type: Type.STRING, description: "Address or Phone details" },
      confidence: { type: Type.STRING, enum: ["Verified", "Potential"], description: "Verified if found via search, Potential if general market type." },
      notes: { type: Type.STRING, description: "Buying requirements or reputation." }
    },
    required: ["name", "type", "distance", "priceOffer", "contactInfo", "confidence", "notes"]
  }
};

export const findPotentialBuyers = async (
  crop: string, 
  qty: string, 
  location: { lat: number; lng: number } | null,
  language: string
): Promise<BuyerProfile[]> => {
  return retryWithBackoff(async () => {
    const locationStr = location ? `near Latitude ${location.lat}, Longitude ${location.lng}` : "in India";
    
    // 1. Grounding Search for Real FPOs/Traders
    const searchPrompt = `Find contact details of active Farmer Producer Organizations (FPOs), Mandi Traders, Food Processing Units, or Wholesale buyers for '${crop}' ${locationStr}.
    Also find current market price for '${crop}' to estimate offers.`;
    
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    // 2. Generate Structured List
    const prompt = `Based on the search results: "${searchRes.text}"
    
    Create a list of 5 potential buyers for a farmer selling ${qty} of ${crop} ${locationStr}.
    Include:
    1. Real FPOs or Companies found in the search (mark as 'Verified').
    2. If limited real results, suggest typical buyer types for this region (e.g. "Local Mandi Agent", "Reliance Collection Center") based on standard Indian agriculture market structure (mark as 'Potential').
    3. Estimate an 'Offer Price' based on current market rates found.
    
    Return JSON. Translate descriptions to ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: buyerSchema }
    });
    
    return JSON.parse(response.text || "[]") as BuyerProfile[];
  });
};

// 20. Profitability Calculator
const profitSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalRevenue: { type: Type.STRING },
    netProfit: { type: Type.STRING },
    roi: { type: Type.STRING },
    marketPriceUsed: { type: Type.STRING },
    yieldUsed: { type: Type.STRING },
    costAssessment: { type: Type.STRING },
    optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["totalRevenue", "netProfit", "roi", "marketPriceUsed", "yieldUsed", "costAssessment", "optimizationTips"]
};

export const calculateProfitability = async (
  crop: string,
  acres: number,
  costs: CostBreakdown,
  userYield: number | null, // optional
  location: { lat: number; lng: number } | null,
  language: string
): Promise<ProfitAnalysis> => {
  return retryWithBackoff(async () => {
    const locationStr = location ? `near ${location.lat}, ${location.lng}` : "in India";
    
    // 1. Get Market Data & Yield Benchmarks
    const searchPrompt = `Current Mandi market price for '${crop}' ${locationStr}. Average yield per acre for '${crop}' in this region.`;
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const prompt = `Based on market data: "${searchRes.text}"
    
    User Data:
    Crop: ${crop}, Area: ${acres} acres.
    Costs (Total for all acres): 
    - Seeds: ${costs.seeds}
    - Fertilizers: ${costs.fertilizers}
    - Pesticides: ${costs.pesticides}
    - Labor: ${costs.labor}
    - Irrigation: ${costs.irrigation}
    - Transport: ${costs.transport}
    - Machinery: ${costs.machinery}
    - Other: ${costs.other}
    Total Cost: ${costs.total}
    
    User Specified Yield: ${userYield ? userYield + ' Quintals' : 'Not specified, estimate based on average'}.
    
    Task:
    1. Determine Market Price (use average).
    2. Determine Yield (use User Specified if present, else use regional average * acres).
    3. Calculate Revenue = Yield * Price.
    4. Calculate Profit = Revenue - Total Cost.
    5. Calculate ROI = (Profit / Total Cost) * 100.
    6. Compare user's costs with standard benchmarks. Is labor too high? Are fertilizers too expensive?
    
    Return JSON in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: profitSchema }
    });
    
    return JSON.parse(response.text || "{}") as ProfitAnalysis;
  });
};

// 21. Scheme Assistance Guide
const guideSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    schemeName: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
        }
      }
    },
    requiredDocuments: { type: Type.ARRAY, items: { type: Type.STRING } },
    tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Insider hacks or tips to avoid rejection" },
    eligibility: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["schemeName", "steps", "requiredDocuments", "tips", "eligibility"]
};

export const generateSchemeGuide = async (
  topic: string, 
  language: string
): Promise<SchemeGuide> => {
  return retryWithBackoff(async () => {
    const prompt = `Create a simple, step-by-step "Bureaucracy Buster" guide for an Indian farmer for: "${topic}".
    
    Structure required:
    1. Scheme Name.
    2. Steps: Numbered checklist of what to do (e.g., "Go to CSC center", "Fill Form A").
    3. Required Documents: Exact list (e.g., "Aadhaar", "7/12 Extract").
    4. Insider Tips: Tricks to speed up the process or avoid rejection (e.g., "Best time to visit bank", "Common mistakes").
    5. Eligibility: Who can apply?
    
    Focus on removing frustration. Be practical.
    Respond in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: guideSchema }
    });
    
    return JSON.parse(response.text || "{}") as SchemeGuide;
  });
};

// 22. Electricity Schedule (Power Planner)
const powerSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    location: { type: Type.STRING, description: "District/State identified" },
    currentStatus: { type: Type.STRING, enum: ["3-Phase", "Single Phase", "No Power"] },
    nextPowerSlot: { type: Type.STRING, description: "e.g. 2:30 AM" },
    duration: { type: Type.STRING, description: "e.g. 6 Hours" },
    schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          startTime: { type: Type.STRING },
          endTime: { type: Type.STRING },
          phase: { type: Type.STRING, enum: ["3-Phase", "Single Phase"] }
        }
      }
    },
    alertMessage: { type: Type.STRING, description: "Short urgent message like 'Power will come at 2:30 AM'" },
    source: { type: Type.STRING, description: "DISCOM name or source of roster" }
  },
  required: ["location", "currentStatus", "nextPowerSlot", "duration", "schedule", "alertMessage", "source"]
};

export const getPowerSchedule = async (
  state: string,
  district: string,
  location: { lat: number, lng: number } | null,
  language: string
): Promise<PowerSchedule> => {
  return retryWithBackoff(async () => {
    const locationStr = location ? `Lat ${location.lat}, Lng ${location.lng}` : `${district}, ${state}`;
    
    const searchPrompt = `Find the official agricultural electricity supply schedule (load shedding roster) for ${district}, ${state}, India.
    Look for DISCOM (e.g. MSEDCL, TSSPDCL, BESCOM, UPPCL) agricultural feeder timings (3-phase supply hours).
    Check if there is a day/night rotation (e.g. Week A Day, Week B Night).
    Estimate the schedule for TODAY based on the current week/date.`;
    
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const prompt = `Based on search data: "${searchRes.text}"
    
    Generate a Power Supply Alert for a farmer in ${district}, ${state}.
    Current Time: ${new Date().toLocaleTimeString()}.
    
    Task:
    1. Estimate if 3-Phase power is currently ON or OFF based on typical rosters found.
    2. Predict the NEXT 3-Phase slot (e.g. if it's night shift week, maybe 10 PM or 2 AM).
    3. Create a schedule for the next 24 hours.
    4. Generate a clear ALERT message.
    
    Return JSON in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: powerSchema }
    });
    
    return JSON.parse(response.text || "{}") as PowerSchedule;
  });
};

// 23. Market Price Forecasting
const forecastSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    crop: { type: Type.STRING },
    currentPrice: { type: Type.STRING },
    forecast: { 
      type: Type.ARRAY, 
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.STRING, description: "e.g. Week 1" },
          price: { type: Type.NUMBER, description: "Predicted price" },
          trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
          label: { type: Type.STRING, description: "e.g. Next Week" }
        }
      }
    },
    decision: { type: Type.STRING, enum: ['SELL', 'STORE', 'HOLD'] },
    decisionReason: { type: Type.STRING, description: "Explanation based on events/weather" },
    bestMandis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          distance: { type: Type.STRING },
          price: { type: Type.STRING }
        }
      }
    },
    factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key influencers like festivals or rain" }
  },
  required: ["crop", "currentPrice", "forecast", "decision", "decisionReason", "bestMandis", "factors"]
};

export const generateMarketForecast = async (
  crop: string,
  location: { lat: number, lng: number } | null,
  language: string
): Promise<MarketForecast> => {
  return retryWithBackoff(async () => {
    const locationStr = location ? `Lat ${location.lat}, Lng ${location.lng}` : "India";
    
    // 1. Search for live signals
    const searchPrompt = `Search current market price for '${crop}' in ${locationStr} (Mandi rates).
    Search for:
    1. Upcoming Indian festivals in next 4 weeks impacting demand (e.g. Diwali, Holi, Wedding Season).
    2. Recent weather impact on supply (e.g. Rain damage in Nashik/Karnataka).
    3. Export policies or government bans on ${crop}.
    4. Price trends for ${crop} over last month.`;
    
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    // 2. Generate Prediction
    const prompt = `Based on real-time data: "${searchRes.text}"
    
    Act as a Financial Analyst for a farmer. Predict the price of ${crop} for the next 4 weeks.
    
    Task:
    1. Determine Current Price.
    2. Predict price for next 4 weeks based on Supply (Weather) & Demand (Festivals).
    3. Decide: SELL NOW (if price dropping) or STORE (if price rising).
    4. List 3 top Mandis nearby with high rates (estimate based on typical major markets if exact data missing).
    5. List key factors driving this prediction.
    
    Return JSON in ${language}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: forecastSchema }
    });
    
    return JSON.parse(response.text || "{}") as MarketForecast;
  });
};
