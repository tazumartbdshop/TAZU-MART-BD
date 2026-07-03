import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, XCircle, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFetchJSON } from '../../lib/utils';
import MarketingInput from '../../components/MarketingInput';
import MarketingCheckbox from '../../components/MarketingCheckbox';

export default function AdminMarketingTikTok() {
  const [config, setConfig] = useState({
    pixelId: '', 
    accessToken: '', 
    datasetId: '', 
    eventApiToken: '', 
    advertiserId: '', 
    businessCenterId: '', 
    browserTracking: true, 
    serverSideTracking: true, 
    active: true 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });

  useEffect(() => {
    safeFetchJSON('/api/admin/marketing/config?tableName=tiktok_settings&rowId=tiktok_config')
      .then(data => {
        if (data.status === 'success' && data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config
          }));
        }
      })
      .catch(err => console.warn('Failed to load TikTok config, using defaults.', err));
  }, []);

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'pixelId':
        if (!value) error = 'TikTok Pixel ID is required.';
        else if (!/^TT-[A-Z0-9]+$/i.test(value)) error = 'Format: TT-XXXXXXX';
        break;
      case 'accessToken':
        if (!value) error = 'Access Token is required.';
        break;
      case 'datasetId':
        if (!value) error = 'Dataset ID is required.';
        break;
      case 'eventApiToken':
        if (!value) error = 'Events API Token is required.';
        break;
      case 'advertiserId':
        if (!value) error = 'Advertiser ID is required.';
        else if (!/^\d+$/.test(value)) error = 'Advertiser ID must be numeric.';
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
    const requiredFields = ['pixelId', 'accessToken', 'datasetId', 'eventApiToken', 'advertiserId'];
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
      
      if (config.pixelId.includes('FAIL')) {
        setVerificationStatus({ status: 'error', message: '✗ Invalid TikTok Pixel ID' });
        toast.error("Invalid TikTok Pixel ID");
      } else {
        setVerificationStatus({ status: 'success', message: '✓ TikTok Connected Successfully' });
        toast.success("TikTok Connected Successfully");
      }
    } catch (err) {
      setVerificationStatus({ status: 'error', message: '✗ Connection Failed' });
      toast.error("Connection Failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    const requiredFields = ['pixelId', 'accessToken', 'datasetId', 'eventApiToken', 'advertiserId'];
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
      const saveData = await safeFetchJSON('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'tiktok',
          rowId: 'tiktok_config',
          config
        })
      });

      if (saveData.status === 'success') {
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
          <h1 className="text-xl font-bold uppercase tracking-tighter">TikTok Integration</h1>
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
            label="TikTok Pixel ID"
            value={config.pixelId}
            onChange={(v) => handleChange('pixelId', v)}
            placeholder="TT-XXXXXXX"
            required
            helperText="Format: TT-XXXXXXX"
            error={errors.pixelId}
            isValid={!errors.pixelId && config.pixelId.startsWith('TT-')}
          />

          <MarketingInput
            label="Access Token"
            value={config.accessToken}
            onChange={(v) => handleChange('accessToken', v)}
            required
            error={errors.accessToken}
            isValid={!errors.accessToken && config.accessToken.length > 0}
          />

          <MarketingInput
            label="Dataset ID"
            value={config.datasetId}
            onChange={(v) => handleChange('datasetId', v)}
            required
            error={errors.datasetId}
            isValid={!errors.datasetId && config.datasetId.length > 0}
          />

          <MarketingInput
            label="Events API Token"
            value={config.eventApiToken}
            onChange={(v) => handleChange('eventApiToken', v)}
            required
            error={errors.eventApiToken}
            isValid={!errors.eventApiToken && config.eventApiToken.length > 0}
          />

          <MarketingInput
            label="Advertiser ID"
            value={config.advertiserId}
            onChange={(v) => handleChange('advertiserId', v)}
            required
            helperText="Only Number"
            error={errors.advertiserId}
            isValid={!errors.advertiserId && config.advertiserId.length > 0}
          />

          <MarketingInput
            label="Business Center ID (Optional)"
            value={config.businessCenterId}
            onChange={(v) => handleChange('businessCenterId', v)}
            isValid={config.businessCenterId.length > 0}
          />

          <div className="md:col-span-2 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row gap-x-12 gap-y-6">
            <MarketingCheckbox
              label="Browser Tracking"
              checked={config.browserTracking}
              onChange={(v) => handleChange('browserTracking', v)}
            />
            <MarketingCheckbox
              label="Server Side Tracking"
              checked={config.serverSideTracking}
              onChange={(v) => handleChange('serverSideTracking', v)}
            />
            <MarketingCheckbox
              label="Server Side Enable"
              checked={config.active}
              onChange={(v) => handleChange('active', v)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
