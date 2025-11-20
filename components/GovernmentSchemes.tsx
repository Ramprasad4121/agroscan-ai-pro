
import React, { useState, useEffect } from 'react';
import { Search, BookOpen, ExternalLink, ChevronRight, Landmark, Shield, Coins, Sprout, Wallet, PieChart, TrendingUp, PiggyBank, Lightbulb, FileText, CheckCircle2, Briefcase, AlertCircle, HelpCircle, UploadCloud, Fingerprint, Clock, Send, ArrowRight, Bell, Loader2 } from 'lucide-react';
import { searchAgriculturalData, generateFinancialTip, generateSchemeGuide } from '../services/gemini';
import { GroundingResult, SchemeGuide } from '../types';
import { VoiceInput, TextToSpeech } from './VoiceControls';

interface GovernmentSchemesProps {
  t: any;
  languageCode: string;
}

export const GovernmentSchemes: React.FC<GovernmentSchemesProps> = ({ t, languageCode }) => {
  const [activeTab, setActiveTab] = useState<'schemes' | 'finance' | 'assistance'>('schemes');
  
  // Schemes State
  const [query, setQuery] = useState('');
  const [activeScheme, setActiveScheme] = useState<GroundingResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Finance State
  const [activeFinanceTip, setActiveFinanceTip] = useState<string | null>(null);
  const [financeTopic, setFinanceTopic] = useState<string | null>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

  // Smart Application State
  const [appMode, setAppMode] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [step, setStep] = useState(1); // 1: Docs, 2: Form, 3: Success
  const [docsStatus, setDocsStatus] = useState({
    aadhaar: 'pending',
    land: 'pending',
    bank: 'pending',
    pan: 'pending'
  });
  const [isDigiLockerConnected, setIsDigiLockerConnected] = useState(false);
  const [isFetchingDocs, setIsFetchingDocs] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    dob: '',
    landSurvey: '',
    bankAcc: '',
    ifsc: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // Grouped Categories for Schemes
  const schemeCategories = [
    {
      title: t.cat_loans || "Low Interest Loans",
      icon: <Coins size={18} className="text-amber-500" />,
      items: [
        { id: 'kcc', name: 'Kisan Credit Card (KCC)', query: 'Kisan Credit Card low interest rate 4% eligibility application details' },
        { id: 'iss', name: 'Interest Subvention Scheme', query: 'Interest Subvention Scheme for Short Term Crop Loans India benefits' },
        { id: 'zero', name: '0% Interest State Loans', query: 'State government zero interest crop loan schemes India list cooperative banks' },
        { id: 'pmegp', name: 'Agri-Business Loan (PMEGP)', query: 'Prime Minister Employment Generation Programme loan subsidy for agriculture business' }
      ]
    },
    {
      title: t.cat_insurance || "Insurance (Crop & Family)",
      icon: <Shield size={18} className="text-blue-500" />,
      items: [
        { id: 'pmfby', name: 'Crop Insurance (PMFBY)', query: 'Pradhan Mantri Fasal Bima Yojana claim process premium list' },
        { id: 'pmjjby', name: 'Life Insurance (PMJJBY)', query: 'Pradhan Mantri Jeevan Jyoti Bima Yojana for farmers eligibility benefits application' },
        { id: 'pmsby', name: 'Accident Insurance (PMSBY)', query: 'Pradhan Mantri Suraksha Bima Yojana for farmers benefits claim process' },
        { id: 'aaby', name: 'Aam Aadmi Bima Yojana', query: 'Aam Aadmi Bima Yojana for landless rural households details' }
      ]
    },
    {
      title: t.cat_subsidies || "Subsidies & Grants",
      icon: <Sprout size={18} className="text-emerald-500" />,
      items: [
        { id: 'pmkisan', name: 'PM-KISAN (Income Support)', query: 'PM-KISAN Samman Nidhi eligibility status check application' },
        { id: 'kusum', name: 'Solar Pump (PM-KUSUM)', query: 'PM-KUSUM scheme solar pump subsidy eligibility application' },
        { id: 'midh', name: 'Horticulture Subsidy (MIDH)', query: 'Mission for Integrated Development of Horticulture scheme details polyhouse' },
        { id: 'soil', name: 'Soil Health Card', query: 'Soil Health Card Scheme benefits government labs near me' }
      ]
    }
  ];

  // Filter schemes based on search query (Real-time filtering)
  const filteredCategories = query.trim() === '' 
    ? schemeCategories 
    : schemeCategories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) || 
          item.query.toLowerCase().includes(query.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0);

  // Financial Topics
  const financeTopics = [
    { id: 'budget', title: t.fin_budget || "Farm Budgeting", icon: <PieChart size={24} className="text-purple-500" />, query: "How to make a budget for small farm, track input costs seeds fertilizer labor vs profit" },
    { id: 'save', title: t.fin_save || "Smart Savings", icon: <PiggyBank size={24} className="text-pink-500" />, query: "Importance of emergency savings for farmers for drought or crop failure, how to start saving small amounts" },
    { id: 'invest', title: t.fin_invest || "Investment Basics", icon: <TrendingUp size={24} className="text-green-500" />, query: "Safe low risk investment options for farmers in India like Post Office schemes, Gold, Fixed Deposits, buying livestock" },
    { id: 'debt', title: t.fin_debt || "Debt Management", icon: <Wallet size={24} className="text-red-500" />, query: "How to manage farm loans, avoid money lenders high interest, repaying Kisan Credit Card on time to get subsidy" }
  ];

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setActiveScheme(null);
    try {
      const langPrompt = languageCode === 'hi' ? 'Hindi' : 'English';
      const fullQuery = `Explain this scheme/topic in detail: ${searchQuery}. Include Eligibility, Interest Rates/Premiums, Benefits, and How to Apply. Respond in ${langPrompt}.`;
      const result = await searchAgriculturalData(fullQuery);
      setActiveScheme(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFinanceGuide = async (topicName: string, topicQuery: string) => {
    setLoadingFinance(true);
    setActiveFinanceTip(null);
    setFinanceTopic(topicName);
    try {
      const langPrompt = languageCode === 'hi' ? 'Hindi' : 'English';
      const result = await generateFinancialTip(topicQuery, langPrompt);
      setActiveFinanceTip(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFinance(false);
    }
  };

  // --- SMART APPLY LOGIC ---
  const startSmartApply = (scheme: string) => {
    setSelectedScheme(scheme);
    setAppMode(true);
    setStep(1);
    setIsDigiLockerConnected(false);
    setDocsStatus({ aadhaar: 'pending', land: 'pending', bank: 'pending', pan: 'pending' });
  };

  const connectDigiLocker = () => {
    setIsFetchingDocs(true);
    // Simulation
    setTimeout(() => {
      setIsDigiLockerConnected(true);
      setDocsStatus({ aadhaar: 'verified', land: 'verified', bank: 'verified', pan: 'missing' });
      setIsFetchingDocs(false);
      
      // Pre-fill form mock
      setFormData({
        name: "Ram Kishan",
        address: "Village Dindori, Nashik",
        dob: "15/06/1982",
        landSurvey: "124/A",
        bankAcc: "XXXX-XXXX-8976",
        ifsc: "SBIN0001234"
      });
    }, 2500);
  };

  const submitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(3);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
          <Landmark size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.schemes_title || "Finance & Schemes"}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.schemes_desc || "Loans, Insurance, Subsidies & Money Tips."}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm inline-flex flex-wrap justify-center gap-1">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'schemes'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} />
            {t.tab_schemes || "Schemes"}
          </button>
          <button
             onClick={() => setActiveTab('assistance')}
             className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
               activeTab === 'assistance'
                 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm'
                 : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
             }`}
           >
             <Briefcase size={16} />
             {t.smart_apply || "Smart Apply"}
           </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-4 py-2 md:px-6 md:py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'finance'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lightbulb size={16} />
            {t.tab_finance || "Wisdom"}
          </button>
        </div>
      </div>

      {activeTab === 'schemes' && (
        /* --- GOVERNMENT SCHEMES VIEW --- */
        <>
          <div className="flex gap-2 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.schemes_search_ph || "Type keyword to filter (e.g. Solar, Loan)..."}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                 <VoiceInput onInput={(text) => { setQuery(text); handleSearch(text); }} languageCode={languageCode} compact />
              </div>
            </div>
            <button 
              onClick={() => handleSearch(query)}
              disabled={!query.trim() || loading}
              className="bg-emerald-600 text-white px-6 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {t.go || "Ask AI"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar: Categorized Schemes (Filtered) */}
            <div className="lg:col-span-1 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, idx) => (
                  <div key={idx} className="space-y-3 animate-fade-in">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm uppercase tracking-wider sticky top-0 bg-slate-50 dark:bg-slate-950 py-2 z-10">
                      {category.icon}
                      {category.title}
                    </h3>
                    <div className="space-y-2">
                      {category.items.map((scheme) => (
                        <button
                          key={scheme.id}
                          onClick={() => handleSearch(scheme.query)}
                          className="w-full text-left p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{scheme.name}</span>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No listed schemes match "{query}"</p>
                  <button 
                    onClick={() => handleSearch(query)}
                    className="mt-2 text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Ask AI to find "{query}" on the web
                  </button>
                </div>
              )}
            </div>

            {/* Main Content: Details */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 min-h-[500px] h-full flex flex-col">
                {loading ? (
                  <div className="flex flex-col items-center justify-center flex-grow text-slate-400 gap-4">
                    <div className="relative w-16 h-16">
                       <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="font-medium">{t.searching || "Searching reliable sources..."}</p>
                  </div>
                ) : activeScheme ? (
                  <div className="animate-slide-up flex-grow">
                    <div className="flex justify-end mb-2">
                       <TextToSpeech text={activeScheme.text} languageCode={languageCode} label="Read Aloud" />
                    </div>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">{activeScheme.text}</div>
                    </div>
                    
                    {activeScheme.chunks && activeScheme.chunks.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                           <ExternalLink size={12} /> {t.search_sources || "Verified Sources"}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {activeScheme.chunks.map((chunk, i) => (
                            chunk.web?.uri ? (
                              <a 
                                key={i} 
                                href={chunk.web.uri} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors max-w-[200px] truncate"
                                title={chunk.web.title}
                              >
                                <span className="truncate">{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
                              </a>
                            ) : null
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-grow text-slate-400 text-center p-8">
                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4 text-emerald-200">
                      <Landmark size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">{t.schemes_desc || "Financial Support Hub"}</h3>
                    <p className="max-w-sm text-sm leading-relaxed">
                       Select a category from the left to view details about <strong className="text-emerald-600">Loans, Insurance, or Subsidies</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Assistance & Finance Tabs content stays same, omitted for brevity but preserving structure */}
      {activeTab === 'assistance' && (
        /* --- ASSISTANCE VIEW (Smart Apply) --- */
        <div className="space-y-8">
           {!appMode ? (
             // Mode 1: Select a Service
             <div className="animate-slide-up">
               <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Smart Application Wizard</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    Don't know the process? No problem. Select a scheme below and we will auto-fetch your documents via <strong>DigiLocker</strong>, fill the forms, and submit them.
                  </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* KCC Card */}
                  <div onClick={() => startSmartApply('Kisan Credit Card (KCC)')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-lg hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Recommended</div>
                     <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        <Coins size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">KCC Loan</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Get low-interest credit for seeds and fertilizers. 4% interest rate.</p>
                     <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                        Apply Now <ArrowRight size={14} />
                     </div>
                  </div>
                  {/* Other cards... */}
                   <div onClick={() => startSmartApply('PMFBY Crop Insurance')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-transparent hover:border-indigo-500 shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
                     <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                        <Shield size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Crop Insurance</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Protect your harvest against rain, pests, and drought.</p>
                     <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                        Apply Now <ArrowRight size={14} />
                     </div>
                  </div>

                  <div onClick={() => startSmartApply('Soil Health Card')} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-transparent hover:border-emerald-500 shadow-lg hover:shadow-2xl transition-all cursor-pointer group">
                     <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={32} />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Soil Health Card</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Get government certified soil testing report for free.</p>
                     <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        Apply Now <ArrowRight size={14} />
                     </div>
                  </div>
               </div>
             </div>
           ) : (
             // Mode 2: Smart Application Wizard
             <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl animate-slide-up">
                {/* Wizard Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                   <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Applying for: <span className="text-blue-600">{selectedScheme}</span>
                      </h3>
                      <p className="text-xs text-slate-500">Smart Application • Est. Time: 2 mins</p>
                   </div>
                   <button onClick={() => setAppMode(false)} className="text-slate-400 hover:text-slate-600">
                      <AlertCircle size={20} />
                   </button>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between px-10 py-6 relative">
                   <div className="absolute left-10 right-10 top-1/2 h-1 bg-slate-200 dark:bg-slate-700 -z-0"></div>
                   {[1, 2, 3].map(s => (
                      <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700'}`}>
                         {step > s ? <CheckCircle2 size={20} /> : s}
                      </div>
                   ))}
                </div>
                <div className="flex justify-between px-6 mb-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                   <span>Documents</span>
                   <span>Review Form</span>
                   <span>Submit</span>
                </div>

                <div className="p-8">
                   {/* STEP 1: DOCUMENTS */}
                   {step === 1 && (
                      <div className="space-y-8 animate-fade-in">
                         <div className="text-center">
                            <div className="inline-flex p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 mb-4">
                               <Fingerprint size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Document Vault</h2>
                            <p className="text-slate-500 max-w-md mx-auto">
                               Connect your DigiLocker to securely fetch your Aadhaar, Land Records, and Pan Card automatically.
                            </p>
                         </div>

                         {!isDigiLockerConnected ? (
                            <button 
                              onClick={connectDigiLocker}
                              disabled={isFetchingDocs}
                              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                            >
                               {isFetchingDocs ? (
                                  <>
                                    <Loader2 className="animate-spin" /> {t.fetching_docs}
                                  </>
                               ) : (
                                  <>
                                    <UploadCloud /> {t.connect_digilocker}
                                  </>
                               )}
                            </button>
                         ) : (
                            <div className="space-y-3">
                               <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                  <div className="flex items-center gap-3">
                                     <CheckCircle2 className="text-green-600" />
                                     <span className="font-bold text-slate-900 dark:text-white">{t.doc_aadhaar}</span>
                                  </div>
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">Verified</span>
                               </div>
                               <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                  <div className="flex items-center gap-3">
                                     <CheckCircle2 className="text-green-600" />
                                     <span className="font-bold text-slate-900 dark:text-white">{t.doc_land}</span>
                                  </div>
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded font-bold">Verified</span>
                               </div>
                               <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                  <div className="flex items-center gap-3">
                                     <AlertCircle className="text-red-600" />
                                     <span className="font-bold text-slate-900 dark:text-white">{t.doc_pan}</span>
                                  </div>
                                  <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded font-bold">{t.missing_docs}</span>
                               </div>

                               <div className="pt-4">
                                  <button onClick={() => setStep(2)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                     Continue to Form
                                  </button>
                               </div>
                            </div>
                         )}
                      </div>
                   )}

                   {/* STEP 2: FORM */}
                   {step === 2 && (
                      <div className="space-y-6 animate-fade-in">
                         <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center gap-3 border border-blue-100 dark:border-blue-800">
                            <CheckCircle2 className="text-blue-600" />
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">{t.auto_fill_success}</p>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                               <input type="text" value={formData.name} readOnly className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-none font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth</label>
                               <input type="text" value={formData.dob} readOnly className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-none font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed" />
                            </div>
                            <div className="col-span-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                               <input type="text" value={formData.address} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Land Survey No.</label>
                               <input type="text" value={formData.landSurvey} readOnly className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-none font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed" />
                            </div>
                            <div>
                               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Account</label>
                               <input type="text" value={formData.bankAcc} readOnly className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-none font-bold text-slate-700 dark:text-slate-300 cursor-not-allowed" />
                            </div>
                         </div>

                         <button 
                           onClick={submitApplication}
                           disabled={isSubmitting}
                           className="w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2"
                         >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> {t.submit_application}</>}
                         </button>
                      </div>
                   )}

                   {/* STEP 3: SUCCESS */}
                   {step === 3 && (
                      <div className="text-center py-8 animate-slide-up">
                         <div className="inline-flex p-5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 mb-6 animate-bounce">
                            <CheckCircle2 size={48} />
                         </div>
                         <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Success!</h2>
                         <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{t.app_submitted}</p>

                         <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8 max-w-sm mx-auto">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">{t.track_id}</p>
                            <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-widest">KCC-2025-8891</p>
                         </div>

                         <div className="flex justify-center mb-8">
                            <button 
                              onClick={() => setShowReminder(!showReminder)}
                              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${showReminder ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                            >
                               <Bell size={18} className={showReminder ? 'fill-current' : ''} />
                               {showReminder ? 'Reminder Set for Renewal' : 'Set Deadline Reminder'}
                            </button>
                         </div>

                         <button onClick={() => setAppMode(false)} className="text-slate-500 hover:text-slate-800 font-bold">
                            Return to Dashboard
                         </button>
                      </div>
                   )}
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'finance' && (
        /* --- FINANCIAL LITERACY VIEW --- */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Grid */}
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 h-fit">
            {financeTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleFinanceGuide(topic.title, topic.query)}
                className={`p-5 rounded-xl border text-left transition-all hover:shadow-md group ${
                  financeTopic === topic.title 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    {topic.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{topic.title}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                  {t.check_eligibility || "Tap to learn more"}
                </p>
              </button>
            ))}
          </div>

          {/* Guide Display Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 min-h-[500px] flex flex-col relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

              {loadingFinance ? (
                <div className="flex flex-col items-center justify-center flex-grow text-slate-400 gap-4 relative z-10">
                  <div className="w-16 h-16 border-4 border-purple-100 dark:border-purple-900 rounded-full border-t-purple-500 animate-spin"></div>
                  <p className="font-medium animate-pulse">{t.fin_tip_loading || "Creating your guide..."}</p>
                </div>
              ) : activeFinanceTip ? (
                <div className="animate-slide-up relative z-10">
                  <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                       <Lightbulb className="text-purple-500" size={28} />
                       <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                          {financeTopic}
                       </h3>
                    </div>
                    <TextToSpeech text={activeFinanceTip} languageCode={languageCode} label="Listen" />
                  </div>
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                      {activeFinanceTip}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow text-center p-8 relative z-10">
                  <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6 text-purple-300">
                    <TrendingUp size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">{t.tab_finance || "Financial Wisdom"}</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                    Farming is not just about growing crops, it's about <strong>managing money</strong>. 
                    Select a topic to get simple, actionable advice on budgeting, savings, and safe investments.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
