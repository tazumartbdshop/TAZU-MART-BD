import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BrandShowcase } from './BrandShowcase';
import { MobileBottomNav } from './MobileBottomNav';
import { MessageCircle } from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';
import { StorefrontPopup } from '../ui/StorefrontPopup';
import { useEffect } from 'react';
import { pixelService } from '../../utils/pixelService';

export function UserLayout() {
  useScrollToTop();
  const location = useLocation();
  const isGameRoute = location.pathname === '/games';
  
  useEffect(() => {
    pixelService.trackPageView(location.pathname);
  }, [location.pathname]);
  
  if (isGameRoute) {
    return (
      <div className="h-screen overflow-hidden bg-black">
        <Outlet />
      </div>
    );
  }

  const isHome = location.pathname === '/';
  const isBrandShowcasePage = 
    location.pathname === '/categories' ||
    location.pathname.startsWith('/category/') ||
    location.pathname === '/offers' ||
    location.pathname === '/support' ||
    location.pathname === '/account' ||
    location.pathname === '/account/dashboard';
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-white pb-16 md:pb-0">
        <Outlet />
      </main>
      
      {isHome && <Footer />}
      {isBrandShowcasePage && <BrandShowcase />}
      <MobileBottomNav />
      <StorefrontPopup />
    </div>
  );
}
