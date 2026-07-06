import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  PhoneCall, 
  ExternalLink, 
  AlertCircle,
  Truck,
  Package,
  Calendar,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  User,
  Settings,
  Edit2,
  List,
  ChevronDown,
  CheckCircle2,
  Clock,
  Menu,
  MoreVertical,
  X,
  Copy,
  Printer,
  ChevronLeft,
  ShoppingBag,
  ArrowUpDown,
  Download,
  Minus,
  Phone,
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { useProductStore } from '../../store/useProductStore';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCompletedOrdersCount, LoyaltyBadge, VerifiedTick } from '../../lib/loyalty';


import PremiumOrderAdd from './PremiumOrderAdd';
import { OrderActionSheet } from '../../components/admin/OrderActionSheet';

// --- Sub-Components ---

// We now use the premium OrderActionSheet component imported above instead of the simple DropdownMenu

const TrackingSheet = ({ 
  order: initialOrder, 
  isOpen, 
  onClose 
}: { 
  order: Order | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const { orders, updateOrderStatus } = useOrderStore();
  const order = orders.find(o => o.id === initialOrder?.id) || initialOrder;
  const statuses: Order['status'][] = [
    'Placed', 'Pending Payment', 'Confirmed', 'Preparing', 'Packed', 'Shipping', 'Delivered', 'Completed', 'Cancelled', 'Returned', 'Refund Requested', 'Refund Approved', 'Refunded'
  ];

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-lg sm:rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            Tracking Control
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-3 mb-8">
            {statuses.map(s => {
              const isActive = order.status === s;
              return (
                <button 
                  key={s}
                  onClick={() => updateOrderStatus(order.id, s)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' 
                      : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'
                  }`} />
                  <span className="text-[10px] font-black uppercase tracking-wider">{s}</span>
                </button>
              );
            })}
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-2">Update History</h4>
            <div className="space-y-4 px-2">
              {order.statusHistory.slice().reverse().map((h, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-blue-600' : 'bg-gray-200'} ring-4 ring-white relative z-10`} />
                    {i !== order.statusHistory.length - 1 && (
                      <div className="w-[1px] h-full bg-gray-100 -mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-[11px] font-black uppercase text-black">{h.status}</p>
                    <p className="text-[9px] font-bold text-gray-400 mt-0.5">
                      {new Date(h.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      {h.updatedBy && ` • By ${h.updatedBy}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function AdminOrdersCardView() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrderStore();
  const { products } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<'Online' | 'Offline' | 'All'>('All');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const getProductImage = (item: any) => {
    if (item?.image) return item.image;
    const prd = products.find(p => p.id === item?.productId || (p.name || '').toLowerCase() === (item?.name || '').toLowerCase());
    if (prd?.image) return prd.image;
    
    const n = (item?.name || '').toLowerCase();
    if (n.includes('shoes') || n.includes('leather') || n.includes('boot')) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60';
    }
    if (n.includes('watch') || n.includes('band') || n.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60';
    }
    if (n.includes('earbud') || n.includes('bluetooth') || n.includes('headphone')) {
      return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60';
    }
    return '';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.mobileNumber || '').includes(searchQuery);
    
    const matchesType = viewType === 'All' || order.type === viewType;
    
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending Payment': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Placed': return 'bg-gray-50/70 text-slate-700 border-gray-150';
      case 'Preparing': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-100';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-100';
      case 'Shipping': return 'bg-blue-50 text-blue-700 border-blue-105';
      case 'Confirmed': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Packed': return 'bg-cyan-50 text-cyan-700 border-cyan-100';
      case 'Returned': return 'bg-gray-200 text-gray-700 border-gray-300';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Refund Requested': return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'Refund Approved': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Refunded': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getPaymentStatusColor = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Paid': return 'text-green-600 bg-green-50 border-green-100';
      case 'Partial': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Unpaid': return 'text-red-600 bg-red-50 border-red-100';
      case 'Cash on Delivery': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const menuStatuses: Order['status'][] = [
    'Placed', 'Pending Payment', 'Confirmed', 'Preparing', 'Packed', 'Shipping', 'Delivered', 'Completed', 'Cancelled', 'Returned', 'Refund Requested', 'Refund Approved', 'Refunded'
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Sheets & State Handlers */}
      <AnimatePresence>
        {trackingOrder && (
          <TrackingSheet 
            order={trackingOrder} 
            isOpen={!!trackingOrder} 
            onClose={() => setTrackingOrder(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingOrderId && (
          <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setEditingOrderId(null)}>
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full md:w-[600px] lg:w-[800px] h-[90vh] md:h-full mt-auto md:mt-0 shadow-2xl relative flex flex-col"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex-1 overflow-y-auto w-full relative">
                 <PremiumOrderAdd editId={editingOrderId || undefined} isModal={true} onClose={() => setEditingOrderId(null)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 border border-[#EEEEEE] rounded-none shadow-sm">
        <div className="flex items-center bg-gray-100 p-1 rounded-none border border-gray-200">
          <button 
            onClick={() => setViewType('All')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'All' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            All
          </button>
          <button 
            onClick={() => setViewType('Online')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'Online' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            Online
          </button>
          <button 
            onClick={() => setViewType('Offline')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'Offline' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
          >
            In Shop
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
            <input 
              type="text" 
              placeholder="Search Customer/Order ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none text-[11px] font-bold w-[240px] focus:outline-none focus:border-black transition-all"
            />
          </div>
          <button className="p-2.5 border border-[#EEEEEE] bg-white group hover:border-black transition-all">
            <Filter className="w-4 h-4 text-gray-500 group-hover:text-black" />
          </button>
          <button className="p-2.5 border border-[#EEEEEE] bg-white group hover:border-black transition-all">
            <ArrowUpDown className="w-4 h-4 text-gray-500 group-hover:text-black" />
          </button>
          <button className="p-2.5 border border-[#EEEEEE] bg-white group hover:border-black transition-all">
            <Download className="w-4 h-4 text-gray-500 group-hover:text-black" />
          </button>
          <button 
            onClick={() => navigate('add')}
            className="ml-2 bg-black text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-black/10"
          >
            <Plus className="w-4 h-4" />
            Add Order
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredOrders.map((order) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={order.id}
              className="bg-white border border-[#EEEEEE] hover:border-black transition-all shadow-sm hover:shadow-xl group flex flex-col"
            >
              {/* Card Header Tags */}
              <div className="flex items-center justify-between p-4 border-b border-[#f8f8f8]">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                    order.type === 'Online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    {order.type}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                 <div className="relative">
                   <button 
                     onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                     className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
                   >
                     <Menu className="w-5 h-5" />
                   </button>
                   <AnimatePresence>
                     {activeMenu === order.id && (
                       <OrderActionSheet 
                         order={order}
                         isOpen={activeMenu === order.id}
                         onClose={() => setActiveMenu(null)}
                         onEdit={() => setEditingOrderId(order.id)}
                         onTracking={() => setTrackingOrder(order)}
                       />
                     )}
                   </AnimatePresence>
                 </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-50 border border-[#EEEEEE] shrink-0 overflow-hidden relative group-hover:border-black/20 transition-colors">
                  {order.items[0] && getProductImage(order.items[0]) ? (
                    <img src={getProductImage(order.items[0])} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-200" />
                    </div>
                  )}
                  <div className="absolute top-0 right-0 bg-black text-white text-[8px] font-black px-1.5 py-0.5">
                    #{order.orderId.split('-').pop()}
                  </div>
                </div>

                {/* Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <h4 className="text-sm font-black uppercase tracking-tight text-black truncate leading-none">
                      {order.customerName}
                    </h4>
                    {getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName }) >= 5 && <VerifiedTick />}
                  </div>

                  <div className="mb-2">
                    <LoyaltyBadge count={getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName })} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <Phone className="w-3 h-3 shrink-0" />
                      {order.mobileNumber}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <Package className="w-3 h-3 shrink-0" />
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} Items
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {order.fullAddress}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex flex-col justify-between shrink-0">
                  <div className="text-xs font-black text-black">
                     {formatPrice(order.total)}
                  </div>
                  <div className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                    Total Amt
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-auto p-4 bg-gray-50/50 border-t border-[#f8f8f8] space-y-4">
                <div className="flex items-center justify-between">
                  {/* ... date info ... */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.date).toLocaleDateString('en-GB')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {new Date(order.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                    Area: <span className="text-black">{order.cityArea || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   <div className={`flex-1 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border text-center rounded-lg transition-all ${getStatusColor(order.status)}`}>
                      {order.status}
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-32 text-center bg-white border border-dashed border-[#EEEEEE]">
           <div className="w-16 h-16 bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-8 h-8 text-gray-200" />
           </div>
           <h3 className="text-sm font-black uppercase tracking-widest text-black mb-2">No Transactions Found</h3>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest"> Try adjusting your filters or search query </p>
        </div>
      )}
    </div>
  );
}
