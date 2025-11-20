
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Globe, ExternalLink, Navigation, TrendingUp, RefreshCw, Clock, Sprout, Satellite, Newspaper, BookOpenText, BarChart, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { searchAgriculturalData, findNearbyResources, fetchMarketNews, generateMarketForecast } from '../services/gemini';
import { GroundingResult, MarketForecast } from '../types';
import { VoiceInput, TextToSpeech } from './VoiceControls';

interface MarketInsightsProps {
  t: any;
  languageCode?: string;
  userLocation: { lat: number; lng: number } | null;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({ t, languageCode = 'en', userLocation }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'maps' | 'satellite' | 'news' | 'forecast'>('search');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GroundingResult | null>(null);

  // New state for commodities
  const [commodityData, setCommodityData] = useState<GroundingResult | null>(null);
  const [loadingCommodities, setLoadingCommodities] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // News state
  const [newsData, setNewsData] = useState<GroundingResult | null>(null);
  const [loadingNews, setLoadingNews] = useState(false);
  
  // Expert Opinions State
  const [opinionData, setOpinionData] = useState<GroundingResult | null>(null);
  const [loadingOpinions, setLoadingOpinions] = useState(false);

  // Forecast State
  const [forecastCrop, setForecastCrop] = useState('');
  const [forecastData, setForecastData] = useState<MarketForecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Check for Indian context
  const isIndianLanguage = ['hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as'].includes(languageCode);
  const isIndianLocation = userLocation ? (userLocation.lat >= 6 && userLocation.lat <= 37 && userLocation.lng >= 68 && userLocation.lng <= 98) : false;
  const isIndianContext = isIndianLanguage || isIndianLocation;

  const fetchCommodities = async () => {
    setLoadingCommodities(true);
    try {
      let prompt = "";
      
      if (userLocation && isIndianContext) {
         prompt = `Get current Mandi prices (APMC rates in ₹/Quintal) for major crops (Onion, Tomato, Potato, Wheat, Rice, Soybean) specifically near Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng}. List the Mandi name if possible. Respond in ${languageCode} or English.`;
      } else if (userLocation) {
        prompt = `Get current agricultural market prices for major crops near Latitude: ${userLocation.lat}, Longitude: ${userLocation.lng}. Focus on crops grown in this specific region. Return prices in local currency. Respond in English.`;
      } else if (isIndianContext) {
         // Targeted prompt for Indian Farmer context without precise location
         prompt = "Get current Mandi market prices in India (₹ per Quintal) for major crops: Wheat, Rice (Paddy), Cotton, Sugarcane, Onion, Tomato, Potato, Mustard. Return a concise, easy-to-read list in the local language if possible or English.";
      } else {
         prompt = "Current market prices for major agricultural commodities: Wheat, Corn, Soybeans, Rice, Coffee, Cotton. Provide the latest price, unit, and percentage change if available.";
      }
        
      const data = await searchAgriculturalData(prompt);
      setCommodityData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch commodities", error);
    } finally {
      setLoadingCommodities(false);
    }
  };

  const fetchNews = async () => {
      setLoadingNews(true);
      try {
          const langName = languageCode === 'hi' ? 'Hindi' : 'English';
          const data = await fetchMarketNews(langName, userLocation);
          setNewsData(data);
      } catch (e) {
          console.error(e);
      } finally {
          setLoadingNews(false);
      }
  };

  const fetchOpinions = async () => {
      setLoadingOpinions(true);
      try {
          const langName = languageCode === 'hi' ? 'Hindi' : 'English';
          const prompt = `Find recent agricultural expert opinions, blog posts, or editorials relevant to Indian farmers. Focus on topics like market trends for major crops, new sustainable farming techniques, or analysis of recent government policy impacts. Summarize 3 key insights or articles. Respond in ${langName}.`;
          const data = await searchAgriculturalData(prompt);
          setOpinionData(data);
      } catch (e) {
          console.error("Failed to fetch opinions", e);
      } finally {
          setLoadingOpinions(false);
      }
  };

  const handleForecast = async () => {
    if (!forecastCrop) return;
    setLoadingForecast(true);
    try {
      const langName = languageCode === 'hi' ? 'Hindi' : 'English';
      const data = await generateMarketForecast(forecastCrop, userLocation, langName);
      setForecastData(data);
    } catch (e) {
      console.error("Forecast error", e);
    } finally {
      setLoadingForecast(false);
    }
  };

  // Re-fetch when location becomes available or language changes
  useEffect(() => {
    fetchCommodities();
  }, [languageCode, userLocation]);

  // Auto-fetch news when tab is clicked first time
  useEffect(() => {
      if (activeTab === 'news') {
          if (!newsData) fetchNews();
          if (!opinionData) fetchOpinions();
      }
  }, [activeTab]);

  const handleSearch = async (txt = query) => {
    setLoading(true);
    setResult(null);

    try {
      let prompt = "";
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      
      if (activeTab === 'satellite') {
         // Satellite Grounding Search
         if (userLocation) {
            prompt = `Search for recent satellite-based agricultural reports for the region near Latitude ${userLocation.lat}, Longitude ${userLocation.lng}. Look for Soil Moisture levels, Vegetation Health Index (VHI), and Rainfall deficit reports from ISRO (Vedas/Bhuvan) or reliable weather agencies. Summarize the soil health and weather conditions for a farmer. Respond in ${lang}.`;
         } else {
            prompt = `Search for recent satellite-based agricultural reports (Soil moisture, Vegetation index) for major agricultural regions in India. Respond in ${lang}.`;
         }
         const data = await searchAgriculturalData(prompt);
         setResult(data);
      } else if (activeTab === 'search') {
        const locationPrompt = userLocation ? `near coordinates ${userLocation.lat},${userLocation.lng}` : '';
        prompt = `${txt} ${locationPrompt}. Respond in ${lang}.`;
        const data = await searchAgriculturalData(prompt);
        setResult(data);
      } else {
        // Maps
        if (userLocation) {
            prompt = `${txt}. Respond in ${lang}.`;
            const data = await findNearbyResources(prompt, userLocation.lat, userLocation.lng);
            setResult(data);
            setLoading(false);
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            prompt = `${txt}. Respond in ${lang}.`;
            const data = await findNearbyResources(prompt, position.coords.latitude, position.coords.longitude);
            setResult(data);
            setLoading(false);
          }, (err) => {
            alert(t.error_camera || "Location access denied.");
            setLoading(false);
          });
          return; // Wait for callback
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (activeTab !== 'maps' || userLocation) setLoading(false);
    }
  };

  // Trigger search automatically for satellite tab if location exists
  useEffect(() => {
    if (activeTab === 'satellite' && userLocation) {
       handleSearch();
    }
  }, [activeTab, userLocation]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.market_title_page}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.market_desc}</p>
      </div>

