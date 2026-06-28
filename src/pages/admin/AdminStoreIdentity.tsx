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
  Loader2
} from 'lucide-react';
import { useSettingsStore, AppSettings } from '../../store/useSettingsStore';

export default function AdminStoreIdentity() {
  const { settings, updateSettings, updateDraftSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states loaded from store
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [storeSlug, setStoreSlug] = useState(settings.storeSlug || '');
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline || '');
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail || '');
  const [contactNumber, setContactNumber] = useState(settings.contactNumber || '');
  const [websiteUrl, setWebsiteUrl] = useState(settings.websiteUrl || '');
  const [timezone, setTimezone] = useState(settings.timezone || 'Asia/Dhaka (GMT+6)');
  const [businessType, setBusinessType] = useState(settings.businessType || 'Retail E-commerce');

  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || '');
      setStoreSlug(settings.storeSlug || '');
      setStoreTagline(settings.storeTagline || '');
      setStoreEmail(settings.storeEmail || '');
      setContactNumber(settings.contactNumber || '');
      setWebsiteUrl(settings.websiteUrl || '');
      setTimezone(settings.timezone || 'Asia/Dhaka (GMT+6)');
      setBusinessType(settings.businessType || 'Retail E-commerce');
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
      storeTagline,
      storeEmail,
      contactNumber,
      websiteUrl,
      timezone,
      businessType
    };

    try {
      // Keep settings and draft settings updated in parallel
      await updateSettings(updates);
      updateDraftSettings(updates);
      triggerFeedback('🏢 Store identity parameters updated successfully!');
    } catch (err) {
      console.error(err);
      triggerFeedback('❌ Failed to update store identity parameters');
    } finally {
      setIsSaving(false);
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
            <Store className="w-6 h-6 text-purple-650" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              🏢 STORE IDENTITY CONFIGURATION
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            Define basic store demographics, meta descriptions, operational taglines, and system identification slugs.
          </p>
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
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Store Description / Operating Tagline</label>
                <input 
                  type="text" 
                  value={storeTagline} 
                  onChange={(e) => setStoreTagline(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-bold" 
                  placeholder="e.g. Premium quality gadgets, attire and daily essentials."
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
