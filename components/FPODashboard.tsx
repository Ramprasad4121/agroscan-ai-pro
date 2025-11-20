
import React, { useState } from 'react';
import { Users, ShoppingCart, Truck, Coins, Send, PlusCircle, Download, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { FPOMember, FPOBatch } from '../types';

interface FPODashboardProps {
  t: any;
  userLocation: { lat: number; lng: number } | null;
  userName?: string;
}

export const FPODashboard: React.FC<FPODashboardProps> = ({ t, userLocation, userName }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'inputs' | 'sales' | 'payments'>('members');
  const [showBroadcast, setShowBroadcast] = useState(false);

  // Mock Members
  const members: FPOMember[] = [
    { id: 'M-001', name: 'Ramesh Patil', village: 'Dindori', landSize: '4 Acres', primaryCrop: 'Grapes', status: 'Active', balance: '₹12,500' },
    { id: 'M-002', name: 'Suresh Reddy', village: 'Vani', landSize: '2.5 Acres', primaryCrop: 'Onion', status: 'Active', balance: '₹4,000' },
    { id: 'M-003', name: 'Anita Devi', village: 'Pimple', landSize: '3 Acres', primaryCrop: 'Soybean', status: 'Pending', balance: '₹0' },
    { id: 'M-004', name: 'Vijay Singh', village: 'Dindori', landSize: '5 Acres', primaryCrop: 'Cotton', status: 'Active', balance: '₹25,000' },
  ];

  // Mock Batches
  const batches: FPOBatch[] = [
    { id: 'B-101', type: 'Input', item: 'Urea Fertilizer', quantity: '500 Bags', status: 'Collecting', participants: 45, value: '₹1,50,000' },
    { id: 'B-102', type: 'Output', item: 'Onion (Red)', quantity: '25 Tons', status: 'Processing', participants: 12, value: '₹4,00,000' },
    { id: 'B-103', type: 'Output', item: 'Soybean', quantity: '10 Tons', status: 'Completed', participants: 8, value: '₹3,50,000' },
  ];

  return (
    <div className="bg-transparent min-h-screen pb-20 font-sans">
      {/* Header */}
      <div className="bg-teal-700 text-white pt-8 pb-20 px-6 rounded-b-[3rem] shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <Users size={60} />
         </div>
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end relative z-10 gap-4">
            <div>
               <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner"><Users size={24} /></div>
                  {userName || t.fpo_dashboard}
               </h1>
               <p className="text-white/80 font-medium text-lg">{t.role_fpo_desc || "FPO Operations Center"}</p>
            </div>
            <div className="flex gap-3">
               <button 
                 onClick={() => setShowBroadcast(!showBroadcast)}
                 className="px-5 py-2.5 bg-teal-800 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-teal-900 transition-all shadow-lg border border-teal-600"
               >
                  <Send size={18} /> {t.fpo_broadcast || "Broadcast Advisory"}
               </button>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
         
         {/* Metrics Row */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.total_farmers || "Total Farmers"}</span>
                  <div className="p-2 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600">
                      <Users size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">142</p>
                  <p className="text-xs font-bold mt-1 text-teal-600">+12 this month</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.total_acreage || "Total Acreage"}</span>
                  <div className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                      <Truck size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">450 Ac</p>
                  <p className="text-xs font-bold mt-1 text-indigo-600">Active Harvest: 60%</p>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t.active_batches || "Active Batches"}</span>
                  <div className="p-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                      <ShoppingCart size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
                  <p className="text-xs font-bold mt-1 text-amber-600">Value: ₹5.5 Lakh</p>
                </div>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
               <button 
                 onClick={() => setActiveTab('members')}
                 className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap border-b-2 ${activeTab === 'members' ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                  <Users size={18} /> {t.fpo_members || "Members"}
               </button>
               <button 
                 onClick={() => setActiveTab('inputs')}
                 className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap border-b-2 ${activeTab === 'inputs' ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                  <ShoppingCart size={18} /> {t.fpo_inputs || "Bulk Inputs"}
               </button>
               <button 
                 onClick={() => setActiveTab('sales')}
                 className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap border-b-2 ${activeTab === 'sales' ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                  <Truck size={18} /> {t.fpo_sales || "Bulk Sales"}
               </button>
               <button 
                 onClick={() => setActiveTab('payments')}
                 className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap border-b-2 ${activeTab === 'payments' ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : 'border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
               >
                  <Coins size={18} /> {t.fpo_payments || "Payments"}
               </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 animate-fade-in">
               
               {/* MEMBERS TAB */}
               {activeTab === 'members' && (
                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <div className="relative max-w-xs w-full">
                           <input type="text" placeholder="Search Member..." className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
                        </div>
                        <button className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition-colors flex items-center gap-2">
                           <PlusCircle size={18} /> Add Member
                        </button>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                              <tr>
                                 <th className="p-4 rounded-l-xl">Name / ID</th>
                                 <th className="p-4">Village</th>
                                 <th className="p-4">Land / Crop</th>
                                 <th className="p-4">Status</th>
                                 <th className="p-4 text-right rounded-r-xl">Balance Due</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {members.map((m, i) => (
                                 <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4">
                                       <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                                       <p className="text-xs text-slate-500">{m.id}</p>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">{m.village}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">{m.landSize} • {m.primaryCrop}</td>
                                    <td className="p-4">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                          {m.status}
                                       </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                                       {m.balance}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               )}

               {/* INPUTS & SALES TABS (Combined Logic for Batches) */}
               {(activeTab === 'inputs' || activeTab === 'sales') && (
                  <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           {activeTab === 'inputs' ? <ShoppingCart className="text-teal-600" /> : <Truck className="text-teal-600" />}
                           {activeTab === 'inputs' ? 'Active Input Orders' : 'Harvest Batches'}
                        </h3>
                        <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                           <PlusCircle size={18} /> {activeTab === 'inputs' ? 'Create Demand' : 'Create Batch'}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batches.filter(b => (activeTab === 'inputs' ? b.type === 'Input' : b.type === 'Output')).map((b, i) => (
                           <div key={i} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                              <div className="flex justify-between items-start mb-3">
                                 <span className="bg-white dark:bg-slate-900 text-slate-500 text-xs font-bold px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{b.id}</span>
                                 <span className={`text-xs font-bold px-2 py-1 rounded ${
                                    b.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                                    b.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 
                                    'bg-amber-100 text-amber-700'
                                 }`}>{b.status}</span>
                              </div>
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{b.item}</h4>
                              <p className="text-sm text-slate-500 mb-4">Quantity: <strong>{b.quantity}</strong></p>
                              
                              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                                 <div className="text-xs text-slate-500">
                                    <span className="block font-bold text-slate-900 dark:text-white">{b.participants}</span>
                                    Farmers
                                 </div>
                                 <div className="text-right">
                                    <span className="block font-bold text-teal-600">{b.value}</span>
                                    <span className="text-xs text-slate-400">Total Value</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                        
                        {/* Empty State Placeholder */}
                        {batches.filter(b => (activeTab === 'inputs' ? b.type === 'Input' : b.type === 'Output')).length === 0 && (
                           <div className="col-span-full p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                              <p>No active batches found.</p>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* PAYMENTS TAB */}
               {activeTab === 'payments' && (
                  <div className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900">
                           <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">Total Disbursed</span>
                           <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">₹45.2 Lakh</p>
                        </div>
                        <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900">
                           <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">Pending Dues</span>
                           <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">₹2.8 Lakh</p>
                        </div>
                     </div>

                     <h3 className="font-bold text-slate-900 dark:text-white">Outstanding Settlements</h3>
                     <div className="space-y-3">
                        {members.filter(m => m.balance !== '₹0').map((m, i) => (
                           <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                                    {m.name.charAt(0)}
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{m.name}</h4>
                                    <p className="text-xs text-slate-500">{m.id}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-slate-900 dark:text-white mb-1">{m.balance}</p>
                                 <button className="bg-teal-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-teal-700 transition-colors">
                                    Pay Now
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Broadcast Modal Overlay */}
         {showBroadcast && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
               <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-slide-up">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Send className="text-teal-600" /> Broadcast Advisory
                     </h3>
                     <button onClick={() => setShowBroadcast(false)} className="text-slate-400 hover:text-slate-600">
                        <AlertCircle size={20} className="rotate-45" />
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Message Type</label>
                        <div className="flex gap-2">
                           <button className="flex-1 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-bold">SMS</button>
                           <button className="flex-1 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-bold">Voice Call</button>
                           <button className="flex-1 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-bold">WhatsApp</button>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
                        <textarea className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl h-32 resize-none" placeholder="Enter message for all members... (e.g. Urea stock arrived)" />
                     </div>
                     <button onClick={() => setShowBroadcast(false)} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 dark:shadow-none">
                        Send Broadcast
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};