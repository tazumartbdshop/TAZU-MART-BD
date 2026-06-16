import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useProductStore } from '../store/useProductStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useBannerStore } from '../store/useBannerStore';
import { formatPrice } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';

const isProductActive = (p: any) => {
  if (!p) return false;
  const status = (p.status || '').toString().toLowerCase().trim();
  if (status === 'inactive' || status === 'draft' || status === 'hidden') return false;
  return true;
};

export default function Home() {
  const { products, isLoading: productsLoading } = useProductStore();
  const { categories } = useCategoryStore();
  const { banners } = useBannerStore();
  const addItem = useCartStore((state) => state.addItem);

  // 1. YouTube Style Hero Slider control
  const [currentSlide, setCurrentSlide] = useState(0);

  // Premium, text-free watch and wallet cover banner series
  const premiumHeroBanners = [
    {
      id: 'h-1',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1920&q=80',
    },
    {
      id: 'h-2',
      image: 'https://images.unsplash.com/photo-1627124357626-8e519213fbf5?w=1920&q=80',
    },
    {
      id: 'h-3',
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1920&q=80',
    }
  ];

  const activeBanners = banners && banners.filter(b => b.status === 'active').length > 0 
    ? banners.filter(b => b.status === 'active')
    : premiumHeroBanners;

  useEffect(() => {
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [activeBanners.length]);

  // 2. Load active catalog data
  const activeProducts = products.filter(isProductActive);

  // Trending, New, and Best Selling Lists
  const trendingProducts = activeProducts.filter(p => p.is_trending).slice(0, 4);
  const newArrivals = [...activeProducts]
    .filter(p => p.isNew)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 4);
  const bestSellers = activeProducts.filter(p => p.is_best_selling).slice(0, 4);

  // Fallbacks if lists are empty: slice dynamic collections safely
  const displayTrending = trendingProducts.length > 0 ? trendingProducts : activeProducts.slice(0, 4);
  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : activeProducts.slice(4, 8);
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : activeProducts.slice(2, 6);

  // 3. Category Data Source
  // Merged database category targets + high fidelity fallback references to ensure beautiful circle categories
  const fallbackCategories = [
    {
      id: 'cat-watches',
      name: 'Watches',
      slug: 'watches',
      image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=300&h=300&fit=crop&q=80'
    },
    {
      id: 'cat-wallets',
      name: 'Wallets',
      slug: 'wallets',
      image: 'https://images.unsplash.com/photo-1627124357626-8e519213fbf5?w=300&h=300&fit=crop&q=80'
    },
    {
      id: 'cat-gift',
      name: 'Gift Set',
      slug: 'gift-set',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=300&fit=crop&q=80'
    },
    {
      id: 'cat-premium',
      name: 'Premium',
      slug: 'premium-collection',
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&h=300&fit=crop&q=80'
    },
    {
      id: 'cat-smart',
      name: 'Smart Watch',
      slug: 'smart-watch',
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&h=300&fit=crop&q=80'
    },
    {
      id: 'cat-couple',
      name: 'Couple Watch',
      slug: 'couple-watch',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&q=80'
    },
    {
      id: 'cat-leather-wallet',
      name: 'Leather Wallet',
      slug: 'leather-wallet',
      image: 'https://images.unsplash.com/photo-1627124357626-8e519213fbf5?w=300&h=300&fit=crop&q=80'
    },
    {
      id: 'cat-men',
      name: 'Men Collection',
      slug: 'men',
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&q=80'
    }
  ];

  // Merge static default list with current database categories to accept any new categories automatically
  const dynamicCategories = [...fallbackCategories];
  if (categories && categories.length > 0) {
    categories.forEach(dbCat => {
      // Avoid duplication with default slugs
      const dup = dynamicCategories.find(c => c.slug?.toLowerCase() === dbCat.slug?.toLowerCase() || c.name?.toLowerCase() === dbCat.name?.toLowerCase());
      if (!dup) {
        dynamicCategories.push({
          id: dbCat.id,
          name: dbCat.name,
          slug: dbCat.slug || dbCat.name?.toLowerCase().replace(/\s+/g, '-'),
          image: dbCat.image || dbCat.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&q=80'
        });
      }
    });
  }

  // Find exact link for a category route
  const getCategoryLink = (cat: any) => {
    // If it's a fallback static reference, check search store or look inside real categories to match
    const foundReal = categories?.find(c => c.slug?.toLowerCase() === cat.slug?.toLowerCase() || c.name?.toLowerCase().includes(cat.name?.toLowerCase()));
    if (foundReal) return `/category/${foundReal.id}`;
    return `/search?category=${encodeURIComponent(cat.name)}`;
  };

  // 4. Dynamic query filters based on actual products in Watches, Wallets, and Gift Set categories
  const filterProductsByCategory = (catKeywords: string[]) => {
    return activeProducts.filter(p => {
      const categoryName = (p.category || '').toLowerCase();
      const productName = (p.name || '').toLowerCase();
      return catKeywords.some(keyword => {
        const kw = keyword.toLowerCase();
        return categoryName.includes(kw) || productName.includes(kw);
      });
    }).slice(0, 4);
  };

  // Extract products dynamically matching each target collection category
  const watchProducts = filterProductsByCategory(['watch', 'ঘড়ি', 'watches', 'smartwatch']);
  const walletProducts = filterProductsByCategory(['wallet', 'মানিব্যাগ', 'wallets', 'leather wallet']);
  const giftProducts = filterProductsByCategory(['gift', 'গিফট', 'combo', 'giftset']);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...product, quantity: 1 });
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: '#000000',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '13px',
        borderRadius: '8px'
      }
    });
  };

  return (
    <div id="premium-ecommerce-layout" className="bg-neutral-50/50 min-h-screen pb-16 font-sans">
      
      {/* 1. HERO BANNER (YouTube style ratio 16:9, sharp 0px corners, mobile height matched) */}
      <section id="hero-slider-section" className="relative w-full aspect-[16/9] h-[180px] sm:h-[220px] md:h-[450px] lg:h-[550px] overflow-hidden bg-neutral-950 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <img 
              src={activeBanners[currentSlide]?.image} 
              alt="Premium Promo Campaign Banner" 
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Dynamic bottom indicator pips */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-4 bg-white' : 'w-1 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. AUTO SCROLL CATEGORIES (Circle layout, dynamic horizontal flow) */}
      <section id="auto-category-scroll-section" className="py-6 bg-white border-b border-neutral-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden pb-2 snap-x scrollbar-none scroll-smooth">
            {dynamicCategories.map((cat) => (
              <Link 
                key={cat.id} 
                to={getCategoryLink(cat)}
                className="flex flex-col items-center flex-shrink-0 group cursor-pointer snap-start w-[72px] sm:w-[100px]"
              >
                {/* 200x200 pixel layout scale mapped to circular form values */}
                <div className="w-[60px] h-[60px] sm:w-[85px] sm:h-[85px] rounded-full overflow-hidden border border-neutral-200 bg-neutral-50 group-hover:scale-105 duration-300 transition-all shadow-sm">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-neutral-800 tracking-tight mt-2 text-center truncate w-full">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRENDING PRODUCTS GRID */}
      <section id="trending-showcase-section" className="py-8 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest block">CURATED EXCLUSIVES</span>
            <h2 className="text-lg md:text-2xl font-black text-neutral-900 uppercase tracking-tight">Trending Products</h2>
          </div>
          <Link to="/search?filter=trending" className="text-xs font-extrabold text-neutral-800 hover:opacity-85 flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <SkeletonGrid />
        ) : displayTrending.length === 0 ? (
          <EmptyProductsPlaceholder />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            {displayTrending.map((p) => (
              <ProductCard key={p.id} product={p} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* 4. NEW ARRIVALS GRID */}
      <section id="new-arrivals-showcase-section" className="py-6 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest block">FRESH DROPS</span>
            <h2 className="text-lg md:text-2xl font-black text-neutral-900 uppercase tracking-tight">New Arrivals</h2>
          </div>
          <Link to="/search?filter=new" className="text-xs font-extrabold text-neutral-800 hover:opacity-85 flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <SkeletonGrid />
        ) : displayNewArrivals.length === 0 ? (
          <EmptyProductsPlaceholder />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            {displayNewArrivals.map((p) => (
              <ProductCard key={p.id} product={p} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* 5. BEST SELLERS GRID */}
      <section id="bestseller-showcase-section" className="py-6 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block">POPULAR PICKS</span>
            <h2 className="text-lg md:text-2xl font-black text-neutral-900 uppercase tracking-tight">Best Sellers</h2>
          </div>
          <Link to="/search?filter=bestseller" className="text-xs font-extrabold text-neutral-800 hover:opacity-85 flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <SkeletonGrid />
        ) : displayBestSellers.length === 0 ? (
          <EmptyProductsPlaceholder />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            {displayBestSellers.map((p) => (
              <ProductCard key={p.id} product={p} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* 6. WATCHES CATEGORY WISE BANNER & PRODUCTS (DYNAMIC HIDE IF EMPTY) */}
      {watchProducts.length > 0 && (
        <section id="category-watches-block" className="py-8 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">COLLECTION</span>
              <h2 className="text-lg md:text-2xl font-black text-neutral-900 uppercase tracking-tight">WATCHES</h2>
            </div>
            <Link to="/search?category=Watches" className="text-xs font-extrabold text-neutral-800 hover:opacity-85 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* WATCH BANNER CARD */}
          <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden shadow-sm border border-neutral-150 mb-6 bg-neutral-900">
            <img 
              src="https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=1500&q=80" 
              alt="Watches Banner Image" 
              className="w-full h-full object-cover object-center transform hover:scale-101 transition-transform duration-700"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            {watchProducts.map((p) => (
              <ProductCard key={p.id} product={p} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* 7. WALLET CATEGORY WISE BANNER & PRODUCTS (DYNAMIC HIDE IF EMPTY) */}
      {walletProducts.length > 0 && (
        <section id="category-wallets-block" className="py-8 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">COLLECTION</span>
              <h2 className="text-lg md:text-2xl font-black text-neutral-900 uppercase tracking-tight">WALLETS</h2>
            </div>
            <Link to="/search?category=Wallets" className="text-xs font-extrabold text-neutral-800 hover:opacity-85 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* WALLET BANNER CARD */}
          <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden shadow-sm border border-neutral-150 mb-6 bg-neutral-900">
            <img 
              src="https://images.unsplash.com/photo-1627124357626-8e519213fbf5?w=1500&q=80" 
              alt="Wallet Banner Image" 
              className="w-full h-full object-cover object-center transform hover:scale-101 transition-transform duration-700"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            {walletProducts.map((p) => (
              <ProductCard key={p.id} product={p} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* 8. GIFT SET CATEGORY WISE BANNER & PRODUCTS (DYNAMIC HIDE IF EMPTY) */}
      {giftProducts.length > 0 && (
        <section id="category-gifts-block" className="py-8 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">COLLECTION</span>
              <h2 className="text-lg md:text-2xl font-black text-neutral-900 uppercase tracking-tight">GIFT SET</h2>
            </div>
            <Link to="/search?category=Gift Set" className="text-xs font-extrabold text-neutral-800 hover:opacity-85 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* GIFT COMBO BANNER CARD */}
          <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden shadow-sm border border-neutral-150 mb-6 bg-neutral-900">
            <img 
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1500&q=80" 
              alt="Gift Combo Box Banner Image" 
              className="w-full h-full object-cover object-center transform hover:scale-101 transition-transform duration-700"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-6">
            {giftProducts.map((p) => (
              <ProductCard key={p.id} product={p} handleAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

// 1:1 Aspect ratio rounded product cards matching the layout specifications precisely
interface ProductCardProps {
  product: any;
  handleAddToCart: (product: any, e: React.MouseEvent) => void;
}

function ProductCard({ product, handleAddToCart }: ProductCardProps) {
  const discountPercent = product.discountPrice 
    ? Math.round(((product.price - product.discountPrice) / product.price) * 105 % 100)
    : 0;

  const resolvedImage = product.imageUrl || product.featured_image || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-[12px] border border-neutral-200 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all duration-300 relative select-none"
    >
      {/* 1:1 Aspect square image box */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-neutral-50/50 border-b border-neutral-100">
        <img 
          src={resolvedImage} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-103 duration-500 transition-transform"
          referrerPolicy="no-referrer"
        />
        
        {product.discountPrice && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md font-mono">
            {discountPercent}% OFF
          </span>
        )}
      </Link>

      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <span className="text-[8.5px] font-extrabold tracking-widest text-neutral-450 uppercase block mb-1">
            {product.category || 'EXQUISITE'}
          </span>
          <Link 
            to={`/product/${product.id}`} 
            className="text-[11px] sm:text-xs font-bold text-neutral-900 uppercase leading-snug tracking-tight block hover:text-neutral-700 line-clamp-2 min-h-[32px]"
          >
            {product.name}
          </Link>

          {/* Mini Ratings Details */}
          <div className="flex items-center gap-1 mt-1.5 mb-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star 
                  key={s} 
                  className={`w-2.5 h-2.5 ${s <= Math.round(product.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'}`} 
                />
              ))}
            </div>
            <span className="text-[9px] text-neutral-400 font-bold">({product.reviews || 12})</span>
          </div>
        </div>

        {/* Pricing System + Cart Call To Action */}
        <div className="mt-1">
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-xs sm:text-[13px] font-black text-neutral-950 font-mono">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-[9.5px] text-neutral-400 line-through font-mono">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button 
            type="button"
            onClick={(e) => handleAddToCart(product, e)}
            className="w-full py-1.5 bg-neutral-950 text-white hover:bg-neutral-900 font-mono text-[9px] font-extrabold uppercase tracking-wide rounded-md transition-colors flex items-center justify-center gap-1"
          >
            <ShoppingBag className="w-3 h-3" /> ADD TO CART
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1, 2, 3, 4].map(idx => (
        <div key={idx} className="bg-white rounded-xl h-[280px] border border-neutral-100" />
      ))}
    </div>
  );
}

function EmptyProductsPlaceholder() {
  return (
    <div className="bg-white p-6 rounded-2xl text-center border border-neutral-100 text-neutral-400 text-xs">
      No products available in this active collection list.
    </div>
  );
}
