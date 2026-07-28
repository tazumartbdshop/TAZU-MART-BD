import React, { useState, useEffect } from 'react';
import { PhoneCall, Mail, MessageCircle, Clock, MapPin } from 'lucide-react';
import { PremiumInformationLayout, PremiumCard, SectionHeader } from '../components/ui/PremiumInformationLayout';
import { businessPagesService } from '../services/businessPagesService';
import { ContactData } from './admin/content-pages/AdminContactEditor';

const DEFAULT_CONTACT_DATA: ContactData = {
  companyAddress: 'Dhaka, Bangladesh',
  phone: '+880 1XXX-XXXXXX',
  whatsapp: '+880 1XXX-XXXXXX',
  email: 'support@tazumart.bd',
  facebook: '',
  messenger: '',
  googleMapUrl: '',
  contactFormEnabled: true,
  liveChatEnabled: false
};

export default function ContactUsPage() {
  const [data, setData] = useState<ContactData>(DEFAULT_CONTACT_DATA);

  useEffect(() => {
    businessPagesService.getPageData<ContactData>('contact', DEFAULT_CONTACT_DATA).then(res => {
      if (res) setData(res);
    });
  }, []);

  return (
    <PremiumInformationLayout title="Contact Us">
      <PremiumCard>
        <SectionHeader icon={PhoneCall} title="Contact Us" />
        <div className="space-y-6">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">We'd Love to Hear From You</h3>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              If you have any questions, suggestions, or concerns, our support team is always ready to assist you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3.5 px-4 py-3 min-h-[72px] rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                <PhoneCall size={20} />
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Phone</h4>
                <p className="text-black font-semibold text-base leading-tight">{data.phone || DEFAULT_CONTACT_DATA.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3 min-h-[72px] rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Email</h4>
                <p className="text-black font-semibold text-base leading-tight">{data.email || DEFAULT_CONTACT_DATA.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3 min-h-[72px] rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">WhatsApp</h4>
                <p className="text-black font-semibold text-base leading-tight">{data.whatsapp || DEFAULT_CONTACT_DATA.whatsapp}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 px-4 py-3 min-h-[72px] rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Support Hours</h4>
                <p className="text-black font-semibold text-base leading-tight">Sat – Thu: 9:00 AM – 10:00 PM</p>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-3.5 px-4 py-3 min-h-[72px] rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="w-10 h-10 min-w-[40px] rounded-lg bg-black text-white flex items-center justify-center flex-shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider leading-none mb-1">Address</h4>
                <p className="text-black font-semibold text-base leading-tight">{data.companyAddress || DEFAULT_CONTACT_DATA.companyAddress}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/80 text-blue-900 px-4 py-3 rounded-xl text-center text-sm font-medium border border-blue-100">
            Our team aims to respond to every inquiry as quickly as possible.
          </div>
        </div>
      </PremiumCard>
    </PremiumInformationLayout>
  );
}

