import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Package, 
  MapPin, 
  Truck, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  Hash, 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  XCircle, 
  RefreshCcw, 
  Building2, 
  Navigation,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_COLOR_MAP: Record<string, string> = {
  'Placed': 'bg-slate-100 text-slate-700 border-slate-300',
  'Pending Payment': 'bg-amber-100 text-amber-800 border-amber-300',
  'Confirmed': 'bg-indigo-100 text-indigo-800 border-indigo-300',
  'Preparing': 'bg-purple-100 text-purple-800 border-purple-300',
  'Packed': 'bg-sky-100 text-sky-800 border-sky-300',
  'Shipping': 'bg-blue-100 text-blue-800 border-blue-300',
  'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  'Completed': 'bg-green-100 text-green-800 border-green-300',
  'Cancelled': 'bg-rose-100 text-rose-800 border-rose-300',
  'Returned': 'bg-zinc-100 text-zinc-700 border-zinc-300',
};

interface LiveOrderTrackerProps {
  initialOrderId?: string;
  onClose?: () => void;
  compactMode?: boolean;
}

export function LiveOrderTracker({ initialOrderId = '', compactMode = false }: LiveOrderTrackerProps) {
  const navigate = useNavigate();
  const { orders: storeOrders } = useOrderStore();

  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [activeQuery, setActiveQuery] = useState(initialOrderId);
  const [detectedType, setDetectedType] = useState<'id' | 'phone' | 'email' | 'unknown'>('unknown');
  
  const [searched, setSearched] = useState(!!initialOrderId);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-detect input search type as user types
  const detectInputType = (val: string): 'id' | 'phone' | 'email' | 'unknown' => {
    const trimmed = val.trim();
    if (!trimmed) return 'unknown';
    if (trimmed.includes('@')) return 'email';
    
    const digitsOnly = trimmed.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 6 && (trimmed.startsWith('01') || trimmed.startsWith('+880') || trimmed.startsWith('880') || /^\d+$/.test(trimmed))) {
      return 'phone';
    }
    
    return 'id';
  };

  useEffect(() => {
    setDetectedType(detectInputType(searchInput));
  }, [searchInput]);

  // Execute initial search if initialOrderId was passed
  useEffect(() => {
    if (initialOrderId && storeOrders.length > 0) {
      handlePerformSearch(initialOrderId);
    }
  }, [initialOrderId, storeOrders.length]);

  // Search logic matching Order ID, Mobile Number, or Email Address
  const matchedOrders = useMemo(() => {
    if (!activeQuery.trim() || !searched) return [];
    
    const query = activeQuery.trim().toLowerCase();
    const cleanDigits = query.replace(/[^0-9]/g, '');

    return storeOrders.filter((order) => {
      const orderIdStr = (order.orderId || '').toLowerCase();
      const billIdStr = (order.billId || '').toLowerCase();
      const idStr = (order.id || '').toLowerCase();
      const mobileStr = (order.mobileNumber || '').toLowerCase().replace(/[^0-9]/g, '');
      const emailStr = (order.email || '').toLowerCase();

      // Email match
      if (query.includes('@') && emailStr === query) {
        return true;
      }

      // Mobile Phone match
      if (cleanDigits.length >= 6 && mobileStr) {
        if (mobileStr.includes(cleanDigits) || cleanDigits.includes(mobileStr) || mobileStr.endsWith(cleanDigits.slice(-10))) {
          return true;
        }
      }

      // Order ID / Bill ID / ID match
      const cleanQueryAlphaNum = query.replace(/[^a-zA-Z0-9]/g, '');
      const cleanOrderId = orderIdStr.replace(/[^a-zA-Z0-9]/g, '');
      const cleanBillId = billIdStr.replace(/[^a-zA-Z0-9]/g, '');

      if (
        orderIdStr.includes(query) ||
        billIdStr.includes(query) ||
        idStr.includes(query) ||
        (cleanQueryAlphaNum && (cleanOrderId.includes(cleanQueryAlphaNum) || cleanBillId.includes(cleanQueryAlphaNum)))
      ) {
        return true;
      }

      // Partial Email match
      if (emailStr && emailStr.includes(query)) {
        return true;
      }

      return false;
    });
  }, [storeOrders, activeQuery, searched]);

  const handlePerformSearch = (overrideVal?: string) => {
    const val = (overrideVal !== undefined ? overrideVal : searchInput).trim();
    if (!val) return;

    setIsSearching(true);
    setActiveQuery(val);
    setSearched(true);

    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/account/orders/details/${orderId}`);
  };

  return (
    <div className="w-full font-sans text-slate-900 bg-white" id="live-order-tracker-system">
      
      {/* 1. SEARCH BAR CONTAINER */}
      <div className={`p-4 md:p-6 bg-slate-900 text-white rounded-2xl shadow-xl mb-6 ${compactMode ? 'p-4' : ''}`}>
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-sm md:text-base font-black uppercase tracking-wider text-white">
                Live Order Tracking System
              </h3>
            </div>
            {detectedType !== 'unknown' && (
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                Searching by: {detectedType === 'id' ? 'Order ID' : detectedType === 'phone' ? 'Mobile Number' : 'Email Address'}
              </span>
            )}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handlePerformSearch(); }} 
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. TMB-892341), Mobile (01712345678) or Email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 h-12 rounded-xl pl-12 pr-4 text-xs md:text-sm font-bold focus:outline-none focus:border-amber-400 focus:bg-slate-950 transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearched(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchInput.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 h-12 rounded-xl font-black uppercase text-xs tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md"
            >
              {isSearching ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 font-medium">
            💡 Search with Order ID, Mobile Number, or Email Address to view live tracking and order details.
          </p>
        </div>
      </div>

      {/* 2. RESULTS AREA */}
      <AnimatePresence mode="wait">
        
        {/* CASE A: NO ORDER FOUND ERROR CARD */}
        {searched && !isSearching && matchedOrders.length === 0 && (
          <motion.div
            key="error-no-order"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-2 border-rose-200 bg-rose-50/60 rounded-2xl p-6 md:p-8 text-center space-y-4 max-w-2xl mx-auto my-6"
          >
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg md:text-xl font-black text-rose-950 uppercase tracking-tight flex items-center justify-center gap-2">
                <span>❌ No Order Found</span>
              </h3>
              <p className="text-xs font-bold text-rose-700 mt-2">
                We couldn't find any order associated with:
              </p>
              <div className="inline-block mt-2 bg-white border border-rose-200 px-4 py-1.5 rounded-lg text-xs font-black text-slate-900 tracking-wider font-mono">
                {activeQuery}
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed max-w-md mx-auto">
              দয়া করে নিশ্চিত করুন যে আপনার অর্ডারের Order ID (যেমন: TMB-XXXXXXXX), মোবাইল নম্বর অথবা ইমেইল সঠিকভাবে লেখা হয়েছে।
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearched(false);
                }}
                className="bg-slate-950 hover:bg-black text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4 text-amber-400" />
                <span>Search Again</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* CASE B: MATCHED ORDERS FOUND (LIST / CARDS VIEW) */}
        {searched && !isSearching && matchedOrders.length > 0 && (
          <motion.div
            key="matched-orders-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 my-6 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-amber-500" />
                  <span>Found {matchedOrders.length} {matchedOrders.length === 1 ? 'Order' : 'Orders'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">
                  Click View Details on any order to open the complete professional tracking timeline and order details page.
                </p>
              </div>

              <span className="text-xs bg-slate-100 text-slate-700 font-black px-3 py-1 rounded-full font-mono">
                {activeQuery}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedOrders.map((ord) => {
                const firstItem = ord.items?.[0];
                const itemImg = firstItem?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80';
                const formattedDateStr = new Date(ord.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                
                return (
                  <div
                    key={ord.id}
                    onClick={() => handleViewDetails(ord.id)}
                    className="border border-slate-200 hover:border-slate-900 bg-slate-50/70 hover:bg-white p-5 rounded-2xl transition-all cursor-pointer space-y-3.5 shadow-xs hover:shadow-lg group text-left relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3.5">
                      <img 
                        src={itemImg} 
                        alt={firstItem?.name || 'Product'} 
                        className="w-18 h-18 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="text-xs font-black text-slate-950 uppercase font-mono tracking-wider">
                            #{ord.orderId || ord.id}
                          </span>
                          <span className={`text-[9.5px] font-black uppercase px-2.5 py-0.5 rounded border ${STATUS_COLOR_MAP[ord.status] || 'bg-slate-100 text-slate-800'}`}>
                            {ord.status || 'Placed'}
                          </span>
                        </div>

                        <h4 className="text-xs font-black text-slate-900 truncate mt-1">
                          {firstItem?.name || 'Order Items Package'}
                        </h4>

                        <div className="space-y-0.5 mt-1 text-[10.5px] text-slate-600 font-bold">
                          <p className="flex items-center gap-1.5 truncate">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{ord.customerName}</span>
                            <span>•</span>
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{ord.mobileNumber}</span>
                          </p>
                          <p className="flex items-center gap-1 text-slate-500 font-semibold">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{formattedDateStr}</span>
                            <span>•</span>
                            <span>{ord.items?.length || 1} item(s)</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/90 text-xs font-bold text-slate-700">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Amount</span>
                        <span className="font-black text-slate-950 text-sm">BDT {ord.total?.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(ord.id);
                        }}
                        className="bg-slate-950 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm group-hover:bg-black active:scale-95 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