      {/* Commodity Snapshot Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8 transition-colors">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-green-500" size={20} />
              {userLocation ? `${t.market_snapshot || "Market Snapshot"} (${isIndianContext ? 'Nearby Mandi' : 'Near You'})` : (t.market_snapshot || "Market Snapshot")}
            </h3>
            <div className="flex items-center gap-3">
               {/* Read Aloud Button */}
               {commodityData && (
                  <TextToSpeech text={commodityData.text} languageCode={languageCode} label="Listen" small />
               )}
               {lastUpdated && (
                 <span className="text-xs text-slate-400 flex items-center gap-1">
                   <Clock size={12} />
                   {lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </span>
               )}
               <button 
                 onClick={fetchCommodities}
                 disabled={loadingCommodities}
                 className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                 title={t.refresh || "Refresh"}
               >
                 <RefreshCw size={16} className={loadingCommodities ? "animate-spin" : ""} />
               </button>
            </div>
         </div>
         
         <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 min-h-[100px]">
            {loadingCommodities ? (
               <div className="flex items-center justify-center h-20 text-slate-400 gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
               </div>
            ) : commodityData ? (
               <div>
                  <div className="prose prose-slate dark:prose-invert prose-sm max-w-none mb-3">
                     <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{commodityData.text}</p>
                  </div>
                  {/* Grounding Chips for Commodities */}
                  {commodityData.chunks && commodityData.chunks.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-2">
                       {commodityData.chunks.map((chunk, idx) => (
                         chunk.web?.uri ? (
                           <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <ExternalLink size={10} />
                              {chunk.web.title || "Source"}
                           </a>
                         ) : null
                       ))}
                     </div>
                  )}
               </div>
            ) : (
               <div className="text-center text-slate-400 text-sm py-4">
                  {t.error_generic || "Unavailable"}
               </div>
            )}
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('search'); setResult(null); }}
            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'search' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Globe size={18} /> {t.market_search}
          </button>
          <button
            onClick={() => { setActiveTab('forecast'); }}
            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'forecast' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <BarChart size={18} /> {t.forecast_tab || "Forecast"}
          </button>
          <button
            onClick={() => { setActiveTab('maps'); setResult(null); }}
            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'maps' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <MapPin size={18} /> {t.nearby_res}
          </button>
          <button
            onClick={() => { setActiveTab('satellite'); setResult(null); }}
            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'satellite' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Satellite size={18} /> {t.sat_title || "Satellite Insights"}
          </button>
          <button
            onClick={() => { setActiveTab('news'); }}
            className={`flex-1 py-4 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'news' ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Newspaper size={18} /> {t.news_tab || "News"}
          </button>
        </div>

        {/* Conditional Input Bar - Hide for Satellite/News Tab if we are auto-loading */}
        {activeTab !== 'satellite' && activeTab !== 'news' && activeTab !== 'forecast' && (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={activeTab === 'search' ? t.search_ph : t.nearby_ph}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceInput onInput={(text) => { setQuery(text); handleSearch(text); }} languageCode={languageCode} compact />
                </div>
              </div>
              <button 
                onClick={() => handleSearch()}
                disabled={loading || !query}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                {loading ? t.searching : t.go}
              </button>
            </div>
          </div>
        )}

        <div className="p-8 min-h-[300px]">
           
           {/* FORECAST CONTENT */}
           {activeTab === 'forecast' && (
              <div className="space-y-8">
                {/* Forecast Input */}
                <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex-1 w-full">
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 ml-1">{t.plant_id || "Crop Name"}</label>
                     <div className="relative">
                       <input 
                          type="text" 
                          value={forecastCrop} 
                          onChange={e => setForecastCrop(e.target.value)} 
                          placeholder="e.g. Onion, Cotton" 
                          className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          onKeyPress={e => e.key === 'Enter' && handleForecast()}
                       />
                       <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <VoiceInput onInput={(text) => { setForecastCrop(text); }} languageCode={languageCode} compact />
                       </div>
                     </div>
                  </div>
                  <button 
                    onClick={handleForecast} 
                    disabled={loadingForecast || !forecastCrop}
                    className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                  >
                     {loadingForecast ? "Analyzing..." : t.analyze_forecast || "Predict"}
                  </button>
                </div>

                {forecastData ? (
                   <div className="animate-slide-up space-y-8">
                      {/* 1. Decision Card */}
                      <div className={`p-8 rounded-3xl text-center border-2 ${
                         forecastData.decision === 'SELL' 
                           ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                           : forecastData.decision === 'STORE' 
                             ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                             : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                      }`}>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">AI Recommendation</h3>
                         <div className={`text-4xl md:text-5xl font-black mb-3 ${
                            forecastData.decision === 'SELL' ? 'text-red-600' : forecastData.decision === 'STORE' ? 'text-green-600' : 'text-amber-600'
                         }`}>
                            {t[forecastData.decision.toLowerCase() + (forecastData.decision === 'SELL' ? '_now' : forecastData.decision === 'STORE' ? '_crop' : '_wait')] || forecastData.decision}
                         </div>
                         <p className="text-slate-700 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                           "{forecastData.decisionReason}"
                         </p>
                         <div className="mt-4 flex justify-center">
                            <TextToSpeech text={`${forecastData.decision}. ${forecastData.decisionReason}`} languageCode={languageCode} label="Listen to Advice" />
                         </div>
                      </div>

                      {/* Charts and Factors ... (Kept Same) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* 2. Price Trend Chart */}
                         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                               <TrendingUp className="text-blue-500" size={20} />
                               {t.price_trend || "4-Week Trend"}
                            </h4>
                            <div className="flex items-end justify-between gap-3 h-48">
                               {forecastData.forecast.map((week, i) => (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                     <div className="text-xs font-bold text-slate-400 mb-1">
                                        {week.trend === 'up' ? <ArrowUpRight className="text-green-500" size={16} /> : week.trend === 'down' ? <ArrowDownRight className="text-red-500" size={16} /> : '-'}
                                     </div>
                                     <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative h-full flex items-end overflow-hidden group">
                                        <div 
                                          className={`w-full rounded-t-lg transition-all duration-1000 ${week.trend === 'up' ? 'bg-green-500' : week.trend === 'down' ? 'bg-red-500' : 'bg-blue-400'}`}
                                          style={{ height: `${Math.min((week.price / (Math.max(...forecastData.forecast.map(f=>f.price)) * 1.2)) * 100, 100)}%` }}
                                        ></div>
                                        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold text-white drop-shadow-md">
                                           {week.price}
                                        </div>
                                     </div>
                                     <span className="text-[10px] font-bold text-slate-500 uppercase text-center leading-tight">{week.label}</span>
                                  </div>
                               ))}
                            </div>
                         </div>

                         {/* 3. Factors & Mandis */}
                         <div className="space-y-6">
                            {/* Factors */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                               <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                  <AlertCircle className="text-orange-500" size={20} />
                                  {t.price_factors || "Key Factors"}
                               </h4>
                               <ul className="space-y-2">
                                  {forecastData.factors.map((factor, i) => (
                                     <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0"></span>
                                        {factor}
                                     </li>
                                  ))}
                               </ul>
                            </div>

                            {/* Best Mandis */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                               <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                  <MapPin className="text-emerald-500" size={20} />
                                  {t.best_mandis || "Top Paying Mandis"}
                               </h4>
                               <div className="space-y-3">
                                  {forecastData.bestMandis.map((mandi, i) => (
                                     <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                        <div>
                                           <p className="font-bold text-sm text-slate-900 dark:text-white">{mandi.name}</p>
                                           <p className="text-xs text-slate-500">{mandi.distance}</p>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800">
                                           {mandi.price}
                                        </span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <BarChart size={48} className="opacity-20 mb-4" />
                      <p className="text-center max-w-xs text-sm">
                         {t.forecast_desc || "Enter a crop name to see AI price predictions based on festivals, weather, and supply."}
                      </p>
                   </div>
                )}
              </div>
           )}

           {/* SATELLITE CONTENT */}
           {activeTab === 'satellite' && (
             loading ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-slate-400 gap-4">
                  <Satellite size={48} className="animate-pulse" />
                  <p>Fetching regional satellite report...</p>
                </div>
             ) : result ? (
               <div className="space-y-6">
                  <div className="flex justify-end">
                     <TextToSpeech text={result.text} languageCode={languageCode} label="Listen" small />
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-slate-900 dark:text-slate-200">{result.text}</p>
                  </div>
                  {result.chunks && result.chunks.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                      {result.chunks.map((chunk, idx) => (
                        chunk.web?.uri ? (
                          <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="block p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-slate-900 group">
                             <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{chunk.web.title}</h4>
                             <div className="flex items-center text-xs text-slate-400 gap-1">
                               <ExternalLink size={12} /> {new URL(chunk.web.uri).hostname}
                             </div>
                          </a>
                        ) : null
                      ))}
                    </div>
                  )}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                 <Search size={48} className="opacity-20 mb-4" />
                 <p>{t.ai_insights}</p>
               </div>
             )
           )}

           {/* NEWS CONTENT */}
           {activeTab === 'news' && (
            <div className="space-y-10">
             {/* Section 1: Market News */}
             <div className="space-y-6">
               <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <Newspaper size={20} className="text-blue-500" />
                    {t.news_section_title || "Latest Market Updates"}
                  </h3>
                  <div className="flex gap-3 items-center">
                    {newsData && <TextToSpeech text={newsData.text} languageCode={languageCode} label="Listen" small />}
                    <button onClick={fetchNews} disabled={loadingNews} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 disabled:opacity-50">
                       <RefreshCw size={14} className={loadingNews ? "animate-spin" : ""} /> {t.refresh}
                    </button>
                  </div>
               </div>
               
               {loadingNews ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-4/6"></div>
                  </div>
               ) : newsData ? (
                  <div>
                     <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-900 dark:text-slate-200">
                           {newsData.text}
                        </p>
                     </div>
                     {/* News Sources */}
                     {newsData.chunks && newsData.chunks.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                              {newsData.chunks.map((chunk, idx) => (
                                 chunk.web?.uri ? (
                                    <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-200 dark:border-slate-700">
                                       <ExternalLink size={10} />
                                       <span className="max-w-[150px] truncate">{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                                    </a>
                                 ) : null
                              ))}
                        </div>
                     )}
                  </div>
               ) : (
                  <p className="text-slate-400 text-sm italic">No news available.</p>
               )}
             </div>

             {/* Section 2: Expert Opinions */}
             <div className="space-y-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
               <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                    <BookOpenText size={20} className="text-purple-500" />
                    {t.expert_opinions || "Expert Opinions & Blogs"}
                  </h3>
                  <div className="flex gap-3 items-center">
                    {opinionData && <TextToSpeech text={opinionData.text} languageCode={languageCode} label="Listen" small />}
                    <button onClick={fetchOpinions} disabled={loadingOpinions} className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 disabled:opacity-50">
                       <RefreshCw size={14} className={loadingOpinions ? "animate-spin" : ""} /> {t.refresh}
                    </button>
                  </div>
               </div>

               {loadingOpinions ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  </div>
               ) : opinionData ? (
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-5 border border-purple-100 dark:border-purple-900/30">
                     <div className="prose prose-slate dark:prose-invert max-w-none mb-4">
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200 text-sm">
                           {opinionData.text}
                        </p>
                     </div>
                     {/* Opinion Sources */}
                     {opinionData.chunks && opinionData.chunks.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Read Full Articles</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {opinionData.chunks.map((chunk, idx) => (
                                    chunk.web?.uri ? (
                                        <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="flex flex-col p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 transition-all group shadow-sm">
                                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-400 line-clamp-2 mb-1">{chunk.web.title}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                {new URL(chunk.web.uri).hostname}
                                            </span>
                                        </a>
                                    ) : null
                                ))}
                            </div>
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                     <BookOpenText size={32} className="mx-auto mb-2 opacity-30" />
                     <p className="text-sm">Insights unavailable right now.</p>
                  </div>
               )}
             </div>
            </div>
           )}

           {/* SEARCH & MAPS CONTENT */}
           {(activeTab === 'search' || activeTab === 'maps') && (
              result ? (
                 <div className="space-y-6">
                    <div className="flex justify-end">
                       <TextToSpeech text={result.text} languageCode={languageCode} label="Listen to Results" small />
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <p className="text-lg leading-relaxed text-slate-900 dark:text-slate-200">{result.text}</p>
                    </div>
                    {result.chunks && result.chunks.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        {result.chunks.map((chunk, idx) => (
                          chunk.web?.uri ? (
                            <a key={idx} href={chunk.web.uri} target="_blank" rel="noreferrer" className="block p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-slate-900 group">
                               <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{chunk.web.title}</h4>
                               <div className="flex items-center text-xs text-slate-400 gap-1">
                                 <ExternalLink size={12} /> {new URL(chunk.web.uri).hostname}
                               </div>
                            </a>
                          ) : null
                        ))}
                      </div>
                    )}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
                   <Search size={48} className="opacity-20 mb-4" />
                   <p>{t.ai_insights}</p>
                 </div>
               )
           )}
        </div>
      </div>
    </div>
  );
};
