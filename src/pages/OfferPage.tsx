import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupportStore } from '../store/useSupportStore';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { ArrowLeft, Percent } from 'lucide-react';
import { formatPrice } from '../lib/utils';

export default function OfferPage() {
  const [searchParams] = useSearchParams();
  const broadcastId = searchParams.get('id');
  const navigate = useNavigate();
  
  const { broadcasts } = useSupportStore();
  const { products } = useProductStore();
  const { addItem } = useCartStore();

  const broadcast = useMemo(() => {
    return broadcasts.find(b => b.id === broadcastId);
  }, [broadcasts, broadcastId]);

  const offerProducts = useMemo(() => {
    if (!broadcast) {
      // If no broadcast id, show all active broadcasts
      const activeBroadcasts = broadcasts.filter(b => b.status !== 'draft');
      const allOffers: any[] = [];
      activeBroadcasts.forEach(b => {
         const discount = b.productDiscount || b.offerPercentage || 0;
         let matching = [...products];
         if (b.productId) {
           matching = matching.filter(p => p.id === b.productId);
           if (matching.length === 0 && b.productName) {
             matching = products.filter(p => p.name.toLowerCase().includes(b.productName!.toLowerCase()));
           }
         } else if (b.categoryName) {
           matching = matching.filter(p => p.category.toLowerCase() === b.categoryName!.toLowerCase());
         } else {
           matching = matching.filter(p => !!p.discountPrice || p.is_flash_sale);
         }
         
         matching.forEach(product => {
            const regularPrice = product.price;
            let offerPrice = product.discountPrice || product.price; 
            if (discount > 0) offerPrice = regularPrice - (regularPrice * discount / 100);
            
            allOffers.push({
               ...product,
               regularPrice,
               offerPrice: Math.min(offerPrice, product.discountPrice || product.price),
               discountPercent: discount || (product.discountPrice ? Math.round(((regularPrice - product.discountPrice) / regularPrice) * 100) : 0),
               campaignLabel: b.title
            });
         });
      });
      // Deduplicate
      const uniqueMap = new Map();
      allOffers.forEach(o => {
         if (!uniqueMap.has(o.id) || o.offerPrice < uniqueMap.get(o.id).offerPrice) {
            uniqueMap.set(o.id, o);
         }
      });
      return Array.from(uniqueMap.values());
    }
    
    // Filter logic based on specific broadcast type
    let filtered = [...products];

    if (broadcast.productId) {
      filtered = filtered.filter(p => p.id === broadcast.productId);
      if (filtered.length === 0 && broadcast.productName) {
        // Fallback to name if ID doesn't match
        filtered = products.filter(p => p.name.toLowerCase().includes(broadcast.productName!.toLowerCase()));
      }
    } else if (broadcast.categoryName) {
      filtered = filtered.filter(p => p.category.toLowerCase() === broadcast.categoryName!.toLowerCase());
    } else {
      // General flash sale or coupon: display active or discounted products
      filtered = filtered.filter(p => !!p.discountPrice || p.is_flash_sale);
    }
    
    return filtered.map(product => {
      const regularPrice = product.price;
      const appliedDiscount = broadcast.productDiscount || broadcast.offerPercentage || 0;
      
      let offerPrice = product.discountPrice || product.price; 
      
      if (appliedDiscount > 0) {
        offerPrice = regularPrice - (regularPrice * appliedDiscount / 100);
      }
      
      return {
        ...product,
        regularPrice,
        offerPrice: Math.min(offerPrice, product.discountPrice || product.price),
        discountPercent: appliedDiscount || (product.discountPrice ? Math.round(((regularPrice - product.discountPrice) / regularPrice) * 100) : 0),
        campaignLabel: broadcast.title
      };
    });

  }, [broadcast, broadcasts, products]);

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.offerPrice,
      originalPrice: product.regularPrice, // keeping regular price for reference
      image: product.featured_image || product.image,
      quantity: 1,
      isOfferItem: true,
      campaignId: broadcast?.id || 'GLOBAL_CAMPAIGN',
      campaignDiscountPercent: product.discountPercent
    });
  };

  const handleBuyNow = (e: React.MouseEvent, product: any) => {
    handleAddToCart(e, product);
    navigate('/checkout');
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-24 font-sans selection:bg-black selection:text-white">
      <div className="bg-black text-white pt-10 pb-6 px-4 relative flex flex-col items-center justify-center text-center">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-4 top-10 p-2 hover:bg-neutral-800 rounded-full transition-all cursor-pointer text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-black uppercase tracking-widest text-[#00E676] mb-1">
          TAZU MART SPECIAL OFFERS
        </h1>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
          All Discounted Products<br/>Flash Sale • Campaign Deals • Category Offers
        </p>
      </div>

      <div className="pt-6 px-4 md:px-6 max-w-5xl mx-auto">
         {offerProducts.length === 0 ? (
            <div className="text-center py-20 px-6 border border-gray-200 mt-10 bg-white">
               <Percent className="w-10 h-10 text-gray-300 mx-auto mb-4" />
               <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-800">No Active Offers Available</h3>
               <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Please Check Back Later</p>
            </div>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
               {offerProducts.map(product => {
                  return (
                    <div 
                       key={product.id} 
                       onClick={() => handleProductClick(product.id)}
                       className="bg-white border border-gray-200 flex flex-col items-center text-center p-3 cursor-pointer group"
                    >
                       <div className="w-full aspect-square bg-gray-50 relative mb-3 overflow-hidden">
                          <img src={product.featured_image || product.image || null} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          
                          {product.discountPercent > 0 && (
                             <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-[10px] uppercase px-2 py-1 tracking-wider shadow-sm">
                                {product.discountPercent}% OFF
                             </div>
                          )}
                          {!product.discountPercent && product.regularPrice > product.offerPrice && (
                             <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-[10px] uppercase px-2 py-1 tracking-wider shadow-sm">
                                ৳{product.regularPrice - product.offerPrice} OFF
                             </div>
                          )}
                       </div>
                       
                       <div className="w-full space-y-1.5 flex-1 flex flex-col">
                          <h3 className="font-extrabold text-[11px] uppercase tracking-wide text-gray-900 line-clamp-2 leading-tight">
                             {product.name}
                          </h3>
                          
                          <div className="flex flex-col gap-0 items-center justify-center py-1 mt-auto">
                             {product.regularPrice > product.offerPrice && (
                                <span className="text-[9px] font-bold text-gray-400 line-through tracking-wider">Regular: {formatPrice(product.regularPrice)}</span>
                             )}
                             <span className="text-[13px] font-black text-rose-600 tracking-tighter">Offer: {formatPrice(product.offerPrice)}</span>
                          </div>
                       </div>

                       <div className="w-full flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-100">
                          <button 
                             onClick={(e) => handleAddToCart(e, product)}
                             className="w-full py-2.5 bg-gray-100 text-black hover:bg-gray-200 font-extrabold text-[9px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1"
                          >
                             ADD TO CART
                          </button>
                          <button 
                             onClick={(e) => handleBuyNow(e, product)}
                             className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 font-extrabold text-[9px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1 shadow-sm"
                          >
                             BUY NOW
                          </button>
                       </div>
                    </div>
                  );
               })}
            </div>
         )}
      </div>
    </div>
  );
}
