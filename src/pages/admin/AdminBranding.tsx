import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2,
  Lock,
  Compass
} from 'lucide-react';
import { useSettingsStore, AppSettings } from '../../store/useSettingsStore';

export default function AdminBranding() {
  const { settings, updateSettings, updateDraftSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Form states loaded from store
  const [storeLogo, setStoreLogo] = useState(settings.storeLogo || '');
  const [favicon, setFavicon] = useState(settings.favicon || '');
  const [mobileSplash, setMobileSplash] = useState(settings.mobileSplash || '');
  const [invoiceLogo, setInvoiceLogo] = useState(settings.invoiceLogo || '');
  const [packagingLogo, setPackagingLogo] = useState(settings.packagingLogo || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#000000');
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor || '#666666');

  useEffect(() => {
    if (settings) {
      setStoreLogo(settings.storeLogo || '');
      setFavicon(settings.favicon || '');
      setMobileSplash(settings.mobileSplash || '');
      setInvoiceLogo(settings.invoiceLogo || '');
      setPackagingLogo(settings.packagingLogo || '');
      setPrimaryColor(settings.primaryColor || '#000000');
      setSecondaryColor(settings.secondaryColor || '#666666');
    }
  }, [settings]);

  const triggerFeedback = (message: string) => {
    setSaveFeedback(message);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  const handleUpdate = (field: string, value: string) => {
    if (field === 'storeLogo') setStoreLogo(value);
    if (field === 'favicon') setFavicon(value);
    if (field === 'mobileSplash') setMobileSplash(value);
    if (field === 'invoiceLogo') setInvoiceLogo(value);
    if (field === 'packagingLogo') setPackagingLogo(value);
    if (field === 'primaryColor') setPrimaryColor(value);
    if (field === 'secondaryColor') setSecondaryColor(value);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = {
      storeLogo,
      favicon,
      mobileSplash,
      invoiceLogo,
      packagingLogo,
      primaryColor,
      secondaryColor
    };

    updateSettings(updates);
    updateDraftSettings(updates);

    triggerFeedback('🎨 Branding assets saved successfully!');
  };

  const ImageUpload = ({ label, value, field }: { label: string, value: string, field: string }) => (
    <div className="bg-neutral-50 p-4 border border-neutral-200 flex flex-col sm:flex-row items-center gap-4">
      <div className="w-16 h-16 bg-white border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0 select-none">
        {value ? (
          <img src={value} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        ) : (
          <ImageIcon className="w-6 h-6 text-neutral-400" />
        )}
      </div>

      <div className="flex-1 w-full text-center sm:text-left">
        <span className="block text-[10.5px] font-black uppercase text-neutral-800 mb-1.5 tracking-wider">{label}</span>
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <label className="bg-neutral-900 hover:bg-black text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer select-none">
            Upload
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => handleUpdate(field, reader.result as string);
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => handleUpdate(field, '')}
              className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-rose-200"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div id="admin-branding-page" className="space-y-6 max-w-4xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* Toast Feedback Notification */}
      {saveFeedback && (
        <div id="toast-branding-success" className="fixed top-20 right-6 z-[110] bg-neutral-900 text-white border border-neutral-800 px-4 py-3 shadow-xl flex items-center gap-2.5 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">{saveFeedback}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-purple-650" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              🎨 BRANDING & VISUAL ASSETS
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            Upload logotypes, favicons, invoices banners, packaging stickers, and define storefront theme palette styles.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Helper Sidecard */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Compass className="w-4 h-4 text-neutral-500" />
              THEME INFLUENCE
            </h3>
            
            <p className="text-xs text-neutral-500 leading-relaxed font-semibold uppercase">
              Brand Colors and Logos immediately populate Checkout, invoice prints, header layouts, emails, and client browser tabs instantly.
            </p>

            <div className="bg-neutral-50 p-3 text-[10.5px] text-neutral-500 leading-relaxed space-y-2 font-sans border border-neutral-200">
              <span className="font-extrabold text-[11px] block uppercase text-neutral-700">Logo guidelines:</span>
              <p>
                Transparent PNG layout is strictly recommended for Store Logo and Invoice Logos to maintain premium contrast backgrounds.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Fields Form */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-5">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-500" />
              PRIMARY BRAND SYMBOLS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload label="Store Primary Logo" value={storeLogo} field="storeLogo" />
              <ImageUpload label="Browser Favicon Icon" value={favicon} field="favicon" />
            </div>

            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pt-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-neutral-500" />
              THEME COLORS PALETTE
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Primary Brand Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="w-12 h-11 border border-neutral-200 p-0.5 bg-white cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)} 
                    className="flex-1 h-11 border border-neutral-200 px-3 text-xs font-mono font-bold text-neutral-950 uppercase focus:outline-none" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Secondary Accent Color</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)} 
                    className="w-12 h-11 border border-neutral-200 p-0.5 bg-white cursor-pointer" 
                  />
                  <input 
                    type="text" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)} 
                    className="flex-1 h-11 border border-neutral-200 px-3 text-xs font-mono font-bold text-neutral-950 uppercase focus:outline-none" 
                  />
                </div>
              </div>
            </div>

            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pt-4 pb-2 border-b border-neutral-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-neutral-500" />
              AUXILIARY BRAND ASSETS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload label="Invoice Logo" value={invoiceLogo} field="invoiceLogo" />
              <ImageUpload label="Packaging Sticker Logo" value={packagingLogo} field="packagingLogo" />
              <div className="sm:col-span-2">
                <ImageUpload label="Mobile Application Splash Screen Logo" value={mobileSplash} field="mobileSplash" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                className="bg-neutral-900 hover:bg-black text-white h-11 px-8 text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save Branding Config</span>
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
