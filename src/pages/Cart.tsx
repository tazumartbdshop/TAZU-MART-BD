import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Heart, Star, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatPrice } from '../lib/utils';
import { useState } from 'react';

export default function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  
  const subtotal = getCartTotal();
  const shipping = items.length > 0 ? 100 : 0;
  const discount = 0; // Placeholder for future logic
  const tax = 0; // Placeholder for future logic
  const total = subtotal + shipping - discount + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center bg-white flex items-center justify-center min-h-[60vh]">
        <div>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#E5E5E5]">
            <ShoppingBag className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-2xl md:text-[24px] font-bold text-black mb-4">Your Cart is Empty</h2>
          <p className="text-[#666666] mb-8 max-w-md mx-auto text-[14px]">
            Looks like you haven't added any premium items to your cart yet.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-3.5 font-bold hover:bg-[#222222] shadow-sm transition-all rounded-[14px]"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-2xl md:text-[24px] font-bold text-black mb-8 uppercase tracking-wide">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-[18px] rounded-[16px] border border-[#E5E5E5] shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row gap-[16px]">
              {/* Product Image */}
              <Link to={`/product/${item.slug || item.id}`} className="shrink-0">
                <div className="w-[100px] h-[100px] bg-white rounded-[12px] overflow-hidden border border-[#E5E5E5] flex items-center justify-center">
                  <img 
                    src={item.image || null} 
                    alt={item.name} 
                    className="w-full h-full object-contain" 
                  />
                </div>
              </Link>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <Link to={`/product/${item.slug || item.id}`} className="hover:opacity-80 transition-opacity">
                    <h3 className="font-bold text-[18px] text-black line-clamp-1">{item.name}</h3>
                  </Link>
                  
                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-1.5 mt-1 mb-2">
                    <div className="flex items-center text-black">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <span className="text-[12px] font-bold text-black">(4.9)</span>
                    <span className="text-[#666666] text-[12px]">| 125 Reviews</span>
                  </div>

                  {/* Attributes & Description */}
                  <div className="text-[14px] text-[#666666] space-y-0.5 mb-3">
                    <p className="line-clamp-1">Premium Quality • Highly Durable</p>
                    <p className="flex items-center gap-1.5 text-black font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" /> In Stock
                    </p>
                    <p>1 Year Warranty</p>
                    <div className="flex gap-4 mt-1">
                      <p><span className="font-medium text-black">SKU:</span> {item.sku || 'N/A'}</p>
                      <p><span className="font-medium text-black">Color:</span> Standard</p>
                    </div>
                  </div>
                </div>

                {/* Price, Quantity & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4 bg-white border border-black rounded-md px-3 py-1.5 w-fit">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-black hover:opacity-70 transition-opacity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-black w-6 text-center text-[14px] font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-black hover:opacity-70 transition-opacity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <div className="font-bold text-[20px] text-black">
                      {item.quantity > 1 ? (
                        <span className="text-[14px] text-[#666666] font-normal mr-2">
                          {formatPrice(item.price)} × {item.quantity} =
                        </span>
                      ) : null}
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <div className="flex items-center gap-4 text-[13px] font-medium text-[#666666]">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1.5 hover:text-black transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                      <span className="w-[1px] h-3 bg-[#E5E5E5]"></span>
                      <button 
                        className="flex items-center gap-1.5 hover:text-black transition-colors"
                      >
                        <Heart className="w-4 h-4" /> Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[16px] border border-[#E5E5E5] p-[18px] sticky top-24 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <h3 className="text-[20px] font-bold text-black mb-6">Order Summary</h3>
            
            <div className="space-y-3 text-[14px] mb-6">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span className="font-bold text-black">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Shipping Charge</span>
                <span className="font-bold text-black">{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Discount</span>
                <span className="font-bold text-black">- {formatPrice(discount)}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Coupon</span>
                <span className="font-bold text-black">0</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Tax</span>
                <span className="font-bold text-black">{formatPrice(tax)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-white border border-[#E5E5E5] text-black px-4 py-2.5 rounded-[8px] focus:outline-none focus:border-black transition-colors text-[14px]"
                />
                <button className="bg-black text-white px-5 py-2.5 rounded-[8px] hover:bg-[#222222] transition-colors font-bold text-[14px]">
                  Apply
                </button>
              </div>
              <p className="text-[12px] text-[#666666] mt-2 text-center">Have a coupon? Apply it before checkout.</p>
            </div>
            
            <div className="border-t border-[#E5E5E5] pt-4 mb-6">
              <div className="flex justify-between text-black text-[20px] font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white py-4 font-bold hover:bg-[#222222] transition-colors rounded-[14px] flex justify-center items-center gap-2 text-[16px] shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
