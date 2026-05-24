import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Percent, MessageCircle, User } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { motion } from 'motion/react';

export function MobileBottomNav() {
  const location = useLocation();
  const cartCount = useCartStore((state) => state.getCartCount());

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Categories', icon: Grid, path: '/categories' },
    { name: 'Offers', icon: Percent, path: '/offers' },
    { name: 'Support', icon: MessageCircle, path: '/support' },
    { name: 'Account', icon: User, path: '/account/dashboard', isAccount: true },
  ];

  if (location.pathname.startsWith('/product/') || location.pathname === '/checkout') return null;

  return (
    <div 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl z-50 bg-white border-t border-[#ECECEC] shadow-[0_-2px_10px_rgba(0,0,0,0.04)] rounded-t-[14px]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex justify-around items-center h-16 px-1.5">
        {navItems.map((item) => {
          const path = item.isAccount ? '/account/dashboard' : item.path;
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          const Icon = item.icon as any;
          return (
            <Link
              key={item.name}
              to={path}
              className="flex-1 h-full flex items-center justify-center outline-none select-none"
            >
              <div 
                className={`flex flex-col items-center justify-center w-[90%] py-1.5 px-1.5 transition-all active:scale-[0.93] ${
                  isActive 
                    ? 'bg-black/[0.06] text-black rounded-[10px]' 
                    : 'text-[#9CA3AF] hover:text-black'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-[22px] h-[22px] stroke-[2px]" />
                </div>
                <span className="text-[12px] font-semibold leading-none mt-1">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

