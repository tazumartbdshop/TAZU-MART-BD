import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, SlidersHorizontal, Store, ChevronRight, Package } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';

const tabs = ['All', 'To Pay', 'To Ship', 'To Receive', 'To Review'];

export default function ToReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { orders } = useOrderStore();
  const { addItem } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');

  const activeTab = searchParams.get('tab') || 'To Review';

  // Filter completed orders for the current user
  const filteredOrders = useMemo(() => {
    let userOrders = orders.filter(o => 
      (user?.email && o.email === user.email) || 
      (user?.phone && o.mobileNumber === user.phone) ||
      (o.email === 'demo@example.com' || o.customerName === 'Demo User') // Show demo data for UI preview
    );

    return userOrders.filter(o => {
      // Status mapping based on tab
      let isStatusMatch = false;
      const statusLower = o.status.toLowerCase();
      
      switch(activeTab) {
        case 'All':
          isStatusMatch = true;
          break;
        case 'To Pay':
          isStatusMatch = ['placed'].includes(statusLower);
          break;
        case 'To Ship':
          isStatusMatch = ['pending', 'packaging', 'confirmed'].includes(statusLower);
          break;
        case 'To Receive':
          isStatusMatch = ['processing', 'shipping'].includes(statusLower);
          break;
        case 'To Review':
          isStatusMatch = ['delivered', 'completed'].includes(statusLower);
          break;
        default:
          isStatusMatch = true;
      }

      if (!isStatusMatch) return false;
      
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        return o.items.some(item => item.name.toLowerCase().includes(search));
      }
      return true;
    });
  }, [orders, user, searchQuery, activeTab]);

  const handleBuyAgain = (order: any) => {
    order.items.forEach((item: any) => {
      addItem({
        id: item.productId,
        name: item.name,
        price: item.price,
        image: item.image || '',
        quantity: item.quantity
      });
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/account/dashboard')} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-base font-bold text-black">My Orders</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by seller name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 pl-8 pr-3 h-8 bg-gray-100 border-none rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-black text-black"
              />
            </div>
            <button className="flex items-center gap-1 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors border border-transparent hover:border-gray-100">
              <SlidersHorizontal className="w-4 h-4 text-black" />
              <span className="text-xs font-medium text-black">Filter</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="px-4 py-2 sm:hidden border-b border-gray-100 bg-white">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by seller name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 h-9 bg-gray-100 border-none rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black text-black"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center overflow-x-auto no-scrollbar border-b border-gray-100 px-2 bg-white" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => {
                  navigate(`/orders/to-review?tab=${encodeURIComponent(tab)}`);
                }}
                className={`whitespace-nowrap px-4 py-3.5 text-sm transition-colors relative ${
                  isActive ? 'text-black font-bold' : 'text-gray-500 font-medium'
                }`}
              >
                {tab}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-4 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
              <div className="w-24 h-24 mb-4 opacity-50 flex items-center justify-center bg-gray-50 rounded-full">
                 <Store className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-black mb-1">No Orders Found</h3>
              <p className="text-sm text-gray-500">You don't have any completed orders yet.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden mb-3">
                <div onClick={() => navigate(`/orders/${order.id}`)} className="cursor-pointer">
                  {/* Store Header */}
                  <div className="flex items-center justify-between p-3.5 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-black" />
                      <span className="text-sm font-bold text-black">{order.storeName || 'Tazu Store'}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-[11px] font-bold text-black uppercase tracking-wider">{order.status}</span>
                  </div>

                  {/* Items */}
                  <div className="p-3.5 space-y-4">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-3.5">
                        <div className="w-20 h-20 rounded-md bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                               <Package className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-black font-medium leading-snug line-clamp-2">{item.name}</h4>
                          {(item.variant || item.variantDetails) && (
                            <div className="mt-1.5">
                              <span className="inline-block bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-sm">
                                {item.variant || Object.values(item.variantDetails || {}).filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-black">৳{item.price.toLocaleString()}</span>
                            <span className="text-[13px] font-medium text-gray-500">Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Section */}
                  <div className="px-3.5 py-2.5 border-t border-gray-50 flex items-center justify-end gap-2">
                    <span className="text-[13px] text-gray-500">{order.items.length} item(s), Total:</span>
                    <span className="text-base font-bold text-black">৳{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-3.5 border-t border-gray-50 flex items-center gap-3">
                  <button
                    onClick={() => navigate('/support')}
                    className="flex-1 h-10 rounded-md bg-white border border-gray-300 text-black text-sm font-semibold transition-colors hover:bg-gray-50"
                  >
                    Return / Refund
                  </button>
                  <button
                    onClick={() => handleBuyAgain(order)}
                    className="flex-1 h-10 rounded-md bg-black text-white text-sm font-semibold transition-colors hover:bg-gray-900"
                  >
                    Buy Again
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
