import React, { useState } from 'react';
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
  Eye,
  Info,
  Lock
} from 'lucide-react';

interface PaymentMethodConfig {
  id: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';
  title: string;
  type: 'cod' | 'mfs' | 'card';
  enabledKey: 'codEnabled' | 'bkashEnabled' | 'nagadEnabled' | 'rocketEnabled' | 'cardEnabled';
  nameKey: 'codName' | 'bkashName' | 'nagadName' | 'rocketName' | 'cardName';
  logoKey: 'codLogo' | 'bkashLogo' | 'nagadLogo' | 'rocketLogo' | 'cardLogo';
  numberKey?: 'bkashNumber' | 'nagadNumber' | 'rocketNumber' | 'cardNumber';
  instructionKey: 'codInstruction' | 'bkashInstruction' | 'nagadInstruction' | 'rocketInstruction' | 'cardInstruction';
  gatewayLinkKey?: 'cardGatewayLink';
  presetLogo: string;
}

export default function AdminPaymentMethods() {
  const { settings, updateSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Local state for each method to allow previewing edits before clicking "Save"
  const [configs, setConfigs] = useState({
    cod: {
      enabled: settings.codEnabled,
      name: settings.codName || 'Cash on Delivery',
      logo: settings.codLogo || '',
      number: '',
      instruction: settings.codInstruction || 'Pay with cash upon receiving your order at your doorstep.',
    },
    bkash: {
      enabled: settings.bkashEnabled,
      name: settings.bkashName || 'bKash Personal',
      logo: settings.bkashLogo || '',
      number: settings.bkashNumber || '',
      instruction: settings.bkashInstruction || 'Please Send Money to the bKash Personal number above. Enter your bKash wallet number and your transaction reference ID (TxnID) below.',
    },
    nagad: {
      enabled: settings.nagadEnabled,
      name: settings.nagadName || 'Nagad Personal',
      logo: settings.nagadLogo || '',
      number: settings.nagadNumber || '',
      instruction: settings.nagadInstruction || 'Please Send Money to the Nagad Personal number above. Enter your Nagad wallet number and your transaction reference ID (TxnID) below.',
    },
    rocket: {
      enabled: settings.rocketEnabled,
      name: settings.rocketName || 'Rocket Personal',
      logo: settings.rocketLogo || '',
      number: settings.rocketNumber || '',
      instruction: settings.rocketInstruction || 'Please Send Money to the Rocket Personal number above. Enter your Rocket wallet number and your transaction reference ID (TxnID) below.',
    },
    card: {
      enabled: settings.cardEnabled,
      name: settings.cardName || 'Secure SSL Gateway',
      logo: settings.cardLogo || '',
      number: settings.cardNumber || 'Secure 256-Bit Sandbox Handshake',
      instruction: settings.cardInstruction || 'Please authorize card payment securely via our sandbox-integrated SSL connection gateway.',
      gatewayLink: settings.cardGatewayLink || '',
    }
  });

  // Pre-bundled SVG paths/data URLs for fallback/preset options
  const defaultLogos = {
    cod: 'https://cdn-icons-png.flaticon.com/512/6491/6491517.png',
    bkash: 'https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg',
    nagad: 'https://download.logo.wine/logo/Nagad/Nagad-Vertical-Logo.wine.svg',
    rocket: 'https://www.logo.wine/a/logo/Dutch_Bangla_Bank/Dutch_Bangla_Bank-Logo.wine.svg',
    card: 'https://cdn-icons-png.flaticon.com/512/349/349228.png',
  };

  const handleInputChange = (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card', field: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [methodId]: {
        ...prev[methodId],
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(methodId, 'logo', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    handleInputChange(methodId, 'logo', defaultLogos[methodId]);
  };

  const handleRemoveLogo = (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    handleInputChange(methodId, 'logo', '');
  };

  // Save changes specifically for one payment method
  const handleSaveMethod = (methodId: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card') => {
    const data = configs[methodId];
    
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
      updates.cardGatewayLink = data.gatewayLink;
    }

    updateSettings(updates);
    triggerFeedback(`${configs[methodId].name} updated successfully!`);
  };

  // Global Save All
  const handleSaveAll = () => {
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
    triggerFeedback("All payment gateways saved successfully!");
  };

  const triggerFeedback = (message: string) => {
    setSaveFeedback(message);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  // Helper render for method cards
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
        {/* Border strip to indicate active state */}
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

          {/* Clean Rectangular Enable/Disable Toggle button */}
          <button
            type="button"
            onClick={() => handleInputChange(id, 'enabled', !data.enabled)}
            className={`px-3 py-1.5 border text-[10px] font-black uppercase tracking-widest select-none transition-colors cursor-pointer ${
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
                    className="absolute top-1 right-1 p-1.5 bg-neutral-900 hover:bg-red-600 text-white transition-colors cursor-pointer select-none"
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
                    className="text-[9px] text-[#000000] font-bold uppercase underline hover:no-underline select-none cursor-pointer"
                  >
                    Use Recommended Preset
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 border border-neutral-300 text-[10px] font-bold uppercase tracking-wider bg-white hover:bg-neutral-50 cursor-pointer select-none text-neutral-700 text-center">
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
                  className="px-2 py-2 border border-neutral-200 text-[10px] font-bold uppercase tracking-wider bg-slate-50 hover:bg-neutral-100 text-neutral-600 cursor-pointer select-none"
                >
                  Apply Preset
                </button>
              )}
            </div>
            
            {/* Displaying preset preview small text */}
            <div className="bg-neutral-100 p-2 text-[9px] text-neutral-500 rounded-none leading-relaxed">
              Accepts PNG/JPG file format. Logo is converted to Base64 to secure seamless real-time loading anywhere.
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
                  className="w-full h-10 border border-neutral-200 px-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900"
                  placeholder={`${title} Name`}
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
                    className="w-full h-10 border border-neutral-200 px-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 font-mono"
                    placeholder={id === 'card' ? 'e.g. Sandbox Processor SSL' : 'e.g. 017XXXXXXXX'}
                  />
                </div>
              )}
            </div>

            {hasGatewayLink && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Payment Gateway Proxy Link (Optional)</label>
                <input 
                  type="text"
                  value={data.gatewayLink || ''}
                  onChange={(e) => handleInputChange(id, 'gatewayLink', e.target.value)}
                  className="w-full h-10 border border-neutral-200 px-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900"
                  placeholder="https://sandbox.payment-gateway.com/auth"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Instruction / Gateway Text</label>
              <textarea 
                value={data.instruction}
                onChange={(e) => handleInputChange(id, 'instruction', e.target.value)}
                rows={3}
                className="w-full border border-neutral-200 p-3 text-xs font-semibold focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900 leading-relaxed resize-none"
                placeholder="Step-by-step transaction instructions..."
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 text-neutral-400 text-[10px] font-bold uppercase">
                {data.enabled ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600">Active on Checkout</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-red-500">Hidden from customers</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSaveMethod(id)}
                className="flex items-center gap-1.5 bg-neutral-900 hover:bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer select-none rounded-none"
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
      {/* Dynamic Save Notification */}
      {saveFeedback && (
        <div className="fixed top-20 right-6 z-[110] bg-neutral-900 text-white border border-neutral-801 px-4 py-3 shadow-xl flex items-center gap-2.5 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">{saveFeedback}</span>
        </div>
      )}

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
                  // If enabling Personal, Merchant must be disabled automatically
                  paymentMerchantActive: newActive ? false : settings.paymentMerchantActive
                });
                triggerFeedback(newActive ? "Payment Personal ACTIVED & Merchant disabled" : "Payment Personal Deactived");
              }}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
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
            className="bg-neutral-900 hover:bg-black text-white border border-neutral-950 h-10 px-6 text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none flex items-center justify-center gap-2"
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
      <div className="space-y-6">
        {renderCard('cod', '1. Cash On Delivery (COD)', false)}
        
        {renderCard('bkash', '2. bKash mobile banking', true)}
        
        {renderCard('nagad', '3. Nagad mobile banking', true)}
        
        {renderCard('rocket', '4. Rocket DBBL banking', true)}
        
        {renderCard('card', '5. Digital Card Gateway (PCI-Certified)', true, true)}
      </div>

      {/* Bottom Legal bar */}
      <div className="bg-neutral-50 border border-neutral-200 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-neutral-500 leading-relaxed font-semibold uppercase tracking-wide">
          Notice: Verified checkout payment rules are completely automated. If a certain channel is marked "DISABLED" in this panel, its field will automatically disappear from the checkout screen option for customers without causing manual errors.
        </p>
      </div>
    </div>
  );
}
