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
import CategoryBannerCarousel from '../components/home/CategoryBannerCarousel';
import { motion, AnimatePresence } from 'motion/react';

// Testimonial values are kept as they represent real customer feedback
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
    link: `/category/${cat.id || cat.slug || 'all'}`
  }));

  // Filter Active Banners from DB
  const uploadedBanners = (storeBanners || [])
    .filter(b => b && b.status === 'active' && b.image && b.image.trim() !== '');

  // If DB banners are set, use them, otherwise empty array as we do not use demo banners
  const sliderBanners = uploadedBanners;

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
    return matched ? `/category/${matched.id || matched.slug || 'all'}` : `/search?q=${encodeURIComponent(term)}`;
  };

  // Filter active valid products
  const activeProducts = products.filter(p => {
    if (!p) return false;
    const status = (p.status || '').toString().toLowerCase().trim();
    if (status === 'inactive' || status === 'draft' || status === 'hidden') return false;
    return true;
  });

  const finalProducts = activeProducts;

  // 1. Flash Sale
  const flashSaleProducts = finalProducts.filter(p => p.is_flash_sale);

  // 2. Trending Item
  const trendingProducts = finalProducts.filter(p => p.is_trending);

  // 3. Best Selling
  const bestSellingProducts = finalProducts.filter(p => p.is_best_selling);

  // 4. Offer Product
  const offerProducts = finalProducts.filter(p => p.is_offer);

  const renderProductGrid = (items: any[]) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6">
        {items.map((prod) => (
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

  const renderCategoryGrid = (items: any[]) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {items.map((prod) => (
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
    <div className="bg-neutral-50/50 min-h-screen pb-0 overflow-x-hidden font-sans">
      
      {/* 1. MAIN SLIDER BANNER (16:9, Dynamic Overlays and Optional Button Actions) */}
      {sliderBanners.length > 0 && (
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
              {/* Main Banner Image */}
              <img 
                src={sliderBanners[activeSlide].image} 
                alt={sliderBanners[activeSlide].name || "Luxury Banner Graphic"} 
                className="w-full h-full object-cover object-center pointer-events-none select-none"
                referrerPolicy="no-referrer"
              />

              {/* Text and CTA Button Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 px-4 md:px-12 z-10 select-text">
                <div className="max-w-2xl space-y-2 sm:space-y-4">
                  {sliderBanners[activeSlide].name && (
                    <motion.h2 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-wider drop-shadow-md font-sans"
                    >
                      {sliderBanners[activeSlide].name}
                    </motion.h2>
                  )}
                  
                  {sliderBanners[activeSlide].description && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                      className="text-white/90 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-widest max-w-xl drop-shadow-sm"
                    >
                      {sliderBanners[activeSlide].description}
                    </motion.p>
                  )}

                  {sliderBanners[activeSlide].buttonText && sliderBanners[activeSlide].buttonLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="pt-1.5 sm:pt-3"
                    >
                      <Link 
                        to={sliderBanners[activeSlide].buttonLink}
                        className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-black hover:bg-neutral-900 border border-white/20 hover:border-white/40 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-150 active:scale-95 shadow-lg"
                      >
                        {sliderBanners[activeSlide].buttonText}
                        <span className="text-[10px] sm:text-xs font-light">&rarr;</span>
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
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
      )}

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
            <div className="text-center py-6">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-400">No Categories Available</p>
            </div>
          )}
        </div>
      </section>

      {/* Products loading or empty state */}
      {productsLoading ? (
        <div className="flex flex-wrap items-center justify-center gap-6 mx-auto py-12">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="w-48 h-64 bg-neutral-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : activeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-2xl border border-neutral-100 max-w-md mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-100">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-neutral-900 font-display">Products Coming Soon</h3>
          <p className="text-[10px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1.5">We are updating our premium stock. Check back shortly!</p>
        </div>
      ) : null}

      {/* 4. DYNAMIC SPECIAL SECTIONS */}
      {/* 1) Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <section className="py-4 md:py-6 container mx-auto px-4 border-b border-neutral-100 last:border-b-0">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-pulse" />
              <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-neutral-900 font-display">FLASH SALE</h2>
            </div>
            <Link 
              to="/search?q=flash_sale" 
              className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderProductGrid(flashSaleProducts.slice(0, 6))}
        </section>
      )}

      {/* 2) Trending Item Section */}
      {trendingProducts.length > 0 && (
        <section className="py-4 md:py-6 container mx-auto px-4 border-b border-neutral-100 last:border-b-0">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 animate-pulse" />
              <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-neutral-900 font-display">TRENDING ITEM</h2>
            </div>
            <Link 
              to="/search?q=trending" 
              className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderProductGrid(trendingProducts.slice(0, 6))}
        </section>
      )}

      {/* 3) Best Selling Section */}
      {bestSellingProducts.length > 0 && (
        <section className="py-4 md:py-6 container mx-auto px-4 border-b border-neutral-100 last:border-b-0">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-neutral-900 font-display">BEST SELLING</h2>
            </div>
            <Link 
              to="/search?q=best_selling" 
              className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderProductGrid(bestSellingProducts.slice(0, 6))}
        </section>
      )}

      {/* 4) Offer Product Section */}
      {offerProducts.length > 0 && (
        <section className="py-4 md:py-6 container mx-auto px-4 border-b border-neutral-100 last:border-b-0">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 animate-pulse" />
              <h2 className="text-sm md:text-lg font-black uppercase tracking-wider text-neutral-900 font-display">OFFER PRODUCT</h2>
            </div>
            <Link 
              to="/search?q=offer" 
              className="text-[10px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {renderProductGrid(offerProducts.slice(0, 6))}
        </section>
      )}

      {/* 6. DYNAMIC CATEGORY BASED SECTIONS */}
      {(() => {
        const finalCategories = categories.filter(c => {
          const status = (c.status || '').toString().toLowerCase().trim();
          return status === 'active' || status === '';
        });

        return finalCategories.map((cat: any) => {
          // Find products belonging to this category
          const categoryProducts = finalProducts.filter(p => {
            const pCat = String(p.category || '').trim().toLowerCase();
            const cId = String(cat.id || '').trim().toLowerCase();
            const cName = String(cat.name || '').trim().toLowerCase();
            const cSlug = String(cat.slug || '').trim().toLowerCase();
            return pCat === cId || pCat === cName || pCat === cSlug;
          });

          // Skip category section if there are no products in it
          if (categoryProducts.length === 0) return null;

          const displayCategoryProducts = categoryProducts.slice(0, 4);

          return (
            <section key={cat.id} className="py-4 md:py-6 container mx-auto px-4 border-b border-neutral-100 last:border-b-0">
              {/* Category Banner (Only Category Sections have banners) */}
              {cat.bannerImage && (
                <div className="mb-4 rounded-xl overflow-hidden shadow-sm">
                  <CategoryBannerCarousel category={cat} />
                </div>
              )}

              {/* Category Name & View All */}
              <div className="flex items-center justify-between mb-3 md:mb-5">
                <div className="flex flex-col">
                  <h2 className="text-xs md:text-base font-black uppercase tracking-wider text-neutral-900 font-display">
                    {cat.name}
                  </h2>
                  <p className="text-[9px] md:text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                    {cat.bannerName || `${cat.name} Collection`}
                  </p>
                </div>
                <Link 
                  to={`/category/${cat.id}`} 
                  className="text-[9px] md:text-xs font-black uppercase tracking-widest text-neutral-600 hover:text-black hover:underline inline-flex items-center gap-1 transition-all"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Products grid */}
              {renderCategoryGrid(displayCategoryProducts)}
            </section>
          );
        });
      })()}

      {/* 8. CUSTOMER REVIEW SECTION (Height: 250-300px, beautiful cards) */}
      <section className="py-6 bg-neutral-900 text-white select-none">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="text-center mb-4">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400">Trusted By Thousands</span>
            <h2 className="text-xs md:text-base font-black uppercase tracking-wider mt-1 font-display">Customer Feedback</h2>
          </div>

          <div className="h-[130px] md:h-[120px] flex flex-col justify-center text-center px-4 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReview}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-2"
              >
                {/* 5-Star Feedback */}
                <div className="flex justify-center items-center gap-1 text-amber-400">
                  {[...Array(CUSTOMER_TESTIMONIALS[activeReview].rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-[11px] md:text-xs font-medium text-neutral-200 italic leading-relaxed line-clamp-3 px-2">
                  " {CUSTOMER_TESTIMONIALS[activeReview].comment} "
                </p>
                <div className="pt-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-white leading-tight">
                    {CUSTOMER_TESTIMONIALS[activeReview].name}
                  </h4>
                  <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                    {CUSTOMER_TESTIMONIALS[activeReview].location} • {CUSTOMER_TESTIMONIALS[activeReview].date}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Testimonial Select Dots */}
          <div className="flex justify-center items-center gap-1 mt-3">
            {CUSTOMER_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveReview(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === activeReview ? 'w-4 bg-white' : 'w-1 bg-neutral-600'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 9. CONTACT SECTION (WhatsApp + Call Actions) */}
      <section className="py-4 mb-2 container mx-auto px-4 max-w-sm">
        <div className="bg-white rounded-xl border border-neutral-150 p-4 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-900 shadow-sm shrink-0">
               <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <h3 className="font-black text-xs md:text-sm uppercase tracking-wider text-neutral-900 leading-tight">Authentic Customer Support</h3>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1 mb-3">Have queries? Talk directly with our team</p>
          
          <div className="grid grid-cols-2 gap-2">
            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-9 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 text-center"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0 fill-white" /> WhatsApp
            </a>
            <a 
              href={`tel:${hotlineNumber}`}
              className="flex items-center justify-center gap-1.5 h-9 px-3 bg-black hover:bg-neutral-800 text-white rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm transition-all active:scale-95 text-center"
            >
              <Phone className="w-3.5 h-3.5 shrink-0 fill-white" /> Direct Call
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
