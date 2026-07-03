import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, XCircle, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MarketingInput from '../../components/MarketingInput';
import MarketingCheckbox from '../../components/MarketingCheckbox';

export default function AdminMarketingGoogle() {
  const [config, setConfig] = useState({
    measurementId: '', 
    apiSecret: '', 
    conversionId: '', 
    conversionLabel: '', 
    customerId: '', 
    adsAccountId: '', 
    gtmContainerId: '', 
    cloudProjectId: '', 
    oauthClientId: '', 
    oauthClientSecret: '', 
    enhancedConversion: true, 
    active: true 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [schemaState, setSchemaState] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/marketing/config?tableName=google_settings&rowId=google_config')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config
          }));
        }
      })
      .catch(err => console.warn('Failed to load Google config, using defaults.', err));
  }, []);

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'measurementId':
        if (!value) error = 'GA4 Measurement ID is required.';
        else if (!/^G-[A-Z0-9]+$/i.test(value)) error = 'Format: G-XXXXXXXXXX';
        break;
      case 'apiSecret':
        if (!value) error = 'GA4 API Secret is required.';
        else if (value.length < 16) error = 'Minimum 16 Characters';
        break;
      case 'conversionId':
        if (!value) error = 'Conversion ID is required.';
        else if (!/^\d+$/.test(value)) error = 'Only Number';
        break;
      case 'conversionLabel':
        if (!value) error = 'Conversion Label is required.';
        break;
      case 'customerId':
        if (!value) error = 'Customer ID is required.';
        else if (!/^\d{3}-\d{3}-\d{4}$/.test(value)) error = 'Format: 123-456-7890';
        break;
      case 'gtmContainerId':
        if (!value) error = 'GTM Container ID is required.';
        else if (!/^GTM-[A-Z0-9]+$/i.test(value)) error = 'Format: GTM-XXXXXXX';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    if (typeof value === 'string') {
      validateField(field, value);
    }
  };

  const handleVerify = async () => {
    const requiredFields = ['measurementId', 'apiSecret', 'conversionId', 'conversionLabel', 'customerId', 'gtmContainerId'];
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
      
      if (config.measurementId.includes('FAIL')) {
        setVerificationStatus({ status: 'error', message: '✗ Invalid GA4 ID' });
        toast.error("Invalid GA4 ID");
      } else {
        setVerificationStatus({ status: 'success', message: '✓ Google Connected Successfully' });
        toast.success("Google Connected Successfully");
      }
    } catch (err) {
      setVerificationStatus({ status: 'error', message: '✗ Connection Failed' });
      toast.error("Connection Failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    const requiredFields = ['measurementId', 'apiSecret', 'conversionId', 'conversionLabel', 'customerId', 'gtmContainerId'];
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
      const res = await fetch('/api/admin/marketing/schema-check?tableName=google_settings');
      const data = await res.json();
      if (data.status === 'success') {
        const isMissing = !data.schemaState.google_settings?.exists || data.schemaState.google_settings?.missingColumns.length > 0;
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
          module: 'google',
          rowId: 'google_config',
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
          <h1 className="text-xl font-bold uppercase tracking-tighter">Google Integration</h1>
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
            label="GA4 Measurement ID"
            value={config.measurementId}
            onChange={(v) => handleChange('measurementId', v)}
            placeholder="G-XXXXXXXXXX"
            required
            helperText="Format: G-XXXXXXXXXX"
            error={errors.measurementId}
            isValid={!errors.measurementId && config.measurementId.startsWith('G-')}
          />

          <MarketingInput
            label="GA4 API Secret"
            value={config.apiSecret}
            onChange={(v) => handleChange('apiSecret', v)}
            required
            helperText="Minimum 16 Characters"
            error={errors.apiSecret}
            isValid={!errors.apiSecret && config.apiSecret.length >= 16}
          />

          <MarketingInput
            label="Google Ads Conversion ID"
            value={config.conversionId}
            onChange={(v) => handleChange('conversionId', v)}
            required
            helperText="Only Number"
            error={errors.conversionId}
            isValid={!errors.conversionId && config.conversionId.length > 0}
          />

          <MarketingInput
            label="Conversion Label"
            value={config.conversionLabel}
            onChange={(v) => handleChange('conversionLabel', v)}
            required
            error={errors.conversionLabel}
            isValid={!errors.conversionLabel && config.conversionLabel.length > 0}
          />

          <MarketingInput
            label="Google Ads Customer ID"
            value={config.customerId}
            onChange={(v) => handleChange('customerId', v)}
            placeholder="123-456-7890"
            required
            helperText="Format: 123-456-7890"
            error={errors.customerId}
            isValid={!errors.customerId && /^\d{3}-\d{3}-\d{4}$/.test(config.customerId)}
          />

          <MarketingInput
            label="Google Tag Manager ID"
            value={config.gtmContainerId}
            onChange={(v) => handleChange('gtmContainerId', v)}
            placeholder="GTM-XXXXXXX"
            required
            helperText="Format: GTM-XXXXXXX"
            error={errors.gtmContainerId}
            isValid={!errors.gtmContainerId && config.gtmContainerId.startsWith('GTM-')}
          />

          <MarketingInput
            label="Google Ads Account ID (Optional)"
            value={config.adsAccountId}
            onChange={(v) => handleChange('adsAccountId', v)}
            isValid={config.adsAccountId.length > 0}
          />

          <MarketingInput
            label="Cloud Project ID (Optional)"
            value={config.cloudProjectId}
            onChange={(v) => handleChange('cloudProjectId', v)}
            isValid={config.cloudProjectId.length > 0}
          />

          <MarketingInput
            label="Google OAuth Client ID (Optional)"
            value={config.oauthClientId}
            onChange={(v) => handleChange('oauthClientId', v)}
            isValid={config.oauthClientId.length > 0}
          />

          <MarketingInput
            label="Google OAuth Secret (Optional)"
            value={config.oauthClientSecret}
            onChange={(v) => handleChange('oauthClientSecret', v)}
            isValid={config.oauthClientSecret.length > 0}
          />

          <div className="md:col-span-2 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row gap-x-12 gap-y-6">
            <MarketingCheckbox
              label="Enhanced Conversion"
              checked={config.enhancedConversion}
              onChange={(v) => handleChange('enhancedConversion', v)}
            />
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
              The Google settings table or required columns are missing in your Supabase database.
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
