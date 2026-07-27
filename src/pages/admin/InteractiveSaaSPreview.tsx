import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Monitor, Tablet, Smartphone, Search, Heart, ShoppingBag, User, 
  ChevronDown, Home, LayoutGrid, LifeBuoy, ArrowLeft, ArrowRight, 
  Check, Play, Plus, Trash2, Coins, Gift, Mail, Facebook, CreditCard, 
  Truck, Shield, Activity, Send, LogOut, Loader2, Star, Zap, Save, CheckCircle, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IMAGES } from './demoPages';
import { useSettingsStore } from '../../store/useSettingsStore';

interface TemplateDemoModalProps {
  template: any;
  onClose: () => void;
  onUse: () => void;
  formData?: any;
}

export function TemplateDemoModal({ template, onClose, onUse, formData }: TemplateDemoModalProps) {
  const settings = useSettingsStore(state => state.settings);
  const emailToShow = settings.adminEmail || "admin.tazumartbd@gmail.com";
  const passwordToShow = settings.adminPassword || "8963885522";

  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activePage, setActivePage] = useState('Homepage');

  // Multi-Domain SaaS state parameters matching Create Form or defaults
  const websiteName = formData?.name?.trim() || template?.name || 'TAZU MART MASTER UI';
  const logoUrl = formData?.logo?.trim() || settings.storeLogo || null;
  const bannerUrl = formData?.banner?.trim() || null;
  const primaryColor = formData?.color || '#000000';
  const fontPreset = formData?.font || 'Inter (Sans-serif)';
  const themeType = formData?.theme_type || 'Sharp Corners (Square)';
  const categoriesList = formData?.categories?.length > 0 ? formData.categories : ['Smartphone', 'Fashion', 'Grocery'];
  const hotline = formData?.phone || '+8801700000000';
  const currencyCode = formData?.currency || 'BDT';
  const currencySymbol = currencyCode === 'BDT' ? '৳' : '$';

  // Dynamic Class Resolution
  const fontClass = fontPreset.includes('Grotesk') ? 'font-sans tracking-tight' : fontPreset.includes('Mono') ? 'font-mono' : fontPreset.includes('Playfair') ? 'font-serif' : 'font-sans';
  const roundedClass = themeType.includes('Sharp') ? 'rounded-none' : themeType.includes('Capsule') ? 'rounded-full' : 'rounded';
  const subdomain = formData?.domain?.trim() || 'my-shop';

  // Live eCommerce interactive states
  const [cart, setCart] = useState<{ id: string; name: string; price: number; image: string; quantity: number; category: string; coins: number }[]>([]);
  const [earnedCoins, setEarnedCoins] = useState<number | null>(null);
  const [showCoinPopup, setShowCoinPopup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoriesList[0]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isLogged, setIsLogged] = useState(false);
  const [searchWord, setSearchWord] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Router history simulation for back and forward buttons
  const [history, setHistory] = useState<string[]>(['Homepage']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync selectedCategory when form changes categoriesList
  useEffect(() => {
    if (categoriesList.length > 0 && !categoriesList.includes(selectedCategory)) {
      setSelectedCategory(categoriesList[0]);
    }
  }, [categoriesList]);

  const navigateTo = (page: string) => {
    // If navigating, push to simulated history
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(page);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setActivePage(page);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1;
      setHistoryIndex(idx);
      setActivePage(history[idx]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1;
      setHistoryIndex(idx);
      setActivePage(history[idx]);
    }
  };

  // Add product to simulated cart
  const onAddCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + (product.quantity || 1) } : item);
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    setEarnedCoins(product.coins || 100);
    setShowCoinPopup(true);
  };

  const onPlaceOrder = () => {
    const trackingId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderId(trackingId);
    setCart([]); // Reset Cart
    navigateTo('Order Tracking');
  };

  const pages = [
    'Homepage', 'Category Page', 'Product Page', 'Cart Page', 'Checkout', 
    'Login Page', 'Customer Panel', 'My Rewards', 'Order Tracking', 'Support Page', 'Admin Panel'
  ];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-zinc-100 ${fontClass}`}>
      {/* SaaS Developer Header Controls */}
      <div className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 transition-colors mr-1">
            <X className="w-5 h-5 text-gray-400 hover:text-black" />
          </button>
          <div className="hidden md:block text-left">
            <h3 className="text-xs font-black text-black uppercase tracking-tight leading-none">{websiteName}</h3>
            <span className="text-[9px] text-[#2563EB] font-sans font-extrabold uppercase tracking-widest leading-none block mt-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping" /> Live Interactive Simulation
            </span>
          </div>
        </div>

        {/* Viewport/Device Width Switchers */}
        <div className="flex items-center bg-zinc-100 border border-zinc-200 p-0.5 rounded-sm">
          <button 
            type="button"
            onClick={() => setDevice('desktop')}
            className={`p-2 transition-all ${device === 'desktop' ? 'bg-white shadow-sm font-black text-black' : 'text-gray-400 hover:text-black'}`}
            title="Desktop View (FullScreen)"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => setDevice('tablet')}
            className={`p-2 transition-all ${device === 'tablet' ? 'bg-white shadow-sm font-black text-black' : 'text-gray-400 hover:text-black'}`}
            title="Tablet Width (768px)"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => setDevice('mobile')}
            className={`p-2 transition-all ${device === 'mobile' ? 'bg-white shadow-sm font-black text-black' : 'text-gray-400 hover:text-black'}`}
            title="Mobile Portrait (375px)"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Action button: Install template as actual live website */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onClose} 
            className="hidden md:flex px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-white hover:text-black border border-zinc-200 hover:bg-zinc-50 transition-colors items-center gap-1.5"
          >
            Close Preview
          </button>
          <button 
            type="button"
            onClick={onUse} 
            className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-black text-white hover:bg-zinc-805 hover:bg-zinc-900 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Install Website
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Quick navigation toolbar */}
        <div className="w-56 bg-zinc-900 border-r border-zinc-800 hidden md:flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="p-4 space-y-1">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4 px-4 font-bold">Simulator Sitemap</p>
            {pages.map(page => (
              <button 
                type="button"
                key={page} 
                onClick={() => navigateTo(page)}
                className={`w-full text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest transition-all border-l-2 ${activePage === page ? 'bg-white text-black border-l-orange-500' : 'text-zinc-400 border-l-transparent hover:text-white hover:bg-zinc-800'}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          {/* 7. TEMPLATE LOGIN INFORMATION Section - Dynamic from store */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 font-sans">
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">DEMO ADMIN LOGIN</p>
            <div className="bg-zinc-900 border border-zinc-800 p-2.5 font-mono text-[9px] text-zinc-300 space-y-2 select-all rounded-none">
              <div>
                <span className="text-zinc-550 text-[7px] font-black uppercase tracking-widest block text-zinc-500 mb-0.5">Email</span>
                <span className="font-extrabold text-white text-[11px] block break-all leading-tight">{emailToShow}</span>
              </div>
              <div>
                <span className="text-zinc-550 text-[7px] font-black uppercase tracking-widest block text-zinc-500 mb-0.5">Password</span>
                <span className="font-extrabold text-white text-[11px] block">{passwordToShow}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-zinc-200 flex flex-col relative overflow-hidden">
          {/* Flat UI Browser Address Bar */}
          <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-1.5 flex items-center justify-between gap-4 select-none text-[10px] shrink-0 font-mono">
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 block" />
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 shrink-0">
              <button 
                type="button"
                disabled={historyIndex === 0} 
                onClick={handleBack} 
                className="p-1 hover:bg-zinc-150 rounded disabled:opacity-30 transition-all font-bold"
              >
                ←
              </button>
              <button 
                type="button"
                disabled={historyIndex === history.length - 1} 
                onClick={handleForward} 
                className="p-1 hover:bg-zinc-150 rounded disabled:opacity-30 transition-all font-bold"
              >
                →
              </button>
              <button 
                type="button"
                onClick={() => navigateTo('Homepage')} 
                className="p-1 hover:bg-zinc-150 rounded transition-all"
              >
                ↻
              </button>
            </div>
            <div className="flex-1 max-w-xl bg-white border border-gray-350 border-zinc-300 rounded px-3 py-1 flex items-center gap-2 text-zinc-550 truncate">
              <span className="text-green-600">🔒</span>
              <span className="text-zinc-700 tracking-wide select-all text-ellipsis overflow-hidden truncate">
                https://{subdomain}.tazumart.com/preview/{activePage.toLowerCase().replace(' ', '-')}
              </span>
            </div>
            <div className="text-[8px] uppercase font-black tracking-widest text-[#10B981] bg-emerald-50 px-2.5 py-0.5 border border-emerald-150 border-emerald-200 rounded-sm">
              Secured Temporary Live Port
            </div>
          </div>

          {/* Interactive Simulation Frame Box */}
          <div className="flex-1 overflow-auto px-4 pb-4 md:px-8 md:pb-8 pt-0 flex flex-col items-center justify-start scrollbar-hide">
            <div className={`bg-white shadow-[0_10px_50px_rgba(0,0,0,0.12)] transition-all duration-500 relative h-[720px] border border-zinc-300 flex flex-col overflow-y-auto scrollbar-hide rounded-none ${device === 'desktop' ? 'w-full max-w-7xl' : device === 'tablet' ? 'w-[768px]' : 'w-[375px]'}`}>
              <MockDemoContent 
                activePage={activePage} 
                template={template} 
                device={device}
                formData={formData}
                onNavigate={navigateTo}
                cart={cart}
                setCart={setCart}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                isLogged={isLogged}
                setIsLogged={setIsLogged}
                searchWord={searchWord}
                setSearchWord={setSearchWord}
                onAddCart={onAddCart}
                showSupportModal={showSupportModal}
                setShowSupportModal={setShowSupportModal}
                onPlaceOrder={onPlaceOrder}
                orderId={orderId}
                websiteName={websiteName}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                primaryColor={primaryColor}
                themeType={themeType}
                categoriesList={categoriesList}
                hotline={hotline}
                currencyCode={currencyCode}
                currencySymbol={currencySymbol}
                fontClass={fontClass}
                roundedClass={roundedClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daraz-style Coin popup */}
      <AnimatePresence>
        {showCoinPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm z-[110]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 30 }} 
              className={`bg-white border-2 border-black max-w-sm w-full p-8 text-center shadow-[0_15px_60px_rgba(0,0,0,0.5)] ${roundedClass}`}
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-400 animate-bounce">
                <Coins className="w-10 h-10 text-amber-500 fill-current" />
              </div>
              <h2 className="text-xl font-black uppercase text-amber-600 tracking-tight mb-1">🎉 Coins Accumulated!</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6">
                You successfully acquired <span className="text-black font-extrabold font-mono">+{earnedCoins} Tazu Coins</span>
              </p>
              <div className="bg-zinc-50 border border-zinc-200 p-4 mb-6 text-left">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#10B981] mb-1 leading-none">Coins Reward Wallet Balance</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs">🪙</span>
                  <p className="text-lg font-mono font-black text-black">1,250 Coins</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCoinPopup(false)} 
                style={{ backgroundColor: primaryColor }}
                className={`w-full py-3 text-center text-[10px] font-black text-white uppercase tracking-widest hover:brightness-95 transition-all ${roundedClass}`}
              >
                Keep Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------
