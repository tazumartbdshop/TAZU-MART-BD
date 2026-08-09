import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { businessPagesService } from '../services/businessPagesService';
import { Shield, FileText, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PolicyPage({ type: propType }: { type?: 'privacy' | 'terms' | 'refund' }) {
  const params = useParams<{ type?: string; slug?: string }>();
  const type = propType || (params.type as 'privacy' | 'terms' | 'refund') || 'privacy';

  const [data, setData] = useState<{ banner: string; sections: { title: string; content: string }[] }>({
    banner: '',
    sections: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    businessPagesService.getPageData(type, { banner: '', sections: [] })
      .then((res) => {
        if (isMounted && res) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn('Failed to load policy page:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [type]);

  const titles: Record<string, { title: string; icon: any }> = {
    privacy: { title: 'Privacy Policy', icon: Shield },
    terms: { title: 'Terms & Conditions', icon: FileText },
    refund: { title: 'Refund Policy', icon: RefreshCcw }
  };
  const current = titles[type] || { title: 'Privacy Policy', icon: Shield };
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-white text-zinc-900 pb-20 font-sans">
      {/* Banner */}
      <div className="relative w-full h-52 sm:h-64 bg-zinc-900 flex items-center justify-center overflow-hidden">
        {data.banner && <img src={data.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
        <div className="relative z-10 flex flex-col items-center text-white px-4 text-center">
          <Icon className="w-10 h-10 sm:w-12 sm:h-12 mb-3" />
          <h1 className="text-2xl sm:text-4xl font-black tracking-widest uppercase">{current.title}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Loading Policy Content...</p>
          </div>
        ) : data.sections && data.sections.length > 0 ? (
          <div className="space-y-6 sm:space-y-8">
            {data.sections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-2xl shadow-xs"
              >
                <h2 className="text-lg sm:text-xl font-black tracking-wider uppercase mb-4 pb-3 border-b border-zinc-100">{section.title}</h2>
                <div className="prose prose-zinc max-w-none text-sm sm:text-base leading-relaxed text-zinc-700">
                  {section.content.split('\n').map((para, pIdx) => (
                    <p key={pIdx} className="mb-3">{para}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
            <h2 className="text-xl font-black text-black uppercase tracking-wider">{current.title}</h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              We are committed to protecting your privacy, data security, and rights. Please contact our support team if you have any questions regarding our terms or policy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

