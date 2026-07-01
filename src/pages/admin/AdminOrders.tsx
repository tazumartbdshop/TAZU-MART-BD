import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { useOrderStore } from '../../store/useOrderStore';
import AdminOrdersCardView from './AdminOrdersCardView';
import PremiumOrderAdd from './PremiumOrderAdd';
import AdminFakeOrderControl from './AdminFakeOrderControl';
import { InvoiceView } from '../../components/checkout/InvoiceView';
import { getCompletedOrdersCount, LoyaltyBadge, VerifiedTick } from '../../lib/loyalty';
import { toast } from 'react-hot-toast';

function AdminOrderList() {
  const { orders, updateOrderStatus, markAsRead, deleteOrder } = useOrderStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('All'); // 'All' | 'Online' | 'Offline'
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Placed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Confirmed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Processing': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Packaging': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Shipped':
      case 'Shipping': return 'bg-blue-100 text-blue-750 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Returned': return 'bg-gray-200 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId !== id) {
      markAsRead(id);
    }
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this order and all its items from the database?')) {
      try {
        setIsDeleting(id);
        await deleteOrder(id);
        toast.success('Order deleted successfully from database');
      } catch (error) {
        toast.error('Failed to delete order');
      } finally {
        setIsDeleting(null);
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
            <button 
              onClick={() => navigate('/admin/orders/add')}
              className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Order
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {['All', 'Placed', 'Pending', 'Confirmed', 'Processing', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'].map((status) => (
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

      <div className="p-4 space-y-3 flex-1 bg-gray-50/35">
        {filteredOrders.map((order, index) => {
          const isExpanded = expandedId === order.id;
          const formattedFullDate = new Intl.DateTimeFormat('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).format(new Date(order.date));

          return (
            <div 
              key={`${order.id || index}-${index}`} 
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Compact View */}
              <div 
                onClick={() => toggleExpand(order.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 transition-colors"
                id={`order-row-${order.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black text-white font-black flex items-center justify-center text-xs shrink-0 relative">
                    {index + 1}
                    {!order.isRead && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#000000] text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                      {order.customerName}
                      {getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName }) >= 5 && <VerifiedTick />}
                    </h4>
                    <div className="mt-1">
                      <LoyaltyBadge count={getCompletedOrdersCount(orders, { email: order.email, phone: order.mobileNumber, name: order.customerName })} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(order.date))}
                    </p>
                  </div>
                </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <p className="font-black text-black text-sm sm:text-base">
                      {formatPrice(order.total)}
                    </p>
                    {(order.status === 'Delivered' || order.status === 'Completed') ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 select-none uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Complete Order
                      </span>
                    ) : (
                      <div onClick={(e) => e.stopPropagation()}>
                        <select 
                          value={order.status || ''}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                          className={`px-3 py-1 text-xs font-bold rounded-full border outline-none cursor-pointer ${getStatusColor(order.status || '')}`}
                        >
                          {['Placed', 'Pending', 'Confirmed', 'Processing', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    )}
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
                        handleDeleteOrder(order.id);
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
