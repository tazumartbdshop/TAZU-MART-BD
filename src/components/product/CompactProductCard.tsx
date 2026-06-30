import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Coins, X, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
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
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`group bg-card-bg rounded-[var(--card-radius)] overflow-hidden border border-theme-border hover:shadow-theme transition-all flex flex-col p-2 relative h-full bg-white select-none ${
          isOutOfStock ? 'opacity-50' : 'hover:border-black'
        }`}
        style={{ boxShadow: 'var(--card-shadow)' }}
      >
        {rank !== undefined && (
          <div className="absolute top-2.5 left-2.5 z-10 w-5 h-5 bg-theme-secondary text-theme-bg rounded-md flex items-center justify-center text-[10px] font-black shadow-sm">
            {rank}
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="bg-white/90 backdrop-blur p-1 rounded-full shadow-sm text-gray-400 hover:text-red-500"><Heart className="w-3.5 h-3.5" /></button>
        </div>
        
        <Link 
          to={`/product/${product.id}`} 
          className={`block relative aspect-square overflow-hidden rounded-lg bg-gray-50 mb-2 ${
            isOutOfStock ? 'filter blur-[1px]' : ''
          }`}
        >
          <img 
            src={product.imageUrl || product.featured_image || product.image || undefined} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt={product.name} 
            referrerPolicy="no-referrer" 
          />
          
          {/* Top Right Sold Count Badge - Flush Design (Top and Right edge flush, bottom-left rounded) */}
          <span className="absolute top-0 right-0 bg-[#C40000] text-white text-[9px] font-extrabold px-2 py-1 rounded-bl-lg shadow-sm flex items-center gap-0.5 select-none z-10">
            🔥 {formatSoldCount(product.soldCount || 150)}
          </span>

          {/* Center Out of Stock Banner inside image */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <span className="bg-[#C40000] text-white text-[9px] font-black px-2.5 py-1 tracking-widest uppercase shadow-md border border-red-700">
                OUT OF STOCK
              </span>
            </div>
          )}
          
          {/* Overlay Badge */}
          {isCoinEnabled && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-full shadow-sm border border-orange-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <Coins className="w-2.5 h-2.5 text-orange-500" />
              <span className="text-[7px] font-black text-black">+{rewardCoins} Coins</span>
            </div>
          )}
        </Link>
        
        <div className="flex flex-col flex-grow justify-between pl-3">
          <div>
            <Link to={`/product/${product.id}`} className="text-[11px] font-bold text-neutral-800 line-clamp-2 hover:opacity-80 leading-tight mb-1 uppercase tracking-tight">
              {product.name}
            </Link>

            {/* SKU, Coins and Rating Block */}
            <div className="flex flex-col mt-1 mb-1.5 select-none">
              {/* SKU Code */}
              {(product.sku_code || product.sku) && (
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                  {product.sku_code || product.sku}
                </div>
              )}

              {/* Coins Section */}
              {isCoinEnabled && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowCoinInfo(true);
                  }}
                  className="flex items-center gap-1 bg-orange-50/50 hover:bg-orange-100 transition-colors px-1.5 py-0.5 rounded border border-orange-100/50 w-fit mb-0.5 group/coin shrink-0 overflow-hidden font-mono"
                >
                  <span className="text-[8px]">🪙</span>
                  <span className="text-[7px] font-bold uppercase text-orange-700">+{rewardCoins} Coins</span>
                </button>
              )}

              {/* Rating Section */}
              {showRating && (
                <div className="flex items-center gap-1 mt-0.5 text-black font-bold text-xs">
                  <span>⭐</span>
                  <span>{liveAverageRating.toFixed(1)}</span>
                  <span className="text-gray-500 font-semibold text-[10px]">({liveReviewsCount})</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Pricing & Checkout Operations block */}
          <div className="mt-2 pt-2 border-t border-gray-50 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Selling Price - Pure Black, Bolder and Cleaner (no text shadow) */}
              <span className="text-neutral-950 font-[800] text-[16px] tracking-tight whitespace-nowrap">
                BDT {(product.discountPrice || product.price || 0).toLocaleString()}
              </span>
              {product.discountPrice && (
                <span className="text-[#777] text-[13px] font-semibold line-through tracking-tight whitespace-nowrap">
                  BDT {(product.price || 0).toLocaleString()}
                </span>
              )}
              {/* Discount Badge */}
              {discountPercent > 0 && (
                <span className="bg-[#C40000] text-white text-[9px] font-bold px-1.5 py-0.5 tracking-wider uppercase select-none rounded-none whitespace-nowrap shadow-sm ml-auto sm:ml-0">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="w-full font-mono">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem({ ...product, image: product.featured_image || product.image, quantity: 1 } as any);
                  toast.success("Product added to cart successfully");
                }}
                className="w-full py-2 bg-black hover:bg-neutral-800 text-white border border-black text-[10px] font-black uppercase tracking-wider text-center cursor-pointer transition-all"
              >
                {isOutOfStock ? 'OUT OF STOCK' : 'Add To Cart'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

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
