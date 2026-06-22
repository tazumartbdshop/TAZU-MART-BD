import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Star, Heart, ShoppingCart, Eye, 
  MessageCircle, Phone, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore, resolveCategoryThumbnail } from '../store/useCategoryStore';
import { useProductStore } from '../store/useProductStore';
import { useBannerStore } from '../store/useBannerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatPrice } from '../lib/utils';
import { CompactProductCard } from '../components/product/CompactProductCard';
import { motion, AnimatePresence } from 'motion/react';

// Premium Fallback Banners (Only image, no text overlays)
const PRESET_TOP_SLIDERS = [
  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1920&h=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1627124118303-19d4f0735f5e?q=80&w=1920&h=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1920&h=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=1920&h=1080&auto=format&fit=crop"
];

const PRESET_FEATURED_BANNER = "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1500&h=500&auto=format&fit=crop";
const PRESET_PROMOTIONAL_BANNER = "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?q=80&w=1600&h=400&auto=format&fit=crop";

const CUSTOMER_TESTIMONIALS = [
  {
    name: "Md. Sajjadul Islam",
    location: "Dhaka",
    rating: 5,
    comment: "The mechanical automatic watch build with real leather casing is masterpiece. Extremely fast and secure delivery inside Dhaka.",
    date: "14 May 2026"
  },
  {
    name: "Imran Chowdhury",
    location: "Chittagong",
    rating: 5,
    comment: "Genuinely surprised by the wallet craftsmanship. Genuine stitched leather details, plenty of card holdings. Incredibly premium.",
    date: "03 June 2026"
  },
  {
    name: "Dr. Farhana Ahmed",
    location: "Sylhet",
    rating: 5,
    comment: "Gifted the luxury collection set to my husband. The packaging, box leather, and premium clock mechanisms are outstanding.",
    date: "10 June 2026"
  },
  {
    name: "Asif Faisal",
    location: "Khulna",
    rating: 5,
    comment: "Amazing customer support and genuine watch product warranty. Recommended to anyone looking for premium watches in BD.",
    date: "15 June 2026"
  }
];

