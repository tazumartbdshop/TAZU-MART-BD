import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Save, 
  Info, 
  Check, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Building,
  Loader2,
  Image as ImageIcon,
  Upload,
  Trash2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useSettingsStore, AppSettings } from '../../store/useSettingsStore';
import { toast } from 'react-hot-toast';
import { uploadImage } from '../../lib/imageUtils';

export default function AdminStoreIdentity() {
  const { settings, updateSettings, updateDraftSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states loaded from store
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [storeSlug, setStoreSlug] = useState(settings.storeSlug || '');
  const [storeDescription, setStoreDescription] = useState(settings.storeDescription || '');
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline || '');
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail || '');
  const [contactNumber, setContactNumber] = useState(settings.contactNumber || '');
  const [websiteUrl, setWebsiteUrl] = useState(settings.websiteUrl || '');
  const [timezone, setTimezone] = useState(settings.timezone || '');
  const [businessType, setBusinessType] = useState(settings.businessType || '');
  const [storeLogo, setStoreLogo] = useState(settings.storeLogo || '');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setStoreSlug(settings.storeSlug || '');
      setStoreDescription(settings.storeDescription || '');
      setStoreTagline(settings.storeTagline || '');
      setStoreEmail(settings.storeEmail || '');
      setContactNumber(settings.contactNumber || '');
      setWebsiteUrl(settings.websiteUrl || '');
      setTimezone(settings.timezone || '');
      setBusinessType(settings.businessType || '');
      setStoreLogo(settings.storeLogo || '');
    }
  }, [settings]);

  const triggerFeedback = (message: string) => {
    setSaveFeedback(message);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updates = {
      storeName,
      storeSlug,
      storeDescription,
      storeTagline,
      storeEmail,
      contactNumber,
      websiteUrl,
      timezone,
      businessType
    };

    try {
      // Keep settings and draft settings updated in parallel
      const updatesWithLogo = { ...updates, storeLogo };
      
      await toast.promise(
        updateSettings(updatesWithLogo),
        {
          loading: 'Saving to Database Table: store_identity...',
          success: '🏢 Store identity successfully verified and saved globally!',
          error: (err) => `${err?.message || 'Failed to update store identity'}`
        }
      );
      
      updateDraftSettings(updatesWithLogo);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const downloadUrl = await uploadImage(file, 'branding', `master_logo_${Date.now()}`);
      setStoreLogo(downloadUrl);
      toast.success('Professional logo uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    if (window.confirm('Are you sure you want to remove the master logo? This will affect branding across the entire site.')) {
      setStoreLogo('');
      toast.success('Logo removed from draft');
    }
  };

  return (
    <div id="admin-store-identity-page" className="space-y-6 max-w-4xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* Toast Feedback Notification */}
      {saveFeedback && (
        <div id="toast-store-identity-success" className="fixed top-20 right-6 z-[110] bg-neutral-900 text-white border border-neutral-800 px-4 py-3 shadow-xl flex items-center gap-2.5 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">{saveFeedback}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6 text-neutral-800" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              🏢 STORE IDENTITY CONFIGURATION
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            Define basic store demographics, meta descriptions, operational taglines, and system identification slugs.
          </p>
        </div>
      </div>

      {/* NEW: Professional Master Logo Section */}
      <div className="bg-white border border-neutral-200 p-6 shadow-sm overflow-hidden group">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
           <div className="p-2 bg-neutral-900 text-white">
             <Sparkles className="w-4 h-4" />
           </div>
           <div>
             <h3 className="text-xs font-black uppercase text-neutral-950 tracking-widest">MASTER BRANDING LOGO</h3>
             <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5 tracking-tight">Single Source of Truth for your global website branding.</p>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
           {/* Logo Preview Container */}
           <div className="w-48 h-48 bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center relative group/preview rounded-lg overflow-hidden shrink-0">
             {storeLogo ? (
               <img 
                 src={storeLogo} 
                 alt="Store Logo" 
                 className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover/preview:scale-110" 
                 referrerPolicy="no-referrer"
               />
             ) : (
               <div className="flex flex-col items-center justify-center text-neutral-300 gap-2">
                 <ImageIcon className="w-10 h-10" />
                 <span className="text-[9px] font-black uppercase tracking-widest">NO LOGO ACTIVE</span>
               </div>
             )}

             {isUploading && (
               <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-2 z-20">
                 <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
                 <span className="text-[9px] font-black uppercase text-neutral-900">Uploading...</span>
               </div>
             )}
           </div>

           {/* Controls Container */}
           <div className="flex-1 space-y-5">
             <div className="space-y-1">
               <h4 className="text-sm font-black text-neutral-900 uppercase tracking-tight">Website Primary Logo</h4>
               <p className="text-xs text-neutral-500 font-semibold leading-relaxed uppercase">
                 This logo will be used across your entire ecosystem including headers, invoices, emails, and mobile apps.
               </p>
             </div>

             <div className="flex flex-wrap items-center gap-3">
               <label className="bg-neutral-900 hover:bg-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer select-none flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50">
                 <Upload className="w-3.5 h-3.5" />
                 <span>{storeLogo ? 'Replace Master Logo' : 'Upload Master Logo'}</span>
                 <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleLogoUpload}
                   disabled={isUploading}
                 />
               </label>

               {storeLogo && (
                 <button
                   type="button"
                   onClick={handleRemoveLogo}
                   className="bg-white hover:bg-rose-50 text-rose-600 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] border border-neutral-200 hover:border-rose-200 transition-all flex items-center gap-2"
                 >
                   <Trash2 className="w-3.5 h-3.5" />
                   <span>Remove Logo</span>
                 </button>
               )}
             </div>

             <div className="pt-4 border-t border-neutral-50 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Recommended: 512x512 PNG/SVG</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">Automatic Site-Wide Updates</span>
                </div>
             </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Helper Sidecard */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2 pb-3 border-b border-neutral-100">
              <ShieldCheck className="w-4 h-4 text-neutral-500" />
              SYSTEM COMPLIANCE
            </h3>
            
            <p className="text-xs text-neutral-500 leading-relaxed font-semibold uppercase">
              These identification attributes guide checkout systems, dynamic PDF invoice templates, automated headers, and search crawlers.
            </p>

            <div className="bg-neutral-50 p-3 text-[10.5px] text-neutral-500 leading-relaxed space-y-1.5 font-sans">
              <span className="font-extrabold text-[11px] block uppercase text-neutral-700">Store slug note:</span>
              <p>
                Store ID act as a localized slug parameter. Avoid spaces, symbols, or accented characters to prevent URL redirection bugs.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Fields Form */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-5">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-neutral-500" />
              STORE ESSENTIAL DETAILS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Store Name</label>
                <input 
                  type="text" 
                  value={storeName} 
                  onChange={(e) => setStoreName(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Tazu Mart BD"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Store ID / Code Slug</label>
                <input 
                  type="text" 
                  value={storeSlug} 
                  onChange={(e) => setStoreSlug(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs font-mono focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. tazumart"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Store Tagline (Small Hook)</label>
                <input 
                  type="text" 
                  value={storeTagline} 
                  onChange={(e) => setStoreTagline(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Quality products for your daily life."
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Detailed Store Description</label>
                <textarea 
                  value={storeDescription} 
                  onChange={(e) => setStoreDescription(e.target.value)} 
                  className="w-full min-h-[100px] border border-neutral-200 p-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold resize-none" 
                  placeholder="e.g. Tazu Mart BD is a premier e-commerce destination in Bangladesh focusing on electronics and lifestyle products."
                />
              </div>
            </div>

            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pt-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-neutral-500" />
              CONTACT INFORMATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Support / Contact Email Address</label>
                <input 
                  type="email" 
                  value={storeEmail} 
                  onChange={(e) => setStoreEmail(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. support@tazumartbd.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Primary Hot-line / Contact Number</label>
                <input 
                  type="text" 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. +880 1711223344"
                  required
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Store Website Address URL</label>
                <input 
                  type="url" 
                  value={websiteUrl} 
                  onChange={(e) => setWebsiteUrl(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. https://tazumartbd.com"
                />
              </div>
            </div>

            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pt-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-500" />
              DEMOGRAPHICS & OPERATIONS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Operation Timezone</label>
                <select 
                  value={timezone} 
                  onChange={(e) => setTimezone(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900"
                >
                  <option value="">Select Timezone...</option>
                  <option value="Asia/Dhaka (GMT+6)">Asia/Dhaka (GMT+6)</option>
                  <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
                  <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Industry / Business Classification</label>
                <select 
                  value={businessType} 
                  onChange={(e) => setBusinessType(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900"
                >
                  <option value="">Select Industry...</option>
                  <option value="Retail E-commerce">Retail E-commerce</option>
                  <option value="Wholesale B2B">Wholesale B2B</option>
                  <option value="Services">Services & digital distribution</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-neutral-900 hover:bg-black text-white h-11 px-8 text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none flex items-center justify-center gap-2 disabled:bg-neutral-500 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save Store Identity</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
