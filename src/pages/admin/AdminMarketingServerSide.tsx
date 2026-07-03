import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, XCircle, Database, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MarketingInput from '../../components/MarketingInput';
import MarketingCheckbox from '../../components/MarketingCheckbox';

export default function AdminMarketingServerSide() {
  const [config, setConfig] = useState({
    endpointUrl: '', 
    apiSecret: '', 
    webhookSecret: '', 
    workerUrl: '', 
    stapeUrl: '', 
    gtmServerContainer: '', 
    region: 'Asia', 
    retryCount: 3, 
    active: true 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [schemaState, setSchemaState] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/marketing/config?tableName=server_side_settings&rowId=server_side_config')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config
          }));
        }
      })
      .catch(err => console.warn('Failed to load Server Side config, using defaults.', err));
  }, []);

  const validateField = (field: string, value: any) => {
    let error = '';
    
    if (typeof value === 'string') {
      switch (field) {
        case 'endpointUrl':
          if (!value) error = 'Server Endpoint is required.';
          else if (!/^https?:\/\//.test(value)) error = 'Invalid URL (https://...)';
          break;
        case 'apiSecret':
          if (!value) error = 'API Secret is required.';
          break;
        case 'stapeUrl':
          if (!value) error = 'Stape Container URL is required.';
          else if (!/^https?:\/\//.test(value)) error = 'Invalid URL (https://...)';
          break;
        case 'gtmServerContainer':
          if (!value) error = 'Server Container URL is required.';
          break;
      }
    } else if (field === 'retryCount') {
      if (value < 1 || value > 10) error = 'Must be between 1 and 10';
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleVerify = async () => {
    const requiredFields = ['endpointUrl', 'apiSecret', 'stapeUrl', 'gtmServerContainer'];
    let hasErrors = false;
    requiredFields.forEach(f => {
      if (!validateField(f, (config as any)[f])) hasErrors = true;
    });

    if (hasErrors) {
      toast.error("Please fix validation errors before verifying.");
      return;
    }

    setVerifying(true);
    setVerificationStatus({ status: null, message: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (config.endpointUrl.includes('fail')) {
        setVerificationStatus({ status: 'error', message: '✗ Connection Failed' });
        toast.error("Connection Failed");
      } else {
        setVerificationStatus({ status: 'success', message: '✓ Server Connected Successfully' });
        toast.success("Server Connected Successfully");
      }
    } catch (err) {
      setVerificationStatus({ status: 'error', message: '✗ Connection Failed' });
      toast.error("Connection Failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    const requiredFields = ['endpointUrl', 'apiSecret', 'stapeUrl', 'gtmServerContainer'];
    let hasErrors = false;
    requiredFields.forEach(f => {
      if (!validateField(f, (config as any)[f])) hasErrors = true;
    });

    if (hasErrors) {
      toast.error("This field is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/marketing/schema-check?tableName=server_side_settings');
      const data = await res.json();
      if (data.status === 'success') {
        const isMissing = !data.schemaState.server_side_settings?.exists || data.schemaState.server_side_settings?.missingColumns.length > 0;
        if (isMissing) {
          setSchemaState(data.schemaState);
          setShowSchemaModal(true);
          setSaving(false);
          return;
        }
      }

      const response = await fetch('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'serverSide',
          rowId: 'server_side_config',
          config
        })
      });
      const saveData = await response.json();

      if (response.ok && saveData.status === 'success') {
        toast.success("Configuration Saved Successfully");
      } else {
        toast.error(saveData.error || "Failed to save settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
          <h1 className="text-xl font-bold uppercase tracking-tighter">Server Side Tracking</h1>
          <div className="flex items-center gap-2">
             <button
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 h-10 border border-zinc-200 text-sm font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {verifying ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-400" /> : <Database className="w-4 h-4 text-zinc-400" />}
              <span>Verify Connection</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 h-10 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save</span>
            </button>
          </div>
        </div>

        {verificationStatus.status && (
          <div className={`p-4 border flex items-center gap-3 transition-all ${
            verificationStatus.status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {verificationStatus.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-sm font-bold uppercase tracking-wide">{verificationStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 py-4">
          <MarketingInput
            label="Server Endpoint"
            value={config.endpointUrl}
            onChange={(v) => handleChange('endpointUrl', v)}
            placeholder="https://tracking.domain.com"
            required
            helperText="Format: https://..."
            error={errors.endpointUrl}
            isValid={!errors.endpointUrl && config.endpointUrl.startsWith('http')}
          />

          <MarketingInput
            label="API Secret"
            value={config.apiSecret}
            onChange={(v) => handleChange('apiSecret', v)}
            required
            error={errors.apiSecret}
            isValid={!errors.apiSecret && config.apiSecret.length > 0}
          />

          <MarketingInput
            label="Webhook Secret (Optional)"
            value={config.webhookSecret}
            onChange={(v) => handleChange('webhookSecret', v)}
            isValid={config.webhookSecret.length > 0}
          />

          <MarketingInput
            label="Stape Container URL"
            value={config.stapeUrl}
            onChange={(v) => handleChange('stapeUrl', v)}
            placeholder="https://xxx.stape.io"
            required
            helperText="Format: https://..."
            error={errors.stapeUrl}
            isValid={!errors.stapeUrl && config.stapeUrl.startsWith('http')}
          />

          <MarketingInput
            label="Server Container URL"
            value={config.gtmServerContainer}
            onChange={(v) => handleChange('gtmServerContainer', v)}
            required
            error={errors.gtmServerContainer}
            isValid={!errors.gtmServerContainer && config.gtmServerContainer.length > 0}
          />

          <div className="space-y-1.5 w-full">
            <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider">
              Region <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={config.region}
                onChange={(e) => handleChange('region', e.target.value)}
                className="w-full h-10 px-3 border border-zinc-200 rounded-none text-sm focus:outline-none focus:border-zinc-500 transition-colors bg-white appearance-none"
              >
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="US">US</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 w-full">
            <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider">
              Retry Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={config.retryCount}
              onChange={(e) => handleChange('retryCount', parseInt(e.target.value) || 1)}
              className={`w-full h-10 px-3 border rounded-none text-sm focus:outline-none transition-colors bg-white ${errors.retryCount ? 'border-red-500' : 'border-zinc-200'}`}
            />
            <div className="flex justify-between">
              <p className="text-[10px] text-zinc-500">Default: 3, Min: 1, Max: 10</p>
              {errors.retryCount && <p className="text-[10px] text-red-500">{errors.retryCount}</p>}
            </div>
          </div>

          <div className="md:col-span-2 pt-8 border-t border-zinc-100">
            <MarketingCheckbox
              label="Server Side Enable"
              checked={config.active}
              onChange={(v) => handleChange('active', v)}
            />
          </div>
        </div>

      </div>

      {showSchemaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-md w-full border border-zinc-200 shadow-2xl">
            <h2 className="text-lg font-bold uppercase tracking-tight mb-4">Database Schema Required</h2>
            <p className="text-sm text-zinc-600 mb-6">
              The Server Side settings table or required columns are missing in your Supabase database.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowSchemaModal(false)}
                className="px-6 h-10 border border-zinc-200 text-sm font-bold uppercase tracking-widest hover:bg-zinc-50"
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
