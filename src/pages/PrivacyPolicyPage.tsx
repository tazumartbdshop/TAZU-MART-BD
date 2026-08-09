import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { PremiumInformationLayout, PremiumCard, SectionHeader } from '../components/ui/PremiumInformationLayout';
import { businessPagesService } from '../services/businessPagesService';

interface PolicyData {
  banner?: string;
  sections?: { title: string; content: string }[];
}

export default function PrivacyPolicyPage() {
  const [data, setData] = useState<PolicyData | null>(null);

  useEffect(() => {
    let isMounted = true;
    businessPagesService.getPageData<PolicyData>('privacy', { sections: [] })
      .then(res => {
        if (isMounted && res && res.sections && res.sections.length > 0) {
          setData(res);
        }
      })
      .catch(err => {
        console.warn('Privacy policy fetch warning:', err);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <PremiumInformationLayout title="Privacy Policy">
      <PremiumCard>
        <SectionHeader icon={Lock} title="Privacy Policy" />
        <div className="space-y-6">
          {data?.banner && (
            <img src={data.banner} alt="Privacy Policy Banner" className="w-full h-40 md:h-52 object-cover rounded-xl border border-gray-100" />
          )}

          <div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-1.5">Your Privacy Matters</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
              Your privacy is extremely important to us. We collect only the information necessary to process your orders and improve your shopping experience.
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                  <h4 className="text-base font-bold text-black mb-3">Information We Collect</h4>
                  <ul className="space-y-2">
                    {['Name', 'Phone Number', 'Email Address', 'Delivery Address', 'Order Information'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs md:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                  <h4 className="text-base font-bold text-black mb-3">How We Use Your Information</h4>
                  <ul className="space-y-2">
                    {['Process Orders', 'Deliver Products', 'Customer Support', 'Improve Our Services', 'Send Important Updates'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs md:text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-black mb-1">Data Protection</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    Your personal information is securely stored and never sold to third parties without your permission.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-bold text-black mb-1">Cookies</h4>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    Our website may use cookies to improve your browsing experience.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </PremiumCard>
    </PremiumInformationLayout>
  );
}

