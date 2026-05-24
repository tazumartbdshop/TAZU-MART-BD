import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { CheckCircle2, Home, FileText, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { useSettingsStore } from '../store/useSettingsStore';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders } = useOrderStore();
  const { settings } = useSettingsStore();

  const order = orders.find(o => o.orderId === orderId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Order not found. Going home...</p>
        {setTimeout(() => navigate('/'), 2000)}
      </div>
    );
  }

  const whatsappMessage = `Hello Tazu Mart BD, I need help with my order #${orderId}`;
  const whatsappLink = `https://wa.me/8801XXXXXXXXX?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-white py-12 px-4 font-sans text-black">
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-2xl font-black text-black uppercase">Order Placed Successfully</h1>
          <p className="text-gray-600 mt-2 mb-8">Congratulations! Your order has been confirmed.</p>
        </motion.div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 text-left space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Order ID:</span>
            <span className="font-bold text-black">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Order Date:</span>
            <span className="font-bold text-black">{new Date(order.date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Payment Method:</span>
            <span className="font-bold text-black">{order.paymentMethod}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="text-gray-500 font-bold">Total Amount:</span>
            <span className="font-black text-black text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white border border-black hover:bg-gray-100 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Home className="w-4 h-4" /> Back To Home
          </button>
          <button
            onClick={() => navigate(`/checkout/invoice/${orderId}`)}
            className="w-full bg-black text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <FileText className="w-4 h-4" /> View Invoice
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-black text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}

