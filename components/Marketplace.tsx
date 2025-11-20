
import React, { useState } from 'react';
import { Store, UserCheck, MapPin, Phone, Plus, Tag, Calendar, Package, Search, CheckCircle2, Building2, Users } from 'lucide-react';
import { findPotentialBuyers } from '../services/gemini';
import { BuyerProfile, MarketListing } from '../types';

interface Props {
  t: any;
  languageCode: string;
  userLocation: { lat: number; lng: number } | null;
}

export const Marketplace: React.FC<Props> = ({ t, languageCode, userLocation }) => {
  const [activeTab, setActiveTab] = useState<'sell' | 'matches' | 'listings'>('sell');
  
  // Listing Form
  const [form, setForm] = useState({
    crop: '',
    variety: '',
    quantity: '',
    price: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [listings, setListings] = useState<MarketListing[]>([]);

  // Matching
  const [matches, setMatches] = useState<BuyerProfile[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const handlePostListing = async () => {
    if (!form.crop || !form.quantity || !form.price) return;

    // Save to local "Listings" state
    const newListing: MarketListing = {
      id: Date.now().toString(),
      crop: form.crop,
      variety: form.variety,
      quantity: form.quantity,
      price: form.price,
      date: new Date(form.date),
      status: 'Active'
    };
    setListings(prev => [newListing, ...prev]);
    
    // Automatically switch to find matches
    setActiveTab('matches');
    await fetchMatches(form.crop, form.quantity);
  };

  const fetchMatches = async (crop: string, qty: string) => {
    setLoadingMatches(true);
    try {
      const lang = languageCode === 'hi' ? 'Hindi' : 'English';
      const buyers = await findPotentialBuyers(crop, qty, userLocation, lang);
      setMatches(buyers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMatches(false);
    }
  };

  const getBuyerIcon = (type: string) => {
    switch(type) {
      case 'FPO': return <Users className="text-emerald-600" />;
      case 'Company': return <Building2 className="text-blue-600" />;
      default: return <Store className="text-orange-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4">
          <Store size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.market_title || "Direct Marketplace"}</h2>
        <p className="text-slate-500">{t.market_desc || "Connect directly with buyers, FPOs & traders."}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 inline-flex shadow-sm">
          <button onClick={() => setActiveTab('sell')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'sell' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-slate-500'}`}>
            <Plus size={16} /> Sell Produce
          </button>
          <button onClick={() => setActiveTab('matches')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'matches' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-slate-500'}`}>
            <UserCheck size={16} /> Buyer Matches
          </button>
          <button onClick={() => setActiveTab('listings')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'listings' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-slate-500'}`}>
            <Tag size={16} /> My Listings
          </button>
        </div>
      </div>

      {/* SELL TAB */}
      {activeTab === 'sell' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl mx-auto shadow-sm">
           <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <Package className="text-emerald-500" /> Post New Listing
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Crop Name</label>
                 <input type="text" value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="e.g. Tomato" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Variety (Optional)</label>
                 <input type="text" value={form.variety} onChange={e => setForm({...form, variety: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="e.g. Desi" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity (Quintals)</label>
                 <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="e.g. 50" />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Expected Price / Qt</label>
                 <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" placeholder="e.g. 2500" />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Harvest Date</label>
                 <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              </div>
           </div>
           <button onClick={handlePostListing} disabled={!form.crop || !form.quantity} className="w-full mt-6 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50">
              Post & Find Buyers
           </button>
        </div>
      )}

      {/* MATCHES TAB */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
           {loadingMatches ? (
             <div className="text-center py-20">
                <Search className="mx-auto text-emerald-400 mb-4 animate-bounce" size={48} />
                <p className="text-slate-500 font-medium">Searching for verified buyers & FPOs nearby...</p>
             </div>
           ) : matches.length > 0 ? (
             <div className="grid gap-4">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="font-bold text-slate-900 dark:text-white">Matched Buyers for {form.crop || "Your Crop"}</h3>
                   <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{matches.length} Found</span>
                </div>
                {matches.map((buyer, i) => (
                   <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start">
                         <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                               {getBuyerIcon(buyer.type)}
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">{buyer.name}</h4>
                                  {buyer.confidence === 'Verified' && (
                                     <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold border border-blue-200">
                                        <CheckCircle2 size={10} /> Verified
                                     </span>
                                  )}
                               </div>
                               <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{buyer.type} • {buyer.distance}</span>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs text-slate-400 uppercase font-bold">Offer Price</p>
                            <p className="text-xl font-bold text-emerald-600">{buyer.priceOffer}</p>
                         </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4 text-sm text-slate-600 dark:text-slate-300">
                         <p className="flex-1 italic">"{buyer.notes}"</p>
                         <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                               <MapPin size={16} className="text-slate-400" />
                               <span className="truncate max-w-[150px]">{buyer.contactInfo}</span>
                            </div>
                            <button className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors">
                               <Phone size={18} />
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
           ) : (
             <div className="text-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Store size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No listings posted yet. Post a listing to find buyers.</p>
                <button onClick={() => setActiveTab('sell')} className="mt-4 text-emerald-600 font-bold hover:underline">Go to Sell Tab</button>
             </div>
           )}
        </div>
      )}

      {/* LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
           {listings.length === 0 ? (
              <div className="text-center p-12 text-slate-500">
                 <p>You haven't posted any crops for sale yet.</p>
              </div>
           ) : (
              listings.map((item) => (
                 <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xl">
                          {item.crop.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{item.crop} {item.variety && `(${item.variety})`}</h4>
                          <p className="text-sm text-slate-500">{item.quantity} Quintals • ₹{item.price}/Qt</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold mb-1">
                          {item.status}
                       </span>
                       <p className="text-xs text-slate-400">{item.date.toLocaleDateString()}</p>
                    </div>
                 </div>
              ))
           )}
        </div>
      )}

    </div>
  );
};
