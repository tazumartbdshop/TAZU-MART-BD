import React, { useState, useEffect } from 'react';
import { Save, Loader2, Edit3, ImagePlus, X, Settings2, AlertTriangle, CheckCircle, Copy, Check } from 'lucide-react';
import { useFooterSettingsStore } from '../../store/useFooterSettingsStore';
import { FooterSettings, FooterQuickLink, PaymentMethodSetting } from '../../services/footerSettingsService';
import { themeSettingsService, ThemeMode } from '../../services/themeSettingsService';
import { flutterSettingsDbService, FlutterSettingsDbResult } from '../../services/flutterSettingsDbService';
import { uploadImage } from '../../lib/imageUtils';
import { ThemeSettingsSection } from '../../components/admin/ThemeSettingsSection';

export default function AdminFooterSettings() {
  const { settings, isLoading, fetchFooterSettings, updateFooterSettings } = useFooterSettingsStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Database verification feedback state
  const [dbMessage, setDbMessage] = useState<string | null>(null);
  const [dbErrorType, setDbErrorType] = useState<'TABLE_MISSING' | 'COLUMNS_MISSING' | 'SAVE_FAILED' | null>(null);
  const [dbSqlInstruction, setDbSqlInstruction] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Theme Settings state
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('white');

  // When editMode is false, inputs are locked
  const [editMode, setEditMode] = useState(true);

  // Local Form State
  const [localSettings, setLocalSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    fetchFooterSettings();
    themeSettingsService.getThemeMode().then((mode) => {
      setSelectedTheme(mode);
      themeSettingsService.applyThemeModeToApp(mode);
    });
  }, []);

  const handleSelectTheme = (theme: ThemeMode) => {
    setSelectedTheme(theme);
    themeSettingsService.applyThemeModeToApp(theme);
  };

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      setEditMode(false); // Locked by default when loaded
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;
    setSaveStatus('saving');
    setDbMessage(null);
    setDbErrorType(null);
    setDbSqlInstruction(null);

    try {
      const dbResult = await flutterSettingsDbService.verifyAndSaveFlutterSettings(
        localSettings,
        selectedTheme
      );

      if (!dbResult.success) {
        setDbMessage(dbResult.message);
        setDbErrorType(dbResult.errorType || 'SAVE_FAILED');
        setDbSqlInstruction(dbResult.sqlInstruction || null);
        setSaveStatus('error');
        return;
      }

      await Promise.all([
        updateFooterSettings(localSettings),
        themeSettingsService.saveThemeMode(selectedTheme)
      ]);

      setDbMessage('Flutter settings saved successfully.');
      setSaveStatus('success');
      setEditMode(false);
      setTimeout(() => setSaveStatus('idle'), 4000);
    } catch (e: any) {
      console.error(e);
      setDbMessage(e.message || 'An error occurred while saving.');
      setSaveStatus('error');
    }
  };

  const handleCopySql = () => {
    if (!dbSqlInstruction) return;
    navigator.clipboard.writeText(dbSqlInstruction);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !localSettings) return;

    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, 'footer', `footer_logo_${Date.now()}`);
      if (url) {
        setLocalSettings({ ...localSettings, footerLogoUrl: url });
      }
    } catch (err) {
      alert('Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !localSettings) return;

    setUploadingBanner(true);
    try {
      const url = await uploadImage(file, 'footer', `footer_banner_${Date.now()}`);
      if (url) {
        setLocalSettings({ ...localSettings, footerBannerUrl: url });
      }
    } catch (err) {
      alert('Failed to upload banner.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const updateField = (section: keyof FooterSettings, field: string, value: any) => {
    if (!localSettings) return;
    if (section === 'socialWhatsapp') {
      setLocalSettings({ ...localSettings, socialWhatsapp: { ...localSettings.socialWhatsapp, [field]: value } });
    } else if (['facebook', 'instagram', 'youtube', 'tiktok', 'messenger'].includes(section)) {
      setLocalSettings({ ...localSettings, [section]: { ...(localSettings as any)[section], [field]: value } });
    } else {
      setLocalSettings({ ...localSettings, [section]: value });
    }
  };

  const handleUpdateQuickLink = (index: number, field: keyof FooterQuickLink, value: string) => {
    if (!localSettings) return;
    const links = [...localSettings.quickLinks];
    links[index] = { ...links[index], [field]: value };
    setLocalSettings({ ...localSettings, quickLinks: links });
  };

  const handleAddQuickLink = () => {
    if (!localSettings) return;
    setLocalSettings({
      ...localSettings,
      quickLinks: [...localSettings.quickLinks, { label: '', url: '' }]
    });
  };

  const handleDeleteQuickLink = (index: number) => {
    if (!localSettings) return;
    const links = localSettings.quickLinks.filter((_, i) => i !== index);
    setLocalSettings({ ...localSettings, quickLinks: links });
  };

  const handleTogglePaymentMethod = (id: string) => {
    if (!localSettings) return;
    const methods = localSettings.paymentMethods.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    );
    setLocalSettings({ ...localSettings, paymentMethods: methods });
  };

  if (isLoading || !localSettings) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center font-sans">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 px-4 sm:px-6 md:px-8 font-sans text-zinc-950 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-8 w-full">
        
        {/* Header */}
        <div className="border-b border-zinc-200 pb-4 mb-8">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Footer</h1>
          <p className="text-sm text-zinc-500 mt-1">Footer Information</p>
        </div>

        {/* Section 1: Company Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Section 1: Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 uppercase">Company Name</label>
              <input 
                type="text" 
                value={localSettings.companyName}
                onChange={(e) => updateField('companyName', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 uppercase">Company Tagline</label>
              <input 
                type="text" 
                value={localSettings.companyTagline}
                onChange={(e) => updateField('companyTagline', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-zinc-600 uppercase">Business Description</label>
              <textarea 
                value={localSettings.businessDescription}
                onChange={(e) => updateField('businessDescription', '', e.target.value)}
                disabled={!editMode}
                rows={3}
                className="w-full p-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500 resize-none"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-zinc-600 uppercase">Copyright Text</label>
              <input 
                type="text" 
                value={localSettings.copyrightText}
                onChange={(e) => updateField('copyrightText', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Section 2: Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 uppercase">Phone Number</label>
              <input 
                type="text" 
                value={localSettings.phone}
                onChange={(e) => updateField('phone', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 uppercase">WhatsApp Number</label>
              <input 
                type="text" 
                value={localSettings.contactWhatsapp}
                onChange={(e) => updateField('contactWhatsapp', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 uppercase">Email</label>
              <input 
                type="email" 
                value={localSettings.email}
                onChange={(e) => updateField('email', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-600 uppercase">Working Hours</label>
              <input 
                type="text" 
                value={localSettings.workingHours}
                onChange={(e) => updateField('workingHours', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-zinc-600 uppercase">Business Address</label>
              <input 
                type="text" 
                value={localSettings.address}
                onChange={(e) => updateField('address', '', e.target.value)}
                disabled={!editMode}
                className="w-full h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Quick Links */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Section 3: Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localSettings.quickLinks.map((link, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={link.label}
                  onChange={(e) => handleUpdateQuickLink(idx, 'label', e.target.value)}
                  disabled={!editMode}
                  placeholder="Link Title"
                  className="w-1/2 h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
                />
                <input 
                  type="text" 
                  value={link.url}
                  onChange={(e) => handleUpdateQuickLink(idx, 'url', e.target.value)}
                  disabled={!editMode}
                  placeholder="URL"
                  className="w-1/2 h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-50 disabled:text-zinc-500"
                />
                {editMode && (
                  <button onClick={() => handleDeleteQuickLink(idx)} className="p-2 text-red-500 hover:bg-red-50">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {editMode && (
            <button onClick={handleAddQuickLink} className="text-xs font-bold uppercase tracking-wider text-zinc-900 border border-zinc-300 px-4 py-2 hover:bg-zinc-50">
              + Add Quick Link
            </button>
          )}
        </div>

        {/* Section 4: Social Media */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Section 4: Social Media</h2>
          <div className="grid grid-cols-1 gap-4">
            {['facebook', 'instagram', 'youtube', 'tiktok', 'messenger', 'socialWhatsapp'].map((platform) => {
              const displayLabel = platform === 'socialWhatsapp' ? 'WhatsApp' : platform.charAt(0).toUpperCase() + platform.slice(1);
              const data = localSettings[platform as keyof FooterSettings] as any;
              return (
                <div key={platform} className="flex gap-4 items-center bg-zinc-50 p-3 border border-zinc-200">
                  <div className="w-24 shrink-0">
                    <span className="text-sm font-bold text-zinc-700">{displayLabel}</span>
                  </div>
                  <input 
                    type="text"
                    value={data.url}
                    onChange={(e) => updateField(platform as keyof FooterSettings, 'url', e.target.value)}
                    disabled={!editMode}
                    placeholder={`Enter ${displayLabel} URL`}
                    className="flex-1 h-11 px-3 border border-zinc-300 rounded-none focus:border-black focus:ring-0 text-sm disabled:bg-zinc-100 disabled:text-zinc-500"
                  />
                  <div className="flex items-center gap-2 w-24">
                    <input 
                      type="checkbox"
                      checked={data.enabled}
                      onChange={(e) => updateField(platform as keyof FooterSettings, 'enabled', e.target.checked)}
                      disabled={!editMode}
                      className="w-5 h-5 border-zinc-300 rounded-none text-zinc-900 focus:ring-black"
                    />
                    <span className="text-xs font-bold uppercase text-zinc-600">Enable</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Section 5: Payment Methods */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Section 5: Payment Methods</h2>
          <div className="flex flex-wrap gap-4">
            {localSettings.paymentMethods.map(method => (
              <label key={method.id} className={`flex items-center gap-3 p-3 border ${method.enabled ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200'} cursor-pointer`}>
                <input 
                  type="checkbox"
                  checked={method.enabled}
                  onChange={() => editMode && handleTogglePaymentMethod(method.id)}
                  disabled={!editMode}
                  className="w-5 h-5 border-zinc-300 rounded-none text-zinc-900 focus:ring-black"
                />
                <span className="text-sm font-bold text-zinc-700">{method.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 6: Theme Settings */}
        <ThemeSettingsSection 
          sectionTitle="Section 6: Theme Settings" 
          selectedTheme={selectedTheme}
          onSelectTheme={handleSelectTheme}
          disabled={!editMode}
        />

        {/* Section 7: Footer Logo */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Section 7: Footer Logo</h2>
          <div className="flex items-center gap-4">
            {localSettings.footerLogoUrl ? (
              <div className="relative border border-zinc-200 p-2 bg-zinc-900">
                <img src={localSettings.footerLogoUrl} alt="Footer Logo" className="h-12 object-contain" />
                {editMode && (
                  <button 
                    onClick={() => setLocalSettings({...localSettings, footerLogoUrl: ''})}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-12 w-32 border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 text-xs">
                No Logo
              </div>
            )}
            
            {editMode && (
              <label className="h-11 px-4 border border-zinc-300 flex items-center gap-2 cursor-pointer hover:bg-zinc-50">
                <ImagePlus className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Upload Logo</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
              </label>
            )}
          </div>
        </div>

        {/* Section 8: Footer Banner (Optional) */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 border-b border-zinc-100 pb-2">Section 8: Footer Banner (Optional)</h2>
          <div className="flex flex-col gap-4">
            {localSettings.footerBannerUrl ? (
              <div className="relative border border-zinc-200">
                <img src={localSettings.footerBannerUrl} alt="Footer Banner" className="w-full max-h-48 object-cover" />
                {editMode && (
                  <button 
                    onClick={() => setLocalSettings({...localSettings, footerBannerUrl: ''})}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-24 border border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 text-xs">
                No Banner Uploaded
              </div>
            )}

            {editMode && (
              <label className="h-11 px-4 border border-zinc-300 inline-flex items-center gap-2 cursor-pointer hover:bg-zinc-50 w-max">
                <ImagePlus className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Upload Banner</span>
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
              </label>
            )}
          </div>
        </div>

        {/* Database Verification Feedback Banners */}
        {dbMessage && (
          <div className={`p-4 border rounded-none transition-all ${
            saveStatus === 'success' 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              {saveStatus === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold leading-relaxed">{dbMessage}</p>
                
                {dbSqlInstruction && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold uppercase text-amber-800 tracking-wider">
                        Required SQL Query for Supabase SQL Editor:
                      </span>
                      <button
                        onClick={handleCopySql}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900 text-white text-xs font-bold uppercase hover:bg-black transition-colors"
                      >
                        {copiedSql ? (
                          <><Check className="w-3.5 h-3.5 text-emerald-400" /> COPIED</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> COPY SQL</>
                        )}
                      </button>
                    </div>
                    <pre className="bg-zinc-900 text-amber-300 p-3 text-xs font-mono overflow-x-auto rounded-none border border-zinc-800 select-all leading-relaxed">
                      {dbSqlInstruction}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-10 border-t border-zinc-200 pb-20">
          {!editMode ? (
            <button 
              onClick={() => setEditMode(true)}
              className="w-full h-14 bg-zinc-900 hover:bg-black text-white flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase rounded-none transition-colors"
            >
              <Edit3 className="w-5 h-5" />
              EDIT
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="w-full h-14 bg-zinc-950 hover:bg-black disabled:bg-zinc-400 text-white flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase rounded-none transition-colors"
            >
              {saveStatus === 'saving' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> SAVING...</>
              ) : saveStatus === 'success' ? (
                'SAVED!'
              ) : (
                <><Save className="w-5 h-5" /> SAVE</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
