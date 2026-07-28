import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { businessPagesService, ValidationResult } from '../../../services/businessPagesService';
import { DatabaseValidationAlert } from '../../../components/admin/DatabaseValidationAlert';

export interface AboutData {
  companyIntro: string;
  history: string;
  founderMessage: string;
  businessGoal: string;
  futurePlan: string;
  team: { name: string; role: string; image: string }[];
  timeline: { year: string; event: string }[];
  faq: { q: string; a: string }[];
}

const DEFAULT_DATA: AboutData = {
  companyIntro: '', history: '', founderMessage: '', businessGoal: '', futurePlan: '',
  team: [], timeline: [], faq: []
};

export default function AdminAboutEditor() {
  const [data, setData] = useState<AboutData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const result = await businessPagesService.getPageData<AboutData>('about', DEFAULT_DATA);
    setData(result);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setValidationResult(null);
    setSuccessMsg(null);

    const res = await businessPagesService.savePageData('about', data, 'About Us');
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Content saved successfully.');
    } else if (res.validationResult) {
      setValidationResult(res.validationResult);
    }
  };

  const updateField = (field: keyof AboutData, value: any) => setData({ ...data, [field]: value });

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <DatabaseValidationAlert validationResult={validationResult} successMessage={successMsg} />

      {/* Basic Info */}
      <div className="space-y-4">
        {(['companyIntro', 'history', 'founderMessage', 'businessGoal', 'futurePlan'] as (keyof AboutData)[]).map(field => (
          <div key={field} className="space-y-2">
            <label className="text-xs font-bold uppercase">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
            <textarea rows={4} value={data[field] as string} onChange={e => updateField(field, e.target.value)} className="w-full border p-4" />
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="space-y-4 border p-4">
        <h3 className="text-sm font-bold uppercase">Team Information</h3>
        {data.team.map((member, idx) => (
          <div key={idx} className="flex gap-2">
            <input type="text" placeholder="Name" value={member.name} onChange={e => {
              const team = [...data.team]; team[idx].name = e.target.value; updateField('team', team);
            }} className="flex-1 h-10 border px-3 text-sm" />
            <input type="text" placeholder="Role" value={member.role} onChange={e => {
              const team = [...data.team]; team[idx].role = e.target.value; updateField('team', team);
            }} className="flex-1 h-10 border px-3 text-sm" />
            <input type="text" placeholder="Image URL" value={member.image} onChange={e => {
              const team = [...data.team]; team[idx].image = e.target.value; updateField('team', team);
            }} className="flex-1 h-10 border px-3 text-sm" />
            <button onClick={() => {
              const team = [...data.team]; team.splice(idx, 1); updateField('team', team);
            }} className="px-3 border text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => updateField('team', [...data.team, { name: '', role: '', image: '' }])} className="text-xs font-bold uppercase border px-4 py-2">+ Add Member</button>
      </div>

      {/* Timeline */}
      <div className="space-y-4 border p-4">
        <h3 className="text-sm font-bold uppercase">Company Timeline</h3>
        {data.timeline.map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input type="text" placeholder="Year" value={item.year} onChange={e => {
              const timeline = [...data.timeline]; timeline[idx].year = e.target.value; updateField('timeline', timeline);
            }} className="w-32 h-10 border px-3 text-sm" />
            <input type="text" placeholder="Event" value={item.event} onChange={e => {
              const timeline = [...data.timeline]; timeline[idx].event = e.target.value; updateField('timeline', timeline);
            }} className="flex-1 h-10 border px-3 text-sm" />
            <button onClick={() => {
              const timeline = [...data.timeline]; timeline.splice(idx, 1); updateField('timeline', timeline);
            }} className="px-3 border text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => updateField('timeline', [...data.timeline, { year: '', event: '' }])} className="text-xs font-bold uppercase border px-4 py-2">+ Add Timeline Event</button>
      </div>

      {/* FAQ */}
      <div className="space-y-4 border p-4">
        <h3 className="text-sm font-bold uppercase">FAQ</h3>
        {data.faq.map((item, idx) => (
          <div key={idx} className="space-y-2 border border-zinc-200 p-4 relative group">
            <button onClick={() => {
              const faq = [...data.faq]; faq.splice(idx, 1); updateField('faq', faq);
            }} className="absolute top-2 right-2 text-red-500"><Trash2 className="w-4 h-4" /></button>
            <input type="text" placeholder="Question" value={item.q} onChange={e => {
              const faq = [...data.faq]; faq[idx].q = e.target.value; updateField('faq', faq);
            }} className="w-full h-10 border px-3 text-sm font-bold" />
            <textarea placeholder="Answer" rows={3} value={item.a} onChange={e => {
              const faq = [...data.faq]; faq[idx].a = e.target.value; updateField('faq', faq);
            }} className="w-full border p-3 text-sm" />
          </div>
        ))}
        <button onClick={() => updateField('faq', [...data.faq, { q: '', a: '' }])} className="text-xs font-bold uppercase border px-4 py-2">+ Add FAQ</button>
      </div>

      <button onClick={handleSave} disabled={isSaving} className="w-full h-14 bg-zinc-900 text-white font-black tracking-widest uppercase flex justify-center items-center gap-2">
        {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Save About Us
      </button>
    </div>
  );
}
