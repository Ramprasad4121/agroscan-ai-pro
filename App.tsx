
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ConsumerDashboard } from './components/ConsumerDashboard';
import { StakeholderDashboard } from './components/StakeholderDashboard';
import { FPODashboard } from './components/FPODashboard';
import { Scanner } from './components/Scanner';
import { AnalysisResult } from './components/AnalysisResult';
import { ChatInterface } from './components/ChatInterface';
import { Footer } from './components/Footer';
import { ImageGenerator } from './components/ImageGenerator';
import { Login } from './components/Login';
import { VideoAnalyzer } from './components/VideoAnalyzer';
import { AudioAssistant } from './components/AudioAssistant';
import { MarketInsights } from './components/MarketInsights';
import { LiveConversation } from './components/LiveConversation';
import { GovernmentSchemes } from './components/GovernmentSchemes';
import { CropCalendar } from './components/CropCalendar';
import { CropRecommendation } from './components/CropRecommendation';
import { WaterSmart } from './components/WaterSmart';
import { YieldEstimator } from './components/YieldEstimator';
import { FertilizerCalc } from './components/FertilizerCalc';
import { PesticideAdvisor } from './components/PesticideAdvisor';
import { StorageGuide } from './components/StorageGuide';
import { Marketplace } from './components/Marketplace';
import { ProfitCalculator } from './components/ProfitCalculator';
import { ElectricityTracker } from './components/ElectricityTracker';
import { OnboardingTour } from './components/OnboardingTour';
import { LanguageSelector } from './components/LanguageSelector';
import { AgriPassport } from './components/AgriPassport';
import { Community } from './components/Community';
import { WhatsAppBot } from './components/WhatsAppBot';
import { DroneServices } from './components/DroneServices';
import { PlantDiagnosis, User, ViewState } from './types';
import { Leaf, Share2, MessageCircle, Loader2 } from 'lucide-react';
import { LanguageCode } from './translations';
import { useTranslation } from './hooks/useTranslation';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('login');
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  
  // Initialize language from local storage or null to force selection
  const [language, setLanguage] = useState<string | null>(() => {
    const saved = localStorage.getItem('app_language');
    return saved || null;
  });
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showTour, setShowTour] = useState(false);

  // Use the new dynamic translation hook
  const { t, isTranslating } = useTranslation(language);

  // Handle persistent language selection
  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied or failed", error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setView('home');
    
    // Only show tour for Farmers as the other dashboards are self-explanatory/professional
    if (userData.role === 'farmer') {
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour) {
        setTimeout(() => setShowTour(true), 1000);
      }
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setDiagnosis(null);
    setCurrentImage(null);
    
    // Clear language on logout to force selection for next user/session
    setLanguage(null);
    localStorage.removeItem('app_language');
  };

  const handleAnalysisComplete = (result: PlantDiagnosis, image: string) => {
    setDiagnosis(result);
    setCurrentImage(image);
    setIsAnalyzing(false);
    setView('result');
  };

  const handleWhatsAppShare = () => {
    if (!diagnosis) return;

    const isHealthy = diagnosis.isHealthy;
    const condition = isHealthy ? `${t.healthy} ✅` : `${t.issue_detected} ⚠️`;
    const headline = `🌱 *AgriScanAi Pro - ${t.plant_id}*`;
    
    let message = `${headline}\n\n`;
    message += `*${t.plant_id}:* ${diagnosis.plantName}\n`;
    message += `*Condition:* ${condition}\n`;
    
    if (!isHealthy && diagnosis.diseaseName) {
      message += `*Problem:* ${diagnosis.diseaseName}\n`;
    }
    
    message += `*${t.confidence}:* ${diagnosis.confidence}%\n\n`;
    message += `*${t.expert_advice}:*\n${diagnosis.expertAdvice}\n\n`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // --- BACKGROUND LOGIC ---
  // We use a high-quality illustration-style field image.
  const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1920&auto=format&fit=crop";
  
  const getBackgroundStyles = () => {
    const baseStyle = "min-h-screen flex flex-col transition-colors duration-500 font-sans selection:bg-green-200 selection:text-green-900 ";
    
    // 1. Login Screen
    if (view === 'login') {
      return {
        className: baseStyle + "bg-cover bg-center bg-fixed relative",
        style: { backgroundImage: `url(${BACKGROUND_IMAGE})` },
        overlayClass: "absolute inset-0 bg-black/10 backdrop-blur-[1px]"
      };
    }

    // 2. Stakeholder (Bank/Govt/Company/Insurance) - Corporate Feel
    // Uses the same image but with a heavy Blue-Grey Overlay
    if (user && ['govt', 'bank', 'company', 'insurance', 'admin'].includes(user.role)) {
      return {
        className: baseStyle + "bg-cover bg-center bg-fixed relative",
        style: { backgroundImage: `url(${BACKGROUND_IMAGE})` },
        overlayClass: "absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
      };
    }

    // 3. Farmer / Consumer Dashboard (Home) - Fresh Feel
    // Uses the image with a light overlay to keep it vibrant
    if ((user?.role === 'farmer' || user?.role === 'consumer') && view === 'home') {
      return {
        className: baseStyle + "bg-cover bg-center bg-fixed relative",
        style: { backgroundImage: `url(${BACKGROUND_IMAGE})` },
        overlayClass: "absolute inset-0 bg-white/10" // Very light overlay
      };
    }

    // 4. Inner Pages (Tools, Forms, Details) - Clean White/Light Background for Readability
    return {
      className: baseStyle + "bg-slate-50 dark:bg-slate-950",
      style: {},
      overlayClass: "hidden"
    };
  };

  const bgConfig = getBackgroundStyles();

  // 1. LOGIN SCREEN (First Priority)
  if (view === 'login') {
    return (
      <div className={bgConfig.className} style={bgConfig.style}>
         <div className={bgConfig.overlayClass}></div>
         <div className="relative z-10 w-full h-full flex flex-col">
            <Login onLogin={handleLogin} t={t} />
         </div>
      </div>
    );
  }

  // 2. FORCE LANGUAGE SELECTION (Post-Login)
  if (!language) {
    return <LanguageSelector onSelect={(code) => handleSetLanguage(code)} userName={user?.name} />;
  }

  // 3. MAIN APPLICATION
  const renderRoleBasedInterface = () => {
    // 1. CONSUMER INTERFACE
    if (user?.role === 'consumer') {
      return <ConsumerDashboard t={t} userLocation={userLocation} />;
    }
    
    // 2. FPO INTERFACE
    if (user?.role === 'fpo') {
      return <FPODashboard t={t} userLocation={userLocation} userName={user.name} />;
    }

    // 3. STAKEHOLDER INTERFACES
    if (user?.role && ['govt', 'bank', 'company', 'insurance', 'service_provider', 'admin'].includes(user.role)) {
      return <StakeholderDashboard role={user.role} t={t} userLocation={userLocation} />;
    }
    
    // 4. FARMER INTERFACE (Default View with Routing)
    return (
      <>
        {view === 'home' && (
           <>
             <Hero 
               onNavigate={setView} 
               t={t} 
               userLocation={userLocation} 
               userName={user?.name}
             />
             {showTour && <OnboardingTour t={t} onComplete={handleTourComplete} />}
           </>
        )}

        {view === 'visualize' && <ImageGenerator t={t} />}
        {view === 'video' && <VideoAnalyzer t={t} />}
        {view === 'audio' && <AudioAssistant t={t} />}
        {view === 'market' && <MarketInsights t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'live' && <LiveConversation t={t} languageCode={language} />}
        {view === 'schemes' && <GovernmentSchemes t={t} languageCode={language} />}
        {view === 'calendar' && <CropCalendar t={t} languageCode={language} />}
        {view === 'recommend' && <CropRecommendation t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'water' && <WaterSmart t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'yield' && <YieldEstimator t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'fertilizer' && <FertilizerCalc t={t} languageCode={language} />}
        {view === 'pesticide' && <PesticideAdvisor t={t} languageCode={language} />}
        {view === 'storage' && <StorageGuide t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'marketplace' && <Marketplace t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'profit' && <ProfitCalculator t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'electricity' && <ElectricityTracker t={t} languageCode={language} userLocation={userLocation} />}
        {view === 'passport' && <AgriPassport t={t} userLocation={userLocation} userName={user?.name} />}
        {view === 'community' && <Community t={t} userLocation={userLocation} />}
        {view === 'drones' && <DroneServices t={t} userLocation={userLocation} />}

        {view === 'scan' && (
          <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in">
            <div className="w-full max-w-3xl">
              <Scanner 
                onAnalyzeStart={() => setIsAnalyzing(true)}
                onAnalyzeComplete={handleAnalysisComplete}
                onError={() => setIsAnalyzing(false)}
                t={t}
                languageCode={language}
                userLocation={userLocation}
              />
            </div>
          </div>
        )}

        {view === 'result' && diagnosis && currentImage && (
          <div className="flex-grow animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden p-4 transition-colors">
                    <div className="aspect-square rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 mb-4 ring-1 ring-black/5">
                      <img src={currentImage} alt="Analyzed Plant" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t.plant_id}</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{diagnosis.plantName}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setView('scan')} className="w-full py-3 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <Leaf className="w-5 h-5" /> {t.scan_another}
                  </button>
                  <button className="w-full py-3 px-4 bg-[#25D366] text-white font-bold rounded-xl shadow-sm hover:brightness-105 hover:shadow-md transition-all flex items-center justify-center gap-2" onClick={handleWhatsAppShare}>
                     <Share2 className="w-5 h-5" /> {t.share_whatsapp}
                  </button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <AnalysisResult diagnosis={diagnosis} t={t} languageCode={language} userLocation={userLocation} />
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[500px]">
                    <ChatInterface diagnosisContext={diagnosis} t={t} languageCode={language} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={bgConfig.className} style={bgConfig.style}>
      {/* Global Background Overlay */}
      <div className={bgConfig.overlayClass}></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          user={user}
          onNavigate={setView}
          onLogout={handleLogout}
          currentView={view}
          language={language as LanguageCode || 'en'}
          setLanguage={(code) => handleSetLanguage(code)}
        />
        
        {/* Translation Loading Overlay */}
        {isTranslating && (
          <div className="fixed inset-0 z-50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-200 dark:border-slate-700">
               <Loader2 size={32} className="text-[#388E3C] animate-spin" />
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Translating...</h3>
                  <p className="text-xs text-slate-500">Optimizing language for your region</p>
               </div>
            </div>
          </div>
        )}

        <main className="flex-grow flex flex-col relative">
          {renderRoleBasedInterface()}
        </main>

        {/* Global WhatsApp Bot FAB */}
        {user?.role === 'farmer' && (
          <>
             <button 
               onClick={() => setShowWhatsApp(true)}
               className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-xl shadow-green-200/50 dark:shadow-none flex items-center justify-center transition-transform hover:scale-110"
               title={t.whatsapp_title}
             >
               <MessageCircle size={28} fill="white" />
             </button>
             
             {showWhatsApp && language && (
                <WhatsAppBot 
                  t={t} 
                  languageCode={language} 
                  userLocation={userLocation} 
                  onClose={() => setShowWhatsApp(false)} 
                />
             )}
          </>
        )}

        <Footer t={t} />
        
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm w-full text-center">
              <Leaf className="w-12 h-12 text-[#388E3C] mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">{t.analyzing}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t.analyzing_desc}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
