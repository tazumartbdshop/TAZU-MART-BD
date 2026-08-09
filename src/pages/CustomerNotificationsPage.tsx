import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  BellOff, 
  CheckCheck, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  RotateCcw, 
  ShieldAlert, 
  Info, 
  Trash2, 
  Ticket, 
  ChevronRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSystemNotificationStore, SystemNotificationType } from '../store/useSystemNotificationStore';

export default function CustomerNotificationsPage() {
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    getUnreadCount 
  } = useSystemNotificationStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const unreadCount = getUnreadCount();

  // Filter categories with count calculations
  const categories = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
    { id: 'payment', label: 'Payments', count: notifications.filter(n => n.type === 'payment').length },
    { id: 'shipping', label: 'Shipping', count: notifications.filter(n => n.type === 'shipping').length },
    { id: 'refund', label: 'Refunds', count: notifications.filter(n => n.type === 'refund').length },
    { id: 'account', label: 'Account', count: notifications.filter(n => n.type === 'account' || n.type === 'security' || n.type === 'system').length },
  ];

  // Filtered list based on selected category tab
  const filteredNotifications = notifications.filter((notif) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'account') {
      return notif.type === 'account' || notif.type === 'security' || notif.type === 'system';
    }
    return notif.type === activeCategory;
  });

  // Helper to get category icon
  const getNotificationIcon = (type: SystemNotificationType) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      case 'shipping':
        return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'refund':
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'account':
      case 'system':
      default:
        return <Info className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16 pt-2 px-2 sm:px-4 md:px-6">
      <div className="max-w-3xl mx-auto space-y-3">
        
        {/* COMPACT REDESIGNED HEADER */}
        <div className="h-14 bg-white px-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-700 cursor-pointer shrink-0"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <Bell className="w-5 h-5 text-slate-800 shrink-0" />
              <h1 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-tight truncate">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="bg-slate-950 hover:bg-black text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Read All</span>
              </button>
            )}
          </div>
        </div>

        {/* FUTURE READY CATEGORY FILTER TABS */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* MAIN NOTIFICATION CONTENT OR PROFESSIONAL EMPTY STATE */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredNotifications.map((notif) => {
                const formattedDate = new Date(notif.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const formattedTime = new Date(notif.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => markAsRead(notif.id)}
                    className={`bg-white border rounded-xl p-3.5 transition-all space-y-2 relative overflow-hidden ${
                      notif.isRead 
                        ? 'border-slate-200 opacity-90' 
                        : 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-400/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-xs sm:text-sm ${notif.isRead ? 'font-bold text-slate-800' : 'font-black text-slate-950'}`}>
                              {notif.title}
                            </h3>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                            )}
                          </div>
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase">
                            {formattedDate} • {formattedTime}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="text-slate-300 hover:text-red-600 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-10">
                      {notif.message}
                    </p>

                    {notif.actionUrl && (
                      <div className="pl-10 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(notif.actionUrl!);
                          }}
                          className="bg-slate-950 hover:bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          /* PROFESSIONAL EMPTY STATE DESIGN */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center shadow-xs space-y-4 my-2"
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-200">
              <BellOff className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 stroke-[1.75]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center border border-amber-300">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                No Notifications Yet
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                You don't have any notifications at the moment. New order updates, payment status, and security alerts will appear here in the future.
              </p>
            </div>

            {/* QUICK ACTIONS */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
              <button
                onClick={() => navigate('/coupons')}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Ticket className="w-4 h-4" />
                <span>Explore Offers & Coupons</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-widest">
                Future Ready • Order Updates • Payment Alerts • Security Messages
              </p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
