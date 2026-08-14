import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, User, Menu, X, Camera,
  ChevronRight, Grid, ClipboardList, Bell, Tag, 
  HelpCircle, Info, Globe, LogOut, 
  MapPin, Eye, Package, LogIn, ShoppingBag, Lock
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSystemNotificationStore } from '../../store/useSystemNotificationStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSiteManagementStore } from '../../store/useSiteManagementStore';
import { useBrandingStore } from '../../store/useBrandingStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useProductStore } from '../../store/useProductStore';
import { useLanguageStore, translations } from '../../store/useLanguageStore';
import { themeSettingsService } from '../../services/themeSettingsService';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import LogoutModal from '../ui/LogoutModal';
import SearchDrawer from './SearchDrawer';
import { Code, Store, ArrowRight } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { language, toggleLanguage } = useLanguageStore();
  const [logoError, setLogoError] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistCount = useWishlistStore((state) => state.wishlistIds.length);
  const unreadNotifCount = useSystemNotificationStore((state) => state.getUnreadCount());
  const unreadOffersCount = useNotificationStore((state) => state.getUnreadCount());
  const { categories } = useCategoryStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { settings } = useSettingsStore();
  const { settings: branding } = useBrandingStore();
  const isSettingsLoaded = useSettingsStore((state) => state.isLoaded);
  const isBrandingLoaded = useBrandingStore((state) => state.isLoaded);

  const logoUrl = !logoError ? (settings.storeLogo || branding.primary_logo || branding.desktop_logo || branding.mobile_logo) : '';
  const isLoadingLogo = !isSettingsLoaded && !isBrandingLoaded;

  const { data: siteData, fetchSettings } = useSiteManagementStore();
  const { products } = useProductStore();
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest logo URL directly from Supabase Database sites_settings
    useSettingsStore.getState().fetchLatestLogo().catch(err => {
      console.warn("Header mount logo fetch error:", err);
    });
  }, []);

  useEffect(() => {
    setIsSearchDrawerOpen(false);
  }, [location]);

  const activeCategories = [...categories]
    .filter(c => String(c.status || 'Active').toLowerCase() === 'active')
    .sort((a, b) => (Number(a.displayOrder) || 0) - (Number(b.displayOrder) || 0));

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = translations[language];

  const handleExternalLink = (url: string, title?: string, useWebview?: boolean, newTab?: boolean) => {
    if (useWebview) {
      navigate(`/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || 'Page')}`);
      setIsMobileMenuOpen(false);
    } else {
      window.open(url, newTab ? '_blank' : '_self', 'noopener,noreferrer');
    }
  };

  const displayTagline = settings.storeTagline?.trim() || branding.site_tagline?.trim() || 'TAZU MART BD - YOUR TRUSTED ONLINE SHOPPING DESTINATION';

  return (
    <>
      {/* 1️⃣ Always Sticky Tagline / Marquee Bar */}
      {displayTagline && (
        <div className={cn(
          "sticky top-0 z-50 w-full bg-navbar-bg text-navbar-text border-b border-theme-border pt-[calc(10px+env(safe-area-inset-top,0px))] pb-2.5 overflow-hidden select-none font-sans relative transition-shadow duration-200",
          isScrolled ? "shadow-sm" : ""
        )}>
          <div className="container mx-auto px-3 flex justify-center items-center">
            {displayTagline.length > 35 ? (
              <div className="w-full overflow-hidden whitespace-nowrap relative">
                <span className="animate-marquee inline-block text-[10px] font-bold tracking-[0.25em] uppercase opacity-80">
                  {displayTagline}
                </span>
              </div>
            ) : (
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-80 text-center">
                {displayTagline}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 2️⃣ Logo/Header row - Natural Scroll (Hides on Scroll Down) */}
      <header className="relative w-full z-40 bg-navbar-bg border-b border-theme-border transition-colors duration-200">
        <div className="container mx-auto px-3 h-14 md:h-16 flex items-center justify-between">
          {/* Group 1: Menu + Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 text-navbar-text hover:bg-neutral-50/10 rounded-full transition-colors flex items-center justify-center shrink-0"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>

            <Link to="/" className="flex items-center gap-1.5 shrink-0">
              <div className={`w-7.5 h-7.5 md:w-8.5 md:h-8.5 rounded flex items-center justify-center font-sans font-black text-base md:text-lg overflow-hidden shrink-0 ${logoUrl || isLoadingLogo ? 'bg-transparent' : 'bg-theme-secondary text-theme-bg'}`}>
                 {logoUrl ? (
                   <img 
                     src={logoUrl} 
                     onError={() => setLogoError(true)} 
                     alt={branding.site_short_name || "Logo"} 
                     className="w-full h-full object-contain" 
                     referrerPolicy="no-referrer" 
                   />
                 ) : isLoadingLogo ? (
                   null
                 ) : (
                   null
                 )}
              </div>
              <span className="font-display font-black text-[15px] xs:text-base md:text-xl text-navbar-text tracking-tight uppercase whitespace-nowrap">
                {settings.storeName || 'TAZU MART BD'}
              </span>
            </Link>
          </div>

          {/* Group 2: Mini Search (Flexible Center) */}
          <div className="flex-1 px-2 sm:px-6 flex justify-center sm:justify-start">
            <button 
              onClick={() => setIsSearchDrawerOpen(true)}
              className="flex items-center gap-2 h-9 px-3.5 rounded-full bg-neutral-100/50 dark:bg-white/5 border border-theme-border/40 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:bg-neutral-100 dark:hover:bg-white/10 active:scale-95 group w-full max-w-[150px] sm:max-w-[280px]"
            >
              <Search className="w-3.5 h-3.5 text-navbar-text/60 group-hover:text-navbar-text transition-colors shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-navbar-text/50 group-hover:text-navbar-text transition-colors truncate">Search...</span>
              <Camera className="w-3.5 h-3.5 text-navbar-text/60 group-hover:text-navbar-text transition-colors shrink-0 ml-auto" />
            </button>
          </div>

          {/* Group 3: Icons (Wishlist + Cart) */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <Link to="/wishlist" className="p-2 text-navbar-text hover:bg-neutral-50/10 rounded-full transition-colors relative flex items-center justify-center" title="Wishlist">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-theme-bg animate-scaleIn">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="p-2 text-navbar-text hover:bg-neutral-50/10 rounded-full transition-colors relative flex items-center justify-center" title="Cart">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-theme-secondary text-theme-bg text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-theme-bg">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

      </header>

      {/* Global Search Drawer (Mobile) */}
      <SearchDrawer 
        isOpen={isSearchDrawerOpen} 
        onClose={() => setIsSearchDrawerOpen(false)} 
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 left-0 w-full max-w-[350px] bg-bg-primary text-text-primary z-[110] flex flex-col shadow-2xl h-screen overflow-hidden font-sans border-r border-border-theme transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="px-4 py-4 border-b border-border-theme flex justify-between items-center bg-bg-primary sticky top-0 z-20 transition-colors duration-200">
                <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-[10px] flex items-center justify-center font-black text-xl overflow-hidden shadow-sm shrink-0 ${logoUrl || isLoadingLogo ? 'bg-transparent' : 'bg-bg-secondary text-text-primary border border-border-theme'}`}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={settings.storeName || "Logo"} 
                        className="w-full h-full object-contain transition-all duration-300" 
                        referrerPolicy="no-referrer" 
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <span className="text-sm font-black uppercase text-text-primary">TM</span>
                    )}
                  </div>
                  {settings.storeName && settings.storeName.trim() !== '' && (
                    <span className="font-display font-black text-[15px] md:text-base text-text-primary tracking-tight uppercase whitespace-nowrap">
                      {settings.storeName}
                    </span>
                  )}
                </Link>
                <div className="flex items-center gap-2">
                  {/* Language Toggle: English ↔ বাংলা */}
                  <button 
                    onClick={toggleLanguage}
                    title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
                    className="h-8 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-bg-secondary hover:bg-neutral-200 text-text-primary transition-all flex items-center justify-center border border-border-theme shrink-0"
                  >
                    {language === 'en' ? 'বাংলা' : 'EN'}
                  </button>

                  {/* Close button */}
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-primary shrink-0"
                    aria-label="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto hide-scrollbar pb-10 bg-bg-primary text-text-primary transition-colors duration-200">
                {/* User Profile Card */}
                <div className="p-4 bg-bg-secondary border-b border-border-theme">
                  {isAuthenticated ? (
                    <Link 
                      to="/account" 
                      className="flex items-center gap-3 group bg-bg-primary p-3 rounded-[16px] border border-border-theme shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-full bg-bg-secondary text-text-primary border-2 border-bg-primary shadow-sm flex items-center justify-center overflow-hidden shrink-0 font-bold">
                         {user?.profileImage ? (
                           <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                         ) : (
                           user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-text-primary truncate tracking-tight">
                            {user?.name || 'Verified User'}
                          </h3>
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">Verified</span>
                        </div>
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {user?.email || user?.phone || 'Member Account'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-secondary group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  ) : (
                    <Link 
                      to="/account" 
                      className="flex items-center gap-3 group bg-bg-primary p-3 rounded-[16px] border border-border-theme shadow-sm transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-full bg-bg-secondary text-text-secondary border-2 border-bg-primary shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                         <User className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-text-primary truncate tracking-tight">
                          {t.welcomeGuest}
                        </h3>
                        <p className="text-[11px] text-text-secondary truncate mt-0.5">
                          {t.guestDesc}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-secondary group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  )}
                </div>

                {/* Auth Notice Alert */}
                {authNotice && (
                  <div className="mx-4 mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-400 text-xs font-bold rounded-[12px] flex items-center justify-between shadow-xs">
                    <span>{authNotice}</span>
                    <button onClick={() => setAuthNotice(null)} className="text-amber-900 dark:text-amber-400 font-black px-1.5">×</button>
                  </div>
                )}

                {/* Browse Categories */}
                <div className="px-4 py-4 border-b border-border-theme">
                   <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">{t.browseCategories}</h3>
                   <div className="space-y-1.5">
                      {activeCategories.slice(0, 6).map((cat) => (
                        <Link 
                          key={cat.id} 
                          to={`/category/${cat.id || cat.slug || 'all'}`}
                          className="flex items-center justify-between py-2.5 px-3 rounded-[12px] bg-bg-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800/60 group transition-all active:scale-[0.98] border border-border-theme"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-3">
                             <div className="w-7 h-7 rounded-[8px] bg-bg-primary flex items-center justify-center group-hover:bg-bg-secondary transition-colors border border-border-theme overflow-hidden shrink-0">
                                {cat.iconImage ? (
                                  <img src={cat.iconImage} alt="" className="w-full h-full object-contain p-1" />
                                ) : (
                                  <Grid className="w-3.5 h-3.5 text-text-primary" />
                                )}
                             </div>
                             <span className="text-xs font-bold text-text-primary group-hover:text-text-primary">{cat.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                      <Link to="/categories" className="flex items-center justify-between py-2.5 px-3 rounded-[12px] bg-bg-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800/60 group transition-all active:scale-[0.98] border border-border-theme" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3">
                           <div className="w-7 h-7 rounded-[8px] bg-bg-primary flex items-center justify-center text-text-secondary border border-border-theme"><Eye className="w-3.5 h-3.5" /></div>
                           <span className="text-xs font-bold text-text-primary group-hover:text-text-primary">{t.allCategories}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                   </div>
                </div>

                {/* Explore Products (Product Explorer) */}
                <div className="px-4 py-4 border-b border-border-theme">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">{t.exploreProducts}</h3>
                    <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="text-[10px] font-bold text-text-primary hover:underline">{t.viewAll}</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {products.slice(0, 4).map((p) => {
                      const isLockedForGuest = !isAuthenticated;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (isLockedForGuest) {
                              setAuthNotice("Please sign in to continue.");
                              setTimeout(() => {
                                navigate('/account');
                                setIsMobileMenuOpen(false);
                              }, 800);
                              return;
                            }
                            navigate(`/product/${p.id}`);
                            setIsMobileMenuOpen(false);
                          }}
                          className="bg-bg-primary border border-border-theme rounded-[12px] p-2 shadow-xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col"
                        >
                          {isLockedForGuest && (
                            <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-[1px] rounded-[12px] flex items-center justify-center z-10">
                              <div className="w-7 h-7 bg-text-primary text-bg-primary rounded-full flex items-center justify-center shadow-md">
                                <Lock className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          )}
                          <div className="w-full aspect-square bg-bg-secondary rounded-[8px] mb-2 overflow-hidden relative">
                            <img src={p.image || p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                            {p.discountPrice && p.discountPrice < p.price && (
                              <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-[4px]">
                                Sale
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-text-primary line-clamp-1 mb-1">{p.name}</h4>
                          <div className="mt-auto flex items-center gap-1.5">
                            <span className="text-xs font-black text-text-primary">৳{p.discountPrice || p.price}</span>
                            {p.discountPrice && p.discountPrice < p.price && (
                              <span className="text-[10px] text-text-secondary line-through">৳{p.price}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Menu */}
                <div className="px-4 py-4 border-b border-border-theme">
                   <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">{t.quickMenu}</h3>
                   <div className="space-y-1.5">
                      {[
                        { name: t.myProfile, icon: User, path: '/account', locked: false, rawName: 'My Profile' },
                        { name: t.myOrders, icon: ClipboardList, path: '/orders', locked: true, rawName: 'My Orders' },
                        { name: t.wishlist, icon: Heart, path: '/wishlist', locked: true, rawName: 'Wishlist' },
                        { name: t.myAddresses, icon: MapPin, path: '/account', locked: true, rawName: 'My Addresses' },
                        { name: t.recentlyViewed, icon: Eye, path: '/account', locked: true, rawName: 'Recently Viewed' },
                        { name: t.trackOrder, icon: Package, path: '/orders', locked: false, rawName: 'Track Order' },
                        { name: t.notifications, icon: Bell, path: '/notifications', locked: false, rawName: 'Notifications' },
                        { name: t.couponsOffers, icon: Tag, path: '/coupons', locked: false, rawName: 'Coupons & Offers' },
                        { name: t.helpSupport, icon: HelpCircle, path: '/help', locked: false, rawName: 'Help & Support' },
                      ].map((item) => {
                        const isLocked = item.locked && !isAuthenticated;
                        return (
                          <div
                            key={item.rawName}
                            onClick={() => {
                              if (isLocked) {
                                setAuthNotice("Please sign in to continue.");
                                setTimeout(() => {
                                  navigate('/account');
                                  setIsMobileMenuOpen(false);
                                }, 800);
                                return;
                              }
                              navigate(item.path);
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center justify-between py-2.5 px-3 rounded-[12px] bg-bg-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all group cursor-pointer active:scale-[0.98] border border-border-theme"
                          >
                            <div className="flex items-center gap-3">
                               <div className="w-7 h-7 rounded-[8px] bg-bg-primary flex items-center justify-center text-text-secondary border border-border-theme shadow-xs">
                                  {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" /> : <item.icon className="w-3.5 h-3.5 text-text-primary" />}
                                </div>
                               <span className="text-xs font-bold text-text-primary group-hover:text-text-primary">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               {item.rawName === 'Wishlist' && wishlistCount > 0 && (
                                 <span className="bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                   {wishlistCount}
                                 </span>
                               )}
                               {isLocked ? (
                                 <Lock className="w-3 h-3 text-text-secondary" />
                               ) : (
                                 <ChevronRight className="w-3.5 h-3.5 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
                               )}
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>

                {/* Site Links Section */}
                {siteData && (
                  <div className="px-4 py-4 border-b border-border-theme bg-bg-primary">
                    <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3">{t.siteLinks}</h3>
                    <div className="flex flex-col gap-2.5">
                      {siteData.developer_status && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => window.open(siteData.developer_link, '_self')}
                          className="w-full h-12 bg-bg-secondary border border-border-theme hover:border-neutral-300 dark:hover:border-neutral-700 rounded-[12px] flex items-center justify-between px-3 transition-all group/btn"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-bg-primary text-text-primary rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden p-1 border border-border-theme">
                               {siteData.developer_logo ? (
                                 <img src={siteData.developer_logo} alt={siteData.developer_button_name} className="w-full h-full object-contain" />
                               ) : (
                                 <Code className="w-3.5 h-3.5" />
                               )}
                            </div>
                            <span className="font-bold text-xs text-text-primary tracking-tight">{siteData.developer_button_name}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover/btn:text-text-primary group-hover/btn:translate-x-1 transition-all" />
                        </motion.button>
                      )}

                      {siteData.fashion_status && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => window.open(siteData.fashion_link, '_self')}
                          className="w-full h-12 bg-bg-secondary border border-border-theme hover:border-neutral-300 dark:hover:border-neutral-700 rounded-[12px] flex items-center justify-between px-3 transition-all group/btn"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-bg-primary text-text-primary rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden p-1 border border-border-theme">
                               {siteData.fashion_logo ? (
                                 <img src={siteData.fashion_logo} alt={siteData.fashion_button_name} className="w-full h-full object-contain" />
                               ) : (
                                 <Store className="w-3.5 h-3.5" />
                               )}
                            </div>
                            <span className="font-bold text-xs text-text-primary tracking-tight">{siteData.fashion_button_name}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover/btn:text-text-primary group-hover/btn:translate-x-1 transition-all" />
                        </motion.button>
                      )}

                      {(siteData.custom_links || []).filter(l => l.status).map((link) => (
                        <motion.button
                          key={link.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => window.open(link.url, '_self')}
                          className="w-full h-12 bg-bg-secondary border border-border-theme hover:border-neutral-300 dark:hover:border-neutral-700 rounded-[12px] flex items-center justify-between px-3 transition-all group/btn"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-bg-primary text-text-primary rounded-[8px] flex items-center justify-center shrink-0 overflow-hidden p-1 border border-border-theme">
                               {link.logo ? (
                                 <img src={link.logo} alt={link.name} className="w-full h-full object-contain" />
                               ) : (
                                 <ArrowRight className="w-3.5 h-3.5" />
                               )}
                            </div>
                            <span className="font-bold text-xs text-text-primary tracking-tight">{link.name}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-text-secondary group-hover/btn:text-text-primary group-hover/btn:translate-x-1 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons */}
              <div className="p-4 border-t border-border-theme bg-bg-primary sticky bottom-0 z-20">
                 {isAuthenticated ? (
                   <div className="grid grid-cols-2 gap-3">
                     <button
                       onClick={() => { setShowLogoutModal(true); setIsMobileMenuOpen(false); }}
                       className="h-[52px] bg-bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-text-primary border border-border-theme rounded-[12px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                     >
                        <LogOut className="w-4 h-4 text-red-600" /> {t.logout}
                     </button>
                     <button
                       onClick={() => { window.open('/', '_self'); setIsMobileMenuOpen(false); }}
                       className="h-[52px] bg-text-primary hover:opacity-90 text-bg-primary rounded-[12px] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
                     >
                        <Globe className="w-4 h-4" /> {t.visitWeb}
                     </button>
                   </div>
                 ) : (
                   <Link 
                     to="/account"
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="w-full h-[52px] bg-text-primary hover:opacity-90 text-bg-primary rounded-[12px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-95"
                   >
                      <LogIn className="w-4 h-4" /> {t.signIn}
                   </Link>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}
