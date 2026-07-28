import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { businessPagesService, ValidationResult } from '../../../services/businessPagesService';
import { DatabaseValidationAlert } from '../../../components/admin/DatabaseValidationAlert';

export interface BrandsData {
  logo: string;
  banner: string;
  companyName: string;
  ourStory: string;
  mission: string;
  vision: string;
  whyChooseUs: string[];
  brandValues: string[];
  productCategories: string[];
  statistics: { label: string; value: string }[];
  gallery: string[];
  certifications: string[];
  customerTrust: string;
  websiteLink: string;
  whatsapp: string;
  email: string;
  call: string;
  socialLinks: { platform: string; url: string }[];
}

const DEFAULT_DATA: BrandsData = {
  logo: '', banner: '', companyName: '', ourStory: '', mission: '', vision: '',
  whyChooseUs: [], brandValues: [], productCategories: [], statistics: [],
  gallery: [], certifications: [], customerTrust: '', websiteLink: '',
  whatsapp: '', email: '', call: '', socialLinks: []
};

export default function AdminBrandsEditor() {
  const [data, setData] = useState<BrandsData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await businessPagesService.getPageData<BrandsData>('brands', DEFAULT_DATA);
    setData(result);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setValidationResult(null);
    setSuccessMsg(null);

    const res = await businessPagesService.savePageData('brands', data, 'Brands Information');
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Content saved successfully.');
    } else if (res.validationResult) {
      setValidationResult(res.validationResult);
    }
  };

  const updateField = (field: keyof BrandsData, value: any) => setData({ ...data, [field]: value });

  const handleStringArray = (field: keyof BrandsData, index: number, value: string) => {
    const arr = [...(data[field] as string[])];
    arr[index] = value;
    updateField(field, arr);
  };

  const addStringArray = (field: keyof BrandsData) => {
    updateField(field, [...(data[field] as string[]), '']);
  };

  const removeStringArray = (field: keyof BrandsData, index: number) => {
    const arr = [...(data[field] as string[])];
    arr.splice(index, 1);
    updateField(field, arr);
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <DatabaseValidationAlert validationResult={validationResult} successMessage={successMsg} />

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">Company Name</label>
          <input type="text" value={data.companyName} onChange={e => updateField('companyName', e.target.value)} className="w-full h-12 border px-4" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">Website Link</label>
          <input type="text" value={data.websiteLink} onChange={e => updateField('websiteLink', e.target.value)} className="w-full h-12 border px-4" />
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-xs font-bold uppercase">Logo URL</label>
          <input type="text" value={data.logo} onChange={e => updateField('logo', e.target.value)} className="w-full h-12 border px-4" />
        </div>
        <div className="space-y-2 col-span-2">
          <label className="text-xs font-bold uppercase">Banner URL</label>
          <input type="text" value={data.banner} onChange={e => updateField('banner', e.target.value)} className="w-full h-12 border px-4" />
        </div>
      </div>

      {/* Story & Vision */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">Our Story</label>
          <textarea rows={4} value={data.ourStory} onChange={e => updateField('ourStory', e.target.value)} className="w-full border p-4" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">Mission</label>
          <textarea rows={3} value={data.mission} onChange={e => updateField('mission', e.target.value)} className="w-full border p-4" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">Vision</label>
          <textarea rows={3} value={data.vision} onChange={e => updateField('vision', e.target.value)} className="w-full border p-4" />
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">WhatsApp</label>
          <input type="text" value={data.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} className="w-full h-12 border px-4" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">Email</label>
          <input type="email" value={data.email} onChange={e => updateField('email', e.target.value)} className="w-full h-12 border px-4" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase">Call</label>
          <input type="text" value={data.call} onChange={e => updateField('call', e.target.value)} className="w-full h-12 border px-4" />
        </div>
      </div>
      
      {/* Arrays (Why Choose Us, Brand Values, etc.) */}
      {(['whyChooseUs', 'brandValues', 'productCategories', 'gallery', 'certifications'] as (keyof BrandsData)[]).map(field => (
        <div key={field} className="space-y-4 border p-4">
          <h3 className="text-sm font-bold uppercase">{field.replace(/([A-Z])/g, ' $1').trim()}</h3>
          {(data[field] as string[]).map((val, idx) => (
            <div key={idx} className="flex gap-2">
              <input type="text" value={val} onChange={e => handleStringArray(field, idx, e.target.value)} className="flex-1 h-10 border px-3 text-sm" />
              <button onClick={() => removeStringArray(field, idx)} className="px-3 border text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button onClick={() => addStringArray(field)} className="text-xs font-bold uppercase border px-4 py-2">+ Add Item</button>
        </div>
      ))}

      {/* Stats */}
      <div className="space-y-4 border p-4">
        <h3 className="text-sm font-bold uppercase">Statistics</h3>
        {data.statistics.map((stat, idx) => (
          <div key={idx} className="flex gap-2">
            <input type="text" placeholder="Value (e.g. 10k+)" value={stat.value} onChange={e => {
              const stats = [...data.statistics]; stats[idx].value = e.target.value; updateField('statistics', stats);
            }} className="w-1/3 h-10 border px-3 text-sm" />
            <input type="text" placeholder="Label (e.g. Happy Customers)" value={stat.label} onChange={e => {
              const stats = [...data.statistics]; stats[idx].label = e.target.value; updateField('statistics', stats);
            }} className="flex-1 h-10 border px-3 text-sm" />
            <button onClick={() => {
              const stats = [...data.statistics]; stats.splice(idx, 1); updateField('statistics', stats);
            }} className="px-3 border text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => updateField('statistics', [...data.statistics, { label: '', value: '' }])} className="text-xs font-bold uppercase border px-4 py-2">+ Add Stat</button>
      </div>

      <button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-zinc-900 text-white font-black tracking-widest uppercase flex justify-center items-center gap-2">
        {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save Brands Profile
      </button>
    </div>
  );
}
