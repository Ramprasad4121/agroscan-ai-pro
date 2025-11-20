
import React, { useState } from 'react';
import { Sprout, ArrowRight, Lock, Phone, User as UserIcon, Briefcase, Building2, ShoppingBag, Landmark, ShieldCheck, Truck, Settings, ArrowLeft, MapPin, Mail, Check, Mic, Server, Shield } from 'lucide-react';
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

  // Fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [landSize, setLandSize] = useState('');
  const [mainCrop, setMainCrop] = useState('');
  
  const [consent, setConsent] = useState({ terms: false, data: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    try {
      let user: User;
      if (mode === 'login') {
        user = await authService.login(identifier, role, password);
      } else {
        user = await authService.signup({
          name: fullName, role, email: identifier.includes('@')?identifier:undefined, phone: !identifier.includes('@')?identifier:undefined, location, landSize, mainCrops: [mainCrop], permissions: {location: true, camera: true, dataSharing: true, notifications: true}
        });
      }
      onLogin(user);
    } catch (error) {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'farmer', label: 'FARMER', icon: <Sprout size={20} /> },
    { id: 'fpo', label: 'FPO / GROUP', icon: <Briefcase size={20} /> },
    { id: 'consumer', label: 'CONSUMER', icon: <ShoppingBag size={20} /> },
    { id: 'govt', label: 'GOVERNMENT', icon: <Landmark size={20} /> },
    { id: 'bank', label: 'BANKING', icon: <Building2 size={20} /> },
    { id: 'company', label: 'ENTERPRISE', icon: <Truck size={20} /> },
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
       <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Brand Info */}
          <div className="hidden lg:block space-y-8 animate-fade-in">
             <div className="inline-flex p-4 bg-tech-card border border-tech-cyan/30 rounded-2xl shadow-[0_0_30px_rgba(77,208,225,0.1)]">
                <Sprout size={48} className="text-tech-cyan" />
             </div>
             <div>
                <h1 className="text-6xl font-display font-bold text-tech-primary mb-4 tracking-tight">
                   AGROSCAN <span className="text-tech-cyan">AI</span>
                </h1>
                <p className="text-xl text-tech-secondary max-w-md leading-relaxed font-light">
                   Advanced Agricultural Intelligence Platform. 
                   Connecting fields to the future.
                </p>
             </div>
             <div className="grid grid-cols-2 gap-4 pt-8">
                <div className="bg-tech-card p-4 rounded-lg border border-tech-border">
                   <Server className="text-tech-amber mb-2" />
                   <h4 className="font-bold text-tech-primary text-sm uppercase">Real-time Data</h4>
                   <p className="text-xs text-tech-secondary mt-1">Live mandi rates & satellite feeds</p>
                </div>
                <div className="bg-tech-card p-4 rounded-lg border border-tech-border">
                   <Shield className="text-tech-cyan mb-2" />
                   <h4 className="font-bold text-tech-primary text-sm uppercase">Secure Identity</h4>
                   <p className="text-xs text-tech-secondary mt-1">Blockchain-ready consent ledger</p>
                </div>
             </div>
          </div>

          {/* Right: Login Form */}
          <div className="bg-tech-card border border-tech-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
             {/* Top decorative line */}
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tech-cyan to-transparent"></div>
             
             {!role ? (
               <div className="animate-slide-up">
                  <h2 className="text-2xl font-display font-bold text-tech-primary mb-2">Select Portal</h2>
                  <p className="text-sm text-tech-secondary mb-6">Choose your role to access the dashboard.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                     {roles.map(r => (
                        <button 
                          key={r.id} 
                          onClick={() => setRole(r.id as UserRole)}
                          className="flex flex-col items-center justify-center p-6 rounded-xl bg-tech-bg border border-tech-border hover:border-tech-cyan hover:bg-tech-bg/80 transition-all group"
                        >
                           <div className="mb-3 text-tech-secondary group-hover:text-tech-cyan transition-colors">{r.icon}</div>
                           <span className="text-xs font-bold text-tech-primary tracking-widest">{r.label}</span>
                        </button>
                     ))}
                  </div>
               </div>
             ) : (
               <div className="animate-slide-up">
                  <button onClick={() => setRole(null)} className="flex items-center gap-2 text-tech-secondary hover:text-tech-primary mb-6 text-sm font-bold uppercase tracking-wider">
                     <ArrowLeft size={16} /> Back
                  </button>
                  
                  <h2 className="text-2xl font-display font-bold text-tech-primary mb-1">
                     {mode === 'login' ? 'Secure Access' : 'Register Node'}
                  </h2>
                  <p className="text-sm text-tech-secondary mb-6 uppercase tracking-widest text-tech-cyan font-bold">
                     {roles.find(r => r.id === role)?.label} Portal
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                     {mode === 'signup' && (
                        <div className="grid grid-cols-1 gap-4 animate-fade-in">
                           <div className="bg-tech-bg p-3 rounded-lg border border-tech-border focus-within:border-tech-cyan transition-colors">
                              <label className="block text-[10px] font-bold text-tech-secondary uppercase mb-1">Full Name</label>
                              <div className="flex items-center gap-2 text-tech-primary">
                                 <UserIcon size={16} />
                                 <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="bg-transparent outline-none w-full text-sm font-bold" placeholder="e.g. Ram Kishan" />
                              </div>
                           </div>
                           {role === 'farmer' && (
                             <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Land (Acres)" className="bg-tech-bg p-3 rounded-lg border border-tech-border text-white text-sm" onChange={e => setLandSize(e.target.value)} />
                                <input type="text" placeholder="Main Crop" className="bg-tech-bg p-3 rounded-lg border border-tech-border text-white text-sm" onChange={e => setMainCrop(e.target.value)} />
                             </div>
                           )}
                        </div>
                     )}

                     <div className="bg-tech-bg p-3 rounded-lg border border-tech-border focus-within:border-tech-cyan transition-colors">
                        <label className="block text-[10px] font-bold text-tech-secondary uppercase mb-1">User ID / Mobile</label>
                        <div className="flex items-center gap-2 text-tech-primary">
                           <Phone size={16} />
                           <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} className="bg-transparent outline-none w-full text-sm font-bold" placeholder="+91 98765 43210" />
                        </div>
                     </div>

                     <div className="bg-tech-bg p-3 rounded-lg border border-tech-border focus-within:border-tech-cyan transition-colors">
                        <label className="block text-[10px] font-bold text-tech-secondary uppercase mb-1">Password</label>
                        <div className="flex items-center gap-2 text-tech-primary">
                           <Lock size={16} />
                           <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="bg-transparent outline-none w-full text-sm font-bold" placeholder="••••••" />
                        </div>
                     </div>

                     <div className="flex gap-4 mt-4">
                        <button type="submit" disabled={loading} className="flex-1 btn-primary py-3.5 rounded-lg flex items-center justify-center gap-2">
                           {loading ? <div className="w-4 h-4 border-2 border-tech-bg border-t-transparent rounded-full animate-spin" /> : (mode === 'login' ? 'AUTHENTICATE' : 'INITIALIZE')}
                           {!loading && <ArrowRight size={18} />}
                        </button>
                     </div>

                     <div className="text-center pt-4">
                        <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-xs font-bold text-tech-secondary hover:text-tech-cyan uppercase tracking-wide">
                           {mode === 'login' ? 'Create New Account' : 'Existing User Login'}
                        </button>
                     </div>
                  </form>
               </div>
             )}
          </div>
       </div>
    </div>
  );
};
