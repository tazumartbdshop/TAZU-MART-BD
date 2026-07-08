import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Heart, ShoppingCart, Eye, 
  Sparkles, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore, resolveCategoryThumbnail } from '../store/useCategoryStore';
import { useProductStore } from '../store/useProductStore';
import { useBannerStore } from '../store/useBannerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { formatPrice } from '../lib/utils';
import { CompactProductCard } from '../components/product/CompactProductCard';
import CategoryBannerCarousel from '../components/home/CategoryBannerCarousel';
import FlashSaleTimer from '../components/home/FlashSaleTimer';
import { motion, AnimatePresence } from 'motion/react';
import { preloadHomepageDataAndAssets } from '../utils/preloadHelper';

// Helper to optimize banner image URLs to WebP with responsive fit and width
function getOptimizedImageUrl(url: string, width = 1200): string {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("fm", "webp");
      urlObj.searchParams.set("w", width.toString());
      urlObj.searchParams.set("q", "80");
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("fit", "crop");
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

// Check if a text is a numeric ID, file name ID, database ID, or contains mostly numbers
export function isNumericOrId(text: string | null | undefined): boolean {
  if (!text) return false;
  const t = text.trim();
  // If it's purely numbers e.g. "1000049033" or "1000050220"
  if (/^\d+$/.test(t)) return true;
  // If it has standard database/banner prefix like ban_
  if (/^ban_/.test(t)) return true;
  // If it's a UUID or DB ID pattern
  if (/^[0-9a-fA-F-]{8,}$/.test(t)) return true;
  // If it looks like a filename, e.g., contains file extension
  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(t)) return true;
  return false;
}

