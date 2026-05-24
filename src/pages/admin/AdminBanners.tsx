import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon, 
  Upload, 
  ChevronDown, 
  Layout, 
  Eye, 
  Smartphone, 
  Monitor,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  X
} from 'lucide-react';
import { useBannerStore, Banner } from '../../store/useBannerStore';
import { useProductStore } from '../../store/useProductStore';
import { motion, AnimatePresence } from 'framer-motion';

const BUTTON_TEXT_OPTIONS = [
  'Shop Now', 'Visit Now', 'Buy Now', 'Explore', 'Order Now', 'View Product', 'Check Offer', 'Limited Deal'
];

const RATIO_CLASS = "aspect-[16/6]";

export default function AdminBanners() {
  const { banners, updateBanner, addBanner, removeBanner, reorderBanners, setBanners } = useBannerStore();
  const { products } = useProductStore();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Monitor if last banner is filled to add a new one automatically
  useEffect(() => {
    const lastBanner = banners[banners.length - 1];
    if (lastBanner && (lastBanner.image || lastBanner.name)) {
      addBanner();
    }
  }, [banners, addBanner]);

  const handleSave = () => {
    setIsSaving(true);
    // In a real app, this would hit an API
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">Banner Management</h2>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest flex items-center gap-2">
            <Layout className="w-3 h-3 text-purple-600" /> Professional Dynamic E-commerce Banner System
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-gray-100 p-1 rounded-sm border border-gray-200">
              <button className="px-3 py-1.5 bg-white text-[10px] font-black uppercase tracking-widest text-black shadow-sm flex items-center gap-2">
                <Monitor className="w-3 h-3" /> Desktop
              </button>
              <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Smartphone className="w-3 h-3" /> Mobile
              </button>
           </div>
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {banners.map((banner, index) => (
            <BannerFormBlock 
              key={banner.id}
              banner={banner}
              index={index}
              totalBanners={banners.length}
              products={products}
              onUpdate={(updates) => updateBanner(banner.id, updates)}
              onRemove={() => removeBanner(banner.id)}
              onMoveUp={() => index > 0 && reorderBanners(index, index - 1)}
              onMoveDown={() => index < banners.length - 1 && reorderBanners(index, index + 1)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/95 backdrop-blur-md border border-white/10 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between"
        >
          <div className="hidden sm:block">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Ready</p>
             <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight">Active Config v2.4</p>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-12 py-3 bg-purple-600 text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 hover:translate-y-[-2px] active:translate-y-[0px] ${isSaving ? 'opacity-50' : 'hover:shadow-[0_10px_20px_rgba(147,51,234,0.3)]'}`}
          >
            {isSaving ? 'Processing...' : saveSuccess ? (
              <>SAVED SUCCESSFULLY <CheckCircle2 className="w-4 h-4" /></>
            ) : (
              <>SAVE ALL BANNERS <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function BannerFormBlock({ banner, index, totalBanners, products, onUpdate, onRemove, onMoveUp, onMoveDown }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedProduct = products.find((p: any) => p.id === banner.connectedProductId);
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white border ${banner.image || banner.name ? 'border-[#EEEEEE]' : 'border-dashed border-gray-300'} shadow-sm group relative overflow-hidden`}
    >
      {/* Header / Numbering */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
           <div className={`w-8 h-8 ${banner.image || banner.name ? 'bg-black' : 'bg-gray-200'} text-white flex items-center justify-center font-black text-xs`}>
             {index + 1}
           </div>
           <h3 className={`text-xs font-black uppercase tracking-widest ${banner.image || banner.name ? 'text-black' : 'text-gray-400'}`}>
             Banner {index + 1} {banner.name && `• ${banner.name}`}
           </h3>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-2 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
           >
             <ArrowUp className="w-4 h-4" />
           </button>
           <button 
            onClick={onMoveDown}
            disabled={index === totalBanners - 1}
            className="p-2 text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
           >
             <ArrowDown className="w-4 h-4" />
           </button>
           <button 
            onClick={onRemove}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Left */}
          <div className="space-y-8">
            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Banner Wide Image (16:6)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`group/upload relative overflow-hidden bg-[#F9F9FB] border-2 border-dashed border-[#EEEEEE] hover:border-purple-300 transition-all cursor-pointer ${RATIO_CLASS} flex flex-col items-center justify-center`}
              >
                {banner.image ? (
                  <>
                    <img src={banner.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                       <div className="bg-white/10 backdrop-blur-md px-6 py-3 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                         <Upload className="w-3.5 h-3.5" /> RE-UPLOAD IMAGE
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-white border border-gray-100 shadow-sm flex items-center justify-center mx-auto mb-4 group-hover/upload:scale-110 transition-transform">
                       <Upload className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 mb-1">Upload Banner Image</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">JPG, PNG, WEBP • Max 2MB</p>
                  </div>
                )}
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </div>
            </div>

            {/* Banner Name & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Banner Title Name</label>
                <input 
                  type="text" 
                  value={banner.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  placeholder="e.g. Summer Collection"
                  className="w-full px-4 py-3 bg-[#F9F9FB] border border-[#EEEEEE] focus:outline-none focus:border-purple-500 font-bold text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Status</label>
                <div className="flex bg-[#F9F9FB] p-1 border border-[#EEEEEE]">
                  {(['active', 'draft', 'hidden'] as const).map((s) => (
                    <button 
                      key={s}
                      onClick={() => onUpdate({ status: s })}
                      className={`flex-1 py-2 text-[8px] font-black uppercase tracking-widest transition-all ${banner.status === s ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button Toggle */}
            <div className="bg-gray-50/50 border border-gray-100 p-6 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`p-1.5 ${banner.buttonEnabled ? 'bg-purple-600' : 'bg-gray-300'} text-white rounded-xs`}>
                        <ExternalLink className="w-3.5 h-3.5" />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-black">Action Button</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Enable clickable button on banner</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => onUpdate({ buttonEnabled: !banner.buttonEnabled })}
                    className={`relative w-10 h-5 transition-colors focus:outline-none ${banner.buttonEnabled ? 'bg-purple-600' : 'bg-gray-300'} rounded-full p-1`}
                  >
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${banner.buttonEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
               </div>

               {banner.buttonEnabled && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-6 pt-4 border-t border-gray-100"
                  >
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Button Text</label>
                          <div className="relative">
                            <select 
                              value={banner.isCustomButtonText ? 'custom' : banner.buttonText}
                              onChange={(e) => {
                                if (e.target.value === 'custom') {
                                  onUpdate({ isCustomButtonText: true });
                                } else {
                                  onUpdate({ buttonText: e.target.value, isCustomButtonText: false });
                                }
                              }}
                              className="w-full px-4 py-3 bg-white border border-[#EEEEEE] focus:outline-none focus:border-purple-500 font-bold text-xs appearance-none pr-10"
                            >
                              {BUTTON_TEXT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              <option value="custom">Custom Text...</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>

                        {banner.isCustomButtonText && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Custom Button Text</label>
                            <input 
                              type="text" 
                              value={banner.buttonText}
                              onChange={(e) => onUpdate({ buttonText: e.target.value })}
                              className="w-full px-4 py-4 bg-white border border-[#EEEEEE] focus:outline-none focus:border-purple-500 font-bold text-xs"
                              autoFocus
                            />
                          </div>
                        )}
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Website Product (Redirect Link)</label>
                        <div className="relative">
                           <button 
                            onClick={() => setIsProductPickerOpen(!isProductPickerOpen)}
                            className={`w-full px-4 py-3 bg-white border border-[#EEEEEE] text-left flex items-center justify-between font-bold text-xs ${banner.connectedProductId ? 'text-black' : 'text-gray-400'}`}
                           >
                             <div className="flex items-center gap-2 truncate">
                                {selectedProduct && (
                                  <img src={selectedProduct.image} className="w-5 h-5 object-cover rounded-xs border border-gray-100" />
                                )}
                                {selectedProduct ? selectedProduct.name : 'Select a product to connect...'}
                             </div>
                             <ChevronDown className="w-4 h-4 text-gray-400" />
                           </button>

                           <AnimatePresence>
                              {isProductPickerOpen && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setIsProductPickerOpen(false)}></div>
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full mb-2 left-0 right-0 max-h-[300px] overflow-hidden bg-white border border-gray-200 shadow-2xl z-20 flex flex-col"
                                  >
                                    <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                                       <Search className="w-3.5 h-3.5 text-gray-400" />
                                       <input 
                                        type="text" 
                                        placeholder="Search products..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="bg-transparent border-none focus:outline-none text-xs font-bold w-full"
                                        autoFocus
                                       />
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                       {filteredProducts.length > 0 ? (
                                         filteredProducts.map((p: any) => (
                                           <button 
                                            key={p.id}
                                            onClick={() => {
                                              onUpdate({ connectedProductId: p.id });
                                              setIsProductPickerOpen(false);
                                            }}
                                            className="w-full p-3 flex items-center gap-3 hover:bg-purple-50 transition-all border-b border-gray-50 text-left"
                                           >
                                              <img src={p.image} className="w-8 h-8 object-cover border border-gray-100" />
                                              <div>
                                                <p className="text-[10px] font-black text-gray-900 leading-tight truncate">{p.name}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">SKU: {p.sku}</p>
                                              </div>
                                           </button>
                                         ))
                                       ) : (
                                          <div className="p-8 text-center">
                                            <AlertCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">No products found</p>
                                          </div>
                                       )}
                                    </div>
                                  </motion.div>
                                </>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                  </motion.div>
               )}
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mini Live Preview</label>
               <span className="text-[8px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 border border-gray-200 rounded-full">REAL-TIME</span>
            </div>
            
            <div className={`bg-gray-50 border border-gray-200 p-8 flex items-center justify-center flex-1`}>
               <div className={`w-full relative shadow-2xl overflow-hidden ${RATIO_CLASS} bg-white group/preview`}>
                  {banner.image ? (
                    <img src={banner.image} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#FAFAFA] flex items-center justify-center border-4 border-white">
                       <ImageIcon className="w-12 h-12 text-gray-100" />
                    </div>
                  )}

                  {/* Overlay Content */}
                  <div className="absolute inset-x-8 bottom-8 flex flex-col items-start gap-3">
                     {banner.name && (
                        <motion.div 
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="bg-black text-white px-4 py-2 font-black uppercase tracking-tighter text-sm md:text-lg shadow-xl"
                        >
                          {banner.name}
                        </motion.div>
                     )}
                     
                     {banner.buttonEnabled && banner.buttonText && (
                        <motion.button 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="px-6 py-2.5 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-900/40 hover:scale-105 transition-transform"
                        >
                          {banner.buttonText}
                        </motion.button>
                     )}
                  </div>

                  {/* Connected Info Badge */}
                  {selectedProduct && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 border border-gray-200 flex items-center gap-2 shadow-lg">
                       <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                       <span className="text-[8px] font-black text-black uppercase tracking-widest">LINKED TO {selectedProduct.sku}</span>
                    </div>
                  )}
               </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-gray-50 border border-gray-100 flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-gray-400 font-black" />
                    <div>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Desktop Scaling</p>
                       <p className="text-[10px] font-bold text-gray-900">Adaptive (16:6)</p>
                    </div>
                 </div>
                 <div className="p-4 bg-gray-50 border border-gray-100 flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-gray-400 font-black" />
                    <div>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Mobile Scaling</p>
                       <p className="text-[10px] font-bold text-gray-900">Fluid Optimized</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
