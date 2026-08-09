import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, MessageSquare, Loader2, Phone, MapPin, Calendar, Clock, ChevronRight, CheckCircle2, Truck, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import AdminOrdersCardView from './AdminOrdersCardView';
import PremiumOrderAdd from './PremiumOrderAdd';
import AdminFakeOrderControl from './AdminFakeOrderControl';
import { InvoiceView } from '../../components/checkout/InvoiceView';
import { getCompletedOrdersCount, LoyaltyBadge, VerifiedTick } from '../../lib/loyalty';
import { toast } from 'react-hot-toast';
import { DeleteOrderModal } from '../../components/admin/DeleteOrderModal';

function AdminOrderList() {
  const { orders, updateOrderStatus, markAsRead, deleteOrder, clearAllOrders } = useOrderStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('All'); // 'All' | 'Online' | 'Offline'
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const matchesSearch = 
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.mobileNumber || '').includes(searchQuery);
    const matchesType = viewType === 'All' || order.type === viewType;
    return matchesTab && matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Payment': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Placed': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'Confirmed': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Preparing': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Packed': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Shipped':
      case 'Shipping': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Delivered': return 'bg-green-50 text-green-700 border-green-200';
      case 'Completed': return 'bg-purple-600 text-white border-purple-600';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Returned': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Refund Requested': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Refunded': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCustomerInfo = (order: Order) => {
    const matched = customers.find(c => 
      (order.userId && (c.id === order.userId || c.googleId === order.userId || c.facebookId === order.userId)) ||
      (c.phone && order.mobileNumber && c.phone.replace(/\D/g, '') === order.mobileNumber.replace(/\D/g, '')) ||
      (c.email && order.email && c.email.trim().toLowerCase() === order.email.trim().toLowerCase())
    );

    const profileImage = matched?.profileImage || order.customerImage || null;
    const displayName = order.customerName || matched?.name || 'Customer';
    const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'C';

    return {
      matchedCustomer: matched,
      profileImage,
      displayName,
      firstLetter,
      phone: order.mobileNumber || matched?.phone || ''
    };
  };

  const toggleExpand = (id: string) => {
    if (expandedId !== id) {
      markAsRead(id);
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrder(orderToDelete.id);
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error('Failed to delete order. Please try again.');
    } finally {
      setOrderToDelete(null);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear ALL orders? This cannot be undone.')) {
      try {
        await clearAllOrders();
        toast.success('All orders cleared.');
      } catch (error) {
        toast.error('Failed to clear orders.');
      }
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="bg-white rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[70vh]">
      <div className="p-6 border-b border-[#EEEEEE] shrink-0 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-serif font-bold text-[#000000]">Complete Order Database</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Channel/ViewType Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-none border border-gray-200">
              <button 
                onClick={() => setViewType('All')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'All' ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-400'}`}
              >
                All
              </button>
              <button 
                onClick={() => setViewType('Online')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'Online' ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-400'}`}
              >
                Online
              </button>
              <button 
                onClick={() => setViewType('Offline')}
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-all ${viewType === 'Offline' ? 'bg-white text-black shadow-sm font-bold' : 'text-gray-400'}`}
              >
                In Shop
              </button>
            </div>

            {/* Search Input */}
            <div className="relative group min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
              <input 
                type="text" 
                placeholder="Search Customer / Order ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none text-xs font-bold w-full focus:outline-none focus:border-black transition-all"
              />
            </div>

            {/* Add Order Button */}
            <div className="flex gap-2">
              <button 
                onClick={handleClearAll}
                className="bg-red-600 text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-red-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
              >
                Clear All
              </button>
              <button 
                onClick={() => navigate('/admin/orders/add')}
                className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Order
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {['All', 'Placed', 'Pending Payment', 'Confirmed', 'Preparing', 'Packed', 'Shipping', 'Delivered', 'Completed', 'Cancelled', 'Returned', 'Refund Requested', 'Refunded'].map((status) => (
            <button 
              key={status} 
              onClick={() => setActiveTab(status)}
              className={`px-4 py-1.5 rounded-none text-sm font-medium whitespace-nowrap transition-colors ${activeTab === status ? 'bg-[#000000] text-white font-bold' : 'bg-gray-50 text-[#666666] hover:bg-gray-100'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3 flex-1 bg-gray-50/50">
        {filteredOrders.map((order, index) => {
          const isExpanded = expandedId === order.id;
          const custInfo = getCustomerInfo(order);
          const totalQty = order.items?.reduce((acc, curr) => acc + (curr.quantity || 1), 0) || 0;
          const formattedFullDate = new Intl.DateTimeFormat('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }).format(new Date(order.date || Date.now()));

          return (
            <div 
              key={`${order.id || index}-${index}`} 
              className="bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-sm hover:border-purple-300 transition-all overflow-hidden"
            >
              {/* Compact Order Card Header & Brief */}
              <div 
                onClick={() => toggleExpand(order.id)}
                className="p-3.5 sm:p-4 cursor-pointer space-y-2.5 hover:bg-gray-50/50 transition-colors"
                id={`order-row-${order.id}`}
              >
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      ORDER NO: #{order.orderId || order.id}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      order.type === 'Online' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {order.type || 'ONLINE'}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      order.paymentStatus === 'Unpaid' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {order.paymentMethod || order.paymentStatus || 'UNPAID'}
                    </span>
                    {!order.isRead && (
                      <span className="text-[9px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Total Amount Top Right */}
                  <div className="text-right ml-auto">
                    <span className="text-sm sm:text-base font-black font-mono text-neutral-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                {/* Middle Customer & Order Details */}
                <div className="flex items-start gap-3">
                  {/* Square Profile Box */}
                  <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {custInfo.profileImage ? (
                      <img src={custInfo.profileImage} alt={custInfo.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-extrabold text-sm uppercase text-purple-700">{custInfo.firstLetter}</span>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-extrabold text-neutral-900 text-sm truncate">
                        {custInfo.displayName}
                      </h4>
                      {getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName }) >= 5 && <VerifiedTick />}
                      <LoyaltyBadge count={getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName })} />
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-600">
                      {custInfo.phone && (
                        <span className="flex items-center gap-1 font-bold text-neutral-800">
                          <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                          {custInfo.phone}
                        </span>
                      )}
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-500 font-medium">
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} • {totalQty} qty • Order #{order.orderId || order.id}
                      </span>
                    </div>

                    {(order.cityArea || order.fullAddress) && (
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 truncate">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{order.cityArea ? `Location: ${order.cityArea}` : order.fullAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtle Divider */}
                <div className="border-t border-gray-100 my-1" />

                {/* Footer Meta & Actions Row */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-0.5">
                  <div className="flex items-center gap-2 text-neutral-500 font-medium text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{new Date(order.date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1" />
                    <span>{new Date(order.date || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {order.courier?.name && (
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {order.courier.name} {order.courier.trackingId ? `· #${order.courier.trackingId}` : ''}
                      </span>
                    )}

                    {order.status === 'Completed' ? (
                      <span className="bg-purple-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded shadow-2xs flex items-center gap-1 uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status || ''}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded border outline-none cursor-pointer ${getStatusColor(order.status || '')}`}
                        >
                          {['Placed', 'Pending Payment', 'Confirmed', 'Preparing', 'Packed', 'Shipping', 'Delivered', 'Completed', 'Cancelled', 'Returned', 'Refund Requested', 'Refund Approved', 'Refunded'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Expandable Details Card */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-3 bg-gray-50 border-t border-gray-100 text-xs sm:text-sm space-y-4 animate-in slide-in-from-top-2 duration-150">
                  
                  {/* Customer Info Point-by-point */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Customer Details</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500 block text-xs">Customer Name</span>
                        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                          <p className="font-bold text-black">{order.customerName}</p>
                          {getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName }) >= 5 && <VerifiedTick />}
                        </div>
                        <div className="mt-1">
                          <LoyaltyBadge count={getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName })} />
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Mobile Number</span>
                        <p className="font-bold text-black">{order.mobileNumber || 'No Information'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Full Address</span>
                        <p className="font-bold text-black">{order.fullAddress || 'No Information'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Email Address</span>
                        <p className="font-bold text-black">
                          {order.email && order.email.trim() !== '' ? order.email : 'No Information'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Payment Information</h4>
                    <div>
                      <span className="text-gray-500 block text-xs">Payment Method</span>
                      <p className="font-bold text-gray-900 uppercase">{order.paymentMethod || 'No Information'}</p>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Product Information Point-by-point */}
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Product Information</h4>
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="p-3 bg-white border border-gray-150 rounded-lg space-y-2">
                            <div>
                              <span className="text-gray-450 text-[10px] uppercase font-bold block">Product Name</span>
                              <p className="font-extrabold text-black text-xs sm:text-sm">{item.name}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-gray-100 mt-2">
                              <div>
                                <span className="text-gray-400 text-[10px] uppercase font-bold block">Product Price</span>
                                <p className="font-semibold text-black text-xs">{formatPrice(item.price)} x {item.quantity}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[10px] uppercase font-bold block">Product Code</span>
                                <p className="font-mono text-purple-750 text-xs font-bold">{item.productId || 'No Information'}</p>
                              </div>
                              <div>
                                <span className="text-gray-400 text-[10px] uppercase font-bold block">Product Category</span>
                                <p className="font-semibold text-black text-xs">No Information</p>
                              </div>
                            </div>
                            {item.variant && (
                              <div className="pt-1.5">
                                <span className="text-gray-405 text-[9px] uppercase font-bold block">Variant</span>
                                <p className="text-xs text-gray-605 font-medium">{item.variant}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No products matched</p>
                    )}
                  </div>

                  <hr className="border-gray-200" />

                  {/* Bill Pricing breakdown with Promo codes */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Order Pricing Summary</h4>
                    <div className="bg-white border border-gray-150 p-3 rounded-lg space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-semibold text-black">{formatPrice(order.subtotal || (order.total - (order.deliveryCharge || 0) + (order.discount?.amount || 0)))}</span>
                      </div>
                      {order.promoCodeUsed && (
                        <div className="flex justify-between items-center text-emerald-600">
                          <span>Promo Code Used</span>
                          <span className="font-extrabold uppercase tracking-widest text-[10px] bg-emerald-50 px-2 py-0.5 border border-emerald-200">{order.promoCodeUsed}</span>
                        </div>
                      )}
                      {order.discount?.amount > 0 && (
                        <div className="flex justify-between items-center text-emerald-600">
                          <span>Discount Applied</span>
                          <span className="font-extrabold font-mono">-{formatPrice(order.discount.amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Delivery Fee</span>
                        <span className="font-semibold text-black">{formatPrice(order.deliveryCharge || 0)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-gray-100 font-bold text-gray-900">
                        <span>Final Total</span>
                        <span className="text-black font-black text-sm">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Order Date & Custom formatting */}
                  <div>
                    <span className="text-gray-500 block text-xs">Order Date & Time</span>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm">{formattedFullDate}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceOrder(order);
                      }}
                      className="bg-black text-white py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-900 transition-colors shadow-sm active:scale-98 flex items-center justify-center gap-2"
                    >
                      Invoice
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsApp(order.mobileNumber);
                      }}
                      className="bg-white border border-black text-black py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderToDelete(order);
                      }}
                      className="border border-red-200 text-red-600 hover:bg-red-600 hover:text-white py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500 font-medium">
            No orders found.
          </div>
        )}
        <DeleteOrderModal 
          isOpen={!!orderToDelete} 
          onClose={() => setOrderToDelete(null)}
          onConfirm={confirmDeleteOrder}
        />
      </div>

      {/* Dynamic Invoice Modal Preview Overlay */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex justify-center items-start py-4 sm:py-8 px-2 sm:px-4">
          <div className="bg-white rounded-2xl max-w-[210mm] w-full shadow-2xl relative overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedInvoiceOrder(null)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-205 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold z-50 transition-all shadow-sm"
              aria-label="Close invoice"
            >
              ✕
            </button>
            <div className="max-h-[85vh] overflow-y-auto">
              <InvoiceView 
                order={{
                  ...selectedInvoiceOrder,
                  createdAt: selectedInvoiceOrder.date 
                }} 
                onBack={() => setSelectedInvoiceOrder(null)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  return (
    <Routes>
      <Route path="/" element={<AdminOrderList />} />
      <Route path="/complete" element={<AdminOrderList />} />
      <Route path="/add" element={<PremiumOrderAdd />} />
      <Route path="/edit/:id" element={<PremiumOrderAdd />} />
      <Route path="/fake-control" element={<AdminFakeOrderControl />} />
    </Routes>
  );
}
