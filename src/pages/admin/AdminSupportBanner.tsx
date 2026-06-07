import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, 
  Type, 
  Link as LinkIcon, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  ArrowRight,
  MessageCircle,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSupportBannerStore } from '../../store/useSupportBannerStore';
import { cn } from '../../lib/utils';

import TemplateDraftBar from '../../components/admin/TemplateDraftBar';

export default function AdminSupportBanner() {
  const { 
    banner, 
    draftBanner,
    isLoading, 
    fetchBanner, 
    updateDraftBanner 
  } = useSupportBannerStore();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  const handleChange = (field: string, value: any) => {
    updateDraftBanner({ [field]: value });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (!draftBanner && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!draftBanner) return null;

  return (
    <div className="space-y-8 pb-32">
      {/* Draft Toolbar (Publish/Save/Reset) */}
      <TemplateDraftBar />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">SUPPORT BANNER</h1>
          <p className="text-gray-500 font-medium tracking-tight">Configure the edge-to-edge promotional banner for the customer support hub.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Editor Side */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
              <Megaphone className="w-4 h-4 text-black" />
              <h3 className="font-black text-black uppercase tracking-wider text-xs">Banner Content Management</h3>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 flex items-center justify-center transition-colors ${draftBanner.status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {draftBanner.status ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider">Banner Status</span>
                </div>
                <button 
                  onClick={() => handleChange('status', !draftBanner.status)}
                  className={cn(
                    "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none",
                    draftBanner.status ? 'bg-black' : 'bg-zinc-300'
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                    draftBanner.status ? 'left-7' : 'left-1'
                  )} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Banner Image
                </label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={draftBanner.banner_image || ''} 
                      onChange={(e) => handleChange('banner_image', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all rounded-none font-bold"
                    />
                  </div>
                  <div className="shrink-0">
                    <input
                      type="file"
                      id="banner-upload"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const { uploadImage } = await import('../../lib/imageUtils');
                          try {
                            const url = await uploadImage(file, 'banners', `support-banner-${Date.now()}`);
                            handleChange('banner_image', url);
                          } catch (error) {
                            console.error('Error uploading image:', error);
                            setError('Failed to upload image');
                            setTimeout(() => setError(null), 3000);
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="banner-upload"
                      className="h-full px-4 flex items-center justify-center bg-black text-white hover:bg-zinc-800 cursor-pointer transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      Upload
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField 
                label="Main Heading" 
                value={draftBanner.heading || ''} 
                onChange={(v) => handleChange('heading', v)}
                icon={Type}
                placeholder="Need Help?"
              />
              <InputField 
                label="Sub Heading" 
                value={draftBanner.sub_heading || ''} 
                onChange={(v) => handleChange('sub_heading', v)}
                icon={Type}
                placeholder="We are here to assist you..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                label="Button Text" 
                value={draftBanner.button_text || ''} 
                onChange={(v) => handleChange('button_text', v)}
                icon={Type}
                placeholder="Track Order"
              />
              <InputField 
                label="Button Link" 
                value={draftBanner.button_link || ''} 
                onChange={(v) => handleChange('button_link', v)}
                icon={LinkIcon}
                placeholder="/orders"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="xl:col-span-5 sticky top-8 h-fit">
        <div className="bg-zinc-100 border border-zinc-200 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <Eye className="w-3 h-3" /> Support Page Preview
          </div>

          <div className="bg-white border p-4 shadow-sm space-y-4">
             {/* Full Width Mock */}
             <div className="w-full relative overflow-hidden bg-zinc-900 min-h-[160px] flex flex-col items-center justify-center text-center p-8">
                {draftBanner.banner_image ? (
                  <img 
                    src={draftBanner.banner_image} 
                    className="absolute inset-0 w-full h-full object-cover opacity-40" 
                    alt="Preview"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="relative z-10 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-purple-400">Tazu Mart Support Desk</span>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{draftBanner.heading || 'Heading'}</h2>
                  <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">{draftBanner.sub_heading || 'Sub heading goes here...'}</p>
                  
                  {draftBanner.button_text && (
                     <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-white text-black font-black uppercase text-[10px] tracking-widest">
                        {draftBanner.button_text} <ArrowRight className="w-3 h-3" />
                     </div>
                  )}
                </div>
             </div>
               
               <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4 h-24 bg-zinc-100 animate-pulse" />
                  <div className="col-span-8 h-24 bg-zinc-100 animate-pulse" />
               </div>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 border-l-4 border-l-black">
               <p className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">
                 * The banner will be displayed at full viewport width at the top of the Support Hub. Use high-resolution landscape images for the best visual impact.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-zinc-900 border border-zinc-800 text-white px-6 py-4 flex items-center gap-3 shadow-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-bold text-sm tracking-tight uppercase">Support Banner Updated Successfully!</span>
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-[100] bg-red-600 text-white px-6 py-4 flex items-center gap-3 shadow-2xl"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold text-sm tracking-tight uppercase">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InputField({ label, value, onChange, icon: Icon, placeholder = '' }: { label: string, value: string, onChange: (v: string) => void, icon: any, placeholder?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <Icon className="w-3 h-3" /> {label}
      </label>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all rounded-none font-bold"
      />
    </div>
  );
}
