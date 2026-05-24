import React, { useState } from 'react';
import { Radio, ShieldCheck, Link2, Key, User, Lock, Globe, Save, Power } from 'lucide-react';
import { useDeliveryStore, CourierAPI } from '../../store/useDeliveryStore';
import { cn } from '../../lib/utils';

export default function AdminCourierAPI() {
  const { courierApis, updateCourierApi } = useDeliveryStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourierAPI | null>(null);

  const handleEdit = (api: CourierAPI) => {
    setEditingId(api.id);
    setFormData({ ...api });
  };

  const handleSave = () => {
    if (formData) {
      updateCourierApi(formData.id, formData);
      setEditingId(null);
      setFormData(null);
    }
  };

  const handleToggle = (id: string, currentStatus: 'active' | 'inactive') => {
    updateCourierApi(id, { status: currentStatus === 'active' ? 'inactive' : 'active' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-black text-white p-6 border border-[#222] rounded-none flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter">Courier Integration Engine</h2>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Logistics stack management for enterprise distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courierApis.map((api) => (
          <div 
            key={api.id}
            className={cn(
              "bg-white border rounded-none overflow-hidden transition-all duration-300",
              api.status === 'active' ? "border-black shadow-2xl shadow-black/5" : "border-[#E5E5E5]"
            )}
          >
            <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-none border border-black/10",
                  api.status === 'active' ? "bg-black text-white" : "bg-white text-zinc-400"
                )}>
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="font-black text-[#000000] uppercase tracking-tighter text-sm">{api.name}</h3>
              </div>
              
              <button
                onClick={() => handleToggle(api.id, api.status)}
                className={cn(
                  "flex items-center gap-2 px-3 h-[32px] rounded-none text-[10px] font-black uppercase tracking-widest transition-all border",
                  api.status === 'active' 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-50"
                )}
              >
                <Power className="w-3 h-3" />
                {api.status === 'active' ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="p-5 space-y-4">
              {editingId === api.id ? (
                <div className="space-y-4">
                  <InputField 
                    icon={Globe} 
                    label="API ENDPOINT URL" 
                    value={formData?.apiUrl || ''} 
                    onChange={(v) => setFormData(f => f ? {...f, apiUrl: v} : null)}
                    placeholder="https://api.gateway.io"
                  />
                  <InputField 
                    icon={Key} 
                    label="AUTHENTICATION KEY" 
                    value={formData?.apiKey || ''} 
                    onChange={(v) => setFormData(f => f ? {...f, apiKey: v} : null)}
                    placeholder="SECRET_KEY_..."
                  />
                  <InputField 
                    icon={ShieldCheck} 
                    label="SECURITY SECRET" 
                    value={formData?.secretKey || ''} 
                    onChange={(v) => setFormData(f => f ? {...f, secretKey: v} : null)}
                    placeholder="CLIENT_SECRET_..."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField 
                      icon={Lock} 
                      label="CLIENT IDENTITY" 
                      value={formData?.clientId || ''} 
                      onChange={(v) => setFormData(f => f ? {...f, clientId: v} : null)}
                      placeholder="ID"
                    />
                    <InputField 
                      icon={Link2} 
                      label="BRANCH / STORE" 
                      value={formData?.storeId || ''} 
                      onChange={(v) => setFormData(f => f ? {...f, storeId: v} : null)}
                      placeholder="TAG"
                    />
                  </div>
                  
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={handleSave}
                      className="w-full bg-black text-white h-[44px] rounded-none font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-black/10"
                    >
                      <Save className="w-4 h-4" /> COMMIT CONFIGURATION
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setFormData(null); }}
                      className="w-full bg-zinc-50 text-zinc-500 h-[44px] border border-zinc-200 rounded-none font-black text-[11px] uppercase tracking-widest hover:bg-zinc-100 transition-all"
                    >
                      ABANDON CHANGES
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <DisplayField label="API ENDPOINT" value={api.apiUrl} />
                    <DisplayField label="KEY SECURITY" value={api.apiKey ? 'PROVISIONED • ACTIVE' : 'REDACTED'} />
                    <DisplayField label="STORE TOKEN" value={api.storeId} />
                  </div>
                  <button
                    onClick={() => handleEdit(api)}
                    className="w-full mt-6 border border-black text-[#000000] h-[48px] rounded-none font-black text-[11px] uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    DEPLOY CONFIGURATION
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InputField({ icon: Icon, label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div>
      <label className="block text-[9px] font-black text-[#000000] uppercase tracking-widest mb-2 ml-0 font-mono italic opacity-50">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-[#222] rounded-none h-[44px] pl-10 pr-4 text-[11px] font-bold uppercase tracking-tight focus:outline-none focus:ring-1 focus:ring-black transition-all"
        />
      </div>
    </div>
  );
}

function DisplayField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-black text-zinc-400 text-[8px] uppercase tracking-[0.2em]">{label}</span>
      <span className="font-bold text-[#000000] text-[11px] truncate uppercase tracking-tight">{value || 'UNCONFIGURED'}</span>
    </div>
  );
}
