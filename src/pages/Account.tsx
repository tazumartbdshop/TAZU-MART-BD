import React, { useState, useMemo } from 'react';
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
import { useOrderStore, Order } from '../store/useOrderStore';
import { useProductStore } from '../store/useProductStore';
import { useRecentlyViewedStore } from '../store/useRecentlyViewedStore';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import LogoutModal from '../components/ui/LogoutModal';
import { useSettingsStore } from '../store/useSettingsStore';
import { getCompletedOrdersCount, LoyaltyBadge, VerifiedTick } from '../lib/loyalty';

const getStatusIcon = (statusName: string) => {
  const norm = statusName.toLowerCase();
  if (norm.includes('placed') || norm.includes('order')) return Package;
  if (norm.includes('pending') || norm.includes('pay')) return Wallet;
  if (norm.includes('process')) return Settings;
  if (norm.includes('confirm')) return Shield;
  if (norm.includes('package') || norm.includes('pack')) return Warehouse;
  if (norm.includes('ship') || norm.includes('transit')) return Truck;
  if (norm.includes('deliver') || norm.includes('complete')) return CheckCircle2;
  if (norm.includes('cancel')) return LogOut;
  if (norm.includes('return')) return RefreshCcw;
  return Users;
};

const darazStatusItems = [
  {
    label: 'To Pay',
    backendStatuses: ['placed'],
    icon: Wallet,
  },
  {
    label: 'To Ship',
    backendStatuses: ['pending'],
    icon: Package,
  },
  {
    label: 'To Receive',
    backendStatuses: ['processing'],
    icon: Truck,
  },
  {
    label: 'To Review',
    backendStatuses: ['confirmed'],
    icon: MessageSquare,
  },
  {
    label: 'Returns & Cancellations',
    backendStatuses: ['cancelled', 'returned'],
    icon: RefreshCcw,
  },
];

