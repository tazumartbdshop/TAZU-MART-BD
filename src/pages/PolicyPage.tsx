import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { businessPagesService } from '../services/businessPagesService';
import { Shield, FileText, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PolicyPage({ type }: { type: 'privacy' | 'terms' | 'refund' }) {
  const [data, setData] = useState<{ banner: string; sections: { title: string; content: string }[] } | null>(null);

  useEffect(() => {
    if (type) {
      businessPagesService.getPageData(type, { banner: '', sections: [] }).then(setData);
    }
  }, [type]);

  if (!data) return <div className="min-h-screen bg-white" />;

  const titles: Record<string, { title: string; icon: any }> = {
    privacy: { title: 'Privacy Policy', icon: Shield },
    terms: { title: 'Terms & Conditions', icon: FileText },
    refund: { title: 'Refund Policy', icon: RefreshCcw }
  };
  const current = titles[type || ''] || { title: 'Policy', icon: FileText };
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-20 font-sans">
      {/* Banner */}
      <div className="relative w-full h-64 bg-zinc-900 flex items-center justify-center overflow-hidden">
        {data.banner && <img src={data.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="relative z-10 flex flex-col items-center text-white">
          <Icon className="w-12 h-12 mb-4" />
          <h1 className="text-4xl font-black tracking-widest uppercase">{current.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {data.sections.length > 0 ? (
          <div className="space-y-12">
            {data.sections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-zinc-200 p-8 shadow-sm"
              >
                <h2 className="text-xl font-black tracking-widest uppercase mb-6 pb-4 border-b border-zinc-100">{section.title}</h2>
                <div className="prose prose-zinc max-w-none">
                  {section.content.split('\n').map((para, pIdx) => (
                    <p key={pIdx} className="text-zinc-600 leading-relaxed mb-4">{para}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400 font-bold uppercase">Content coming soon</div>
        )}
      </div>
    </div>
  );
}
