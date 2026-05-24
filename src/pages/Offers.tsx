import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, ShoppingCart, Star, 
  Clock, ArrowLeft, TrendingUp,
  Flame, ShoppingBag, Percent,
  Award, Sparkles
} from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import FlashSaleTimer from '../components/home/FlashSaleTimer';
import { useCartStore } from '../store/useCartStore';

export default function Offers() {
  const { products } = useProductStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const flashSaleProducts = products.filter(p => p.is_flash_sale && p.status === 'active');
  const trendingProducts = products.filter(p => p.is_trending && p.status === 'active');
  const bestSellingProducts = products.filter(p => p.is_best_selling && p.status === 'active');

  // Handle hash scrolling
  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const headerHeight = 60; // Approximate header height
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - headerHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.hash]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      quantity: 1
    });
  };

  const ProductSection = ({ title, subtitle, id, products, bannerGradient, icon: Icon, showTimer = false }: any) => {
    if (products.length === 0) return null;

    return (
      <section id={id} className="mb-12 scroll-mt-20">
        {/* Banner */}
        <div className={cn(
          "relative w-full h-48 sm:h-64 overflow-hidden mb-6 flex flex-col items-center justify-center text-white px-6 text-center shadow-lg",
          bannerGradient
        )}>
           <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="flex items-center gap-2 mb-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <Icon className="w-4 h-4 fill-white" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase mb-2 leading-tight">
              {title}
            </h2>
            <p className="text-[11px] sm:text-xs font-bold opacity-80 uppercase tracking-widest max-w-xs">{subtitle}</p>
            
            {showTimer && (
              <div className="mt-6 scale-110 sm:scale-125">
                <FlashSaleTimer />
              </div>
            )}
          </motion.div>
        </div>

        {/* Grid */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {products.map((product: any, idx: number) => {
              const discountPercent = product.discountPrice 
                ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                : null;

              return (
                <motion.div
                  key={`${id}-${product.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group active:scale-[0.98] transition-all"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {discountPercent && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-0.5 shadow-lg">
                        <Flame className="w-2.5 h-2.5" />
                        -{discountPercent}%
                      </div>
                    )}
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="absolute bottom-2 right-2 w-9 h-9 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-1 text-[8px] text-gray-400 uppercase font-black tracking-widest">
                      <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                      <span>{product.rating}</span>
                      <span className="mx-1">•</span>
                      <span>{product.category}</span>
                    </div>
                    <h3 className="text-[11px] font-bold text-gray-800 line-clamp-1 mb-2 leading-tight">
                      {product.name}
                    </h3>
                    <div className="mt-auto">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-black text-red-600">
                          {formatPrice(product.discountPrice || product.price)}
                        </span>
                        {product.discountPrice && (
                          <span className="text-[9px] text-gray-300 line-through font-bold">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-32 font-sans select-none">
      {/* Fixed Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="text-[12px] font-black uppercase tracking-widest text-gray-900">Official Offers Hub</span>
        <div className="w-9" />
      </div>

      <div className="pt-14">
        {/* Flash Sale Section */}
        <ProductSection 
          id="flash-sale"
          title="Flash Sale"
          subtitle="Ultra-limited drops available for limited time"
          products={flashSaleProducts}
          bannerGradient="bg-gradient-to-br from-[#ff3b30] via-[#ff6b6b] to-[#9c27b0]"
          icon={Zap}
          showTimer={true}
        />

        {/* Trending Section */}
        <ProductSection 
          id="trending-items"
          title="Trending Items"
          subtitle="Top trending products right now"
          products={trendingProducts}
          bannerGradient="bg-gradient-to-br from-[#ff8a00] via-[#da1b60] to-[#9c27b0]"
          icon={TrendingUp}
        />

        {/* Best Selling Section */}
        <ProductSection 
          id="best-selling"
          title="Best Selling"
          subtitle="Most loved products by customers"
          products={bestSellingProducts}
          bannerGradient="bg-gradient-to-br from-[#1a237e] via-[#4a148c] to-[#311b92]"
          icon={Award}
        />

        {/* Empty State if nothing found anywhere */}
        {flashSaleProducts.length === 0 && trendingProducts.length === 0 && bestSellingProducts.length === 0 && (
          <div className="py-40 text-center flex flex-col items-center gap-4 px-10">
            <ShoppingBag className="w-16 h-16 text-gray-200" />
            <h3 className="text-sm font-black uppercase text-gray-600">No Offers Active</h3>
            <p className="text-xs text-gray-400">Check back later for exclusive campaigns and deals.</p>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="mt-12 text-center flex flex-col items-center gap-4 px-8 opacity-40">
        <Percent className="w-8 h-8 text-gray-300" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
          Powered by Tazu Mart Offer Engine v5.0
        </p>
      </div>
    </div>
  );
}
