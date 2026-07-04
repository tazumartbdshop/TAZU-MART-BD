import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useSearchStore } from '../store/useSearchStore';
import { filterProductsSmart, extractIntentAndQuery, isFuzzyMatch } from '../utils/fuzzySearch';
import { ShoppingBag, Search as SearchIcon, Star, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { pixelService } from '../utils/pixelService';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, isLoading: productsLoading } = useProductStore();
  const { addSearch } = useSearchStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  
  // Clean products list to process
  const activeProducts = useMemo(() => {
    return products.filter(p => {
      if (!p) return false;
      const status = (p.status || '').toString().toLowerCase().trim();
      return status === 'active' || 
             status === 'published' || 
             status === 'true' || 
             status === '' || 
             status === 'null' ||
             status === 'undefined' ||
             !p.status;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    return filterProductsSmart(activeProducts, query);
  }, [activeProducts, query]);

  // Safe redirect on exactly one product match
  useEffect(() => {
    if (filteredProducts.length === 1 && query.trim()) {
      const match = filteredProducts[0];
      navigate(`/product/${match.slug || match.id}`, { replace: true });
      toast.success(`Direct Match: "${match.name}"`);
    }
  }, [filteredProducts, query, navigate]);

  // Track search terms dynamically into Firestore for Search Analytics
  useEffect(() => {
    const cleanQuery = query.trim();
    if (cleanQuery) {
      const resultsCount = filteredProducts.length;
      const firstResult = filteredProducts[0];
      const categoryContext = firstResult?.category || 'General';
      const productContext = firstResult?.name || '';
      
      // Execute tracking
      addSearch(cleanQuery, resultsCount > 0, resultsCount, categoryContext, productContext);
      pixelService.trackSearch(cleanQuery);
    }
  }, [query, filteredProducts, addSearch]);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.image,
      originalPrice: product.price,
    });
    
    pixelService.trackAddToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      quantity: 1
    });

    toast.success(`"${product.name}" added to cart!`);
  };

  // Helper to calculate exact discount percentage
  const getDiscountPercent = (price: number, discPrice?: number) => {
    if (!discPrice || discPrice >= price) return 0;
    return Math.round(((price - discPrice) / price) * 100);
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-16 font-sans px-4">
      <div className="max-w-7xl mx-auto">
        
        {filteredProducts.length > 0 ? (
          /* Products Grid Layout - Starts directly after the search bar (which is in the Header) */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map((product) => {
              const discountPercent = getDiscountPercent(product.price, product.discountPrice);
              return (
                <Link 
                  key={product.id} 
                  to={`/product/${product.slug || product.id}`}
                  className="bg-white border border-neutral-100 group transition-all duration-300 hover:shadow-lg flex flex-col justify-between"
                >
                  {/* Photo area */}
                  <div className="aspect-[1/1] overflow-hidden relative bg-neutral-50/50 shrink-0">
                    {product.featured_image || product.image ? (
                      <img 
                        src={product.featured_image || product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Stock Status */}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-neutral-900/30 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-black text-white text-[8px] font-black uppercase px-2 py-1 tracking-widest">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Discount badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-0 left-0 bg-orange-500 text-white text-[9px] font-black uppercase py-0.5 px-2 tracking-wider">
                        -{discountPercent}%
                      </div>
                    )}
                  </div>

                  {/* Metadata and Details */}
                  <div className="p-2.5 flex flex-col flex-1 justify-between gap-2">
                    <div className="space-y-1">
                      <h2 className="text-xs font-medium text-neutral-800 line-clamp-2 h-8 leading-tight group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h2>
                      
                      {/* Price area */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-orange-600">
                            ৳{product.discountPrice || product.price}
                          </span>
                        </div>
                        {product.discountPrice && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 line-through">৳{product.price}</span>
                            <span className="text-[10px] text-neutral-500">-{discountPercent}%</span>
                          </div>
                        )}
                      </div>

                      {/* Rating view */}
                      <div className="flex items-center gap-1 pt-0.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-2.5 h-2.5 ${
                                i < Math.floor(product.rating || 5) 
                                  ? 'fill-orange-400 text-orange-400' 
                                  : 'text-neutral-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[9px] text-neutral-400">({product.reviews || 0})</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* NO RESULTS PAGE */
          <div className="py-20 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-8 h-8 text-neutral-300" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">No Products Found</h2>
            <p className="text-sm text-neutral-500 mt-2">
              Try another keyword.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
