import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Package, Truck, CheckCircle, XCircle, RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface OrderLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const TABS = [
  { id: 'all', label: 'All', icon: Package, path: '/account/orders' },
  { id: 'to-pay', label: 'To Pay', icon: CreditCard, path: '/account/orders/to-pay' },
  { id: 'to-ship', label: 'To Ship', icon: RefreshCcw, path: '/account/orders/to-ship' },
  { id: 'to-receive', label: 'To Receive', icon: Truck, path: '/account/orders/to-receive' },
  { id: 'completed', label: 'Completed', icon: CheckCircle, path: '/account/orders/completed' },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle, path: '/account/orders/cancelled' },
  { id: 'returns', label: 'Returns', icon: RefreshCcw, path: '/account/orders/returns' },
];

export const OrderLayout: React.FC<OrderLayoutProps> = ({ children, title = "My Orders" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-neutral-900">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/account/dashboard')}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter">{title}</h1>
        </div>

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto no-scrollbar border-b border-neutral-100">
          <div className="flex items-center gap-2 min-w-max pb-px">
            {TABS.map((tab) => {
              const isActive = location.pathname === tab.path;
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={cn(
                    "flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                    isActive 
                      ? "text-black" 
                      : "text-neutral-400 hover:text-neutral-600"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-black" : "text-neutral-300")} />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
};