export default function Home() {
  const { categories, isLoaded: categoriesLoaded } = useCategoryStore();
  const { products, isLoading: productsLoading } = useProductStore();
  const { banners: storeBanners } = useBannerStore();
  const { settings } = useSettingsStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeReview, setActiveReview] = useState(0);

  // Dynamic active database categories mapped inside the exact home format
  const activeDbCategories = (categories || [])
    .filter(c => c && (c.status === 'Active' || (c.status as string) === 'active' || !c.status))
    .sort((a, b) => {
      const orderA = a.displayOrder !== undefined && a.displayOrder !== null && Number(a.displayOrder) !== 0 ? Number(a.displayOrder) : Infinity;
      const orderB = b.displayOrder !== undefined && b.displayOrder !== null && Number(b.displayOrder) !== 0 ? Number(b.displayOrder) : Infinity;
      return orderA - orderB;
    });

  // Load dynamic categories completely from the database, eliminating hardcoded fallback presets as per instructions
  const homeCategories = activeDbCategories.map(cat => ({
    name: cat.name,
    image: resolveCategoryThumbnail(cat),
    link: `/category/${cat.id}`
  }));

  // Filter Active Banners from DB
  const uploadedBanners = (storeBanners || [])
    .filter(b => b && b.status === 'active' && b.image && b.image.trim() !== '')
    .map(b => b.image);

  // If DB banners are set, use them, otherwise use stunning default watch/wallet images
  const sliderBanners = uploadedBanners.length > 0 ? uploadedBanners : PRESET_TOP_SLIDERS;

  // Auto-play for 16:9 banner slider
  useEffect(() => {
    if (sliderBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliderBanners.length]);

  // Auto-play for testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % CUSTOMER_TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper to matching database Category IDs
  const getCategoryRoute = (term: string) => {
    const matched = categories.find(c => 
      c.name.toLowerCase().includes(term.toLowerCase()) || 
      (c.slug && c.slug.toLowerCase().includes(term.toLowerCase()))
    );
    return matched ? `/category/${matched.id}` : `/search?q=${encodeURIComponent(term)}`;
  };

  // Filter active valid products
  const activeProducts = products.filter(p => {
    if (!p) return false;
    const status = (p.status || '').toString().toLowerCase().trim();
    if (status === 'inactive' || status === 'draft' || status === 'hidden') return false;
    return true;
  });

  // Section items (Dynamic filters with smart database-first fallbacks)
  let trendingProducts = activeProducts.filter(p => p.is_trending).slice(0, 4);
  // Auto-fill trendingProducts if empty but we have active products
  if (trendingProducts.length === 0 && activeProducts.length > 0) {
    trendingProducts = activeProducts.slice(0, 4);
  }

  let newArrivals = activeProducts.filter(p => p.isNew || p.is_regular).slice(0, 4);
  // Auto-fill newArrivals if empty but we have active products
  if (newArrivals.length === 0 && activeProducts.length > 0) {
    newArrivals = [...activeProducts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  }

  let bestSellers = activeProducts.filter(p => p.is_best_selling).slice(0, 4);
  // Auto-fill bestSellers if empty but we have active products
  if (bestSellers.length === 0 && activeProducts.length > 0) {
    bestSellers = [...activeProducts].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0) || (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  }

  // Solid Fallbacks ONLY if database is completely empty (allows pristine presentation)
  const showFallbackProducts = activeProducts.length === 0;

  const fallbackTrending = [
    { id: 'f-1', name: 'Luxury Skeleton Automatic Dark Watch', price: 8500, discountPrice: 6500, image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600', rating: 4.9, category: 'Watches', soldCount: 380 },
    { id: 'f-2', name: 'Vintage Full-Grain Finished Leather Wallet', price: 3400, discountPrice: 2450, image: 'https://images.unsplash.com/photo-1627124118303-19d4f0735f5e?q=80&w=600', rating: 4.8, category: 'Wallets', soldCount: 220 },
    { id: 'f-3', name: 'Classic Silver Chronometer Executive', price: 12000, discountPrice: 9800, image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600', rating: 5.0, category: 'Watches', soldCount: 150 },
    { id: 'f-4', name: 'Gold Dial Luxury Royal Heritage mechanical', price: 15500, discountPrice: 13500, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600', rating: 4.9, category: 'Watches', soldCount: 95 }
  ];

  const fallbackNew = [
    { id: 'fn-1', name: 'Handcrafted Stitch Minimalist Cardholder', price: 1800, discountPrice: 1200, image: 'https://images.unsplash.com/photo-1588444839799-eaa4344ecc1e?q=80&w=600', rating: 4.7, category: 'Wallets', soldCount: 110 },
    { id: 'fn-2', name: 'Presidential Gold Mesh Strap Limited Edition', price: 17500, discountPrice: 14900, image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600', rating: 4.9, category: 'Watches', soldCount: 65 },
    { id: 'fn-3', name: 'Tazu Executive Gift Dual Pen & Watch Set', price: 9500, discountPrice: 7200, image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600', rating: 5.0, category: 'Gift Set', soldCount: 45 },
    { id: 'fn-4', name: 'Tactical Matte Black Stealth Chrono', price: 5500, discountPrice: 4200, image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600', rating: 4.6, category: 'Watches', soldCount: 140 }
  ];

  const renderProductList = (items: any[], fallbackItems: any[]) => {
    const renderList = items.length > 0 ? items : fallbackItems;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {renderList.map((prod) => (
          <div key={prod.id} className="h-full">
            <CompactProductCard product={{
              ...prod,
              imageUrl: prod.imageUrl || prod.image || null
            }} />
          </div>
        ))}
      </div>
    );
  };

  const whatsappNumber = (settings.whatsappNumber || "8801314541738").replace(/[^0-9]/g, '');
  const hotlineNumber = settings.hotlineNumber || settings.contactNumber || settings.phone || "+8801314541738";

  return (
    <div className="bg-neutral-50/50 min-h-screen pb-12 overflow-x-hidden font-sans">
      
      {/* 1. MAIN SLIDER BANNER (16:9, Pure Images, Center Focus) */}
      <section className="relative w-full aspect-[16/9] bg-neutral-950 overflow-hidden select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={sliderBanners[activeSlide]} 
              alt="Luxury Banner Graphic" 
              className="w-full h-full object-cover object-center pointer-events-none select-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Previous and Next Navigation Arrows */}
        {sliderBanners.length > 1 && (
          <>
            <button 
              onClick={() => setActiveSlide((prev) => (prev - 1 + sliderBanners.length) % sliderBanners.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition-all z-20 active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveSlide((prev) => (prev + 1) % sliderBanners.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/70 transition-all z-20 active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Custom Dot Bullets */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-25">
              {sliderBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. CATEGORY SECTION (Circular shape, completely database-driven) */}
      <section className="bg-white py-6 border-b border-neutral-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
        <div className="container mx-auto px-4">
          {!categoriesLoaded ? (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 mx-auto max-w-2xl justify-items-center">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col items-center animate-pulse text-center">
                  <div className="w-[16vw] h-[16vw] max-w-[100px] max-h-[100px] min-w-[64px] min-h-[64px] rounded-full bg-neutral-100 border border-neutral-100 flex items-center justify-center" />
                  <div className="h-2.5 w-12 bg-neutral-100 rounded mt-2.5" />
                </div>
              ))}
            </div>
          ) : homeCategories.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 mx-auto max-w-2xl">
              {homeCategories.map((cat, i) => (
                <Link 
                  key={i} 
                  to={cat.link}
                  className="flex flex-col items-center group select-none text-center"
                >
                  <div className="relative w-[16vw] h-[16vw] max-w-[100px] max-h-[100px] min-w-[64px] min-h-[64px] rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-black/25 group-hover:shadow-md">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase text-neutral-800 tracking-wider mt-2.5 transition-colors group-hover:text-black leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">No active categories found in database</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. FEATURED BANNER (Ratio: 3:1, Size: 1500x500px, Image only) */}
      <section className="py-6 md:py-8 container mx-auto px-4">
        <Link to="/shop" className="block relative w-full aspect-[3/1] rounded-2xl overflow-hidden shadow-md group border border-neutral-100">
          <img 
            src={PRESET_FEATURED_BANNER} 
            alt="Featured Collection Watch Banner" 
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02] select-none pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </Link>
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section className="py-6 md:py-8 container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-neutral-900 font-display">Trending Collections</h2>
          </div>
          <Link 
            to="/shop" 
            className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
          >
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {renderProductList(trendingProducts, fallbackTrending)}
      </section>

      {/* 5. PROMOTIONAL BANNER (Ratio: 4:1, Size: 1600x400px, Lifestyle image only) */}
      <section className="py-4 md:py-6 container mx-auto px-4">
        <Link to="/shop" className="block relative w-full aspect-[4/1] rounded-2xl overflow-hidden shadow-sm group border border-neutral-100">
          <img 
            src={PRESET_PROMOTIONAL_BANNER} 
            alt="Lifestyle watch craftsmanship" 
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.01] select-none"
            referrerPolicy="no-referrer"
          />
        </Link>
      </section>

      {/* 6. NEW ARRIVALS */}
      <section className="py-6 md:py-8 container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-neutral-900 font-display">New Arrivals</h2>
          </div>
          <Link 
            to="/shop" 
            className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {renderProductList(newArrivals, fallbackNew)}
      </section>

      {/* 7. BEST SELLERS */}
      <section className="py-6 md:py-8 container mx-auto px-4">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-900" />
            <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-neutral-900 font-display">Best Sellers</h2>
          </div>
          <Link 
            to="/shop" 
            className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
          >
            All Best Sellers <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {renderProductList(bestSellers, fallbackTrending)}
      </section>

      {/* 8. CUSTOMER REVIEW SECTION (Height: 250-300px, beautiful cards) */}
      <section className="py-8 bg-neutral-900 text-white select-none">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="text-center mb-6">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400">Trusted By Thousands</span>
            <h2 className="text-base md:text-lg font-black uppercase tracking-wider mt-1 font-display">Customer Feedback</h2>
          </div>

          <div className="h-[140px] md:h-[130px] flex flex-col justify-center text-center px-4 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReview}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                {/* 5-Star Feedback */}
                <div className="flex justify-center items-center gap-1 text-amber-400">
                  {[...Array(CUSTOMER_TESTIMONIALS[activeReview].rating)].map((_, i) => (
                    <Star key={i} className="w-4.5 h-4.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs md:text-sm font-medium text-neutral-200 italic leading-relaxed line-clamp-3 px-2">
                  " {CUSTOMER_TESTIMONIALS[activeReview].comment} "
                </p>
                <div className="pt-1">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-white leading-tight">
                    {CUSTOMER_TESTIMONIALS[activeReview].name}
                  </h4>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                    {CUSTOMER_TESTIMONIALS[activeReview].location} • {CUSTOMER_TESTIMONIALS[activeReview].date}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Testimonial Select Dots */}
          <div className="flex justify-center items-center gap-1.5 mt-4">
            {CUSTOMER_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveReview(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeReview ? 'w-5 bg-white' : 'w-1.5 bg-neutral-600'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION (WhatsApp + Call Actions) */}
      <section className="py-8 container mx-auto px-4 max-w-sm">
        <div className="bg-white rounded-2xl border border-neutral-150 p-5 shadow-sm text-center">
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-900 shadow-sm shrink-0">
               <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-neutral-900 leading-tight">Authentic Customer Support</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5 mb-5">Have queries? Talk directly with our team</p>
          
          <div className="grid grid-cols-2 gap-3">
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-11 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 text-center"
            >
              <MessageCircle className="w-4 h-4 shrink-0 fill-white" /> WhatsApp
            </a>
            <a 
              href={`tel:${hotlineNumber}`}
              className="flex items-center justify-center gap-2 h-11 px-4 bg-black hover:bg-neutral-800 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 text-center"
            >
              <Phone className="w-4 h-4 shrink-0 fill-white" /> Direct Call
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
