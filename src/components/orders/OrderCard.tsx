import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Truck, Calendar, CreditCard, ChevronRight, 
  RefreshCcw, Star, Download, Eye, Clock, CheckCircle2, XCircle, ArrowUpRight
} from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { Order, useOrderStore } from '../../store/useOrderStore';
import { useCartStore } from '../../store/useCartStore';
import toast from 'react-hot-toast';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { cancelOrder, confirmReceived } = useOrderStore();

  const handleBuyAgain = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!order.items || order.items.length === 0) return;
    order.items.forEach(item => {
      addItem({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || '',
        variant: item.variant,
        slug: item.slug || ''
      });
    });
    toast.success('Items added to cart');
    navigate('/checkout');
  };

  const getOrderStatusBadge = (status: string) => {
    const s = (status || 'Pending').toLowerCase();
    
    if (s === 'pending' || s === 'placed') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-amber-800 stroke-[2.5]" />
          Pending
        </span>
      );
    }
    if (['confirmed', 'preparing', 'packed', 'processing', 'to-ship'].includes(s)) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-950 border border-blue-300 flex items-center gap-1.5 shrink-0">
          <Package className="w-3.5 h-3.5 text-blue-800 stroke-[2.5]" />
          Processing
        </span>
      );
    }
    if (['shipping', 'shipped', 'out for delivery', 'to-receive'].includes(s)) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-indigo-100 text-indigo-950 border border-indigo-300 flex items-center gap-1.5 shrink-0">
          <Truck className="w-3.5 h-3.5 text-indigo-800 stroke-[2.5]" />
          Shipped
        </span>
      );
    }
    if (['delivered', 'completed'].includes(s)) {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1.5 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 stroke-[2.5]" />
          Delivered
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-red-100 text-red-950 border border-red-300 flex items-center gap-1.5 shrink-0">
          <XCircle className="w-3.5 h-3.5 text-red-800 stroke-[2.5]" />
          Cancelled
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-neutral-200 text-black border border-neutral-300 shrink-0">
        {status}
      </span>
    );
  };

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(order.date);
      if (isNaN(d.getTime())) return 'Recently Placed';
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return 'Recently Placed';
    }
  }, [order.date]);

  const itemsList = Array.isArray(order.items) && order.items.length > 0 ? order.items : [];

  return (
    <div 
      onClick={() => navigate(`/account/orders/details/${order.id}`)}
      className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-6 mb-4 shadow-xs hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 text-black flex items-center justify-center font-black shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
            <Package className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-black uppercase tracking-wider">Order ID:</span>
              <span className="text-sm font-black text-black">#{order.orderId}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-600 font-bold">
              <Calendar className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {getOrderStatusBadge(order.status)}
          <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-neutral-100 text-black border border-neutral-200 shrink-0">
            {order.paymentMethod || 'Cash on Delivery'}
          </span>
        </div>
      </div>

      {/* Product Display List */}
      <div className="space-y-3 mb-4">
        {itemsList.length > 0 ? (
          itemsList.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 sm:gap-4 p-3 rounded-xl bg-neutral-50/90 border border-neutral-200/80">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-neutral-200 overflow-hidden shrink-0">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-black line-clamp-2 uppercase tracking-tight leading-snug">
                  {item.name}
                </h4>
                {item.variant && item.variant !== 'Default' && (
                  <p className="text-xs font-bold text-neutral-700 mt-1">
                    Variant: <span className="text-black font-black">{item.variant}</span>
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs font-black text-black bg-neutral-200 px-2.5 py-0.5 rounded-md">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-black">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 bg-neutral-50 rounded-xl text-xs font-bold text-black border border-neutral-200">
            Order Items ({order.items?.length || 0})
          </div>
        )}
      </div>

      {/* Meta Bar: Delivery Mode & Total Price */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-neutral-100/90 border border-neutral-200/80 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-black">
          <Truck className="w-4 h-4 text-black stroke-[2.5]" />
          <span>Delivery Mode:</span>
          <span className="font-black text-black">{order.deliveryMode || 'Standard Delivery'}</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Total Amount:</span>
          <span className="text-base sm:text-lg font-black text-black">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100">
        <div className="text-xs font-bold text-neutral-500 hidden md:block">
          Click order card for full history & details
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* View Details Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/account/orders/details/${order.id}`); }}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-neutral-200"
          >
            <Eye className="w-4 h-4 stroke-[2.5]" />
            <span>View Details</span>
          </button>

          {/* Download Invoice Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/checkout/invoice/${order.orderId}`); }}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-neutral-200"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Invoice</span>
          </button>

          {/* Track Order Button */}
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/account/orders/details/${order.id}`); }}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <Truck className="w-4 h-4 stroke-[2.5]" />
            <span>Track Order</span>
          </button>

          {/* Cancel button if pending */}
          {(order.status === 'Pending' || order.status === 'Placed') && (
            <button 
              onClick={(e) => { e.stopPropagation(); cancelOrder(order.id); toast.success('Order cancelled'); }}
              className="px-3.5 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            >
              Cancel
            </button>
          )}

          {/* Buy Again button if delivered or cancelled */}
          {(order.status === 'Delivered' || order.status === 'Completed' || order.status === 'Cancelled') && (
            <button 
              onClick={handleBuyAgain}
              className="px-4 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
            >
              <RefreshCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Buy Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

