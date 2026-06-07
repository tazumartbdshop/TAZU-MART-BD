import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  CheckCircle, 
  HelpCircle, 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  User, 
  UserX, 
  UserCheck, 
  Upload, 
  X, 
  Trash2, 
  Info, 
  Layers, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  Filter,
  RefreshCw,
  ShoppingBag,
  Bell,
  CheckSquare,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { useFakeOrderStore, AbandonedCheckout } from '../../store/useFakeOrderStore';
import { formatPrice } from '../../lib/utils';

export default function AdminFakeOrderControl() {
  const { orders, updateOrderStatus } = useOrderStore();
  const { 
    fakeReports, 
    abandonedCheckouts, 
    verifiedOrders, 
    addFakeReport, 
    verifyOrder, 
    removeFakeReport,
    getRiskInfo,
    resetAll 
  } = useFakeOrderStore();

  // Active category filter based on clicked card
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mark Fake Form Modal states
  const [reportingOrder, setReportingOrder] = useState<Order | null>(null);
  const [fakeReason, setFakeReason] = useState<'Wrong Phone Number' | 'Customer Not Responding' | 'Wrong Address' | 'Duplicate Order' | 'Intentional Fake Order' | 'Other'>('Wrong Phone Number');
  const [fakeNotes, setFakeNotes] = useState('');
  const [evidenceBase64, setEvidenceBase64] = useState<string | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  // Auto detect suspected orders based on logic rules
  const detectedSuspects = useMemo(() => {
    return orders.map(order => {
      const issues: string[] = [];
      
      // 1. Phone validation
      const cleanPhone = order.mobileNumber ? order.mobileNumber.replace(/\D/g, '') : '';
      const isPhoneInvalid = !order.mobileNumber || cleanPhone.length < 11 || !order.mobileNumber.startsWith('01');
      if (isPhoneInvalid) {
        issues.push('Phone Invalid');
      }

      // 2. Address validation
      const isAddressInvalid = !order.fullAddress || order.fullAddress.trim().length < 15 || /test|demo|asdf|123/i.test(order.fullAddress);
      if (isAddressInvalid) {
        issues.push('Address Invalid');
      }

      // 3. Duplicate Order detection (same mobile within order list)
      const isDuplicate = orders.some(o => o.id !== order.id && o.mobileNumber === order.mobileNumber);
      if (isDuplicate) {
        issues.push('Duplicate Order');
      }

      // 4. Fake status check
      const isFake = fakeReports.some(r => r.orderId === order.orderId);
      
      // 5. Verified status
      const isVerified = verifiedOrders.includes(order.orderId);

      // Determine final code status
      let status: 'Fake Order' | 'Verified Order' | 'Phone Invalid' | 'Address Invalid' | 'Duplicate Order' | 'Pending Verification' = 'Pending Verification';
      if (isFake) {
        status = 'Fake Order';
      } else if (isVerified) {
        status = 'Verified Order';
      } else if (isPhoneInvalid) {
        status = 'Phone Invalid';
      } else if (isAddressInvalid) {
        status = 'Address Invalid';
      } else if (isDuplicate) {
        status = 'Duplicate Order';
      }

      return {
        ...order,
        detectedIssues: issues,
        verificationStatus: status,
        isSuspected: issues.length > 0 || isFake
      };
    });
  }, [orders, fakeReports, verifiedOrders]);

  // Aggregate stats based on our 8 metrics
  const stats = useMemo(() => {
    const pendingVerification = detectedSuspects.filter(o => o.verificationStatus === 'Pending Verification' && (o.status === 'Placed' || o.status === 'Pending')).length;
    const totalSuspected = detectedSuspects.filter(o => o.isSuspected && o.verificationStatus !== 'Verified Order').length;
    const wrongPhone = detectedSuspects.filter(o => o.verificationStatus === 'Phone Invalid').length;
    const wrongAddress = detectedSuspects.filter(o => o.verificationStatus === 'Address Invalid').length;
    const duplicateCount = detectedSuspects.filter(o => o.verificationStatus === 'Duplicate Order').length;
    const abandonedTotal = abandonedCheckouts.length;
    const fakeTotal = fakeReports.length;
    const cancelledFake = detectedSuspects.filter(o => o.verificationStatus === 'Fake Order' && o.status === 'Cancelled').length;

    return {
      pendingVerification,
      totalSuspected,
      wrongPhone,
      wrongAddress,
      duplicateCount,
      abandonedTotal,
      fakeTotal,
      cancelledFake
    };
  }, [detectedSuspects, abandonedCheckouts, fakeReports]);

  // Handle Mark Fake Submit
  const handleMarkFakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingOrder) return;

    let evidenceUrl = evidenceBase64;
    if (evidenceBase64 && evidenceBase64.startsWith('data:')) {
      try {
        const { uploadImage } = await import('../../lib/imageUtils');
        const res = await fetch(evidenceBase64);
        const blob = await res.blob();
        evidenceUrl = await uploadImage(blob, 'fake-reports', `evidence-${reportingOrder.orderId}-${Date.now()}`);
      } catch (err) {
        console.error('Failed to upload evidence', err);
        alert('Failed to upload evidence document');
        return;
      }
    }

    // 1. Database Save
    addFakeReport({
      orderId: reportingOrder.orderId,
      reason: fakeReason,
      notes: fakeNotes,
      evidenceImage: evidenceUrl
    });

    // 2. Order Status -> Cancelled
    updateOrderStatus(reportingOrder.id, 'Cancelled');

    // Reset Form & Feedback
    setReportingOrder(null);
    setFakeReason('Wrong Phone Number');
    setFakeNotes('');
    setEvidenceBase64(undefined);

    // Toast Alert
    showToast('FAKE ORDER REPORT SUBMITTED & LOGGED');
  };

  // Image upload handlers for popup form
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenceBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Toast utility helper
  const showToast = (msg: string, isRevert = false) => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-8 right-8 ${isRevert ? 'bg-amber-600' : 'bg-zinc-950'} text-white px-6 py-3 text-[11px] font-black uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-50`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-4');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  // Metadata cards definitions for 8 types
  const cardDefinitions = [
    { id: 'Pending Verification', label: 'Pending Verification', value: stats.pendingVerification, icon: HelpCircle, color: 'text-amber-500', border: 'border-amber-200' },
    { id: 'Total Suspected Orders', label: 'Total Suspected Orders', value: stats.totalSuspected, icon: AlertTriangle, color: 'text-rose-500', border: 'border-rose-200' },
    { id: 'Wrong Phone Number', label: 'Wrong Phone Number', value: stats.wrongPhone, icon: Phone, color: 'text-orange-500', border: 'border-orange-200' },
    { id: 'Wrong Address', label: 'Wrong Address', value: stats.wrongAddress, icon: MapPin, color: 'text-red-500', border: 'border-red-200' },
    { id: 'Duplicate Orders', label: 'Duplicate Orders', value: stats.duplicateCount, icon: Layers, color: 'text-violet-500', border: 'border-violet-200' },
    { id: 'Abandoned Checkout', label: 'Abandoned Checkout', value: stats.abandonedTotal, icon: ShoppingBag, color: 'text-indigo-500', border: 'border-indigo-200' },
    { id: 'Fake Orders', label: 'Fake Orders', value: stats.fakeTotal, icon: AlertOctagon, color: 'text-rose-600', border: 'border-rose-300' },
    { id: 'Cancelled Fake Orders', label: 'Cancelled Fake Orders', value: stats.cancelledFake, icon: Trash2, color: 'text-zinc-500', border: 'border-zinc-300' },
  ];

  // Filtering list based on selected dashboard card
  const filteredList = useMemo(() => {
    let resultItems: any[] = [];

    if (selectedCategory === 'All') {
      // Mixed stream
      const mixed = [
        ...detectedSuspects.map(o => ({ ...o, type: 'order' })),
        ...abandonedCheckouts.map(c => ({ ...c, type: 'checkout' }))
      ];
      mixed.sort((a, b) => {
        const timeA = a.type === 'order' ? a.date : a.timestamp;
        const timeB = b.type === 'order' ? b.date : b.timestamp;
        return timeB - timeA;
      });
      resultItems = mixed;
    } else if (selectedCategory === 'Pending Verification') {
      resultItems = detectedSuspects.filter(o => o.verificationStatus === 'Pending Verification' && (o.status === 'Placed' || o.status === 'Pending')).map(o => ({ ...o, type: 'order' }));
    } else if (selectedCategory === 'Total Suspected Orders') {
      resultItems = detectedSuspects.filter(o => o.isSuspected && o.verificationStatus !== 'Verified Order').map(o => ({ ...o, type: 'order' }));
    } else if (selectedCategory === 'Wrong Phone Number') {
      resultItems = detectedSuspects.filter(o => o.verificationStatus === 'Phone Invalid').map(o => ({ ...o, type: 'order' }));
    } else if (selectedCategory === 'Wrong Address') {
      resultItems = detectedSuspects.filter(o => o.verificationStatus === 'Address Invalid').map(o => ({ ...o, type: 'order' }));
    } else if (selectedCategory === 'Duplicate Orders') {
      resultItems = detectedSuspects.filter(o => o.verificationStatus === 'Duplicate Order').map(o => ({ ...o, type: 'order' }));
    } else if (selectedCategory === 'Abandoned Checkout') {
      resultItems = abandonedCheckouts.map(c => ({ ...c, type: 'checkout' }));
    } else if (selectedCategory === 'Fake Orders') {
      resultItems = detectedSuspects.filter(o => o.verificationStatus === 'Fake Order').map(o => ({ ...o, type: 'order' }));
    } else if (selectedCategory === 'Cancelled Fake Orders') {
      resultItems = detectedSuspects.filter(o => o.verificationStatus === 'Fake Order' && o.status === 'Cancelled').map(o => ({ ...o, type: 'order' }));
    }

    // Apply text search block
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      resultItems = resultItems.filter(item => {
        const itemPhone = item.type === 'order' ? item.mobileNumber : item.phone;
        const itemName = item.type === 'order' ? item.customerName : item.name;
        const itemId = item.type === 'order' ? item.orderId : item.id;
        
        return (
          (itemName && itemName.toLowerCase().includes(query)) ||
          (itemPhone && itemPhone.includes(query)) ||
          (itemId && itemId.toLowerCase().includes(query))
        );
      });
    }

    return resultItems;
  }, [detectedSuspects, abandonedCheckouts, selectedCategory, searchQuery]);

  return (
    <div id="fake-control-parent" className="space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Page Header block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-950 p-6 text-white border border-zinc-900">
        <div>
          <h2 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
            Fake Order Control Panel
          </h2>
          <p className="text-[11px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">
            Internal Risk Management & Dynamic Automated Sync Controls
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className={`border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedCategory === 'All' 
              ? 'bg-white text-zinc-950 border-white' 
              : 'border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Show All
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Clear all custom logs and restore simulator defaults?')) {
                resetAll();
                setSelectedCategory('All');
                showToast('STATE RESTORED TO DEFAULT', true);
              }
            }} 
            className="border border-red-900 hover:bg-red-950/20 text-red-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Reset Logs
          </button>
        </div>
      </div>

      {/* DASHBOARD STYLE SUMMARY CARDS SUMMARY SECTION */}
      {/* 2 column on mobile, 3-4 column on tablet/desktop as instructed */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cardDefinitions.map((card) => {
          const isActive = selectedCategory === card.id;
          const CardIcon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setSelectedCategory(isActive ? 'All' : card.id)}
              className={`text-left p-5 border bg-white flex flex-col justify-between h-32 transition-all group select-none relative overflow-hidden rounded-none ${
                isActive 
                  ? 'ring-2 ring-zinc-950 border-zinc-950 shadow-md' 
                  : 'border-zinc-200 hover:border-zinc-450 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-650 transition-colors">
                  {card.label}
                </span>
                <CardIcon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${card.color}`} />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-mono font-black text-zinc-950 block">
                  {card.value}
                </span>
                {isActive && (
                  <span className="text-[8px] font-mono font-black text-zinc-800 uppercase tracking-wider block mt-1">
                    ● Selected category
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND FEED DESCRIPTION */}
      <div className="border border-zinc-250 bg-white p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-black uppercase tracking-widest text-zinc-800">
            Active Filter: <span className="text-indigo-650">{selectedCategory}</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-405 font-bold bg-zinc-100 px-2 py-0.5 border">
            {filteredList.length} Items Found
          </span>
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Customer name, phone, order ID..."
            className="w-full bg-zinc-50 border border-zinc-200 pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-zinc-950 focus:bg-white transition-all placeholder:text-zinc-400 rounded-none"
          />
        </div>
      </div>

      {/* VERTICAL CARD STYLE LISTING SECTION */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredList.map((item) => {
            const isItemOrder = item.type === 'order';
            
            if (isItemOrder) {
              // Real Order card styled vertically with actions
              const riskInfo = getRiskInfo(item.mobileNumber);
              
              // Status ribbon theme mappings
              const getBadgeColors = (vStatus: string) => {
                switch (vStatus) {
                  case 'Verified Order':
                    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  case 'Fake Order':
                    return 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse';
                  case 'Phone Invalid':
                    return 'bg-amber-50 text-amber-800 border-amber-200';
                  case 'Address Invalid':
                    return 'bg-yellow-50 text-yellow-800 border-yellow-200';
                  case 'Duplicate Order':
                    return 'bg-violet-50 text-violet-800 border-violet-200';
                  default:
                    return 'bg-zinc-50 text-zinc-805 border-zinc-200';
                }
              };

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  key={`order-${item.id}`}
                  className="bg-white border border-zinc-200 p-5 relative overflow-hidden shadow-xs hover:shadow-sm"
                >
                  {/* Visual accent top ribbon */}
                  <div className="absolute top-0 left-0 h-1 w-full bg-zinc-900 group-hover:bg-indigo-650 transition-colors"></div>

                  {/* Header Row of Order CARD */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-black text-zinc-400 uppercase tracking-wider">Order ID:</span>
                        <span className="font-black text-zinc-900 uppercase tracking-widest">{item.orderId}</span>
                        <span className="font-mono bg-zinc-100 border px-1.5 py-0.5 text-[9px] uppercase font-bold text-zinc-650">
                          {item.paymentMethod || 'C.O.D'}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.date))}
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${getBadgeColors(item.verificationStatus)}`}>
                        {item.verificationStatus}
                      </span>
                    </div>
                  </div>

                  {/* Body Info block of ORDER CARD - Structured hierarchically with responsive labels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-3">
                      <div>
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Customer Name</span>
                        <p className="font-black text-zinc-900 text-sm mt-0.5">{item.customerName}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Phone Number</span>
                        <p className="font-black text-indigo-600 text-sm flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          {item.mobileNumber}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Shipping Address</span>
                        <p className="text-zinc-700 text-xs font-bold leading-relaxed mt-0.5">{item.fullAddress}</p>
                      </div>
                      
                      <div className="flex justify-between items-center sm:justify-start gap-8 border-t border-zinc-100 pt-2 md:border-t-0 md:pt-0">
                        <div>
                          <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Order Amount</span>
                          <p className="font-mono font-black text-zinc-950 text-sm">{formatPrice(item.total)}</p>
                        </div>
                        <div>
                          <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Order Status</span>
                          <span className={`inline-block text-[10px] font-black uppercase tracking-wide mt-0.5 ${
                            item.status === 'Cancelled' ? 'text-red-650' : 'text-zinc-700'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COD Risk warnings & Risk Score section */}
                  {riskInfo.warningCount > 0 && (
                    <div className="mt-4 p-3 bg-rose-50 border border-rose-100 flex items-center gap-2 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <p className="flex-grow">
                        Warning Logged: {riskInfo.warningCount} Suspicion events. Future COD Risk Indicator: <span className="text-rose-600 underline font-extrabold">{riskInfo.riskScore}%</span>
                      </p>
                    </div>
                  )}

                  {/* Card specific action buttons as requested */}
                  <div className="mt-5 pt-3 border-t border-zinc-100 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => {
                        verifyOrder(item.orderId);
                        showToast(`ORDER ${item.orderId} VERIFIED SAFELISTED`);
                      }}
                      disabled={item.verificationStatus === 'Verified Order'}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border rounded-none transition-all flex items-center gap-1.5 ${
                        item.verificationStatus === 'Verified Order'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-not-allowed font-black'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      Verify Order
                    </button>
                    
                    <button
                      onClick={() => {
                        updateOrderStatus(item.id, 'Shipping');
                        showToast(`ORDER SHIPPED SUCCESSFULLY`);
                      }}
                      disabled={item.status === 'Shipping' || item.status === 'Delivered' || item.status === 'Cancelled'}
                      className={`px-3 py-1.5 border text-[10px] font-black uppercase tracking-wider transition-all ${
                        item.status === 'Shipping' || item.status === 'Delivered' || item.status === 'Cancelled'
                        ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                        : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-950 text-white'
                      }`}
                    >
                      Confirm Shipping
                    </button>

                    <button
                      onClick={() => {
                        setReportingOrder(item);
                      }}
                      disabled={item.verificationStatus === 'Fake Order'}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border transition-all ${
                        item.verificationStatus === 'Fake Order'
                        ? 'bg-rose-50 text-rose-500 border-rose-200 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600 shadow-sm'
                      }`}
                    >
                      Mark Fake
                    </button>

                    <button
                      onClick={() => {
                        updateOrderStatus(item.id, 'Cancelled');
                        showToast(`ORDER CANCELLED`);
                      }}
                      disabled={item.status === 'Cancelled'}
                      className={`px-3 py-1.5 border text-[10px] font-black uppercase tracking-wider transition-all ${
                        item.status === 'Cancelled'
                        ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                        : 'bg-zinc-50 hover:bg-zinc-200 text-zinc-800 border-zinc-300'
                      }`}
                    >
                      Cancel Order
                    </button>
                  </div>
                </motion.div>
              );
            } else {
              // Abandoned Checkout Only Card template styled vertically
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  key={`checkout-${item.id}`}
                  className="bg-zinc-50 border border-zinc-200 p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500"></div>

                  <div className="flex justify-between items-center border-b border-zinc-200/50 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase text-zinc-400">Checkout Session ID</span>
                        <span className="text-xs font-black text-zinc-900 uppercase font-mono">{item.id}</span>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.timestamp))}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border bg-white border-zinc-300 text-zinc-500">
                        Checkout Only
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border ${
                        item.status === 'Recovered' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : item.status === 'Expired'
                        ? 'bg-zinc-200 text-zinc-700 border-zinc-300'
                        : 'bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Vertical client details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-zinc-800">
                    <div className="space-y-3">
                      <div>
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Customer Name</span>
                        <p className="font-extrabold text-zinc-900 text-sm mt-0.5">{item.name || 'Anonymous Guest'}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Phone Number</span>
                        <p className="font-bold text-zinc-700 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          {item.phone || <span className="italic text-[10px] text-zinc-400 uppercase font-semibold">Not entered yet</span>}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Metadata & Footprint IP</span>
                        <p className="font-mono text-[10px] text-zinc-650 mt-1">{item.ipLog} — {item.deviceType}</p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Cart items</span>
                        <div className="space-y-1 mt-1 max-h-16 overflow-y-auto">
                          {item.products && item.products.length > 0 ? (
                            item.products.map((p: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] font-bold text-zinc-700 bg-white border border-zinc-200 p-1 px-2">
                                <span className="truncate">{p.name}</span>
                                <span className="shrink-0 pl-2 font-mono">x{p.quantity} ({formatPrice(p.price * p.quantity)})</span>
                              </div>
                            ))
                          ) : (
                            <p className="italic text-zinc-400 text-[10px] uppercase font-bold">Cart list empty</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }
          })}
        </AnimatePresence>

        {filteredList.length === 0 && (
          <div className="bg-white border border-zinc-200 p-12 text-center text-zinc-400 font-black uppercase text-xs tracking-widest leading-relaxed">
            <UserX className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            No entities match the currently selected filter
          </div>
        )}
      </div>

      {/* MARK FAKE MODAL POPUP FORM (Dragging, base64 evidence upload, etc.) */}
      <AnimatePresence>
        {reportingOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-center py-8 px-4 font-sans leading-relaxed">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border-2 border-zinc-950 w-full max-w-lg shadow-2xl relative overflow-hidden"
            >
              <div className="bg-zinc-950 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    Fake Order Profile Report
                  </span>
                </div>
                <button 
                  onClick={() => setReportingOrder(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form panel */}
              <form onSubmit={handleMarkFakeSubmit} className="p-6 space-y-4">
                <div className="p-3 bg-zinc-50 border border-zinc-200">
                  <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider block">Target Order</span>
                  <div className="flex justify-between text-xs font-bold text-zinc-850 mt-1">
                    <span className="font-black">{reportingOrder.orderId} — {reportingOrder.customerName}</span>
                    <span className="font-mono text-zinc-950">{formatPrice(reportingOrder.total)}</span>
                  </div>
                </div>

                {/* Reason Dropdown selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                    Reason
                  </label>
                  <select
                    value={fakeReason}
                    onChange={(e) => setFakeReason(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-300 p-2.5 text-xs font-bold outline-none focus:border-zinc-950 transition-all cursor-pointer rounded-none"
                    required
                  >
                    <option value="Wrong Phone Number">Wrong Phone Number</option>
                    <option value="Customer Not Responding">Customer Not Responding</option>
                    <option value="Wrong Address">Wrong Address</option>
                    <option value="Duplicate Order">Duplicate Order</option>
                    <option value="Intentional Fake Order">Intentional Fake Order</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Notes Textarea */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                    Internal notes
                  </label>
                  <textarea
                    value={fakeNotes}
                    onChange={(e) => setFakeNotes(e.target.value)}
                    rows={3}
                    placeholder="Provide context regarding this fake flag (e.g. phone called 3 times but was switched off)"
                    className="w-full bg-zinc-50 border border-zinc-300 p-3 text-xs font-semibold outline-none focus:border-zinc-950 transition-all rounded-none resize-none placeholder:text-zinc-400"
                    required
                  />
                </div>

                {/* Upload Image Evidence - Standard drag & drop supporting specs */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">
                    File Evidence (Optional)
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed p-6 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      evidenceBase64
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : isDragging
                      ? 'border-zinc-950 bg-zinc-50'
                      : 'border-zinc-300 hover:border-zinc-900 bg-zinc-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="evidence-image-file"
                    />
                    <label htmlFor="evidence-image-file" className="cursor-pointer w-full flex flex-col items-center">
                      {evidenceBase64 ? (
                        <div className="space-y-2">
                          <img 
                            src={evidenceBase64} 
                            alt="Evidence Uploaded" 
                            className="max-h-24 mx-auto border border-zinc-200 shadow-sm" 
                          />
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                            Evidence loaded — click to change
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Upload className="w-6 h-6 text-zinc-400 mx-auto" />
                          <p className="text-[11px] text-zinc-700 font-black uppercase tracking-wider">
                            Drag & drop or Click to browse
                          </p>
                          <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
                            Supports Jpeg / Png evidence images
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Actions footer */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportingOrder(null)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
