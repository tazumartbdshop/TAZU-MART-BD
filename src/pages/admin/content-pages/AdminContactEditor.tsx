import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { businessPagesService, ValidationResult } from '../../../services/businessPagesService';
import { DatabaseValidationAlert } from '../../../components/admin/DatabaseValidationAlert';

export interface ContactData {
  companyAddress: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebook: string;
  messenger: string;
  googleMapUrl: string;
  contactFormEnabled: boolean;
  liveChatEnabled: boolean;
}

const DEFAULT_DATA: ContactData = {
  companyAddress: '', phone: '', whatsapp: '', email: '', facebook: '',
  messenger: '', googleMapUrl: '', contactFormEnabled: true, liveChatEnabled: false
};

export default function AdminContactEditor() {
  const [data, setData] = useState<ContactData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await businessPagesService.getPageData<ContactData>('contact', DEFAULT_DATA);
    setData(result);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setValidationResult(null);
    setSuccessMsg(null);

    const res = await businessPagesService.savePageData('contact', data, 'Contact Us');
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Content saved successfully.');
    } else if (res.validationResult) {
      setValidationResult(res.validationResult);
    }
  };

  const updateField = (field: keyof ContactData, value: any) => setData({ ...data, [field]: value });

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <DatabaseValidationAlert validationResult={validationResult} successMessage={successMsg} />
      <div className="grid grid-cols-2 gap-4">
        {(['phone', 'whatsapp', 'email', 'facebook', 'messenger', 'googleMapUrl'] as (keyof ContactData)[]).map(field => (
          <div key={field} className="space-y-2">
            <label className="text-xs font-bold uppercase">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
            <input type="text" value={data[field] as string} onChange={e => updateField(field, e.target.value)} className="w-full h-12 border px-4" />
          </div>
        ))}
        <div className="col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase">Company Address</label>
          <textarea rows={3} value={data.companyAddress} onChange={e => updateField('companyAddress', e.target.value)} className="w-full border p-4" />
        </div>
      </div>

      <div className="flex gap-8 border p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.contactFormEnabled} onChange={e => updateField('contactFormEnabled', e.target.checked)} className="w-5 h-5" />
          <span className="text-sm font-bold uppercase">Enable Contact Form</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={data.liveChatEnabled} onChange={e => updateField('liveChatEnabled', e.target.checked)} className="w-5 h-5" />
          <span className="text-sm font-bold uppercase">Enable Live Chat Button</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-zinc-900 text-white font-black tracking-widest uppercase flex justify-center items-center gap-2">
        {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save Contact Us
      </button>
    </div>
  );
}
