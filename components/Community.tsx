
import React, { useState } from 'react';
import { Users, MessageCircle, Heart, Share2, Star, MapPin, Phone, Search, PlusCircle, CheckCircle2, Briefcase, ShoppingBag, UserCheck, Image as ImageIcon } from 'lucide-react';
import { CommunityPost, ShopListing, WorkerProfile } from '../types';

interface CommunityProps {
  t: any;
  userLocation: { lat: number; lng: number } | null;
}

export const Community: React.FC<CommunityProps> = ({ t, userLocation }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'shops' | 'workers'>('feed');
  const [newPostContent, setNewPostContent] = useState('');

  // Mock Data: Posts
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: 'Ramesh Patil',
      role: 'Farmer',
      content: 'My cotton crop leaves are turning red. Is this a magnesium deficiency or pests? I have applied Urea last week.',
      image: 'https://images.unsplash.com/photo-1623227866882-c005c2681359?auto=format&fit=crop&q=80&w=500',
      likes: 24,
      comments: 5,
      timestamp: '2h ago',
      replies: [
        { author: 'Dr. Anil Kumar', text: 'This looks like leaf reddening due to Magnesium deficiency. Spray MgSO4 @ 10g/L water.', isExpert: true }
      ]
    },
    {
      id: '2',
      author: 'Suresh Reddy',
      role: 'Farmer',
      content: 'Successfully harvested 25 quintals of Maize per acre using the new hybrid seeds recommended by this app! 🌽',
      likes: 156,
      comments: 12,
      timestamp: '5h ago'
    }
  ]);

  // Mock Data: Shops
  const shops: ShopListing[] = [
    { id: 's1', name: 'Kisan Agro Center', type: 'Seeds & Fertilizers', rating: 4.8, reviewCount: 120, location: 'Main Road, Nashik', distance: '2 km', contact: '9876543210', isOpen: true },
    { id: 's2', name: 'Mahindra Tractor Sales', type: 'Machinery', rating: 4.5, reviewCount: 45, location: 'Highway 66', distance: '5 km', contact: '9876543211', isOpen: true },
    { id: 's3', name: 'Gayatri Pesticides', type: 'Pesticides', rating: 3.9, reviewCount: 22, location: 'Village Square', distance: '1.5 km', contact: '9876543212', isOpen: false },
  ];

  // Mock Data: Workers
  const workers: WorkerProfile[] = [
    { id: 'w1', name: 'Ravi & Team', skills: ['Harvesting', 'Threshing'], rate: '₹450/day', availability: 'Available', location: 'Dindori', phone: '9988776655', rating: 4.7 },
    { id: 'w2', name: 'Mangala Devi', skills: ['Weeding', 'Sowing'], rate: '₹350/day', availability: 'Busy', location: 'Pimple', phone: '9988776644', rating: 4.9 },
    { id: 'w3', name: 'Suresh Tractor', skills: ['Plowing', 'Transport'], rate: '₹1200/acre', availability: 'Available', location: 'Nashik', phone: '9988776633', rating: 4.6 },
  ];

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: 'You',
      role: 'Farmer',
      content: newPostContent,
      likes: 0,
      comments: 0,
      timestamp: 'Just now'
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
          <Users size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{t.community_title || "Farmer Community"}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.community_desc || "Discuss, Share & Grow Together."}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 inline-flex shadow-sm">
          <button 
            onClick={() => setActiveTab('feed')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'feed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-500'}`}
          >
            <MessageCircle size={16} /> {t.tab_feed || "Discussion"}
          </button>
          <button 
            onClick={() => setActiveTab('shops')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'shops' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-500'}`}
          >
            <ShoppingBag size={16} /> {t.tab_shops || "Shops"}
          </button>
          <button 
            onClick={() => setActiveTab('workers')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'workers' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-500'}`}
          >
            <Briefcase size={16} /> {t.tab_workers || "Labor"}
          </button>
        </div>
      </div>

      {/* FEED VIEW */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
           {/* Create Post */}
           <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <Users size={20} className="text-slate-500 dark:text-slate-400" />
                 </div>
                 <div className="flex-1">
                    <textarea 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={t.ask_doubt || "Ask a question or share something..."}
                      className="w-full bg-transparent border-none focus:ring-0 resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                      rows={2}
                    />
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                       <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors">
                          <ImageIcon size={16} /> {t.post_image || "Photo"}
                       </button>
                       <button 
                         onClick={handlePostSubmit}
                         disabled={!newPostContent.trim()}
                         className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                       >
                          Post
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* Posts List */}
           <div className="space-y-4">
              {posts.map(post => (
                 <div key={post.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold">
                          {post.author.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{post.author}</h4>
                          <p className="text-xs text-slate-500">{post.role} • {post.timestamp}</p>
                       </div>
                    </div>
                    
                    <p className="text-slate-700 dark:text-slate-300 text-sm mb-3 leading-relaxed">{post.content}</p>
                    
                    {post.image && (
                       <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                          <img src={post.image} alt="Post" className="w-full h-64 object-cover" />
                       </div>
                    )}

                    <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800">
                       <button className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 transition-colors text-sm font-medium">
                          <Heart size={18} /> {post.likes}
                       </button>
                       <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-500 transition-colors text-sm font-medium">
                          <MessageCircle size={18} /> {post.comments}
                       </button>
                       <button className="flex items-center gap-1.5 text-slate-500 hover:text-green-500 transition-colors text-sm font-medium ml-auto">
                          <Share2 size={18} />
                       </button>
                    </div>

                    {/* Expert Reply Highlight */}
                    {post.replies && post.replies.some(r => r.isExpert) && (
                       <div className="mt-4 bg-green-50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                          <div className="flex items-center gap-2 mb-1">
                             <CheckCircle2 size={14} className="text-green-600" />
                             <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">{t.verified_answer || "Expert Answer"}</span>
                          </div>
                          {post.replies.filter(r => r.isExpert).map((reply, i) => (
                             <div key={i}>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{reply.author}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{reply.text}</p>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* SHOPS VIEW */}
      {activeTab === 'shops' && (
        <div className="space-y-4 animate-slide-up">
           {!userLocation && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center text-amber-700 dark:text-amber-300 text-sm mb-4">
                 <MapPin size={16} className="inline mr-1" /> Enable location to see real shops near you. Showing demo data.
              </div>
           )}
           {shops.map(shop => (
              <div key={shop.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                       <h4 className="font-bold text-lg text-slate-900 dark:text-white">{shop.name}</h4>
                       {shop.rating >= 4.5 && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"><Star size={8} fill="currentColor" /> Top Rated</span>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{shop.type} • {shop.distance}</p>
                    <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                       <Star size={14} fill="currentColor" /> {shop.rating} <span className="text-slate-400 font-normal text-xs">({shop.reviewCount} reviews)</span>
                    </div>
                 </div>
                 <div className="flex flex-col gap-2 justify-center">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
                       <Phone size={16} /> Call Now
                    </button>
                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                       {t.rate_shop || "Rate Shop"}
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}

      {/* WORKERS VIEW */}
      {activeTab === 'workers' && (
        <div className="space-y-4 animate-slide-up">
           {workers.map(worker => (
              <div key={worker.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 font-bold text-lg border-2 border-indigo-100 dark:border-indigo-800">
                          {worker.name.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                             {worker.name}
                             {worker.rating > 4.5 && <UserCheck size={14} className="text-blue-500" />}
                          </h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                             <MapPin size={10} /> {worker.location}
                          </p>
                       </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${worker.availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {worker.availability}
                    </span>
                 </div>

                 <div className="flex flex-wrap gap-2 mb-4">
                    {worker.skills.map((skill, i) => (
                       <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                          {skill}
                       </span>
                    ))}
                 </div>

                 <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                       <p className="text-xs text-slate-400 uppercase font-bold">Daily Rate</p>
                       <p className="text-lg font-bold text-slate-900 dark:text-white">{worker.rate}</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2">
                       <Phone size={16} /> {t.hire_worker || "Hire"}
                    </button>
                 </div>
              </div>
           ))}
        </div>
      )}

    </div>
  );
};
