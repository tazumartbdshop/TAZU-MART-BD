import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Package, Truck, MapPin, User, Phone, Mail,
  CreditCard, Calendar, CheckCircle2, Clock, FileText, 
  Download, Star, RefreshCcw, AlertCircle, ShieldCheck,
  Building, Hash, ExternalLink, HelpCircle, Navigation,
  Tag, CheckCircle, XCircle, ArrowUpRight, Box, Compass
} from 'lucide-react';
import { useOrderStore } from '../../store/useOrderStore';
import { formatPrice, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSmartBack } from '../../hooks/useSmartBack';

export default function OrderDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const goBack = useSmartBack('/account/orders');
  const { orders, requestRefund } = useOrderStore();
  
  const paramId = (id || '').toLowerCase().trim();
  const cleanParamId = paramId.replace(/[^a-z0-9]/g, '');

  const order = orders.find(o => {
    if (!o) return false;
    const oId = (o.id || '').toLowerCase().trim();
    const oOrderId = (o.orderId || '').toLowerCase().trim();
    const oBillId = (o.billId || '').toLowerCase().trim();

    if (oId === paramId || oOrderId === paramId || oBillId === paramId) return true;

    const cleanOId = oId.replace(/[^a-z0-9]/g, '');
    const cleanOOrderId = oOrderId.replace(/[^a-z0-9]/g, '');
    const cleanOBillId = oBillId.replace(/[^a-z0-9]/g, '');

    return (
      (cleanParamId && (cleanOId === cleanParamId || cleanOOrderId === cleanParamId || cleanOBillId === cleanParamId)) ||
      (cleanParamId && cleanOId.endsWith(cleanParamId)) ||
      (cleanParamId && cleanOOrderId.endsWith(cleanParamId))
    );
  });
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-4 border border-red-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-black uppercase tracking-tight">Order Not Found</h2>
        <p className="text-xs text-neutral-500 font-bold mt-1 max-w-xs">
          The order ID <span className="text-black font-black">#{id}</span> could not be retrieved from the database.
        </p>
        <button 
          onClick={() => navigate('/account/orders')}
          className="mt-6 px-6 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-neutral-800 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Order History
        </button>
      </div>
    );
  }

  // 9 Timeline Steps according to strict specs
  const timelineSteps = [
    { key: 'placed', label: 'Order Placed', desc: 'Order received in database' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Order verified & approved' },
    { key: 'processing', label: 'Processing', desc: 'Preparing item inventory' },
    { key: 'packed', label: 'Packed', desc: 'Parcel sealed & labeled' },
    { key: 'pickup', label: 'Pickup Completed', desc: 'Handed over to courier' },
    { key: 'transit', label: 'In Transit', desc: 'En route to destination city' },
    { key: 'hub', label: 'Arrived at Hub', desc: 'Received at local hub' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier rider on the way' },
    { key: 'delivered', label: 'Delivered', desc: 'Package delivered safely' }
  ];

  // Helper to map order.status to step index (0 - 8)
  const getStepIndex = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'cancelled') return -1;
    if (['placed', 'pending', 'pending payment', 'to-pay'].includes(s)) return 0;
    if (['confirmed'].includes(s)) return 1;
    if (['preparing', 'processing', 'to-ship'].includes(s)) return 2;
    if (['packed'].includes(s)) return 3;
    if (['pickup completed', 'pickup', 'picked up'].includes(s)) return 4;
    if (['shipping', 'shipped', 'in transit', 'to-receive'].includes(s)) return 5;
    if (['arrived at hub', 'hub'].includes(s)) return 6;
    if (['out for delivery'].includes(s)) return 7;
    if (['delivered', 'completed', 'returned'].includes(s)) return 8;
    return 0;
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status.toLowerCase() === 'cancelled';

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
    const s = (status || 'Pending').toLowerCase();
    if (s === 'cancelled') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-100 text-red-900 border border-red-300 flex items-center gap-1.5 shrink-0">
          <XCircle className="w-3.5 h-3.5 text-red-700 stroke-[2.5]" />
          Cancelled
        </span>
      );
    }
    if (['delivered', 'completed'].includes(s)) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1.5 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 stroke-[2.5]" />
          Delivered
        </span>
      );
    }
    if (['shipping', 'shipped', 'out for delivery', 'to-receive', 'in transit'].includes(s)) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-950 border border-indigo-300 flex items-center gap-1.5 shrink-0">
          <Truck className="w-3.5 h-3.5 text-indigo-800 stroke-[2.5]" />
          {order.status}
        </span>
      );
    }
    if (['confirmed', 'preparing', 'packed', 'processing', 'to-ship'].includes(s)) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-950 border border-blue-300 flex items-center gap-1.5 shrink-0">
          <Package className="w-3.5 h-3.5 text-blue-800 stroke-[2.5]" />
          Processing
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1.5 shrink-0">
        <Clock className="w-3.5 h-3.5 text-amber-800 stroke-[2.5]" />
        {order.status || 'Pending'}
      </span>
    );
  };

  const formattedDate = useMemo(() => {
    try {
      const d = new Date(order.date);
      if (isNaN(d.getTime())) return 'Recently Placed';
      return d.toLocaleDateString('en-GB', { 
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true 
      });
    } catch (e) {
      return 'Recently Placed';
    }
  }, [order.date]);

  const itemsList = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];

  // Extract transaction ID if present in payment method or custom field
  const transactionId = (order as any).transactionId || (order as any).bkashTxnId || (order as any).nagadTxnId || (order as any).rocketTxnId || (order as any).txnId || 'N/A';

  return (
    <div className="bg-neutral-50/60 min-h-screen pb-20 font-sans text-neutral-900 selection:bg-black selection:text-white">
      <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8">
        
        {/* 1. Header Section */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 mb-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => goBack('/account/orders')}
                className="w-10 h-10 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black flex items-center justify-center transition-colors shrink-0 active:scale-95"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-black text-black uppercase tracking-tight">Order Details</h1>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap text-xs font-bold text-neutral-600">
                  <span className="flex items-center gap-1 text-black font-black">
                    <Hash className="w-3.5 h-3.5" /> Order ID: <span className="text-black font-black">#{order.orderId}</span>
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="flex items-center gap-1 text-neutral-600 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-black" /> {formattedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action Shortcuts */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
              <button 
                onClick={() => navigate(`/checkout/invoice/${order.orderId}`)}
                className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Invoice</span>
              </button>
              <button 
                onClick={() => navigate('/support')}
                className="px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shrink-0 shadow-xs"
              >
                <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Refund Notification Banner if requested */}
        {order.status.includes('Refund') && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 sm:p-5 mb-5 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <RefreshCcw className="w-5 h-5 text-purple-700 stroke-[2.5]" />
              <h3 className="text-sm font-black text-purple-950 uppercase tracking-wide">Refund Request Active</h3>
            </div>
            <p className="text-xs font-bold text-purple-900 leading-relaxed">
              Status: <span className="font-black text-purple-950 uppercase bg-purple-100 px-2 py-0.5 rounded border border-purple-300">{order.status}</span>
            </p>
          </div>
        )}

        {/* 6. Compact Tracking Timeline Section */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 mb-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black shrink-0">
                <Compass className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">Order Tracking Timeline</h3>
            </div>
            <span className="text-xs font-black text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
              Mode: {order.deliveryMode || 'Standard Delivery'}
            </span>
          </div>

          {isCancelled ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center text-red-900">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <h4 className="text-sm font-black uppercase tracking-wider">This Order Has Been Cancelled</h4>
              <p className="text-xs font-bold text-red-700 mt-1">If you paid online or need assistance, please contact our support desk.</p>
            </div>
          ) : (
            <div className="relative pt-2 pb-2">
              {/* Desktop Horizontal Compact Stepper */}
              <div className="hidden lg:grid grid-cols-9 gap-1 relative z-10">
                {timelineSteps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center group">
                      {/* Circle Dot */}
                      <div 
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 relative z-10 mb-2 border-2",
                          isCurrent 
                            ? "bg-black text-white border-black scale-110 shadow-sm ring-4 ring-neutral-200" 
                            : isDone 
                              ? "bg-emerald-600 text-white border-emerald-600" 
                              : "bg-white text-neutral-400 border-neutral-300"
                        )}
                      >
                        {isDone && !isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Label */}
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider leading-tight max-w-[90px]",
                        isCurrent ? "text-black font-black" : isDone ? "text-neutral-800" : "text-neutral-400"
                      )}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="mt-1 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-black text-white rounded">
                          Current
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Connector Bar for Desktop */}
              <div className="hidden lg:block absolute top-[18px] left-[5%] right-[5%] h-1 bg-neutral-200 z-0 rounded-full">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, (currentStepIdx / (timelineSteps.length - 1)) * 100))}%` }}
                />
              </div>

              {/* Mobile / Tablet Vertical Compact Timeline */}
              <div className="lg:hidden space-y-3 relative pl-3 border-l-2 border-neutral-200 ml-3 my-1">
                {timelineSteps.map((step, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={idx} className="relative pl-5 flex items-start justify-between gap-2">
                      {/* Circle Marker */}
                      <div className={cn(
                        "absolute -left-[19px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-colors",
                        isCurrent 
                          ? "bg-black text-white border-black ring-2 ring-neutral-200" 
                          : isDone 
                            ? "bg-emerald-600 text-white border-emerald-600" 
                            : "bg-white text-neutral-400 border-neutral-300"
                      )}>
                        {isDone && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                      </div>

                      <div>
                        <h4 className={cn(
                          "text-xs font-black uppercase tracking-wider",
                          isCurrent ? "text-black font-black" : isDone ? "text-neutral-900" : "text-neutral-400"
                        )}>
                          {step.label}
                        </h4>
                        <p className="text-[11px] font-bold text-neutral-500">{step.desc}</p>
                      </div>

                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-black text-white rounded shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Grid Container for Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Left Column (2 Cols on LG): Ordered Products & Customer Info */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* 3. Ordered Products */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black shrink-0">
                    <Box className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">Ordered Products</h3>
                </div>
                <span className="text-xs font-black text-black bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
                  Total Items: {itemsList.reduce((acc, i) => acc + (i.quantity || 1), 0)}
                </span>
              </div>

              <div className="space-y-3">
                {itemsList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4 p-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-neutral-200 overflow-hidden shrink-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-black uppercase tracking-tight leading-snug line-clamp-2">
                        {item.name}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {item.variant && item.variant !== 'Default' && (
                          <span className="text-xs font-bold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                            Variant: <span className="font-black text-black">{item.variant}</span>
                          </span>
                        )}
                        {item.productId && (
                          <span className="text-[10px] font-bold text-neutral-500 uppercase">
                            SKU: {item.productId.slice(0, 10)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-neutral-200/60">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-600">Unit Price:</span>
                          <span className="text-xs font-black text-black">{formatPrice(item.price)}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-black bg-neutral-200 px-2.5 py-0.5 rounded-md">
                            Quantity: {item.quantity}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-black">
                            {formatPrice(item.price * (item.quantity || 1))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Customer Information Card */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black shrink-0">
                  <User className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block mb-1">Customer Name</span>
                  <div className="flex items-center gap-2 text-xs font-black text-black">
                    <User className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                    <span>{order.customerName || 'Valued Customer'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block mb-1">Mobile Number</span>
                  <div className="flex items-center gap-2 text-xs font-black text-black">
                    <Phone className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                    <span>{order.mobileNumber || 'N/A'}</span>
                  </div>
                </div>

                {order.email && (
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 sm:col-span-2">
                    <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block mb-1">Email Address</span>
                    <div className="flex items-center gap-2 text-xs font-black text-black">
                      <Mail className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                      <span>{order.email}</span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 sm:col-span-2">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block mb-1">Shipping Address</span>
                  <div className="flex items-start gap-2 text-xs font-black text-black">
                    <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5 stroke-[2.5]" />
                    <div>
                      <p className="leading-relaxed font-black text-black">{order.fullAddress}</p>
                      <p className="text-[11px] font-bold text-neutral-600 mt-1">
                        City/Area: <span className="font-black text-black">{order.cityArea || 'Standard'}</span> 
                        {order.postalCode && <span> • Postal Code: <span className="font-black text-black">{order.postalCode}</span></span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Courier Information Card */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black shrink-0">
                    <Truck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">Courier Information</h3>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                  {order.courier?.status || 'Active Dispatch'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[10px] font-black uppercase text-neutral-500 block mb-0.5">Courier Name</span>
                  <span className="text-xs font-black text-black uppercase">{order.courier?.name || 'In-House Express Delivery'}</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[10px] font-black uppercase text-neutral-500 block mb-0.5">Tracking Number</span>
                  <span className="text-xs font-black font-mono text-black">{order.courier?.trackingId || `TRK-${order.orderId}`}</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[10px] font-black uppercase text-neutral-500 block mb-0.5">Current Location</span>
                  <span className="text-xs font-bold text-black">{order.cityArea ? `${order.cityArea} Sorting Center` : 'Central Logistics Hub'}</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                  <span className="text-[10px] font-black uppercase text-neutral-500 block mb-0.5">Estimated Delivery</span>
                  <span className="text-xs font-bold text-black">1 - 3 Business Days</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1 Col on LG): Order Summary & Payment Info */}
          <div className="space-y-5">
            
            {/* 4. Order Summary */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black shrink-0">
                  <FileText className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">Order Summary</h3>
              </div>

              <div className="space-y-2.5 text-xs font-bold text-neutral-700">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-black font-black">{formatPrice(order.subtotal || order.total)}</span>
                </div>

                {order.discount?.amount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span>Product Discount</span>
                    <span className="font-black">-{formatPrice(order.discount.amount)}</span>
                  </div>
                )}

                {order.promoCodeUsed && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Promo ({order.promoCodeUsed})
                    </span>
                    <span className="font-black">Applied</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Shipping Charge</span>
                  <span className="text-black font-black">{formatPrice(order.deliveryCharge || 0)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>VAT / Tax</span>
                  <span className="text-black font-black">{order.tax?.amount ? formatPrice(order.tax.amount) : '0.00'}</span>
                </div>

                <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-sm">
                  <span className="font-black text-black uppercase tracking-tight">Grand Total</span>
                  <span className="text-base sm:text-lg font-black text-black">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* 5. Payment Information */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-neutral-100">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black shrink-0">
                  <CreditCard className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">Payment Information</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-600">Payment Method</span>
                  <span className="text-xs font-black text-black uppercase">{order.paymentMethod || 'Cash on Delivery'}</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-600">Payment Status</span>
                  <span className="text-xs font-black text-black uppercase bg-neutral-200 px-2 py-0.5 rounded">
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-600">Transaction ID</span>
                  <span className="text-xs font-mono font-black text-black">{transactionId}</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-600">Paid Amount</span>
                  <span className="text-xs font-black text-emerald-700">{formatPrice(order.paidAmount || (order.paymentStatus === 'Paid' ? order.total : 0))}</span>
                </div>

                {order.dueAmount > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Due Amount</span>
                    <span className="text-xs font-black text-amber-950">{formatPrice(order.dueAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 8. Action Buttons Box */}
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 shadow-xs space-y-2.5">
              <button 
                onClick={() => navigate(`/checkout/invoice/${order.orderId}`)}
                className="w-full py-3 px-4 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Invoice</span>
              </button>

              <button 
                onClick={() => {
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                  toast.success('Viewing live tracking timeline');
                }}
                className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Truck className="w-4 h-4 stroke-[2.5]" />
                <span>Track Shipment</span>
              </button>

              <button 
                onClick={() => navigate('/support')}
                className="w-full py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-black border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Contact Support</span>
              </button>
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl border border-neutral-200"
            >
              <h3 className="text-lg font-black text-black uppercase tracking-tight mb-1">Request Refund</h3>
              <p className="text-xs text-neutral-600 font-bold mb-4">
                Provide details regarding your refund request for Order #{order.orderId}.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-black mb-1 block">Reason for Refund</label>
                  <textarea 
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="E.g. Item defective, size mismatch, missing parts..."
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-bold text-black focus:outline-none focus:border-black min-h-[100px]"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowRefundModal(false)}
                    className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRefund}
                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all shadow-xs"
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
