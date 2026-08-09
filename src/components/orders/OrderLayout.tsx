import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSmartBack } from '../../hooks/useSmartBack';

interface OrderLayoutProps {
  children: React.ReactNode;
  title?: string;
  totalOrdersCount?: number;
  tabCounts?: Record<string, number>;
}

const TABS = [
  { id: 'all', label: 'All', path: '/account/orders' },
  { id: 'pending', label: 'Pending', path: '/account/orders/pending' },
  { id: 'processing', label: 'Processing', path: '/account/orders/processing' },
  { id: 'shipped', label: 'Shipped', path: '/account/orders/shipped' },
  { id: 'delivered', label: 'Delivered', path: '/account/orders/delivered' },
  { id: 'cancelled', label: 'Cancelled', path: '/account/orders/cancelled' },
];

export const OrderLayout: React.FC<OrderLayoutProps> = ({ 
  children, 
  title = "My Orders",
  totalOrdersCount = 0,
  tabCounts = {}
}) => {
  const goBack = useSmartBack('/account/dashboard');
  const location = useLocation();

  const getActiveTab = (pathname: string) => {
    if (pathname.includes('/pending') || pathname.includes('/to-pay')) return 'pending';
    if (pathname.includes('/processing') || pathname.includes('/to-ship')) return 'processing';
    if (pathname.includes('/shipped') || pathname.includes('/to-receive')) return 'shipped';
    if (pathname.includes('/delivered') || pathname.includes('/completed')) return 'delivered';
    if (pathname.includes('/cancelled')) return 'cancelled';
    return 'all';
  };

  const activeTabId = getActiveTab(location.pathname);

  return (
    <div className="bg-neutral-50/70 min-h-screen pb-24 font-sans text-black">
      <div className="container mx-auto max-w-5xl px-3 sm:px-6 pt-3 sm:pt-5">
        {/* Header Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-neutral-200/90 shadow-xs mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => goBack('/account/dashboard')}
                className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl transition-all active:scale-95 flex items-center justify-center shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight leading-none">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-neutral-500 uppercase tracking-wider mt-1.5 flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                  <span>{totalOrdersCount} {totalOrdersCount === 1 ? 'Order' : 'Orders'} Total</span>
                </p>
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-5 pt-4 border-t border-neutral-100">
            <div className="overflow-x-auto no-scrollbar scroll-smooth">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-max pb-1">
                {TABS.map((tab) => {
                  const isActive = activeTabId === tab.id;
                  const count = tabCounts[tab.id] ?? 0;

                  return (
                    <Link
                      key={tab.id}
                      to={tab.path}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap select-none border",
                        isActive 
                          ? "bg-black text-white border-black shadow-sm" 
                          : "bg-neutral-100/90 text-black border-transparent hover:bg-neutral-200"
                      )}
                    >
                      <span className="font-black text-xs sm:text-sm tracking-wider uppercase" style={{ color: isActive ? '#ffffff' : '#000000' }}>
                        {tab.label}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[11px] font-black transition-colors",
                        isActive 
                          ? "bg-white text-black" 
                          : "bg-neutral-200/90 text-black"
                      )}>
                        {count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </div>
    </div>
  );
};

