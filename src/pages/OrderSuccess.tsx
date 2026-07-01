import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CheckCircle2, Package, Truck, Calendar, ShoppingBag, ArrowRight, Printer, Share2, Star, MessageCircle, Heart, Home, Receipt } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useOrderStore();
  const { clearCart } = useCartStore();
  const { settings } = useSettingsStore();

  const stateOrder = location.state?.order;
  const order = stateOrder || orders.find(o => o.orderId === orderId);

  useEffect(() => {
    // Activate dynamic live order subscriptions
    clearCart();
    
    window.scrollTo(0, 0);

    // Prevent going back to checkout page
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      navigate('/', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, clearCart]);

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-6 max-w-sm w-full">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-3 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Finding Your Order</h2>
            <p className="text-sm text-neutral-500 font-medium">Retrieving your secure checkout details. Please wait a moment.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full h-14 bg-neutral-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-200"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
  
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 md:p-8 font-sans selection:bg-neutral-900 selection:text-white text-neutral-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-[40px] border border-neutral-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden"
      >
        {/* Success Header */}
        <div className="p-8 md:p-10 text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-black text-neutral-950 uppercase tracking-tighter"
            >
              Order Placed Successfully!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-neutral-500 text-sm md:text-base max-w-xs mx-auto leading-relaxed font-medium"
            >
              Thank you for your purchase. Your order has been received and is being processed.
            </motion.p>
          </div>

          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6 text-left space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order ID</span>
              <span className="text-sm font-black text-neutral-900">#{order.orderId}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Customer</span>
              <span className="text-sm font-bold text-neutral-900 uppercase truncate max-w-[180px]">{order.customerName}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</span>
              <span className="text-sm font-bold text-neutral-900">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Payment</span>
              <span className="text-sm font-bold text-neutral-900 uppercase">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200/60">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded">{order.status}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] font-black text-neutral-950 uppercase tracking-widest">Total Amount</span>
              <span className="text-xl font-black text-neutral-950">{formatPrice(order.total)}</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-row items-center justify-center gap-3 pt-2">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 h-14 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button 
              onClick={() => navigate(`/checkout/invoice/${order.orderId}`)}
              className="flex-1 h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 shadow-xl shadow-neutral-200 flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              View Invoice
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
