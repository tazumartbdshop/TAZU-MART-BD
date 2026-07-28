import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { businessPagesService, ValidationResult } from '../../../services/businessPagesService';
import { DatabaseValidationAlert } from '../../../components/admin/DatabaseValidationAlert';

interface Section {
  title: string;
  content: string;
}

interface PolicyData {
  banner: string;
  sections: Section[];
}

export default function AdminPolicyEditor({ type, title }: { type: string; title: string }) {
  const [data, setData] = useState<PolicyData>({ banner: '', sections: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    setIsLoading(true);
    setValidationResult(null);
    setSuccessMsg(null);

    const result = await businessPagesService.getPageData<PolicyData>(type, {
      banner: '',
      sections: [{ title: 'Section 1', content: '' }]
    });
    setData(result);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setValidationResult(null);
    setSuccessMsg(null);

    const res = await businessPagesService.savePageData(type, data, title);
    setIsSaving(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Content saved successfully.');
    } else if (res.validationResult) {
      setValidationResult(res.validationResult);
    }
  };

  const addSection = () => {
    setData({ ...data, sections: [...data.sections, { title: '', content: '' }] });
  };

  const removeSection = (index: number) => {
    const newSections = data.sections.filter((_, i) => i !== index);
    setData({ ...data, sections: newSections });
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const newSections = [...data.sections];
    newSections[index][field] = value;
    setData({ ...data, sections: newSections });
  };

  if (isLoading) return <div className="py-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <DatabaseValidationAlert validationResult={validationResult} successMessage={successMsg} />
      <div className="space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">Banner Image URL</label>
        <input 
          type="text" 
          value={data.banner} 
          onChange={e => setData({ ...data, banner: e.target.value })} 
          placeholder="https://..."
          className="w-full h-12 px-4 border border-zinc-300 focus:border-zinc-900 focus:ring-0 text-sm"
        />
        {data.banner && <img src={data.banner} alt="Banner Preview" className="h-32 object-cover border border-zinc-200" />}
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider border-b border-zinc-200 pb-2">Content Sections</h3>
        {data.sections.map((section, idx) => (
          <div key={idx} className="border border-zinc-200 p-4 relative group">
            <button onClick={() => removeSection(idx)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="space-y-4">
              <input 
                type="text" 
                value={section.title}
                onChange={e => updateSection(idx, 'title', e.target.value)}
                placeholder="Section Title (e.g. Information Collection)"
                className="w-full h-12 px-4 border border-zinc-300 focus:border-zinc-900 text-sm font-bold"
              />
              <textarea 
                value={section.content}
                onChange={e => updateSection(idx, 'content', e.target.value)}
                placeholder="Content..."
                rows={5}
                className="w-full p-4 border border-zinc-300 focus:border-zinc-900 text-sm resize-none"
              />
            </div>
          </div>
        ))}
        <button onClick={addSection} className="flex items-center gap-2 text-sm font-bold uppercase border border-zinc-300 px-4 py-3 hover:bg-zinc-50 w-full justify-center">
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      <button 
        onClick={handleSave} 
        disabled={isSaving}
        className="w-full h-14 bg-zinc-900 hover:bg-black text-white font-black tracking-widest uppercase flex items-center justify-center gap-2"
      >
        {isSaving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} SAVE {title}
      </button>
    </div>
  );
}
