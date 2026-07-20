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
    } else if (!isLoading && !localData) {
      // Fallback to default structure if no data and not loading to prevent blank screen
      setLocalData({
        developer_button_name: 'Web Developer',
        developer_status: true,
        fashion_button_name: 'Visit Fashion Site',
        fashion_status: true,
        custom_links: []
      });
    }
  }, [data, isLoading, localData]);

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
          <div className="bg-zinc-100 rounded-none border border-zinc-200 p-8 flex flex-col gap-6 items-center">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
                <Eye className="w-3 h-3" /> Live Customer Panel Preview
             </div>

             <div className="w-full max-w-[320px] bg-white rounded-[40px] border-[8px] border-zinc-800 shadow-2xl p-6 min-h-[500px]">
                <div className="w-20 h-1 bg-zinc-200 rounded-full mx-auto mb-8" />
                
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Site Links</h3>
                
                <div className="flex flex-col gap-3">
                  {localData.developer_status && (
                    <PreviewButton 
                      name={localData.developer_button_name}
                      logo={localData.developer_logo}
                      icon={Code}
                    />
                  )}
                  {localData.fashion_status && (
                    <PreviewButton 
                      name={localData.fashion_button_name}
                      logo={localData.fashion_logo}
                      icon={Store}
                    />
                  )}
                  {(localData.custom_links || []).filter((l: any) => l.status).map((link: any) => (
                    <PreviewButton 
                      key={link.id}
                      name={link.name}
                      logo={link.logo}
                      icon={Plus}
                    />
                  ))}
                </div>
             </div>

             <div className="text-center">
                <p className="text-[11px] font-bold text-zinc-500 max-w-[280px]">
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
      className="w-full h-14 bg-white border border-gray-200 rounded-[14px] flex items-center justify-between px-4 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 bg-gray-50 text-gray-600 overflow-hidden p-1">
           {logo ? (
             <img src={logo} alt={name} className="w-full h-full object-contain" />
           ) : (
             <Icon className="w-4 h-4" />
           )}
        </div>
        <span className="font-bold text-[13px] text-gray-800 tracking-tight">{name}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300" />
    </div>
  );
}
