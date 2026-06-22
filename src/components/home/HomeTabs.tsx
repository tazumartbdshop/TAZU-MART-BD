import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, TrendingUp, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { useProductStore } from '../../store/useProductStore';
import { CompactProductCard } from '../product/CompactProductCard';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

type TabType = 'flash-sale' | 'trending' | 'best-selling';

export default function HomeTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('flash-sale');
  const { products } = useProductStore();
  const location = useLocation();

  // Dynamically filter active valid products first
  const activeProductsFromDb = products.filter(p => {
    if (!p) return false;
    const status = (p.status || '').toString().toLowerCase().trim();
    if (status === 'inactive' || status === 'draft' || status === 'hidden') return false;
    return true;
  });

  let flashSaleProducts = activeProductsFromDb.filter(p => p.is_flash_sale || p.is_offer).slice(0, 6);
  if (flashSaleProducts.length === 0 && activeProductsFromDb.length > 0) {
    // Fallback to products with discountPrice or just the first few products
    flashSaleProducts = activeProductsFromDb.filter(p => p.discountPrice && p.discountPrice < p.price).slice(0, 6);
    if (flashSaleProducts.length === 0) {
      flashSaleProducts = activeProductsFromDb.slice(0, 6);
    }
  }

  let trendingProducts = activeProductsFromDb.filter(p => p.is_trending).slice(0, 6);
  if (trendingProducts.length === 0 && activeProductsFromDb.length > 0) {
    trendingProducts = activeProductsFromDb.slice(0, 6);
  }

  let bestSellingProducts = activeProductsFromDb.filter(p => p.is_best_selling).slice(0, 6);
  if (bestSellingProducts.length === 0 && activeProductsFromDb.length > 0) {
    bestSellingProducts = [...activeProductsFromDb].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 6);
  }

  useEffect(() => {
    const hash = location.hash;
    if (hash === '#offer-flash-sale') {
      setActiveTab('flash-sale');
      document.getElementById('offers-area')?.scrollIntoView({ behavior: 'smooth' });
    }
    else if (hash === '#offer-trending') {
      setActiveTab('trending');
      document.getElementById('offers-area')?.scrollIntoView({ behavior: 'smooth' });
    }
    else if (hash === '#offer-best-selling') {
      setActiveTab('best-selling');
      document.getElementById('offers-area')?.scrollIntoView({ behavior: 'smooth' });
    }
    else if (hash === '#offers' || hash === '#offers-area') {
      setActiveTab('flash-sale');
      document.getElementById('offers-area')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  const tabs = [
    { id: 'flash-sale', scrollId: 'offer-flash-sale', label: 'Flash Sale', icon: Zap, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'trending', scrollId: 'offer-trending', label: 'Trending', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'best-selling', scrollId: 'offer-best-selling', label: 'Best Sellers', icon: Star, color: 'text-blue-600', bg: 'bg-blue-50' },
  ] as const;

  const activeProducts = 
    activeTab === 'flash-sale' ? flashSaleProducts :
    activeTab === 'trending' ? trendingProducts :
    bestSellingProducts;

  if (flashSaleProducts.length === 0 && trendingProducts.length === 0 && bestSellingProducts.length === 0) {
    return null;
  }

  return (
    <section id="offers-area" className="py-8 bg-white border-y border-neutral-100 scroll-mt-28">
      <div className="container mx-auto px-4">
        {/* Tab Headers */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-2xl mb-6 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={tab.scrollId}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 justify-center",
                activeTab === tab.id 
                  ? "bg-white text-neutral-900 shadow-sm" 
                  : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? tab.color : "text-neutral-300")} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
            >
              {activeProducts.map((prod) => (
                <CompactProductCard key={`${activeTab}-${prod.id}`} product={prod} />
              ))}
              
              {activeProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-neutral-400 text-xs font-bold uppercase tracking-widest">
                  No items found in this section
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <div className="mt-8 flex justify-center">
          <Link 
            to="/offers"
            className="group flex items-center gap-3 px-8 py-3.5 bg-neutral-950 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-neutral-900/10 hover:shadow-neutral-900/20 active:scale-95 transition-all"
          >
            Explore All Offers
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
