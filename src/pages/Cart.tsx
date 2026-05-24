import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { formatPrice } from '../lib/utils';
import { useState } from 'react';

export default function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');

  const subtotal = getCartTotal();
  const shipping = items.length > 0 ? 100 : 0;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center bg-gray-50 flex items-center justify-center min-h-[60vh] rounded-2xl border border-gray-100 my-8">
        <div>
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
            <ShoppingBag className="w-10 h-10 text-primary-900" />
          </div>
          <h2 className="text-3xl font-serif text-primary-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Looks like you haven't added any luxury items to your cart yet.
          </p>
          <Link 
            to="/"
            className="inline-block bg-primary-900 text-white px-8 py-3.5 font-medium hover:bg-black hover:-translate-y-0.5 shadow-md transition-all uppercase tracking-wide text-sm rounded-md"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-serif text-primary-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-primary-900 uppercase tracking-widest pb-4 border-b border-gray-200">
            <div className="col-span-6">Product</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 md:p-0 md:bg-transparent rounded-xl border border-gray-100 md:border-none md:border-b md:border-gray-100 py-6">
                <div className="md:col-span-6 flex gap-4 items-center relative">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute right-0 top-0 p-1 text-gray-400 hover:text-red-500 md:hidden"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-primary-900 line-clamp-2 md:pr-0 pr-6 text-sm md:text-base">{item.name}</h3>
                  </div>
                </div>
                
                <div className="md:col-span-2 text-primary-900 font-medium md:text-center">
                  {formatPrice(item.price)}
                </div>
                
                <div className="md:col-span-2 flex justify-between md:justify-center items-center">
                  <span className="md:hidden text-gray-500 text-sm">Quantity:</span>
                  <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-3 py-1.5 shadow-sm">
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="text-gray-400 hover:text-primary-900 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-primary-900 w-4 text-center text-sm font-medium">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-gray-400 hover:text-primary-900 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                <div className="col-span-2 hidden md:flex justify-end items-center gap-4">
                  <span className="text-primary-900 font-bold">{formatPrice(item.price * item.quantity)}</span>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h3 className="text-xl font-serif text-primary-900 mb-6 font-semibold">Order Summary</h3>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-primary-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Charge</span>
                <span className="font-medium text-primary-900">{formatPrice(shipping)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 text-primary-900 px-4 py-2.5 rounded-md focus:outline-none focus:border-primary-900 transition-colors shadow-sm"
                />
                <button className="bg-primary-900 text-white px-5 py-2.5 rounded-md hover:bg-black transition-colors font-medium text-sm tracking-wide">
                  Apply
                </button>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-8">
              <div className="flex justify-between text-primary-900 text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary-900 text-white py-4 font-medium hover:bg-black transition-colors rounded-md flex justify-center items-center gap-2 uppercase tracking-widest text-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-0.5"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
