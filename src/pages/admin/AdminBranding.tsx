import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Save, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2,
  Lock,
  Compass,
  Loader2,
  Globe,
  Upload,
  Layers,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Share2,
  Check,
  RefreshCw
} from 'lucide-react';
import { useBrandingStore } from '../../store/useBrandingStore';
import { BrandingSettings } from '../../services/brandingService';
import { toast } from 'react-hot-toast';

export default function AdminBranding() {
  const { settings, isLoading, updateBranding, fetchBranding } = useBrandingStore();
  
  // Local state for all fields
  const [formData, setFormData] = useState<BrandingSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'logos' | 'images' | 'theme' | 'seo' | 'social' | 'general'>('general');
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  const handleFieldChange = (field: keyof BrandingSettings, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof BrandingSettings) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(field as string);
    try {
      const { uploadImage } = await import('../../lib/imageUtils');
      const downloadUrl = await uploadImage(file, 'branding', `${field as string}_${Date.now()}`);
      
      handleFieldChange(field, downloadUrl);
      toast.success(`${formatLabel(field as string)} uploaded!`);
      
      // Auto save on upload
      await updateBranding({ [field]: downloadUrl });
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload asset');
    } finally {
      setIsUploading(null);
    }
  };

  const handleDeleteAsset = async (field: keyof BrandingSettings) => {
    if (window.confirm(`Are you sure you want to remove the ${formatLabel(field as string)}?`)) {
      try {
        handleFieldChange(field, '');
        await updateBranding({ [field]: '' });
        toast.success(`${formatLabel(field as string)} removed successfully!`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to remove asset');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBranding(formData);
      toast.success('🎨 Branding & Logo settings updated successfully across the site!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const formatLabel = (key: string): string => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const ImageUploadField = ({ field, helpText }: { field: keyof BrandingSettings; helpText?: string }) => {
    const value = formData[field] as string;
    const isThisUploading = isUploading === field;

    return (
      <div className="bg-neutral-50 p-4 border border-neutral-200 flex flex-col sm:flex-row items-center gap-4 hover:border-neutral-300 transition-colors">
        <div className="w-20 h-20 bg-white border border-neutral-200 flex items-center justify-center overflow-hidden shrink-0 select-none relative rounded">
          {value ? (
            <img src={value} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400 gap-1">
              <ImageIcon className="w-6 h-6" />
              <span className="text-[9px] font-bold">NO IMAGE</span>
            </div>
          )}
          {isThisUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-black" />
            </div>
          )}
        </div>

        <div className="flex-1 w-full text-center sm:text-left space-y-1">
          <span className="block text-xs font-black uppercase text-neutral-800 tracking-wider">
            {formatLabel(field as string)}
          </span>
          {helpText && (
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-tight">{helpText}</p>
          )}
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
            <label className={`bg-neutral-900 hover:bg-black text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer select-none flex items-center gap-1.5 ${isThisUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <Upload className="w-3 h-3" />
              <span>{value ? 'Replace' : 'Upload'}</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                disabled={isThisUploading || isUploading !== null}
                onChange={(e) => handleFileSelect(e, field)} 
              />
            </label>
            {value && (
              <button
                type="button"
                onClick={() => handleDeleteAsset(field)}
                className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border border-rose-200 flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="admin-branding-page" className="space-y-6 max-w-6xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* Header */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-neutral-850" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              TAZU MART BD BRANDING DATABASE
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            Centrally manage all store logotypes, assets, theme layouts, and colors from a unified database.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => fetchBranding()}
            className="border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 h-10 px-4 text-xs font-black uppercase tracking-wider flex items-center gap-2 select-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Tabs Selection */}
        <div className="lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`w-full text-left h-11 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 border transition-colors ${
              activeTab === 'general' 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span>General Setup</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('logos')}
            className={`w-full text-left h-11 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 border transition-colors ${
              activeTab === 'logos' 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Logos & Symbols ({Object.keys(formData).filter(k => k.endsWith('logo') || k === 'favicon' || k === 'apple_touch_icon').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`w-full text-left h-11 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 border transition-colors ${
              activeTab === 'images' 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            <span>Fallback Images</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`w-full text-left h-11 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 border transition-colors ${
              activeTab === 'theme' 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>Theme Colors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`w-full text-left h-11 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 border transition-colors ${
              activeTab === 'seo' 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            <SearchIcon className="w-4 h-4 shrink-0" />
            <span>SEO Branding</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`w-full text-left h-11 px-4 text-xs font-black uppercase tracking-widest flex items-center gap-3 border transition-colors ${
              activeTab === 'social' 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>Social Branding</span>
          </button>

          <div className="bg-neutral-50 p-4 border border-neutral-200 space-y-2 mt-4">
            <span className="block text-[10px] font-black uppercase text-neutral-600 tracking-wider">💡 DYNAMIC AUTO-REFRESH</span>
            <p className="text-[10px] text-neutral-400 leading-relaxed uppercase font-semibold">
              When you upload or update branding data, changes instantly reflect on all open customer screens in real-time. No manual refresh or hard reloading needed.
            </p>
          </div>
        </div>

        {/* Right Side: Tab Contents Form */}
        <div className="lg:col-span-9">
          <form onSubmit={handleSave} className="bg-white border border-neutral-200 p-6 space-y-6">
            
            {/* 1. GENERAL IDENTITY */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">GENERAL SITE IDENTITY</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Control site-wide title, display name, and slogan tagline.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Site Name</label>
                    <input 
                      type="text" 
                      value={formData.site_name} 
                      onChange={(e) => handleFieldChange('site_name', e.target.value)}
                      className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold text-neutral-950 focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Site Short Name</label>
                    <input 
                      type="text" 
                      value={formData.site_short_name} 
                      onChange={(e) => handleFieldChange('site_short_name', e.target.value)}
                      className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold text-neutral-950 focus:outline-none" 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Site Tagline</label>
                    <input 
                      type="text" 
                      value={formData.site_tagline} 
                      onChange={(e) => handleFieldChange('site_tagline', e.target.value)}
                      className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold text-neutral-950 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. LOGOS AND SYMBOLS */}
            {activeTab === 'logos' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">DATABASE DRIVEN LOGOTYPES</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">All branding logos must be transparent PNGs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploadField field="primary_logo" helpText="The main branding logo shown in desktop header." />
                  <ImageUploadField field="secondary_logo" helpText="Secondary logotype used as alternative overlay." />
                  <ImageUploadField field="favicon" helpText="Browser tab icon displayed next to title." />
                  <ImageUploadField field="apple_touch_icon" helpText="Favicon icon for Apple bookmark home-screens." />
                  <ImageUploadField field="mobile_logo" helpText="Logo optimized for smart device screen headers." />
                  <ImageUploadField field="desktop_logo" helpText="Logo formatted specifically for standard computer resolutions." />
                  <ImageUploadField field="dark_logo" helpText="Dark version logo for high contrast white/light layouts." />
                  <ImageUploadField field="light_logo" helpText="Bright/White version logo for elegant black layouts." />
                  <ImageUploadField field="footer_logo" helpText="Footer widget branding signature mark." />
                  <ImageUploadField field="invoice_logo" helpText="Brand header logo placed in printable PDF bills." />
                  <ImageUploadField field="email_logo" helpText="High resolution image for mail templates." />
                  <ImageUploadField field="loading_logo" helpText="Splash screen preloader transition spinner logo." />
                  <ImageUploadField field="watermark_logo" helpText="Faded background watermark signature logo." />
                  <ImageUploadField field="share_logo" helpText="Branding logo embedded inside social media link embeds." />
                  <ImageUploadField field="login_logo" helpText="Stunning logo centered on the admin/user Login panel." />
                  <ImageUploadField field="signup_logo" helpText="Branded logo displayed on customer Register form." />
                </div>
              </div>
            )}

            {/* 3. FALLBACK IMAGES */}
            {activeTab === 'images' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">DEFAULT SYSTEM PLACEHOLDERS</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Define fallback assets when custom banners or cover images are empty.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploadField field="default_profile_image" helpText="Avatar placeholder when users have no profile picture." />
                  <ImageUploadField field="default_store_banner" helpText="Fallback image for shop/seller pages." />
                  <ImageUploadField field="default_category_banner" helpText="Default wide banner inside product listing galleries." />
                  <ImageUploadField field="default_product_image" helpText="Fallback thumbnail for inventory without pictures." />
                  <ImageUploadField field="default_blog_banner" helpText="Header cover placeholder inside help blogs." />
                  <ImageUploadField field="og_image" helpText="Default OpenGraph sharing card template asset." />
                </div>
              </div>
            )}

            {/* 4. THEME COLORS */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">THEME BRANDING PALETTES</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Control CSS color declarations dynamically across all pages.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1">
                  
                  {/* Primary Color */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Primary Brand Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formData.primary_color || '#000000'} 
                        onChange={(e) => handleFieldChange('primary_color', e.target.value)} 
                        className="w-12 h-11 border border-neutral-200 p-0.5 bg-white cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={formData.primary_color || '#000000'} 
                        onChange={(e) => handleFieldChange('primary_color', e.target.value)} 
                        className="flex-1 h-11 border border-neutral-200 px-3 text-xs font-mono font-bold text-neutral-950 uppercase focus:outline-none" 
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Secondary Accent Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formData.secondary_color || '#666666'} 
                        onChange={(e) => handleFieldChange('secondary_color', e.target.value)} 
                        className="w-12 h-11 border border-neutral-200 p-0.5 bg-white cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={formData.secondary_color || '#666666'} 
                        onChange={(e) => handleFieldChange('secondary_color', e.target.value)} 
                        className="flex-1 h-11 border border-neutral-200 px-3 text-xs font-mono font-bold text-neutral-950 uppercase focus:outline-none" 
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Special Promo Accent Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formData.accent_color || '#10B981'} 
                        onChange={(e) => handleFieldChange('accent_color', e.target.value)} 
                        className="w-12 h-11 border border-neutral-200 p-0.5 bg-white cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={formData.accent_color || '#10B981'} 
                        onChange={(e) => handleFieldChange('accent_color', e.target.value)} 
                        className="flex-1 h-11 border border-neutral-200 px-3 text-xs font-mono font-bold text-neutral-950 uppercase focus:outline-none" 
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Main Base Text Color</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formData.text_color || '#171717'} 
                        onChange={(e) => handleFieldChange('text_color', e.target.value)} 
                        className="w-12 h-11 border border-neutral-200 p-0.5 bg-white cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={formData.text_color || '#171717'} 
                        onChange={(e) => handleFieldChange('text_color', e.target.value)} 
                        className="flex-1 h-11 border border-neutral-200 px-3 text-xs font-mono font-bold text-neutral-950 uppercase focus:outline-none" 
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Global App Canvas Background</label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formData.background_color || '#FAFAFA'} 
                        onChange={(e) => handleFieldChange('background_color', e.target.value)} 
                        className="w-12 h-11 border border-neutral-200 p-0.5 bg-white cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={formData.background_color || '#FAFAFA'} 
                        onChange={(e) => handleFieldChange('background_color', e.target.value)} 
                        className="flex-1 h-11 border border-neutral-200 px-3 text-xs font-mono font-bold text-neutral-950 uppercase focus:outline-none" 
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* 5. SEO BRANDING */}
            {activeTab === 'seo' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">SEO SEARCH INDEX BRANDING</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Optimize search bot rankings with default dynamic brand headers.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Default Meta Title Template</label>
                    <input 
                      type="text" 
                      value={formData.meta_title} 
                      onChange={(e) => handleFieldChange('meta_title', e.target.value)}
                      className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold text-neutral-950 focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Default Meta Description</label>
                    <textarea 
                      rows={3}
                      value={formData.meta_description} 
                      onChange={(e) => handleFieldChange('meta_description', e.target.value)}
                      className="w-full border border-neutral-200 p-3 text-xs font-bold text-neutral-950 focus:outline-none resize-none" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider">Default Meta Keywords</label>
                    <input 
                      type="text" 
                      value={formData.meta_keywords} 
                      onChange={(e) => handleFieldChange('meta_keywords', e.target.value)}
                      className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold text-neutral-950 focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. SOCIAL BRANDING */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-neutral-100">
                  <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider">SOCIAL MEDIA PLATFORM COVERS</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase mt-0.5">Specialized banner designs for dynamic social card links.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploadField field="facebook_image" helpText="Sharing image optimized specifically for Facebook layouts." />
                  <ImageUploadField field="twitter_image" helpText="Cover template formatted for Twitter post streams." />
                  <ImageUploadField field="linkedin_image" helpText="Branded wallpaper template optimized for LinkedIn profiles." />
                </div>
              </div>
            )}

            {/* Bottom Form Action Buttons */}
            <div className="pt-5 border-t border-neutral-100 flex items-center justify-between">
              <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                {isLoading ? 'Synchronizing database...' : 'All changes update instantly'}
              </p>
              
              <button
                type="submit"
                disabled={isSaving || isUploading !== null}
                className="bg-neutral-900 hover:bg-black text-white h-11 px-8 text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save {activeTab} Config</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
