
import React, { useState } from 'react';
import { Sprout, ArrowRight, Lock, Phone, User as UserIcon, Briefcase, Building2, ShoppingBag, Landmark, ShieldCheck, Truck, Settings, ArrowLeft, MapPin, Mail, Check, Mic, Shield, Server } from 'lucide-react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
  t: any;
}

export const Login: React.FC<LoginProps> = ({ onLogin, t }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [identifier, setIdentifier] = useState(''); // Mobile or Email
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState(''); // District/City
  
  // Role Specific Fields
  const [landSize, setLandSize] = useState('');
  const [mainCrop, setMainCrop] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgId, setOrgId] = useState('');

  // Consent
  const [consent, setConsent] = useState({
    terms: false,
    data: false,
    location: false
  });

  const roles = [
    { id: 'farmer', label: t.role_farmer, icon: <Sprout size={24} />, desc: t.role_farmer_desc, color: 'bg-green-50 border-green-200 text-green-700' },
    { id: 'fpo', label: t.role_fpo || "FPO Group", icon: <UsersIcon />, desc: t.role_fpo_desc || "Manage Members", color: 'bg-teal-50 border-teal-200 text-teal-700' },
    { id: 'consumer', label: t.role_consumer, icon: <ShoppingBag size={24} />, desc: t.role_consumer_desc, color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { id: 'govt', label: t.role_govt, icon: <Landmark size={24} />, desc: t.role_govt_desc, color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { id: 'bank', label: t.role_bank, icon: <Briefcase size={24} />, desc: t.role_bank_desc, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'company', label: t.role_company, icon: <Building2 size={24} />, desc: t.role_company_desc, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'insurance', label: t.role_insurance, icon: <ShieldCheck size={24} />, desc: t.role_insurance_desc, color: 'bg-rose-50 border-rose-200 text-red-700' },
    { id: 'service_provider', label: t.role_service, icon: <Truck size={24} />, desc: t.role_service_desc, color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
    { id: 'admin', label: t.role_admin, icon: <Settings size={24} />, desc: t.role_admin_desc, color: 'bg-slate-50 border-slate-200 text-slate-700' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);

    try {
      let user: User;
      
      if (mode === 'login') {
        user = await authService.login(identifier, role, password);
      } else {
        const newUser: Partial<User> = {
          name: fullName,
          role: role,
          email: role !== 'farmer' && role !== 'consumer' ? identifier : undefined,
          phone: role === 'farmer' || role === 'consumer' ? identifier : undefined,
          location: location,
          landSize: landSize,
          mainCrops: mainCrop ? [mainCrop] : [],
          orgName: orgName,
          orgId: orgId,
          permissions: {
             location: consent.location,
             camera: true,
             dataSharing: consent.data,
             notifications: true
          }
        };
        user = await authService.signup(newUser);
      }
      
      onLogin(user);
    } catch (error) {
      console.error("Auth failed", error);
      setLoading(false);
    }
  };

  const handleVoiceFill = () => {
    if (role !== 'farmer') return;
    setFullName("Ram Kishan");
    setLocation("Nashik");
    setIdentifier("9876543210");
    setLandSize("2.5");
    setMainCrop("Onion");
    setPassword("1234");
    setConsent({ terms: true, data: true, location: true });
  };

  const getIdentifierLabel = () => {
    if (role === 'farmer' || role === 'consumer') return t.mobile_number;
    return t.email_id;
  };

  const getIdentifierIcon = () => {
    if (role === 'farmer' || role === 'consumer') return <Phone size={20} className="text-slate-400" />;
    return <Mail size={20} className="text-slate-400" />;
  };

  const getPlaceholder = () => {
    if (role === 'farmer' || role === 'consumer') return '+91 98765 43210';
    return 'name@organization.com';
  };

  const isFormValid = () => {
    if (mode === 'login') return identifier && password;
    const basic = identifier && password && fullName && location;
    const terms = consent.terms && consent.data;
    if (role === 'farmer') return basic && terms && landSize && mainCrop;
    if (role === 'bank' || role === 'govt' || role === 'company' || role === 'fpo') return basic && terms && orgName && orgId;
    return basic && terms;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-4">
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
        
        {/* Brand Section (Left) */}
        <div className="lg:col-span-5 text-center lg:text-left space-y-8 animate-fade-in bg-black/20 p-8 rounded-3xl backdrop-blur-sm border border-white/10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-[#388E3C] text-white shadow-2xl shadow-green-900/50 mb-2">
            <Sprout size={48} />
          </div>
          <div>
             <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight drop-shadow-lg">
               {t.app_name.split(' ')[0]}<span className="text-green-300">Ai</span> Pro
             </h1>
             <p className="text-xl text-white/90 font-medium leading-relaxed drop-shadow-md">
               {t.app_tagline}
             </p>
             <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3 text-sm font-semibold text-white/80">
                <span className="px-3 py-1 bg-white/10 rounded-full border border-white/20 flex items-center gap-2 backdrop-blur-md">
                  <Server size={14} /> API Gateway
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full border border-white/20 flex items-center gap-2 backdrop-blur-md">
                  <Shield size={14} /> Secure Consent Ledger
                </span>
             </div>
          </div>
        </div>

        {/* Login Interface (Right) - Glassmorphism */}
        <div className="lg:col-span-7">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700 overflow-hidden transition-colors min-h-[600px] flex flex-col relative">
            
            {!role ? (
              <div className="p-8 md:p-10 flex-grow flex flex-col animate-slide-up">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">{t.role_select_title}</h2>
                 <p className="text-slate-500 text-center mb-8 text-sm">{t.role_select_desc}</p>
                 
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow content-center">
                    {roles.map((r, idx) => (
                       <button
                         key={r.id}
                         onClick={() => setRole(r.id as UserRole)}
                         className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 group hover:scale-[1.03] hover:shadow-lg ${r.color} bg-opacity-10 dark:bg-opacity-5 border-opacity-50 h-full min-h-[140px]`}
                         style={{ animationDelay: `${idx * 50}ms` }}
                       >
                          <div className={`mb-3 p-3.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm ${r.color.split(' ')[2]} group-hover:scale-110 transition-transform`}>
                             {r.icon}
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{r.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 text-center leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{r.desc}</span>
                       </button>
                    ))}
                 </div>
              </div>
            ) : (
              <div className="flex flex-col h-full animate-slide-up">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
                    <button onClick={() => setRole(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                       <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl ${roles.find(r => r.id === role)?.color.split(' ')[2]} bg-opacity-10`}>
                          {roles.find(r => r.id === role)?.icon}
                       </div>
                       <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{roles.find(r => r.id === role)?.label} {t.login_portal}</h3>
                          <p className="text-xs text-slate-500">{t.secure_access} • {mode === 'login' ? t.login_btn : t.new_account}</p>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 md:p-12 flex-grow flex flex-col justify-center max-w-lg mx-auto w-full overflow-y-auto relative">
                    {role === 'farmer' && mode === 'signup' && (
                      <button 
                         onClick={handleVoiceFill}
                         className="absolute top-4 right-4 md:top-8 md:right-0 bg-rose-600 text-white px-4 py-2 rounded-full shadow-lg shadow-rose-200 flex items-center gap-2 text-sm font-bold animate-pulse hover:scale-105 transition-transform z-30"
                      >
                        <Mic size={16} /> {t.tap_to_speak}
                      </button>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                       <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mb-6">
                          <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-500'}`}>{t.login_btn}</button>
                          <button type="button" onClick={() => setMode('signup')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-white dark:bg-slate-700 shadow-md text-slate-900 dark:text-white' : 'text-slate-500'}`}>{t.new_account}</button>
                       </div>

                       {mode === 'signup' && (
                         <div className="animate-fade-in-up space-y-5 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                            <div className="grid grid-cols-1 gap-4">
                               <div>
                                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">{t.full_name}</label>
                                   <div className="relative group">
                                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input 
                                         type="text" 
                                         value={fullName}
                                         onChange={(e) => setFullName(e.target.value)}
                                         className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#388E3C]/20 focus:border-[#388E3C] transition-all text-sm"
                                         placeholder={t.full_name}
                                      />
                                   </div>
                               </div>
                               <div>
                                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                    {role === 'farmer' ? t.location_district : t.location_city}
                                  </label>
                                  <div className="relative group">
                                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                     <input 
                                        type="text" 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#388E3C]/20 focus:border-[#388E3C] transition-all text-sm"
                                        placeholder={role === 'farmer' ? "e.g. Nashik" : "e.g. Mumbai"}
                                     />
                                  </div>
                               </div>
                            </div>

                            {role === 'farmer' && (
                               <div className="grid grid-cols-2 gap-4 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                                  <div>
                                     <label className="block text-xs font-bold text-green-800 dark:text-green-200 mb-1 ml-1">{t.land_size}</label>
                                     <input 
                                        type="number" 
                                        value={landSize}
                                        onChange={(e) => setLandSize(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800 rounded-lg text-sm"
                                        placeholder="2.5"
                                     />
                                  </div>
                                  <div>
                                     <label className="block text-xs font-bold text-green-800 dark:text-green-200 mb-1 ml-1">{t.main_crop}</label>
                                     <input 
                                        type="text" 
                                        value={mainCrop}
                                        onChange={(e) => setMainCrop(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-800 rounded-lg text-sm"
                                        placeholder="Wheat"
                                     />
                                  </div>
                               </div>
                            )}

                            {(role === 'bank' || role === 'govt' || role === 'company' || role === 'insurance' || role === 'fpo') && (
                               <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3">
                                  <div>
                                     <label className="block text-xs font-bold text-blue-800 dark:text-blue-200 mb-1 ml-1">{t.org_name}</label>
                                     <input 
                                        type="text" 
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
                                        placeholder={role === 'fpo' ? "e.g. Jai Kisan FPO" : "e.g. HDFC Bank"}
                                     />
                                  </div>
                                  <div>
                                     <label className="block text-xs font-bold text-blue-800 dark:text-blue-200 mb-1 ml-1">{t.license_id}</label>
                                     <input 
                                        type="text" 
                                        value={orgId}
                                        onChange={(e) => setOrgId(e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg text-sm"
                                        placeholder="e.g. EMP-0098"
                                     />
                                  </div>
                               </div>
                            )}
                         </div>
                       )}

                       <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">
                             {getIdentifierLabel()}
                          </label>
                          <div className="relative group">
                             <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                {getIdentifierIcon()}
                             </div>
                             <input 
                                type={role === 'farmer' || role === 'consumer' ? 'tel' : 'email'} 
                                required
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#388E3C]/20 focus:border-[#388E3C] transition-all font-medium placeholder:text-slate-400"
                                placeholder={getPlaceholder()}
                             />
                          </div>
                       </div>

                       <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 ml-1">{t.password_label}</label>
                          <div className="relative group">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#388E3C] transition-colors" size={20} />
                             <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#388E3C]/20 focus:border-[#388E3C] transition-all font-medium placeholder:text-slate-400"
                                placeholder="••••••"
                             />
                          </div>
                       </div>

                       {mode === 'signup' && (
                         <div className="space-y-3 pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                               <div className={`w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors ${consent.terms ? 'bg-[#388E3C] border-[#388E3C]' : 'bg-white dark:bg-slate-800'}`}>
                                  {consent.terms && <Check size={12} className="text-white" />}
                               </div>
                               <input type="checkbox" className="hidden" checked={consent.terms} onChange={e => setConsent({...consent, terms: e.target.checked})} />
                               <span className="text-xs text-slate-500 leading-tight select-none">{t.consent_terms}</span>
                            </label>

                            {role === 'farmer' && (
                              <label className="flex items-start gap-3 cursor-pointer group">
                                 <div className={`w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors ${consent.data ? 'bg-[#388E3C] border-[#388E3C]' : 'bg-white dark:bg-slate-800'}`}>
                                    {consent.data && <Check size={12} className="text-white" />}
                                 </div>
                                 <input type="checkbox" className="hidden" checked={consent.data} onChange={e => setConsent({...consent, data: e.target.checked})} />
                                 <span className="text-xs text-slate-500 leading-tight select-none">
                                    {t.consent_data}
                                 </span>
                              </label>
                            )}
                            
                            {(role === 'consumer' || role === 'service_provider') && (
                              <label className="flex items-start gap-3 cursor-pointer group">
                                 <div className={`w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors ${consent.location ? 'bg-[#388E3C] border-[#388E3C]' : 'bg-white dark:bg-slate-800'}`}>
                                    {consent.location && <Check size={12} className="text-white" />}
                                 </div>
                                 <input type="checkbox" className="hidden" checked={consent.location} onChange={e => setConsent({...consent, location: e.target.checked})} />
                                 <span className="text-xs text-slate-500 leading-tight select-none">{t.consent_location}</span>
                              </label>
                            )}

                            {(role === 'bank' || role === 'govt' || role === 'fpo') && (
                               <label className="flex items-start gap-3 cursor-pointer group">
                                  <div className={`w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-colors ${consent.data ? 'bg-[#388E3C] border-[#388E3C]' : 'bg-white dark:bg-slate-800'}`}>
                                     {consent.data && <Check size={12} className="text-white" />}
                                  </div>
                                  <input type="checkbox" className="hidden" checked={consent.data} onChange={e => setConsent({...consent, data: e.target.checked})} />
                                  <span className="text-xs text-slate-500 leading-tight select-none">{t.consent_auth}</span>
                               </label>
                            )}
                         </div>
                       )}

                       <button 
                          type="submit"
                          disabled={loading || !isFormValid()}
                          className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed ${
                             role === 'farmer' ? 'bg-[#388E3C] hover:bg-green-700 shadow-green-200/50' : 
                             role === 'consumer' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200/50' : 
                             role === 'fpo' ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-200/50' :
                             'bg-slate-900 hover:bg-slate-800'
                          }`}
                       >
                          {loading ? (
                             <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                             <>{mode === 'login' ? t.secure_login : t.complete_reg} <ArrowRight size={20} /></>
                          )}
                       </button>
                    </form>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersIcon = () => (
   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
