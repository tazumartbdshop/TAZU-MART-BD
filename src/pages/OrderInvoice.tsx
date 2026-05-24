import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { InvoiceView } from '../components/checkout/InvoiceView';

export default function OrderInvoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders } = useOrderStore();
  const order = orders.find(o => o.orderId === orderId);

  if (!order) {
    return <div className="p-10 text-center">Invoice not found.</div>;
  }

  return (
    <InvoiceView 
      order={order} 
      onBack={() => navigate('/')} 
    />
  );
}


