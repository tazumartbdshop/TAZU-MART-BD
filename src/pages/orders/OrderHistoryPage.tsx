import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderLayout } from '../../components/orders/OrderLayout';
import { OrderCard } from '../../components/orders/OrderCard';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ShoppingBag, Search } from 'lucide-react';

export default function OrderHistoryPage() {
  const { status } = useParams<{ status?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders } = useOrderStore();

  const filteredOrders = useMemo(() => {
    // Filter by user first
    const myOrders = orders.filter(o => 
      (user?.phone && o.mobileNumber === user.phone) || 
      (user?.email && o.email === user.email) ||
      (user?.id && o.userId === user.id)
    );

    if (!status || status === 'all') return myOrders;

    return myOrders.filter(o => {
      const s = o.status.toLowerCase();
      switch (status) {
        case 'to-pay':
          return s === 'pending';
        case 'to-ship':
          return ['placed', 'confirmed', 'preparing', 'packed'].includes(s);
        case 'to-receive':
          return ['shipping', 'shipped', 'out for delivery'].includes(s);
        case 'completed':
          return ['delivered', 'completed'].includes(s);
        case 'cancelled':
          return s === 'cancelled';
        case 'returns':
          return ['refund requested', 'refund approved', 'refunded'].includes(s);
        default:
          return true;
      }
    });
  }, [orders, user, status]);

  return (
    <OrderLayout>
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-neutral-200" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight mb-2">
            You don't have any orders in this section yet.
          </h3>
          <p className="text-sm text-neutral-400 max-w-xs mx-auto mb-8 font-medium">
            Explore our latest collections and find something you'll love!
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="px-10 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-95"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </OrderLayout>
  );
}
