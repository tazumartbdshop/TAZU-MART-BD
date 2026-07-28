import React from 'react';
import { Footer } from '../layout/Footer';

interface PremiumInformationLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function PremiumInformationLayout({ title, children }: PremiumInformationLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-800 flex flex-col">
      {/* Main Content Area directly below App Bar */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-6 pb-12 md:pt-8 md:pb-16">
        {/* Page Title directly at top */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-black tracking-tight mb-6 pb-4 border-b border-gray-200">
          {title}
        </h1>
        {children}
      </main>

      <Footer />
    </div>
  );
}

export const PremiumCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-gray-100 mb-6">
    {children}
  </div>
);

export const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-3 mb-5 pb-3.5 border-b border-gray-100">
    {Icon && (
      <div className="p-2 rounded-lg bg-gray-100 text-black flex items-center justify-center">
        <Icon size={20} />
      </div>
    )}
    <h2 className="text-lg md:text-xl font-bold text-black tracking-tight">{title}</h2>
  </div>
);
