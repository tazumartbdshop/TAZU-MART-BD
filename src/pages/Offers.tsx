import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Eye, Percent, Sparkles, Clock, ChevronRight, X, Plus, Star, Gift, Tag, Calendar
} from 'lucide-react';
import { formatPrice, cn } from '../lib/utils';
import { useProductStore, Product } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useOfferStore, Offer } from '../store/useOfferStore';

export default function Offers() {
  const { products } = useProductStore();
  const { addItem } = useCartStore();
  const { offers } = useOfferStore();

  // Selected Campaign Banner Id
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  // Quick View details modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Active / Visible campaigns on the offers page
  const activeOffers = offers.filter(o => o.status === 'Active' && o.offersPageVisibility !== false);

  // Read location hash tags to set initial active campaign (e.g. #offer-flash-sale)
  useEffect(() => {
    if (activeOffers.length > 0 && !selectedOfferId) {
      const hash = window.location.hash;
      if (hash) {
        const cleanedHash = hash.replace('#', '').toLowerCase();
        // Look up by exact ID, or matching normalized type / name
        const found = activeOffers.find(o => 
          o.id.toLowerCase() === cleanedHash || 
          o.type.toLowerCase().replace(/\s+/g, '-') === cleanedHash.replace('offer-', '') ||
          o.name.toLowerCase().replace(/\s+/g, '-') === cleanedHash.replace('offer-', '') ||
          o.name.toLowerCase().includes(cleanedHash.replace('offer-', ''))
        );
        if (found) {
          setSelectedOfferId(found.id);
          // Scroll smoothly to active section
          const el = document.getElementById('offers-banner-container');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      // Fallback to first available active campaign
      setSelectedOfferId(activeOffers[0].id);
    }
  }, [activeOffers, selectedOfferId]);

  // Handle Hash Changes dynamically
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && activeOffers.length > 0) {
        const cleanedHash = hash.replace('#', '').toLowerCase();
        const found = activeOffers.find(o => 
          o.id.toLowerCase() === cleanedHash || 
          o.type.toLowerCase().replace(/\s+/g, '-') === cleanedHash.replace('offer-', '') ||
          o.name.toLowerCase().replace(/\s+/g, '-') === cleanedHash.replace('offer-', '')
        );
        if (found) {
          setSelectedOfferId(found.id);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeOffers]);

  // Retrieve current active Offer Campaign schema
  const currentOffer = activeOffers.find(o => o.id === selectedOfferId) || activeOffers[0];

  // Map product IDs matching the current campaign to render
  const linkedProductIds = currentOffer 
    ? [...(currentOffer.productIds || []), ...(currentOffer.manualProductIds || [])]
    : [];

  // Strictly filter products connected with this Campaign ONLY (No random/matching or duplicates)
  const offerProducts = products.filter(p => linkedProductIds.includes(p.id) && p.status === 'active');

  // Handle Quick view opening
  const openQuickView = (p: Product) => {
    setSelectedProduct(p);
  };

  // Handle addition to cart
  const handleAddToCart = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    addItem({
      id: p.id,
      name: p.name,
      price: p.discountPrice || p.price,
      image: p.featured_image || p.image,
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Top Banner Navigation/Tabs Catalog */}
      <div className="bg-white border-b border-neutral-100 py-6 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-6">
            <span className="inline-flex items-center gap-1 bg-red-55 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-600 rounded">
              <Gift className="w-3.5 h-3.5" /> EXCLUSIVE CAMPAIGNS
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-sans font-black uppercase tracking-tight text-neutral-950">
              Live Promo Offer Hub
            </h1>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider max-w-lg mx-auto">
              Click any active campaign card below to browse its exclusive linked collections.
            </p>
          </div>

          {/* Grid list of Available Banners */}
          {activeOffers.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No promo sale campaigns are active right now. Please keep an eye out!
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {activeOffers.map((offer) => {
                const isSelected = selectedOfferId === offer.id;
                const bannerPic = offer.banners?.[0]?.url || offer.customBannerUrls?.[0];
                const countOfLinked = [...(offer.productIds || []), ...(offer.manualProductIds || [])].length;

                return (
                  <button
                    key={offer.id}
                    onClick={() => {
                      setSelectedOfferId(offer.id);
                      // Update URL hash for consistent route caching
                      window.location.hash = `offer-${offer.name.toLowerCase().replace(/\s+/g, '-')}`;
                    }}
                    className={cn(
                      "group relative flex flex-col text-left overflow-hidden rounded-xl border transition-all duration-300 focus:outline-none cursor-pointer",
                      isSelected 
                        ? "border-black bg-neutral-950 text-white shadow-md scale-[1.01]" 
                        : "border-neutral-200 bg-white text-neutral-850 hover:border-neutral-400 hover:shadow-sm"
                    )}
                  >
                    {/* Visual Card Top representing banner style */}
                    <div 
                      className={cn(
                        "h-20 w-full relative overflow-hidden bg-neutral-900 border-b",
                        offer.bannerMode !== 'custom' ? offer.bannerStyle : ""
                      )}
                      style={offer.bannerMode === 'custom' && bannerPic ? { backgroundImage: `url(${bannerPic})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                    >
                      {offer.bannerMode === 'custom' && (
                        <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-950/20 transition-all pointer-events-none" />
                      )}
                      <div className="absolute top-2 left-2">
                        <span className="text-[7.5px] font-black uppercase tracking-widest bg-white/90 text-black px-1.5 py-0.5 rounded border border-white/10 shadow-sm">
                          {offer.type}
                        </span>
                      </div>
                    </div>

                    {/* Meta section */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-tight leading-snug line-clamp-2">
                          {offer.name}
                        </h4>
                        <p className={cn(
                          "text-[9px] font-medium leading-relaxed line-clamp-1 mt-0.5",
                          isSelected ? "text-neutral-400" : "text-neutral-500"
                        )}>
                          {offer.description || 'Exclusive bundle collection.'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-dotted border-neutral-200/20 text-[9px] font-bold uppercase tracking-wide">
                        <span className={isSelected ? "text-neutral-300" : "text-neutral-500"}>Linked Store Items</span>
                        <span className={cn(
                          "font-mono px-1.5 py-0.5 rounded font-black",
                          isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-800"
                        )}>
                          {countOfLinked} ITEMS
                        </span>
                      </div>
                    </div>

                    {/* Selected Overlay Border glow */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 p-1">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section 1: LARGE HERO BANNER FOR THE SELECTED CAMPAIGN (Exact aspect ratio, responsive) */}
        {currentOffer && (
          <div 
            id="offers-banner-container" 
            className="w-full relative shadow-sm overflow-hidden border border-neutral-200/50 bg-neutral-950 transition-all rounded-xl"
          >
            {currentOffer.bannerMode === 'custom' && (currentOffer.banners?.[0]?.url || currentOffer.customBannerUrls?.[0]) ? (
              // Custom Uploaded Campaign Banner image
              <div className="w-full aspect-[16/9] sm:aspect-[21/9]">
                <img 
                  src={currentOffer.banners?.[0]?.url || currentOffer.customBannerUrls?.[0]} 
                  alt={currentOffer.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              // Gorgeous Styled Gradient Fallback Banner matching current offer theme
              <div className={cn(
                "w-full aspect-[16/9] sm:aspect-[21/9] flex flex-col items-center justify-center p-6 sm:p-12 text-center text-white relative overflow-hidden",
                currentOffer.bannerStyle || 'bg-gradient-to-tr from-neutral-950 via-zinc-900 to-neutral-950'
              )}>
                {/* Visual patterns */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-black/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-75" />
                
                <div className="space-y-4 max-w-xl relative shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/25 text-[10px] font-black uppercase tracking-widest rounded-md animate-bounce">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {currentOffer.type}
                  </div>
                  
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-sans font-black uppercase tracking-tight leading-none text-white drop-shadow">
                    {currentOffer.name}
                  </h1>
                  
                  <p className="text-xs sm:text-sm text-white/90 font-bold uppercase tracking-wider max-w-lg mx-auto">
                    {currentOffer.description || 'Exclusive premium discounts curated just for you. Do not miss out!'}
                  </p>
                  
                  <div className="pt-2 flex flex-wrap justify-center gap-2 text-[10px] font-bold uppercase font-mono tracking-widest text-neutral-200">
                    <span className="bg-black/30 px-2.5 py-1 rounded">Starts: {currentOffer.startDate}</span>
                    <span className="bg-black/30 px-2.5 py-1 rounded">Ends: {currentOffer.endDate}</span>
                  </div>
                </div>

                {/* Live indicators */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 text-[9px] font-mono tracking-widest uppercase border border-white/10 text-neutral-300 rounded">
                  <Clock className="w-3 h-3 text-red-400 animate-spin" /> LIVE CAMPAIGN
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Banner Info overlay summary details */}
        {currentOffer && (
          <div className="bg-white border border-neutral-150 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] bg-neutral-100 text-neutral-803 px-2 py-0.5 rounded font-black uppercase tracking-widest">
                {currentOffer.type}
              </span>
              <h2 className="text-base sm:text-lg font-sans font-black uppercase tracking-tight text-neutral-950">
                {currentOffer.name} Linked Collection
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {currentOffer.description || "Browse matching elements connected directly with this dynamic campaign launcher."}
              </p>
            </div>

            {/* Campaign Discount badges if available */}
            {currentOffer.discountType && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 shrink-0 flex items-center gap-3">
                <div className="p-2 bg-red-650 text-white rounded-lg">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[8px] font-bold text-red-500 uppercase tracking-wider block">Checkout Offer Discount</span>
                  <span className="text-sm font-black text-red-655 uppercase">
                    {currentOffer.discountType === 'percentage' 
                      ? `${currentOffer.discountValue}% Extra Discount` 
                      : `৳${currentOffer.discountValue} Off Entire Bundle`}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 2: STRICT LINKED CAMPAIGN PRODUCTS GRID */}
        <div id="offers-products-section" className="space-y-8">
          
          {offerProducts.length === 0 ? (
            <div className="py-24 text-center bg-white border border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="w-12 h-12 text-zinc-300" />
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-[#9CA3AF]">
                No Connected Products Found in This Sale
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed text-[#9CA3AF]">
                The administrator hasn't linked any products specifically to the "{currentOffer?.name || 'this'}" banner yet. Keep an eye out!
              </p>
            </div>
          ) : (
            <div>
              {/* Exact 2 Column Layout Grid on Mobile, matching desktop bento expansion */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {offerProducts.map((p) => {
                  const hasDiscount = p.discountPrice && p.discountPrice < p.price;
                  const discountPercent = hasDiscount 
                    ? Math.round(((p.price - p.discountPrice!) / p.price) * 100)
                    : 0;
                  
                  return (
                    <motion.div 
                      key={p.id}
                      layoutId={`offer-card-${p.id}`}
                      className="bg-white border border-zinc-200 overflow-hidden flex flex-col group relative transition-all hover:shadow-md cursor-pointer rounded-xl"
                      onClick={() => openQuickView(p)}
                    >
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white font-sans text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">
                          -{discountPercent}% OFF
                        </div>
                      )}

                      {/* Product Image Frame */}
                      <div className="aspect-square relative overflow-hidden bg-neutral-50/50 border-b border-neutral-100">
                        <img 
                          src={p.featured_image || p.image || null} 
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        {/* Interactive hover eye */}
                        <div className="absolute inset-0 bg-neutral-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-2.5 bg-white shadow-lg text-neutral-950 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <Eye className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      {/* Card Info Details */}
                      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 text-left">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-widest text-neutral-400 block font-mono">
                            {p.sku || 'N/A'} • {p.category}
                          </span>
                          <h3 className="font-sans font-bold text-xs sm:text-sm text-zinc-900 group-hover:text-red-601 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                            {p.name}
                          </h3>
                        </div>

                        <div className="space-y-2 pt-1">
                          {/* Price Display */}
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            {hasDiscount ? (
                              <>
                                <span className="text-sm sm:text-base font-black text-red-600">
                                  {formatPrice(p.discountPrice!)}
                                </span>
                                <span className="text-[10px] sm:text-xs text-zinc-400 line-through font-bold">
                                  {formatPrice(p.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm sm:text-base font-black text-zinc-950">
                                {formatPrice(p.price)}
                              </span>
                            )}
                          </div>

                          {/* Quick Actions Grid */}
                          <div className="grid grid-cols-1 gap-1.5 pt-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(e, p)}
                              className="w-full bg-neutral-950 text-white hover:bg-neutral-800 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[36px] cursor-pointer"
                            >
                              Add To Cart
                            </button>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openQuickView(p);
                              }}
                              className="w-full bg-white border border-zinc-200 hover:border-black text-zinc-700 hover:text-black text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[36px] cursor-pointer"
                            >
                              Quick View
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* QUICK VIEW POPUP DIALOG */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white border border-zinc-300 w-full max-w-2xl relative shadow-2xl p-6 overflow-y-auto max-h-[90vh] md:max-h-[85vh] flex flex-col md:flex-row gap-6 rounded-xl z-10"
            >
              {/* Close button trigger */}
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black transition-colors rounded-full border border-transparent hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Product Aspect Image View */}
              <div className="w-full md:w-1/2 aspect-square relative bg-zinc-50 border border-zinc-150 rounded-lg overflow-hidden shrink-0">
                <img 
                  src={selectedProduct.featured_image || selectedProduct.image || null} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Description & Cart Action */}
              <div className="flex-1 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-450 font-mono">
                    SKU: {selectedProduct.sku} • {selectedProduct.category}
                  </span>
                  <h2 className="text-base sm:text-lg font-sans font-black text-zinc-950 uppercase tracking-tight leading-snug">
                    {selectedProduct.name}
                  </h2>
                  
                  {/* Reviews rating mock */}
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-405 font-bold font-mono">4.9 (Live Verification)</span>
                  </div>
                </div>

                {/* Price indicators */}
                <div className="bg-zinc-50 p-3 border border-zinc-150 space-y-1 rounded-lg">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Special Campaign Pricing</span>
                  <div className="flex items-baseline gap-2">
                    {selectedProduct.discountPrice && selectedProduct.discountPrice < selectedProduct.price ? (
                      <>
                        <span className="text-xl font-black text-red-650">
                          {formatPrice(selectedProduct.discountPrice)}
                        </span>
                        <span className="text-xs text-zinc-400 line-through font-bold">
                          {formatPrice(selectedProduct.price)}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-650 font-sans font-black uppercase tracking-wider rounded">
                          Save {formatPrice(selectedProduct.price - selectedProduct.discountPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-zinc-950">
                        {formatPrice(selectedProduct.price)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Long description text block */}
                <div className="text-xs text-zinc-500 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                  {selectedProduct.description || "Premium high-quality guaranteed product from our authorized collection. Sourced from high-trust brands."}
                </div>

                {/* Action cart execution */}
                <div className="pt-2">
                  <button
                    onClick={(e) => {
                      handleAddToCart(e, selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-zinc-950 hover:bg-neutral-800 text-white font-sans font-black text-xs uppercase tracking-widest py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add To Shopping Bag
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
