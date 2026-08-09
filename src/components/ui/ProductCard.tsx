import React from 'react';
import { Star, ShoppingCart, Heart, Coins, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
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
      slug: product.slug,
      sku: product.sku,
    });
    toast.success("Product added to cart successfully");
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error("Product is currently out of stock");
      return;
    }
    if (!product) {
      toast.error("Product details not found");
      return;
    }

    try {
      clearCart();
      addItem({
        id: product.id,
        name: product.name,
        price: finalDiscountPrice || product.price,
        originalPrice: product.price,
        image: product.imageUrl || product.featured_image || product.image || '/placeholder.png',
        quantity: 1,
        slug: product.slug || product.id,
        sku: product.sku || '',
      });
      navigate('/checkout');
    } catch (err) {
      console.error("[Buy Now Error]", err);
      toast.error("Failed to process request. Please try again.");
    }
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
      className={`group relative bg-white rounded-[4px] border border-[#eeeeee] flex flex-col relative h-full select-none overflow-hidden transition-colors ${
        isOutOfStock ? 'opacity-70' : ''
      }`}
    >
      {/* Top Left Badges / Wishlist */}
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        title={isSavedInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        className="absolute top-1 left-1 z-20 w-6 h-6 bg-white/90 backdrop-blur-xs rounded-full border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-red-500 hover:bg-white transition-all active:scale-90"
      >
        <Heart fill={isSavedInWishlist ? "#E11D48" : "none"} className={`w-3.5 h-3.5 ${isSavedInWishlist ? "text-rose-600" : ""}`} />
      </button>

      {/* New Badge if applicable */}
      {!isOutOfStock && product.isNew && (
        <span className="absolute top-8 left-1 z-10 bg-black text-white text-[7px] font-black px-1 py-0.5 tracking-wider uppercase rounded-[2px] select-none">
          NEW
        </span>
      )}

      {/* Top Right Sold Count Badge - Flush Design */}
      <div className="absolute top-0 right-0 z-10 select-none">
        <span className="bg-[#C40000] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-bl-[4px] flex items-center gap-0.5">
          🔥 {formatSoldCount(product.soldCount || 150)}
        </span>
      </div>

      {/* Center Out of Stock Banner */}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 pointer-events-none">
          <span className="bg-[#C40000] text-white text-[8px] font-black px-1.5 py-0.5 tracking-wider uppercase select-none">
            OUT OF STOCK
          </span>
        </div>
      )}

      {/* Image Container with Aspect Ratio 1:1 - Full Width */}
      <Link 
        to={`/product/${product.slug || product.id}`} 
        className={`block relative aspect-square overflow-hidden bg-neutral-50 w-full shrink-0 border-b border-[#eeeeee] ${
          isOutOfStock ? 'filter blur-[0.5px]' : ''
        }`}
      >
        <img 
          src={product.imageUrl || product.featured_image || product.image || undefined} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow justify-between px-[6px] pt-[6px] pb-[6px]">
        <div>
          <Link to={`/product/${product.slug || product.id}`}>
            <h3 
              className="block text-[11px] font-bold text-neutral-900 leading-[1.25] uppercase tracking-tight h-[27px] overflow-hidden line-clamp-2 hover:text-neutral-600"
              title={product.name}
            >
              {product.name || 'Product'}
            </h3>
          </Link>

          {/* Product Code - 3px spacing */}
          {(product.sku_code || product.sku || product.productCode) && (
            <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wider mt-[3px]">
              CODE: {product.sku_code || product.sku || product.productCode}
            </div>
          )}

          {/* Rating & Coins Section - 3px spacing */}
          <div className="flex items-center gap-1.5 text-[9px] text-neutral-600 mt-[3px] flex-wrap min-h-[14px] select-none">
            {showRating && (
              <div className="flex items-center gap-0.5 font-bold text-neutral-800">
                <span>⭐</span>
                <span>{liveAverageRating.toFixed(1)}</span>
                <span className="text-neutral-400 font-semibold text-[8px]">({liveReviewsCount})</span>
              </div>
            )}
            {showRating && product.coin_enabled !== false && <span className="text-neutral-300">|</span>}
            {product.coin_enabled !== false && (
              <div className="flex items-center gap-0.5 text-orange-600 font-extrabold shrink-0">
                <span>🪙</span>
                <span>+{product.reward_coins || 150} Coins</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Pricing & Actions Block - 5px top spacing */}
        <div className="mt-[5px] pt-[4px] border-t border-[#f0f0f0] flex items-end justify-between gap-1">
          <div className="flex flex-col min-w-0 justify-end">
            {/* Sale Price & Discount Badge on same line */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-neutral-950 font-[800] text-[12.5px] tracking-tight leading-none whitespace-nowrap">
                ৳{(finalDiscountPrice || product.price || 0).toLocaleString()}
              </span>
              {discountPercent > 0 && (
                <span className="text-[#C40000] text-[8.5px] font-black leading-none bg-red-50 px-1 py-0.5 rounded-[2px] shrink-0">
                  -{discountPercent}%
                </span>
              )}
            </div>
            {/* Original Strike Price */}
            {finalDiscountPrice && (
              <span className="text-neutral-400 text-[9.5px] font-medium line-through leading-none mt-[2px] whitespace-nowrap">
                ৳{(product.price || 0).toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Action Buttons: Buy Now + Add to Cart (6-8px gap) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="h-7 px-2 rounded-[4px] bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-100 text-white disabled:text-neutral-400 text-[9.5px] font-extrabold uppercase tracking-wider flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              title="Buy Now"
            >
              Buy Now
            </button>

            <button 
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="w-7 h-7 rounded-[4px] bg-neutral-950 hover:bg-black disabled:bg-neutral-100 text-white disabled:text-neutral-400 flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
              title="Add to Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
