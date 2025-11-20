
import React, { useState } from 'react';
import { User, QrCode, Map, ShieldCheck, FileText, Droplets, Sprout, Coins, Download, CheckCircle2, MapPin, Layers, History, Award, Bug, FileCheck } from 'lucide-react';
import { AgriPassportData } from '../types';

interface Props {
  t: any;
  userLocation: { lat: number; lng: number } | null;
  userName?: string;
}

export const AgriPassport: React.FC<Props> = ({ t, userLocation, userName }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'land' | 'soil' | 'finance'>('overview');

  // Mock Data for Passport
  const passportData: AgriPassportData = {
    farmerId: "K-2025-MH-9876",
    name: userName || "Ram Kishan",
    fatherName: "Suresh Kishan",
    dob: "15-06-1982",
    aadharHash: "XXXX-XXXX-4521",
    address: "Village Dindori, Dist. Nashik, Maharashtra",
    landParcels: [
      { surveyNumber: "124/A", area: "1.5 Acres", type: "Irrigated", ownership: "Sole", status: "Verified" },
      { surveyNumber: "124/B", area: "1.0 Acre", type: "Rainfed", ownership: "Joint", status: "Verified" }
    ],
    waterSources: ["Tube Well (Shared)", "Canal (Seasonal)"],
    cropsHistory: [
      { year: "2024", season: "Rabi", crop: "Wheat", yield: "22 Qt" },
      { year: "2024", season: "Kharif", crop: "Soybean", yield: "18 Qt" },
      { year: "2023", season: "Rabi", crop: "Onion", yield: "200 Qt" }
    ],
    soilHealth: {
      date: "10 Jan 2025",
      nitrogen: "Medium",
      phosphorus: "Low",
      potassium: "High",
      ph: 7.2,
      organicCarbon: "0.55%",
      recommendation: "Add DAP and Zinc Sulfate."
    },
    pestHistory: [
       { year: "2024", season: "Kharif", crop: "Cotton", pest: "Pink Bollworm", controlMethod: "Pheromone Traps" },
       { year: "2023", season: "Rabi", crop: "Onion", pest: "Thrips", controlMethod: "Neem Oil" }
    ],
    financials: {
      creditScore: 780,
      activeLoans: 1,
      insuranceCoverage: true,
      kccLimit: "₹ 3,00,000"
    },
    compliance: {
      soilTested: true,
      advisoryFollowed: 85,
      sustainablePractices: true
    },
    recentReports: [
       { id: "R-2025-01", generatedDate: "20 Jan 2025", downloadUrl: "#" },
       { id: "R-2024-11", generatedDate: "15 Nov 2024", downloadUrl: "#" }
    ]
  };

  const handleDownload = () => {
    alert("Generating secure PDF... (This simulates a backend generation)");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header Identity Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl font-bold text-white">
              {passportData.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-display font-bold">{passportData.name}</h1>
                <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck size={12} /> {t.verified_id || "Verified"}
                </span>
              </div>
              <p className="text-slate-300 text-sm flex items-center gap-1 mb-2">
                <MapPin size={14} /> {passportData.address}
              </p>
              <p className="font-mono text-slate-400 text-sm tracking-wider">ID: {passportData.farmerId}</p>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl shadow-lg mx-auto md:mx-0">
             <QrCode size={80} className="text-slate-900" />
             <p className="text-[8px] text-slate-900 text-center font-bold mt-1 uppercase">Scan to Verify</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <User size={18} /> Overview
        </button>
        <button 
          onClick={() => setActiveTab('land')}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'land' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Map size={18} /> {t.land_records || "Land Records"}
        </button>
        <button 
          onClick={() => setActiveTab('soil')}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'soil' ? 'bg-amber-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Layers size={18} /> {t.soil_health || "Soil & Crops"}
        </button>
        <button 
          onClick={() => setActiveTab('finance')}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'finance' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Coins size={18} /> {t.financial_profile || "Finance"}
        </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT: MAIN CONTENT */}
         <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <User size={20} className="text-indigo-500" /> Personal Details
                     </h3>
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                           <span className="text-slate-500">Father's Name</span>
                           <span className="font-medium text-slate-900 dark:text-white">{passportData.fatherName}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                           <span className="text-slate-500">Date of Birth</span>
                           <span className="font-medium text-slate-900 dark:text-white">{passportData.dob}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                           <span className="text-slate-500">Govt ID (Masked)</span>
                           <span className="font-medium text-slate-900 dark:text-white">{passportData.aadharHash}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award size={20} className="text-amber-500" /> Digital Reputation
                     </h3>
                     <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-xl border-4 border-indigo-100 dark:border-indigo-800">
                           {passportData.compliance.advisoryFollowed}%
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">Advisory Adherence</p>
                           <p className="text-xs text-slate-500">High compliance with AI advice.</p>
                        </div>
                     </div>
                     <div className="flex flex-wrap gap-2">
                        {passportData.compliance.sustainablePractices && (
                           <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">Sustainable Farmer</span>
                        )}
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">Early Adopter</span>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'land' && (
               <div className="space-y-6 animate-slide-up">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Map size={20} className="text-emerald-500" /> Land Parcels
                        </h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">Official Records</span>
                     </div>
                     
                     {/* Mock GIS Map View */}
                     <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-700 flex items-center justify-center group">
                        <MapPin size={32} className="text-slate-400 mb-2" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                           <span className="bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300">View Geo-Boundaries</span>
                        </div>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold text-xs">
                              <tr>
                                 <th className="px-4 py-3 rounded-l-lg">Survey No.</th>
                                 <th className="px-4 py-3">Area</th>
                                 <th className="px-4 py-3">Type</th>
                                 <th className="px-4 py-3">Ownership</th>
                                 <th className="px-4 py-3 rounded-r-lg">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {passportData.landParcels.map((land, i) => (
                                 <tr key={i}>
                                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{land.surveyNumber}</td>
                                    <td className="px-4 py-3">{land.area}</td>
                                    <td className="px-4 py-3">{land.type}</td>
                                    <td className="px-4 py-3">{land.ownership}</td>
                                    <td className="px-4 py-3">
                                       <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                                          <CheckCircle2 size={12} /> {land.status}
                                       </span>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Water Source Section */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Droplets size={20} className="text-blue-500" /> Water Sources
                     </h3>
                     <div className="flex flex-wrap gap-3">
                        {passportData.waterSources?.map((source, i) => (
                           <span key={i} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-100 dark:border-blue-800">
                              {source}
                           </span>
                        )) || <span className="text-slate-500 text-sm">No water sources recorded.</span>}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'soil' && (
               <div className="space-y-6 animate-slide-up">
                  {/* Soil Health Card */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sprout size={20} className="text-amber-600" /> Soil Health Report
                         </h3>
                         <span className="text-xs text-slate-400">Date: {passportData.soilHealth.date}</span>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                           <span className="text-xs text-slate-500 uppercase font-bold">Nitrogen</span>
                           <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                              <div className={`h-full w-[60%] ${passportData.soilHealth.nitrogen === 'Low' ? 'bg-red-400' : 'bg-green-500'}`}></div>
                           </div>
                           <p className="text-sm font-bold mt-1">{passportData.soilHealth.nitrogen}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                           <span className="text-xs text-slate-500 uppercase font-bold">Phosphorus</span>
                           <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                              <div className={`h-full w-[30%] ${passportData.soilHealth.phosphorus === 'Low' ? 'bg-red-400' : 'bg-green-500'}`}></div>
                           </div>
                           <p className="text-sm font-bold mt-1">{passportData.soilHealth.phosphorus}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                           <span className="text-xs text-slate-500 uppercase font-bold">Potassium</span>
                           <div className="h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                              <div className={`h-full w-[90%] ${passportData.soilHealth.potassium === 'Low' ? 'bg-red-400' : 'bg-green-500'}`}></div>
                           </div>
                           <p className="text-sm font-bold mt-1">{passportData.soilHealth.potassium}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                           <span className="text-xs text-slate-500 uppercase font-bold">pH Level</span>
                           <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{passportData.soilHealth.ph}</p>
                           <span className="text-[10px] text-green-600">Neutral</span>
                        </div>
                     </div>
                     <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                        <strong>Expert Recommendation:</strong> {passportData.soilHealth.recommendation}
                     </div>
                  </div>

                  {/* Pest History */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bug size={20} className="text-red-500" /> Pest History
                     </h3>
                     <div className="space-y-3">
                        {passportData.pestHistory?.map((pest, i) => (
                           <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                              <div>
                                 <p className="font-bold text-slate-900 dark:text-white">{pest.pest}</p>
                                 <p className="text-xs text-slate-500">{pest.crop} • {pest.season} {pest.year}</p>
                              </div>
                              <div className="text-right">
                                 <span className="block text-xs font-bold text-slate-400 uppercase">Control</span>
                                 <span className="text-sm text-slate-700 dark:text-slate-300">{pest.controlMethod}</span>
                              </div>
                           </div>
                        )) || <p className="text-sm text-slate-500">No pest history recorded.</p>}
                     </div>
                  </div>

                  {/* Crop History */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                     <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <History size={20} className="text-slate-500" /> Cropping Pattern
                     </h3>
                     <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        {passportData.cropsHistory.map((crop, i) => (
                           <div key={i} className="relative pl-8">
                              <div className="absolute left-0 top-1.5 w-5 h-5 bg-green-500 rounded-full border-4 border-white dark:border-slate-900"></div>
                              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                 <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{crop.crop}</p>
                                    <p className="text-xs text-slate-500">{crop.season} {crop.year}</p>
                                 </div>
                                 <div className="text-right">
                                    <span className="block text-sm font-bold text-green-600">{crop.yield}</span>
                                    <span className="text-[10px] text-slate-400 uppercase">Yield</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'finance' && (
               <div className="space-y-6 animate-slide-up">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-8">
                     <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                           <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                           <path className="text-green-500" strokeDasharray={`${(passportData.financials.creditScore / 900) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-2xl font-bold text-slate-900 dark:text-white">{passportData.financials.creditScore}</span>
                           <span className="text-[10px] text-green-600 font-bold">EXCELLENT</span>
                        </div>
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Credit Worthiness</h3>
                        <p className="text-sm text-slate-500 mb-3">Eligible for low-interest loans & premium insurance.</p>
                        <div className="flex gap-2">
                           <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">KCC Limit: {passportData.financials.kccLimit}</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-slate-500 text-xs uppercase font-bold mb-2 block">Active Loans</span>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{passportData.financials.activeLoans}</p>
                        <p className="text-xs text-green-600 mt-1">Regular Repayment</p>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-slate-500 text-xs uppercase font-bold mb-2 block">Insurance</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           {passportData.financials.insuranceCoverage ? <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={20} /> Active</span> : <span className="text-red-500">Inactive</span>}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PMFBY Coverage</p>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* RIGHT: DOWNLOAD & ACTIONS */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
               <h3 className="font-bold text-xl mb-2">{t.download_passport || "Download Passport"}</h3>
               <p className="text-blue-100 text-sm mb-6">Get a verified PDF report for bank loans, insurance claims, and government schemes.</p>
               <button 
                  onClick={handleDownload}
                  className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shadow-md"
               >
                  <Download size={18} /> Generate PDF
               </button>
            </div>
            
            {/* Downloaded Reports Section */}
            {passportData.recentReports && passportData.recentReports.length > 0 && (
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                     <FileCheck size={16} className="text-green-500" /> Recent Reports
                  </h4>
                  <div className="space-y-3">
                     {passportData.recentReports.map((report, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                           <div className="flex items-center gap-3">
                              <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg text-red-600 dark:text-red-400">
                                 <FileText size={16} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Agri Passport</p>
                                 <p className="text--[10px] text-slate-500">{report.generatedDate}</p>
                              </div>
                           </div>
                           <a href={report.downloadUrl} className="text-blue-600 hover:text-blue-800 p-2">
                              <Download size={16} />
                           </a>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Quick Actions</h4>
               <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                     <FileText size={16} /> Apply for KCC Renewal
                  </button>
                  <button className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                     <Droplets size={16} /> Update Irrigation Data
                  </button>
                  <button className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                     <Map size={16} /> Dispute Land Boundary
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
