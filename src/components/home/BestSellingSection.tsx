import React from 'react';
import { Star, Award, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../../store/useProductStore';
import { useReviewStore } from '../../store/useReviewStore';
import { formatPrice } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

import { ProductSkeleton } from '../common/Skeleton';

interface BestSellingSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export default function BestSellingSection({ products, isLoading }: BestSellingSectionProps) {
  const navigate = useNavigate();
  const reviews = useReviewStore(state => state.reviews);
  if (isLoading) {
     return (
        <section className="py-6 bg-white border-b border-neutral-100">
           <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                 {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
              </div>
           </div>
        </section>
     );
  }

  if (products.length === 0) return null;

  // Show only top 6 products in the grid
  const initialProducts = products.slice(0, 6);

  return (
    <section id="best-selling" className="pt-2 pb-4 bg-white border-b border-neutral-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-neutral-100 pb-3.5 relative">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">Best Selling</h2>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-0.5">Premium Curated Selection</p>
            </div>
          </div>
          
          <Link 
            to="/offers#offer-best-selling" 
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          </Link>
          <div className="absolute bottom-0 left-0 w-24 h-0.5 bg-amber-500"></div>
        </div>

        {/* Grid Layout - 2 columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {initialProducts.map((product, idx) => {
            const approvedReviewsForProduct = reviews.filter(r => String(r.productId) === String(product.id) && r.status === 'approved');
            const liveReviewsCount = approvedReviewsForProduct.length;
            const liveAverageRating = liveReviewsCount > 0
              ? Number((approvedReviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / liveReviewsCount).toFixed(1))
              : 0;
            const showRating = liveReviewsCount > 0;

            const formatSoldCount = (soldCount?: number) => {
              const count = soldCount || 0;
              if (count < 1000) {
                return `${count}`;
              }
              const formatted = Math.floor(count / 100) / 10;
              return `${formatted}K`;
            };

            return (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -3 }}
                onClick={() => navigate(`/product/${product.slug || product.id}`)}
                className="bg-white border border-neutral-100 rounded-2xl p-2 sm:p-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] transition-all group relative cursor-pointer"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-50 mb-3">
                  <img 
                    src={product.featured_image || product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Best Seller Badge */}
                  <div className="absolute top-2 left-2 bg-neutral-950/90 backdrop-blur-sm text-white text-[7px] font-black px-2 py-1 rounded-md shadow-lg border border-white/10 flex items-center gap-1">
                     <Award className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> TOP RATED
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    {showRating ? (
                      <div className="flex items-center gap-1 text-black font-[700] text-[9.5px]">
                        <span>⭐</span>
                        <span>{liveAverageRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">
                      Sold: {formatSoldCount(product.soldCount)}
                    </span>
                  </div>
                  
                  {product.sku && (
                    <div className="pt-0.5">
                      <span className="text-[8px] bg-zinc-100 text-zinc-800 px-1 py-0.5 font-black tracking-widest uppercase border border-zinc-200">
                        {product.sku}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-[11px] font-bold text-neutral-950 line-clamp-2 uppercase tracking-tight group-hover:text-amber-600 transition-colors leading-snug h-8">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-50">
                    <span className="text-sm font-[800] text-black tracking-tighter">
                      {formatPrice(product.price)}
                    </span>
                    <Link 
                      to={`/product/${product.slug || product.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 bg-neutral-950 text-white rounded-lg flex items-center justify-center hover:bg-amber-500 transition-all active:scale-90 shadow-md shadow-neutral-900/10"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        {products.length > 6 && (
          <div className="mt-8 flex justify-center">
            <Link 
              to="/offers#offer-best-selling"
              className="group flex items-center gap-3 px-8 py-3.5 bg-neutral-950 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-neutral-900/10 hover:shadow-neutral-900/20 active:scale-95 transition-all"
            >
              VIEW ALL PRODUCTS <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
