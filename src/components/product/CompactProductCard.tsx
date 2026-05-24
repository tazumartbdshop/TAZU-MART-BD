import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useReviewStore } from '../../store/useReviewStore';
import { formatPrice } from '../../lib/utils';
import { motion } from 'motion/react';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  category: string;
}

interface CompactProductCardProps {
  product: Product;
  rank?: number;
}

export function CompactProductCard({ product, rank }: any) {
  const addItem = useCartStore(state => state.addItem);
  const { reviews } = useReviewStore();

  const approvedReviewsForProduct = reviews.filter(r => r.productId === product.id && r.status === 'approved');
  const liveReviewsCount = approvedReviewsForProduct.length;
  const liveAverageRating = liveReviewsCount > 0
    ? Number((approvedReviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / liveReviewsCount).toFixed(1))
    : product.rating;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group bg-white rounded-xl overflow-hidden border border-gray-100/80 hover:shadow-md transition-all flex flex-col p-2 relative h-full"
    >
      {rank !== undefined && (
        <div className="absolute top-2 left-2 z-10 w-5 h-5 bg-black text-white rounded-md flex items-center justify-center text-[10px] font-black shadow-sm">
          {rank}
        </div>
      )}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="bg-white/90 backdrop-blur p-1 rounded-full shadow-sm text-gray-400 hover:text-red-500"><Heart className="w-3.5 h-3.5" /></button>
      </div>
      
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden rounded-lg bg-gray-50 mb-2">
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
        {product.discountPrice && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg">
            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
          </span>
        )}
      </Link>
      
      <div className="flex flex-col flex-1 font-sans">
        <Link to={`/product/${product.id}`} className="text-[11px] font-medium text-gray-700 line-clamp-2 hover:text-black leading-tight mb-1.5 h-[2.4em]">
          {product.name}
        </Link>
        
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
          <span className="text-[10px] text-gray-400">{liveAverageRating}</span>
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-black font-bold text-[13px] leading-none">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-gray-400 text-[9px] line-through mt-0.5 leading-none">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button 
            onClick={() => addItem({ ...product, quantity: 1 } as any)}
            className="bg-black text-white p-1.5 rounded-lg hover:bg-gray-900 transition-colors shadow-sm active:scale-90"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
