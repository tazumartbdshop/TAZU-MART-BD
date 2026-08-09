import React from 'react';
import { LiveOrderTracker } from '../components/orders/LiveOrderTracker';

export default function Orders() {
  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 pb-24 font-sans text-slate-900">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 uppercase tracking-tight mb-1">
            Live Order Tracking Portal
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Search by Order ID, Mobile Number, or Email to view live courier status, tracking timeline, and invoice details.
          </p>
        </div>

        {/* Core Live Order Tracker Component */}
        <LiveOrderTracker />
      </div>
    </div>
  );
}
