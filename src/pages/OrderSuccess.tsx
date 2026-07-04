import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { useCartStore } from '../store/useCartStore';
import { useProductStore } from '../store/useProductStore';
import { CheckCircle2, Printer, Home, HelpCircle, Package } from 'lucide-react';
import { formatPrice } from '../lib/utils';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders } = useOrderStore();
  const { clearCart } = useCartStore();
  const { products } = useProductStore();

  const stateOrder = location.state?.order;
  const order = stateOrder || orders.find(o => o.orderId === orderId);

  useEffect(() => {
    clearCart();
    window.scrollTo(0, 0);
    // Prevent going back to checkout
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      navigate('/', { replace: true });
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, clearCart]);

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-[16px] font-bold text-black uppercase tracking-widest">Finding Order</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-8 py-3 bg-black text-white font-bold text-[14px] rounded-[6px]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Related products
  const recommendedProducts = products.filter(p => p.status === 'active').slice(0, 4);
  const discountAmount = typeof order.discount === 'number' ? order.discount : (order.discount?.amount || 0);

  return (
    <div className="min-h-screen bg-white font-sans text-black pb-24">
      {/* Top Section */}
      <div className="container mx-auto max-w-4xl px-4 pt-16 pb-12 text-center border-b border-[#E5E5E5]">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-6" />
        <h1 className="text-[32px] md:text-[40px] font-bold uppercase tracking-tight mb-4">Order Confirmed</h1>
        <p className="text-[14px] text-[#666666] max-w-lg mx-auto">
          Your order has been placed successfully. We have received your order and it is now being processed.
        </p>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-12 space-y-12">
        {/* Order Information Section - Two Column Table */}
        <div className="space-y-4">
          <h2 className="text-[18px] font-bold uppercase tracking-wider mb-6">Order Information</h2>
          <div className="border border-[#E5E5E5] rounded-[6px] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="flex border-b md:border-b-0 md:border-r border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Order ID</div>
                <div className="w-2/3 p-4 text-[14px] font-medium">{order.orderId}</div>
              </div>
              <div className="flex border-b border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Order Date</div>
                <div className="w-2/3 p-4 text-[14px] font-medium">
                  {new Date(order.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div className="flex border-b md:border-b-0 md:border-r border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Customer</div>
                <div className="w-2/3 p-4 text-[14px] font-medium">{order.customerName}</div>
              </div>
              <div className="flex border-b border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Phone</div>
                <div className="w-2/3 p-4 text-[14px] font-medium">{order.mobileNumber}</div>
              </div>
              <div className="flex border-b md:border-b-0 md:border-r border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Address</div>
                <div className="w-2/3 p-4 text-[14px] font-medium">{order.fullAddress}</div>
              </div>
              <div className="flex border-b border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Payment Method</div>
                <div className="w-2/3 p-4 text-[14px] font-medium uppercase">{order.paymentMethod}</div>
              </div>
              <div className="flex border-b md:border-b-0 md:border-r border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Payment Status</div>
                <div className="w-2/3 p-4 text-[14px] font-medium">{order.paymentStatus}</div>
              </div>
              <div className="flex border-b border-[#E5E5E5]">
                <div className="w-1/3 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Order Status</div>
                <div className="w-2/3 p-4 text-[14px] font-medium">{order.status}</div>
              </div>
              <div className="flex border-b-0 md:border-r border-[#E5E5E5] md:col-span-2">
                <div className="w-1/3 md:w-1/6 bg-[#F9F9F9] p-4 text-[13px] font-bold text-[#666666] border-r border-[#E5E5E5]">Est. Delivery</div>
                <div className="w-2/3 md:w-5/6 p-4 text-[14px] font-medium">3 - 5 Business Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="space-y-6 hidden sm:block">
          <h2 className="text-[18px] font-bold uppercase tracking-wider">Order Timeline</h2>
          <div className="border border-[#E5E5E5] rounded-[6px] p-8 flex justify-between relative">
            <div className="absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-[#E5E5E5] -z-10"></div>
            
            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[12px] font-bold text-center">Confirmed</span>
            </div>
            
            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] bg-white flex items-center justify-center text-[#E5E5E5]">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-[#666666] text-center">Preparing</span>
            </div>

            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] bg-white flex items-center justify-center text-[#E5E5E5]">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-[#666666] text-center">Ready</span>
            </div>

            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] bg-white flex items-center justify-center text-[#E5E5E5]">
                <Package className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-[#666666] text-center">Out for Delivery</span>
            </div>

            <div className="flex flex-col items-center gap-3 bg-white px-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#E5E5E5] bg-white flex items-center justify-center text-[#E5E5E5]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[12px] font-bold text-[#666666] text-center">Delivered</span>
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <div className="space-y-6">
          <h2 className="text-[18px] font-bold uppercase tracking-wider">Product Summary</h2>
          <div className="space-y-4">
            {order.items.map((item: any, index: number) => (
              <div key={index} className="border border-[#E5E5E5] rounded-[6px] p-4 flex flex-col sm:flex-row items-center gap-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="w-24 h-24 shrink-0 bg-[#F9F9F9] rounded-[4px] border border-[#E5E5E5] overflow-hidden flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 space-y-1 w-full text-center sm:text-left">
                  <h3 className="text-[16px] font-bold leading-tight">{item.name}</h3>
                  {item.variant && item.variant !== 'Default' && (
                     <p className="text-[13px] text-[#666666]">Variant: {item.variant}</p>
                  )}
                  <p className="text-[13px] text-[#666666]">Unit Price: {formatPrice(item.price)}</p>
                </div>
                <div className="flex flex-col items-center sm:items-end w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-[#E5E5E5]">
                  <p className="text-[12px] text-[#666666] mb-1">Quantity: {item.quantity}</p>
                  <p className="text-[18px] font-bold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="border border-[#E5E5E5] rounded-[6px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] max-w-md ml-auto">
           <h3 className="text-[16px] font-bold uppercase tracking-wider mb-4 border-b border-[#E5E5E5] pb-2">Order Summary</h3>
           <div className="space-y-3 text-[14px]">
             <div className="flex justify-between">
               <span className="text-[#666666]">Subtotal</span>
               <span className="font-bold">{formatPrice(order.subtotal || (order.total - (order.deliveryCharge || 0) + discountAmount))}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-[#666666]">Shipping Charge</span>
               <span className="font-bold">{formatPrice(order.deliveryCharge || 0)}</span>
             </div>
             {discountAmount > 0 && (
               <div className="flex justify-between text-black">
                 <span className="text-[#666666]">Discount</span>
                 <span className="font-bold">- {formatPrice(discountAmount)}</span>
               </div>
             )}
             {order.promoCodeUsed && (
               <div className="flex justify-between text-black">
                 <span className="text-[#666666]">Coupon Discount ({order.promoCodeUsed})</span>
                 <span className="font-bold">- {formatPrice(discountAmount)}</span>
               </div>
             )}
             <div className="flex justify-between text-[18px] font-bold pt-4 border-t border-[#E5E5E5] mt-2">
               <span>Grand Total</span>
               <span>{formatPrice(order.total)}</span>
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-8 border-t border-[#E5E5E5]">
          <button 
            onClick={() => navigate(`/checkout/invoice/${order.orderId}`)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white text-[13px] font-bold uppercase tracking-wider rounded-[6px] hover:bg-[#222222] transition-colors"
          >
            <Printer className="w-4 h-4" /> Download Invoice
          </button>
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black border border-[#E5E5E5] text-[13px] font-bold uppercase tracking-wider rounded-[6px] hover:bg-[#F9F9F9] transition-colors"
          >
            <Package className="w-4 h-4" /> Track Order
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black border border-[#E5E5E5] text-[13px] font-bold uppercase tracking-wider rounded-[6px] hover:bg-[#F9F9F9] transition-colors"
          >
            <Home className="w-4 h-4" /> Go to Home
          </button>
          <button 
            onClick={() => navigate('/support')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black border border-[#E5E5E5] text-[13px] font-bold uppercase tracking-wider rounded-[6px] hover:bg-[#F9F9F9] transition-colors"
          >
            <HelpCircle className="w-4 h-4" /> Contact Support
          </button>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="pt-16">
            <h2 className="text-[20px] font-bold uppercase tracking-wider text-center mb-8">Recommended for you</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedProducts.map(product => (
                <Link key={product.id} to={`/product/${product.slug || product.id}`} className="group block border border-[#E5E5E5] rounded-[6px] p-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all bg-white">
                  <div className="w-full aspect-square bg-[#F9F9F9] rounded-[4px] border border-[#E5E5E5] mb-4 flex items-center justify-center overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <h3 className="text-[14px] font-bold line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[14px] font-bold">{formatPrice(product.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
