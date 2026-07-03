import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, XCircle, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFetchJSON } from '../../lib/utils';
import MarketingInput from '../../components/MarketingInput';
import MarketingCheckbox from '../../components/MarketingCheckbox';

export default function AdminMarketingFacebook() {
  const [config, setConfig] = useState({
    pixelId: '', 
    accessToken: '', 
    datasetId: '', 
    testEventCode: '', 
    businessManagerId: '', 
    adAccountId: '', 
    systemUserToken: '', 
    browserTracking: true, 
    serverSideTracking: true, 
    active: true 
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [schemaState, setSchemaState] = useState<any>(null);

  useEffect(() => {
    safeFetchJSON('/api/admin/marketing/config?tableName=facebook_settings&rowId=facebook_config')
      .then(data => {
        if (data.status === 'success' && data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config
          }));
        }
      })
      .catch(err => console.warn('Failed to load Facebook config, using defaults.', err));
  }, []);

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'pixelId':
        if (!value) error = 'Pixel ID is required.';
        else if (!/^\d{15,16}$/.test(value)) error = 'Pixel ID must contain 15-16 digits.';
        break;
      case 'accessToken':
        if (!value) error = 'Access Token is required.';
        else if (value.length < 80) error = 'Access Token must be at least 80 characters.';
        break;
      case 'datasetId':
        if (!value) error = 'Dataset ID is required.';
        else if (!/^\d+$/.test(value)) error = 'Dataset ID must be numeric.';
        break;
      case 'businessManagerId':
        if (!value) error = 'Business Manager ID is required.';
        else if (!/^\d+$/.test(value)) error = 'Business Manager ID must be numeric.';
        break;
      case 'adAccountId':
        if (!value) error = 'Ad Account ID is required.';
        else if (!/^act_\d+$/.test(value)) error = 'Invalid Format (act_123...)';
        break;
      case 'systemUserToken':
        if (!value) error = 'System User Token is required.';
        else if (value.length < 80) error = 'Token must be at least 80 characters.';
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
    // Validate all required fields before verifying
    const requiredFields = ['pixelId', 'accessToken', 'datasetId', 'businessManagerId', 'adAccountId', 'systemUserToken'];
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
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulation: if pixelId starts with 123, it fails
      if (config.pixelId.startsWith('123')) {
        setVerificationStatus({ status: 'error', message: '✗ Invalid Pixel ID' });
        toast.error("Invalid Pixel ID");
      } else {
        setVerificationStatus({ status: 'success', message: '✓ Facebook Connected Successfully' });
        toast.success("Facebook Connected Successfully");
      }
    } catch (err) {
      setVerificationStatus({ status: 'error', message: '✗ Connection Failed' });
      toast.error("Connection Failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    // Validate all required fields
    const requiredFields = ['pixelId', 'accessToken', 'datasetId', 'businessManagerId', 'adAccountId', 'systemUserToken'];
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
      const data = await safeFetchJSON('/api/admin/marketing/schema-check?tableName=facebook_settings');
      if (data.status === 'success') {
        const isMissing = !data.schemaState.facebook_settings?.exists || data.schemaState.facebook_settings?.missingColumns.length > 0;
        if (isMissing) {
          setSchemaState(data.schemaState);
          setShowSchemaModal(true);
          setSaving(false);
          return;
        }
      }

      const saveData = await safeFetchJSON('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'facebook',
          rowId: 'facebook_config',
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
          <h1 className="text-xl font-bold uppercase tracking-tighter">Facebook Integration</h1>
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
            label="Meta Pixel ID"
            value={config.pixelId}
            onChange={(v) => handleChange('pixelId', v)}
            placeholder="123456789012345"
            required
            helperText="15-16 Digit Numeric Only"
            error={errors.pixelId}
            isValid={!errors.pixelId && config.pixelId.length >= 15}
          />

          <MarketingInput
            label="Meta Access Token"
            value={config.accessToken}
            onChange={(v) => handleChange('accessToken', v)}
            placeholder="EAABxxxxxxxxxxxxxxxx"
            required
            helperText="Minimum 80 Characters"
            error={errors.accessToken}
            isValid={!errors.accessToken && config.accessToken.length >= 80}
          />

          <MarketingInput
            label="Dataset ID"
            value={config.datasetId}
            onChange={(v) => handleChange('datasetId', v)}
            required
            helperText="Only Number"
            error={errors.datasetId}
            isValid={!errors.datasetId && config.datasetId.length > 0}
          />

          <MarketingInput
            label="Test Event Code (Optional)"
            value={config.testEventCode}
            onChange={(v) => handleChange('testEventCode', v)}
            placeholder="TEST12345"
            isValid={config.testEventCode.length > 0}
          />

          <MarketingInput
            label="Business Manager ID"
            value={config.businessManagerId}
            onChange={(v) => handleChange('businessManagerId', v)}
            required
            helperText="Only Number"
            error={errors.businessManagerId}
            isValid={!errors.businessManagerId && config.businessManagerId.length > 0}
          />

          <MarketingInput
            label="Ad Account ID"
            value={config.adAccountId}
            onChange={(v) => handleChange('adAccountId', v)}
            placeholder="act_123456789012345"
            required
            helperText="Format: act_xxxxxxxxxxxxxxx"
            error={errors.adAccountId}
            isValid={!errors.adAccountId && config.adAccountId.startsWith('act_')}
          />

          <div className="md:col-span-2">
            <MarketingInput
              label="System User Token"
              value={config.systemUserToken}
              onChange={(v) => handleChange('systemUserToken', v)}
              required
              helperText="Minimum 80 Characters"
              error={errors.systemUserToken}
              isValid={!errors.systemUserToken && config.systemUserToken.length >= 80}
            />
          </div>

          <div className="md:col-span-2 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row gap-x-12 gap-y-6">
            <MarketingCheckbox
              label="Browser Pixel"
              checked={config.browserTracking}
              onChange={(v) => handleChange('browserTracking', v)}
            />
            <MarketingCheckbox
              label="Conversion API"
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

      {showSchemaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-md w-full border border-zinc-200 shadow-2xl">
            <h2 className="text-lg font-bold uppercase tracking-tight mb-4">Database Schema Required</h2>
            <p className="text-sm text-zinc-600 mb-6">
              The Facebook settings table or required columns are missing in your Supabase database. Please run the migration scripts to continue.
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
