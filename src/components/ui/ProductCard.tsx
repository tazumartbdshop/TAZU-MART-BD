import React from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useReviewStore } from '../../store/useReviewStore';
import { useProductStore, Product } from '../../store/useProductStore';
import { formatPrice } from '../../lib/utils';
import { useWishlistStore } from '../../store/useWishlistStore';
import { getProductDiscountDetails } from '../../lib/offerUtils';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const reviews = useReviewStore((state) => state.reviews);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isSavedInWishlist = isInWishlist(product.id);

  // Compute live discount price dynamically
  const discountDetails = React.useMemo(() => {
    try {
      return getProductDiscountDetails(product, []);
    } catch {
      return {
        discountPrice: product.discountPrice || product.price,
        discountValue: 0,
        offerName: null,
        isOffer: false
      };
    }
  }, [product]);

  const finalDiscountPrice = discountDetails.discountPrice < product.price ? discountDetails.discountPrice : null;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: finalDiscountPrice || product.price,
      image: product.imageUrl || product.featured_image || product.image,
      quantity: 1,
    });
    toast.success("Product added to cart successfully");
  };

  const discountPercent = finalDiscountPrice 
    ? Math.round(((product.price - finalDiscountPrice) / product.price) * 100) 
    : 0;

  // Compute live rating metrics based on approved state reviews
  const approvedReviewsForProduct = reviews.filter(r => r.productId === product.id && r.status === 'approved');
  const liveReviewsCount = approvedReviewsForProduct.length;
  const liveAverageRating = liveReviewsCount > 0
    ? Number((approvedReviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / liveReviewsCount).toFixed(1))
    : 0;

  const showRating = liveReviewsCount > 0;

  // Format Sold Count
  const formatSoldCount = (soldCount?: number) => {
    const count = soldCount || 0;
    if (count < 1000) {
      return `${count} SOLD`;
    }
    const formatted = Math.floor(count / 100) / 10;
    return `${formatted}K SOLD`;
  };

  return (
    <div 
      className={`group relative bg-white rounded-none border border-zinc-200 hover:border-black hover:shadow-lg transition-all duration-300 flex flex-col h-full ${
        isOutOfStock ? 'opacity-50' : ''
      }`}
    >
      {/* Top Left Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 select-none">
        {isOutOfStock && (
          <span className="bg-[#C40000] text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded-none shadow-sm">
            OUT OF STOCK
          </span>
        )}
        {!isOutOfStock && product.isNew && (
          <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded-none shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* Top Right Sold Count Badge - Flush Design (Top and Right edge flush, bottom-left rounded) */}
      <div className="absolute top-0 right-0 z-10 select-none">
        <span className="bg-[#C40000] text-white text-[10px] font-extrabold px-3 py-1.5 tracking-tight rounded-bl-lg shadow-sm flex items-center gap-1">
          🔥 {formatSoldCount(product.soldCount || 150)}
        </span>
      </div>

      {/* Center Out of Stock Banner (Dark Red #C40000, white text, bold) */}
      {isOutOfStock && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="bg-[#C40000] text-white text-xs font-black px-4 py-2 tracking-widest uppercase shadow-md border border-red-700 select-none">
            OUT OF STOCK
          </span>
        </div>
      )}

      {/* Quick Actions overlay */}
      <div className="absolute top-11 right-3 z-10 flex flex-col gap-2 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          title={isSavedInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-90 ${
            isSavedInWishlist 
              ? 'bg-red-50 text-red-600 border-red-200' 
              : 'bg-white text-black hover:bg-black hover:text-white border-zinc-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSavedInWishlist ? 'fill-red-600 text-red-600' : ''}`} />
        </button>
      </div>

      {/* Image Container with optional blur */}
      <Link 
        to={`/product/${product.slug || product.id}`} 
        className={`block relative pt-[115%] overflow-hidden bg-zinc-50 ${
          isOutOfStock ? 'filter blur-[1px]' : ''
        }`}
      >
        <img 
          src={product.imageUrl || product.featured_image || product.image || undefined} 
          alt={product.name} 
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-extrabold text-black line-clamp-1 group-hover:text-zinc-600 transition-colors text-xs uppercase tracking-tight mb-2">
            {product.name || 'Product'}
          </h3>
        </Link>

        {/* SKU, Coins and Rating Block */}
        <div className="flex flex-col mb-3 select-none">
          {/* SKU Code */}
          {(product.sku_code || product.sku) && (
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
              {product.sku_code || product.sku}
            </div>
          )}

          {/* Coins Section */}
          {product.coin_enabled !== false && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 mb-0.5">
              <span>🪙</span>
              <span>+{product.reward_coins || 150} COINS</span>
            </div>
          )}

          {/* Rating Section */}
          {showRating && (
            <div className="flex items-center gap-1 mt-0.5 text-black font-bold text-sm">
              <span>⭐</span>
              <span>{liveAverageRating.toFixed(1)}</span>
              <span className="text-gray-500 font-semibold text-xs">({liveReviewsCount})</span>
            </div>
          )}
        </div>
        
        <div className="mt-auto flex flex-col gap-3">
          {/* Price Container */}
          <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
            {/* Selling Price - Pure Black, Bolder and Cleaner (no text shadow) */}
            <span className="text-neutral-950 font-[800] text-[22px] tracking-tight whitespace-nowrap">
              BDT {(finalDiscountPrice || product.price || 0).toLocaleString()}
            </span>

            {/* Original Price - Grey #777, line-through, slightly smaller */}
            {finalDiscountPrice && (
              <span className="text-[#777] text-[18px] font-semibold line-through tracking-tight ml-1 whitespace-nowrap">
                BDT {(product.price || 0).toLocaleString()}
              </span>
            )}

            {/* Discount Badge next to selling price - dark red #C40000, white text */}
            {discountPercent > 0 && (
              <span className="bg-[#C40000] text-white text-[11px] font-bold px-2 py-1 tracking-wider uppercase select-none rounded-none whitespace-nowrap shadow-sm ml-auto sm:ml-0">
                -{discountPercent}% OFF
              </span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-white border border-black text-black rounded-none flex gap-2 items-center justify-center transition-all text-[11px] font-black tracking-widest uppercase hover:bg-black hover:text-white"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  );
}
