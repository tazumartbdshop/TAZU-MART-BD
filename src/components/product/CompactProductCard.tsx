import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Coins, X, CheckCircle2, Eye, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useReviewStore } from '../../store/useReviewStore';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  category: string;
  reward_coins?: number;
  coin_enabled?: boolean;
  soldCount?: number;
  productCode?: string;
  sku?: string;
}

interface CompactProductCardProps {
  product: Product;
  rank?: number;
}

export function CompactProductCard({ product, rank }: any) {
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);
  const clearCart = useCartStore(state => state.clearCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const isSavedInWishlist = product ? isInWishlist(product.id) : false;
  const { reviews } = useReviewStore();
  const [showCoinInfo, setShowCoinInfo] = useState(false);

  if (!product) {
    return null;
  }

  const approvedReviewsForProduct = reviews.filter(r => String(r.productId) === String(product.id) && r.status === 'approved');
  const liveReviewsCount = approvedReviewsForProduct.length;
  const liveAverageRating = liveReviewsCount > 0
    ? Number((approvedReviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / liveReviewsCount).toFixed(1))
    : 0;
  
  const showRating = liveReviewsCount > 0;
  
  const rewardCoins = product.reward_coins || 150;
  const isCoinEnabled = product.coin_enabled !== false;

  const basePrice = product.price || 0;
  const discountPercent = product.discountPrice 
    ? Math.round(((basePrice - product.discountPrice) / (basePrice || 1)) * 100) 
    : 0;

  const isOutOfStock = product.stock === 0;

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
    <>
      <div 
        className={`group bg-white rounded-[4px] border border-[#eeeeee] flex flex-col relative h-full select-none overflow-hidden transition-colors ${
          isOutOfStock ? 'opacity-70' : ''
        }`}
      >
        {rank !== undefined && (
          <div className="absolute top-1 left-1 z-20 w-4 h-4 bg-black text-white rounded-[2px] flex items-center justify-center text-[8px] font-black shadow-none">
            {rank}
          </div>
        )}

        {/* Wishlist Button - Top Left overlay */}
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
          className="absolute top-1 left-1 z-20 w-6 h-6 bg-white/90 backdrop-blur-xs rounded-full border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-red-500 hover:bg-white transition-all active:scale-90"
          title="Wishlist"
        >
          <Heart fill={isSavedInWishlist ? "#E11D48" : "none"} className={`w-3.5 h-3.5 ${isSavedInWishlist ? "text-rose-600" : ""}`} />
        </button>

        {/* Quick View Button - Top Left overlay */}
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/product/${product.slug || product.id}`); }}
          className="absolute top-8 left-1 z-20 w-6 h-6 bg-white/90 backdrop-blur-xs rounded-full border border-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-white transition-all active:scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          title="Quick View"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        
        {/* Image Container with 1:1 Aspect Ratio - Edge to Edge 100% Width */}
        <Link 
          to={`/product/${product.slug || product.id}`} 
          className={`block relative aspect-square overflow-hidden bg-neutral-50 w-full shrink-0 border-b border-[#eeeeee] ${
            isOutOfStock ? 'filter blur-[0.5px]' : ''
          }`}
        >
          <img 
            src={product.imageUrl || product.featured_image || product.image || undefined} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            alt={product.name} 
            referrerPolicy="no-referrer" 
          />
          
          {/* Top Right Sold Count Badge - Flush Design */}
          <span className="absolute top-0 right-0 bg-[#C40000] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-bl-[4px] shadow-none flex items-center gap-0.5 select-none z-10">
            🔥 {formatSoldCount(product.soldCount || 150)}
          </span>

          {/* Center Out of Stock Banner inside image */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 pointer-events-none">
              <span className="bg-[#C40000] text-white text-[8px] font-black px-1.5 py-0.5 tracking-wider uppercase">
                OUT OF STOCK
              </span>
            </div>
          )}
        </Link>
        
        {/* Info & Metadata Details - Tight Compact Spacing */}
        <div className="flex flex-col flex-grow justify-between px-[6px] pt-[6px] pb-[6px]">
          <div>
            <Link 
              to={`/product/${product.slug || product.id}`} 
              className="block text-[11px] font-bold text-neutral-900 leading-[1.25] uppercase tracking-tight h-[27px] overflow-hidden line-clamp-2 hover:text-neutral-600"
              title={product.name}
            >
              {product.name}
            </Link>

            {/* Product SKU Code - 3px top spacing */}
            {(product.sku_code || product.sku || product.productCode) && (
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wider mt-[3px]">
                CODE: {product.sku_code || product.sku || product.productCode}
              </div>
            )}

            {/* Rating & Coins Section - 3px top spacing */}
            <div className="flex items-center gap-1.5 text-[9px] text-neutral-600 mt-[3px] flex-wrap min-h-[14px]">
              {showRating && (
                <div className="flex items-center gap-0.5 font-bold text-neutral-800">
                  <span>⭐</span>
                  <span>{liveAverageRating.toFixed(1)}</span>
                  <span className="text-neutral-400 font-semibold text-[8px]">({liveReviewsCount})</span>
                </div>
              )}
              {showRating && isCoinEnabled && <span className="text-neutral-300">|</span>}
              {isCoinEnabled && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCoinInfo(true);
                  }}
                  className="flex items-center gap-0.5 text-orange-600 font-extrabold hover:text-orange-700 transition-colors shrink-0"
                >
                  <span>🪙</span>
                  <span>+{rewardCoins} Coins</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Pricing & Actions Block - 5px top spacing */}
          <div className="mt-[5px] pt-[4px] border-t border-[#f0f0f0] flex items-end justify-between gap-1">
            <div className="flex flex-col min-w-0 justify-end">
              {/* Sale Price & Discount Percent on same line */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-neutral-950 font-[800] text-[12.5px] tracking-tight leading-none whitespace-nowrap">
                  ৳{(product.discountPrice || product.price || 0).toLocaleString()}
                </span>
                {discountPercent > 0 && (
                  <span className="text-[#C40000] text-[8.5px] font-black leading-none bg-red-50 px-1 py-0.5 rounded-[2px] shrink-0">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              {/* Original/Old Strike Price */}
              {product.discountPrice && (
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
                onClick={(e) => {
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
                      price: product.discountPrice || product.price,
                      originalPrice: product.price,
                      image: product.imageUrl || product.featured_image || product.image || '/placeholder.png', 
                      quantity: 1,
                      slug: product.slug || product.id,
                      sku: product.sku || ''
                    } as any);
                    navigate('/checkout');
                  } catch (err) {
                    console.error("[Buy Now Error]", err);
                    toast.error("Failed to process Buy Now request");
                  }
                }}
                className="h-7 px-2 rounded-[4px] bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-100 text-white disabled:text-neutral-400 text-[9.5px] font-extrabold uppercase tracking-wider flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                title="Buy Now"
              >
                Buy Now
              </button>

              <button 
                type="button"
                disabled={isOutOfStock}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({ 
                    ...product, 
                    slug: product.slug,
                    image: product.imageUrl || product.featured_image || product.image, 
                    quantity: 1 
                  } as any);
                  toast.success("Product added to cart successfully");
                }}
                className="w-7 h-7 rounded-[4px] bg-neutral-950 hover:bg-black disabled:bg-neutral-100 text-white disabled:text-neutral-400 flex items-center justify-center shrink-0 transition-all active:scale-95 cursor-pointer"
                title="Add to Cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coin Info Popup/Bottom Sheet */}
      <AnimatePresence>
        {showCoinInfo && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCoinInfo(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl z-10 font-mono text-[10px]"
            >
              <div className="p-1 bg-gradient-to-r from-orange-400 to-yellow-500" />
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase tracking-tight text-black">Tazu Coins Reward</h3>
                  </div>
                  <button onClick={() => setShowCoinInfo(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-orange-50 rounded-xl p-5 mb-6 border border-orange-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🪙</span>
                    <div>
                      <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">You will earn</p>
                      <p className="text-xl font-black text-black">+{rewardCoins} Tazu Coins</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    "Coins added automatically after delivery",
                    "Use coins for discounts on next orders",
                    "Special reward from this product purchase"
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1">
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      </div>
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-tight leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowCoinInfo(false)}
                  className="w-full mt-8 bg-black text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-gray-900 transition-colors rounded-none"
                >
                  Got It, Thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
