import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { useProductStore } from '../store/useProductStore';
import ProductCard from '../components/ui/ProductCard';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlistIds, clearWishlist } = useWishlistStore();
  const { products } = useProductStore();

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="bg-white min-h-screen pb-24 pt-6 font-sans">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-150 mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-1 px-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Back</span>
            </button>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-950 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
              <span>My Wishlist</span>
            </h1>
          </div>

          {savedProducts.length > 0 && (
            <button
              onClick={clearWishlist}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 font-bold uppercase text-[9px] tracking-widest transition-all rounded-none"
            >
              Clear All Wishlist
            </button>
          )}
        </div>

        {/* Wishlist Items grid */}
        {savedProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-neutral-50 border border-neutral-200 rounded-full flex items-center justify-center text-neutral-400">
              <Heart className="w-8 h-8 text-neutral-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-base font-black uppercase tracking-widest">Your wishlist is empty</h2>
              <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
                Add your favorite curated lifestyle collections to your personal wishlist and keep track of premium discount updates.
              </p>
            </div>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-950 hover:bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Curated Deals</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
