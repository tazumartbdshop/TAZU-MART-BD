import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Save, 
  Trash2, 
  Plus, 
  Monitor, 
  Smartphone, 
  Store, 
  Code,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Type,
  Palette,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteManagementStore } from '../../store/useSiteManagementStore';
import { uploadImage } from '../../lib/imageUtils';
import { cn } from '../../lib/utils';

export default function AdminSiteManagement() {
  const { data, isLoading, fetchSettings, updateSettings } = useSiteManagementStore();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for instant feedback (preview)
  const [localData, setLocalData] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (data) {
      setLocalData(data);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      setError(null);
      await updateSettings(localData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setLocalData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleAddCustomLink = () => {
    const currentCustomLinks = localData.custom_links || [];
    if (currentCustomLinks.length >= 2) return;

    const newLink = {
      id: `custom-${Date.now()}`,
      name: 'New Button',
      url: '',
      status: true,
      logo: ''
    };

    setLocalData((prev: any) => ({
      ...prev,
      custom_links: [...currentCustomLinks, newLink]
    }));
  };

  const handleRemoveCustomLink = (id: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      custom_links: prev.custom_links.filter((l: any) => l.id !== id)
    }));
  };

  const handleUpdateCustomLink = (id: string, updates: any) => {
    setLocalData((prev: any) => ({
      ...prev,
      custom_links: prev.custom_links.map((l: any) => 
        l.id === id ? { ...l, ...updates } : l
      )
    }));
  };

  if (!localData && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!localData) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">SITE MANAGEMENT</h1>
          <p className="text-gray-500 font-medium">Control and customize external landing buttons for the customer panel sidebar.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-none font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 shrink-0 shadow-lg active:scale-95"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Editor Side */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Button 1: Developer */}
          <SectionCard title="Button 1: Developer Website" icon={Code}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <StatusToggle 
                  label="Enable Button" 
                  isEnabled={localData.developer_status} 
                  onChange={(v) => handleInputChange('developer_status', v)} 
                />
              </div>
              
              <div className="md:col-span-1">
                 <ImageUpload 
                   label="Logo / Icon"
                   value={localData.developer_logo}
                   onChange={(v) => handleInputChange('developer_logo', v)}
                 />
              </div>

              <div className="md:col-span-1 space-y-4">
                <InputField 
                  label="Button Name" 
                  value={localData.developer_button_name} 
                  onChange={(v) => handleInputChange('developer_button_name', v)}
                  icon={Type}
                />
                <InputField 
                  label="Website URL" 
                  value={localData.developer_link} 
                  onChange={(v) => handleInputChange('developer_link', v)}
                  icon={LinkIcon}
                  placeholder="https://developer-site.com"
                />
              </div>
            </div>
          </SectionCard>

          {/* Button 2: Fashion Site */}
          <SectionCard title="Button 2: Fashion Site" icon={Store}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <StatusToggle 
                  label="Enable Button" 
                  isEnabled={localData.fashion_status} 
                  onChange={(v) => handleInputChange('fashion_status', v)} 
                />
              </div>

              <div className="md:col-span-1">
                 <ImageUpload 
                   label="Logo / Icon"
                   value={localData.fashion_logo}
                   onChange={(v) => handleInputChange('fashion_logo', v)}
                 />
              </div>

              <div className="md:col-span-1 space-y-4">
                <InputField 
                  label="Button Name" 
                  value={localData.fashion_button_name} 
                  onChange={(v) => handleInputChange('fashion_button_name', v)}
                  icon={Type}
                />
                <InputField 
                  label="Website URL" 
                  value={localData.fashion_link} 
                  onChange={(v) => handleInputChange('fashion_link', v)}
                  icon={LinkIcon}
                  placeholder="https://fashion-site.com"
                />
              </div>
            </div>
          </SectionCard>

          {/* Custom Buttons */}
          {(localData.custom_links || []).map((link: any, index: number) => (
            <SectionCard 
              key={link.id} 
              title={`Custom Button ${index + 1}`} 
              icon={Plus}
              onRemove={() => handleRemoveCustomLink(link.id)}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <StatusToggle 
                    label="Enable Button" 
                    isEnabled={link.status} 
                    onChange={(v) => handleUpdateCustomLink(link.id, { status: v })} 
                  />
                </div>

                <div className="md:col-span-1">
                   <ImageUpload 
                     label="Logo / Icon"
                     value={link.logo}
                     onChange={(v) => handleUpdateCustomLink(link.id, { logo: v })}
                   />
                </div>

                <div className="md:col-span-1 space-y-4">
                  <InputField 
                    label="Button Name" 
                    value={link.name} 
                    onChange={(v) => handleUpdateCustomLink(link.id, { name: v })}
                    icon={Type}
                  />
                  <InputField 
                    label="Website URL" 
                    value={link.url} 
                    onChange={(v) => handleUpdateCustomLink(link.id, { url: v })}
                    icon={LinkIcon}
                    placeholder="https://your-site.com"
                  />
                </div>
              </div>
            </SectionCard>
          ))}

          {/* Create New Button */}
          {(localData.custom_links || []).length < 2 && (
            <button 
              onClick={handleAddCustomLink}
              className="w-full py-6 border-2 border-dashed border-zinc-200 hover:border-black hover:bg-zinc-50 transition-all flex flex-col items-center gap-2 group"
            >
              <div className="p-3 bg-zinc-100 rounded-full group-hover:bg-black group-hover:text-white transition-all">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500 group-hover:text-black">Create New Button</span>
              <span className="text-[10px] text-zinc-400 font-medium">({2 - (localData.custom_links?.length || 0)} slots remaining)</span>
            </button>
          )}

          {/* Link Pages Management */}
          <div className="bg-white border border-zinc-200 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-black text-white">
                   <Code className="w-5 h-5" />
                 </div>
                 <h3 className="font-black text-black uppercase tracking-wider text-sm">Link Pages Management</h3>
               </div>
               <button 
                 onClick={() => window.location.href = '/admin/link-pages'}
                 className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800"
               >
                 Manage Pages
               </button>
             </div>
             <p className="text-zinc-500 text-xs font-medium">Manage dynamic footer pages, content, design, and SEO.</p>
          </div>

        </div>

        {/* Preview Side */}
        <div className="xl:col-span-5 sticky top-8 h-fit">
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 sm:p-8 flex flex-col gap-6 items-center shadow-xl">
             <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> Live Customer Panel Preview
                </div>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-800 px-2.5 py-1 rounded-full">
                  Real-time
                </span>
             </div>

             {/* Smartphone Mockup */}
             <div className="w-full max-w-[320px] bg-neutral-950 rounded-[44px] border-[10px] border-neutral-800 shadow-2xl overflow-hidden min-h-[520px] flex flex-col">
                {/* Phone Speaker & Camera Notch */}
                <div className="pt-3 pb-2 px-6 flex justify-center items-center shrink-0">
                  <div className="w-20 h-4 bg-neutral-900 rounded-full flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neutral-800" />
                    <div className="w-8 h-1 bg-neutral-800 rounded-full" />
                  </div>
                </div>

                {/* Simulated Customer Sidebar Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-neutral-800/80">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 font-bold text-xs border border-neutral-700">
                        TM
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white tracking-tight">Customer Menu</p>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold">Sidebar Simulation</p>
                      </div>
                    </div>

                    <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-3">Site Links</h3>
                    
                    <div className="flex flex-col gap-2.5">
                      {localData.developer_status && (
                        <PreviewButton 
                          name={localData.developer_button_name || 'Web Developer'}
                          logo={localData.developer_logo}
                          icon={Code}
                        />
                      )}
                      {localData.fashion_status && (
                        <PreviewButton 
                          name={localData.fashion_button_name || 'Tazu Fashion'}
                          logo={localData.fashion_logo}
                          icon={Store}
                        />
                      )}
                      {(localData.custom_links || []).filter((l: any) => l.status).map((link: any) => (
                        <PreviewButton 
                          key={link.id}
                          name={link.name || 'Custom Link'}
                          logo={link.logo}
                          icon={Plus}
                        />
                      ))}
                      {!localData.developer_status && !localData.fashion_status && (localData.custom_links || []).filter((l: any) => l.status).length === 0 && (
                        <div className="p-4 rounded-xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
                          <p className="text-[11px] text-neutral-400 font-medium">No site links enabled.</p>
                          <p className="text-[9px] text-neutral-500 mt-1">Enable links on the left to preview.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800/80 mt-6">
                    <div className="w-full py-2 bg-neutral-900/80 rounded-xl text-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Footer Bar Preview</span>
                    </div>
                  </div>
                </div>

                {/* Home Indicator Bar */}
                <div className="py-2 flex justify-center">
                  <div className="w-28 h-1 bg-neutral-700 rounded-full" />
                </div>
             </div>

             <div className="text-center">
                <p className="text-[11px] font-bold text-neutral-400 max-w-[280px]">
                  * This is how the buttons will appear in the customer sidebar. Animations and effects are exactly the same.
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
            <span className="font-bold text-sm tracking-tight">Settings Saved Successfully! Dashboard updated.</span>
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
            <span className="font-bold text-sm tracking-tight">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, onRemove }: { title: string, icon: any, children: React.ReactNode, onRemove?: () => void, key?: any }) {
  return (
    <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden group">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black rounded-none transition-colors">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-black text-black uppercase tracking-wider text-xs">{title}</h3>
        </div>
        {onRemove && (
          <button 
            onClick={onRemove}
            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function ImageUpload({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file, 'site-links');
      onChange(url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <ImageIcon className="w-3 h-3" /> {label}
      </label>
      <div className="relative group">
        <div className="aspect-square w-full max-w-[120px] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 overflow-hidden bg-zinc-50 relative">
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-contain p-2" />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onChange('');
                }}
                className="absolute top-1 right-1 p-1 bg-black text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-zinc-300" />
                  <span className="text-[8px] font-black uppercase text-zinc-400">Upload</span>
                </>
              )}
            </>
          )}
          <input 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
      </div>
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

function StatusToggle({ label, isEnabled, onChange }: { label: string, isEnabled: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-none flex items-center justify-center transition-colors ${isEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
           {isEnabled ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider text-black">{label}</span>
      </div>
      <button 
        onClick={() => onChange(!isEnabled)}
        className={cn(
          "relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none",
          isEnabled ? 'bg-black' : 'bg-zinc-300'
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
          isEnabled ? 'left-7' : 'left-1'
        )} />
      </button>
    </div>
  );
}

function PreviewButton({ name, logo, icon: Icon }: { name: string, logo?: string, icon: any, key?: any }) {
  return (
    <div 
      className="w-full h-12 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl flex items-center justify-between px-3.5 transition-all shadow-sm group cursor-default"
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-neutral-800 text-neutral-200 border border-neutral-700/60 overflow-hidden p-1">
           {logo ? (
             <img src={logo} alt={name} className="w-full h-full object-contain" />
           ) : (
             <Icon className="w-3.5 h-3.5 text-neutral-300" />
           )}
        </div>
        <span className="font-bold text-xs text-neutral-100 tracking-tight">{name}</span>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
    </div>
  );
}
