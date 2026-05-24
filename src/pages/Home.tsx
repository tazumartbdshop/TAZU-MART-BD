import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Star, Heart, Eye, ShoppingCart, Zap, TrendingUp, Award, Clock, Menu, Image as ImageIcon } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useProductStore } from '../store/useProductStore';
import { formatPrice } from '../lib/utils';
import { CompactProductCard } from '../components/product/CompactProductCard';
import CategoryBannerCarousel from '../components/home/CategoryBannerCarousel';
import { AutoScrollCarousel } from '../components/ui/AutoScrollCarousel';
import { motion } from 'motion/react';
import { useBannerStore } from '../store/useBannerStore';
import MainHeroCarousel from '../components/home/MainHeroCarousel';
import { banners as mockBanners } from '../data/mockData';

import FlashSaleTimer from '../components/home/FlashSaleTimer';

export default function Home() {
  const { categories } = useCategoryStore();
  const { products } = useProductStore();
  const { banners: storeBanners } = useBannerStore();

  const activeBanners = storeBanners.filter(b => b.status === 'active' && b.image);
  
  // Create display banners with fallback to mock data if store is empty
  const displayBanners = activeBanners.length > 0 
    ? activeBanners 
    : mockBanners.map(mb => ({
        id: mb.id,
        image: mb.image,
        name: mb.title,
        buttonEnabled: true,
        buttonText: 'Shop Now',
        status: 'active' as const,
        order: 0,
        isCustomButtonText: false,
        connectedProductId: mb.link.includes('category') ? undefined : mb.id
      }));

  const sortedCategories = [...categories]
    .filter(c => c.status === 'Active' && c.showOnHomepage)
    .sort((a, b) => {
      const orderA = a.displayOrder !== undefined && a.displayOrder !== null && a.displayOrder !== 0 ? Number(a.displayOrder) : Infinity;
      const orderB = b.displayOrder !== undefined && b.displayOrder !== null && b.displayOrder !== 0 ? Number(b.displayOrder) : Infinity;
      return orderA - orderB;
    });

  const flashSaleProducts = products.filter(p => p.is_flash_sale);
  const trendingProducts = products.filter(p => p.is_trending);
  const bestSellingProducts = products.filter(p => p.is_best_selling);
  const displayBestSellingList = [...bestSellingProducts, ...bestSellingProducts, ...bestSellingProducts].slice(0, 15);

  return (
    <div className="bg-gray-50/50 min-h-screen pb-24">
      {/* 3. Dynamic Hero Banner Slider */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full"
      >
        <MainHeroCarousel banners={displayBanners as any} />
      </motion.section>

      {/* 4. Compact Infinite Auto-Scrolling Category Bar */}
      <section className="bg-white border-b border-gray-100 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden h-[95px] sm:h-[110px] flex items-center mb-2.5">
        <div className="w-full">
          <AutoScrollCarousel speed={25} className="w-full relative z-0" itemClassName="gap-2.5 pr-2.5">
            {sortedCategories.map((cat) => {
              const catImage = cat.iconImage || cat.bannerImage;
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.id}`}
                  className="flex flex-col items-center justify-center shrink-0 w-[78px] sm:w-[88px] group transition-all duration-300 relative"
                  draggable={false}
                >
                  {/* Small round dynamic category image */}
                  <div className="w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full overflow-hidden bg-gray-50/50 border border-gray-200/90 group-hover:border-black relative flex items-center justify-center transition-all duration-300 shadow-sm">
                    {catImage ? (
                      <img
                        src={catImage}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                        draggable={false}
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  {/* Category Title below image without descriptions or secondary fields */}
                  <span className="text-[9px] font-black text-black uppercase tracking-wider text-center line-clamp-1 mt-1.5 select-none transition-colors duration-200 group-hover:text-purple-600">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </AutoScrollCarousel>
        </div>
      </section>

      {/* 5. Flash Sale Redesign (Edge-to-Edge) */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-white border-y border-red-50 py-4 mb-4 overflow-hidden select-none">
          <div className="w-full">
            <div className="flex items-center justify-between px-4 sm:px-6 mb-5">
              <div className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className="bg-gradient-to-br from-red-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-red-500/10">
                    <Zap className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Flash Sale</h2>
                </div>
                
                <div className="ml-3">
                  <FlashSaleTimer />
                </div>
              </div>

              <Link 
                to="/offers#flash-sale" 
                className="h-9 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center border border-gray-200"
              >
                View All
              </Link>
            </div>
            
            <div className="flash-sale-products">
              <AutoScrollCarousel speed={25} className="w-full relative z-0" itemClassName="gap-3 px-3">
                {flashSaleProducts.map(prod => (
                  <div key={`flash-${prod.id}`} className="w-[145px] sm:w-[165px] shrink-0 pointer-events-auto" draggable={false}>
                    <CompactProductCard product={prod} />
                  </div>
                ))}
              </AutoScrollCarousel>
            </div>
          </div>
          
          <style>{`
            .flash-sale-products {
              display: flex;
              overflow-x: auto;
              overflow-y: hidden;
              scrollbar-width: none;
              -ms-overflow-style: none;
              white-space: nowrap;
              touch-action: pan-x;
            }
            .flash-sale-products::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </section>
      )}

      {/* 6. Trending Products (Compact Grid) */}
      {trendingProducts.length > 0 && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-orange-500 p-1.5 rounded-lg shadow-sm shadow-orange-500/20">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Trending Items</h2>
              </div>
              <Link to="/offers#trending-items" className="text-[11px] font-bold text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {trendingProducts.map((prod, idx) => (
                <CompactProductCard key={`trend-${prod.id}`} product={prod} rank={idx + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Best Selling Section (Auto Horizontal Slider) */}
      {bestSellingProducts.length > 0 && (
        <section className="py-4 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-black p-1.5 rounded-lg shadow-sm shadow-black/20">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Best Selling</h2>
              </div>
              <Link to="/offers#best-selling" className="text-[11px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-[0.2em] px-3 py-1 bg-gray-100 rounded-lg">View All</Link>
            </div>
            
            <div className="relative group/slider">
              <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x snap-mandatory touch-pan-x touch-pan-y">
                <motion.div 
                  className="flex gap-4"
                  animate={{ x: [0, -1000] }}
                  transition={{ 
                    duration: 25, 
                    repeat: Infinity, 
                    ease: "linear",
                  }}
                >
                  {displayBestSellingList.map((prod, idx) => (
                    <div key={`best-sl-${prod.id}-${idx}`} className="w-[140px] max-w-[160px] shrink-0 snap-start">
                      <CompactProductCard product={prod} />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. Dynamic Category Sections */}
      {sortedCategories.map(cat => {
        const catProducts = products.filter(p => p.category.toLowerCase() === cat.id.toLowerCase() || p.category.toLowerCase() === cat.name.toLowerCase()).slice(0, 6);
        if (catProducts.length === 0) return null;
        
        return (
          <section key={`cat-sec-${cat.id}`} className="py-6 border-b border-neutral-100 last:border-b-0">
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
                {catProducts.map(prod => (
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
