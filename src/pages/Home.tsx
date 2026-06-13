import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronRight, Star, Heart, Eye, ShoppingCart, Zap, TrendingUp, Award, Clock, Menu, Image as ImageIcon } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useProductStore } from '../store/useProductStore';
import { useOfferStore } from '../store/useOfferStore';
import { formatPrice } from '../lib/utils';
import { CompactProductCard } from '../components/product/CompactProductCard';
import CategoryBannerCarousel from '../components/home/CategoryBannerCarousel';
import { AutoScrollCarousel } from '../components/ui/AutoScrollCarousel';
import { motion } from 'motion/react';
import { useBannerStore } from '../store/useBannerStore';
import MainHeroCarousel from '../components/home/MainHeroCarousel';
import { useEffect } from 'react';
import FlashSaleSection from '../components/home/FlashSaleSection';
import TrendingSection from '../components/home/TrendingSection';
import BestSellingSection from '../components/home/BestSellingSection';

import FlashSaleTimer from '../components/home/FlashSaleTimer';

import { CategorySkeleton, ProductSkeleton } from '../components/common/Skeleton';

export default function Home() {
  const { categories, isLoaded: categoriesLoaded } = useCategoryStore();
  const { products, isLoading: productsLoading } = useProductStore();
  const { banners: storeBanners } = useBannerStore();
  const location = useLocation();

  const allActiveBanners = storeBanners.filter(b => b && b.status === 'active' && (b.image || b.bannerType === 'designed'));

  // Handle hash scrolling for Homepage sections
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const headerHeight = 80; // Account for the sticky header
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - headerHeight,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  }, [location.hash]);

  const mainHeroBanners = allActiveBanners.filter(b => {
    if (!b.locations || !Array.isArray(b.locations) || b.locations.length === 0) return true;
    return b.locations.some(loc => {
      const l = typeof loc === 'string' ? loc.toLowerCase() : '';
      return l === 'main hero banner' || l === 'homepage hero' || l === 'homepage-hero';
    });
  }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const floaterBanners = allActiveBanners.filter(b => 
    b.locations && Array.isArray(b.locations) && b.locations.some(loc => typeof loc === 'string' && loc.toLowerCase() === 'floater banner')
  );
  const underHeroCTABanner = allActiveBanners.find(b => 
    b.locations && Array.isArray(b.locations) && b.locations.some(loc => typeof loc === 'string' && loc.toLowerCase() === 'under hero cta')
  );

  console.log("[Home Page Categories Debug] Total categories in store:", categories.length, "Items:", categories);
  const sortedCategories = [...categories]
    .filter(c => {
      const statusStr = String(c.status || 'Active').toLowerCase();
      const isActive = statusStr === 'active';
      
      const showOnHome = c.showOnHomepage !== false && (c as any).show_on_homepage !== false;
      const isVisible = (c as any).is_visible !== false && (c as any).isVisible !== false;
      const isPublished = (c as any).published !== false;
      
      const keep = isActive && showOnHome && isVisible && isPublished;
      if (!keep) {
        console.log(`[Home Page Categories Debug] Filtering out category: "${c.name}" (ID: ${c.id}) because:`, {
          isActive,
          showOnHome,
          isVisible,
          isPublished
        });
      }
      return keep;
    })
    .sort((a, b) => {
      const orderA = a.displayOrder !== undefined && a.displayOrder !== null && a.displayOrder !== 0 ? Number(a.displayOrder) : Infinity;
      const orderB = b.displayOrder !== undefined && b.displayOrder !== null && b.displayOrder !== 0 ? Number(b.displayOrder) : Infinity;
      return orderA - orderB;
    });
  console.log("[Home Page Categories Debug] Rendered on homepage after filters:", sortedCategories.length, "Items:", sortedCategories);

  const { offers } = useOfferStore();
  const activeOffers = offers.filter(o => String(o.status || 'Active').toLowerCase() === 'active');

  const activeFlashOffers = activeOffers.filter(o => o.homepageVisibility && (o.type === 'Flash Sale' || o.showAsFlashSale));
  const flashOfferProductIds = activeFlashOffers.flatMap(o => [...(o.productIds || []), ...(o.manualProductIds || [])]);

  const activeTrendingOffers = activeOffers.filter(o => o.homepageVisibility && (o.type === 'Trending Items' || o.showAsTrending));
  const trendingOfferProductIds = activeTrendingOffers.flatMap(o => [...(o.productIds || []), ...(o.manualProductIds || [])]);

  const activeBestOffers = activeOffers.filter(o => o.homepageVisibility && (o.type === 'Best Selling' || o.showAsBestSelling));
  const bestOfferProductIds = activeBestOffers.flatMap(o => [...(o.productIds || []), ...(o.manualProductIds || [])]);

  const isProductActive = (p: any) => String(p.status || 'active').toLowerCase() === 'active';

  const flashSaleProducts = products.filter(p => (p.is_flash_sale || flashOfferProductIds.includes(p.id)) && isProductActive(p));
  const trendingProducts = products.filter(p => (p.is_trending || trendingOfferProductIds.includes(p.id)) && isProductActive(p));
  const bestSellingProducts = products.filter(p => (p.is_best_selling || bestOfferProductIds.includes(p.id)) && isProductActive(p));
  const displayBestSellingList = [...bestSellingProducts, ...bestSellingProducts, ...bestSellingProducts].slice(0, 15);

  return (
    <div className="bg-gray-50/50 min-h-screen pb-24">
      {/* 3. Dynamic Hero Banner Slider */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full"
      >
        <MainHeroCarousel banners={mainHeroBanners as any} />
      </motion.section>

      {/* Floating Banners (Floater Banners) */}
      {floaterBanners.length > 0 && (
        <section className="bg-white py-4 border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="container mx-auto px-4">
            <AutoScrollCarousel speed={25}>
              {floaterBanners.map((banner) => (
                <div key={banner.id} className="relative w-[300px] sm:w-[400px] h-[120px] rounded-xl overflow-hidden mx-2 shadow-sm border border-[#EAEAEA] shrink-0">
                  <Link to={banner.buttonLink || '#'}>
                    {banner.image ? (
                      <img src={banner.image} alt={banner.name || 'Floater Banner'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-white font-bold">{banner.name || 'Floater Banner'}</div>
                    )}
                  </Link>
                </div>
              ))}
            </AutoScrollCarousel>
          </div>
        </section>
      )}

      {/* 4. Redesigned Premium Category Slider */}
      <section className="bg-white border-b border-gray-100 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative mb-3">
        <div className="container mx-auto px-4">
          <div 
            className="flex scrollbar-hide scroll-smooth"
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '4px'
            }}
          >
            {!categoriesLoaded && categories.length === 0 ? (
              [1, 2, 3, 4, 5, 6].map(i => <CategorySkeleton key={i} />)
            ) : sortedCategories.slice(0, 6).map((cat) => {
              const catImage = cat.iconImage || cat.bannerImage;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="relative shrink-0 group transition-all duration-300 hover:scale-[1.03] hover:shadow-md cursor-pointer block select-none"
                  style={{
                    width: '110px',
                    height: '150px',
                    borderRadius: '18px',
                    overflow: 'hidden'
                  }}
                  draggable={false}
                >
                  <div className="w-full h-full relative bg-gray-100">
                    {catImage ? (
                      <img
                        src={catImage}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        draggable={false}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <ImageIcon className="w-6 h-6 mb-1" />
                        <span className="text-[8px] font-bold">NO IMAGE</span>
                      </div>
                    )}
                    
                    {/* Bottom Black Transparent Overlay */}
                    <div 
                      className="absolute inset-x-0 bottom-0 py-2 cursor-pointer flex items-center justify-center text-center"
                      style={{
                        background: 'rgba(0,0,0,0.55)',
                        height: '42px'
                      }}
                    >
                      {/* Bold Uppercase Category Name in white */}
                      <span 
                        className="text-[10px] tracking-wider text-center line-clamp-2 px-1"
                        style={{
                          color: '#ffffff',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {sortedCategories.length > 6 && (
              <Link
                key="view-all-cats"
                to="/categories"
                className="relative shrink-0 group transition-all duration-300 hover:scale-[1.03] hover:shadow-md cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-black bg-neutral-50"
                style={{
                  width: '110px',
                  height: '150px',
                  borderRadius: '18px',
                  overflow: 'hidden'
                }}
                draggable={false}
              >
                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center mb-1.5 shadow-md">
                     <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-900 leading-tight">View All</span>
                  <span className="text-[7.5px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">{sortedCategories.length} Categories</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 5. Modern Integrated Offer Sections */}
      <FlashSaleSection products={flashSaleProducts} isLoading={productsLoading} />
      <TrendingSection products={trendingProducts} isLoading={productsLoading} />

      {/* 12px ~ 18px Clean Spacing (mt-4 is 16px) */}
      <div className="mt-4"></div>
      <BestSellingSection products={bestSellingProducts} isLoading={productsLoading} />

      {/* 8. Dynamic Category Sections */}
      {sortedCategories.map(cat => {
        const catProducts = products.filter(p => p.category.toLowerCase() === cat.id.toLowerCase() || p.category.toLowerCase() === cat.name.toLowerCase()).slice(0, 6);
        if (catProducts.length === 0) return null;
        
        return (
          <section key={`cat-sec-${cat.id}`} className="py-2 border-b border-neutral-100 last:border-b-0">
            <div className="container mx-auto px-4">
              {/* FIRST ROW: Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-wider">{cat.name}</h2>
                <Link 
                  to={`/category/${cat.id}`} 
                  className="h-10 px-[18px] bg-black text-white hover:opacity-85 rounded-[8px] font-bold text-[10px] sm:text-xs uppercase tracking-[0.5px] items-center justify-center inline-flex transition-all active:scale-[0.97] shrink-0"
                >
                  View All
                </Link>
              </div>

              {/* SECOND ROW: Category Banner Image Slider (Full width compact) */}
              <div className="mb-4">
                <CategoryBannerCarousel category={cat} />
              </div>

              {/* THIRD ROW: Category Products */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 font-sans">
                {productsLoading && products.length === 0 ? (
                  [1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)
                ) : catProducts.map(prod => (
                  <CompactProductCard key={`cat-prod-${prod.id}`} product={prod} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
