import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { 
  Shield, 
  Save, 
  AlertCircle, 
  Info, 
  Check, 
  Settings, 
  Cpu, 
  Globe,
  Database
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminPaymentMerchant() {
  const { settings, updateSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Database integration state
  const [dbWarning, setDbWarning] = useState<string | null>(null);
  const [sqlGuide, setSqlGuide] = useState<string>('');
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Local config fields - empty by default!
  const [merchantGateway, setMerchantGateway] = useState<'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'other'>('sslcommerz');
  const [merchantName, setMerchantName] = useState('');
  const [merchantNumber, setMerchantNumber] = useState('');
  const [merchantApiKey, setMerchantApiKey] = useState('');
  const [merchantApiSecret, setMerchantApiSecret] = useState('');
  const [merchantUsername, setMerchantUsername] = useState('');
  const [merchantPassword, setMerchantPassword] = useState('');
  const [merchantStoreId, setMerchantStoreId] = useState('');
  const [merchantCallbackUrl, setMerchantCallbackUrl] = useState('');
  const [merchantSuccessUrl, setMerchantSuccessUrl] = useState('');
  const [merchantCancelUrl, setMerchantCancelUrl] = useState('');

  // Fetch saved merchant gateway configuration from DB
  useEffect(() => {
    const fetchMerchant = async () => {
      setLoading(true);
      try {
        // Run schema check first
        const sCheck = await fetch('/api/admin/payment-methods/schema-check');
        const sData = await sCheck.json();
        if (sData.status === 'success' && sData.schemaState?.payment_methods) {
          const pm = sData.schemaState.payment_methods;
          if (!pm.exists || pm.missingColumns?.length > 0) {
            setDbWarning("table_missing");
            setSqlGuide(pm.sqlGuide || '');
          }
        }

        // Fetch actual values
        const response = await fetch('/api/admin/payment-methods');
        const data = await response.json();
        if (data.status === 'success' && data.methods) {
          const m = data.methods.find((x: any) => x.id === 'merchant' || x.payment_type === 'merchant');
          if (m) {
            setMerchantGateway(m.payment_code || 'sslcommerz');
            setMerchantName(m.payment_name || '');
            setMerchantNumber(m.account_number || '');
            setMerchantApiKey(m.api_key || '');
            setMerchantApiSecret(m.secret_key || '');
            setMerchantUsername(m.username || '');
            setMerchantPassword(m.password || '');
            setMerchantStoreId(m.merchant_id || '');
            setMerchantCallbackUrl(m.callback_url || '');
            setMerchantSuccessUrl(m.success_url || '');
            setMerchantCancelUrl(m.cancel_url || '');
          }
        }
      } catch (err) {
        console.error("Failed to load merchant settings from DB:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchant();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (dbWarning === "table_missing") {
      setShowSchemaModal(true);
      return;
    }

    try {
      const response = await fetch('/api/admin/payment-methods/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: {
            id: 'merchant',
            payment_type: 'merchant',
            payment_code: merchantGateway,
            payment_name: merchantName,
            account_number: merchantNumber,
            merchant_id: merchantStoreId,
            api_key: merchantApiKey,
            secret_key: merchantApiSecret,
            username: merchantUsername,
            password: merchantPassword,
            callback_url: merchantCallbackUrl,
            success_url: merchantSuccessUrl,
            cancel_url: merchantCancelUrl,
            enabled: settings.paymentMerchantActive
          }
        })
      });

      const result = await response.json();
      if (result.status === 'success') {
        toast.success("⚡ Merchant gateway parameters saved successfully to Supabase!");
        
        // Sync to legacy settings store to maintain checkout compatibility
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
      } else {
        toast.error(result.error || "Failed to save settings");
      }
    } catch (err: any) {
      toast.error("Network error: " + err.message);
    }
  };

  // Toggles the merchant system active state
  const handleToggleActive = () => {
    const nextActive = !settings.paymentMerchantActive;
    updateSettings({
      paymentMerchantActive: nextActive,
      // If turning merchant ON, we MUST automatically set personal to OFF
      paymentPersonalActive: nextActive ? false : settings.paymentPersonalActive,
    });
    toast.success(nextActive ? '● Merchant gateway ACTIVATED & Personal system disabled' : '○ Merchant gateway deactivated');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* DB Schema Missing Header Warning */}
      {dbWarning === "table_missing" && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 font-mono text-xs text-red-900 uppercase space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-black">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>Database Table missing: public.payment_methods</span>
            </div>
            <button 
              onClick={() => setShowSchemaModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-[4px]"
            >
              Configure Schema SQL
            </button>
          </div>
          <p className="font-sans font-bold text-[11px] text-red-800">
            Database storage is not prepared. Click 'Configure Schema SQL' to view and copy the initialization migration script for your Supabase backend.
          </p>
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
            এটি System API-ভিত্তিক Automatic Collection Setup। Checkout Payment সাথে সাথেই API Verification এর মাধ্যমে অর্ডার স্বয়ংক্রিয় হবে।
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active / Inactive switch with mutual sync */}
          <div className="flex items-center gap-2 border border-neutral-200 px-4 py-2 bg-neutral-50">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">SYSTEM STATE</span>
            <button
              type="button"
              onClick={handleToggleActive}
              className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest transition-colors rounded-[4px] ${
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
      {loading ? (
        <div className="text-center py-12 bg-white border border-neutral-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900" />
          <p className="text-xs font-black uppercase tracking-widest mt-4 text-neutral-500">Loading DB configuration...</p>
        </div>
      ) : (
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
                    className="w-full h-11 border border-neutral-200 px-3 text-xs font-bold uppercase focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900"
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
                    <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 rounded-[4px] ${merchantGateway === 'bkash' ? 'bg-[#E2125B]/5 border-[#E2125B] text-[#E2125B]' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
                      bKash Pay
                    </div>
                    <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 rounded-[4px] ${merchantGateway === 'nagad' ? 'bg-[#F25C22]/5 border-[#F25C22] text-[#F25C22]' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
                      Nagad Auto
                    </div>
                    <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 rounded-[4px] ${merchantGateway === 'rocket' ? 'bg-[#8C3494]/5 border-[#8C3494] text-[#8C3494]' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
                      Rocket DBBL
                    </div>
                    <div className={`p-2 border text-[10px] font-bold text-center uppercase flex items-center justify-center gap-1.5 rounded-[4px] ${merchantGateway === 'sslcommerz' ? 'bg-zinc-950 text-white border-zinc-950' : 'bg-neutral-50/50 border-neutral-200 text-neutral-400'}`}>
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
                    className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                    placeholder="Enter Merchant Name"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Merchant Number / Account ID</label>
                  <input 
                    type="text" 
                    value={merchantNumber} 
                    onChange={(e) => setMerchantNumber(e.target.value)} 
                    className="w-full h-11 border border-neutral-200 px-3 text-xs font-mono focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                    placeholder="Enter Merchant Number / Account ID"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Key</label>
                  <input 
                    type="password" 
                    value={merchantApiKey} 
                    onChange={(e) => setMerchantApiKey(e.target.value)} 
                    className="w-full h-11 border border-neutral-200 px-3 text-xs font-mono focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                    placeholder="Enter API Key"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Secret Token</label>
                  <input 
                    type="password" 
                    value={merchantApiSecret} 
                    onChange={(e) => setMerchantApiSecret(e.target.value)} 
                    className="w-full h-11 border border-neutral-200 px-3 text-xs font-mono focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                    placeholder="Enter API Secret Token"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Username</label>
                  <input 
                    type="text" 
                    value={merchantUsername} 
                    onChange={(e) => setMerchantUsername(e.target.value)} 
                    className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                    placeholder="Enter API Username"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">API Password</label>
                  <input 
                    type="password" 
                    value={merchantPassword} 
                    onChange={(e) => setMerchantPassword(e.target.value)} 
                    className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                    placeholder="Enter API Password"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 tracking-wider block">Store ID (for payment gateway registration)</label>
                  <input 
                    type="text" 
                    value={merchantStoreId} 
                    onChange={(e) => setMerchantStoreId(e.target.value)} 
                    className="w-full h-11 border border-neutral-200 px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                    placeholder="Enter Store ID"
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
                      className="w-full h-10 border border-neutral-200 px-2.5 text-[11px] font-mono focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                      placeholder="Enter Callback URL"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Success Gateway URL</label>
                    <input 
                      type="text" 
                      value={merchantSuccessUrl} 
                      onChange={(e) => setMerchantSuccessUrl(e.target.value)} 
                      className="w-full h-10 border border-neutral-200 px-2.5 text-[11px] font-mono focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                      placeholder="Enter Success URL"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-neutral-400 tracking-wider block">Cancel Gateway URL</label>
                    <input 
                      type="text" 
                      value={merchantCancelUrl} 
                      onChange={(e) => setMerchantCancelUrl(e.target.value)} 
                      className="w-full h-10 border border-neutral-200 px-2.5 text-[11px] font-mono focus:outline-none focus:border-neutral-900 rounded-[4px] bg-white text-neutral-900 font-semibold" 
                      placeholder="Enter Cancel URL"
                    />
                  </div>

                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-neutral-950 hover:bg-black text-white h-11 px-8 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 rounded-[4px]"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Save Merchant Config</span>
                </button>
              </div>

            </div>
          </div>

        </form>
      )}

      {/* Database Schema Migration Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-2xl w-full border border-neutral-300 shadow-2xl rounded-none flex flex-col max-h-[90vh]">
            <h2 className="text-lg font-black uppercase tracking-tight mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-red-600" />
              <span>Supabase Schema Required</span>
            </h2>
            <p className="text-xs text-neutral-500 mb-4 uppercase font-bold leading-relaxed">
              The <b>payment_methods</b> table and structured columns are required to run this database-driven system. Please run this script in your <b>Supabase SQL Editor</b>:
            </p>

            <div className="bg-neutral-950 p-4 font-mono text-[10.5px] text-neutral-300 overflow-y-auto max-h-[40vh] border border-neutral-800 relative select-text text-left whitespace-pre-wrap">
              {sqlGuide}
            </div>

            <div className="flex justify-between items-center gap-3 mt-6 pt-4 border-t border-neutral-100">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sqlGuide);
                  toast.success("SQL script copied successfully!");
                }}
                className="bg-neutral-900 hover:bg-black text-white px-5 h-10 text-[10px] font-black uppercase tracking-widest rounded-[4px]"
              >
                Copy SQL Script
              </button>
              <button 
                onClick={() => setShowSchemaModal(false)}
                className="px-6 h-10 border border-neutral-200 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-50 rounded-[4px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
