import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BrandShowcase } from './BrandShowcase';
import { MobileBottomNav } from './MobileBottomNav';
import { ShieldAlert } from 'lucide-react';
import useScrollToTop from '../../utils/supabase/hooks/useScrollToTop';
import { StorefrontPopup } from '../ui/StorefrontPopup';
import { useEffect, useState } from 'react';
import { pixelService } from '../../utils/pixelService';

export function UserLayout() {
  useScrollToTop();
  const location = useLocation();
  const isGameRoute = location.pathname === '/games';
  const [dbError, setDbError] = useState<any>(null);
  
  useEffect(() => {
    pixelService.trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if ((window as any).__SUPABASE_DB_ERROR) {
      setDbError((window as any).__SUPABASE_DB_ERROR);
    }
    
    const interval = setInterval(() => {
      const globalErr = (window as any).__SUPABASE_DB_ERROR;
      if (globalErr && JSON.stringify(globalErr) !== JSON.stringify(dbError)) {
        setDbError(globalErr);
      }
    }, 1500);
    
    return () => clearInterval(interval);
  }, [dbError]);
  
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
      {dbError && dbError.isQuotaRestricted && (
        <div className="w-full bg-amber-500 text-neutral-950 font-sans px-4 py-3.5 border-b border-amber-600 shadow-lg relative z-[99999] animate-in slide-in-from-top duration-300">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3">
              <span className="p-2 bg-amber-600 text-white rounded-lg shrink-0 mt-0.5 md:mt-0 flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </span>
              <div className="text-xs md:text-sm">
                <p className="font-extrabold tracking-tight uppercase">
                  ডাটাবেজ এক্সেস সীমাবদ্ধ (Database Access Restricted - Exceeded Egress Quota)
                </p>
                <p className="opacity-95 mt-1 font-medium leading-relaxed max-w-4xl">
                  আপনার Supabase প্রোজেক্টের ফ্রি টিয়ার লিমিট পার হয়ে যাওয়ায় সাময়িকভাবে ডাটা লোড হচ্ছে না। আপনার সব ডাটা সম্পূর্ণ সুরক্ষিত আছে। পুনরায় সচল করতে আপনার Supabase ড্যাশবোর্ড থেকে প্ল্যান আপগ্রেড করুন বা স্পেন্ড ক্যাপ রিমুভ করুন।
                </p>
              </div>
            </div>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-neutral-950 hover:bg-neutral-900 text-white transition-all px-4 py-2.5 rounded-lg text-xs font-black tracking-widest uppercase shrink-0 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 duration-150"
            >
              Fix in Supabase Dashboard
            </a>
          </div>
        </div>
      )}

      <Header />
      
      <main className={`flex-1 bg-white ${isHome ? 'pb-0' : 'pb-16 md:pb-0'}`}>
        <Outlet />
      </main>
      
      {isHome && <Footer />}
      {isBrandShowcasePage && <BrandShowcase />}
      <MobileBottomNav />
      <StorefrontPopup />
    </div>
  );
}