export default function Account() {
  const navigate = useNavigate();
  const { settings } = useSettingsStore();
  const { user, logout } = useAuthStore();
  const { orders, trackingStatuses } = useOrderStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Dynamically filter matching orders for the logged-in customer by phone or email
  const userOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(o => 
      (user.phone && o.mobileNumber === user.phone) || 
      (user.email && o.email === user.email)
    );
  }, [orders, user]);

  // Auto-select latest order for tracking highlight
  React.useEffect(() => {
    if (userOrders.length > 0 && !selectedTrackOrderId) {
      setSelectedTrackOrderId(userOrders[0].id);
    }
  }, [userOrders, selectedTrackOrderId]);

  const activeTrackingOrder = useMemo(() => {
    return userOrders.find(o => o.id === selectedTrackOrderId) || userOrders[0] || null;
  }, [userOrders, selectedTrackOrderId]);

  // Compute successful completed orders
  const completedCount = getCompletedOrdersCount(orders, {
    email: user?.email,
    phone: user?.phone,
    name: user?.name,
  });

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

  // Map state filter based on active badge selection
  const filteredOrders = useMemo(() => {
    if (!activeFilter) return userOrders;
    const item = darazStatusItems.find(i => i.label === activeFilter);
    if (item) {
      return userOrders.filter(o => item.backendStatuses.includes(o.status.toLowerCase()));
    }
    return userOrders.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase());
  }, [userOrders, activeFilter]);

  const accountOptions = [
    { label: 'TAZU MART GAMES', icon: Gamepad2, path: '/games' },
    { label: 'HELP CENTER 🎧', icon: HelpCircle, path: '/support' },
    { label: 'MY REVIEWS', icon: Star, path: '/my-reviews' },
    { label: 'PAYMENT OPTIONS', icon: CreditCard, path: '/payment-methods' },
    { label: 'SETTINGS', icon: Settings, path: '/settings' },
    { label: 'LOGOUT', icon: LogOut, path: null, action: () => setShowLogoutModal(true), isLogout: true },
  ];

  const { products } = useProductStore();
  const { getViewedProducts, clearViewedProducts } = useRecentlyViewedStore();

  const viewedIds = getViewedProducts();
  const recentlyViewed = useMemo(() => {
    // Map viewed product IDs to real products, maintaining chronological order
    return viewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p);
  }, [viewedIds, products]);

  // Color mapping configuration for localized badges
  const STATUS_COLORS: Record<string, string> = {
    'Placed': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
    'Processing': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Confirmed': 'bg-blue-50 text-blue-700 border-blue-200',
    'Packaging': 'bg-purple-50 text-purple-700 border-purple-200',
    'Shipping': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200',
    'Returned': 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-[#F8F9FE] min-h-screen pb-24 font-sans"
    >
      {/* 1. Profile Section */}
      <div className="bg-white pt-12 pb-14 px-6 border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              {user?.profileImage ? (
                <div className="w-20 h-20 rounded-full border-2 border-purple-600/30 overflow-hidden shadow-md">
                   <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full border-2 border-gray-100 overflow-hidden shadow-sm">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.name || 'Imtiaz'}&background=111&color=fff&size=200`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-lg text-gray-900 border border-gray-100 hover:bg-neutral-50 transition-colors"
                    title="Upload Profile Pic"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div className="text-gray-900">
              <h2 className="text-2xl font-bold leading-none mb-1 flex items-center gap-1.5 flex-wrap">
                {user?.name}
                {completedCount >= 5 && <VerifiedTick />}
              </h2>
              <p className="text-gray-400 text-sm font-medium">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <LoyaltyBadge count={completedCount} />
              </div>
            </div>
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

          {/* Active Track Order Selector if multiple orders exist */}
          {userOrders.length > 1 && (
            <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-[9px] font-black uppercase text-gray-505 tracking-wider">Select Order to Track:</span>
              <select 
                value={selectedTrackOrderId || ""} 
                onChange={(e) => setSelectedTrackOrderId(e.target.value)}
                className="text-[10px] font-bold uppercase bg-white border border-gray-200 rounded px-2.5 py-1 text-gray-800 focus:outline-none"
              >
                {userOrders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.orderId || o.id} ({o.status} - {new Date(o.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dynamic Status Cards with Horizontal Scroll and Active Highlight */}
          <div className="flex gap-3 overflow-x-auto pb-4 pt-3 px-4 scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {darazStatusItems.map((item, i) => {
              const count = userOrders.filter(o => item.backendStatuses.includes(o.status.toLowerCase())).length;
              const isTrackingActive = activeTrackingOrder && item.backendStatuses.includes(activeTrackingOrder.status.toLowerCase());
              const isFilteredActive = activeFilter === item.label;
              const IconComp = item.icon;

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (item.label === 'To Review') {
                      navigate('/orders/to-review');
                    } else {
                      setActiveFilter(prev => prev === item.label ? null : item.label);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 px-4 py-3 border rounded-xl cursor-pointer transition-all shrink-0 min-w-[95px] relative",
                    isTrackingActive 
                      ? "bg-[#111111] text-white border-black ring-2 ring-black shadow-lg scale-102"
                      : isFilteredActive
                        ? "bg-slate-200 text-slate-900 border-slate-300 font-extrabold scale-102"
                        : "bg-white text-gray-500 border-gray-100 hover:bg-neutral-50 hover:border-gray-300"
                  )}
                >
                  {/* Black Badge Counter */}
                  {count > 0 && (
                    <span className={cn(
                      "absolute -top-1.5 -right-1.5 text-[8.5px] font-black w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                      isTrackingActive 
                        ? "bg-white text-black border-black" 
                        : "bg-black text-white border-white"
                    )}>
                      {count}
                    </span>
                  )}

                  <IconComp className={cn(
                    "w-5 h-5 transition-colors",
                    isTrackingActive 
                      ? "text-white" 
                      : "text-black"
                  )} />

                  <span className={cn(
                    "text-[9px] uppercase tracking-wider font-extrabold text-center block max-w-[85px] truncate",
                    isTrackingActive ? "text-white" : "text-black"
                  )}>
                    {item.label}
                  </span>
                  
                  {isTrackingActive && (
                    <span className="text-[7px] bg-white/10 text-emerald-400 font-black px-1.5 py-0.5 rounded uppercase tracking-widest mt-0.5 animate-pulse">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic filtered orders checklist */}
          <AnimatePresence mode="popLayout">
            {activeFilter && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gray-50/50 border-t border-gray-100 p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Showing {activeFilter} Orders ({filteredOrders.length})
                  </h4>
                  <button 
                    onClick={() => setActiveFilter(null)}
                    className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-700"
                  >
                    Clear Filter
                  </button>
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id}
                        className="bg-white p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex flex-col gap-3 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-gray-50 flex-wrap gap-2">
                          <div>
                            <span className="text-[11px] font-black text-gray-900">#{order.orderId || order.id}</span>
                            <span className="text-[8px] text-gray-400 font-bold uppercase ml-2 select-none">
                              {new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border",
                            STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                          )}>
                            {order.status}
                          </span>
                        </div>

                        {/* Items list detail preview */}
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-10 h-10 object-cover border border-gray-100"
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[10px] font-bold text-gray-850 truncate">{item.name}</h5>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-tight">
                                  Qty: {item.quantity} {item.variant !== 'Default' && `• ${item.variant}`}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order action footer control bar */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 flex-wrap gap-2">
                          <span className="text-[10px] font-bold text-gray-500">
                            Total: <span className="font-black text-black">{formatPrice(order.total)}</span>
                          </span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setTrackingOrder(order)}
                              className="text-[9px] font-black bg-black text-white px-3 py-1.5 uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
                            >
                              Track Order
                            </button>
                            <Link 
                              to={`/checkout/invoice/${order.id}`}
                              className="text-[9px] font-black border border-gray-200 text-gray-500 px-3 py-1.5 uppercase tracking-wider hover:bg-gray-50 hover:text-black transition-colors"
                            >
                              Invoice
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white py-8 px-4 text-center border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No matching orders found</p>
                    <p className="text-[9px] text-gray-400 mt-1">There are currently no orders with this status filter.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
        <section className="bg-white py-6 border-t border-gray-100">
          <div className="px-6 flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Recently Viewed</h3>
            {recentlyViewed.length > 0 && (
              <button 
                onClick={() => clearViewedProducts()}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          {recentlyViewed.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory px-6 scroll-smooth">
              {recentlyViewed.map((item) => {
                const hasDiscount = item.discountPrice !== undefined && item.discountPrice < item.price;
                return (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/product/${item.slug || item.id}`)}
                    className="min-w-[130px] max-w-[130px] bg-white group cursor-pointer flex flex-col snap-start shrink-0"
                  >
                    <div className="aspect-square w-full overflow-hidden mb-2 rounded bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                      <img 
                        src={item.image || null} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {hasDiscount && (
                        <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 tracking-wider rounded-none">
                          -{Math.round(((item.price - item.discountPrice!) / item.price) * 100)}%
                        </span>
                      )}
                    </div>
                    <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-tight line-clamp-2 leading-snug min-h-[30px] group-hover:text-gray-900 transition-colors">
                      {item.name}
                    </h5>
                    <div className="mt-1 flex items-baseline gap-1 mr-1 flex-wrap">
                      <span className="text-gray-950 font-black text-xs">
                        {formatPrice(hasDiscount ? item.discountPrice! : item.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[9px] text-gray-400 line-through font-bold">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
              <Eye className="w-8 h-8 text-gray-300 stroke-[1.5] mb-2" />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No recently viewed products</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">Products you browse will appear here dynamically.</p>
            </div>
          )}
        </section>

        {/* Branding Footer */}
        <div className="text-center py-10 flex flex-col items-center justify-center">
          {settings.storeLogo ? (
            <img 
              src={settings.storeLogo} 
              alt={settings.storeName || "Logo"} 
              className="h-9 max-w-[140px] object-contain mb-2 opacity-80" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <h2 className="text-xl font-bold text-gray-200 uppercase tracking-[0.4em]">
              {settings.storeName || "TAZU MART"}
            </h2>
          )}
          {settings.storeLogo && settings.storeName && (
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
              {settings.storeName}
            </p>
          )}
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-wide mt-1">Version 3.0.0 Premium</p>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />

      {/* Dynamic 9-Stage Tracking Modal Overlay */}
      <AnimatePresence>
        {trackingOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 relative font-sans"
            >
              <button 
                onClick={() => setTrackingOrder(null)}
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full p-2 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                <Package className="w-6 h-6 text-black" />
                <div>
                  <h3 className="text-md font-black text-gray-900 tracking-tight uppercase">Order Tracker</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">ID: #{trackingOrder.orderId || trackingOrder.id}</p>
                </div>
              </div>

              {/* Order quick overview */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-2xl p-4 mb-6 text-[10px]">
                <div>
                  <span className="text-gray-455 font-bold uppercase block text-[8px] tracking-wide mb-0.5">Date Placed</span>
                  <span className="font-extrabold text-gray-900">{new Date(trackingOrder.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-gray-455 font-bold uppercase block text-[8px] tracking-wide mb-0.5">Total Paid</span>
                  <span className="font-extrabold text-gray-950">{formatPrice(trackingOrder.total)}</span>
                </div>
                <div>
                  <span className="text-gray-455 font-bold uppercase block text-[8px] tracking-wide mb-0.5">Payment Method</span>
                  <span className="font-extrabold text-gray-900 uppercase">{trackingOrder.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-gray-455 font-bold uppercase block text-[8px] tracking-wide mb-0.5">Courier Channel</span>
                  <span className="font-extrabold text-gray-900 uppercase">{trackingOrder.courier?.name || 'Pathao'}</span>
                </div>
              </div>

              {/* Cancelled/Returned alerts */}
              {trackingOrder.status === 'Cancelled' && (
                <div className="bg-red-50 text-red-700 text-[10px] font-black px-4 py-3 rounded-xl border border-red-100 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  THIS ORDER HAS BEEN CANCELLED BY THE MERCHANT.
                </div>
              )}
              {trackingOrder.status === 'Returned' && (
                <div className="bg-orange-50 text-orange-700 text-[10px] font-black px-4 py-3 rounded-xl border border-orange-100 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                  THIS ORDER HAS BEEN RETURNED TO THE WAREHOUSE.
                </div>
              )}

              {/* Custom Timeline Tracks */}
              <div className="space-y-6 relative pl-3">
                <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-gray-100" />
                
                {[
                  { name: 'Placed', label: 'Order Submitted', desc: 'Securely submitted by customer.' },
                  { name: 'Pending', label: 'Payment Pending', desc: 'Awaiting checkout authorization.' },
                  { name: 'Processing', label: 'Processing spec', desc: 'Preparing item inventory checks.' },
                  { name: 'Confirmed', label: 'Order Confirmed', desc: 'Authorized and queued for dispatch.' },
                  { name: 'Packaging', label: 'Package Assembled', desc: 'Wrapped in high-fidelity protective sleeves.' },
                  { name: 'Shipping', label: 'In Transit', desc: 'Dispatched via trusted express courier service.' },
                  { name: 'Delivered', label: 'Completed', desc: 'Successfully received at designated location.' },
                ].map((step, idx) => {
                  const isCompleted = trackingOrder.statusHistory?.some(sh => sh.status.toLowerCase() === step.name.toLowerCase());
                  const isCurrent = trackingOrder.status.toLowerCase() === step.name.toLowerCase();
                  const matchLog = trackingOrder.statusHistory?.find(sh => sh.status.toLowerCase() === step.name.toLowerCase());
                  const logTime = matchLog ? new Date(matchLog.timestamp).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : null;

                  return (
                    <div key={idx} className="relative pl-10 flex items-start justify-between min-h-[45px]">
                      {/* Dynamic glowing bullet indicator */}
                      <div className={cn(
                        "absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all duration-300",
                        isCompleted ? "bg-black text-white" : isCurrent ? "bg-black text-white animate-pulse" : "bg-gray-100 text-gray-400"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        ) : (
                          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 pr-3">
                        <h4 className={cn(
                          "text-[10px] font-black uppercase tracking-wider leading-none",
                          isCompleted ? "text-gray-950" : "text-gray-400"
                        )}>
                          {step.label}
                          {isCurrent && <span className="text-[7px] bg-black text-white rounded px-1 ml-2 font-black">ACTIVE</span>}
                        </h4>
                        <p className="text-[9px] text-gray-400 mt-1">{step.desc}</p>
                      </div>

                      {logTime && (
                        <span className="text-[8px] font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 whitespace-nowrap select-none shrink-0 self-start">
                          {logTime}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
