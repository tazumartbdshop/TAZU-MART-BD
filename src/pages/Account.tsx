import React, { useState } from 'react';
import { 
  User, Package, Wallet, Coins, Gift, Heart, Ticket, MapPin, 
  RefreshCcw, Share2, HelpCircle, MessageSquare, Star, 
  Settings, LogOut, ChevronRight, Bell, Camera, 
  CreditCard, Shield, Globe, Eye, ShoppingBag, 
  LayoutGrid, Percent, Truck, CheckCircle2, History,
  Gamepad2, Zap, Warehouse, Users
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import LogoutModal from '../components/ui/LogoutModal';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { orders } = useOrderStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const stats = {
    balance: 2450.50,
    coins: 1250,
    coupons: 3,
    wishlist: 12,
    referrals: 5
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  // Dynamically count orders matching this registered user's phone number!
  const userOrders = user && user.phone 
    ? orders.filter(o => o.mobileNumber === user.phone) 
    : [];

  const toPayCount = userOrders.filter(o => o.status === 'Placed' || o.status === 'Pending').length;
  const toShipCount = userOrders.filter(o => o.status === 'Confirmed' || o.status === 'Processing' || o.status === 'Packaging').length;
  const toReceiveCount = userOrders.filter(o => o.status === 'Shipping').length;
  const toReviewCount = userOrders.filter(o => o.status === 'Delivered').length;
  const returnedCount = userOrders.filter(o => o.status === 'Returned').length;

  const orderStatuses = [
    { label: 'To Pay', icon: Wallet, count: toPayCount },
    { label: 'To Ship', icon: Warehouse, count: toShipCount },
    { label: 'To Receive', icon: Truck, count: toReceiveCount },
    { label: 'To Review', icon: MessageSquare, count: toReviewCount },
    { label: 'Returns', icon: RefreshCcw, count: returnedCount },
  ];

  const accountOptions = [
    { label: 'TAZU MART GAMES', icon: Gamepad2, path: '/games' },
    { label: 'HELP CENTER 🎧', icon: HelpCircle, path: '/support' },
    { label: 'MY REVIEWS', icon: Star, path: '/my-reviews' },
    { label: 'PAYMENT OPTIONS', icon: CreditCard, path: '/payment-methods' },
    { label: 'SETTINGS', icon: Settings, path: '/settings' },
    { label: 'LOGOUT', icon: LogOut, path: null, action: () => setShowLogoutModal(true), isLogout: true },
  ];

  const recentlyViewed = [
    { id: 1, name: 'Premium Wireless Headphones', price: 129.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200' },
    { id: 2, name: 'Smart Watch Series 7', price: 299.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200' },
    { id: 3, name: 'Leather Minimalist Wallet', price: 45.00, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=200' },
    { id: 4, name: 'Cotton Crew Neck T-Shirt', price: 25.00, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200' },
  ];

  return (
    <div className="bg-[#F8F9FE] min-h-screen pb-24 font-sans">
      {/* 1. Profile Section */}
      <div className="bg-white pt-12 pb-14 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-gray-100 overflow-hidden shadow-sm">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user?.name}&background=111&color=fff&size=200`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-lg text-gray-900 border border-gray-100">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-gray-900">
              <h2 className="text-2xl font-bold leading-none mb-1">{user?.name}</h2>
              <p className="text-gray-400 text-sm font-medium">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-gray-100 text-[10px] uppercase font-bold tracking-tight px-2 py-0.5 rounded">Gold Member</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-gray-50 rounded-xl text-gray-900 hover:bg-gray-100 transition-all">
              <Settings className="w-6 h-6" />
            </button>
            <button className="p-2.5 bg-gray-50 rounded-xl text-gray-900 hover:bg-gray-100 transition-all relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto relative z-20 space-y-px">
        
        {/* 2. Wallet & Rewards */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 py-3">
          <div className="bg-white py-4 px-4 flex items-center gap-3 border-y border-gray-100">
            <div className="w-8 h-8 bg-gray-50 text-gray-900 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide leading-none mb-1">Coins</p>
              <h4 className="text-base font-bold text-gray-900 leading-none">{stats.coins}</h4>
            </div>
          </div>

          <div className="bg-white py-4 px-4 flex items-center gap-3 border-y border-gray-100">
            <div className="w-8 h-8 bg-gray-50 text-gray-900 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide leading-none mb-1">Rewards</p>
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold text-gray-900 uppercase">Invite</h4>
                <button className="text-[8px] bg-gray-900 text-white px-2 py-0.5 font-bold uppercase tracking-wide">Play</button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. My Orders Section */}
        <section className="bg-white border-b border-gray-100">
          <div className="flex items-center justify-between py-3 px-4 border-b border-gray-50">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">MY ORDERS</h3>
            <Link to="/orders" className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              All Orders <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-5 py-4 px-2">
            {orderStatuses.map((status, i) => (
              <button key={i} className="flex flex-col items-center gap-2 group">
                <div className="relative">
                  <status.icon className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  {status.count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-[7px] font-bold w-3.5 h-3.5 flex items-center justify-center">
                      {status.count}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-tight text-gray-400 group-hover:text-gray-900">{status.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. Accountability Section - NEW STRUCTURE */}
        <section className="px-4 py-6 bg-gray-50">
          <div className="bg-white rounded-[18px] p-4 shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-gray-50">
              {accountOptions.map((option, i) => {
                const content = (
                  <div className="flex items-center justify-between py-4 group active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <option.icon className={cn("w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors", option.isLogout && "text-red-500")} />
                      <span className={cn(
                        "text-[11px] font-semibold uppercase tracking-wide text-gray-500 group-hover:text-gray-900",
                        option.isLogout && "text-red-500 group-hover:text-red-600"
                      )}>
                        {option.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                  </div>
                );

                if (option.action) {
                  return (
                    <button key={i} onClick={option.action} className="w-full text-left">
                      {content}
                    </button>
                  );
                }

                return (
                  <Link key={i} to={option.path || '#'} className="block">
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Recently Viewed */}
        <section className="bg-white py-6">
          <div className="px-6 flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Recently Viewed</h3>
            <button className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Clear All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-6">
            {recentlyViewed.map((item) => (
              <div 
                key={item.id}
                className="min-w-[120px] bg-white group cursor-pointer"
              >
                <div className="aspect-square overflow-hidden mb-2 bg-gray-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" />
                </div>
                <h5 className="text-[9px] font-bold text-gray-400 uppercase tracking-tight line-clamp-1 group-hover:text-gray-900">{item.name}</h5>
                <p className="text-gray-900 font-bold text-xs mt-1">{formatPrice(item.price)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Branding Footer */}
        <div className="text-center py-10">
          <h2 className="text-xl font-bold text-gray-200 uppercase tracking-[0.4em]">TAZU MART</h2>
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wide mt-1">Version 3.0.0 Premium</p>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </div>
  );
}
