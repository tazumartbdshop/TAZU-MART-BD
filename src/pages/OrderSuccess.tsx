import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCartStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CheckCircle2, Package, Truck, Calendar, ShoppingBag, ArrowRight, Printer, Share2, Star, MessageCircle, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, subscribeOrders } = useOrderStore();
  const { clearCart } = useCartStore();
  const { settings } = useSettingsStore();

  const stateOrder = location.state?.order;
  const order = stateOrder || orders.find(o => o.orderId === orderId);

  useEffect(() => {
    // Activate dynamic live order subscriptions
    const unsubscribe = subscribeOrders();
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
      unsubscribe();
    };
  }, [navigate, clearCart, subscribeOrders]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-neutral-900">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-black mb-2">Finding Your Order...</h2>
          <p className="text-gray-500 mb-6">We're retrieving your premium checkout details. Please wait a moment.</p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-neutral-800 transition-all active:scale-95"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;
  
  // WhatsApp Link
  const rawWaNumber = settings?.whatsappNumber || "8801314541738";
  const whatsappNumber = rawWaNumber.replace(/[^0-9]/g, '');
  const whatsappMessage = `Hello Tazu Mart BD, I just placed order #${order.orderId} and would like to confirm it.`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans selection:bg-emerald-500 selection:text-white text-neutral-900">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-blue-100 rounded-full blur-[100px]"></div>
      </div>

      {/* Hero Header */}
      <div className="relative pt-16 pb-12 px-4 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          {settings.storeLogo && (
            <img 
              src={settings.storeLogo} 
              alt={settings.storeName || "Logo"} 
              className="h-12 mx-auto object-contain mb-6" 
              referrerPolicy="no-referrer"
            />
          )}
          <motion.div 
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-200"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-neutral-950 mb-4 tracking-tighter uppercase">
              Order Confirmed
            </h1>
            <div className="inline-flex items-center gap-2 bg-neutral-100 px-4 py-2 rounded-full mb-6 border border-neutral-200">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Order ID:</span>
              <span className="text-sm font-black text-neutral-900">#{order.orderId}</span>
            </div>
            <p className="text-neutral-500 text-lg max-w-lg mx-auto leading-relaxed">
              Success! Your luxury shopping experience is complete. We've received your order and our curators are preparing it for delivery.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Quick Status Bar */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Status</span>
                </div>
                <p className="text-lg font-black text-neutral-900">{order.status}</p>
              </div>
              <div className="bg-white border border-neutral-150 rounded-[28px] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Delivery</span>
                </div>
                <p className="text-lg font-black text-neutral-900">3-5 Days</p>
              </div>
            </motion.div>

            {/* Delivery Info */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-neutral-150 rounded-[32px] p-8 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-neutral-950 uppercase tracking-tight">Delivery Details</h3>
                <Truck className="w-6 h-6 text-neutral-200" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Recipient</h4>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-neutral-900">{order.customerName}</p>
                      <p className="text-sm font-bold text-neutral-600">{order.mobileNumber}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Shipping Address</h4>
                    <p className="text-sm font-bold text-neutral-900 leading-relaxed max-w-[240px]">
                      {order.fullAddress}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Payment Info</h4>
                    <div className="inline-flex items-center gap-2 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-black text-neutral-800">{order.paymentMethod}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Service Type</h4>
                    <p className="text-sm font-bold text-neutral-900">{order.deliveryMode}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Items List */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white border border-neutral-150 rounded-[32px] overflow-hidden shadow-sm"
            >
              <div className="p-8 border-b border-neutral-50">
                <h3 className="text-xl font-black text-neutral-950 uppercase tracking-tight">Your Selection</h3>
              </div>
              <div className="divide-y divide-neutral-50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-6 md:p-8 flex items-center gap-6 group hover:bg-neutral-50/50 transition-colors">
                    <div className="w-20 h-20 bg-neutral-100 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-150">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black bg-neutral-950 text-white px-2 py-0.5 rounded uppercase tracking-widest">
                          {item.quantity}x
                        </span>
                        <h4 className="text-base font-bold text-neutral-900 truncate">{item.name}</h4>
                      </div>
                      <p className="text-sm font-bold text-neutral-400">{formatPrice(item.price)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-neutral-950">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Actions & Total */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Payment Summary Card */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-neutral-950 text-white rounded-[40px] p-10 shadow-2xl shadow-neutral-300 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-2xl font-black mb-10 tracking-tight uppercase">Payment Summary</h3>
              
              <div className="space-y-5 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-400">Cart Subtotal</span>
                  <span className="text-base font-bold">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-400">Premium Shipping</span>
                  <span className="text-base font-bold">{formatPrice(order.deliveryCharge)}</span>
                </div>
                {order.discount.amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-emerald-400">Exclusive Reward</span>
                    <span className="text-base font-bold text-emerald-400">-{formatPrice(order.discount.amount)}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-neutral-800">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-black text-white uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-white">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => navigate(`/checkout/invoice/${order.orderId}`)}
                  className="w-full h-16 bg-white text-neutral-950 rounded-[22px] font-black uppercase text-xs tracking-widest hover:bg-neutral-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Download Invoice <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate('/orders')}
                  className="w-full h-16 bg-neutral-800 text-neutral-300 rounded-[22px] font-black uppercase text-xs tracking-widest hover:bg-neutral-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Track in Account <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Premium Support Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-emerald-50 rounded-[32px] p-8 border border-emerald-100 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
                <MessageCircle className="w-8 h-8 text-white fill-white/20" />
              </div>
              <h4 className="text-lg font-black text-neutral-900 mb-2 uppercase tracking-tight">Concierge Support</h4>
              <p className="text-sm font-bold text-neutral-600 mb-6 leading-relaxed">
                Need to modify your order or have a question? Our premium support team is standing by on WhatsApp.
              </p>
              <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg shadow-emerald-200 active:scale-95"
              >
                Connect on WhatsApp
              </a>
            </motion.div>

            {/* Trust Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center pt-4"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-neutral-200" />
                <span className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em]">Excellence Defined</span>
                <Heart className="w-4 h-4 text-neutral-200" />
              </div>
              <p className="text-xs font-bold text-neutral-400">© 2024 TAZU MART BD. Hand-curated Luxury Lifestyle.</p>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
