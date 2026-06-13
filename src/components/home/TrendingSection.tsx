import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Product } from '../../store/useProductStore';
import { CompactProductCard } from '../product/CompactProductCard';

import { ProductSkeleton } from '../common/Skeleton';

interface TrendingSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export default function TrendingSection({ products, isLoading }: TrendingSectionProps) {
  if (!isLoading && products.length === 0) return null;

  // Limit to maximum of 6 products
  const displayProducts = products.slice(0, 6);
  const showMoreButton = products.length > 6;

  return (
    <section id="trending" className="py-8 bg-gray-50/35 overflow-hidden relative border-t border-b border-gray-100">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/30 rounded-full blur-[120px] -mr-48 -mt-48"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black text-white rounded">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-neutral-950 uppercase tracking-wider font-mono">Trending Products</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-red-650 rounded-full animate-ping"></span>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono">Top Rated Picks Of The Week</p>
              </div>
            </div>
          </div>
          <Link 
            to="/offers#offer-trending" 
            className="h-8 px-4 bg-white border border-neutral-300 text-neutral-800 font-mono text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:border-black hover:text-black transition-all shadow-sm"
          >
            Explore All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Grid of Compact Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayProducts.map((product) => (
            <CompactProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Products Button if products total count is > 6 */}
        {showMoreButton && (
          <div className="flex justify-center mt-8">
            <Link 
              to="/offers#offer-trending"
              className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-mono text-[10px] font-bold uppercase tracking-widest border border-black shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              View All Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
