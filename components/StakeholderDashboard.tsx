
import React, { useState } from 'react';
import { Users, TrendingUp, Map, ShieldAlert, BellRing, UserCheck, Building2, Landmark, Truck, Settings, Search, Check, X, FileText, PieChart, AlertTriangle, Briefcase, Coins, Send, Layers, Radar } from 'lucide-react';
import { PestHeatmap } from './PestHeatmap';

interface Props {
  role: string;
  t: any;
  userLocation: { lat: number; lng: number } | null;
}

const loanRequests = [
  { id: 'L-101', farmer: 'Ram Kishan', amount: '₹50,000', type: 'KCC', risk: 'Low', score: 780, crop: 'Wheat' },
  { id: 'L-102', farmer: 'Suresh Patil', amount: '₹2,00,000', type: 'Tractor', risk: 'Medium', score: 650, crop: 'Sugarcane' },
  { id: 'L-103', farmer: 'Anita Devi', amount: '₹25,000', type: 'Seeds', risk: 'Low', score: 810, crop: 'Vegetables' },
];

const insuranceClaims = [
  { id: 'C-5501', farmer: 'Vijay Singh', crop: 'Cotton', loss: '80%', cause: 'Pest Attack (Bollworm)', status: 'Verifying', date: '2 days ago' },
  { id: 'C-5502', farmer: 'Meera Ben', crop: 'Groundnut', loss: '100%', cause: 'Flood / Excess Rain', status: 'Approved', date: '1 week ago' },
];

const regionStats = [
  { label: 'Active Farmers', value: '12,450', trend: '+12%', color: 'text-blue-400' },
  { label: 'Disease Alert', value: 'High', trend: 'Nashik Region', color: 'text-red-400' },
  { label: 'Credit Disbursed', value: '₹4.2 Cr', trend: 'This Quarter', color: 'text-green-400' },
];

