import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Percent, MessageSquare, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../../store/useLanguageStore';
import { useState, useEffect } from 'react';
import { campaignService } from '../../services/campaignService';

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    campaignService.getActiveCampaigns()
      .then(data => {
        if (data && data.length > 0) {
          setActiveCampaigns(data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (activeCampaigns.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPromoIndex((prev) => (prev + 1) % activeCampaigns.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeCampaigns.length]);

  const navItems = [
    { name: t.home, icon: Home, path: '/' },
    { name: t.categories, icon: LayoutGrid, path: '/categories' },
    { name: t.offers, icon: Percent, path: '/offers', isOffer: true },
    { name: t.support, icon: MessageSquare, path: '/support' },
    { name: t.account, icon: User, path: '/account/dashboard', isAccount: true },
  ];

  if (location.pathname.startsWith('/product/') || location.pathname === '/checkout') return null;

  const currentCampaign = activeCampaigns[currentPromoIndex];

  return (
    <div 
      className="fixed bottom-0 left-0 w-full z-50 bg-bg-primary text-text-primary border-t border-border-theme shadow-[0_-4px_12px_rgba(0,0,0,0.03)] transition-colors duration-200"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center h-[56px] max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const path = item.isAccount ? '/account/dashboard' : item.path;
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={path}
              title={item.name}
              aria-label={item.name}
              className="flex-1 h-full flex flex-col items-center justify-center relative transition-all active:scale-90 select-none"
            >
              <div className="relative w-10 h-10 flex flex-col items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active-bg"
                    className="absolute inset-0 rounded-full shadow-xs"
                    style={{
                      backgroundColor: 'var(--home-active-bg)',
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div 
                  className="relative z-10 flex items-center justify-center transition-colors duration-200"
                  style={{
                    color: isActive ? 'var(--home-active-text)' : '#9CA3AF',
                  }}
                >
                  {item.isOffer ? (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative flex items-center justify-center"
                    >
                      {activeCampaigns.length > 0 && currentCampaign ? (
                        <div className="relative w-10 h-10 sm:w-11 sm:h-11 aspect-square rounded-lg overflow-hidden flex items-center justify-center">
                          <AnimatePresence mode="popLayout">
                            <motion.img
                              key={currentCampaign.id || currentPromoIndex}
                              src={currentCampaign.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'}
                              alt={currentCampaign.title || 'Offer'}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Icon size={23} strokeWidth={2.6} className="text-red-600" />
                      )}
                      {activeCampaigns.length > 0 && (
                        <span className="absolute -top-1 -right-1.5 bg-red-600 text-white text-[7px] font-black px-1 py-0.2 rounded-full uppercase tracking-tighter shadow-sm z-10">
                          {activeCampaigns.length}
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Rotating campaign badge / promo banner popup indicator above offers button if campaigns exist */}
      {currentCampaign && location.pathname !== '/offers' && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCampaign.id}
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-black text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg border border-neutral-800 flex items-center gap-1.5 pointer-events-auto cursor-pointer"
              onClick={() => window.location.href = '/offers'}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="truncate max-w-[180px]">{currentCampaign.title}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