// STANDALONE HEADER AND LOGOUT SUBCOMPONENTS TO ISOLATE REACT RENDERS
// -------------------------------------------------------------

const DemoGlobalHeader = ({ 
  template, 
  onNavigate, 
  cartCount,
  websiteName,
  logoUrl,
  primaryColor,
  categoriesList,
  setSelectedCategory,
  isLogged,
  fontClass,
  roundedClass,
  onAdminLoginClick
}: any) => {
  const handleAdminLogin = () => {
    if (onAdminLoginClick) {
      onAdminLoginClick();
    } else {
      onNavigate('Admin Panel');
    }
  };

  return (
    <div className={`bg-white border-b-2 border-black z-[110] sticky top-0 shadow-sm ${fontClass}`}>
      <div className="bg-black text-white text-[9px] font-black uppercase tracking-widest text-center py-2 flex items-center justify-center gap-4 select-none shrink-0">
        <span>Free Delivery on All Orders Over ৳2,000</span>
        <span className="hidden sm:inline">|</span>
        <span>Earn Rewards with Tazu Coins</span>
      </div>
      <div className="px-4 py-3 sm:py-4 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4 animate-in fade-in">
          <Menu className="w-5 h-5 lg:hidden cursor-pointer" onClick={() => onNavigate('Category Page')} />
          {logoUrl ? (
            <img src={logoUrl} className="h-6 max-h-8 max-w-[120px] object-contain cursor-pointer" alt={websiteName} onClick={() => onNavigate('Homepage')} />
          ) : (
            <div className="font-extrabold text-lg tracking-tighter uppercase cursor-pointer text-gray-950" onClick={() => onNavigate('Homepage')}>{websiteName}</div>
          )}
        </div>
        
        {/* Dynamic header routes */}
        <div className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span className="text-black hover:opacity-75 cursor-pointer font-bold" onClick={() => onNavigate('Homepage')}>Home</span>
          <div className="relative group cursor-pointer">
            <span className="hover:text-black flex items-center gap-1 py-1 font-bold">Categories <ChevronDown className="w-3 h-3" /></span>
            <div className="absolute top-6 left-0 w-48 bg-white border border-black shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-1.5 z-[150] text-left rounded-none">
              {categoriesList.map((cat: string) => (
                <span 
                  key={cat} 
                  onClick={() => { setSelectedCategory(cat); onNavigate('Category Page'); }}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-700 p-2.5 hover:bg-zinc-50 cursor-pointer hover:text-black"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <span className="hover:text-black cursor-pointer font-bold" onClick={() => onNavigate('Category Page')}>Shop Collection</span>
          <span className="text-red-650 hover:text-red-700 flex items-center gap-1 cursor-pointer font-bold" onClick={() => onNavigate('Homepage')}><Activity className="w-3.5 h-3.5" /> Hot Offers</span>
          <span className="hover:text-black cursor-pointer font-bold" onClick={() => onNavigate('Order Tracking')}>Track Order</span>
          <span className="hover:text-black cursor-pointer font-bold" onClick={() => onNavigate('Support Page')}>Live Support</span>
        </div>
 
        <div className="flex items-center gap-3.5 text-gray-500 shrink-0">
          {/* Always Visible [Admin Login] Button removed */}
          
          <Search className="w-5 h-5 cursor-pointer hover:text-black shrink-0" onClick={() => onNavigate('Category Page')} />
          <div className="hidden sm:flex relative cursor-pointer hover:text-black shrink-0 animate-in fade-in" onClick={() => onNavigate('My Rewards')}>
            <Gift className="w-5 h-5 text-amber-500 fill-amber-100" />
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[8px] font-black min-w-3 px-1 py-0.5 rounded-full flex items-center justify-center">🎁</span>
          </div>
          <div className="flex relative cursor-pointer text-gray-950 shrink-0 select-none" onClick={() => onNavigate('Cart Page')}>
            <ShoppingBag className="w-5 h-5" />
            <span 
              style={{ backgroundColor: primaryColor }}
              className="absolute -top-1.5 -right-1.5 text-white text-[8px] font-black min-w-4 h-4 rounded-full flex items-center justify-center p-0.5 text-center leading-none"
            >
              {cartCount}
            </span>
          </div>
          <User className="w-5 h-5 cursor-pointer hover:text-blue-600 font-bold shrink-0" onClick={() => onNavigate(isLogged ? 'Customer Panel' : 'Login Page')} />
        </div>
      </div>
    </div>
  );
};

const DemoMobileBottomNav = ({ device, onNavigate, cartCount, isLogged }: any) => {
  if (device !== 'mobile') return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 z-40 font-sans pb-safe shadow-lg shrink-0">
      <div className="flex flex-col items-center cursor-pointer text-black" onClick={() => onNavigate('Homepage')}>
        <Home className="w-4.5 h-4.5 mb-1" /> 
        <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
      </div>
      <div className="flex flex-col items-center cursor-pointer text-gray-450 text-gray-400 hover:text-black" onClick={() => onNavigate('Category Page')}>
        <LayoutGrid className="w-4.5 h-4.5 mb-1" /> 
        <span className="text-[9px] font-black uppercase tracking-widest">Shop</span>
      </div>
      <div className="flex flex-col items-center cursor-pointer text-gray-450 text-gray-400 hover:text-black relative" onClick={() => onNavigate('Cart Page')}>
        <div className="relative">
          <ShoppingBag className="w-4.5 h-4.5 mb-1" />
          <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[7px] font-black min-w-3.5 p-0.5 rounded-full flex items-center justify-center">{cartCount}</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest">Cart</span>
      </div>
      <div className="flex flex-col items-center cursor-pointer text-gray-450 text-gray-400 hover:text-black" onClick={() => onNavigate('Support Page')}>
        <LifeBuoy className="w-4.5 h-4.5 mb-1" /> 
        <span className="text-[9px] font-black uppercase tracking-widest">Support</span>
      </div>
      <div className="flex flex-col items-center cursor-pointer text-gray-450 text-gray-400 hover:text-black" onClick={() => onNavigate(isLogged ? 'Customer Panel' : 'Login Page')}>
        <User className="w-4.5 h-4.5 mb-1" /> 
        <span className="text-[9px] font-black uppercase tracking-widest">Account</span>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CORE INTERACTIVE CONTENT SWITCH ENGINE
// -------------------------------------------------------------

function MockDemoContent({ 
  activePage, 
  template, 
  device,
  formData,
  onNavigate,
  cart,
  setCart,
  selectedCategory,
  setSelectedCategory,
  selectedProduct,
  setSelectedProduct,
  isLogged,
  setIsLogged,
  searchWord,
  setSearchWord,
  onAddCart,
  showSupportModal,
  setShowSupportModal,
  onPlaceOrder,
  orderId,
  websiteName,
  logoUrl,
  bannerUrl,
  primaryColor,
  themeType,
  categoriesList,
  hotline,
  currencyCode,
  currencySymbol,
  fontClass,
  roundedClass
}: any) {
  const [showLogin, setShowLogin] = useState(false);
  const [adminView, setAdminView] = useState('Overview');
  const [showProductUpload, setShowProductUpload] = useState(false);
  const [isAdminLogged, setIsAdminLogged] = useState(false);

  // Retrieve setting credentials dynamically
  const settings = useSettingsStore(state => state.settings);
  const emailToShow = settings.adminEmail || 'admin.tazumartbd@gmail.com';
  const passwordToShow = settings.adminPassword || '8963885522';

  // Thumbnail index on Product Details page
  const [selectedThumbIdx, setSelectedThumbIdx] = useState(0);
  const [pQty, setPQty] = useState(1);

  // Local Chat Simulation States
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string; time: string }[]>([
    { sender: 'bot', text: `Welcome to ${websiteName}! We are online to assist you with order delivery, refunds, reward coins or billing options.`, time: 'Just Now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Image category matching fallback
  const getImgSet = () => {
    if (template?.id?.includes('gadget') || template?.id?.includes('mobile')) return IMAGES.tech;
    if (template?.id?.includes('premium') || template?.id?.includes('dark')) return IMAGES.luxury;
    return IMAGES.fashion;
  };
  const imgSet = getImgSet();

  // Create standard generator of mock items
  const getDemoProducts = (categoryName: string) => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const n = idx + 1;
      const originalPrice = n * 1200;
      const discountPrice = Math.round(originalPrice * 0.75); // 25% OFF
      const coinBonus = n * 50;
      const pImage = imgSet.products[idx % imgSet.products.length];
      return {
        id: `${categoryName.toLowerCase().replace(' ', '-')}-${n}`,
        name: `${categoryName} Premium Signature ${n}`,
        category: categoryName,
        price: discountPrice,
        originalPrice: originalPrice,
        coins: coinBonus,
        image: pImage,
        sku: `SKU-${categoryName.toUpperCase().slice(0, 3)}-0${n}`,
        desc: `High quality signature product from the exclusive ${categoryName} line of ${websiteName}. Engineered for maximum durability, style, and modern SaaS features.`
      };
    });
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: msg, time: '1 sec ago' }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      let replyText = `Thanks for sending a message to ${websiteName}! If you want to place an order, please select any item, add it to the cart and continue to simulated checkout.`;
      if (msg.toLowerCase().includes('coin') || msg.toLowerCase().includes('reward')) {
        replyText = `Earn 250 Coins on purchase! You can view your collected balance of 1,250 Tazu Coins inside the "My Rewards" sitemap tab.`;
      } else if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('number') || msg.toLowerCase().includes('contact')) {
        replyText = `You can call our support desk directly at ${hotline} for instantaneous manual assistance or queries.`;
      } else if (msg.toLowerCase().includes('delivery') || msg.toLowerCase().includes('ship')) {
        replyText = `We offer free shipping on all orders over ৳2,000! Standard shipping across Bangladesh takes 24 hours.`;
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: replyText, time: 'Just Now' }]);
    }, 1200);
  };

  // Resolve active product list
  const activeProducts = selectedCategory ? getDemoProducts(selectedCategory) : getDemoProducts(categoriesList[0] || 'Smartphone');

  // Multi-page Router switchboard
  if (activePage === 'Homepage') {
    const isDarkTheme = template?.id?.includes('dark') || template?.id?.includes('black');
    return (
      <div className={`flex flex-col min-h-max pb-16 transition-all ${isDarkTheme ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-black'}`}>
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        
        {/* Dynamic HERO BANNER (Strictly square corners if sharp corners brand settings applied) */}
        <div className="p-0 select-none">
          <div className="aspect-[21/9] w-full min-h-[160px] overflow-hidden relative" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
            <img src={bannerUrl || imgSet.banner} className="w-full h-full object-cover" alt="Hero Banner Banner" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6">
              <div>
                <span style={{ backgroundColor: primaryColor }} className="text-white font-black text-[9px] px-2.5 py-1 uppercase tracking-widest">STORE FRONT EXCLUSIVE</span>
                <h2 className="text-lg sm:text-3xl font-black uppercase text-white tracking-tight mt-2 leading-tight">Welcome to {websiteName}</h2>
                <button 
                  type="button"
                  onClick={() => onNavigate('Category Page')}
                  className="mt-3 bg-white text-black px-6 py-2.5 text-[9px] font-black uppercase tracking-widest hover:bg-gray-150 transition-colors"
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Carousel Layout Row */}
        <div className="px-4 py-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-450 text-gray-500 mb-4 font-bold border-l-2 p-1 pl-2 border-orange-500">Shop by Channels</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categoriesList.map((cat: string) => (
              <span 
                key={cat} 
                onClick={() => { setSelectedCategory(cat); onNavigate('Category Page'); }}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border shrink-0 cursor-pointer transition-all ${selectedCategory === cat ? 'bg-black text-white' : 'bg-white text-zinc-700 hover:border-black'}`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Category Lists Capped at Max 6 products, as requested by the category products view limit */}
        <div className="space-y-12">
          {categoriesList.map((cat: string, index: number) => {
            const products = getDemoProducts(cat).slice(0, 6);
            return (
              <div key={cat} className="px-4">
                <div className="flex justify-between items-end border-b border-zinc-200 pb-2 mb-6">
                  <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" /> {cat}
                  </h3>
                  <button 
                    type="button"
                    onClick={() => { setSelectedCategory(cat); onNavigate('Category Page'); }}
                    style={{ color: primaryColor }}
                    className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-75 transition-all"
                  >
                    VIEW ALL →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {products.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { setSelectedProduct(p); onNavigate('Product Page'); }}
                      className="group cursor-pointer flex flex-col justify-between"
                    >
                      <div className={`aspect-square w-full overflow-hidden mb-3.5 relative border ${isDarkTheme ? 'bg-zinc-900 border-zinc-801 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`} style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" alt={p.name} />
                        {/* Daraz rewards coin indicator */}
                        <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md px-1.5 py-1 flex items-center gap-1 border border-white/10 rounded-sm">
                          <span className="text-[10px]">🪙</span>
                          <span className="text-[8px] font-black text-white uppercase tracking-tighter">+{p.coins} Coins</span>
                        </div>
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-none">-25%</div>
                      </div>
                      <div className="text-left">
                        <h4 className="text-[10px] font-black uppercase tracking-tight text-zinc-550 truncate">{p.name}</h4>
                        <div className="flex items-baseline gap-1.5 mt-1 leading-none">
                          <span className="text-xs font-black text-orange-650 text-orange-600">{currencySymbol}{p.price}</span>
                          <span className="text-[9px] text-gray-400 line-through font-bold">{currencySymbol}{p.originalPrice}</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onAddCart(p); }}
                        style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}
                        className="w-full mt-3 py-2.5 text-[8px] font-black uppercase tracking-widest border border-zinc-200 bg-white text-zinc-800 hover:bg-black hover:text-white transition-all shadow-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* High-Fidelity Trust Badges section */}
        <div className="mx-4 mt-12 p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white border border-zinc-200" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
          {[
            { icon: Zap, title: "Super Fast Delivery", desc: "Doorstep delivery nationwide" },
            { icon: Shield, title: "Secure Checkout", desc: "100% Secure Payment processing" },
            { icon: Coins, title: "Tazu Coins Reward", desc: "Collect coins to purchase items" },
            { icon: Truck, title: "Returns helpline", desc: "Easy returns for standard items" }
          ].map((itm, i) => (
            <div key={i} className="flex gap-4 items-center text-left">
              <div className="p-2.5 bg-zinc-50 border border-zinc-100"><itm.icon style={{ color: primaryColor }} className="w-5 h-5 shrink-0" /></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-tight text-black">{itm.title}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{itm.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Category Page') {
    return (
      <div className="flex flex-col min-h-max pb-16 bg-zinc-50">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="py-6 px-4 bg-zinc-900 border border-zinc-800 flex flex-col justify-center text-white select-none">
          <p className="text-[9px] font-black uppercase tracking-widest text-orange-500 mb-1.5">Collection Category catalog</p>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Catalogue: {selectedCategory}</h1>
        </div>

        <div className="p-4 sm:p-8 flex flex-col md:flex-row gap-8">
          {/* Sidebar category filters */}
          <div className="hidden md:block w-48 shrink-0 text-left space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] mb-4">Jump Categories</p>
              <div className="space-y-1.5">
                {categoriesList.map((cat: string) => (
                  <button 
                    type="button"
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-zinc-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6 pl-1.5 border-b border-zinc-200 pb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Displaying 12 high-fidelity items (Viewing entire category catalogue)</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {activeProducts.map(p => (
                <div key={p.id} className="group cursor-pointer flex flex-col justify-between" onClick={() => { setSelectedProduct(p); onNavigate('Product Page'); }}>
                  <div className="aspect-square bg-white border border-zinc-200 relative overflow-hidden mb-3 outline-none" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={p.name} />
                    <div className="absolute top-2 right-2 bg-black/85 px-1.5 py-1 text-[8px] font-black text-white rounded-sm flex items-center gap-1">
                      <span>🪙</span> +{p.coins} Coins
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-tight text-zinc-550 truncate">{p.name}</p>
                    <div className="flex items-baseline gap-1 mt-1 font-bold">
                      <span className="text-xs font-black text-black">{currencySymbol}{p.price}</span>
                      <span className="text-[9px] text-gray-400 line-through">{currencySymbol}{p.originalPrice}</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onAddCart(p); }}
                    style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}
                    className="w-full mt-3 py-2 text-[8px] font-black uppercase tracking-widest bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Product Page') {
    // If no product is selected, fallback to default high-fidelity watching product
    const fallbackProduct = {
      id: 'default-p-01',
      name: 'Original Premium Signature Wireless headphones',
      category: categoriesList[0] || 'Smartphone',
      price: 1500,
      originalPrice: 2000,
      coins: 250,
      image: imgSet.products[0],
      sku: 'SKU-FALLBACK-01',
      desc: 'Expertly designed signature companion featuring top tier acoustic drivers, flat-square tactical aesthetics and automated Tazu Coin reward capability.'
    };
    const p = selectedProduct || fallbackProduct;

    return (
      <div className="flex flex-col min-h-max bg-white pb-16">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 flex flex-col md:flex-row gap-12 mt-4">
          {/* Left panel product media */}
          <div className="md:w-1/2 text-left shrink-0">
            <div className="aspect-square bg-zinc-50 border border-zinc-200 relative overflow-hidden" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
              <img src={imgSet.products[selectedThumbIdx % imgSet.products.length]} className="w-full h-full object-cover animate-in fade-in duration-300" alt={p.name} />
              <div className="absolute top-4 left-4 bg-red-600 text-white text-[9px] font-black px-2 py-1 uppercase rounded-sm">-25% OFF</div>
            </div>
            {/* Gallery thumbnails */}
            <div className="grid grid-cols-4 gap-3 mt-4">
              {imgSet.products.slice(0, 4).map((th: string, idx: number) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setSelectedThumbIdx(idx)}
                  onClick={() => setSelectedThumbIdx(idx)}
                  className={`aspect-square border-2 cursor-pointer ${selectedThumbIdx === idx ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={th} className="w-full h-full object-cover" alt="product side" />
                </div>
              ))}
            </div>
          </div>

          {/* Right panel meta settings */}
          <div className="md:w-1/2 text-left">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-950 mb-1">{p.name}</h1>
            <div className="flex items-center gap-3 text-xs text-orange-500 fill-orange-500 mb-6">
              <div className="flex"><Star className="w-4.5 h-4.5 fill-current" /><Star className="w-4.5 h-4.5 fill-current" /><Star className="w-4.5 h-4.5 fill-current" /><Star className="w-4.5 h-4.5 fill-current" /><Star className="w-4.5 h-4.5 fill-current" /></div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">12 Super Reviews • In Stock</span>
            </div>

            <div className="bg-zinc-50 border-y border-zinc-200 py-6 mb-8 mt-2 space-y-4">
              <div className="flex items-baseline gap-4 px-4">
                <span className="text-3xl font-black text-black">{currencySymbol}{p.price}</span>
                <span className="text-sm font-bold text-gray-450 line-through text-gray-400">{currencySymbol}{p.originalPrice}</span>
              </div>
              
              <div className="bg-black text-white p-3.5 mx-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎁</span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none">Daraz Gold Coins</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Get +{p.coins} coins upon purchasing</p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-xl" />
              </div>
            </div>

            <p className="text-xs text-zinc-650 text-gray-500 uppercase font-black tracking-wider leading-relaxed mb-8">{p.desc}</p>

            {/* Sizes selector row */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-3">Optional sizes</label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map(s => (
                    <button key={s} style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }} className="w-12 h-12 border border-zinc-200 text-xs font-black uppercase hover:border-black hover:bg-zinc-50 transition-all select-none">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantifiers */}
              <div className="flex gap-4">
                <div className="flex items-center border border-zinc-200 font-extrabold text-sm" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                  <button type="button" onClick={() => pQty > 1 && setPQty(pQty - 1)} className="px-5 py-3 hover:bg-zinc-100 transition-colors">-</button>
                  <span className="px-5 py-3 border-x border-zinc-200 font-mono font-black">{pQty}</span>
                  <button type="button" onClick={() => setPQty(pQty + 1)} className="px-5 py-3 hover:bg-zinc-100 transition-colors">+</button>
                </div>
                <button 
                  type="button"
                  onClick={() => onAddCart({ ...p, quantity: pQty })}
                  style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}
                  className="flex-1 bg-zinc-900 border text-white font-black text-xs uppercase tracking-widest py-3.5 hover:bg-zinc-800 transition-colors"
                >
                  Add to Cart
                </button>
              </div>

              {/* Direct Hot Checkout Button */}
              <button 
                type="button"
                onClick={() => {
                  onAddCart({ ...p, quantity: pQty });
                  onNavigate('Checkout');
                }}
                style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}
                className="w-full bg-orange-600 text-white font-black text-xs uppercase tracking-widest py-4 hover:brightness-105 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-600/10"
              >
                <Zap className="w-4 h-4 fill-current text-white animate-pulse" /> Direct Order (Cash on Delivery)
              </button>
            </div>
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Cart Page') {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full flex-1">
          <h1 className="text-2xl font-black uppercase text-center tracking-tight text-gray-950 mb-8 border-b pb-4 border-zinc-200">Simulated Cart Bag</h1>

          {cart.length === 0 ? (
            <div className="bg-white border p-12 text-center rounded-sm">
              <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-sm font-black uppercase text-gray-500 mb-6">Your Shopping Cart is Empty</h3>
              <button 
                type="button"
                onClick={() => onNavigate('Homepage')}
                style={{ backgroundColor: primaryColor }}
                className={`px-8 py-3.5 text-white font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all ${roundedClass}`}
              >
                Go to Homepage
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white border border-zinc-200 p-4 flex gap-4 hover:border-black transition-colors" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                    <div className="w-20 h-20 bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 leading-none">{item.category}</span>
                          <h3 className="text-[11px] font-black uppercase leading-tight mt-1 truncate max-w-sm">{item.name}</h3>
                        </div>
                        <Trash2 
                          className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" 
                          onClick={() => setCart(prev => prev.filter(c => c.id !== item.id))}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-zinc-200 font-bold text-xs" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                          <button 
                            type="button"
                            onClick={() => {
                              if (item.quantity > 1) {
                                setCart(prev => prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity - 1 } : c));
                              }
                            }}
                            className="px-2.5 py-1 hover:bg-zinc-50"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 font-mono">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => setCart(prev => prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))}
                            className="px-2.5 py-1 hover:bg-zinc-50"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-black font-mono leading-none">{currencySymbol}{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="md:w-1/3">
                <div className="bg-white border border-zinc-205 p-6 shadow-sm border-zinc-200" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] mb-4 pb-2 border-b border-light-200 border-zinc-100">Checkout Bill</h3>
                  <div className="space-y-3.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest border-dashed border-b pb-4 mb-4">
                    <div className="flex justify-between"><span>Bag Subtotal</span> <span className="text-black font-black font-mono">{currencySymbol}{totalAmount}</span></div>
                    <div className="flex justify-between"><span>Logistics Shipping</span> <span className="text-black font-black font-mono">{currencySymbol}100</span></div>
                  </div>
                  <div className="flex justify-between text-lg font-black uppercase text-gray-950 tracking-tighter mb-6">
                    <span>Order Total</span> <span>{currencySymbol}{totalAmount + 100}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => onNavigate('Checkout')}
                    style={{ backgroundColor: primaryColor }}
                    className={`w-full py-4 text-xs font-black tracking-widest text-white uppercase hover:brightness-105 transition-all shadow-md ${roundedClass}`}
                  >
                    Secure Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Checkout') {
    const bagAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const checkoutTotal = bagAmount > 0 ? bagAmount + 100 : 1600; // Fallback to 1600 total if empty bag
    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-center mb-8 border-b border-zinc-200 pb-3">SaaS Instant Checkout</h1>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="bg-white border border-zinc-200 p-6" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4 border-b border-zinc-100 pb-1.5 flex items-center gap-1.5 leading-none"> <span className="w-2 h-2 rounded-full bg-orange-600 block" /> 1. Shipping Destination Location</p>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" className="col-span-2 p-3 font-semibold text-xs border border-zinc-200 outline-none focus:border-black bg-zinc-50" defaultValue="Riad Hasan Mia" placeholder="Full Name" />
                  <input type="tel" className="p-3 font-semibold text-xs border border-zinc-200 outline-none focus:border-black bg-zinc-50" defaultValue="01712345678" placeholder="Phone Hotline" />
                  <input type="text" className="p-3 font-semibold text-xs border border-zinc-200 outline-none focus:border-black bg-zinc-50" defaultValue="Dhaka" placeholder="City" />
                  <textarea className="col-span-2 p-3 font-semibold text-xs border border-zinc-200 outline-none focus:border-black bg-zinc-50 h-20" defaultValue="Mirpur-10, Dhaka - 1216. House-12, Block-B" placeholder="Detailed Address" />
                </div>
              </div>

              <div className="bg-white border border-zinc-200 p-6 animate-in fade-in" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] mb-4 border-b border-zinc-100 pb-1.5 leading-none">2. Cash Payment Method</p>
                <div className="space-y-3">
                  <div className="p-4 border border-zinc-950 bg-zinc-50 flex items-center justify-between cursor-pointer">
                    <div className="flex gap-3">
                      <span className="text-base">📦</span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide">Cash on Delivery (COD)</p>
                        <p className="text-[8px] text-gray-400 font-extrabold uppercase mt-1">Pay only matching item receipt at doorstep</p>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-4 border-black" />
                  </div>
                  <div className="p-4 border border-zinc-200 flex items-center justify-between hover:border-black cursor-not-allowed opacity-50">
                    <div className="flex gap-3">
                      <span className="text-base">🪙</span>
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide">Tazu Coins Redeemen Wallet</p>
                        <p className="text-[8px] text-gray-400 font-extrabold uppercase mt-1">Utilize coin balance to order</p>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-1/3">
              <div className="bg-white border border-black p-6 sticky top-24" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 border-b pb-2">Order Review</h3>
                <div className="space-y-4 mb-6 border-dashed border-b pb-4">
                  {cart.length === 0 ? (
                    <div className="flex gap-3 leading-tight text-left">
                      <div className="w-12 h-12 bg-zinc-100 shrink-0 border border-zinc-200">
                        <img src={imgSet.products[0]} className="w-full h-full object-cover" alt="item thumbnail preview" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase mt-0.5 max-w-[120px] truncate">Premium Demo Signature Item Product</p>
                        <p className="text-[9px] text-gray-400 mt-1 font-mono font-bold">Qty: 1 × {currencySymbol}1,500</p>
                      </div>
                    </div>
                  ) : (
                    cart.map((item: any) => (
                      <div key={item.id} className="flex gap-3 leading-tight text-left">
                        <div className="w-10 h-10 bg-zinc-100 shrink-0 border border-zinc-200">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div className="truncate">
                          <p className="text-[9px] font-black uppercase truncate mt-0.5 max-w-[140px]">{item.name}</p>
                          <p className="text-[9px] text-zinc-450 text-gray-400 mt-1 font-mono font-black">Qty: {item.quantity} × {currencySymbol}{item.price}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 text-[9px] font-black uppercase tracking-widest text-zinc-550 border-b border-dashed pb-4 mb-4">
                  <div className="flex justify-between"><span>Checkout Subtotal</span> <span className="font-mono font-bold text-black">{currencySymbol}{checkoutTotal - 100}</span></div>
                  <div className="flex justify-between"><span>Domestic Logistics</span> <span className="font-mono font-bold text-black">{currencySymbol}100</span></div>
                </div>

                <div className="flex justify-between text-lg font-black uppercase text-gray-950 tracking-tighter mb-6 leading-none">
                  <span>Grand Total</span> <span>{currencySymbol}{checkoutTotal}</span>
                </div>

                <button 
                  type="button"
                  onClick={onPlaceOrder}
                  style={{ backgroundColor: primaryColor }}
                  className={`w-full py-4 text-xs font-black tracking-widest text-white uppercase hover:brightness-105 transition-all ${roundedClass}`}
                >
                  Place Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Login Page') {
    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        
        <div className="max-w-md w-full mx-auto p-8 bg-white border border-zinc-200 shadow-xl mt-12 mb-16" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
          <div className="flex bg-zinc-100 p-1 mb-8">
            <button 
              onClick={() => setIsAdminLogged(false)}
              className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${!isAdminLogged ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
            >
              Customer Access
            </button>
            <button 
              onClick={() => setIsAdminLogged(true)}
              className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${isAdminLogged ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
            >
              Merchant Panel
            </button>
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tighter text-center text-gray-950 mb-1.5 leading-none">
            {isAdminLogged ? 'Admin Secure Login' : 'Customer Access'}
          </h2>
          <p className="text-[10px] text-gray-400 font-extrabold uppercase text-center tracking-widest">
            {isAdminLogged ? 'Manage your storefront architecture' : `Connect to ${websiteName} reward club`}
          </p>

          <div className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block font-bold">
                {isAdminLogged ? 'Admin User/Email' : 'Secure Mobile Phone or Gmail'}
              </label>
              <input 
                type="text" 
                defaultValue={isAdminLogged ? emailToShow : ''}
                className="w-full border border-zinc-200 p-3.5 text-xs font-semibold outline-none focus:border-black bg-zinc-50" 
                placeholder={isAdminLogged ? 'admin@market.com' : '017XXXXXXXX / member@gmail.com'} 
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-end leading-none mb-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 font-bold block">
                  {isAdminLogged ? 'Secret Key/Password' : 'Simulated OTP Code'}
                </label>
                {!isAdminLogged && <span className="text-[9px] text-orange-650 hover:opacity-60 cursor-pointer font-extrabold pb-0.5 uppercase">Request OTP</span>}
              </div>
              <input 
                type="password" 
                defaultValue={isAdminLogged ? passwordToShow : ''}
                placeholder={isAdminLogged ? '••••••••' : 'XXXXXX'} 
                className="w-full border border-zinc-200 p-3.5 text-xs font-semibold outline-none focus:border-black bg-zinc-50" 
              />
            </div>
            
            <button 
              type="button"
              onClick={() => {
                if (isAdminLogged) {
                  onNavigate('Admin Panel');
                } else {
                  setIsLogged(true);
                  onNavigate('Customer Panel');
                }
              }}
              style={{ backgroundColor: isAdminLogged ? '#000000' : primaryColor }}
              className={`w-full py-4 text-xs font-black text-white uppercase tracking-widest hover:brightness-105 transition-all shadow-md ${roundedClass}`}
            >
              {isAdminLogged ? 'Authorize Admin Session' : 'Sign In Securely'}
            </button>

            {!isAdminLogged && (
              <>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100" /></div>
                  <div className="relative flex justify-center"><span className="bg-white px-3 text-[8px] font-black text-gray-450 uppercase text-gray-400 tracking-widest">OTHER CONNECT CHANNELS</span></div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-[9px] font-black uppercase tracking-widest text-[#555]">
                  <button type="button" onClick={() => { setIsLogged(true); onNavigate('Customer Panel'); }} className="flex justify-center items-center gap-2 border border-zinc-200 hover:bg-zinc-50 py-3"><Facebook className="w-4 h-4 text-blue-600 shrink-0" /> Facebook</button>
                  <button type="button" onClick={() => { setIsLogged(true); onNavigate('Customer Panel'); }} className="flex justify-center items-center gap-2 border border-zinc-200 hover:bg-zinc-50 py-3"><Mail className="w-4 h-4 text-red-500 shrink-0" /> Google</button>
                </div>
              </>
            )}
            
            {isAdminLogged && (
               <div className="pt-4 text-center">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Forgotten Credentials? <span className="text-black underline cursor-pointer">Contact Platform Support</span></p>
               </div>
            )}
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Customer Panel') {
    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-8">
          {/* Dashboard Left Rail Menu */}
          <div className="md:w-52 shrink-0">
            <div className="bg-white border border-zinc-200 p-6 text-center select-none" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
              <div className="w-14 h-14 bg-zinc-100 rounded-full border border-zinc-200 flex items-center justify-center mx-auto mb-3 text-lg font-bold">👤</div>
              <p className="text-xs font-black uppercase tracking-tight text-black leading-none">Riad Hasan Mia</p>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 leading-none">Bronze Member</p>
              <button 
                type="button"
                onClick={() => {
                  setIsLogged(false);
                  onNavigate('Homepage');
                }}
                className="w-full border-t border-zinc-100 pt-4 mt-6 text-[9px] font-black uppercase text-red-650 text-red-650 hover:bg-red-50 flex items-center justify-center gap-1 leading-none"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tighter text-black border-b border-zinc-200 pb-3 leading-none">Customer dashboard</h2>

            {/* Wallet Info Box with Daraz Tazu Coins display */}
            <div className="bg-black text-white p-8 relative overflow-hidden flex flex-col sm:flex-row justify-between items-center bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
              <div className="sm:text-left text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] mb-2 leading-none">Simulated Reward Wallet Balance</p>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="text-4xl font-extrabold font-mono tracking-tighter">1,250</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"><Coins className="w-4 h-4 text-black fill-current animate-spin" /></div>
                </div>
              </div>
              <div className="flex gap-4 mt-6 sm:mt-0">
                <button type="button" onClick={() => onNavigate('My Rewards')} className="px-5 py-3 border border-white text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors">History Timeline</button>
              </div>
            </div>

            {/* KPIS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-black">
              <div className="bg-white border border-zinc-200 p-5 flex items-center gap-4 hover:border-black cursor-pointer transition-colors" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }} onClick={() => onNavigate('Order Tracking')}>
                <div className="bg-zinc-50 p-2 border border-zinc-100 text-orange-500"><ShoppingBag className="w-5 h-5 shrink-0" /></div>
                <div><p className="text-xl font-black text-black leading-none">12</p><p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mt-1">Total Orders</p></div>
              </div>
              <div className="bg-white border border-zinc-200 p-5 flex items-center gap-4 hover:border-black cursor-pointer transition-colors" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <div className="bg-zinc-50 p-2 border border-zinc-100 text-[#10B981]"><CheckCircle className="w-5 h-5 shrink-0" /></div>
                <div><p className="text-xl font-black text-black leading-none">11</p><p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mt-1">Delivered</p></div>
              </div>
              <div className="bg-white border border-zinc-200 p-5 flex items-center gap-4 hover:border-black cursor-pointer transition-colors" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }} onClick={() => onNavigate('Order Tracking')}>
                <div className="bg-zinc-50 p-2 border border-zinc-100 text-blue-500"><Truck className="w-5 h-5 shrink-0" /></div>
                <div><p className="text-xl font-black text-black leading-none">01</p><p className="text-[8px] text-gray-400 uppercase font-black tracking-widest mt-1">On Delivery</p></div>
              </div>
            </div>

            {/* Mock recent list */}
            <div className="bg-white border border-zinc-205 shadow-sm" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
              <div className="bg-zinc-50 px-5 py-4 border-b border-zinc-200 flex justify-between items-center select-none">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-650 text-gray-500 font-bold">Simulated Recent Sales logs</span>
              </div>
              <table className="w-full text-left text-[9px] font-black uppercase tracking-widest text-[#444]">
                <tbody className="divide-y divide-zinc-150">
                  <tr className="hover:bg-zinc-50 cursor-pointer" onClick={() => onNavigate('Order Tracking')}>
                    <td className="p-4 text-black font-extrabold">#ORD-90125</td>
                    <td className="p-4">26 May, 2026</td>
                    <td className="p-4 text-[#10B981]">Out for Delivery</td>
                    <td className="p-4 text-right"><span className="underline hover:text-black transition-colors">Track Order</span></td>
                  </tr>
                  <tr className="hover:bg-zinc-50 cursor-pointer">
                    <td className="p-4 text-black font-extrabold">#ORD-88204</td>
                    <td className="p-4">20 May, 2026</td>
                    <td className="p-4 text-neutral-500">Delivered</td>
                    <td className="p-4 text-right"><span className="underline hover:text-black transition-colors">Track Order</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'My Rewards') {
    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex-1">
          <button type="button" onClick={() => onNavigate('Customer Panel')} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-450 text-gray-400 hover:text-black mb-6 leading-none select-none">
            ← Back to Dashboard
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-950 mb-8 leading-none">Coins wallet platform timeline</h2>

          <div className="bg-white border border-zinc-200 p-8 flex flex-col md:flex-row justify-between items-center gap-8 mb-8 shadow-sm" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-amber-500/20">
                <Coins className="w-8 h-8 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-450 text-gray-400 leading-none">Reward Balance</p>
                <p className="text-3xl font-black text-black font-mono tracking-tight mt-1.5">1,250 Coins</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button type="button" className="px-5 py-3 border border-black text-[9px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Redeem Vouchers</button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2 mb-4 leading-none"><Activity className="w-4.5 h-4.5" /> Recent rewards logging</h3>
            {[
              { title: "Coin Bonus #ORD-90125", note: "Purchased premium wireless pods set", diff: "+250", color: "text-green-600" },
              { title: "Redeem Voucher checkout", note: "Order checkout cart discount applied", diff: "-500", color: "text-red-500" },
              { title: "Sign-Up reward coins", note: "First time email registration bonus", diff: "+1500", color: "text-green-600" }
            ].map((itm, i) => (
              <div key={i} className="bg-white border border-zinc-200 p-4.5 p-5 flex justify-between items-center hover:border-black transition-colors" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-tight text-gray-950">{itm.title}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1.5">{itm.note}</p>
                </div>
                <span className={`text-sm font-black font-mono ${itm.color}`}>{itm.diff}</span>
              </div>
            ))}
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Order Tracking') {
    const trackingNo = orderId || 'ORD-90125';
    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex-1">
          <div className="bg-white border border-zinc-200 p-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
            <div className="text-left leading-none">
              <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900">Tracking Code: {trackingNo}</h1>
              <p className="text-[9px] font-black text-gray-400 mt-2 uppercase tracking-widest">Order successfully registered in logistics hub • Live updates enabled</p>
            </div>
            <button type="button" onClick={() => onNavigate('Homepage')} className="px-5 py-3 border border-zinc-300 text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 leading-none">Go Home Shop</button>
          </div>

          <div className="bg-white border border-zinc-200 p-8 shadow-sm text-left relative" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
            <div className="absolute left-12 top-12 bottom-12 w-[2px] bg-zinc-150 bg-zinc-200 z-0" />
            <div className="space-y-10 relative">
              {[
                { label: "Order Registered Successfully", time: "10:30 AM", date: "Just Now", desc: "Digital verification complete inside SaaS database engine.", active: true },
                { label: "Design Configuration verified", time: "Pending", date: "-", desc: "Storefront properties correctly mounted in distribution template.", active: false },
                { label: "Out for doorstep Delivery", time: "Pending", date: "-", desc: "Assigned partner courier delivery agent for cash collection.", active: false }
              ].map((step, sIdx) => (
                <div key={sIdx} className="flex gap-6 relative z-10 animate-in fade-in" style={{ animationDelay: `${sIdx * 150}ms` }}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${step.active ? 'bg-black text-white border-black shadow-lg shadow-black/25' : 'bg-white text-zinc-300 border-zinc-200'}`}>
                    {step.active ? <Check className="w-4.5 h-4.5" /> : <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />}
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className={`text-xs font-black uppercase tracking-wide leading-none ${step.active ? 'text-black' : 'text-zinc-350 text-gray-400'}`}>{step.label}</h4>
                      <div className="text-right leading-none shrink-0 sm:pl-4">
                        <p className="text-[9px] font-black uppercase text-zinc-500 font-mono">{step.time}</p>
                      </div>
                    </div>
                    <p className={`text-[10px] uppercase font-bold tracking-widest mt-2 max-w-xl ${step.active ? 'text-gray-500' : 'text-zinc-250 text-gray-300'}`}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Support Page') {
    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full flex-1">
          <h1 className="text-2xl font-black uppercase tracking-tight mb-8 text-center border-b pb-4">Live Support Helpline Center</h1>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column support options */}
            <div className="md:w-1/3 space-y-4 text-left">
              <div className="bg-white border border-zinc-200 p-6" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2563EB] mb-4 border-b border-zinc-100 pb-1.5 leading-none">Instant Help Desk Desk</p>
                <div className="space-y-4">
                  <div className="flex gap-4 items-center">
                    <span className="text-base shrink-0">📞</span>
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 leading-none">Mobile Support Call</p>
                      <p className="text-sm font-bold font-mono text-black mt-1.5">{hotline}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-center pt-2">
                    <span className="text-base shrink-0">📍</span>
                    <div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 leading-none">Corporate Retail Address</p>
                      <p className="text-[10px] font-bold text-gray-700 uppercase mt-1.5 font-bold">Dhaka, Bangladesh HQ</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-zinc-202 p-6 border-zinc-200 shadow-sm" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#10B981] mb-2 leading-none">SaaS Plugins Enabled</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed">Facebook client Messenger widget and automated whatsapp hot link ready for real commerce deployment.</p>
              </div>
            </div>

            {/* Right Column Simulated chat messenger */}
            <div className="flex-1">
              <div className="bg-white border border-zinc-200 shadow-xl flex flex-col h-[400px] text-left" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                <div className="bg-zinc-950 text-white px-5 py-4 flex items-center justify-between shrink-0" style={{ borderTopLeftRadius: themeType.includes('Sharp') ? '0px' : '3px', borderTopRightRadius: themeType.includes('Sharp') ? '0px' : '3px' }}>
                  <div className="flex items-center gap-3 select-none">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse block" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide leading-none">{websiteName} Chatbot</p>
                      <p className="text-[8px] text-zinc-500 uppercase font-extrabold mt-1 tracking-widest">Typical reply time: 1 min</p>
                    </div>
                  </div>
                  <LifeBuoy className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4 font-sans text-xs">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in`}>
                      <div className={`p-4 max-w-sm rounded-lg ${m.sender === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-zinc-100 text-zinc-800 rounded-bl-none'}`}>
                        <p className="leading-relaxed font-semibold">{m.text}</p>
                        <span className="text-[7px] text-gray-400 uppercase tracking-widest font-black block mt-2 leading-none text-right">{m.time}</span>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-pulse">
                      <div className="p-3 bg-zinc-100 text-zinc-400 rounded-sm text-[8px] font-black uppercase tracking-widest">
                        Support Assistant is typing...
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 border-t border-zinc-150 flex gap-2.5 bg-zinc-50 shrink-0 rounded-b-lg">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type an issue (try 'coins', 'shipping', 'phone')..." 
                    className="flex-1 border p-3 border-zinc-200 text-xs font-semibold focus:border-black bg-white outline-none" 
                  />
                  <button 
                    type="button"
                    onClick={handleSendMessage}
                    style={{ backgroundColor: primaryColor }}
                    className="p-3 text-white flex items-center justify-center cursor-pointer font-bold hover:brightness-110 min-w-12 shrink-0 transition-all rounded-sm"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  if (activePage === 'Admin Panel') {
    if (!isAdminLogged) {
      return (
        <div className="flex flex-col min-h-max bg-zinc-950 text-white pb-16 text-left">
          <DemoGlobalHeader 
            template={template} 
            onNavigate={onNavigate} 
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
            websiteName={websiteName} 
            logoUrl={logoUrl} 
            primaryColor={primaryColor}
            categoriesList={categoriesList}
            setSelectedCategory={setSelectedCategory}
            isLogged={isLogged}
            fontClass={fontClass}
            roundedClass={roundedClass}
            onAdminLoginClick={() => { setIsAdminLogged(false); onNavigate('Admin Panel'); }}
          />
          <div className="flex-1 w-full max-w-md mx-auto py-16 px-4 flex flex-col justify-center">
            <div className="bg-zinc-900 border-2 border-zinc-800 p-8 shadow-2xl rounded-none relative">
              <div className="text-center mb-6">
                {logoUrl ? (
                  <img src={logoUrl} className="h-8 mx-auto object-contain mb-2" alt={websiteName} />
                ) : (
                  <h2 className="text-xl font-black uppercase text-white tracking-widest">{websiteName}</h2>
                )}
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mt-2">ADMINISTRATOR SECURE PORTAL</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-bold block">Gmail Field</label>
                  <input 
                    type="email" 
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs text-white font-mono outline-none focus:border-white transition-colors rounded-none font-bold"
                    defaultValue={emailToShow} 
                    placeholder="Enter admin email" 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 font-bold block">Password Field</label>
                  <input 
                    type="password" 
                    className="w-full bg-zinc-950 border border-zinc-800 p-3 text-xs text-white font-mono outline-none focus:border-white transition-colors rounded-none font-bold"
                    defaultValue={passwordToShow} 
                    placeholder="Enter admin password" 
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsAdminLogged(true)}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-3.5 text-xs font-black text-white uppercase tracking-widest hover:brightness-110 transition-all rounded-none"
                >
                  Admin Secure Login
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 text-center text-[8px] tracking-widest uppercase text-zinc-500 font-mono font-bold">
                <span className="text-green-500 block">● SECURE GATEWAY MODE</span>
              </div>
            </div>
          </div>
          <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-max bg-zinc-50 pb-16 text-left">
        <DemoGlobalHeader 
          template={template} 
          onNavigate={onNavigate} 
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
          websiteName={websiteName} 
          logoUrl={logoUrl} 
          primaryColor={primaryColor}
          categoriesList={categoriesList}
          setSelectedCategory={setSelectedCategory}
          isLogged={isLogged}
          fontClass={fontClass}
          roundedClass={roundedClass}
        />
        <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-200 pb-4 mb-8">
            <div className="text-left leading-none">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-black">Preview Admin Control</h1>
              <p className="text-[9px] font-black tracking-widest text-[#2563EB] mt-2 uppercase">SaaS backend configuration simulation</p>
            </div>
            <button 
              type="button"
              onClick={() => onNavigate('Homepage')}
              className="px-5 py-3 bg-white border text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors shrink-0"
            >
              ← Visit Frontend
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-1.5">
              {['Overview', 'Simulated Products', 'Settings Profile'].map(view => (
                <button 
                  type="button"
                  key={view} 
                  onClick={() => {
                    setAdminView(view);
                    if (view === 'Simulated Products') {
                      setShowProductUpload(true);
                    } else {
                      setShowProductUpload(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${adminView === view ? 'bg-black text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-white border border-zinc-100 bg-white'}`}
                >
                  {view}
                </button>
              ))}
            </div>

            <div className="md:col-span-3 text-left">
              {showProductUpload ? (
                <div className="bg-white border border-zinc-200 p-6" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                  <div className="flex justify-between items-center bg-zinc-50 p-4 border border-zinc-150 mb-6 font-black uppercase tracking-widest">
                    <div>
                      <h3 className="text-xs font-black">Upload Premium Products</h3>
                    </div>
                    <X className="w-4 h-4 text-gray-400 cursor-pointer" onClick={() => setShowProductUpload(false)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Regular Price</label>
                      <input type="text" className="w-full bg-zinc-100 p-3.5 text-xs font-mono border border-zinc-250 border-zinc-205 focus:border-black outline-none font-bold" defaultValue="2000" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Offer Price</label>
                      <input type="text" className="w-full bg-zinc-100 p-3.5 text-xs font-mono border border-zinc-250 border-zinc-205 focus:border-black outline-none font-bold text-orange-600" defaultValue="1500" />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Full Item Title</label>
                      <input type="text" className="w-full bg-zinc-100 p-3.5 text-xs border border-zinc-205 focus:border-black outline-none font-bold" defaultValue="SaaS wireless stereo headphones pro edition" />
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      alert('Product uploaded successfully inside our temporary storefront catalogue!');
                      onNavigate('Homepage');
                    }}
                    style={{ backgroundColor: primaryColor }}
                    className={`w-full mt-6 py-4 text-xs font-black text-white uppercase tracking-widest hover:brightness-105 transition-all shadow-md ${roundedClass}`}
                  >
                    Publish to Storefront
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-zinc-220 p-8 text-center border-zinc-200 shadow-sm" style={{ borderRadius: themeType.includes('Sharp') ? '0px' : '4px' }}>
                  <p className="text-3xl mb-4 text-[#2563EB]">⚙️</p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-black mb-2">{adminView} management console</h3>
                  <p className="text-[9px] font-bold text-gray-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">This SaaS backend view maps complete analytics and logs configured inside live servers.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <DemoMobileBottomNav device={device} onNavigate={onNavigate} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} isLogged={isLogged} />
      </div>
    );
  }

  // Fallback view state
  return (
    <div className="p-12 text-center select-none bg-white min-h-[50vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-4"><LayoutGrid className="w-8 h-8 text-zinc-300" /></div>
      <h3 className="text-sm font-black uppercase tracking-widest text-[#ef4444]">{activePage} Fallback</h3>
      <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest max-w-sm">This page is registered within the portal and correctly displays interactive elements in production.</p>
    </div>
  );
}
