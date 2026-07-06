import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Truck, Calendar, CreditCard, ChevronRight, 
  RefreshCcw, Star, FileText, XCircle, CheckCircle, 
  HelpCircle, ShieldCheck, Download
} from 'lucide-react';
import { formatPrice, cn } from '../../lib/utils';
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Placed': 'bg-neutral-100 text-neutral-600',
      'Pending': 'bg-amber-50 text-amber-600',
      'Confirmed': 'bg-blue-50 text-blue-600',
      'Preparing': 'bg-blue-50 text-blue-600',
      'Packed': 'bg-indigo-50 text-indigo-600',
      'Shipping': 'bg-indigo-50 text-indigo-600',
      'Shipped': 'bg-indigo-50 text-indigo-600',
      'Out for Delivery': 'bg-orange-50 text-orange-600',
      'Delivered': 'bg-emerald-50 text-emerald-600',
      'Completed': 'bg-emerald-50 text-emerald-600',
      'Cancelled': 'bg-red-50 text-red-600',
      'Refund Requested': 'bg-purple-50 text-purple-600',
      'Refund Approved': 'bg-purple-100 text-purple-700',
      'Refunded': 'bg-neutral-900 text-white',
    };
    return (
      <span className={cn(
        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent",
        colors[status] || 'bg-neutral-50 text-neutral-400'
      )}>
        {status}
      </span>
    );
  };

  return (
    <div 
      onClick={() => navigate(`/account/orders/details/${order.id}`)}
      className="bg-white border border-neutral-100 rounded-3xl p-6 mb-4 hover:shadow-xl hover:shadow-neutral-900/5 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-black transition-colors">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Order ID</span>
              <span className="text-xs font-black text-black">#{order.orderId}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400 font-medium">
              <Calendar className="w-3 h-3" />
              {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Total Amount</div>
            <div className="text-sm font-black">{formatPrice(order.total)}</div>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* Items Preview */}
      <div className="space-y-4 mb-6">
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 overflow-hidden shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-black truncate uppercase tracking-tight">{item.name}</h4>
              <p className="text-[10px] text-neutral-400 font-medium mt-1">
                {item.variant} • Qty: {item.quantity}
              </p>
            </div>
            <div className="text-xs font-black">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-neutral-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 rounded-xl">
            <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{order.paymentMethod}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* To Pay Section */}
          {order.status === 'Pending' && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); cancelOrder(order.id); }}
                className="px-4 py-2 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 rounded-xl transition-all"
              >
                Cancel Order
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/checkout'); }}
                className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                Pay Now
              </button>
            </>
          )}

          {/* To Ship Section */}
          {['Confirmed', 'Preparing', 'Packed'].includes(order.status) && (
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/account/orders/details/${order.id}`); }}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              View Details
            </button>
          )}

          {/* To Receive Section */}
          {['Shipped', 'Out for Delivery'].includes(order.status) && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/support'); }}
                className="p-2.5 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-xl transition-all"
                title="Contact Support"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/account/orders/details/${order.id}`); }}
                className="px-6 py-2.5 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all"
              >
                Track Order
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); confirmReceived(order.id); }}
                className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
              >
                Confirm Received
              </button>
            </>
          )}

          {/* Completed Section */}
          {(order.status === 'Delivered' || order.status === 'Completed') && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/checkout/invoice/${order.orderId}`); }}
                className="p-2.5 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-xl transition-all"
                title="View Invoice"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/product/${order.items[0]?.slug}/reviews`); }}
                className="px-4 py-2.5 border border-neutral-200 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-colors flex items-center gap-2"
              >
                <Star className="w-3.5 h-3.5" /> Review
              </button>
              <button 
                onClick={handleBuyAgain}
                className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Buy Again
              </button>
            </>
          )}

          {/* Cancelled Section */}
          {order.status === 'Cancelled' && (
            <button 
              onClick={handleBuyAgain}
              className="px-6 py-2.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-colors"
            >
              Buy Again
            </button>
          )}

          {/* Refund Section */}
          {['Refund Requested', 'Refund Approved', 'Refunded'].includes(order.status) && (
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/account/orders/details/${order.id}`); }}
              className="px-6 py-2.5 border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 transition-all"
            >
              Refund Status
            </button>
          )}

          <div className="p-2.5 hover:bg-neutral-50 rounded-xl transition-colors ml-2">
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