export const StakeholderDashboard: React.FC<Props> = ({ role, t, userLocation }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap'>('overview');

  const getHeader = () => {
    switch(role) {
       case 'govt': return { title: 'Government Command Center', subtitle: 'Monitor Regional Agriculture & Schemes', icon: <Landmark size={24} /> };
       case 'bank': return { title: 'Loan Officer Dashboard', subtitle: 'Review Applications & KCC Requests', icon: <Building2 size={24} /> };
       case 'company': return { title: 'Agri-Business Portal', subtitle: 'Sales, Disease Heatmaps & Marketing', icon: <TrendingUp size={24} /> };
       case 'insurance': return { title: 'Insurance Claims Desk', subtitle: 'Verify Loss Assessments & Policies', icon: <ShieldAlert size={24} /> };
       case 'service_provider': return { title: 'Service Hub', subtitle: 'Manage Rentals & Logistics', icon: <Truck size={24} /> };
       case 'admin': return { title: 'Admin Panel', subtitle: 'System Health & User Management', icon: <Settings size={24} /> };
       default: return { title: 'Dashboard', subtitle: 'Overview', icon: <Users /> };
    }
  };

  const header = getHeader();

  return (
    <div className="bg-transparent min-h-screen pb-20 font-sans text-white">
      {/* Transparent Header to show overlay */}
      <div className="pt-8 pb-12 px-6 rounded-b-[3rem] relative overflow-hidden">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10 gap-4">
            <div>
               <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3 text-white drop-shadow-md">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">{header.icon}</div>
                  {header.title}
               </h1>
               <p className="text-white/70 font-medium text-lg">{header.subtitle}</p>
            </div>
            <div className="flex gap-3">
               <button 
                 onClick={() => setActiveTab('overview')}
                 className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/10 ${activeTab === 'overview' ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                  <Users size={18} /> Overview
               </button>
               {(role === 'govt' || role === 'company' || role === 'insurance') && (
                 <button 
                   onClick={() => setActiveTab('heatmap')}
                   className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all border border-white/10 ${activeTab === 'heatmap' ? 'bg-white text-slate-900 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                 >
                    <Radar size={18} className={activeTab === 'heatmap' ? 'text-red-600 animate-pulse' : ''} /> Risk Intelligence
                 </button>
               )}
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
         
         {activeTab === 'heatmap' ? (
            <PestHeatmap t={t} userLocation={userLocation} />
         ) : (
            <>
              {/* Metrics Row - Glassmorphism on Blue-Grey Overlay */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {regionStats.map((stat, i) => (
                    <div key={i} className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/10 flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                          <div className={`p-2 rounded-full bg-white/5`}>
                              <TrendingUp size={16} className={stat.color} />
                          </div>
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                          <p className={`text-xs font-bold mt-1 ${stat.color}`}>{stat.trend}</p>
                        </div>
                    </div>
                  ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                  {/* LEFT COLUMN */}
                  <div className="lg:col-span-2 space-y-8">
                    
                    {/* BANK INTERFACE */}
                    {role === 'bank' && (
                        <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-sm text-slate-900 dark:text-white">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                              <h3 className="font-bold text-xl flex items-center gap-2">
                                <Coins className="text-blue-500" /> Pending Loan Applications
                              </h3>
                              <button className="text-blue-500 font-bold text-sm hover:underline">View All (84)</button>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {loanRequests.map((loan, i) => (
                                <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <h4 className="font-bold text-lg">{loan.farmer}</h4>
                                          <p className="text-sm text-slate-500">{loan.id} • {loan.crop} Farmer</p>
                                      </div>
                                      <div className="text-right">
                                          <span className="block font-bold text-xl">{loan.amount}</span>
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{loan.type}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex items-center gap-4">
                                          <div className="text-xs">
                                            <span className="block text-slate-400 uppercase font-bold">Credit Score</span>
                                            <span className="font-bold text-green-600">{loan.score} (Good)</span>
                                          </div>
                                          <div className="text-xs">
                                            <span className="block text-slate-400 uppercase font-bold">Risk Analysis</span>
                                            <span className={`font-bold ${loan.risk === 'Low' ? 'text-green-600' : 'text-amber-600'}`}>{loan.risk}</span>
                                          </div>
                                      </div>
                                      <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                          <button className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"><FileText size={18} /></button>
                                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-1"><Check size={16} /> Approve</button>
                                          <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 flex items-center gap-1"><X size={16} /> Reject</button>
                                      </div>
                                    </div>
                                </div>
                              ))}
                          </div>
                        </div>
                    )}

                    {/* GOVT INTERFACE */}
                    {role === 'govt' && (
                        <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-sm text-slate-900 dark:text-white">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                              <h3 className="font-bold text-xl flex items-center gap-2">
                                <Send className="text-amber-600" /> Regional Broadcast
                              </h3>
                              <p className="text-slate-500 text-sm mt-1">Send weather warnings, disease alerts, or scheme updates to all farmers in a district.</p>
                          </div>
                          <div className="p-6 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Region</label>
                                    <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                      <option>All Districts</option>
                                      <option>Nashik</option>
                                      <option>Pune</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alert Type</label>
                                    <select className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                      <option>Weather Alert (Heavy Rain)</option>
                                      <option>Pest Outbreak</option>
                                      <option>Scheme Announcement</option>
                                    </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message (Local Language)</label>
                                <textarea className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-32 resize-none" placeholder="Enter message to broadcast..."></textarea>
                              </div>
                              <button className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200 dark:shadow-none">
                                Broadcast Alert
                              </button>
                          </div>
                        </div>
                    )}

                    {/* INSURANCE INTERFACE */}
                    {role === 'insurance' && (
                        <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-white/10 overflow-hidden shadow-xl backdrop-blur-sm text-slate-900 dark:text-white">
                          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                              <h3 className="font-bold text-xl flex items-center gap-2">
                                <ShieldAlert className="text-rose-600" /> New Claims
                              </h3>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {insuranceClaims.map((claim, i) => (
                                <div key={i} className="p-6 flex flex-col sm:flex-row justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-bold">{claim.farmer}</h4>
                                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">{claim.id}</span>
                                      </div>
                                      <p className="text-sm text-slate-500">{claim.crop} • {claim.loss} Loss</p>
                                      <p className="text-xs text-slate-500 mt-1">Reason: {claim.cause}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                      <span className="text-xs font-bold text-slate-400">{claim.date}</span>
                                      <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-100 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                          <Map size={14} /> View Geotag
                                      </button>
                                      <div className="flex gap-2">
                                          <button className="text-xs text-blue-600 font-bold hover:underline">AI Assessment</button>
                                          <button className="text-xs text-green-600 font-bold hover:underline">Approve</button>
                                      </div>
                                    </div>
                                </div>
                              ))}
                          </div>
                        </div>
                    )}

                  </div>

                  {/* RIGHT COLUMN: INSIGHTS & TOOLS */}
                  <div className="space-y-8">
                    
                    {/* Common: Search */}
                    <div className="bg-white/95 dark:bg-slate-900/95 p-4 rounded-2xl border border-white/10 shadow-sm backdrop-blur-sm">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                          <input type="text" placeholder={`Search ${role === 'bank' ? 'Farmers / Loans' : 'Records'}...`} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-900 dark:text-white" />
                        </div>
                    </div>

                    {/* Role Specific Widgets */}
                    {role === 'bank' && (
                        <div className="bg-blue-50 dark:bg-blue-900/40 p-6 rounded-3xl border border-blue-100 dark:border-blue-800 backdrop-blur-sm">
                          <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                              <Briefcase size={20} /> Recovery Intelligence
                          </h4>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                              AI predicts <strong>92%</strong> repayment rate for Wheat farmers in Nashik due to favorable weather conditions.
                          </p>
                          <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-[92%]"></div>
                          </div>
                        </div>
                    )}
                    
                    {/* Quick Stats / System Status */}
                    <div className="bg-white/95 dark:bg-slate-900/95 p-6 rounded-3xl border border-white/10 shadow-sm backdrop-blur-sm text-slate-900 dark:text-white">
                        <h4 className="font-bold mb-4">System Status</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-500">API Latency</span>
                              <span className="font-bold text-green-600">24ms</span>
                          </div>
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Sync Queue</span>
                              <span className="font-bold">Empty</span>
                          </div>
                          <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Database</span>
                              <span className="font-bold text-green-600">Healthy</span>
                          </div>
                        </div>
                    </div>

                  </div>
              </div>
            </>
         )}
      </div>
    </div>
  );
};
