import React, { useState, useEffect } from 'react';
import { Users, Target, Eye, Award } from 'lucide-react';
import { PremiumInformationLayout, PremiumCard, SectionHeader } from '../components/ui/PremiumInformationLayout';
import { businessPagesService } from '../services/businessPagesService';
import { AboutData } from './admin/content-pages/AdminAboutEditor';

const DEFAULT_ABOUT_DATA: AboutData = {
  companyIntro: 'TAZU MART BD is a modern online shopping platform dedicated to bringing customers premium-quality products at competitive prices. Our goal is to provide a smooth, secure, and enjoyable shopping experience for every customer.',
  history: 'Since our beginning, we have focused on building long-term relationships with customers through honesty, quality, and excellent service.',
  founderMessage: '',
  businessGoal: 'To make online shopping simple, reliable, and enjoyable by providing high-quality products and excellent customer support.',
  futurePlan: 'To become one of the most trusted online shopping destinations by continuously improving our services and customer experience.',
  team: [],
  timeline: [],
  faq: []
};

export default function AboutUsPage() {
  const [data, setData] = useState<AboutData>(DEFAULT_ABOUT_DATA);

  useEffect(() => {
    businessPagesService.getPageData<AboutData>('about', DEFAULT_ABOUT_DATA).then(res => {
      if (res) setData(res);
    });
  }, []);

  return (
    <PremiumInformationLayout title="About Us">
      <PremiumCard>
        <SectionHeader icon={Users} title="About Us" />
        <div className="space-y-6 md:space-y-8">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">Who We Are</h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {data.companyIntro || DEFAULT_ABOUT_DATA.companyIntro}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 md:p-5 bg-blue-50/50 rounded-xl border border-blue-100/60">
              <Target className="w-6 h-6 text-blue-600 mb-2.5" />
              <h3 className="text-base font-bold text-black mb-1.5">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {data.businessGoal || DEFAULT_ABOUT_DATA.businessGoal}
              </p>
            </div>
            <div className="p-4 md:p-5 bg-purple-50/50 rounded-xl border border-purple-100/60">
              <Eye className="w-6 h-6 text-purple-600 mb-2.5" />
              <h3 className="text-base font-bold text-black mb-1.5">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {data.futurePlan || DEFAULT_ABOUT_DATA.futurePlan}
              </p>
            </div>
          </div>

          {data.founderMessage && (
            <div className="p-4 md:p-5 bg-amber-50/50 rounded-xl border border-amber-100/60">
              <h3 className="text-base font-bold text-black mb-1.5">Founder Message</h3>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {data.founderMessage}
              </p>
            </div>
          )}

          <div className="p-4 md:p-5 bg-green-50/50 rounded-xl border border-green-100/60">
            <Award className="w-6 h-6 text-green-600 mb-2.5" />
            <h3 className="text-base font-bold text-black mb-1.5">Our Promise</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Every product is carefully checked before shipping to ensure the best shopping experience for our customers.
            </p>
          </div>

          {data.team && data.team.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-black mb-3">Our Team</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.team.map((member, idx) => (
                  <div key={idx} className="p-3 border border-gray-100 rounded-xl bg-gray-50 flex items-center gap-3">
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-black">{member.name}</h4>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-black mb-3">What We Believe</h3>
            <div className="flex flex-wrap gap-2.5">
              {['Quality', 'Trust', 'Customer Satisfaction', 'Innovation', 'Fast Service', 'Reliable Support'].map((value, idx) => (
                <span key={idx} className="h-9 px-4 bg-black text-white text-sm font-semibold rounded-lg shadow-xs inline-flex items-center justify-center">
                  {value}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-lg font-bold text-black mb-2">Our Journey</h3>
            <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {data.history || DEFAULT_ABOUT_DATA.history}
            </p>
          </div>
        </div>
      </PremiumCard>
    </PremiumInformationLayout>
  );
}

