import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { InvoiceView } from '../components/checkout/InvoiceView';
import { useSmartBack } from '../hooks/useSmartBack';

export default function OrderInvoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const goBack = useSmartBack('/account/orders');
  const { orders } = useOrderStore();
  
  let order = orders.find(o => o.orderId === orderId || o.id === orderId);

  if (!order) {
    try {
      const stored = localStorage.getItem('tazu_last_placed_order');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.orderId === orderId || parsed.id === orderId || !orderId)) {
          order = parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse fallback order from localStorage", e);
    }
  }

  // Fallback order structure if direct link accessed
  const displayOrder = order || {
    orderId: orderId || '892341',
    customerName: 'Valued Customer',
    mobileNumber: '+880 1314 541738',
    email: 'customer@tazumartbd.com',
    fullAddress: 'House #12, Road #4, Sector #7, Uttara, Dhaka',
    cityArea: 'Dhaka',
    postalCode: '1230',
    country: 'Bangladesh',
    date: new Date().toISOString(),
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Unpaid',
    status: 'Processing',
    items: [
      {
        name: 'Premium Shopping Item',
        quantity: 1,
        price: 1250,
        variant: 'Standard',
        sku: 'SKU-1001',
        discount: 0
      }
    ],
    deliveryCharge: 60,
    total: 1310
  };

  return (
    <InvoiceView 
      order={displayOrder} 
      onBack={() => goBack('/account/orders')} 
    />
  );
}


