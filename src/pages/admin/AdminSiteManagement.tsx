import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Save, 
  Trash2, 
  Plus, 
  Monitor, 
  Smartphone, 
  Facebook, 
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
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteManagementStore } from '../../store/useSiteManagementStore';
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <StatusToggle 
                  label="Enable Button" 
                  isEnabled={localData.developer_status} 
                  onChange={(v) => handleInputChange('developer_status', v)} 
                />
              </div>
              <InputField 
                label="Button Label" 
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
              <div className="md:col-span-2">
                 <ColorInput 
                    label="Background Color / Gradient"
                    value={localData.developer_color}
                    onChange={(v) => handleInputChange('developer_color', v)}
                 />
              </div>
            </div>
          </SectionCard>

          {/* Button 2: Fashion Site */}
          <SectionCard title="Button 2: Fashion Site" icon={Store}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <StatusToggle 
                  label="Enable Button" 
                  isEnabled={localData.fashion_status} 
                  onChange={(v) => handleInputChange('fashion_status', v)} 
                />
              </div>
              <InputField 
                label="Button Label" 
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
              <div className="md:col-span-2">
                 <ColorInput 
                    label="Background Color / Gradient"
                    value={localData.fashion_color}
                    onChange={(v) => handleInputChange('fashion_color', v)}
                 />
              </div>
            </div>
          </SectionCard>

          {/* Button 3: Facebook */}
          <SectionCard title="Button 3: Facebook Updates" icon={Facebook}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <StatusToggle 
                  label="Enable Button" 
                  isEnabled={localData.facebook_status} 
                  onChange={(v) => handleInputChange('facebook_status', v)} 
                />
              </div>
              <InputField 
                label="Button Label" 
                value={localData.facebook_button_name} 
                onChange={(v) => handleInputChange('facebook_button_name', v)}
                icon={Type}
              />
              <InputField 
                label="Facebook Link" 
                value={localData.facebook_link} 
                onChange={(v) => handleInputChange('facebook_link', v)}
                icon={LinkIcon}
                placeholder="https://facebook.com/page-name"
              />
            </div>
          </SectionCard>

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
                
                <div className="flex flex-col gap-[12px]">
                  {localData.developer_status && (
                    <PreviewButton 
                      name={localData.developer_button_name}
                      color={localData.developer_color}
                      icon={Code}
                    />
                  )}
                  {localData.fashion_status && (
                    <PreviewButton 
                      name={localData.fashion_button_name}
                      color={localData.fashion_color}
                      icon={Store}
                    />
                  )}
                  {localData.facebook_status && (
                    <PreviewButton 
                      name={localData.facebook_button_name}
                      color="#1877F2"
                      icon={Facebook}
                    />
                  )}
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

function SectionCard({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden group">
      <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3 bg-zinc-50/50">
        <div className="p-2 bg-black rounded-none transition-colors">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-black text-black uppercase tracking-wider text-xs">{title}</h3>
      </div>
      <div className="p-6">
        {children}
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

function ColorInput({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <Palette className="w-3 h-3" /> {label}
      </label>
      <div className="flex items-center gap-3">
         <div className="flex-1">
           <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 text-sm focus:outline-none focus:border-black focus:bg-white transition-all rounded-none font-bold"
           />
         </div>
         <div 
          className="w-12 h-12 border border-zinc-200 rounded-none shrink-0 shadow-sm"
          style={{ background: value }}
         />
      </div>
      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter mt-1 italic">Supports HEX codes or CSS Linear Gradients (e.g. linear-gradient(135deg, #000 0%, #333 100%))</p>
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

function PreviewButton({ name, color, icon: Icon }: { name: string, color: string, icon: any }) {
  return (
    <div 
      className="w-full h-[52px] rounded-[10px] flex items-center justify-between px-4 text-white transition-all relative overflow-hidden"
      style={{ 
        background: color,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-[8px] flex items-center justify-center shrink-0">
           <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold text-[15px]">{name}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-white/60" />
    </div>
  );
}
