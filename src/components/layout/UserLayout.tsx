import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { MessageCircle } from 'lucide-react';
import useScrollToTop from '../../hooks/useScrollToTop';
import { StorefrontPopup } from '../ui/StorefrontPopup';

export function UserLayout() {
  useScrollToTop();
  const location = useLocation();
  const isGameRoute = location.pathname === '/games';
  
  if (isGameRoute) {
    return (
      <div className="h-screen overflow-hidden bg-black">
        <Outlet />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-white pb-16 md:pb-0">
        <Outlet />
      </main>
      
      <Footer />
      <MobileBottomNav />
      <StorefrontPopup />
    </div>
  );
}
