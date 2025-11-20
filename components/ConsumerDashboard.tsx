
import React, { useState } from 'react';
import { ShoppingBag, MapPin, Star, Heart, Search, Filter, Truck, CheckCircle2, Sprout, Info, User, X, ShieldCheck, Phone, ArrowRight, QrCode } from 'lucide-react';

interface ConsumerDashboardProps {
  t: any;
  userLocation: { lat: number; lng: number } | null;
}

// Mock Data for Marketplace
const products = [
  { id: 1, name: "A2 Gir Cow Milk", farmer: "Ramesh Dairy", price: "₹85/L", dist: "2 km", img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=300&h=300", quality: "Organic", harvestTime: "Today 5:00 AM", story: "We have 15 Gir cows fed on organic fodder. No hormones used.", verified: true },
  { id: 2, name: "Organic Tomatoes", farmer: "Kisan Organics", price: "₹40/kg", dist: "5 km", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300&h=300", quality: "Pesticide Free", harvestTime: "Yesterday", story: "Grown in polyhouse with drip irrigation in Nashik.", verified: true },
  { id: 3, name: "Desi Ghee (500ml)", farmer: "Village Co-op", price: "₹650", dist: "12 km", img: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&q=80&w=300&h=300", quality: "Bilona Method", harvestTime: "Fresh Stock", story: "Hand-churned by the women's self-help group.", verified: false },
  { id: 4, name: "Fresh Spinach", farmer: "Green Farm", price: "₹20/bundle", dist: "3 km", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=300&h=300", quality: "Hydroponic", harvestTime: "Today 7:00 AM", story: "Soil-less farming, 100% clean leaves.", verified: true },
  { id: 5, name: "Alphanso Mangoes", farmer: "Ratnagiri Direct", price: "₹1200/doz", dist: "Shipped", img: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=300&h=300", quality: "GI Tagged", harvestTime: "2 Days Ago", story: "Naturally ripened in hay, no carbide.", verified: true },
  { id: 6, name: "Brown Eggs (Tray)", farmer: "Poultry Best", price: "₹240", dist: "4 km", img: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&q=80&w=300&h=300", quality: "Free Range", harvestTime: "Today", story: "Chickens roam free in our orchard.", verified: false },
];

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ t, userLocation }) => {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  return (
    <div className="bg-transparent min-h-screen pb-20">
      {/* Hero / Search */}
      <div className="bg-white dark:bg-slate-900 pb-8 pt-6 px-4 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 dark:border-slate-800 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                 <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">Fresh from Farm 🚜</h1>
                 <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
                    Direct from verified farmers. Trace your food origin.
                 </p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                 <MapPin size={14} className="text-red-500" /> {userLocation ? "Nashik (Detected)" : "Select Location"}
              </div>
           </div>

           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search milk, vegetables, ghee..." 
                className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm text-sm md:text-base"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                 <Filter size={18} className="text-slate-600 dark:text-slate-300" />
              </button>
           </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 py-8">
         <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Shop by Category</h3>
         </div>
         <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {['All', 'Dairy', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Honey'].map((cat, i) => (
               <button key={i} className={`px-6 py-3 rounded-xl whitespace-nowrap font-bold text-sm transition-all shadow-sm ${i === 0 ? 'bg-green-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-green-500 hover:text-green-600'}`}>
                  {cat}
               </button>
            ))}
         </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-5xl mx-auto px-4">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
               <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all group border border-slate-100 dark:border-slate-800 flex flex-col">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 cursor-pointer" onClick={() => setSelectedProduct(item)}>
                     <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                     <button className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-rose-500 shadow-sm hover:scale-110 transition-transform z-10">
                        <Heart size={16} />
                     </button>
                     <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-bold flex items-center gap-1">
                        <Sprout size={10} className="text-green-400" /> {item.quality}
                     </div>
                  </div>
                  
                  <div className="flex-grow cursor-pointer" onClick={() => setSelectedProduct(item)}>
                     <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1 truncate">{item.name}</h4>
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                           <User size={12} className="text-blue-500" /> {item.farmer}
                           {item.verified && <CheckCircle2 size={10} className="text-blue-500 fill-white" />}
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{item.dist}</span>
                     </div>
                     <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <Info size={12} /> Harvested: {item.harvestTime}
                     </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                     <span className="font-extrabold text-lg text-slate-900 dark:text-slate-100">{item.price}</span>
                     <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                        Add <ShoppingBag size={14} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* "Meet the Farmer" Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-slide-up">
              <div className="relative h-40 bg-green-600">
                 <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover opacity-50" />
                 <button 
                   onClick={() => setSelectedProduct(null)}
                   className="absolute top-4 right-4 w-10 h-10 bg-black/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/40 transition-colors"
                 >
                    <X size={20} />
                 </button>
                 <div className="absolute -bottom-10 left-8">
                    <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-slate-100 shadow-md overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" />
                    </div>
                 </div>
              </div>
              
              <div className="pt-12 px-8 pb-8">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {selectedProduct.farmer} 
                          {selectedProduct.verified && <CheckCircle2 size={20} className="text-blue-500 fill-blue-50" />}
                       </h2>
                       <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                          <MapPin size={14} /> Nashik District, MH
                       </p>
                    </div>
                    <div className="text-right">
                       <div className="flex items-center gap-1 text-yellow-500 font-bold">
                          <Star size={16} fill="currentColor" /> 4.9
                       </div>
                       <span className="text-xs text-slate-400">150+ Orders</span>
                    </div>
                 </div>

                 <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-6 border border-green-100 dark:border-green-800">
                    <h3 className="font-bold text-green-800 dark:text-green-200 text-sm uppercase mb-2 flex items-center gap-2">
                       <Sprout size={16} /> Farm Story
                    </h3>
                    <p className="text-green-900 dark:text-green-100 text-sm leading-relaxed">
                       {selectedProduct.story}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                       <span className="text-xs text-slate-500 uppercase font-bold">Harvested</span>
                       <p className="font-bold text-slate-900 dark:text-white">{selectedProduct.harvestTime}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                       <span className="text-xs text-slate-500 uppercase font-bold">Quality</span>
                       <p className="font-bold text-slate-900 dark:text-white">{selectedProduct.quality}</p>
                    </div>
                 </div>

                 <div className="flex gap-3">
                    <button className="flex-1 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                       Buy Now <span className="text-xs opacity-70">({selectedProduct.price})</span>
                    </button>
                    <button className="px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                       <Phone size={20} />
                    </button>
                 </div>

                 <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <QrCode size={12} /> Scan to view Traceability Certificate
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Trust Badge */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
         <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl">
            <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
               <h3 className="text-2xl font-display font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                 <ShieldCheck className="text-green-400" /> Certified Traceable
               </h3>
               <p className="text-slate-300 max-w-lg text-sm leading-relaxed">
                  Every product on AgriScan AI is traceable to its root. 
                  Scan the QR code on delivery to see the soil health report of the farm.
               </p>
            </div>
            <button className="relative z-10 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors inline-flex items-center gap-2 shadow-lg text-sm">
               View Certification Standards <ArrowRight size={16} />
            </button>
            
            {/* Deco */}
            <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
         </div>
      </div>
    </div>
  );
};