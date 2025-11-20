
import React, { useState } from 'react';
import { Map, Layers, Filter, Download, Share2, AlertTriangle, Droplets, Bug, Thermometer, Send, Radar, RefreshCw } from 'lucide-react';
import { RiskReport, RiskSector } from '../types';

interface PestHeatmapProps {
  t: any;
  userLocation: { lat: number; lng: number } | null;
}

export const PestHeatmap: React.FC<PestHeatmapProps> = ({ t, userLocation }) => {
  const [activeLayer, setActiveLayer] = useState<'disease' | 'pest' | 'water'>('disease');
  const [selectedSector, setSelectedSector] = useState<RiskSector | null>(null);

  // Mock Data: Sectors (Grid)
  // Simulating a 5x5 grid region
  const sectors: RiskSector[] = [
    { id: 's1', location: 'Sector A - North Dindori', riskLevel: 'Critical', issueType: 'Disease', affectedCrop: 'Grape', affectedAcres: 120, reportCount: 45, trend: 'Rising' },
    { id: 's2', location: 'Sector B - South Pimple', riskLevel: 'High', issueType: 'Pest', affectedCrop: 'Cotton', affectedAcres: 85, reportCount: 28, trend: 'Stable' },
    { id: 's3', location: 'Sector C - East Vani', riskLevel: 'Low', issueType: 'Water Stress', affectedCrop: 'Onion', affectedAcres: 10, reportCount: 5, trend: 'Falling' },
    // ... more synthetic data generated in render loop
  ];

  // Mock Data: Live Feed
  const liveReports: RiskReport[] = [
    { id: 'r1', timestamp: '10 mins ago', village: 'Dindori', issue: 'Downy Mildew', severity: 'High', source: 'Crowd (Scan)' },
    { id: 'r2', timestamp: '25 mins ago', village: 'Vani', issue: 'Pink Bollworm', severity: 'Medium', source: 'Satellite' },
    { id: 'r3', timestamp: '1 hour ago', village: 'Pimple', issue: 'Water Stress', severity: 'Low', source: 'Satellite' },
  ];

  const getLayerColor = (level: string) => {
    if (activeLayer === 'water') {
       // Blue scale for water
       return level === 'Critical' ? 'bg-red-500' : level === 'High' ? 'bg-orange-400' : level === 'Moderate' ? 'bg-blue-300' : 'bg-blue-100';
    }
    // Red/Green scale for pests/disease
    return level === 'Critical' ? 'bg-red-600 animate-pulse' : level === 'High' ? 'bg-orange-500' : level === 'Moderate' ? 'bg-yellow-400' : 'bg-emerald-400';
  };

  const getIcon = () => {
    switch(activeLayer) {
      case 'disease': return <Thermometer size={18} />;
      case 'pest': return <Bug size={18} />;
      case 'water': return <Droplets size={18} />;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white p-4 md:p-8 animate-fade-in rounded-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
         <div>
            <h2 className="text-3xl font-display font-bold flex items-center gap-3">
               <Radar className="text-red-500 animate-spin-slow" size={32} /> 
               {t.heatmap_title || "Risk Intelligence Command Center"}
            </h2>
            <p className="text-slate-400 mt-1">{t.heatmap_desc || "Live satellite & crowd-sourced risk assessment."}</p>
         </div>
         <div className="flex gap-3">
            <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
               <RefreshCw size={16} /> Refresh Data
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/50">
               <Download size={16} /> Export Report
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT: MAP VISUALIZATION */}
         <div className="lg:col-span-2 space-y-6">
            {/* Layer Controls */}
            <div className="bg-slate-800 p-2 rounded-xl inline-flex gap-1">
               <button 
                 onClick={() => setActiveLayer('disease')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeLayer === 'disease' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 <Thermometer size={16} /> {t.layer_disease || "Disease"}
               </button>
               <button 
                 onClick={() => setActiveLayer('pest')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeLayer === 'pest' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 <Bug size={16} /> {t.layer_pest || "Pest"}
               </button>
               <button 
                 onClick={() => setActiveLayer('water')}
                 className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeLayer === 'water' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
               >
                 <Droplets size={16} /> {t.layer_water || "Water Stress"}
               </button>
            </div>

            {/* The Grid Map */}
            <div className="bg-slate-800 rounded-3xl p-6 shadow-2xl border border-slate-700 relative overflow-hidden min-h-[400px] md:min-h-[500px]">
               {/* Overlay Grid Lines */}
               <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
               
               {/* Sectors */}
               <div className="grid grid-cols-6 grid-rows-6 gap-2 h-full relative z-10">
                  {Array.from({ length: 36 }).map((_, i) => {
                     // Simulation logic to determine risk per cell
                     const riskVal = Math.random();
                     let risk: 'Critical'|'High'|'Moderate'|'Low' = 'Low';
                     if (riskVal > 0.9) risk = 'Critical';
                     else if (riskVal > 0.7) risk = 'High';
                     else if (riskVal > 0.5) risk = 'Moderate';

                     return (
                       <button 
                         key={i}
                         onClick={() => setSelectedSector({
                            id: `sec-${i}`,
                            location: `Zone ${String.fromCharCode(65 + (i % 6))}-${Math.floor(i/6)+1}`,
                            riskLevel: risk,
                            issueType: activeLayer === 'disease' ? 'Disease' : activeLayer === 'pest' ? 'Pest' : 'Water Stress',
                            affectedCrop: ['Cotton', 'Grape', 'Onion', 'Wheat'][Math.floor(Math.random() * 4)],
                            affectedAcres: Math.floor(Math.random() * 500),
                            reportCount: Math.floor(Math.random() * 50),
                            trend: Math.random() > 0.5 ? 'Rising' : 'Stable'
                         })}
                         className={`rounded-lg transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-white/50 opacity-80 hover:opacity-100 ${getLayerColor(risk)} flex items-center justify-center group relative`}
                       >
                          {risk === 'Critical' && <AlertTriangle size={16} className="text-white drop-shadow-md animate-bounce" />}
                          <span className="absolute bottom-1 right-1 text-[8px] font-mono opacity-50">{i+1}</span>
                       </button>
                     );
                  })}
               </div>

               {/* Legend */}
               <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-600 flex gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> High</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full"></div> Med</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div> Low</span>
               </div>
            </div>
         </div>

         {/* RIGHT: INTELLIGENCE PANEL */}
         <div className="space-y-6">
            
            {/* Selected Sector Details */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
               <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <Map size={14} /> Selected Zone Details
               </h3>
               {selectedSector ? (
                  <div className="space-y-4 animate-slide-up">
                     <div>
                        <h4 className="text-2xl font-bold text-white">{selectedSector.location}</h4>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold mt-1 ${selectedSector.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                           {selectedSector.riskLevel} Risk • {selectedSector.trend} Trend
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700/50 p-3 rounded-xl">
                           <span className="text-xs text-slate-400 block">Affected Crop</span>
                           <span className="font-bold text-white">{selectedSector.affectedCrop}</span>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-xl">
                           <span className="text-xs text-slate-400 block">Acreage</span>
                           <span className="font-bold text-white">{selectedSector.affectedAcres} Ac</span>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-xl">
                           <span className="text-xs text-slate-400 block">Reports</span>
                           <span className="font-bold text-white">{selectedSector.reportCount}</span>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-xl">
                           <span className="text-xs text-slate-400 block">Est. Loss</span>
                           <span className="font-bold text-white">₹{(selectedSector.affectedAcres * 5000).toLocaleString()}</span>
                        </div>
                     </div>

                     <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-900/50">
                        <Send size={16} /> {t.notify_farmers || "Broadcast Alert"}
                     </button>
                  </div>
               ) : (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-500 text-center p-4">
                     <Map size={32} className="opacity-20 mb-2" />
                     <p className="text-sm">Select a grid sector to view detailed risk analysis.</p>
                  </div>
               )}
            </div>

            {/* Live Feed */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg flex-grow">
               <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
                  <Radar size={14} className="animate-pulse text-green-400" /> Live Detection Feed
               </h3>
               <div className="space-y-3">
                  {liveReports.map(report => (
                     <div key={report.id} className="bg-slate-700/30 p-3 rounded-xl border border-slate-600 flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{report.village}</span>
                              <span className="text-[10px] bg-slate-600 px-1.5 rounded text-slate-300">{report.source}</span>
                           </div>
                           <p className="text-xs text-red-300 mt-0.5 font-medium">{report.issue}</p>
                        </div>
                        <div className="text-right">
                           <span className="block text-[10px] text-slate-400">{report.timestamp}</span>
                           <span className={`text-[10px] font-bold ${report.severity === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {report.severity} Risk
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};
