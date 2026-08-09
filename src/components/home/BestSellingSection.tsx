import React from 'react';
import { Star, Award, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../../store/useProductStore';
import { Link } from 'react-router-dom';
import { CompactProductCard } from '../product/CompactProductCard';

import { ProductSkeleton } from '../common/Skeleton';

interface BestSellingSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export default function BestSellingSection({ products, isLoading }: BestSellingSectionProps) {
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          {initialProducts.map((product) => (
            <CompactProductCard key={product.id} product={product} />
          ))}
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
