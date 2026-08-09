import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Percent, MessageSquare, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../../store/useLanguageStore';

export function MobileBottomNav() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { name: t.home, icon: Home, path: '/' },
    { name: t.categories, icon: LayoutGrid, path: '/categories' },
    { name: t.offers, icon: Percent, path: '/offers' },
    { name: t.support, icon: MessageSquare, path: '/support' },
    { name: t.account, icon: User, path: '/account/dashboard', isAccount: true },
  ];

  if (location.pathname.startsWith('/product/') || location.pathname === '/checkout') return null;

  return (
    <div 
      className="fixed bottom-0 left-0 w-full z-50 bg-bg-primary text-text-primary border-t border-border-theme shadow-[0_-4px_12px_rgba(0,0,0,0.03)] transition-colors duration-200"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center h-[56px] max-w-lg mx-auto">
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
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
