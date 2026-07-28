import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PremiumInformationLayout, PremiumCard, SectionHeader } from '../components/ui/PremiumInformationLayout';
import { businessPagesService } from '../services/businessPagesService';
import { BrandsData } from './admin/content-pages/AdminBrandsEditor';

const DEFAULT_BRANDS_DATA: BrandsData = {
  logo: '',
  banner: '',
  companyName: 'TAZU MART BD',
  ourStory: 'We are committed to delivering premium-quality products with trusted service and affordable prices. Every item in our collection is carefully selected to ensure quality, reliability, and customer satisfaction.',
  mission: '',
  vision: '',
  whyChooseUs: [
    "Premium Quality Products",
    "Trusted Customer Service",
    "Secure Online Shopping",
    "Fast Nationwide Delivery",
    "Affordable Pricing",
    "100% Customer Satisfaction"
  ],
  brandValues: [],
  productCategories: [],
  statistics: [],
  gallery: [],
  certifications: [],
  customerTrust: '',
  websiteLink: '',
  whatsapp: '',
  email: '',
  call: '',
  socialLinks: []
};

export default function BrandsInformationPage() {
  const [data, setData] = useState<BrandsData>(DEFAULT_BRANDS_DATA);

  useEffect(() => {
    businessPagesService.getPageData<BrandsData>('brands', DEFAULT_BRANDS_DATA).then(res => {
      if (res) setData(res);
    });
  }, []);

  const whyChooseList = data.whyChooseUs && data.whyChooseUs.length > 0
    ? data.whyChooseUs
    : DEFAULT_BRANDS_DATA.whyChooseUs;

  return (
    <PremiumInformationLayout title="Brands Information">
      <PremiumCard>
        <SectionHeader icon={Building2} title={data.companyName ? `${data.companyName} Brand` : "Brands Information"} />
        <div className="space-y-6">
          {data.banner && (
            <img src={data.banner} alt="Brand Banner" className="w-full h-40 md:h-56 object-cover rounded-xl border border-gray-100" />
          )}

          <div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">Discover Our Brand</h3>
            <p className="text-base text-gray-600 font-medium leading-relaxed">
              Welcome to <strong className="text-black">{data.companyName || 'TAZU MART BD'}</strong>.
            </p>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mt-2 whitespace-pre-line">
              {data.ourStory || DEFAULT_BRANDS_DATA.ourStory}
            </p>
          </div>

          {(data.mission || data.vision) && (
            <div className="grid sm:grid-cols-2 gap-4">
              {data.mission && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-black mb-1">Our Mission</h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{data.mission}</p>
                </div>
              )}
              {data.vision && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-black mb-1">Our Vision</h4>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{data.vision}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-gray-50/80 rounded-xl p-4 md:p-5 border border-gray-100">
            <h3 className="text-base font-bold text-black mb-3.5 flex items-center gap-2">
              <ShieldCheck className="text-green-600 w-5 h-5" /> Why Choose Us
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {whyChooseList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-black flex-shrink-0" />
                  <span className="font-medium text-sm text-gray-800">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumCard>
    </PremiumInformationLayout>
  );
}

