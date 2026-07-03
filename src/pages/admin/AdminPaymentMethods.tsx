import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Check, 
  Trash2, 
  Upload, 
  Save, 
  AlertCircle,
  Info,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFetchJSON } from '../../lib/utils';

export default function AdminPaymentMethods() {
  const { settings, updateSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  
  // Database integration state
  const [loading, setLoading] = useState<boolean>(true);

  // Local state for configs - empty by default!
  const [configs, setConfigs] = useState({
    cod: {
      enabled: false,
      name: '',
      logo: '',
      number: '',
      instruction: '',
    },
    bkash: {
      enabled: false,
      name: '',
      logo: '',
      number: '',
      instruction: '',
    },
    nagad: {
      enabled: false,
      name: '',
      logo: '',
      number: '',
      instruction: '',
    },
    rocket: {
      enabled: false,
      name: '',
      logo: '',
      number: '',
      instruction: '',
    },
    card: {
      enabled: false,
      name: '',
      logo: '',
      number: '',
      instruction: '',
      gatewayLink: '',
    }
  });

  // Default fallback preset logos
  const defaultLogos = {
    cod: 'https://cdn-icons-png.flaticon.com/512/6491/6491517.png',
    bkash: 'https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg',
    nagad: 'https://download.logo.wine/logo/Nagad/Nagad-Vertical-Logo.wine.svg',
    rocket: 'https://www.logo.wine/a/logo/Dutch_Bangla_Bank/Dutch_Bangla_Bank-Logo.wine.svg',
    card: 'https://cdn-icons-png.flaticon.com/512/349/349228.png',
  };

  // 1. Fetch saved methods on mount
  useEffect(() => {
    const initAndFetch = async () => {
      setLoading(true);
      try {
        // Fetch actual values
        const data = await safeFetchJSON('/api/admin/payment-methods');
        if (data.status === 'success' && data.methods) {
          const updated = {
            cod: { enabled: false, name: '', logo: '', number: '', instruction: '' },
            bkash: { enabled: false, name: '', logo: '', number: '', instruction: '' },
            nagad: { enabled: false, name: '', logo: '', number: '', instruction: '' },
            rocket: { enabled: false, name: '', logo: '', number: '', instruction: '' },
            card: { enabled: false, name: '', logo: '', number: '', instruction: '', gatewayLink: '' }
          };

          data.methods.forEach((m: any) => {
            const code = m.payment_code;
            if (code in updated) {
              (updated as any)[code] = {
                enabled: m.enabled ?? false,
                name: m.payment_name || '',
                logo: m.logo_url || '',
                number: m.account_number || '',
                instruction: m.instruction || '',
                gatewayLink: m.gateway_link || ''
              };
            }
          });
          setConfigs(updated);
        }
      } catch (err) {
        console.error("Failed to load DB payment methods:", err);
      } finally {
        setLoading(false);
      }
    };

    initAndFetch();
  }, []);

  const handleInputChange = (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card', field: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [methodId]: {
        ...prev[methodId],
        [field]: value
      }
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { uploadImage } = await import('../../lib/imageUtils');
      const url = await uploadImage(file, 'payment-logos', `logo-${methodId}-${Date.now()}`);
      handleInputChange(methodId, 'logo', url);
      toast.success("Logo uploaded successfully!");
    } catch (err) {
      console.error('Failed to upload image:', err);
      toast.error('Failed to upload logo');
    }
  };

  const handleApplyPreset = (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    handleInputChange(methodId, 'logo', defaultLogos[methodId]);
    toast.success("Applied recommended preset logo.");
  };

  const handleRemoveLogo = (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    handleInputChange(methodId, 'logo', '');
    toast.success("Logo removed.");
  };

  // Save changes specifically for one payment method
  const handleSaveMethod = async (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    const data = configs[methodId];

    try {
      const result = await safeFetchJSON('/api/admin/payment-methods/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: {
            id: methodId,
            payment_type: 'personal',
            payment_code: methodId,
            payment_name: data.name,
            account_number: data.number,
            instruction: data.instruction,
            logo_url: data.logo,
            enabled: data.enabled,
            gateway_link: (data as any).gatewayLink || ''
          }
        })
      });

      if (result.status === 'success') {
        toast.success(`${data.name || methodId.toUpperCase()} settings saved successfully.`);
        
        // Sync to legacy global state to maintain checkout compatibility
        const updates: any = {};
        if (methodId === 'cod') {
          updates.codEnabled = data.enabled;
          updates.codName = data.name;
          updates.codLogo = data.logo;
          updates.codInstruction = data.instruction;
        } else if (methodId === 'bkash') {
          updates.bkashEnabled = data.enabled;
          updates.bkashName = data.name;
          updates.bkashLogo = data.logo;
          updates.bkashNumber = data.number;
          updates.bkashInstruction = data.instruction;
        } else if (methodId === 'nagad') {
          updates.nagadEnabled = data.enabled;
          updates.nagadName = data.name;
          updates.nagadLogo = data.logo;
          updates.nagadNumber = data.number;
          updates.nagadInstruction = data.instruction;
        } else if (methodId === 'rocket') {
          updates.rocketEnabled = data.enabled;
          updates.rocketName = data.name;
          updates.rocketLogo = data.logo;
          updates.rocketNumber = data.number;
          updates.rocketInstruction = data.instruction;
        } else if (methodId === 'card') {
          updates.cardEnabled = data.enabled;
          updates.cardName = data.name;
          updates.cardLogo = data.logo;
          updates.cardNumber = data.number;
          updates.cardInstruction = data.instruction;
          updates.cardGatewayLink = (data as any).gatewayLink;
        }
        updateSettings(updates);
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (err: any) {
      toast.error("Network error: " + err.message);
    }
  };

  // Global Save All Settings
  const handleSaveAll = async () => {
    let successCount = 0;
    const methods = ['cod', 'bkash', 'nagad', 'rocket', 'card'] as const;

    for (const mId of methods) {
      const data = configs[mId];
      try {
        const resJson = await safeFetchJSON('/api/admin/payment-methods/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: {
              id: mId,
              payment_type: 'personal',
              payment_code: mId,
              payment_name: data.name,
              account_number: data.number,
              instruction: data.instruction,
              logo_url: data.logo,
              enabled: data.enabled,
              gateway_link: (data as any).gatewayLink || ''
            }
          })
        });
        if (resJson.status === 'success') successCount++;
      } catch (err) {}
    }

    // Sync to global memory fallback
    const updates: any = {
      codEnabled: configs.cod.enabled,
      codName: configs.cod.name,
      codLogo: configs.cod.logo,
      codInstruction: configs.cod.instruction,

      bkashEnabled: configs.bkash.enabled,
      bkashName: configs.bkash.name,
      bkashLogo: configs.bkash.logo,
      bkashNumber: configs.bkash.number,
      bkashInstruction: configs.bkash.instruction,

      nagadEnabled: configs.nagad.enabled,
      nagadName: configs.nagad.name,
      nagadLogo: configs.nagad.logo,
      nagadNumber: configs.nagad.number,
      nagadInstruction: configs.nagad.instruction,

      rocketEnabled: configs.rocket.enabled,
      rocketName: configs.rocket.name,
      rocketLogo: configs.rocket.logo,
      rocketNumber: configs.rocket.number,
      rocketInstruction: configs.rocket.instruction,

      cardEnabled: configs.card.enabled,
      cardName: configs.card.name,
      cardLogo: configs.card.logo,
      cardNumber: configs.card.number,
      cardInstruction: configs.card.instruction,
      cardGatewayLink: configs.card.gatewayLink,
    };
    updateSettings(updates);

    if (successCount === 5) {
      toast.success("All personal payment settings saved successfully to Supabase!");
    } else {
      toast.error(`Saved ${successCount}/5 payment settings to Supabase. Please check database connectivity.`);
    }
  };

  const renderCard = (id: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card', title: string, hasNumber: boolean, hasGatewayLink = false) => {
    const data = configs[id];
    let icon = <DollarSign className="w-5 h-5 text-neutral-900" />;
    
    if (id === 'bkash' || id === 'nagad' || id === 'rocket') {
      icon = <Smartphone className="w-5 h-5 text-neutral-900" />;
    } else if (id === 'card') {
      icon = <CreditCard className="w-5 h-5 text-neutral-900" />;
    }

    return (
      <div className={`bg-white border ${data.enabled ? 'border-neutral-900' : 'border-neutral-200'} p-5 font-sans relative`}>
        {data.enabled && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-neutral-900" />
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-neutral-100 flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">{title}</h3>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">
                {id === 'cod' ? 'No Extra Verification' : id === 'card' ? 'Online Gateway' : 'Mobile Financial Service'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleInputChange(id, 'enabled', !data.enabled)}
            className={`px-3 py-1.5 border text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer rounded-[4px] ${
              data.enabled 
                ? 'bg-neutral-950 text-white border-neutral-950' 
                : 'bg-white text-neutral-400 border-neutral-200 hover:text-neutral-700 hover:border-neutral-400'
            }`}
          >
            {data.enabled ? '● ENABLED' : '○ DISABLED'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Logo Management */}
          <div className="lg:col-span-4 space-y-3">
            <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Payment Logo</label>
            
            <div className="border border-neutral-200 p-3 flex flex-col items-center justify-center h-32 bg-neutral-50 relative">
              {data.logo ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={data.logo} 
                    alt={`${title} logo`} 
                    className="max-w-full max-h-[85px] object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLogo(id)}
                    className="absolute top-1 right-1 p-1.5 bg-neutral-900 hover:bg-red-600 text-white transition-colors cursor-pointer rounded-[4px]"
                    title="Remove Logo image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-[10px] text-neutral-400 font-bold block uppercase mb-1">No Custom Logo</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(id)}
                    className="text-[9px] text-neutral-900 font-bold uppercase underline hover:no-underline cursor-pointer"
                  >
                    Use Recommended Preset
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 border border-neutral-300 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-neutral-50 cursor-pointer text-neutral-700 text-center rounded-[4px]">
                <Upload className="w-3.5 h-3.5" />
                Upload File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e, id)} 
                  className="hidden" 
                />
              </label>

              {data.logo !== defaultLogos[id] && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset(id)}
                  className="px-2 py-2 border border-neutral-200 text-[10px] font-bold uppercase tracking-wider bg-slate-50 hover:bg-neutral-100 text-neutral-600 cursor-pointer rounded-[4px]"
                >
                  Apply Preset
                </button>
              )}
            </div>
          </div>

          {/* Form Fields & Preview */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Payment Display Name</label>
                <input 
                  type="text"
                  value={data.name}
                  onChange={(e) => handleInputChange(id, 'name', e.target.value)}
                  className="w-full h-10 border border-neutral-200 px-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900"
                  placeholder="Enter Payment Name"
                />
              </div>

              {hasNumber && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">
                    {id === 'card' ? 'Secure Gateway Information' : 'Payment Account Number'}
                  </label>
                  <input 
                    type="text"
                    value={data.number}
                    onChange={(e) => handleInputChange(id, 'number', e.target.value)}
                    className="w-full h-10 border border-neutral-200 px-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-mono"
                    placeholder="Enter Account Number"
                  />
                </div>
              )}
            </div>

            {hasGatewayLink && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Payment Gateway Proxy Link (Optional)</label>
                <input 
                  type="text"
                  value={(data as any).gatewayLink || ''}
                  onChange={(e) => handleInputChange(id, 'gatewayLink', e.target.value)}
                  className="w-full h-10 border border-neutral-200 px-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900"
                  placeholder="e.g. https://sandbox.payment-gateway.com/auth"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Instruction / Gateway Text</label>
              <textarea 
                value={data.instruction}
                onChange={(e) => handleInputChange(id, 'instruction', e.target.value)}
                rows={3}
                className="w-full border border-neutral-200 p-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 leading-relaxed resize-none"
                placeholder="Enter Instructions"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold uppercase">
                {data.enabled ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse" />
                    <span className="text-emerald-600 font-extrabold">Active on Checkout</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 block" />
                    <span className="text-red-500 font-extrabold">Hidden from customers</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSaveMethod(id)}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer rounded-[4px]"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* Mutual Exclusive Warnings */}
      {settings.paymentMerchantActive && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 font-mono text-xs text-amber-900 uppercase space-y-1">
          <div className="flex items-center gap-2 font-black">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>সতর্কতা / warning: Payment Merchant বর্তমানে Active আছে।</span>
          </div>
          <p className="font-sans font-bold text-[11px] text-amber-850">
            Payment Personal Active করতে চাইলে প্রথমে Payment Merchant Disable করুন। আপনি নিচে Toggle টিতে চাপ দিলে Payment Merchant স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।
          </p>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-purple-650" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              💳 PAYMENT PERSONAL (MANUAL)
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            Dynamically adjust transaction modes, instructions, logo images, and payment states instantly.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Master Toggle */}
          <div className="flex items-center gap-2 border border-neutral-200 px-4 py-2 bg-neutral-50">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">SYSTEM ACTIVATION</span>
            <button
              type="button"
              onClick={() => {
                const newActive = !settings.paymentPersonalActive;
                updateSettings({
                  paymentPersonalActive: newActive,
                  paymentMerchantActive: newActive ? false : settings.paymentMerchantActive
                });
                toast.success(newActive ? "Payment Personal ACTIVATED & Merchant disabled" : "Payment Personal Deactivated");
              }}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-[4px] ${
                settings.paymentPersonalActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-zinc-200 text-zinc-550'
              }`}
            >
              {settings.paymentPersonalActive ? '● ACTIVE' : '○ INACTIVE'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            className="bg-neutral-900 hover:bg-black text-white border border-neutral-950 h-10 px-6 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 rounded-[4px]"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      {!settings.paymentPersonalActive && (
        <div className="bg-rose-50/70 border border-rose-150 p-4 text-rose-800 text-xs font-mono uppercase tracking-wide">
          ⚠️ NOTICE: Payment Personal system is currently set to INACTIVE. Customers won't see personal accounts at Checkout.
        </div>
      )}

      {/* Gateway System Sections */}
      {loading ? (
        <div className="text-center py-12 bg-white border border-neutral-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
          <p className="text-xs font-black uppercase tracking-widest mt-4 text-neutral-500">Loading DB configurations...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {renderCard('cod', '1. Cash On Delivery (COD)', false)}
          {renderCard('bkash', '2. bKash mobile banking', true)}
          {renderCard('nagad', '3. Nagad mobile banking', true)}
          {renderCard('rocket', '4. Rocket DBBL banking', true)}
          {renderCard('card', '5. Digital Card Gateway (PCI-Certified)', true, true)}
        </div>
      )}

      {/* Bottom info bar */}
      <div className="bg-neutral-50 border border-neutral-200 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-neutral-500 leading-relaxed font-semibold uppercase tracking-wide">
          Notice: Verified checkout payment rules are completely automated. If a certain channel is marked "DISABLED" in this panel, its field will automatically disappear from the checkout screen option for customers without causing manual errors.
        </p>
      </div>
    </div>
  );
}