export default function Home() {
  const { categories, isLoaded: categoriesLoaded } = useCategoryStore();
  const { products, isLoading: productsLoading } = useProductStore();
  const { banners: storeBanners, isLoaded: isBannerStoreLoaded } = useBannerStore();
  const { settings } = useSettingsStore();

  const [isPreloaded, setIsPreloaded] = useState(() => {
    return useCategoryStore.getState().categories.length > 0 &&
           useProductStore.getState().products.length > 0 &&
           useBannerStore.getState().banners.length > 0;
  });

  useEffect(() => {
    let active = true;
    async function startPreload() {
      await preloadHomepageDataAndAssets();
      if (active) {
        setIsPreloaded(true);
      }
    }
    startPreload();
    return () => {
      active = false;
    };
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isBannerImageLoaded, setIsBannerImageLoaded] = useState(false);

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

  // Preload first slide banner image immediately (with highest priority and webp optimization)
  const firstBannerImage = sliderBanners[0]?.image;

  useEffect(() => {
    if (!firstBannerImage) {
      if (isBannerStoreLoaded && sliderBanners.length === 0) {
        setIsBannerImageLoaded(true);
      }
      return;
    }

    const img = new Image();
    img.src = getOptimizedImageUrl(firstBannerImage);
    img.onload = () => {
      setIsBannerImageLoaded(true);
    };
    img.onerror = () => {
      setIsBannerImageLoaded(true);
    };
  }, [firstBannerImage, isBannerStoreLoaded, sliderBanners.length]);

  const isBannerReady = (sliderBanners.length === 0 && isBannerStoreLoaded) || (sliderBanners.length > 0 && isBannerImageLoaded);

  // Auto-play for 16:9 banner slider
  useEffect(() => {
    if (sliderBanners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliderBanners.length]);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-4">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
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

  if (!isPreloaded) {
    return <div className="bg-neutral-50/50 min-h-screen" />;
  }

  const whatsappNumber = (settings.contactNumber || "8801314541738").replace(/[^0-9]/g, '');
  const hotlineNumber = settings.contactNumber || "+8801314541738";

  return (
    <div className="bg-neutral-50/50 min-h-screen pb-0 overflow-x-clip font-sans">
      
      {/* 1. MAIN SLIDER BANNER (16:9, Dynamic Overlays and Optional Button Actions) */}
      {sliderBanners.length > 0 && (
        <section className="relative w-full aspect-[16/9] bg-neutral-100 overflow-hidden select-none">
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
                src={getOptimizedImageUrl(sliderBanners[activeSlide].image)} 
                alt={isNumericOrId(sliderBanners[activeSlide].name) ? "Luxury Banner Graphic" : (sliderBanners[activeSlide].name || "Luxury Banner Graphic")} 
                className="w-full h-full object-cover object-center pointer-events-none select-none"
                referrerPolicy="no-referrer"
                fetchPriority={activeSlide === 0 ? "high" : "low"}
                loading={activeSlide === 0 ? "eager" : "lazy"}
              />

              {/* Text and CTA Button Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30 flex flex-col justify-end pb-8 sm:pb-12 md:pb-16 px-3 md:px-12 z-10 select-text">
                <div className="max-w-2xl space-y-1.5 sm:space-y-3">
                  {/* 1. Title (name) */}
                  {sliderBanners[activeSlide].name && !isNumericOrId(sliderBanners[activeSlide].name) && (
                    <motion.h2 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-wider drop-shadow-md font-sans"
                    >
                      {sliderBanners[activeSlide].name}
                    </motion.h2>
                  )}

                  {/* 2. Subtitle (offerText) */}
                  {sliderBanners[activeSlide].offerText && !isNumericOrId(sliderBanners[activeSlide].offerText) && (
                    <motion.h3
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                      className="text-amber-400 text-[10px] sm:text-sm md:text-base font-black uppercase tracking-[0.2em] drop-shadow-sm"
                    >
                      {sliderBanners[activeSlide].offerText}
                    </motion.h3>
                  )}
                  
                  {/* 3. Description */}
                  {sliderBanners[activeSlide].description && !isNumericOrId(sliderBanners[activeSlide].description) && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                      className="text-white/90 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-widest max-w-xl drop-shadow-sm"
                    >
                      {sliderBanners[activeSlide].description}
                    </motion.p>
                  )}

                  {/* 4. CTA Button */}
                  {sliderBanners[activeSlide].buttonText && sliderBanners[activeSlide].buttonLink && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                      className="pt-2 sm:pt-4"
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
      {homeCategories.length > 0 && (
        <section className="bg-white py-6 border-b border-neutral-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
          <div className="container mx-auto px-3">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mx-auto max-w-3xl">
              {homeCategories.map((cat, i) => (
                <Link 
                  key={i} 
                  to={cat.link}
                  className="flex flex-col items-center group select-none text-center"
                >
                  <div className="relative w-[16vw] h-[16vw] max-w-[100px] max-h-[100px] min-w-[64px] min-h-[64px] rounded-full overflow-hidden border border-neutral-100 bg-neutral-50 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-black/25 group-hover:shadow-md">
                    <img 
                      src={getOptimizedImageUrl(cat.image, 200)} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase text-neutral-800 tracking-wider mt-2.5 transition-colors group-hover:text-black leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* No skeleton loaders or blank product card placeholder structure shown */}

      {/* 4. DYNAMIC SPECIAL SECTIONS */}
      {/* 1) Flash Sale Section */}
      {settings.flashSaleEnabled && flashSaleProducts.length > 0 && (
        <section className="py-4 md:py-6 container mx-auto px-3 border-b border-neutral-100 last:border-b-0">
          {/* Header Row: Title on the left, VIEW ALL on the right */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100/60 mb-4">
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
          
          {/* Re-designed Centered Countdown Timer underneath the header */}
          <div className="flex justify-center w-full mb-[12px]">
            <FlashSaleTimer />
          </div>

          {/* Product Grid */}
          {renderProductGrid(flashSaleProducts.slice(0, 6))}
        </section>
      )}

      {/* 2) Trending Item Section */}
      {trendingProducts.length > 0 && (
        <section className="py-4 md:py-6 container mx-auto px-3 border-b border-neutral-100 last:border-b-0">
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
        <section className="py-4 md:py-6 container mx-auto px-3 border-b border-neutral-100 last:border-b-0">
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
        <section className="py-4 md:py-6 container mx-auto px-3 border-b border-neutral-100 last:border-b-0">
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
            <section key={cat.id} className="py-4 md:py-6 container mx-auto px-3 border-b border-neutral-100 last:border-b-0">
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

    </div>
  );
}
