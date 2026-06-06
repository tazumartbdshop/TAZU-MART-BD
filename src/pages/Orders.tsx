import React, { useState } from 'react';
import { Search, Package, MapPin, Truck, Phone, User, Calendar, CreditCard, CheckCircle2, Clock, AlertCircle, FileText, ChevronRight, Hash, Eye, ArrowLeft } from 'lucide-react';
import { orders as mockOrders } from '../data/mockData';
import { formatPrice, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useOrderStore } from '../store/useOrderStore';
import { useNavigate } from 'react-router-dom';
import { getCompletedOrdersCount, LoyaltyBadge, VerifiedTick } from '../lib/loyalty';

const STATUS_COLORS: Record<string, string> = {
  'Placed': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'Pending': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  'Processing': 'bg-blue-100 text-blue-700 border border-blue-200',
  'Packed': 'bg-purple-100 text-purple-700 border border-purple-200',
  'Shipped': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  'Shipping': 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  'Out For Delivery': 'bg-orange-100 text-orange-700 border border-orange-200',
  'Delivered': 'bg-green-100 text-green-700 border border-green-200',
  'Cancelled': 'bg-red-100 text-red-700 border border-red-200',
};

export default function Orders() {
  const navigate = useNavigate();
  const { orders: storeOrders } = useOrderStore();

  const [searchMethod, setSearchMethod] = useState<'id' | 'phone'>('id');
  const [searchValue, setSearchValue] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [matchingOrders, setMatchingOrders] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Helper to map store orders into standard viewing structure
  const mapDynamicOrder = (o: any) => {
    const possibleStatuses = ['Placed', 'Confirmed', 'Processing', 'Shipping', 'Delivered'];
    const statusHistory = o.statusHistory || [];
    
    const steps = possibleStatuses.map(statusName => {
      const hist = statusHistory.find((sh: any) => sh.status.toLowerCase() === statusName.toLowerCase());
      return {
        name: statusName === 'Placed' ? 'Order Placed' : statusName,
        time: hist ? new Date(hist.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : null,
        completed: hist ? true : false
      };
    });

    return {
      id: o.orderId,
      dbId: o.id,
      date: new Date(o.date).toLocaleDateString('en-US', { dateStyle: 'medium' }),
      customer: {
        name: o.customerName,
        phone: o.mobileNumber,
        address: o.fullAddress,
        area: o.cityArea || 'Dhaka',
      },
      payment: {
        method: o.paymentMethod,
        total: o.total,
      },
      courier: {
        name: o.courier?.name || 'Pathao',
        trackingNo: o.courier?.trackingId || `TX-${o.billId?.split('-')[1] || 'PENDING'}`,
      },
      status: o.status === 'Placed' ? 'Pending' : o.status === 'Confirmed' ? 'Processing' : o.status,
      steps: steps,
      items: o.items || []
    };
  };

  // Merge dynamic state order and our initial mock orders
  const getMergedOrders = () => {
    const dynamicMapped = storeOrders.map(mapDynamicOrder);
    return [...dynamicMapped, ...mockOrders];
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    setIsLoading(true);
    setError('');
    setTrackedOrder(null);
    setMatchingOrders([]);

    setTimeout(() => {
      const allOrders = getMergedOrders();
      const term = searchValue.trim().toUpperCase();

      if (searchMethod === 'id') {
        const found = allOrders.find(
          (o: any) => o.id.toUpperCase() === term || 
               o.id.replace('#', '').toUpperCase() === term || 
               o.dbId?.toUpperCase() === term
        );
        
        if (found) {
          setTrackedOrder(found);
        } else {
          setError('Order ID not found. Ensure it matches ORD-XXXXXX or TMXXXXXX.');
        }
      } else {
        // Phone lookup
        const cleanTerm = term.replace(/[^0-9]/g, '');
        const foundList = allOrders.filter(
          o => o.customer.phone.replace(/[^0-9]/g, '').includes(cleanTerm) || 
               cleanTerm.includes(o.customer.phone.replace(/[^0-9]/g, ''))
        );

        if (foundList.length > 0) {
          setMatchingOrders(foundList);
        } else {
          setError('No orders found matching this clean mobile phone number.');
        }
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-10 px-4 pb-24 font-sans text-neutral-800">
      <div className="container mx-auto max-w-5xl">
        
        {/* Back navigation button if trackedOrder is set */}
        {trackedOrder && (
          <button 
            onClick={() => {
              setTrackedOrder(null);
              // If we searched by phone previously, return to results list
              if (searchMethod === 'phone' && matchingOrders.length > 0) {
                // Keep them in results list
              } else {
                setMatchingOrders([]);
                setSearchValue('');
              }
            }}
            className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold uppercase tracking-widest text-[10px] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search Form
          </button>
        )}

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Order Portal</h1>
          <p className="text-gray-500 text-sm">Track real-time courier statuses and view your complete invoice logs.</p>
        </div>

        {/* Toggle Search Mode Bar */}
        {!trackedOrder && (
          <div className="flex justify-center mb-6">
            <div className="bg-white border border-neutral-200 p-1 rounded-2xl flex items-center gap-1 shadow-sm">
              <button 
                type="button"
                onClick={() => {
                  setSearchMethod('id');
                  setSearchValue('');
                  setError('');
                  setMatchingOrders([]);
                }}
                className={cn(
                  'px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                  searchMethod === 'id' ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-800'
                )}
              >
                Track by Order ID
              </button>
              <button 
                type="button"
                onClick={() => {
                  setSearchMethod('phone');
                  setSearchValue('');
                  setError('');
                  setMatchingOrders([]);
                }}
                className={cn(
                  'px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer',
                  searchMethod === 'phone' ? 'bg-black text-white' : 'text-neutral-500 hover:text-neutral-800'
                )}
              >
                View History by Phone
              </button>
            </div>
          </div>
        )}

        {/* Lookup / Search Input Box */}
        {!trackedOrder && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 max-w-2xl mx-auto mb-10">
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                {searchMethod === 'id' ? (
                  <>
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter Order ID (e.g. ORD-194856)"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full bg-gray-50 border border-neutral-100 h-14 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:font-normal focus:outline-none focus:border-neutral-900 focus:bg-white transition-all uppercase"
                    />
                  </>
                ) : (
                  <>
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      placeholder="Enter mobile number (e.g. 01711223344)"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="w-full bg-gray-50 border border-neutral-100 h-14 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:font-normal focus:outline-none focus:border-neutral-900 focus:bg-white transition-all"
                    />
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-neutral-900 text-white px-8 h-14 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                {isLoading ? 'Searching...' : searchMethod === 'id' ? 'Track Order' : 'Fetch History'}
              </button>
            </form>
            {error && (
              <p className="text-red-500 text-xs font-bold mt-4 flex items-center gap-1.5 pl-1 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-red-500" /> {error}
              </p>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* 1. If multiple orders identified (lookup history by phone number) */}
          {!trackedOrder && matchingOrders.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400">
                  Matched Account Orders ({matchingOrders.length})
                </h3>
                <span className="text-[10px] bg-neutral-900 text-white px-2 py-0.5 rounded font-bold uppercase">
                  Connected via key phone
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {matchingOrders.map((ord) => (
                  <div 
                    key={ord.id}
                    className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-black text-neutral-900 uppercase">#{ord.id}</span>
                        <span className={cn('px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide', STATUS_COLORS[ord.status] || 'bg-gray-100 text-gray-800')}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-neutral-400 font-semibold items-center">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {ord.date}</span>
                        <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> {ord.payment.method}</span>
                        <span className="font-extrabold text-neutral-900">{formatPrice(ord.payment.total)}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto shrink-0">
                      <button 
                        onClick={() => setTrackedOrder(ord)}
                        className="flex-1 md:flex-none border border-neutral-200 text-neutral-800 hover:bg-neutral-50 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4 text-neutral-400" /> Track Status
                      </button>
                      <button 
                        onClick={() => navigate(`/checkout/invoice/${ord.id}`)}
                        className="flex-1 md:flex-none bg-neutral-900 hover:bg-neutral-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FileText className="w-4 h-4 text-white" /> Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 2. Detailed Tracking Progress Card */}
          {trackedOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Side: Order Details & Timeline */}
              <div className="lg:col-span-2 space-y-8">
                {/* Order Details Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Order ID</span>
                      <h2 className="text-xl font-black text-primary-900">#{trackedOrder.id}</h2>
                    </div>
                    <span className={cn('px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm', STATUS_COLORS[trackedOrder.status])}>
                      {trackedOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-50 pt-6">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Date</span>
                      <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-neutral-900" /> {trackedOrder.date}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Payment</span>
                      <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-neutral-900" /> {trackedOrder.payment.method}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total</span>
                      <p className="text-xs font-black text-primary-900">{formatPrice(trackedOrder.payment.total)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Courier</span>
                      <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-neutral-900" /> {trackedOrder.courier.name}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-8">Tracking Progress</h3>
                  <div className="relative space-y-8">
                    {/* Vertical Line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-100" />
                    
                    {trackedOrder.steps.map((step: any, index: number) => {
                      const isCompleted = step.completed;
                      const isCurrent = step.name.toLowerCase() === trackedOrder.status.toLowerCase();
                      
                      return (
                        <div key={index} className="relative pl-10 flex items-start justify-between">
                          <div className={cn(
                            'absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 transition-all duration-300',
                            isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-600 animate-pulse' : 'bg-gray-100'
                          )}>
                            {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : isCurrent ? <Clock className="w-4 h-4 text-white" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                          </div>
                          <div>
                            <h4 className={cn('text-xs font-black uppercase tracking-wide', isCompleted ? 'text-gray-900' : isCurrent ? 'text-blue-600' : 'text-gray-400')}>
                              {step.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{step.time || 'Pending update'}</p>
                          </div>
                          {isCurrent && (
                            <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-widest">
                              Current Step
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" /> Delivery Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary-900"><User className="w-4 h-4" /></div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Customer</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-gray-800">{trackedOrder.customer.name}</p>
                            {getCompletedOrdersCount(storeOrders, { phone: trackedOrder.customer.phone, name: trackedOrder.customer.name }) >= 5 && <VerifiedTick />}
                          </div>
                          <div className="mt-1">
                            <LoyaltyBadge count={getCompletedOrdersCount(storeOrders, { phone: trackedOrder.customer.phone, name: trackedOrder.customer.name })} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary-900"><Phone className="w-4 h-4" /></div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Phone</span>
                          <p className="text-xs font-bold text-gray-800">{trackedOrder.customer.phone}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary-900 mt-0.5"><MapPin className="w-4 h-4" /></div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Address</span>
                          <p className="text-xs font-bold text-gray-800 leading-relaxed">{trackedOrder.customer.address}</p>
                          <p className="text-[10px] text-primary-900 font-bold mt-1 uppercase tracking-tight">{trackedOrder.customer.area}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Truck className="w-4 h-4" /></div>
                        <div>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest block">Tracking Number</span>
                          <p className="text-xs font-black text-blue-600">{trackedOrder.courier.trackingNo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Order Items */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-6">Order Items</h3>
                   <div className="space-y-6">
                     {trackedOrder.items.map((item: any, i: number) => (
                       <div key={item.productId || i} className="flex gap-4">
                         <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0">
                           <img src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200'} alt={item.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex flex-col justify-center">
                           <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-2">{item.name}</h4>
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Qty: {item.quantity}</span>
                              <span className="text-xs font-black text-primary-900">{formatPrice(item.price)}</span>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                   
                   <div className="mt-8 pt-6 border-t border-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs text-gray-500 font-medium font-sans">Subtotal</span>
                        <span className="text-xs font-bold text-gray-800">{formatPrice(trackedOrder.payment.total - 60)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs text-gray-500 font-medium font-sans">Shipping Fee</span>
                        <span className="text-xs font-bold text-gray-800">{formatPrice(60)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <span className="text-sm font-black uppercase text-gray-900">Order Total</span>
                        <span className="text-lg font-black text-primary-900">{formatPrice(trackedOrder.payment.total)}</span>
                      </div>
                   </div>
                </div>
                
                <div className="bg-neutral-900 rounded-3xl p-6 shadow-lg shadow-blue-900/10 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <Truck className="w-8 h-8 mb-4 stroke-[1.5px]" />
                  <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Need Help?</h3>
                  <p className="text-xs text-neutral-300 font-medium leading-relaxed mb-6">Our support team is active 24/7. Feel free to contact us for any shipping queries.</p>
                  <button className="bg-white text-neutral-900 w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-neutral-50 transition-colors cursor-pointer">Contact Support</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
