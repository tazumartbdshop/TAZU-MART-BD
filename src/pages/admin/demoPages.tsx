import React from 'react';
import { Search, ShoppingBag, Check, Star, Menu, Package, Truck, Shield, LayoutGrid, Smartphone, ArrowRight, Zap, ShoppingCart, Activity } from 'lucide-react';

export const IMAGES = {
  fashion: {
    hero: "https://images.unsplash.com/photo-1441996607285-ed334f6c101b?w=1200&q=80",
    banner: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=60", // Medium banner
    products: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80",
      "https://images.unsplash.com/photo-1434389678369-182cb2088f11?w=400&q=80",
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=400&q=80"
    ]
  },
  tech: {
    hero: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
    banner: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60",
    products: [
      "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=400&q=80"
    ]
  },
  luxury: {
    hero: "https://images.unsplash.com/photo-1508685096489-7aac29325a90?w=1200&q=80",
    banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=60",
    products: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",
      "https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=400&q=80",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=400&q=80"
    ]
  }
};

const CATEGORIES = ["Smartphone", "Lifestyle", "Fashion", "Health", "Automotive", "Daily Needs"];

export function ShortcutHomepage({ device, template }: any) {
  const id = template.id;
  const isDark = id.includes('dark') || id.includes('black');
  const accentColor = id === 'dark-gadget' ? 'bg-blue-600' : id === 'premium-black' ? 'bg-amber-600' : id === 'mkt-lite' ? 'bg-orange-600' : 'bg-black';
  const textColorAccent = id === 'dark-gadget' ? 'text-blue-600' : id === 'premium-black' ? 'text-amber-500' : id === 'mkt-lite' ? 'text-orange-600' : 'text-black';
  
  const getTemplateImages = () => {
    if (id.includes('gadget') || id.includes('tech')) return IMAGES.tech;
    if (id.includes('premium') || id.includes('luxury')) return IMAGES.luxury;
    return IMAGES.fashion;
  };

  const images = getTemplateImages();
  
  // Local state for interactive VIEW ALL inside template preview!
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  if (selectedCategory) {
    const listCount = 12; // Show 12 items for View All
    return (
      <div className={`min-h-max font-sans pb-10 text-left px-4 sm:px-6 ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-black'}`}>
        <div className="py-6 border-b border-zinc-100 mb-6 flex justify-between items-center">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-zinc-200 px-3 py-2 bg-white text-black hover:bg-zinc-50 transition-colors"
          >
            ← Back to Store Home
          </button>
          <span className="text-xs font-mono font-bold text-gray-400">DEMO VIEW ALL ACTIVE</span>
        </div>

        <h2 className="text-2xl font-black uppercase tracking-tight mb-8">
          Category: <span className={textColorAccent}>{selectedCategory}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: listCount }).map((_, idx) => {
            const n = idx + 1;
            return (
              <div key={n} className="group flex flex-col justify-between">
                <div className={`aspect-square w-full rounded-none overflow-hidden mb-3 relative border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                  <img 
                    src={images.products[(n-1) % images.products.length]} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    alt="Product"
                  />
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 flex items-center gap-1 border border-white/10">
                     <span className="text-[10px]">🎁</span>
                     <span className="text-[8px] font-black text-white uppercase tracking-tighter">+{n * 50} Coins</span>
                  </div>
                  <div className="absolute top-2 left-2 bg-red-650 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 uppercase rounded-none">-25%</div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-tight truncate line-clamp-1">{selectedCategory} Item {n}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                     <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>৳{(n*1200) - 200}</p>
                     <p className="text-[10px] font-bold text-gray-500 line-through">৳{n*1200}</p>
                  </div>
                </div>
                <button className={`w-full mt-3 py-2.5 text-[9px] font-black uppercase tracking-widest border border-zinc-200 hover:bg-black hover:text-white transition-all bg-white text-zinc-800`}>
                  Add To Cart
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-max font-sans pb-10 text-left ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-black'}`}>
      
      {/* Shortcut Hero Banner Redesigned to be SQUARE with SHARP CORNERS (no rounding, no curve edge, border-radius: 0px) */}
      <div className="p-0 sm:p-0">
        <div className={`aspect-[21/9] w-full min-h-[160px] rounded-none overflow-hidden relative ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`} style={{ borderRadius: '0px' }}>
          <img src={images.banner} className="w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
             <div>
               <span className={`${accentColor} text-white font-black text-[9px] px-2.5 py-1 uppercase tracking-widest`}>STORE FRONT EXCLUSIVE</span>
               <h2 className="text-xl sm:text-3xl font-black uppercase text-white tracking-tight mt-2">{id.replace('-', ' ')}</h2>
               <button className="mt-3 bg-white text-black px-5 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">Shop Now</button>
             </div>
          </div>
        </div>
      </div>

      {/* Category Rows Section (Flat Premium E-commerce inspired) */}
      <div className="space-y-12 py-10">
        {CATEGORIES.slice(0, id === 'multi-light' || id === 'mkt-lite' ? 6 : 3).map((cat, idx) => (
          <div key={idx} className="px-4 sm:px-6">
            
            {/* Category row header layout: Left is Title, Right is VIEW ALL */}
            <div className="flex justify-between items-end border-b border-zinc-100 pb-3 mb-6">
              <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900 border-l-4 border-black pl-3">{cat}</h2>
              <button 
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] font-black uppercase tracking-widest ${textColorAccent} flex items-center gap-1 hover:opacity-50 transition-all`}
              >
                VIEW ALL <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Grid Layout (2 columns mobile grid, displays up to 6 products limit) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="group flex flex-col justify-between" id={`demo-prod-card-${cat}-${n}`}>
                   <div className={`aspect-square w-full rounded-none overflow-hidden mb-3 relative border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`} style={{ borderRadius: '0px' }}>
                     <img 
                       src={images.products[(n-1)%images.products.length]} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                       alt="Product"
                     />
                     {/* Daraz Style Coin Badge */}
                     <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 flex items-center gap-1 border border-white/10">
                        <span className="text-[10px]">🎁</span>
                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Earn {n * 50} Coins</span>
                     </div>
                     <div className="absolute top-2 left-2 bg-red-650 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 uppercase">-25%</div>
                   </div>
                   <div>
                     <h3 className="text-xs font-black uppercase tracking-tight truncate line-clamp-1">{cat} Item {n}</h3>
                     <div className="flex items-center gap-1.5 mt-1">
                        <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-black'}`}>৳{(n*1200) - 200}</p>
                        <p className="text-[10px] font-bold text-gray-550 line-through text-gray-400">৳{n*1200}</p>
                     </div>
                   </div>
                   <button className={`w-full mt-3 py-2.5 text-[9px] font-black uppercase tracking-widest border border-zinc-200 hover:bg-black hover:text-white transition-all bg-white text-zinc-800`}>
                      Add To Cart
                   </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className={`mx-4 sm:mx-6 p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-50 border border-gray-100'}`} style={{ borderRadius: '0px' }}>
         {[
           {icon: Zap, t: "Instant Delivery", p: "Within 24 Hours"},
           {icon: Shield, t: "Official Warranty", p: "2 Years Protection"},
           {icon: ShoppingBag, t: "Authentic Store", p: "100% Original Products"},
           {icon: Truck, t: "Quick Returns", p: "Easy Doorstep Pick"}
         ].map((item, i) => (
           <div key={i} className="flex gap-4 items-center">
              <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${isDark ? 'bg-zinc-800 text-blue-400' : 'bg-white text-black shadow-sm'}`} style={{ borderRadius: '0px' }}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tight">{item.t}</p>
                <p className="text-[8px] font-bold text-gray-550 uppercase tracking-widest text-gray-500">{item.p}</p>
              </div>
           </div>
         ))}
      </div>

    </div>
  );
}

// Keep the specific exports for backward compatibility if needed, though ShortcutHomepage is the primary one now
export const MinimalHomepage = ShortcutHomepage;
export const GadgetHomepage = ShortcutHomepage;
export const SingleHomepage = ShortcutHomepage;
export const MultiHomepage = ShortcutHomepage;
