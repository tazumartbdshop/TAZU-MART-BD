import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { useCartStore } from '../../store/useCartStore';
import { Product } from '../../store/useProductStore';
import { useReviewStore } from '../../store/useReviewStore';

interface ProductCardProps {
  product: Product;
  key?: React.Key | string | number;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { reviews } = useReviewStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      quantity: 1,
    });
  };

  const discountPercent = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
    : 0;

  // Compute live rating metrics based on approved state reviews
  const approvedReviewsForProduct = reviews.filter(r => r.productId === product.id && r.status === 'approved');
  const liveReviewsCount = approvedReviewsForProduct.length;
  const liveAverageRating = liveReviewsCount > 0
    ? Number((approvedReviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / liveReviewsCount).toFixed(1))
    : product.rating;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden border border-[#EEEEEE] hover:border-[#000000] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-500 flex flex-col">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-[#000000] text-white text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase shadow-lg">NEW</span>
        )}
        {discountPercent > 0 && (
          <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase shadow-lg">-{discountPercent}%</span>
        )}
      </div>

      {/* Quick Actions overlay */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <button className="w-9 h-9 bg-white shadow-xl text-[#000000] rounded-full flex items-center justify-center hover:bg-[#000000] hover:text-white transition-all border border-[#EEEEEE]">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative pt-[115%] overflow-hidden bg-[#fbfbfb]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[#000000] text-[#000000]" />
            <span className="text-[10px] text-[#000000] font-black">{liveAverageRating}</span>
            <span className="text-[9px] text-[#888888]">({liveReviewsCount > 0 ? liveReviewsCount : product.reviews})</span>
          </div>
          {product.soldCount && (
             <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{product.soldCount}+ Sold</span>
          )}
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-[#000000] line-clamp-1 group-hover:text-gray-600 transition-colors text-sm uppercase tracking-tight mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[#000000] font-black text-lg tracking-tighter">{formatPrice(product.discountPrice || product.price)}</span>
            {product.discountPrice && (
              <span className="text-gray-300 text-xs font-bold line-through tracking-tighter">{formatPrice(product.price)}</span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-full h-11 bg-white border-2 border-[#000000] text-[#000000] rounded-xl flex gap-2 items-center justify-center hover:bg-[#000000] hover:text-white transition-all text-[11px] font-black tracking-widest uppercase active:scale-95 shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
