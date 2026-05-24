import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, User, Menu, X, 
  ChevronRight, Grid, ClipboardList, Bell, Tag, 
  HelpCircle, Info, Globe, Moon, Sun, LogOut, 
  MapPin, Eye, Package, LogIn
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSiteManagementStore } from '../../store/useSiteManagementStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import LogoutModal from '../ui/LogoutModal';
import { Facebook, Code, Store, ArrowRight } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBangla, setIsBangla] = useState(false);
  const cartCount = useCartStore((state) => state.getCartCount());
  const { categories } = useCategoryStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { settings } = useSettingsStore();

  const { data: siteData, fetchSettings } = useSiteManagementStore();

  const activeCategories = [...categories]
    .filter(c => c.status === 'Active')
    .sort((a, b) => a.displayOrder - b.displayOrder);

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

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <header className={cn(
        'sticky top-0 w-full z-50 transition-all duration-300 bg-white border-b border-gray-100 pt-[calc(14px+env(safe-area-inset-top,0px))] pb-2 md:pt-4 md:pb-3',
        isScrolled ? 'shadow-sm' : ''
      )}>
        <div className="container mx-auto px-4 h-[68px] md:h-[76px] flex items-center justify-between relative">
          {/* Left: Hamburger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-3 -ml-3 text-primary-900 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          >
            <Menu className="w-6 h-6 mt-[4px]" />
          </button>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white font-sans font-black text-xl shadow-lg shadow-purple-600/20 overflow-hidden shrink-0">
              {settings.storeLogo ? (
                <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-contain transition-all duration-300" referrerPolicy="no-referrer" />
              ) : (
                'T'
              )}
            </div>
            <span className="font-display font-black text-xl text-gray-900 tracking-tighter uppercase whitespace-nowrap">TAZU <span className="text-purple-600">MART</span></span>
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/wishlist" className="p-2 text-primary-900 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/account" className="p-2 text-primary-900 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="p-2 text-primary-900 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Global Search Bar below header (Mobile & Desktop) */}
        <div className="bg-white px-4 pb-1 pt-1">
          <div className="container mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search products, categories..."
                className="w-full bg-gray-50 border border-gray-200 text-sm h-10 px-4 rounded-full pl-4 pr-10 focus:outline-none focus:border-primary-900 focus:bg-white transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-900 transition-colors">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white z-[70] flex flex-col shadow-2xl h-screen overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-1.5" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center text-white font-black text-2xl overflow-hidden">
                    {settings.storeLogo ? (
                      <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-contain transition-all duration-300" referrerPolicy="no-referrer" />
                    ) : (
                      'T'
                    )}
                  </div>
                  <span className="font-display font-black text-xl text-gray-900 tracking-tighter uppercase">TAZU <span className="text-purple-600">MART</span></span>
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
                         <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
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
                          to={`/category/${cat.id}`} 
                          className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-primary-50 group transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div className="flex items-center gap-4">
                             <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors border border-gray-100 overflow-hidden">
                                {cat.iconImage ? (
                                  <img src={cat.iconImage} alt="" className="w-full h-full object-contain p-1.5" />
                                ) : (
                                  <Grid className="w-4 h-4 text-primary-900" />
                                )}
                             </div>
                             <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900">{cat.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-900 group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                      <Link to="/shop" className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 group transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><Eye className="w-4 h-4" /></div>
                           <span className="text-sm font-bold text-gray-700">All Categories</span>
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
                        { name: 'Recently Viewed', icon: Eye, path: '/recently-viewed' },
                      ].map((item) => (
                        <Link 
                          key={item.name} 
                          to={item.path} 
                          className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-primary-50 transition-colors group"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary-900" />
                          <span className="text-sm font-bold text-gray-700 group-hover:text-primary-900">{item.name}</span>
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
                  <div className="px-6 py-4 border-t border-gray-50">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Site Links</h3>
                    <div className="flex flex-col gap-[12px]">
                      {siteData.developer_status && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleExternalLink(siteData.developer_link)}
                          className="w-full h-[52px] rounded-[10px] flex items-center justify-between px-4 text-white transition-all relative overflow-hidden group/btn"
                          style={{ 
                            background: siteData.developer_color || 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                          }}
                        >
                          <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-[8px] flex items-center justify-center shrink-0">
                               <Code className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-[15px]">{siteData.developer_button_name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/60 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all relative z-10" />
                        </motion.button>
                      )}

                      {siteData.fashion_status && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleExternalLink(siteData.fashion_link)}
                          className="w-full h-[52px] rounded-[10px] flex items-center justify-between px-4 text-white transition-all relative overflow-hidden group/btn"
                          style={{ 
                            background: siteData.fashion_color || 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                          }}
                        >
                          <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-[8px] flex items-center justify-center shrink-0">
                               <Store className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-[15px]">{siteData.fashion_button_name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/60 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all relative z-10" />
                        </motion.button>
                      )}

                      {siteData.facebook_status && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleExternalLink(siteData.facebook_link)}
                          className="w-full h-[52px] bg-[#1877F2] rounded-[10px] flex items-center justify-between px-4 text-white transition-all relative overflow-hidden group/btn"
                          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        >
                          <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/10 transition-colors" />
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-[8px] flex items-center justify-center shrink-0">
                               <Facebook className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-[15px]">{siteData.facebook_button_name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-white/60 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all relative z-10" />
                        </motion.button>
                      )}
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
