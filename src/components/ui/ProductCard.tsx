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
    if (isOutOfStock) return;
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
    : product.rating;

  return (
    <div className="group relative bg-white rounded-none border border-zinc-200 hover:border-black transition-colors duration-300 flex flex-col">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 select-none">
        {isOutOfStock && (
          <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded-none">OUT OF STOCK</span>
        )}
        {!isOutOfStock && product.isNew && (
          <span className="bg-black text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded-none">NEW</span>
        )}
        {!isOutOfStock && discountPercent > 0 && (
          <span className="bg-red-650 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 tracking-widest uppercase rounded-none">-{discountPercent}%</span>
        )}
      </div>

      {/* Quick Actions overlay */}
      <div className={`absolute top-3 right-3 z-10 flex flex-col gap-2 md:opacity-0 group-hover:opacity-100 transform translate-y-0 md:translate-y-2 group-hover:translate-y-0 transition-all duration-300 ${isOutOfStock ? 'hidden' : ''}`}>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          title={isSavedInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-90 ${isSavedInWishlist ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-black hover:bg-black hover:text-white border-zinc-200'}`}
        >
          <Heart className={`w-4 h-4 ${isSavedInWishlist ? 'fill-red-600 text-red-600' : ''}`} />
        </button>
      </div>

      {/* Image */}
      <Link to={`/product/${product.id}`} className={`block relative pt-[115%] overflow-hidden bg-zinc-50 ${isOutOfStock ? 'opacity-50' : ''}`}>
        <img 
          src={product.imageUrl || product.featured_image || product.image || null} 
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2 select-none">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-black text-black" />
            <span className="text-[10px] text-black font-extrabold">{liveAverageRating}</span>
            <span className="text-[9px] text-gray-400 font-bold">({liveReviewsCount > 0 ? liveReviewsCount : product.reviews})</span>
          </div>
          {product.soldCount !== undefined && product.soldCount !== null && (
             <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-mono">{product.soldCount}+ Sold</span>
          )}
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="font-extrabold text-black line-clamp-1 group-hover:text-zinc-600 transition-colors text-xs uppercase tracking-tight mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-black font-black text-base tracking-tighter">
              ৳{(finalDiscountPrice || product.price).toLocaleString()}
            </span>
            {finalDiscountPrice && (
              <span className="text-gray-400 text-xs font-semibold line-through tracking-tighter">
                ৳{product.price.toLocaleString()}
              </span>
            )}
          </div>
          
          <button 
            onClick={isOutOfStock ? (e) => { e.preventDefault(); alert("This product is currently out of stock"); } : handleAddToCart}
            className={`w-full py-2.5 bg-white border border-black text-black rounded-none flex gap-2 items-center justify-center transition-all text-[11px] font-black tracking-widest uppercase ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'hover:bg-black hover:text-white'}`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </div>
  );
}
