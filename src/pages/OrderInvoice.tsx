import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { InvoiceView } from '../components/checkout/InvoiceView';

export default function OrderInvoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders } = useOrderStore();
  const order = orders.find(o => o.orderId === orderId);

  if (!order) {
    return (
      <div className="p-10 text-center font-sans text-neutral-600 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Loading Invoice Details...</p>
      </div>
    );
  }

  return (
    <InvoiceView 
      order={order} 
      onBack={() => navigate('/')} 
    />
  );
}


