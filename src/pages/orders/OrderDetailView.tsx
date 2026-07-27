import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Truck, MapPin, User, Phone, 
  CreditCard, Calendar, CheckCircle2, Clock, FileText, 
  Download, Star, RefreshCcw, AlertCircle, ShieldCheck
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatPrice, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function OrderDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, requestRefund } = useOrderStore();
  
  const order = orders.find(o => o.id === id || o.orderId === id);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight">Order Not Found</h2>
        <button 
          onClick={() => navigate('/account/orders')}
          className="mt-6 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
      </div>
    );
  }

  const steps = [
    { key: 'Placed', label: 'Order Placed', icon: Clock },
    { key: 'Confirmed', label: 'Confirmed', icon: ShieldCheck },
    { key: 'Preparing', label: 'Preparing', icon: Package },
    { key: 'Packed', label: 'Packed', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.status);
  
  const handleRefund = async () => {
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for refund');
      return;
    }
    try {
      await requestRefund(order.id, refundReason);
      setShowRefundModal(false);
      toast.success('Refund request submitted successfully');
    } catch (err) {
      toast.error('Failed to submit refund request');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Placed': 'bg-neutral-100 text-neutral-600',
      'Pending': 'bg-amber-50 text-amber-600',
      'Confirmed': 'bg-blue-50 text-blue-600',
      'Preparing': 'bg-blue-50 text-blue-600',
      'Packed': 'bg-indigo-50 text-indigo-600',
      'Shipping': 'bg-indigo-50 text-indigo-600',
      'Shipped': 'bg-indigo-50 text-indigo-600',
      'Out for Delivery': 'bg-orange-50 text-orange-600',
      'Delivered': 'bg-emerald-50 text-emerald-600',
      'Completed': 'bg-emerald-50 text-emerald-600',
      'Cancelled': 'bg-red-50 text-red-600',
      'Refund Requested': 'bg-purple-50 text-purple-600',
      'Refund Approved': 'bg-purple-100 text-purple-700',
      'Refunded': 'bg-neutral-900 text-white',
    };
    return (
      <span className={cn(
        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent",
        colors[status] || 'bg-neutral-50 text-neutral-400'
      )}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white min-h-screen pb-24 font-sans text-neutral-900">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Order Details</h1>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                Ordered on {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate(`/checkout/invoice/${order.orderId}`)}
              className="px-6 py-2.5 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" /> Invoice
            </button>
            {(order.status === 'Delivered' || order.status === 'Completed') && !order.status.includes('Refund') && (
              <button 
                onClick={() => setShowRefundModal(true)}
                className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
              >
                Request Refund
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Refund Information Section */}
            {order.status.includes('Refund') && (
              <div className="bg-purple-50 border border-purple-100 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-purple-200 pb-4">
                  <RefreshCcw className="w-5 h-5 text-purple-600" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-purple-900">Refund Status & Timeline</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-purple-100">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">Reason for Refund</div>
                    <p className="text-xs font-medium text-purple-900">"Damaged product received"</p>
                  </div>
                  {/* Visual Refund Timeline */}
                  <div className="flex items-center justify-between px-4 py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-purple-900 text-center">Requested</span>
                    </div>
                    <div className={cn("flex-1 h-0.5 mx-2", order.status !== 'Refund Requested' ? "bg-purple-600" : "bg-purple-200")} />
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", ['Refund Approved', 'Refunded'].includes(order.status) ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-purple-100 text-purple-300")}>
                        <RefreshCcw className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-purple-900 text-center">Approved</span>
                    </div>
                    <div className={cn("flex-1 h-0.5 mx-2", order.status === 'Refunded' ? "bg-purple-600" : "bg-purple-200")} />
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", order.status === 'Refunded' ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-purple-100 text-purple-300")}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-purple-900 text-center">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Timeline */}
            <div className="bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest mb-10 border-b border-neutral-50 pb-4">Order Tracking</h3>
              <div className="relative">
                {/* Line Background */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-50" />
                
                <div className="space-y-12">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const Icon = step.icon;
                    const history = order.statusHistory?.find(h => h.status === step.key);

                    return (
                      <div key={idx} className="relative flex items-start gap-8">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500",
                          isCompleted ? "bg-black text-white" : "bg-neutral-50 text-neutral-200"
                        )}>
                          <Icon className={cn("w-6 h-6", isCurrent && "animate-pulse")} />
                        </div>
                        <div className="flex-1 pt-2">
                          <h4 className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            isCompleted ? "text-black" : "text-neutral-300"
                          )}>
                            {step.label}
                          </h4>
                          {history && (
                            <p className="text-[10px] text-neutral-400 font-medium mt-1">
                              {new Date(history.timestamp).toLocaleString('en-GB', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </p>
                          )}
                        </div>
                        {isCurrent && (
                          <div className="pt-2">
                            <span className="px-3 py-1 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                              Current Status
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-neutral-50 pb-4">Order Items</h3>
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 group">
                    <div className="w-24 h-24 rounded-3xl bg-neutral-50 border border-neutral-100 overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-black uppercase tracking-tight group-hover:text-primary-600 transition-colors">{item.name}</h4>
                      <p className="text-xs text-neutral-400 font-medium mt-1 uppercase tracking-widest">
                        {item.variant}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Qty: {item.quantity}</span>
                        <span className="text-xs font-black">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black">{formatPrice(item.price * item.quantity)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-black text-white rounded-3xl p-8 shadow-xl shadow-neutral-900/20">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Payment Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-medium text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-neutral-400">
                  <span>Delivery Charge</span>
                  <span className="text-white">{formatPrice(order.deliveryCharge)}</span>
                </div>
                {order.discount?.amount > 0 && (
                  <div className="flex justify-between text-xs font-medium text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount.amount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl font-black">{formatPrice(order.total)}</span>
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Payment Method</div>
                  <div className="text-xs font-black uppercase">{order.paymentMethod}</div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-neutral-50 pb-4">Delivery Information</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Recipient</span>
                    <p className="text-xs font-bold uppercase mt-0.5">{order.customerName}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500">
                      <Phone className="w-3.5 h-3.5" />
                      {order.mobileNumber}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Address</span>
                    <p className="text-xs font-bold text-neutral-800 leading-relaxed mt-0.5 uppercase">{order.fullAddress}</p>
                    <p className="text-[10px] font-black text-black mt-1 uppercase tracking-widest">{order.cityArea}</p>
                  </div>
                </div>

                {order.courier && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Tracking Details</span>
                      <p className="text-xs font-bold uppercase mt-0.5">{order.courier.name}</p>
                      <p className="text-[10px] font-black text-blue-600 mt-1 uppercase tracking-widest">
                        {order.courier.trackingId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      <AnimatePresence>
        {showRefundModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRefundModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 relative z-10 shadow-2xl"
            >
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Request Refund</h3>
              <p className="text-xs text-neutral-500 font-medium mb-6">
                Please provide a detailed reason for your refund request for Order #{order.orderId}.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1.5 block">Reason</label>
                  <textarea 
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="E.g. Product damaged, size issues, etc."
                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-black transition-all min-h-[120px]"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowRefundModal(false)}
                    className="flex-1 px-6 py-4 border border-neutral-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRefund}
                    className="flex-1 px-6 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg shadow-black/10"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
