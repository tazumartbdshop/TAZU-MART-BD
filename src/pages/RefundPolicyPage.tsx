import React, { useState, useEffect } from 'react';
import { RefreshCcw, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { PremiumInformationLayout, PremiumCard, SectionHeader } from '../components/ui/PremiumInformationLayout';
import { businessPagesService } from '../services/businessPagesService';

interface PolicyData {
  banner?: string;
  sections?: { title: string; content: string }[];
}

export default function RefundPolicyPage() {
  const [data, setData] = useState<PolicyData | null>(null);

  useEffect(() => {
    let isMounted = true;
    businessPagesService.getPageData<PolicyData>('refund', { sections: [] })
      .then(res => {
        if (isMounted && res && res.sections && res.sections.length > 0) {
          setData(res);
        }
      })
      .catch(err => {
        console.warn('Refund policy fetch warning:', err);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <PremiumInformationLayout title="Refund Policy">
      <PremiumCard>
        <SectionHeader icon={RefreshCcw} title="Refund Policy" />
        <div className="space-y-6">
          {data?.banner && (
            <img src={data.banner} alt="Refund Policy Banner" className="w-full h-40 md:h-52 object-cover rounded-xl border border-gray-100" />
          )}

          <div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-1.5">Easy & Transparent Refund Policy</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
              Customer satisfaction is our priority.
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
              <div className="bg-green-50/80 rounded-xl p-4 md:p-5 border border-green-100">
                <h4 className="text-base font-bold text-black mb-3">Eligible for Refund</h4>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {['Wrong Product Delivered', 'Damaged Product', 'Missing Item', 'Manufacturing Defect'].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                      <span className="font-medium text-sm text-gray-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-black mb-3">Refund Process</h4>
                <div className="space-y-2.5">
                  {[
                    'Contact Customer Support.',
                    'Provide Order Details.',
                    'Verification Process.',
                    'Refund Approval.',
                    'Refund Completed.'
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 px-4 py-3 min-h-[60px] rounded-xl bg-gray-50/80 border border-gray-100">
                      <div className="w-8 h-8 min-w-[32px] rounded-lg bg-black text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-sm md:text-base text-gray-800">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                  <h4 className="text-sm font-bold text-black mb-1.5 flex items-center gap-2">
                    <Clock size={16} className="text-black" /> Processing Time
                  </h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    Approved refunds are generally completed within <strong className="text-black">3–7 business days</strong>, depending on the payment method.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                  <h4 className="text-sm font-bold text-black mb-1.5 flex items-center gap-2">
                    <HelpCircle size={16} className="text-black" /> Need Help?
                  </h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    Our customer support team is always available to assist you with refund-related questions.
                  </p>
                </div>
              </div>

              <div className="bg-red-50/80 p-4 md:p-5 rounded-xl border border-red-100">
                <h4 className="text-base font-bold text-red-900 mb-2.5">Non-Refundable Cases</h4>
                <ul className="space-y-2">
                  {[
                    'Product damaged after customer use',
                    'Change of mind after successful delivery (unless covered by your store policy)',
                    'Items that do not meet return conditions'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-red-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </PremiumCard>
    </PremiumInformationLayout>
  );
}

