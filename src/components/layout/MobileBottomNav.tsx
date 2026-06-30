import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Percent, MessageSquare, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Categories', icon: LayoutGrid, path: '/categories' },
    { name: 'Offers', icon: Percent, path: '/offers' },
    { name: 'Support', icon: MessageSquare, path: '/support' },
    { name: 'Account', icon: User, path: '/account/dashboard', isAccount: true },
  ];

  if (location.pathname.startsWith('/product/') || location.pathname === '/checkout') return null;

  return (
    <div 
      className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-[#F3F4F6] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
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
              key={item.name}
              to={path}
              className="flex-1 h-full flex flex-col items-center justify-center relative transition-all active:scale-90"
            >
              <div className={cn(
                "transition-all duration-300 flex items-center justify-center",
                isActive ? "text-black translate-y-[-2px]" : "text-[#9CA3AF]"
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute bottom-[8px] w-[5px] h-[5px] bg-black rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

