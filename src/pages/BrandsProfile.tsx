import React, { useEffect, useState } from 'react';
import { businessPagesService } from '../services/businessPagesService';
import { BrandsData } from './admin/content-pages/AdminBrandsEditor';
import { CheckCircle2, Shield, Globe, Award, MessageCircle, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const DEFAULT_BRANDS_DATA: BrandsData = {
  logo: '',
  banner: '',
  companyName: 'TAZU MART BD',
  ourStory: 'TAZU MART BD is a leading luxury ecommerce platform in Bangladesh providing premier authentic products.',
  mission: 'To make authentic shopping effortless and reliable.',
  vision: 'To be the most trusted online retail destination.',
  whyChooseUs: ['100% Authentic Products', 'Fast Express Delivery', 'Dedicated Customer Support'],
  brandValues: ['Integrity', 'Quality', 'Customer First'],
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

export default function BrandsProfile() {
  const [data, setData] = useState<BrandsData>(DEFAULT_BRANDS_DATA);

  useEffect(() => {
    let isMounted = true;
    businessPagesService.getPageData<BrandsData>('brands', DEFAULT_BRANDS_DATA)
      .then((res) => {
        if (isMounted && res) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn('Failed to load brands profile:', err);
      });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-20 font-sans">
      {/* Banner & Logo */}
      <div className="relative w-full h-80 bg-zinc-900 flex items-center justify-center overflow-hidden">
        {data.banner && <img src={data.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative z-10 flex flex-col items-center">
          {data.logo && (
            <div className="w-32 h-32 bg-white p-4 rounded-full shadow-2xl mb-6">
              <img src={data.logo} alt={data.companyName} className="w-full h-full object-contain" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-white uppercase text-center">{data.companyName || 'Brand Profile'}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-24">
        
        {/* Story, Mission, Vision */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.ourStory && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-1 md:col-span-3 lg:col-span-1 p-8 border border-zinc-200 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Globe className="w-5 h-5" /> Our Story</h2>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{data.ourStory}</p>
            </motion.div>
          )}
          <div className="col-span-1 md:col-span-3 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {data.mission && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 bg-zinc-50 border border-zinc-200">
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Award className="w-5 h-5" /> Mission</h2>
                <p className="text-zinc-600 leading-relaxed whitespace-pre-line">{data.mission}</p>
              </motion.div>
            )}
            {data.vision && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 bg-zinc-900 text-white shadow-lg">
                <h2 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Vision</h2>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">{data.vision}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Why Choose Us & Values */}
        {(data.whyChooseUs?.length > 0 || data.brandValues?.length > 0) && (
          <div className="border-t border-zinc-200 pt-16 grid grid-cols-1 lg:grid-cols-2 gap-16">
            {data.whyChooseUs?.length > 0 && (
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest mb-8">Why Choose Us</h2>
                <div className="space-y-4">
                  {data.whyChooseUs.map((reason, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border border-zinc-200 hover:border-zinc-900 transition-colors">
                      <CheckCircle2 className="w-6 h-6 text-zinc-900 shrink-0" />
                      <p className="font-bold text-zinc-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.brandValues?.length > 0 && (
              <div>
                <h2 className="text-2xl font-black uppercase tracking-widest mb-8">Brand Values</h2>
                <div className="flex flex-wrap gap-3">
                  {data.brandValues.map((value, idx) => (
                    <span key={idx} className="px-6 py-3 bg-zinc-50 border border-zinc-200 text-zinc-900 font-bold uppercase tracking-wider text-sm">
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics */}
        {data.statistics?.length > 0 && (
          <div className="border-t border-zinc-200 pt-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {data.statistics.map((stat, idx) => (
                <div key={idx} className="text-center p-8 bg-zinc-50 border border-zinc-100">
                  <div className="text-4xl font-black text-zinc-900 mb-2">{stat.value}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {data.gallery?.length > 0 && (
          <div className="border-t border-zinc-200 pt-16">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-12 text-center">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {data.gallery.map((img, idx) => (
                <div key={idx} className="aspect-square bg-zinc-100 overflow-hidden">
                  <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories & Certifications */}
        {(data.productCategories?.length > 0 || data.certifications?.length > 0) && (
          <div className="border-t border-zinc-200 pt-16 grid grid-cols-1 md:grid-cols-2 gap-16">
            {data.productCategories?.length > 0 && (
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest mb-6">Product Categories</h2>
                <ul className="space-y-3">
                  {data.productCategories.map((cat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-zinc-600 font-medium">
                      <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" /> {cat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.certifications?.length > 0 && (
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest mb-6">Certifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {data.certifications.map((cert, idx) => (
                    <div key={idx} className="aspect-video bg-zinc-50 border border-zinc-200 p-2 flex items-center justify-center">
                      <img src={cert} alt="Certification" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact Links */}
        <div className="border-t border-zinc-200 pt-16">
          <div className="bg-zinc-900 text-white p-12 text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest mb-8">Connect With Us</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {data.websiteLink && (
                <a href={data.websiteLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 border border-white hover:bg-white hover:text-black font-bold uppercase tracking-wider text-sm transition-colors">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              {data.whatsapp && (
                <a href={`https://wa.me/${data.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#25D366] font-bold uppercase tracking-wider text-sm hover:bg-[#128C7E] transition-colors border border-transparent">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {data.email && (
                <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-6 py-3 border border-white hover:bg-white hover:text-black font-bold uppercase tracking-wider text-sm transition-colors">
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
              {data.call && (
                <a href={`tel:${data.call}`} className="flex items-center gap-2 px-6 py-3 border border-white hover:bg-white hover:text-black font-bold uppercase tracking-wider text-sm transition-colors">
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
