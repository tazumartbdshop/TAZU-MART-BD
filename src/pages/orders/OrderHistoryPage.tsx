import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderLayout } from '../../components/orders/OrderLayout';
import { OrderCard } from '../../components/orders/OrderCard';
import { useOrderStore } from '../../store/useOrderStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ShoppingBag } from 'lucide-react';

export default function OrderHistoryPage() {
  const { status } = useParams<{ status?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { orders } = useOrderStore();

  const myOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    if (!user) return orders;
    const userFiltered = orders.filter(o => 
      (user.phone && o.mobileNumber === user.phone) || 
      (user.email && o.email === user.email) ||
      (user.id && o.userId === user.id)
    );
    return userFiltered.length > 0 ? userFiltered : orders;
  }, [orders, user]);

  const tabCounts = useMemo(() => {
    return {
      all: myOrders.length,
      pending: myOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return ['pending', 'placed', 'to-pay'].includes(s);
      }).length,
      processing: myOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return ['confirmed', 'preparing', 'packed', 'processing', 'to-ship'].includes(s);
      }).length,
      shipped: myOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return ['shipping', 'shipped', 'out for delivery', 'to-receive'].includes(s);
      }).length,
      delivered: myOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return ['delivered', 'completed'].includes(s);
      }).length,
      cancelled: myOrders.filter(o => {
        const s = (o.status || '').toLowerCase();
        return ['cancelled'].includes(s);
      }).length,
    };
  }, [myOrders]);

  const filteredOrders = useMemo(() => {
    if (!status || status === 'all') return myOrders;

    const targetStatus = status.toLowerCase();

    return myOrders.filter(o => {
      const s = (o.status || '').toLowerCase();
      switch (targetStatus) {
        case 'pending':
        case 'to-pay':
          return ['pending', 'placed', 'to-pay'].includes(s);
        case 'processing':
        case 'to-ship':
          return ['confirmed', 'preparing', 'packed', 'processing', 'to-ship'].includes(s);
        case 'shipped':
        case 'to-receive':
          return ['shipping', 'shipped', 'out for delivery', 'to-receive'].includes(s);
        case 'delivered':
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
  }, [myOrders, status]);

  return (
    <OrderLayout totalOrdersCount={myOrders.length} tabCounts={tabCounts}>
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-xs my-4">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-5 border border-neutral-200">
            <ShoppingBag className="w-9 h-9 text-black stroke-[2.5]" />
          </div>
          <h3 className="text-lg sm:text-xl font-black text-black uppercase tracking-tight mb-2">
            No Orders Found in this Category
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto mb-6 font-bold leading-relaxed">
            You don't have any orders matching this status yet. Browse our store to place your next order!
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="px-8 py-3.5 bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-neutral-800 transition-all active:scale-95 shadow-xs"
          >
            Explore Store
          </button>
        </div>
      )}
    </OrderLayout>
  );
}

