import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../../store/useProductStore';
import { formatPrice } from '../../lib/utils';
import FlashSaleTimer from './FlashSaleTimer';
import { useCartStore } from '../../store/useCartStore';

import { useSettingsStore } from '../../store/useSettingsStore';

import { ProductSkeleton } from '../common/Skeleton';

interface FlashSaleSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export default function FlashSaleSection({ products, isLoading }: FlashSaleSectionProps) {
  const { settings } = useSettingsStore();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  
  if (!settings.flashSaleEnabled) return null;
  
  if (isLoading) {
    return (
      <section className="pt-0 pb-3 bg-white border-b border-neutral-100 overflow-hidden">
        <div className="container mx-auto px-4">
           <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
             {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-[145px] sm:w-[170px] shrink-0"><ProductSkeleton /></div>)}
           </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section id="flash-sale" className="pt-0 pb-3 bg-white border-b border-neutral-100 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3 relative">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-red-600 rounded-lg shadow-[0_0_12px_rgba(220,38,38,0.3)] animate-pulse">
                <Zap className="w-4 h-4 text-white fill-white" />
             </div>
             <div>
                <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tighter">Flash Sale</h2>
                <div className="mt-0.5 scale-90 origin-left">
                   <FlashSaleTimer />
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <Link 
               to="/offers#offer-flash-sale" 
               className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors shrink-0"
             >
               View All <ArrowRight className="w-3 h-3" />
             </Link>
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-0.5 bg-red-600"></div>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {products.map((product) => {
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const discountPercent = hasDiscount 
              ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
              : 0;

            return (
              <motion.div 
                key={product.id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="w-[145px] sm:w-[170px] shrink-0 bg-white border border-neutral-100 rounded-xl p-2 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgba(220,38,38,0.06)] transition-all group snap-start cursor-pointer"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-50 mb-2">
                  <img 
                    src={product.featured_image || product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {hasDiscount && (
                    <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-md">
                      -{discountPercent}%
                    </div>
                  )}
                  {/* Limited Stock Badge */}
                  {product.stock < 20 && (
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/95 backdrop-blur-sm border border-red-100 py-0.5 px-1.5 rounded-md flex items-center justify-between">
                       <span className="text-[7px] font-black text-red-600 uppercase tracking-widest whitespace-nowrap">{product.stock} Left</span>
                       <div className="flex-1 h-0.5 bg-red-100 mx-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 rounded-full" style={{ width: `${(product.stock / 20) * 100}%` }}></div>
                       </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span className="text-[9px] font-black text-neutral-900">{product.rating}</span>
                  </div>
                  <h3 className="text-[10px] font-bold text-neutral-950 line-clamp-1 group-hover:text-red-600 transition-colors uppercase tracking-tight">{product.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-red-600 tracking-tighter">
                      {formatPrice(product.discountPrice || product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-[8px] text-neutral-400 font-bold line-through tracking-tighter">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem({
                      id: product.id,
                      name: product.name,
                      price: product.discountPrice || product.price,
                      image: product.featured_image || product.image,
                      quantity: 1
                    });
                  }}
                  className="w-full mt-3 py-2 bg-neutral-950 text-white text-[8px] font-black uppercase tracking-[0.15em] rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-1.5 group-active:scale-95 shadow-sm"
                >
                   <ShoppingCart className="w-3 h-3" /> Add
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
