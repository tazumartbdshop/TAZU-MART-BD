import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { formatPrice } from '../../lib/utils';
import { useOrderStore } from '../../store/useOrderStore';
import AdminOrdersCardView from './AdminOrdersCardView';
import PremiumOrderAdd from './PremiumOrderAdd';
import { InvoiceView } from '../../components/checkout/InvoiceView';

function AdminOrderList() {
  const { orders, updateOrderStatus } = useOrderStore();
  const [activeTab, setActiveTab] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);

  const filteredOrders = orders.filter(
    order => activeTab === 'All' || order.status === activeTab
  );

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
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-none border border-[#EEEEEE] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden flex flex-col min-h-[70vh]">
      <div className="p-6 border-b border-[#EEEEEE] shrink-0">
        <h3 className="text-xl font-serif font-bold text-[#000000] mb-4">Complete Order Database</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {['All', 'Placed', 'Pending', 'Confirmed', 'Processing', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'].map((status) => (
            <button 
              key={status} 
              onClick={() => setActiveTab(status)}
              className={`px-4 py-1.5 rounded-none text-sm font-medium whitespace-nowrap transition-colors ${activeTab === status ? 'bg-[#000000] text-white' : 'bg-gray-50 text-[#666666] hover:bg-gray-100'}`}
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
              key={order.id} 
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Compact View */}
              <div 
                onClick={() => toggleExpand(order.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-gray-50/80 transition-colors"
                id={`order-row-${order.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black text-white font-black flex items-center justify-center text-xs shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#000000] text-sm sm:text-base">
                      {order.customerName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(order.date))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <p className="font-black text-black text-sm sm:text-base">
                    {formatPrice(order.total)}
                  </p>
                  <div onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border outline-none cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      {['Placed', 'Pending', 'Confirmed', 'Processing', 'Packaging', 'Shipping', 'Delivered', 'Cancelled', 'Returned'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Expandable Details Card */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-3 bg-gray-50 border-t border-gray-100 text-xs sm:text-sm space-y-4 animate-in slide-in-from-top-2 duration-150">
                  
                  {/* Customer Info Point-by-point */}
                  <div className="space-y-2">
                    <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-gray-400">Customer Information</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500 block text-xs">Customer Name</span>
                        <p className="font-bold text-black">{order.customerName}</p>
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

                  <hr className="border-gray-250" />

                  {/* Order Date & Custom formatting */}
                  <div>
                    <span className="text-gray-500 block text-xs">Order Date & Time</span>
                    <p className="font-bold text-gray-800 text-xs sm:text-sm">{formattedFullDate}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoiceOrder(order);
                      }}
                      className="flex-1 bg-black text-white py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-900 transition-colors shadow-sm active:scale-98"
                    >
                      Invoice
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
      <Route path="/" element={<AdminOrdersCardView />} />
      <Route path="/complete" element={<AdminOrderList />} />
      <Route path="/add" element={<PremiumOrderAdd />} />
      <Route path="/edit/:id" element={<PremiumOrderAdd />} />
    </Routes>
  );
}
