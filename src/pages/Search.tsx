import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useSearchStore } from '../store/useSearchStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { filterProductsSmart, extractIntentAndQuery, isFuzzyMatch } from '../utils/fuzzySearch';
import { ShoppingBag, Search as SearchIcon, Filter, Star, ShoppingCart, Percent } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { pixelService } from '../utils/pixelService';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { products, isLoading: productsLoading } = useProductStore();
  const { categories, isLoaded: categoriesLoaded } = useCategoryStore();
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

  // Compute active categories matching the query or its expanded bilingual definitions
  const matchedCategories = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    
    const { rewrittenQuery } = extractIntentAndQuery(q);
    const queryWords = rewrittenQuery.split(/\s+/).filter(w => w.length > 0);

    return categories.filter(c => {
      const status = String(c.status || 'active').toLowerCase();
      if (status === 'inactive') return false;
      const catName = c.name.toLowerCase();
      
      // Exact or direct match
      if (catName.includes(q)) return true;
      
      // Fuzzy match word-by-word
      return queryWords.some(qw => {
        const catWords = catName.split(/\s+/);
        return catWords.some(cw => isFuzzyMatch(qw, cw));
      });
    });
  }, [categories, query]);

  // Safe redirect on exactly one product match
  useEffect(() => {
    if (filteredProducts.length === 1 && query.trim()) {
      const match = filteredProducts[0];
      navigate(`/product/${match.id}`, { replace: true });
      toast.success(`Direct Match: "${match.name}"`);
    }
  }, [filteredProducts, query, navigate]);

  // Recommended Products: random or high-rated products when query produces no matches
  const recommendedProducts = useMemo(() => {
    return activeProducts
      .filter(p => p.rating >= 4 || p.is_best_selling || p.is_trending)
      .slice(0, 10);
  }, [activeProducts]);

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
    <div className="min-h-screen bg-neutral-50/50 pt-24 pb-16 font-sans px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-6">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Daraz-style Smart Search Engine</span>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900 mt-1 flex items-center gap-2">
              Results for: <span className="text-neutral-500 font-medium">"{query || 'All Products'}"</span>
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Found {filteredProducts.length} premium matches
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-xs font-black uppercase tracking-widest group hover:bg-neutral-900 hover:text-white hover:border-transparent transition-all">
            <Filter className="w-3.5 h-3.5" /> Filter Results
          </button>
        </div>

        {/* Dynamic Matched Categories Showcase */}
        {matchedCategories.length > 0 && (
          <div className="mb-8 animate-fadeIn bg-white border border-neutral-100 p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.015)]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Related Collections</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {matchedCategories.map(cat => (
                <Link 
                  key={cat.id} 
                  to={`/category/${cat.id}`}
                  className="flex items-center gap-4 p-4 bg-neutral-50 hover:bg-neutral-100/50 border border-neutral-200/40 hover:border-black transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 overflow-hidden relative border border-neutral-100 bg-neutral-900 shrink-0 select-none">
                    {cat.iconImage || cat.bannerImage ? (
                      <img 
                        src={cat.iconImage || cat.bannerImage} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-white font-extrabold uppercase">Premium</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 group-hover:text-black transition-colors">{cat.name} Category</h3>
                    <p className="text-[8.5px] font-bold tracking-widest uppercase text-neutral-400 mt-1">Explore Curated Boutique</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {productsLoading ? (
          <div className="py-20 text-center animate-pulse">
            <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-black uppercase tracking-widest text-[#9ca3af]">Searching Database...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid Layout */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const discountPercent = getDiscountPercent(product.price, product.discountPrice);
              return (
                <Link 
                  key={product.id} 
                  to={`/product/${product.id}`}
                  className="bg-white border border-neutral-100 group transition-all duration-300 hover:shadow-2xl hover:shadow-black/[0.04] flex flex-col justify-between"
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
                      <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-black text-white text-[8px] font-extrabold uppercase px-2.5 py-1 tracking-widest">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Discount badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[8.5px] font-black uppercase py-0.5 px-2 flex items-center gap-0.5 tracking-wider">
                        <Percent className="w-2.5 h-2.5 shrink-0" />
                        <span>{discountPercent}% OFF</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Details */}
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] block truncate">
                        {product.category}
                      </span>
                      <h2 className="text-xs font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-2 h-8 leading-tight">
                        {product.name}
                      </h2>
                      
                      {/* Rating view */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating || 5) 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-neutral-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-extrabold text-neutral-400">({product.reviews || 0})</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-sm font-black tracking-tight text-neutral-950">
                          ৳{product.discountPrice || product.price}
                        </span>
                        {product.discountPrice && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ৳{product.price}
                          </span>
                        )}
                      </div>

                      {/* Add To Cart button constraint */}
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={product.stock <= 0}
                        className={`w-full py-2 bg-neutral-950 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all ${
                          product.stock <= 0 ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 hover:bg-neutral-100' : ''
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3" /> Add To Cart
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* NO RESULTS PAGE */
          <div className="space-y-12 animate-fadeIn">
            <div className="text-center py-20 bg-white border border-neutral-100 rounded-none shadow-[0_4px_25px_rgba(0,0,0,0.01)] px-4">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-6 h-6 text-neutral-400 animate-pulse" />
              </div>
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-neutral-900">No Products Found</h2>
              <p className="text-xs text-neutral-400 mb-8 max-w-sm mx-auto uppercase font-bold tracking-widest mt-1">
                We couldn't locate anything matching "{query}". Keep typing or browse trending recommendations!
              </p>
              <Link 
                to="/categories"
                className="inline-flex items-center px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all shadow-md"
              >
                Explore Categories
              </Link>
            </div>

            {/* Recommended Products Carousel/Grid when search has no results */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-1">Recommended Products</h3>
                <p className="text-sm font-bold text-neutral-900 uppercase">Handpicked for your style</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {recommendedProducts.map((product) => {
                  const discountPercent = getDiscountPercent(product.price, product.discountPrice);
                  return (
                    <Link 
                      key={`rec-${product.id}`} 
                      to={`/product/${product.id}`}
                      className="bg-white border border-neutral-100 group transition-all duration-300 hover:shadow-2xl hover:shadow-black/[0.04] flex flex-col justify-between"
                    >
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
                            <ShoppingBag className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        
                        {discountPercent > 0 && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[8px] font-black uppercase py-0.5 px-2 flex items-center gap-0.5 tracking-wider">
                            <Percent className="w-2.5 h-2.5 shrink-0" />
                            <span>{discountPercent}% OFF</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex flex-col flex-grow justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block truncate">
                            {product.category}
                          </span>
                          <h2 className="text-xs font-bold text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-2 h-8 leading-tight">
                            {product.name}
                          </h2>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-2.5 h-2.5 ${i < Math.floor(product.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-xs font-black text-neutral-900">
                              ৳{product.discountPrice || product.price}
                            </span>
                            {product.discountPrice && (
                              <span className="text-[9px] text-gray-400 line-through">
                                ৳{product.price}
                              </span>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => handleAddToCart(product, e)}
                            className="w-full py-1.5 bg-neutral-950 text-white text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 hover:bg-neutral-800 transition-all"
                          >
                            <ShoppingCart className="w-2.5 h-2.5" /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
