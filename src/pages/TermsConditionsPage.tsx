import React, { useState, useEffect } from 'react';
import { FileText, Target, CreditCard, Truck } from 'lucide-react';
import { PremiumInformationLayout, PremiumCard, SectionHeader } from '../components/ui/PremiumInformationLayout';
import { businessPagesService } from '../services/businessPagesService';

interface PolicyData {
  banner?: string;
  sections?: { title: string; content: string }[];
}

export default function TermsConditionsPage() {
  const [data, setData] = useState<PolicyData | null>(null);

  useEffect(() => {
    let isMounted = true;
    businessPagesService.getPageData<PolicyData>('terms', { sections: [] })
      .then(res => {
        if (isMounted && res && res.sections && res.sections.length > 0) {
          setData(res);
        }
      })
      .catch(err => {
        console.warn('Terms & conditions fetch warning:', err);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <PremiumInformationLayout title="Terms & Conditions">
      <PremiumCard>
        <SectionHeader icon={FileText} title="Terms & Conditions" />
        <div className="space-y-6">
          {data?.banner && (
            <img src={data.banner} alt="Terms Banner" className="w-full h-40 md:h-52 object-cover rounded-xl border border-gray-100" />
          )}

          <div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-1.5">Terms of Service</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              By using TAZU MART BD, you agree to follow our policies and terms.
            </p>
          </div>

          {data?.sections && data.sections.length > 0 ? (
            <div className="space-y-4 pt-2">
              {data.sections.map((sec, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gray-50/80 border border-gray-100 space-y-1.5">
                  <h4 className="text-base font-bold text-black">{sec.title}</h4>
                  <p className="text-xs md:text-sm text-gray-700 leading-relaxed whitespace-pre-line">{sec.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 bg-white rounded-md shadow-xs"><FileText size={15} className="text-black" /></div>
                    <h4 className="font-bold text-sm text-black">Orders</h4>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">All orders are subject to product availability and confirmation.</p>
                </div>

                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 bg-white rounded-md shadow-xs"><Target size={15} className="text-black" /></div>
                    <h4 className="font-bold text-sm text-black">Pricing</h4>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Prices may change without prior notice.</p>
                </div>

                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 bg-white rounded-md shadow-xs"><CreditCard size={15} className="text-black" /></div>
                    <h4 className="font-bold text-sm text-black">Payments</h4>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">We accept secure payment methods available on our platform.</p>
                </div>

                <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 bg-white rounded-md shadow-xs"><Truck size={15} className="text-black" /></div>
                    <h4 className="font-bold text-sm text-black">Shipping</h4>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">Delivery times may vary depending on your location.</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <h4 className="text-base font-bold text-black mb-1">User Responsibilities</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Customers must provide accurate personal and delivery information.</p>
                </div>
                <div>
                  <h4 className="text-base font-bold text-black mb-1">Prohibited Activities</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">Fraudulent activities, misuse of the website, or attempts to disrupt our services are strictly prohibited.</p>
                </div>
                <div>
                  <h4 className="text-base font-bold text-black mb-1">Changes to Terms</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">We reserve the right to update these Terms & Conditions at any time.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </PremiumCard>
    </PremiumInformationLayout>
  );
}

