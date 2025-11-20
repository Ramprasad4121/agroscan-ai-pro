
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
  
  const [language, setLanguage] = useState<string | null>(() => {
    const saved = localStorage.getItem('app_language');
    return saved || null;
  });
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showTour, setShowTour] = useState(false);

  const { t, isTranslating } = useTranslation(language);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  // Theme Management based on Role
  useEffect(() => {
    const root = document.documentElement;
    if (user?.role === 'consumer') {
      root.classList.remove('dark'); // Light mode for Consumer
    } else {
      root.classList.add('dark'); // Dark mode for everyone else (Tech Theme)
    }
  }, [user]);

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
    setLanguage(null);
    localStorage.removeItem('app_language');
    document.documentElement.classList.add('dark'); // Reset to default dark
  };

  const handleAnalysisComplete = (result: PlantDiagnosis, image: string) => {
    setDiagnosis(result);
    setCurrentImage(image);
    setIsAnalyzing(false);
    setView('result');
  };

  const handleWhatsAppShare = () => {
    if (!diagnosis) return;
    const message = `*AgriScanAi Pro Diagnosis*\nPlant: ${diagnosis.plantName}\nIssue: ${diagnosis.diseaseName || 'Healthy'}\nAdvice: ${diagnosis.expertAdvice}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- LAYOUT & BACKGROUND ---
  // Using the "Tech Grid" pattern via CSS class `bg-tech-pattern`
  
  if (view === 'login') {
    return (
      <div className="min-h-screen flex flex-col bg-tech-pattern text-tech-primary relative overflow-hidden">
         {/* Subtle decorative glow for tech feel */}
         <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-tech-cyan/5 to-transparent pointer-events-none"></div>
         <div className="relative z-10 w-full h-full flex flex-col">
            <Login onLogin={handleLogin} t={t} />
         </div>
      </div>
    );
  }

  if (!language) {
    return <LanguageSelector onSelect={(code) => handleSetLanguage(code)} userName={user?.name} />;
  }

  const renderRoleBasedInterface = () => {
    if (user?.role === 'consumer') return <ConsumerDashboard t={t} userLocation={userLocation} />;
    if (user?.role === 'fpo') return <FPODashboard t={t} userLocation={userLocation} userName={user.name} />;
    if (user?.role && ['govt', 'bank', 'company', 'insurance', 'service_provider', 'admin'].includes(user.role)) {
      return <StakeholderDashboard role={user.role} t={t} userLocation={userLocation} />;
    }
    
    // Farmer Interface
    return (
      <>
        {view === 'home' && (
           <>
             <Hero 
              onNavigate={setView} 
              t={t} 
              userLocation={userLocation} 
              userName={user?.name} 
              onOpenWhatsApp={() => setShowWhatsApp(true)}
             />
             {showTour && <OnboardingTour t={t} onComplete={handleTourComplete} />}
           </>
        )}
        {/* ... (Tool Views) ... */}
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
                  <div className="tech-card rounded-lg overflow-hidden p-1">
                    <div className="aspect-square rounded overflow-hidden relative bg-tech-bg">
                      <img src={currentImage} alt="Analyzed Plant" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                       <div className="flex justify-between items-center">
                          <span className="text-tech-secondary text-sm uppercase tracking-widest">{t.plant_id}</span>
                          <span className="text-tech-cyan font-display font-bold text-lg">{diagnosis.plantName}</span>
                       </div>
                    </div>
                  </div>
                  
                  <button onClick={() => setView('scan')} className="w-full py-4 btn-secondary flex items-center justify-center gap-2 rounded-lg">
                    <Leaf className="w-5 h-5" /> {t.scan_another}
                  </button>
                  <button className="w-full py-4 btn-primary rounded-lg flex items-center justify-center gap-2" onClick={handleWhatsAppShare}>
                     <Share2 className="w-5 h-5" /> {t.share_whatsapp}
                  </button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <AnalysisResult diagnosis={diagnosis} t={t} languageCode={language} userLocation={userLocation} />
                  <div className="tech-card rounded-lg overflow-hidden flex flex-col h-[500px]">
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
    <div className="bg-tech-pattern min-h-screen flex flex-col text-tech-primary font-sans selection:bg-tech-cyan selection:text-tech-bg">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          user={user}
          onNavigate={setView}
          onLogout={handleLogout}
          currentView={view}
          language={language as LanguageCode || 'en'}
          setLanguage={(code) => handleSetLanguage(code)}
        />
        
        {isTranslating && (
          <div className="fixed inset-0 z-50 bg-tech-bg/80 backdrop-blur-sm flex items-center justify-center">
            <div className="tech-card p-6 rounded-lg flex items-center gap-4">
               <Loader2 size={32} className="text-tech-cyan animate-spin" />
               <div>
                  <h3 className="font-bold text-tech-primary font-display">TRANSLATING SYSTEM...</h3>
               </div>
            </div>
          </div>
        )}

        <main className="flex-grow flex flex-col relative pt-4 md:pt-6">
          {renderRoleBasedInterface()}
        </main>

        {/* WhatsApp FAB - Show only if not triggered via hero button to avoid dupes, or keep for global access */}
        {user?.role === 'farmer' && (
          <>
             <button 
               onClick={() => setShowWhatsApp(true)}
               className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 bg-[#25D366] hover:brightness-110 text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
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
          <div className="fixed inset-0 z-50 bg-tech-bg/90 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="tech-card p-10 rounded-2xl text-center max-w-sm w-full border-tech-cyan/50">
              <div className="relative w-20 h-20 mx-auto mb-6">
                 <div className="absolute inset-0 border-2 border-tech-cyan rounded-full animate-ping opacity-20"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-tech-cyan">
                    <Leaf size={40} />
                 </div>
              </div>
              <h3 className="text-2xl font-display font-bold text-tech-primary mb-2 tracking-wide">{t.analyzing?.toUpperCase()}</h3>
              <p className="text-tech-secondary text-sm font-mono">{t.analyzing_desc}</p>
              <div className="mt-6 h-1 w-full bg-tech-bg rounded-full overflow-hidden">
                 <div className="h-full bg-tech-cyan w-1/2 animate-[shimmer_1s_infinite]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
