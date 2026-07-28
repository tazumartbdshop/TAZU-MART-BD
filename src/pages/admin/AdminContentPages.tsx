import React, { useState } from 'react';
import AdminBrandsEditor from './content-pages/AdminBrandsEditor';
import AdminAboutEditor from './content-pages/AdminAboutEditor';
import AdminContactEditor from './content-pages/AdminContactEditor';
import AdminPolicyEditor from './content-pages/AdminPolicyEditor';

export default function AdminContentPages() {
  const [activeTab, setActiveTab] = useState<'brands' | 'about' | 'contact' | 'privacy' | 'terms' | 'refund'>('brands');

  const tabs = [
    { id: 'brands', label: 'Brands (Profile)' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'refund', label: 'Refund Policy' },
  ] as const;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="border-b border-zinc-200 px-6 py-6">
        <h1 className="text-2xl font-black tracking-widest text-zinc-900 uppercase">Content Pages</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage all public informational pages</p>
      </div>

      <div className="flex border-b border-zinc-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-zinc-900 text-zinc-900' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'brands' && <AdminBrandsEditor />}
        {activeTab === 'about' && <AdminAboutEditor />}
        {activeTab === 'contact' && <AdminContactEditor />}
        {activeTab === 'privacy' && <AdminPolicyEditor type="privacy" title="Privacy Policy" />}
        {activeTab === 'terms' && <AdminPolicyEditor type="terms" title="Terms & Conditions" />}
        {activeTab === 'refund' && <AdminPolicyEditor type="refund" title="Refund Policy" />}
      </div>
    </div>
  );
}
