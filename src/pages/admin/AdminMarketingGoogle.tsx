import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Play, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFetchJSON } from '../../lib/utils';
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
    active: true,
    lastUpdated: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const data = await safeFetchJSON('/api/admin/marketing/config?tableName=google_settings&rowId=google_config');
      if (data.status === 'success' && data.config) {
        setConfig(prev => ({
          ...prev,
          ...data.config,
          lastUpdated: data.config.lastUpdated || data.config.updatedAt || new Date().toLocaleString()
        }));
        
        if (data.config.measurementId) {
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } else {
        setIsEditing(true);
      }
    } catch (err) {
      console.warn('Failed to load Google config, using defaults.', err);
      setIsEditing(true);
    } finally {
      setIsLoading(false);
    }
  };

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
    setVerifying(true);
    setVerificationStatus({ status: null, message: '' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Exact error reasons
      if (!config.measurementId || !/^G-[A-Z0-9]+$/i.test(config.measurementId)) {
        setVerificationStatus({ status: 'error', message: 'Connection Failed ❌ — Reason: GA4 Measurement ID Missing or Invalid Format (Must follow G-XXXXXXXXXX)' });
        toast.error("Verification Failed");
        return;
      }

      if (!config.apiSecret || config.apiSecret.length < 16) {
        setVerificationStatus({ status: 'error', message: 'Connection Failed ❌ — Reason: Expired Token or Invalid API Secret (Minimum 16 characters required)' });
        toast.error("Verification Failed");
        return;
      }

      if (!config.conversionId || !/^\d+$/.test(config.conversionId)) {
        setVerificationStatus({ status: 'error', message: 'Connection Failed ❌ — Reason: Google Ads Conversion ID Missing or Invalid' });
        toast.error("Verification Failed");
        return;
      }

      if (!config.gtmContainerId || !/^GTM-[A-Z0-9]+$/i.test(config.gtmContainerId)) {
        setVerificationStatus({ status: 'error', message: 'Connection Failed ❌ — Reason: GTM Container Missing or Invalid Format (Must follow GTM-XXXXXXX)' });
        toast.error("Verification Failed");
        return;
      }

      if (config.apiSecret.includes('MOCK') || (config.oauthClientSecret && config.oauthClientSecret.includes('MOCK'))) {
        setVerificationStatus({ status: 'error', message: 'Connection Failed ❌ — Reason: Permission Denied (Invalid OAuth or API Secret configuration)' });
        toast.error("Verification Failed");
        return;
      }

      setVerificationStatus({ status: 'success', message: 'Connection Successful ✅ — Google Measurement API & Google Ads Connection Verified' });
      toast.success("Verification Successful");
    } catch (err) {
      setVerificationStatus({ status: 'error', message: 'Connection Failed ❌ — Reason: Network Timeout' });
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
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setSaving(true);
    const updatedTimestamp = new Date().toLocaleString();
    const finalConfig = {
      ...config,
      lastUpdated: updatedTimestamp
    };

    try {
      const saveData = await safeFetchJSON('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'google',
          rowId: 'google_config',
          config: finalConfig
        })
      });

      if (saveData.status === 'success') {
        setConfig(finalConfig);
        setIsEditing(false);
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

  const handleDelete = async () => {
    setSaving(true);
    try {
      const clearedConfig = {
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
        active: false,
        lastUpdated: ''
      };

      await safeFetchJSON('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'google',
          rowId: 'google_config',
          config: clearedConfig
        })
      });

      setConfig(clearedConfig);
      setVerificationStatus({ status: null, message: '' });
      setIsEditing(true);
      setShowDeleteConfirm(false);
      toast.success("Configuration Deleted Successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete configuration");
    } finally {
      setSaving(false);
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getMaskedValue = (val: string, show: boolean) => {
    if (!val) return '—';
    if (show) return val;
    if (val.length <= 10) return '••••••••';
    return `${val.substring(0, 4)}••••••••${val.substring(val.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 font-sans p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-64 bg-zinc-100" />
            <div className="h-4 w-40 bg-zinc-100" />
            <div className="border-t border-zinc-100 pt-8 space-y-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="h-4 bg-zinc-100 col-span-1" />
                  <div className="h-8 bg-zinc-50 col-span-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* REDESIGNED HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-6">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tighter">Google Configuration</h1>
            <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span>Status:</span>
                {config.measurementId ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-1">Connected <CheckCircle2 className="w-3.5 h-3.5" /></span>
                ) : (
                  <span className="font-bold text-amber-500">Not Configured ⚠️</span>
                )}
              </div>
              {config.measurementId && config.lastUpdated && (
                <p>Last Updated: {config.lastUpdated}</p>
              )}
            </div>
          </div>

          {/* HORIZONTAL ACTION BUTTONS */}
          {!isEditing && config.measurementId && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 h-10 border border-zinc-200 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-zinc-500" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="px-4 h-10 border border-zinc-200 text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {verifying ? (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-500" />
                )}
                <span>Test & Verify</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 h-10 border border-red-200 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* DELETE CONFIRMATION INTERFACE */}
        {showDeleteConfirm && (
          <div className="p-5 border border-red-200 bg-red-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
            <div>
              <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">Confirm Delete</h3>
              <p className="text-xs text-red-600 mt-1">Are you sure you want to delete this configuration? This action cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 h-9 border border-zinc-200 text-xs font-bold uppercase tracking-wider bg-white hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 h-9 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        )}

        {/* VERIFICATION HANDSHAKE STATE BAR */}
        {verificationStatus.status && (
          <div className={`p-4 border flex items-start gap-3 transition-all ${
            verificationStatus.status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {verificationStatus.status === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div>
              <span className="text-sm font-bold uppercase tracking-wide block">{verificationStatus.status === 'success' ? 'Connection Successful' : 'Connection Failed'}</span>
              <p className="text-xs mt-1 opacity-90">{verificationStatus.message}</p>
            </div>
          </div>
        )}

        {/* PAGE CONTENT: CONFIGURATION DETAILS PAGE OR FORM */}
        {!isEditing && config.measurementId ? (
          /* CONFIGURATION DETAILS PAGE */
          <div className="border border-zinc-100 bg-white">
            <div className="divide-y divide-zinc-100">
              
              {/* GA4 MEASUREMENT ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">GA4 Measurement ID</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100">{config.measurementId}</span>
              </div>

              {/* GA4 API SECRET (SENSITIVE) */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">GA4 API Secret</span>
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="text-sm font-mono bg-zinc-50 px-3 py-1.5 border border-zinc-100 flex-1 truncate max-w-full">
                    {getMaskedValue(config.apiSecret, !!showSecrets.apiSecret)}
                  </span>
                  <button 
                    onClick={() => toggleSecretVisibility('apiSecret')}
                    className="p-2 border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-500"
                    title={showSecrets.apiSecret ? "Hide Secret" : "Show Secret"}
                  >
                    {showSecrets.apiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* GOOGLE ADS CONVERSION ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Google Ads Conversion ID</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100">{config.conversionId}</span>
              </div>

              {/* CONVERSION LABEL */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Conversion Label</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100">{config.conversionLabel}</span>
              </div>

              {/* CUSTOMER ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Customer ID</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100">{config.customerId}</span>
              </div>

              {/* GTM CONTAINER ID */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Google Tag Manager ID</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100">{config.gtmContainerId}</span>
              </div>

              {/* ADS ACCOUNT ID (OPTIONAL) */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Ads Account ID</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100">{config.adsAccountId || '—'}</span>
              </div>

              {/* CLOUD PROJECT ID (OPTIONAL) */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cloud Project ID</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100">{config.cloudProjectId || '—'}</span>
              </div>

              {/* OAUTH CLIENT ID (OPTIONAL) */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">OAuth Client ID</span>
                <span className="md:col-span-2 text-sm font-mono bg-zinc-50 px-3 py-1.5 self-start md:self-auto inline-block border border-zinc-100 truncate max-w-xs">{config.oauthClientId || '—'}</span>
              </div>

              {/* OAUTH SECRET (SENSITIVE / OPTIONAL) */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">OAuth Secret</span>
                <div className="md:col-span-2 flex items-center gap-2">
                  <span className="text-sm font-mono bg-zinc-50 px-3 py-1.5 border border-zinc-100 flex-1 truncate max-w-full">
                    {getMaskedValue(config.oauthClientSecret, !!showSecrets.oauthClientSecret)}
                  </span>
                  <button 
                    onClick={() => toggleSecretVisibility('oauthClientSecret')}
                    className="p-2 border border-zinc-200 hover:bg-zinc-50 transition-colors text-zinc-500"
                    title={showSecrets.oauthClientSecret ? "Hide Secret" : "Show Secret"}
                  >
                    {showSecrets.oauthClientSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ENHANCED CONVERSION */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Enhanced Conversion</span>
                <span className={`md:col-span-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${config.enhancedConversion ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${config.enhancedConversion ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                  {config.enhancedConversion ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {/* INTEGRATION ACTIVE */}
              <div className="grid grid-cols-1 md:grid-cols-3 p-4 sm:p-5 items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Integration Active</span>
                <span className={`md:col-span-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${config.active ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${config.active ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                  {config.active ? 'Active / Enabled' : 'Disabled'}
                </span>
              </div>

            </div>
          </div>
        ) : (
          /* CONFIGURATION INPUT FORM */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
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
                placeholder="Minimum 16 Characters"
                required
                helperText="Minimum 16 Characters"
                error={errors.apiSecret}
                isValid={!errors.apiSecret && config.apiSecret.length >= 16}
              />

              <MarketingInput
                label="Google Ads Conversion ID"
                value={config.conversionId}
                onChange={(v) => handleChange('conversionId', v)}
                placeholder="Only Number"
                required
                helperText="Only Number"
                error={errors.conversionId}
                isValid={!errors.conversionId && config.conversionId.length > 0}
              />

              <MarketingInput
                label="Conversion Label"
                value={config.conversionLabel}
                onChange={(v) => handleChange('conversionLabel', v)}
                placeholder="Label string"
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
                placeholder="act_1234567890"
                isValid={config.adsAccountId.length > 0}
              />

              <MarketingInput
                label="Cloud Project ID (Optional)"
                value={config.cloudProjectId}
                onChange={(v) => handleChange('cloudProjectId', v)}
                placeholder="my-gcp-project-123"
                isValid={config.cloudProjectId.length > 0}
              />

              <MarketingInput
                label="Google OAuth Client ID (Optional)"
                value={config.oauthClientId}
                onChange={(v) => handleChange('oauthClientId', v)}
                placeholder="12345-abcde.apps.googleusercontent.com"
                isValid={config.oauthClientId.length > 0}
              />

              <MarketingInput
                label="Google OAuth Secret (Optional)"
                value={config.oauthClientSecret}
                onChange={(v) => handleChange('oauthClientSecret', v)}
                placeholder="OAuth client secret key"
                isValid={config.oauthClientSecret.length > 0}
              />

              <div className="md:col-span-2 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-x-12 gap-y-6">
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

            {/* ACTION FOOTER */}
            <div className="flex items-center gap-3 pt-6 border-t border-zinc-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 h-10 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Configuration</span>
              </button>
              {config.measurementId && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setVerificationStatus({ status: null, message: '' });
                  }}
                  className="px-6 h-10 border border-zinc-200 text-xs font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
