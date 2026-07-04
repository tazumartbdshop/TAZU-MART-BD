import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, User, Menu, X, 
  ChevronRight, Grid, ClipboardList, Bell, Tag, 
  HelpCircle, Info, Globe, Moon, Sun, LogOut, 
  MapPin, Eye, Package, LogIn, ShoppingBag
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSiteManagementStore } from '../../store/useSiteManagementStore';
import { useBrandingStore } from '../../store/useBrandingStore';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBangla, setIsBangla] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistCount = useWishlistStore((state) => state.wishlistIds.length);
  const { categories } = useCategoryStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { settings } = useSettingsStore();
  const { settings: branding } = useBrandingStore();
  const isSettingsLoaded = useSettingsStore((state) => state.isLoaded);
  const isBrandingLoaded = useBrandingStore((state) => state.isLoaded);

  const logoUrl = !logoError ? (settings.storeLogo || branding.primary_logo || branding.desktop_logo || branding.mobile_logo) : '';
  const isLoadingLogo = !isSettingsLoaded && !isBrandingLoaded;

  const { data: siteData, fetchSettings } = useSiteManagementStore();

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

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleLanguage = () => setIsBangla(!isBangla);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const t = {
    menu: isBangla ? 'মেনু' : 'Menu',
    shopByCategory: isBangla ? 'ক্যাটাগরি অনুযায়ী শপ করুন' : 'Shop By Category',
    myAccount: isBangla ? 'আমার অ্যাকাউন্ট' : 'My Account',
    more: isBangla ? 'আরও' : 'More',
    logout: isBangla ? 'লগআউট' : 'Logout'
  };

  const handleExternalLink = (url: string, title?: string, useWebview?: boolean, newTab?: boolean) => {
    if (useWebview) {
      navigate(`/viewer?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || 'Page')}`);
      setIsMobileMenuOpen(false);
    } else {
      window.open(url, newTab ? '_blank' : '_self', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <header className={cn(
        'sticky top-0 w-full z-50 transition-all duration-300 bg-navbar-bg border-b border-theme-border',
        isScrolled ? 'shadow-sm' : ''
      )}>
        {/* 1️⃣ Thin premium headline text */}
        {settings.storeTagline && settings.storeTagline.trim() !== '' && (
          <div className="w-full bg-navbar-bg text-navbar-text border-b border-theme-border pt-[calc(10px+env(safe-area-inset-top,0px))] pb-2.5 overflow-hidden select-none font-sans relative">
            <div className="container mx-auto px-3 flex justify-center items-center">
              {settings.storeTagline.length > 35 ? (
                <div className="w-full overflow-hidden whitespace-nowrap relative">
                  <span className="animate-marquee inline-block text-[10px] font-bold tracking-[0.25em] uppercase opacity-80">
                    {settings.storeTagline}
                  </span>
                </div>
              ) : (
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-80 text-center">
                  {settings.storeTagline}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 2️⃣ Logo/Header row */}
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
              {settings.storeName && settings.storeName.trim() !== '' && (
                <span className="font-display font-black text-[13px] xs:text-sm md:text-lg text-navbar-text tracking-tighter uppercase whitespace-nowrap">
                  {settings.storeName}
                </span>
              )}
            </Link>
          </div>

          {/* Group 2: Mini Search (Flexible Center) */}
          <div className="flex-1 px-2 sm:px-6 flex justify-center sm:justify-start">
            <button 
              onClick={() => setIsSearchDrawerOpen(true)}
              className="flex items-center gap-2 h-9 px-3.5 rounded-full bg-neutral-100/50 dark:bg-white/5 border border-theme-border/40 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:bg-neutral-100 dark:hover:bg-white/10 active:scale-95 group w-full max-w-[140px] sm:max-w-[280px]"
            >
              <Search className="w-3.5 h-3.5 text-navbar-text/60 group-hover:text-navbar-text transition-colors shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-navbar-text/50 group-hover:text-navbar-text transition-colors truncate">Search...</span>
            </button>
          </div>

          {/* Group 3: Icons (Wishlist + Cart) */}
          <div className="flex items-center gap-0.5 sm:gap-2 shrink-0">
            <Link to="/wishlist" className="p-2 text-navbar-text hover:bg-neutral-50/10 rounded-full transition-colors relative flex items-center justify-center">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-theme-bg animate-scaleIn">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="p-2 text-navbar-text hover:bg-neutral-50/10 rounded-full transition-colors relative flex items-center justify-center">
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
              className="fixed inset-0 left-0 w-80 bg-white z-[110] flex flex-col shadow-2xl h-screen overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-1.5" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`w-9 h-9 rounded flex items-center justify-center font-black text-xl overflow-hidden ${logoUrl || isLoadingLogo ? 'bg-transparent' : 'bg-neutral-950 text-white'}`}>
                    {logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={branding.site_short_name || "Logo"} 
                        className="w-full h-full object-contain transition-all duration-300" 
                        referrerPolicy="no-referrer" 
                        onError={() => setLogoError(true)}
                      />
                    ) : isLoadingLogo ? (
                      null
                    ) : (
                      null
                    )}
                  </div>
                  {settings.storeName && settings.storeName.trim() !== '' && (
                    <span className="font-display font-black text-xl text-neutral-950 tracking-tighter uppercase">
                      {settings.storeName}
                    </span>
                  )}
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto hide-scrollbar pb-8">
                {/* Profile Card */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-white mb-2">
                  <Link 
                    to="/account" 
                    className="flex items-center gap-4 group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-14 h-14 rounded-full bg-primary-100 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                       {isAuthenticated && user?.profileImage ? (
                         <img src={user.profileImage || null} alt="" className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-8 h-8 text-primary-900" />
                       )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 leading-tight uppercase tracking-tight">
                        {isAuthenticated ? user?.name : 'Guest User'}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                        {isAuthenticated ? user?.email : 'Login to your account'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-900 transition-colors" />
                  </Link>
                </div>

                {/* Categories */}
                <div className="px-6 py-4">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t.shopByCategory}</h3>
                   <div className="space-y-1">
                      {activeCategories.map((cat) => (
                        <Link 
                          key={cat.id} 
                          to={`/category/${cat.id || cat.slug || 'all'}`}
                          className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-primary-50 group transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors border border-gray-100 overflow-hidden">
                                {cat.iconImage ? (
                                  <img src={cat.iconImage || null} alt="" className="w-full h-full object-contain p-1.5" />
                                ) : (
                                  <Grid className="w-4 h-4 text-primary-900" />
                                )}
                             </div>
                             <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900">{cat.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-900 group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                      <Link to="/categories" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Eye className="w-4 h-4" /></div>
                           <span className="text-sm font-bold text-gray-700">All Categories</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-all" />
                      </Link>
                      <Link to="/products" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><ShoppingBag className="w-4 h-4" /></div>
                           <span className="text-sm font-bold text-gray-700">All Products</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-all" />
                      </Link>
                   </div>
                </div>

                {/* My Account */}
                <div className="px-6 py-4 border-t border-gray-50">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t.myAccount}</h3>
                   <div className="space-y-1">
                      {[
                        { name: 'My Profile', icon: User, path: '/account' },
                        { name: 'My Orders', icon: ClipboardList, path: '/orders' },
                        { name: 'Wishlist', icon: Heart, path: '/wishlist' },
                        { name: 'My Addresses', icon: MapPin, path: '/account' },
                        { name: 'Recently Viewed', icon: Eye, path: '/account/dashboard' },
                      ].map((item) => (
                        <Link 
                          key={item.name} 
                          to={item.path} 
                          className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-primary-50 transition-colors group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary-900" />
                          <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900">{item.name}</span>
                          {item.name === 'Wishlist' && wishlistCount > 0 && (
                            <span className="ml-auto bg-red-100 text-red-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      ))}
                   </div>
                </div>

                {/* More / Utility */}
                <div className="px-6 py-4 border-t border-gray-50">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t.more}</h3>
                   <div className="space-y-1">
                      <Link to="/orders" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-primary-50 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <Package className="w-4 h-4 text-gray-400 group-hover:text-primary-900" />
                           <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900">Track Order</span>
                        </div>
                      </Link>
                      <Link to="/notifications" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-primary-50 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <Bell className="w-4 h-4 text-gray-400 group-hover:text-primary-900" />
                           <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900">Notifications</span>
                        </div>
                        <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">3</span>
                      </Link>
                      <div className="py-3 px-4 flex items-center justify-between group">
                         <div className="flex items-center gap-4">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-bold text-gray-700">Coupons & Offers</span>
                         </div>
                      </div>
                      <Link to="/help" className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group" onClick={() => setIsMobileMenuOpen(false)}>
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-bold text-gray-700">Help & Support</span>
                      </Link>
                   </div>
                </div>

                {/* Site Links Section */}
                {siteData && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-white">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Site Links</h3>
                    <div className="flex flex-col gap-3">
                      {siteData.developer_status && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => window.open(siteData.developer_link, '_self')}
                          className="w-full h-14 bg-white border border-gray-200 hover:border-gray-300 rounded-[14px] flex items-center justify-between px-4 transition-all group/btn shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden p-1">
                               {siteData.developer_logo ? (
                                 <img src={siteData.developer_logo} alt={siteData.developer_button_name} className="w-full h-full object-contain" />
                               ) : (
                                 <Code className="w-4 h-4" />
                               )}
                            </div>
                            <span className="font-bold text-[13px] text-gray-800 tracking-tight">{siteData.developer_button_name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover/btn:text-gray-600 group-hover/btn:translate-x-1 transition-all" />
                        </motion.button>
                      )}

                      {siteData.fashion_status && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => window.open(siteData.fashion_link, '_self')}
                          className="w-full h-14 bg-white border border-gray-200 hover:border-gray-300 rounded-[14px] flex items-center justify-between px-4 transition-all group/btn shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden p-1">
                               {siteData.fashion_logo ? (
                                 <img src={siteData.fashion_logo} alt={siteData.fashion_button_name} className="w-full h-full object-contain" />
                               ) : (
                                 <Store className="w-4 h-4" />
                               )}
                            </div>
                            <span className="font-bold text-[13px] text-gray-800 tracking-tight">{siteData.fashion_button_name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover/btn:text-gray-600 group-hover/btn:translate-x-1 transition-all" />
                        </motion.button>
                      )}

                      {(siteData.custom_links || []).filter(l => l.status).map((link) => (
                        <motion.button
                          key={link.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => window.open(link.url, '_self')}
                          className="w-full h-14 bg-white border border-gray-200 hover:border-gray-300 rounded-[14px] flex items-center justify-between px-4 transition-all group/btn shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-[10px] flex items-center justify-center shrink-0 overflow-hidden p-1">
                               {link.logo ? (
                                 <img src={link.logo} alt={link.name} className="w-full h-full object-contain" />
                               ) : (
                                 <ArrowRight className="w-4 h-4" />
                               )}
                            </div>
                            <span className="font-bold text-[13px] text-gray-800 tracking-tight">{link.name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover/btn:text-gray-600 group-hover/btn:translate-x-1 transition-all" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Footer */}
              <div className="p-6 border-t border-gray-100 bg-white">
                 {isAuthenticated ? (
                   <button 
                    onClick={() => { setShowLogoutModal(true); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-between w-full h-[52px] px-4 bg-[#FFECEC] text-[#E11D48] rounded-[10px] transition-all group/logout active:scale-95"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                   >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-[8px] flex items-center justify-center shrink-0">
                           <LogOut className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-[15px]">{t.logout}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-40 group-hover/logout:translate-x-1 transition-all" />
                   </button>
                 ) : (
                   <Link 
                    to="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full h-[52px] bg-black text-white rounded-[10px] font-black uppercase tracking-widest text-[11px] hover:bg-gray-900 transition-all shadow-xl shadow-black/10 active:scale-95"
                   >
                      <LogIn className="w-4 h-4" /> Sign In Required
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
