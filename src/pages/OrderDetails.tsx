import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Package, Store, MapPin, Truck } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useOrderStore();
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const order = orders.find(o => o.id === id || o.orderId === id);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-black">Order Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-black text-white rounded-md text-sm font-medium">
          Go Back
        </button>
      </div>
    );
  }

  const handleConfirmReceive = async () => {
    setIsUpdating(true);
    try {
      // simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      updateOrderStatus(order.id, 'Completed');
      setShowSuccessDialog(true);
    } catch (error) {
      setShowErrorDialog(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const closeDialog = () => {
    setShowSuccessDialog(false);
    navigate('/orders/to-review?tab=To Review');
  };

  const closeErrorDialog = () => {
    setShowErrorDialog(false);
  };

  const isReceiveable = ['processing', 'shipping'].includes(order.status.toLowerCase());
  const isCompleted = order.status.toLowerCase() === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-base font-bold text-black">Order Details</h1>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-4 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Status Banner */}
          <div className="bg-black text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{order.status}</h2>
              <p className="text-xs text-gray-300 mt-1">Order ID: {order.orderId}</p>
            </div>
            <Package className="w-8 h-8 opacity-80" />
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-black" />
              <h3 className="text-sm font-bold text-black">Shipping Address</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-black">{order.customerName}</p>
              <p>{order.mobileNumber}</p>
              <p>{order.fullAddress}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
            <div className="p-3.5 border-b border-gray-50 flex items-center gap-2">
              <Store className="w-4 h-4 text-black" />
              <span className="text-sm font-bold text-black">{order.storeName || 'Tazu Store'}</span>
            </div>
            <div className="p-3.5 space-y-4">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-3.5">
                  <div className="w-20 h-20 rounded-md bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-black font-medium leading-snug line-clamp-2">{item.name}</h4>
                    {item.variant && (
                      <div className="mt-1.5">
                        <span className="inline-block bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded-sm">
                          {item.variant}
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
          </div>

          {/* Payment Details */}
          <div className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
            <h3 className="text-sm font-bold text-black mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>৳{(order.subtotal || order.total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>৳{order.deliveryCharge || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-black pt-2 border-t border-gray-100 mt-2">
                <span>Total</span>
                <span>৳{order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      {isReceiveable && (
        <div className="bg-white border-t border-gray-100 p-3 md:p-4 sticky bottom-0 z-40">
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              onClick={handleConfirmReceive}
              disabled={isUpdating}
              className="flex-1 bg-black text-white py-3 rounded-md text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Confirm Receive'}
            </button>
          </div>
        </div>
      )}
      {isCompleted && (
        <div className="bg-white border-t border-gray-100 p-3 md:p-4 sticky bottom-0 z-40">
           <div className="max-w-2xl mx-auto flex gap-3">
             <button
                onClick={() => navigate('/support')}
                className="flex-1 bg-white border border-black text-black py-3 rounded-md text-sm font-bold hover:bg-gray-50 transition-colors"
              >
                Return / Refund
              </button>
              <button
                onClick={() => {
                  const firstItem = order.items[0];
                  const productSlugOrId = firstItem.slug || firstItem.productId || firstItem.id;
                  navigate(`/product/${productSlugOrId}?buyAgain=true`);
                }}
                className="flex-1 bg-black text-white py-3 rounded-md text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                Buy Again
              </button>
           </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Order Completed</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your order has been completed successfully.<br/>
                Thank you for shopping with Tazu Mart BD.
              </p>
              <button
                onClick={closeDialog}
                className="w-full bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {showErrorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-red-500">!</span>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Update Failed</h3>
              <p className="text-sm text-gray-600 mb-6">
                Something went wrong. Please try again.
              </p>
              <button
                onClick={closeErrorDialog}
                className="w-full bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
