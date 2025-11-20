
import React, { useState } from 'react';
import { Plane, Map, Scan, Sprout, Calendar, MapPin, CheckCircle2, UserCheck, ArrowRight, ShieldCheck, Wind } from 'lucide-react';
import { DroneService, DronePilot } from '../types';

interface DroneServicesProps {
  t: any;
  userLocation: { lat: number; lng: number } | null;
}

export const DroneServices: React.FC<DroneServicesProps> = ({ t, userLocation }) => {
  const [activeStep, setActiveStep] = useState<'select' | 'details' | 'pilots' | 'confirm'>('select');
  const [selectedService, setSelectedService] = useState<DroneService | null>(null);
  const [acres, setAcres] = useState('');
  const [date, setDate] = useState('');
  const [selectedPilot, setSelectedPilot] = useState<DronePilot | null>(null);

  // Mock Services Data
  const services: DroneService[] = [
    { 
      id: 'spray', 
      title: t.service_spray || "Aerial Spraying", 
      description: "Save 30% chemicals & 90% water. Finish 1 acre in 15 mins.", 
      costPerAcre: "₹500", 
      iconType: 'spray',
      benefits: ["Uniform Coverage", "No Health Risk to Farmer", "Fast Operation"]
    },
    { 
      id: 'ndvi', 
      title: t.service_ndvi || "Health Scan (NDVI)", 
      description: "Detect crop stress, disease & water issues before naked eye.", 
      costPerAcre: "₹300", 
      iconType: 'scan',
      benefits: ["Early Disease Detection", "Yield Prediction", "Precise Fertilizer Map"]
    },
    { 
      id: 'map', 
      title: t.service_map || "Field Mapping", 
      description: "Accurate land measurement and 3D terrain mapping.", 
      costPerAcre: "₹250", 
      iconType: 'map',
      benefits: ["Exact Acreage", "Boundary Dispute Resolution", "Drainage Planning"]
    },
    { 
      id: 'seed', 
      title: t.service_seed || "Seed Sowing", 
      description: "Broadcasting seeds or granules over wet/marshy land.", 
      costPerAcre: "₹600", 
      iconType: 'seed',
      benefits: ["Access Hard-to-reach Areas", "Uniform Distribution", "Labor Saving"]
    },
  ];

  // Mock Pilots Data
  const pilots: DronePilot[] = [
    { id: 'p1', name: 'SkyAgri Tech', droneModel: 'DJI Agras T40', rating: 4.9, distance: '5 km', completedJobs: 120, isVerified: true },
    { id: 'p2', name: 'Kisan Drones', droneModel: 'Garuda Aerospace', rating: 4.7, distance: '12 km', completedJobs: 85, isVerified: true },
    { id: 'p3', name: 'Ravi Pilot', droneModel: 'IoTech World', rating: 4.5, distance: '8 km', completedJobs: 42, isVerified: false },
  ];

  const getServiceIcon = (type: string) => {
     switch(type) {
        case 'spray': return <Wind size={32} className="text-cyan-500" />;
        case 'scan': return <Scan size={32} className="text-emerald-500" />;
        case 'map': return <Map size={32} className="text-indigo-500" />;
        case 'seed': return <Sprout size={32} className="text-amber-500" />;
        default: return <Plane size={32} />;
     }
  };

  const handleServiceSelect = (service: DroneService) => {
     setSelectedService(service);
     setActiveStep('details');
  };

  const handleConfirm = () => {
     alert("Booking Confirmed! Pilot will contact you shortly.");
     setActiveStep('select');
     setSelectedService(null);
     setAcres('');
     setDate('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 to-cyan-900 overflow-hidden text-white p-8 md:p-12 mb-10 shadow-2xl">
         <div className="absolute top-0 right-0 opacity-10">
             <Plane size={300} strokeWidth={0.5} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 text-xs font-bold mb-4 uppercase tracking-wider">
               <Scan size={14} /> Precision Agriculture
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{t.drone_title || "Drone Services"}</h1>
            <p className="text-cyan-100 text-lg leading-relaxed mb-8">
               Deploy advanced aerial technology for your farm. Book certified pilots for spraying, mapping, and health monitoring.
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
                  <ShieldCheck size={18} className="text-green-400" /> Govt Approved
               </div>
               <div className="flex items-center gap-2 text-sm font-bold bg-white/10 backdrop-blur px-4 py-2 rounded-xl">
                  <UserCheck size={18} className="text-cyan-400" /> Certified Pilots
               </div>
            </div>
         </div>
      </div>

      {/* STEP 1: SELECT SERVICE */}
      {activeStep === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
           {services.map(service => (
              <button 
                key={service.id} 
                onClick={() => handleServiceSelect(service)}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-transparent hover:border-cyan-500 dark:hover:border-cyan-500 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-left group h-full flex flex-col"
              >
                 <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {getServiceIcon(service.iconType)}
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{service.title}</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">{service.description}</p>
                 
                 <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-cyan-700 dark:text-cyan-400">{service.costPerAcre}<span className="text-xs text-slate-400 font-normal">/acre</span></span>
                    <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                       <ArrowRight size={16} />
                    </div>
                 </div>
              </button>
           ))}
        </div>
      )}

      {/* STEP 2: DETAILS */}
      {activeStep === 'details' && selectedService && (
         <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm">
                     {getServiceIcon(selectedService.iconType)}
                  </div>
                  <div>
                     <h3 className="font-bold text-xl text-slate-900 dark:text-white">{selectedService.title}</h3>
                     <p className="text-xs text-slate-500">Step 1 of 3: Farm Details</p>
                  </div>
               </div>
               <button onClick={() => setActiveStep('select')} className="text-sm font-bold text-slate-500 hover:text-slate-800">Change</button>
            </div>

            <div className="p-8 space-y-6">
               <div className="bg-cyan-50 dark:bg-cyan-900/10 p-4 rounded-xl border border-cyan-100 dark:border-cyan-900/30">
                  <h4 className="text-sm font-bold text-cyan-900 dark:text-cyan-100 mb-2 uppercase tracking-wide">Key Benefits</h4>
                  <ul className="space-y-2">
                     {selectedService.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-cyan-800 dark:text-cyan-200">
                           <CheckCircle2 size={14} className="text-cyan-500" /> {b}
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Area (Acres)</label>
                     <div className="relative">
                        <input 
                           type="number" 
                           value={acres} 
                           onChange={e => setAcres(e.target.value)} 
                           className="w-full p-3 pl-4 pr-12 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-lg" 
                           placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Acres</span>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date</label>
                     <div className="relative">
                        <input 
                           type="date" 
                           value={date} 
                           onChange={e => setDate(e.target.value)} 
                           className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium" 
                        />
                     </div>
                  </div>
               </div>

               {acres && (
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                     <span className="text-slate-500 font-medium">Estimated Cost</span>
                     <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{(parseFloat(acres) * parseInt(selectedService.costPerAcre.replace('₹',''))).toLocaleString()}
                     </span>
                  </div>
               )}

               <button 
                  onClick={() => setActiveStep('pilots')} 
                  disabled={!acres || !date}
                  className="w-full py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
               >
                  Find Pilots <ArrowRight size={20} />
               </button>
            </div>
         </div>
      )}

      {/* STEP 3: PILOTS */}
      {activeStep === 'pilots' && selectedService && (
         <div className="space-y-6 animate-slide-up">
            <button onClick={() => setActiveStep('details')} className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-2 mb-4">
               ← Back
            </button>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Available Pilots Nearby</h3>
            
            <div className="grid gap-4">
               {pilots.map(pilot => (
                  <div key={pilot.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:border-cyan-400 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                           <UserCheck size={32} className="text-slate-400" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg text-slate-900 dark:text-white">{pilot.name}</h4>
                              {pilot.isVerified && <ShieldCheck size={16} className="text-green-500" />}
                           </div>
                           <p className="text-sm text-slate-500">{pilot.droneModel} • {pilot.completedJobs} Jobs Done</p>
                           <div className="flex items-center gap-4 mt-1 text-xs font-bold">
                              <span className="text-yellow-500 flex items-center gap-1">★ {pilot.rating}</span>
                              <span className="text-slate-400 flex items-center gap-1"><MapPin size={12} /> {pilot.distance}</span>
                           </div>
                        </div>
                     </div>
                     <button 
                        onClick={() => { setSelectedPilot(pilot); setActiveStep('confirm'); }}
                        className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity min-w-[120px]"
                     >
                        Select
                     </button>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* STEP 4: CONFIRM */}
      {activeStep === 'confirm' && selectedService && selectedPilot && (
         <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 text-center animate-slide-up">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
               <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Confirm Booking?</h2>
            <p className="text-slate-500 mb-8">
               You are booking <strong>{selectedService.title}</strong> with <strong>{selectedPilot.name}</strong> for <strong>{acres} acres</strong> on <strong>{date}</strong>.
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-8 text-left">
               <div className="flex justify-between mb-2 text-sm">
                  <span className="text-slate-500">Service Cost</span>
                  <span className="font-bold">₹{(parseFloat(acres) * parseInt(selectedService.costPerAcre.replace('₹',''))).toLocaleString()}</span>
               </div>
               <div className="flex justify-between mb-2 text-sm">
                  <span className="text-slate-500">Booking Fee</span>
                  <span className="font-bold">₹50</span>
               </div>
               <div className="border-t border-slate-200 dark:border-slate-700 my-2 pt-2 flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>₹{(parseFloat(acres) * parseInt(selectedService.costPerAcre.replace('₹','')) + 50).toLocaleString()}</span>
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setActiveStep('pilots')} className="flex-1 py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Back
               </button>
               <button onClick={handleConfirm} className="flex-1 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200 dark:shadow-none">
                  Confirm Booking
               </button>
            </div>
         </div>
      )}
    </div>
  );
};
