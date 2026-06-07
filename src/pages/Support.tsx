import React from 'react';
import { SupportCenter } from '../components/ui/SupportCenter';

export default function Support() {
  return (
    <div className="container mx-auto py-8 px-4 md:py-12 max-w-7xl animate-fade-in" id="support-standalone-page-wrapper">
      <div className="text-center mb-8 max-w-xl mx-auto" id="support-intro-header">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase text-slate-950 tracking-wider">
          Support Center
        </h1>
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mt-2">
          24/7 Professional Customer Assistance & Smart AI Support Desk
        </p>
      </div>

      <div className="w-full" id="support-standalone-center-portal">
        <SupportCenter />
      </div>
    </div>
  );
}
