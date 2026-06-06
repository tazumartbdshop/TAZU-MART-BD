import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Check, Menu, X, User, Heart, Percent, 
  Phone, MessageSquare, Mail, MapPin, ChevronRight, Compass, 
  Coins, Award, LogOut, ArrowRight, Trash2, CheckCircle, Ticket,
  Laptop, Smartphone, ShoppingCart, Zap, Star
} from 'lucide-react';
import { useWebsitesStore } from '../../store/useWebsitesStore';
import { useProductStore, Product } from '../../store/useProductStore';

export default function LiveWebsiteGenerator() {
  const { storeDomain } = useParams();
  const navigate = useNavigate();
  const website = useWebsitesStore(state => state.getWebsiteByDomain(storeDomain || ''));
  const { products } = useProductStore();

  // Navigation & Tabs
  const [currentView, setCurrentView] = useState<'home' | 'categories' | 'offers' | 'support' | 'account'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Cart & Wishlist & Coins
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [coins, setCoins] = useState<number>(350); // Default dynamic Tazu Coins
  const [orders, setOrders] = useState<any[]>([
    { id: 'ORD-8104', date: 'May 24, 2026', total: 1200, coinsEarned: 150, status: 'Shipped', itemsCount: 1 }
  ]);

  // Order Success Celebration Toast
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Favicon update
  useEffect(() => {
    if (website && website.logo) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = website.logo;
    }
    // Update Document Title
    if (website) {
      document.title = website.website_name + " - Shortcut Store";
    }
    return () => {
      document.title = "Tazu Mart BD";
    };
  }, [website]);

  if (!website) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-50">
        <h2 className="text-2xl font-black text-red-600 mb-2 font-mono uppercase">STORE NOT FOUND</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">The requested domain has not been deployed yet.</p>
        <Link to="/admin" className="px-6 py-3 bg-black text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors">
          Go To Website Builder
        </Link>
      </div>
    );
  }

  // Corner style setup
  const isSquare = website.theme_type?.includes('Sharp') || website.theme_type?.includes('Square') || !website.theme_type;
  const radiusClass = isSquare ? 'rounded-none' : 'rounded-lg';
  const inputClass = `w-full border border-zinc-200 p-3 text-sm font-bold outline-none bg-white transition-all focus:border-black ${radiusClass}`;
  const btnClass = `font-black text-xs uppercase tracking-widest hover:opacity-95 transition-all text-center select-none cursor-pointer flex items-center justify-center gap-2 px-6 py-3.5 text-white ${radiusClass}`;

  // Color dynamic styles
  const colPrimary = website.primary_color || '#000000';
  const currSign = website.currency === 'USD' ? '$' : '৳';

  // Categories loading
  const categoriesList = website.categories || ['Smartphone', 'Fashion', 'Grocery'];

  // Match and fetch products dynamically
  const getProductsByCategory = (catName: string) => {
    // Filter active products matching category name (case-insensitive)
    const matching = products.filter(p => p.category?.toLowerCase().trim() === catName.toLowerCase().trim() && p.status === 'active');
    
    if (matching.length > 0) return matching;

    // Fallbacks if store has no products for this category explicitly
    const fallbackImages: Record<string, string[]> = {
      smartphone: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
        "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400&q=80"
      ],
      fashion: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80",
        "https://images.unsplash.com/photo-1434389678369-182cb2088f11?w=400&q=80"
      ],
      grocery: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
        "https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&q=80",
        "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=400&q=80",
        "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&q=80"
      ]
    };

    const cleanCat = catName.toLowerCase().trim();
    let imgPool = fallbackImages.fashion;
    if (cleanCat.includes('phone') || cleanCat.includes('gadg') || cleanCat.includes('smart') || cleanCat.includes('elect')) {
      imgPool = fallbackImages.smartphone;
    } else if (cleanCat.includes('groc') || cleanCat.includes('food') || cleanCat.includes('eat') || cleanCat.includes('needs')) {
      imgPool = fallbackImages.grocery;
    }

    return [1, 2, 3, 4].map(n => ({
      id: `${cleanCat}-fallback-${n}`,
      name: `${catName} Premium Edition ${n}`,
      price: n * 850 + 420,
      discountPrice: n * 850 + 120,
      stock: 40,
      image: imgPool[(n - 1) % imgPool.length],
      category: catName,
      isNew: n === 1,
      rating: 4.5 + (n % 4) * 0.1,
      reviews: n * 14 + 3,
      reward_coins: n * 60,
      coin_enabled: true
    }));
  };

  // Get active items with optional search
  const getAllSearchableProducts = () => {
    // Generate combined product index for this store
    const list: any[] = [];
    categoriesList.forEach(cat => {
      const catProd = getProductsByCategory(cat);
      catProd.forEach((p: any) => {
        if (!list.some(existing => existing.id === p.id)) {
          list.push(p);
        }
      });
    });

    if (!searchQuery.trim()) return list;
    return list.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  };

  // Get offers products
  const getOfferProducts = () => {
    const list = getAllSearchableProducts();
    return list.filter(p => p.discountPrice && p.discountPrice < p.price);
  };

  // Cart operations
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const removeFromCart = (pId: string) => {
    setCart(cart.filter(item => item.product.id !== pId));
  };

  const updateCartQty = (pId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product.id === pId) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    }));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const cartTotal = getCartTotal();
    const earned = Math.round(cartTotal * 0.05); // 5% coin reward
    
    // Create actual order
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      total: cartTotal,
      coinsEarned: earned,
      status: 'Processing',
      itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0)
    };

    setOrders([newOrder, ...orders]);
    setCoins(prev => prev + earned);
    setCart([]);
    setCartOpen(false);
    setSuccessToast(`🎉 congrats! Order Placed successfully. You earned ${earned} Tazu Coins!`);
    setCurrentView('account');

    setTimeout(() => {
      setSuccessToast(null);
    }, 5000);
  };

  // Wishlist toggle
  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans flex flex-col relative pb-20 justify-between">
      
      {/* Dynamic Announcement Bar */}
      <div 
        style={{ backgroundColor: colPrimary }} 
        className="text-white text-center py-2.5 px-4 text-xs font-bold uppercase tracking-widest select-none flex items-center justify-center gap-2"
      >
        <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>Welcome to {website.business_name} - Earn dynamic {currSign} Coin Rewards on Checkout!</span>
      </div>

      {/* Success Order Overlay Toast */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
          <div className="bg-black text-white p-4 font-mono text-xs border border-zinc-800 shadow-xl flex items-start gap-3 relative animate-bounce">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <div className="flex-1 text-left font-sans font-bold leading-tight">
              {successToast}
            </div>
            <button onClick={() => setSuccessToast(null)}>
              <X className="w-4 h-4 hover:opacity-50" />
            </button>
          </div>
        </div>
      )}

      {/* Header Panel */}
      <header className="bg-white border-b border-gray-100 flex items-center justify-between p-4 sm:px-8 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Logo element: text fallback if no image url configured, otherwise nice branded image */}
          {website.logo ? (
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentView('home'); setSelectedCategory(null); }}>
              <img src={website.logo} alt="Logo" className="h-8 max-w-[120px] object-contain shrink-0" referrerPolicy="no-referrer" />
              <span className="font-extrabold text-sm tracking-tight text-gray-400 font-mono hidden sm:inline">{website.website_name.toUpperCase()}</span>
            </div>
          ) : (
            <div 
              onClick={() => { setCurrentView('home'); setSelectedCategory(null); }}
              className="font-black text-xl tracking-tighter uppercase cursor-pointer select-none"
            >
              {website.website_name}
            </div>
          )}
        </div>

        {/* Regular Header Routes */}
        <nav className="hidden sm:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-zinc-600">
          <button 
            onClick={() => { setCurrentView('home'); setSelectedCategory(null); }} 
            className={`hover:text-black transition-colors ${currentView === 'home' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'home' ? colPrimary : 'transparent' }}
          >
            Home
          </button>
          <button 
            onClick={() => { setCurrentView('categories'); setSelectedCategory(null); }} 
            className={`hover:text-black transition-colors ${currentView === 'categories' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'categories' ? colPrimary : 'transparent' }}
          >
            Categories
          </button>
          <button 
            onClick={() => setCurrentView('offers')} 
            className={`text-red-600 font-extrabold hover:text-black transition-all flex items-center gap-1 ${currentView === 'offers' ? 'border-b-2 border-red-600' : ''}`}
          >
            <Percent className="w-3.5 h-3.5" /> Offers
          </button>
          <button 
            onClick={() => setCurrentView('support')} 
            className={`hover:text-black transition-colors ${currentView === 'support' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'support' ? colPrimary : 'transparent' }}
          >
            Support
          </button>
          <button 
            onClick={() => setCurrentView('account')} 
            className={`hover:text-black transition-colors ${currentView === 'account' ? 'text-black border-b-2' : ''}`}
            style={{ borderBottomColor: currentView === 'account' ? colPrimary : 'transparent' }}
          >
            Account
          </button>
        </nav>

        {/* Cart & Profile controls */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setShowSearch(!showSearch)} 
              className="p-1.5 hover:bg-zinc-100 transition-colors rounded-full"
            >
              <Search className="w-5 h-5 text-gray-700 pointer" />
            </button>
          </div>

          <button 
            onClick={() => setCurrentView('account')} 
            className="p-1.5 hover:bg-zinc-150 transition-colors rounded-full relative"
          >
            <User className="w-5 h-5 text-gray-700" />
          </button>

          <button onClick={() => setCartOpen(true)} className="relative p-1.5 hover:bg-zinc-100 transition-colors rounded-full">
            <ShoppingBag className="w-5 h-5 cursor-pointer text-gray-700" />
            {cart.length > 0 && (
              <span 
                style={{ backgroundColor: colPrimary }}
                className="absolute top-0 right-0 text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white"
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Embedded Search Drawer */}
      {showSearch && (
        <div className="bg-white border-b border-zinc-200 p-4 animate-in slide-in-from-top duration-300">
          <div className="max-w-2xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder={`Search catalog... e.g. Shirt, Gadget`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 border border-zinc-200 text-sm font-bold outline-none focus:border-black ${radiusClass}`} 
              />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="px-3 bg-zinc-100 text-black hover:bg-zinc-200 text-xs font-bold uppercase"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Core Dynamic Body Panel */}
      <main className="flex-1 bg-white">
        
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="space-y-0">
            {/* Dynamic Hero Banner System (Force SQUARE 0px borders in standard flat modern style) */}
            <div className="p-0 sm:p-0">
              <div 
                className="aspect-[21/9] w-full min-h-[220px] sm:min-h-[350px] relative overflow-hidden border-b border-zinc-100"
                style={{ backgroundColor: `${colPrimary}10`, borderRadius: '0px' }} // Soft tint background
              >
                {/* Custom Banner Image */}
                <img 
                  src={website.banner || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80"} 
                  className="absolute inset-0 w-full h-full object-cover select-none" 
                  alt="Store banner"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Failover if broken link pasted
                    e.currentTarget.src = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80";
                  }}
                />
                
                {/* Ambient dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex flex-col justify-center p-6 sm:p-12 text-left">
                  <div className="text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 w-max mb-3 select-none rounded-none" style={{ backgroundColor: colPrimary }}>
                    {website.business_name} EXCLUSIVE
                  </div>
                  <h1 className="text-xl sm:text-4xl lg:text-5xl font-black uppercase text-white tracking-tight leading-none max-w-xl transition-all">
                    {website.website_name}
                  </h1>
                  <p className="text-gray-300 text-xs font-bold sm:text-sm mt-3 max-w-md line-clamp-2">
                    Professional, seamless e-commerce systems tailored dynamically for digital shoppers in {website.address || 'Bangladesh'}.
                  </p>
                  <div className="flex gap-4 mt-6">
                    <button 
                      onClick={() => { setCurrentView('categories'); }}
                      style={{ backgroundColor: colPrimary }}
                      className="text-white text-[10px] font-black px-6 py-3 uppercase tracking-widest hover:opacity-90 transition-all rounded-none"
                    >
                      Browse Catalog
                    </button>
                    <button 
                      onClick={() => setCurrentView('offers')}
                      className="bg-white/10 backdrop-blur-md border border-white/30 text-white text-[10px] font-black px-6 py-3 uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-none"
                    >
                      Hot Offers
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Search result banner if querying */}
            {searchQuery.trim() && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Search results for: "{searchQuery}"</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                  {getAllSearchableProducts().map((p: any) => (
                    <ProductSquareCard key={p.id} product={p} />
                  ))}
                  {getAllSearchableProducts().length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-400 font-bold text-sm">
                      No products matched your search.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General dynamic categories subsections (RULE 10: SMARTPHONE SECTION, FASHION SECTION, GROCERY SECTION) */}
            {!searchQuery.trim() && (
              <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6">
                {categoriesList.map((cat, idx) => {
                  const catProducts = getProductsByCategory(cat);
                  return (
                    <div key={idx} className="border-t border-zinc-100 pt-8 text-left">
                      <div className="flex justify-between items-end border-b border-zinc-100 pb-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6" style={{ backgroundColor: colPrimary }} />
                          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900">{cat}</h2>
                        </div>
                        <button 
                          onClick={() => { setSelectedCategory(cat); setCurrentView('categories'); }} 
                          className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-50 transition-all bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-zinc-800"
                        >
                          VIEW ALL →
                        </button>
                      </div>

                      {/* Products Grid (No horizontal product slider, premium grid, 2 products per row on mobile, 6 on desktop) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
                        {catProducts.slice(0, 6).map((p: any) => (
                          <ProductSquareCard key={p.id} product={p} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trust Badges */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
              <div className={`p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-zinc-50 border border-zinc-100 ${radiusClass}`}>
                {[
                  { icon: Zap, label: "Superfast Shipping", desc: `Available in ${website.address || 'Bangladesh'}` },
                  { icon: ShieldCheckMock, label: "Secure Payment Methods", desc: `Using local ${website.currency || 'BDT'} gateways` },
                  { icon: MessageSquare, label: "Client Support", desc: `${website.support_number || 'Direct Contact'}` },
                  { icon: Award, label: "Verified Shop Guarantee", desc: "100% genuine products" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 text-left">
                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 border border-zinc-200 bg-white`} style={{ color: colPrimary }}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tight">{item.label}</p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: CATEGORIES */}
        {currentView === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Catalog Categories</h1>
            
            {/* Category selection row buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button 
                onClick={() => setSelectedCategory(null)} 
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest border transition-all ${!selectedCategory ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-black'}`}
              >
                All Products ({getAllSearchableProducts().length})
              </button>
              {categoriesList.map((cat, idx) => {
                const isActive = selectedCategory?.toLowerCase().trim() === cat.toLowerCase().trim();
                return (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedCategory(cat)} 
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest border transition-all ${isActive ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-black'}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Grid display */}
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {(selectedCategory ? getProductsByCategory(selectedCategory) : getAllSearchableProducts()).map((p: any) => (
                  <ProductSquareCard key={p.id} product={p} />
                ))}
              </div>
              {(selectedCategory ? getProductsByCategory(selectedCategory) : getAllSearchableProducts()).length === 0 && (
                <div className="text-center py-20 text-gray-400 font-bold">
                  No products added yet. Start adding products from your admin dashboard!
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: OFFERS */}
        {currentView === 'offers' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-red-600 flex items-center gap-2">
                  <Percent className="w-8 h-8 animate-pulse" /> Hot Offers Panel
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Exclusive discount prices with dynamic coin rewards</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {getOfferProducts().map((p: any) => (
                <ProductSquareCard key={p.id} product={p} />
              ))}
              {getOfferProducts().length === 0 && (
                <div className="col-span-full text-center py-24 text-gray-400 font-bold max-w-md mx-auto">
                  <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-4 rounded-none">
                    <Ticket className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="uppercase tracking-widest text-xs">No active discount campaign found. Check back later!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: SUPPORT */}
        {currentView === 'support' && (
          <div className="max-w-3xl mx-auto px-4 py-12 text-left">
            <div className="mb-10 text-center sm:text-left">
              <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900">Support Center</h1>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-2">Get in touch directly with our business assistants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-zinc-50 border border-zinc-150 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase text-black tracking-tight mb-4">Direct Contact</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-zinc-200 bg-white flex items-center justify-center shrink-0" style={{ color: colPrimary }}>
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Call Support</p>
                        <a href={`tel:${website.support_number}`} className="text-sm font-bold text-black hover:underline">{website.support_number || '+8801700000000'}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-zinc-200 bg-white flex items-center justify-center shrink-0 text-emerald-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">WhatsApp Chat</p>
                        <a 
                          href={`https://wa.me/${website.support_number?.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="text-sm font-bold text-emerald-600 hover:underline"
                        >
                          Chat Live Now
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-none border border-zinc-200 bg-white flex items-center justify-center shrink-0 text-blue-600">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Email Address</p>
                        <a href={`mailto:${website.admin_email}`} className="text-sm font-bold text-black hover:underline truncate block max-w-[200px]">{website.admin_email || 'support@client.com'}</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-200">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Corporate Address</p>
                  <p className="text-xs font-bold text-zinc-750 flex items-center gap-1.5 leading-snug">
                    <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                    {website.address || 'Dhaka, Bangladesh'}
                  </p>
                </div>
              </div>

              {/* Secure message sender form right on screen */}
              <form onSubmit={(e) => { e.preventDefault(); alert("Thanks! Message transmitted to corporate desk."); }} className="border border-zinc-200 p-6 space-y-4">
                <h3 className="text-base font-black uppercase tracking-wide text-black">Transmit Message</h3>
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Full Name</label>
                  <input type="text" required className={inputClass} placeholder="Enter your name" />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">WhatsApp or Phone</label>
                  <input type="text" required className={inputClass} placeholder="+880..." />
                </div>
                <div>
                  <label className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">Your Message or Issue</label>
                  <textarea required className={`${inputClass} h-20 resize-none`} placeholder="Write details here..."></textarea>
                </div>
                <button type="submit" style={{ backgroundColor: colPrimary }} className={btnClass}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 5: ACCOUNT */}
        {currentView === 'account' && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-left">
            <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Customer Terminal</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Profile card & balance */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-zinc-900 text-white p-6 border border-zinc-800 flex flex-col justify-between min-h-[200px] relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-5">
                    <Coins className="w-32 h-32 text-yellow-400" />
                  </div>
                  <div className="relative z-10">
                     <span className="text-[8px] font-black tracking-widest uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">Primary Account</span>
                     <h3 className="text-lg font-black uppercase tracking-tight mt-3">Active Guest Member</h3>
                     <p className="text-[10px] font-mono text-zinc-400 mt-0.5">UID-249581-G</p>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-zinc-800 relative z-10 flex justify-between items-center bg-zinc-950/60 p-2.5">
                     <div className="flex items-center gap-2">
                        <span className="text-lg">🎁</span>
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">Coins Reward Balance</p>
                          <p className="text-sm font-black text-yellow-400 mt-0.5">{coins} Tazu Coins</p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Wishlist panel */}
                <div className="border border-zinc-200 p-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500 fill-current" /> Saved Items ({wishlist.length})
                  </h3>
                  <div className="space-y-3">
                    {wishlist.map(pId => {
                      // Match product
                      const list = getAllSearchableProducts();
                      const found = list.find(p => p.id === pId);
                      if (!found) return null;
                      return (
                        <div key={pId} className="flex gap-2 items-center justify-between border-b border-zinc-50 pb-2">
                          <div className="flex gap-2 items-center min-w-0">
                            <img src={found.image} className="w-8 h-8 object-cover shrink-0" alt="product" referrerPolicy="no-referrer" />
                            <p className="text-xs font-bold uppercase truncate max-w-[120px]">{found.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-black">{currSign}{found.discountPrice || found.price}</span>
                            <button onClick={() => toggleWishlist(pId)} className="text-red-500 hover:text-red-800"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                    {wishlist.length === 0 && (
                      <p className="text-xs font-bold text-gray-400 py-4 uppercase tracking-wider text-center">Your wishlist is empty.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Orders block */}
              <div className="md:col-span-2 space-y-6">
                <div className="border border-zinc-200 p-6 bg-white shrink-0">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black uppercase tracking-tight">Your Orders ({orders.length})</h3>
                    <span className="text-[10px] font-black uppercase bg-zinc-50 border border-zinc-200 px-2 py-1 text-zinc-500 tracking-wider">Sync Complete</span>
                  </div>

                  <div className="space-y-4">
                    {orders.map((o, idx) => (
                      <div key={idx} className="border border-zinc-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-black">{o.id}</span>
                            <span className="px-2 py-0.5 text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200">{o.status}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase">{o.date} • {o.itemsCount} Items</p>
                        </div>
                        <div className="flex items-center gap-6 justify-between sm:justify-end">
                          <div className="text-left sm:text-right">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Total Purchase</p>
                            <p className="text-sm font-black text-black">{currSign}{o.total.toLocaleString()}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Earned Coins</p>
                            <p className="text-xs font-black text-yellow-500 flex items-center gap-0.5">+{o.coinsEarned} <Coins className="w-3 h-3" /></p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="text-center py-12 text-gray-400 font-bold">You have placed no orders yet!</div>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-150 p-6">
                   <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 font-sans font-bold">Support System Info</h4>
                   <p className="text-[12px] font-bold text-gray-600 leading-relaxed mb-4">
                     Any inquiries, refund demands or delivery questions regarding your purchases can be directly transacted by ringing our help line.
                   </p>
                   <button 
                     onClick={() => { setCurrentView('support'); }}
                     style={{ backgroundColor: colPrimary }}
                     className="px-6 py-2.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow"
                   >
                     Speak to Assistants
                   </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer System */}
      <footer className="bg-black text-white py-16 px-4 sm:px-8 text-center sm:text-left">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto">
           <div>
             {website.logo ? (
               <img src={website.logo} alt="Footer Logo" className="h-8 max-w-[124px] object-contain mb-4 select-none invert" referrerPolicy="no-referrer" />
             ) : (
               <div className="font-black text-xl tracking-tighter uppercase mb-4">{website.website_name}</div>
             )}
             <p className="text-gray-405 text-xs font-bold leading-relaxed max-w-xs mx-auto sm:mx-0 text-zinc-400">
               Premium Shortcut Commerce Layout system customized dynamically for {website.business_name}. Serving {website.address || 'Bangladesh'} shoppers.
             </p>
           </div>
           <div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-4">Shop Menu</h4>
             <ul className="space-y-2 text-gray-400 text-xs font-bold">
               <li><button onClick={() => { setCurrentView('home'); }} className="hover:text-white transition-colors">Catalog Home</button></li>
               <li><button onClick={() => { setCurrentView('categories'); }} className="hover:text-white transition-colors">Categories</button></li>
               <li><button onClick={() => { setCurrentView('offers'); }} className="hover:text-white text-red-400 transition-colors">Active Offers</button></li>
             </ul>
           </div>
           <div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-4">Support & Help</h4>
             <ul className="space-y-2 text-gray-400 text-xs font-bold">
               <li><button onClick={() => { setCurrentView('support'); }} className="hover:text-white transition-colors">Contract Support</button></li>
               <li><span className="text-zinc-500 uppercase text-[9px] block">TEL: {website.support_number}</span></li>
               <li><span className="text-zinc-500 uppercase text-[9px] block">ADDR: {website.address}</span></li>
             </ul>
           </div>
           <div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-4">Newsletter Transmissions</h4>
             <div className={`flex border border-zinc-800 ${radiusClass}`}>
               <input type="email" placeholder="Email Address" className="bg-transparent px-4 py-3 w-full text-xs outline-none" />
               <button 
                 onClick={() => alert("Successfully joined the transmission list.")}
                 className="bg-white text-black px-4 font-black uppercase tracking-widest text-[9px]"
               >
                 Join
               </button>
             </div>
           </div>
        </div>
      </footer>

      {/* Dynamic Mobile Bottom Sticky Navigation Bar (RULE 13) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-2.5 z-40 px-6 sm:hidden flex justify-between items-center text-center">
        <button 
          onClick={() => { setCurrentView('home'); setSelectedCategory(null); }} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'home' ? 'text-black' : 'text-gray-400'}`}
        >
          <Compass className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          {currentView === 'home' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>

        <button 
          onClick={() => { setCurrentView('categories'); setSelectedCategory(null); }} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'categories' ? 'text-black' : 'text-gray-400'}`}
        >
          <Menu className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Categories</span>
          {currentView === 'categories' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>

        <button 
          onClick={() => setCurrentView('offers')} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'offers' ? 'text-red-600' : 'text-gray-400'}`}
        >
          <Percent className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Offers</span>
          {currentView === 'offers' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full bg-red-600" />}
        </button>

        <button 
          onClick={() => setCurrentView('support')} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'support' ? 'text-black' : 'text-gray-400'}`}
        >
          <Phone className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Support</span>
          {currentView === 'support' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>

        <button 
          onClick={() => setCurrentView('account')} 
          className={`flex flex-col items-center gap-1 flex-1 relative ${currentView === 'account' ? 'text-black' : 'text-gray-400'}`}
        >
          <User className="w-5 h-5 shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
          {currentView === 'account' && <span className="absolute bottom-[-10px] w-6 h-1 rounded-full" style={{ backgroundColor: colPrimary }} />}
        </button>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="w-full max-w-sm bg-white h-full relative z-10 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tight">Your Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</h2>
              <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-zinc-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex gap-3 border border-zinc-100 p-2 relative">
                  <img src={item.product.image || null} className="w-16 h-20 object-cover bg-zinc-50 shrink-0" alt="cart item" referrerPolicy="no-referrer" />
                  <div className="flex-1 flex flex-col justify-between text-left min-w-0">
                    <div>
                      <h3 className="font-extrabold text-xs uppercase tracking-tight truncate">{item.product.name}</h3>
                      <p className="text-[9px] font-black text-gray-500 uppercase mt-0.5">{item.product.category}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-zinc-205 text-xs font-black">
                        <button onClick={() => updateCartQty(item.product.id, -1)} className="px-2 py-0.5 bg-zinc-50 hover:bg-zinc-100">-</button>
                        <span className="px-3 py-0.5 border-x border-zinc-100 bg-white">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.product.id, 1)} className="px-2 py-0.5 bg-zinc-50 hover:bg-zinc-100">+</button>
                      </div>
                      <p className="font-extrabold text-sm">{currSign}{(item.product.discountPrice || item.product.price) * item.quantity}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    className="absolute top-2 right-2 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-zinc-400">
                  <ShoppingBag className="w-12 h-12 stroke-1 opacity-40 mb-3" />
                  <p className="text-xs font-black uppercase tracking-wider">Your shopping card is empty</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-zinc-50 space-y-4">
              <div className="flex justify-between font-extrabold text-xs uppercase tracking-wider text-gray-500">
                <span>Cart Subtotal</span>
                <span className="text-black text-base font-black">{currSign}{getCartTotal().toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold leading-normal text-left">
                * checkout automatically rewards 5% of order value back in secure {website.website_name} coins.
              </p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => { setCart([]); setCartOpen(false); }}
                  className={`px-4 py-3 bg-white hover:bg-zinc-100 border border-zinc-200 text-black font-bold text-xs uppercase tracking-wider shrink-0 ${radiusClass}`}
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="flex-1 text-white py-3 text-xs font-black uppercase tracking-widest disabled:opacity-50 select-none cursor-pointer flex justify-center items-center gap-2"
                  style={{ backgroundColor: colPrimary }}
                >
                  <Zap className="w-4 h-4 text-yellow-300 fill-current" /> Checkout & Earn Coins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // Private component helper for square product card
  function ProductSquareCard({ product, key }: { product: any; key?: any }) {
    const originalPrice = product.price;
    const activePrice = product.discountPrice || originalPrice;
    const hasDiscount = originalPrice > activePrice;
    const savingsPercentage = hasDiscount ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;
    
    const isSaved = wishlist.includes(product.id);

    return (
      <div className="group border border-zinc-100 bg-white hover:border-zinc-300 transition-all text-left flex flex-col justify-between rounded-none">
        <div className="aspect-square w-full relative overflow-hidden bg-zinc-50 rounded-none">
          <img 
            src={product.image || null} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt={product.name} 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80";
            }}
          />

          {/* Tag labels */}
          {hasDiscount && (
            <div className="absolute top-2.5 left-2.5 bg-red-650 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 uppercase tracking-widest rounded-none">
              -{savingsPercentage}% Off
            </div>
          )}

          {/* Coins tag (RULE 11: Products show coin badge) */}
          <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2 py-1 flex items-center gap-1 border border-white/10 rounded-none">
            <Coins className="w-3 h-3 text-yellow-400" />
            <span className="text-[8px] font-black text-white uppercase tracking-tighter">+{product.reward_coins || 100} Coins</span>
          </div>

          {/* Quick Cart Actions hover buttons */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
              className="p-2.5 bg-white backdrop-blur shadow-md hover:bg-neutral-50 transition-colors shrink-0 rounded-none"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-red-500 fill-current' : 'text-neutral-600'}`} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="flex-1 bg-black text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md hover:bg-neutral-900 transition-colors rounded-none"
            >
              <ShoppingBag className="w-3.5 h-3.5 animate-pulse" /> Add to Cart
            </button>
          </div>
        </div>

        {/* Content details */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block leading-none mb-1">{product.category}</span>
            <h3 className="text-xs font-black uppercase tracking-tight text-zinc-800 line-clamp-1 group-hover:text-black">{product.name}</h3>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-black">{currSign}{activePrice.toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through font-bold">{currSign}{originalPrice.toLocaleString()}</span>
              )}
            </div>
            
            <div className="flex items-center gap-0.5 text-yellow-400">
               <Star className="w-3 h-3 fill-current" />
               <span className="text-[9px] font-extrabold text-zinc-500 leading-none mt-0.5">{(product.rating || 4.7).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Shell Icons Mock
const ShieldCheckMock = ShieldCheck;
function ShieldCheck({ className }: { className?: string }) {
  return <CheckCircle className={className} />;
}
