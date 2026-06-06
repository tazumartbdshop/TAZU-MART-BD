import React, { useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
  Shield, 
  Save, 
  AlertCircle, 
  Info, 
  Check, 
  Settings, 
  Cpu, 
  Layers,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

export default function AdminPaymentMerchant() {
  const { settings, updateSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Local config fields
  const [merchantGateway, setMerchantGateway] = useState<'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'other'>(
    settings.merchantGateway || 'sslcommerz'
  );
  const [merchantName, setMerchantName] = useState(settings.merchantName || '');
  const [merchantNumber, setMerchantNumber] = useState(settings.merchantNumber || '');
  const [merchantApiKey, setMerchantApiKey] = useState(settings.merchantApiKey || '');
  const [merchantApiSecret, setMerchantApiSecret] = useState(settings.merchantApiSecret || '');
  const [merchantUsername, setMerchantUsername] = useState(settings.merchantUsername || '');
  const [merchantPassword, setMerchantPassword] = useState(settings.merchantPassword || '');
  const [merchantStoreId, setMerchantStoreId] = useState(settings.merchantStoreId || '');
  const [merchantCallbackUrl, setMerchantCallbackUrl] = useState(settings.merchantCallbackUrl || '');
  const [merchantSuccessUrl, setMerchantSuccessUrl] = useState(settings.merchantSuccessUrl || '');
  const [merchantCancelUrl, setMerchantCancelUrl] = useState(settings.merchantCancelUrl || '');

  const triggerFeedback = (message: string) => {
    setSaveFeedback(message);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      merchantGateway,
      merchantName,
      merchantNumber,
      merchantApiKey,
      merchantApiSecret,
      merchantUsername,
      merchantPassword,
      merchantStoreId,
      merchantCallbackUrl,
      merchantSuccessUrl,
      merchantCancelUrl,
    });
    triggerFeedback('⚡ Merchant gateway parameters saved successfully!');
  };

  // Toggles the merchant system active state
  const handleToggleActive = () => {
    const nextActive = !settings.paymentMerchantActive;
    updateSettings({
      paymentMerchantActive: nextActive,
      // If turning merchant ON, we MUST automatically set personal to OFF
      paymentPersonalActive: nextActive ? false : settings.paymentPersonalActive,
    });
    triggerFeedback(nextActive ? '● Merchant gateway ACTIVATED & Personal system disabled' : '○ Merchant gateway de-activated');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* Save Toast notification */}
      {saveFeedback && (
        <div className="fixed top-20 right-6 z-[110] bg-neutral-900 text-white border border-neutral-800 px-4 py-3 shadow-xl flex items-center gap-2.5 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">{saveFeedback}</span>
        </div>
      )}

      {/* Mutual Exclusive Warnings */}
      {settings.paymentPersonalActive && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 font-mono text-xs text-amber-900 uppercase space-y-1">
          <div className="flex items-center gap-2 font-black">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <span>সতর্কতা / warning: Payment Personal বর্তমানে Active আছে।</span>
          </div>
          <p className="font-sans font-bold text-[11px] text-amber-850">
            Payment Merchant Active করতে চাইলে প্রথমে Payment Personal Disable করুন। আপনি নিচে Toggle টিতে চাপ দিলে Payment Personal স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।
          </p>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-650" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              🌐 PAYMENT MERCHANT (AUTOMATIC GATEWAYS)
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            এটি System API-ভিত্তিক Automatic Collection Setup। Checkout Payment সাথে সাথেই API Verification এর মাধ্যমে অর্ডার স্বয়ংক্রিয়ভাবে সফল হবে।
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active / Inactive switch with mutual sync */}
          <div className="flex items-center gap-2 border border-neutral-200 px-4 py-2 bg-neutral-50">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">SYSTEM STATE</span>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
                settings.paymentMerchantActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-zinc-200 text-zinc-550'
              }`}
            >
              {settings.paymentMerchantActive ? '● ACTIVE' : '○ INACTIVE'}
            </button>
          </div>
        </div>
      </div>

      {!settings.paymentMerchantActive && (
        <div className="bg-rose-50/70 border border-rose-150 p-4 text-rose-850 text-xs font-mono uppercase tracking-wide">
          ⚠️ NOTICE: Payment Merchant system is currently INACTIVE. Customers won't see merchant options during Checkout.
        </div>
      )}

      {/* Layout Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Gateway Selection Details (Left Grid Column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Cpu className="w-4 h-4 text-neutral-500" />
              SELECT ACTIVE GATEWAY
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Gateway Service Provider</label>
                <select
                  value={merchantGateway}
                  onChange={(e) => setMerchantGateway(e.target.value as any)}
                  className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold uppercase focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900"
                >
                  <option value="sslcommerz">SSLCommerz Sandbox/Live</option>
                  <option value="bkash">bKash Merchant API (v3.0)</option>
                  <option value="nagad">Nagad Merchant API</option>
                  <option value="rocket">Rocket DBBL API Gateway</option>
                  <option value="other">Other Global Custom Gateway</option>
                </select>
              </div>

              {/* Graphical Badges for Visual Trust */}
              <div className="pt-2">
                <label className="text-[9px] font-black uppercase text-neutral-400 tracking-widest block mb-2">Supported API Logos</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 ${merchantGateway === 'bkash' ? 'bg-[#E2125B]/5 border-[#E2125B] text-[#E2125B]' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
                    bKash Pay
                  </div>
                  <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 ${merchantGateway === 'nagad' ? 'bg-[#F25C22]/5 border-[#F25C22] text-[#F25C22]' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
                    Nagad Auto
                  </div>
                  <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 ${merchantGateway === 'rocket' ? 'bg-[#8C3494]/5 border-[#8C3494] text-[#8C3494]' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
                    Rocket DBBL
                  </div>
                  <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 ${merchantGateway === 'sslcommerz' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
                    SSLCOMMERZ
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 p-3 text-[10.5px] text-neutral-500 leading-relaxed space-y-1.5 font-sans">
                <span className="font-extrabold text-[11px] block uppercase text-neutral-700">What is Merchant mode?</span>
                <p>
                  Automatic verification avoids user mistakes by requiring standard API token checks on merchant callbacks. Orders compile automatically on verification confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configurations Fields form parameters (Right Grid Column) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-neutral-500" />
                API ENDPOINT & MERCHANT KEYS CONFIG
              </h3>
              <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 uppercase tracking-wide">
                Secure Handshake
              </span>
            </div>

            {/* Config Fields Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Merchant Name</label>
                <input 
                  type="text" 
                  value={merchantName} 
                  onChange={(e) => setMerchantName(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. Tazumart Merchant Ltd"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Merchant Number / Account ID</label>
                <input 
                  type="text" 
                  value={merchantNumber} 
                  onChange={(e) => setMerchantNumber(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs font-mono focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. 01700990099"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Key</label>
                <input 
                  type="password" 
                  value={merchantApiKey} 
                  onChange={(e) => setMerchantApiKey(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs font-mono focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. api_key_bkash_..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Secret Token</label>
                <input 
                  type="password" 
                  value={merchantApiSecret} 
                  onChange={(e) => setMerchantApiSecret(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs font-mono focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. merchant_secret_..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Username</label>
                <input 
                  type="text" 
                  value={merchantUsername} 
                  onChange={(e) => setMerchantUsername(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. tazum_mfs_v3"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Password</label>
                <input 
                  type="password" 
                  value={merchantPassword} 
                  onChange={(e) => setMerchantPassword(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Store ID (for payment gateway registration)</label>
                <input 
                  type="text" 
                  value={merchantStoreId} 
                  onChange={(e) => setMerchantStoreId(e.target.value)} 
                  className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                  placeholder="e.g. TAZUM5019"
                />
              </div>

            </div>

            {/* Redirect / Handshake Callback URLs configs */}
            <div className="pt-4 border-t border-neutral-100 space-y-4">
              <h4 className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-650" />
                Callback & Handshake Target Routes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Callback IPN URL</label>
                  <input 
                    type="text" 
                    value={merchantCallbackUrl} 
                    onChange={(e) => setMerchantCallbackUrl(e.target.value)} 
                    className="w-full h-10 border border-neutral-200 px-2.5 text-[11px] font-mono focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                    placeholder="https://retailer.com/api/payment/callback"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Success Gateway URL</label>
                  <input 
                    type="text" 
                    value={merchantSuccessUrl} 
                    onChange={(e) => setMerchantSuccessUrl(e.target.value)} 
                    className="w-full h-10 border border-neutral-200 px-2.5 text-[11px] font-mono focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                    placeholder="https://retailer.com/checkout/success"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Cancel Gateway URL</label>
                  <input 
                    type="text" 
                    value={merchantCancelUrl} 
                    onChange={(e) => setMerchantCancelUrl(e.target.value)} 
                    className="w-full h-10 border border-neutral-200 px-2.5 text-[11px] font-mono focus:outline-none focus:border-neutral-900 rounded-none bg-white text-neutral-900" 
                    placeholder="https://retailer.com/checkout/cancel"
                  />
                </div>

              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                type="submit"
                className="bg-neutral-950 hover:bg-black text-white h-11 px-8 text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save Merchant Config</span>
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
