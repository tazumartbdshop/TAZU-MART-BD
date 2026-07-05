import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  Check, 
  Upload, 
  X, 
  GripVertical,
  SlidersHorizontal,
  PlusCircle,
  HelpCircle,
  Image as ImageIcon,
  ChevronRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useFooterSettingsStore } from '../../store/useFooterSettingsStore';
import { FooterSettings, FooterQuickLink } from '../../services/footerSettingsService';
import { uploadImage } from '../../lib/imageUtils';

export default function AdminFooterSettings() {
  const { settings, isLoading, fetchFooterSettings } = useFooterSettingsStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Database & Schema Integrity States
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [checkingSchema, setCheckingSchema] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);

  // Local Form States
  const [footerLogo, setFooterLogo] = useState('');
  const [footerLogoWidth, setFooterLogoWidth] = useState(150);
  const [footerLogoHeight, setFooterLogoHeight] = useState(40);

  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');

  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [cardWhatsappText, setCardWhatsappText] = useState('');
  const [cardWhatsappLink, setCardWhatsappLink] = useState('');
  const [cardCallText, setCardCallText] = useState('');
  const [cardCallPhone, setCardCallPhone] = useState('');

  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialMessenger, setSocialMessenger] = useState('');
  const [socialWhatsapp, setSocialWhatsapp] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTelegram, setSocialTelegram] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');

  const [socialFacebookEnabled, setSocialFacebookEnabled] = useState(false);
  const [socialMessengerEnabled, setSocialMessengerEnabled] = useState(false);
  const [socialWhatsappEnabled, setSocialWhatsappEnabled] = useState(false);
  const [socialInstagramEnabled, setSocialInstagramEnabled] = useState(false);
  const [socialTelegramEnabled, setSocialTelegramEnabled] = useState(false);
  const [socialYoutubeEnabled, setSocialYoutubeEnabled] = useState(false);
  const [socialTiktokEnabled, setSocialTiktokEnabled] = useState(false);

  const [quickLinks, setQuickLinks] = useState<FooterQuickLink[]>([]);

  const [contactAddress, setContactAddress] = useState('');
  const [contactSupportTime, setContactSupportTime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [copyrightText, setCopyrightText] = useState('');
  const [paymentBadges, setPaymentBadges] = useState<string[]>([]);
  const [newBadgeText, setNewBadgeText] = useState('');

  const [showFooterLogo, setShowFooterLogo] = useState(false);
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [showSocialIcons, setShowSocialIcons] = useState(false);
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showSupportCard, setShowSupportCard] = useState(false);
  const [showCopyright, setShowCopyright] = useState(false);
  const [showPaymentBadges, setShowPaymentBadges] = useState(false);

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Check database table schema and connection
  const checkDatabaseSchema = async () => {
    setCheckingSchema(true);
    setSchemaError(null);
    try {
      const response = await fetch('/api/footer-settings/check');
      if (response.ok) {
        const data = await response.json();
        setDbConnected(data.connected);
        if (data.error) {
          setSchemaError(data.error);
        } else {
          setSchemaError(null);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setSchemaError(errData.error || 'Failed to check database schema.');
      }
    } catch (err: any) {
      console.error("Schema check request failed:", err);
      setSchemaError(`Database connection failed: ${err.message || err}`);
      setDbConnected(false);
    } finally {
      setCheckingSchema(false);
    }
  };

  // Initialize
  useEffect(() => {
    checkDatabaseSchema();
    fetchFooterSettings();
  }, []);

  // Sync state with store values
  useEffect(() => {
    if (settings) {
      setFooterLogo(settings.footer_logo || '');
      setFooterLogoWidth(settings.footer_logo_width || 150);
      setFooterLogoHeight(settings.footer_logo_height || 40);

      setAboutTitle(settings.about_title || '');
      setAboutDescription(settings.about_description || '');

      setCardTitle(settings.card_title || '');
      setCardDescription(settings.card_description || settings.card_subtitle || '');
      setCardWhatsappText(settings.card_whatsapp_text || '');
      setCardWhatsappLink(settings.card_whatsapp_link || '');
      setCardCallText(settings.card_call_text || '');
      setCardCallPhone(settings.card_call_phone || '');

      setSocialFacebook(settings.social_facebook || '');
      setSocialMessenger(settings.social_messenger || '');
      setSocialWhatsapp(settings.social_whatsapp || '');
      setSocialInstagram(settings.social_instagram || '');
      setSocialTelegram(settings.social_telegram || '');
      setSocialYoutube(settings.social_youtube || '');
      setSocialTiktok(settings.social_tiktok || '');

      setSocialFacebookEnabled(settings.social_facebook_enabled ?? false);
      setSocialMessengerEnabled(settings.social_messenger_enabled ?? false);
      setSocialWhatsappEnabled(settings.social_whatsapp_enabled ?? false);
      setSocialInstagramEnabled(settings.social_instagram_enabled ?? false);
      setSocialTelegramEnabled(settings.social_telegram_enabled ?? false);
      setSocialYoutubeEnabled(settings.social_youtube_enabled ?? false);
      setSocialTiktokEnabled(settings.social_tiktok_enabled ?? false);

      setQuickLinks(settings.quick_links || []);

      setContactAddress(settings.contact_address || '');
      setContactSupportTime(settings.contact_support_time || '');
      setContactPhone(settings.contact_phone || '');
      setContactEmail(settings.contact_email || '');

      setCopyrightText(settings.copyright_text || '');
      setPaymentBadges(settings.payment_badges || []);

      setShowFooterLogo(settings.show_footer_logo ?? false);
      setShowAboutSection(settings.show_about_section ?? false);
      setShowSocialIcons(settings.show_social_icons ?? false);
      setShowQuickLinks(settings.show_quick_links ?? false);
      setShowContactInfo(settings.show_contact_info ?? false);
      setShowSupportCard(settings.show_support_card ?? false);
      setShowCopyright(settings.show_copyright ?? false);
      setShowPaymentBadges(settings.show_payment_badges ?? false);
    }
  }, [settings]);

  // Save changes
  const handleSave = async () => {
    setSaveStatus('saving');
    setValidationError(null);
    setDbErrorMessage(null);

    // 1. Verify connection & schema before attempting save
    try {
      const checkRes = await fetch('/api/footer-settings/check');
      if (!checkRes.ok) {
        throw new Error("Unable to reach database schema verification API");
      }
      const checkData = await checkRes.json();
      
      if (!checkData.connected) {
        setValidationError("Database connectivity failed. Please ensure the database is online and accessible.");
        setSaveStatus('error');
        return;
      }
      
      if (checkData.missingTable) {
        setValidationError(`Database schema is incomplete. Missing table: ${checkData.missingTable}`);
        setSaveStatus('error');
        return;
      }
      
      if (checkData.missingColumns && checkData.missingColumns.length > 0) {
        setValidationError(`Database schema is incomplete. Missing table/column: footer_settings.${checkData.missingColumns[0]}`);
        setSaveStatus('error');
        return;
      }
    } catch (err: any) {
      setValidationError(`Database connectivity and schema validation failed: ${err.message || err}`);
      setSaveStatus('error');
      return;
    }

    // 2. Validate form required fields (if sections are enabled, they must have content)
    if (showAboutSection && !aboutTitle.trim() && !aboutDescription.trim()) {
      setValidationError("Validation failed: About Title or Description is required when About Section is enabled.");
      setSaveStatus('error');
      return;
    }

    if (showCopyright && !copyrightText.trim()) {
      setValidationError("Validation failed: Copyright Text is required when Copyright is enabled.");
      setSaveStatus('error');
      return;
    }

    if (showSupportCard && (!cardTitle.trim() || !cardDescription.trim())) {
      setValidationError("Validation failed: Customer Support Card Title and Description are required when Support Card is enabled.");
      setSaveStatus('error');
      return;
    }

    try {
      const payload: FooterSettings = {
        id: 'global',
        footer_logo: footerLogo,
        footer_logo_width: Number(footerLogoWidth) || 150,
        footer_logo_height: Number(footerLogoHeight) || 40,
        about_title: aboutTitle,
        about_description: aboutDescription,
        card_title: cardTitle,
        card_subtitle: cardDescription, // sync with subtitle for legacy rendering fallback
        card_description: cardDescription,
        card_whatsapp_text: cardWhatsappText,
        card_whatsapp_link: cardWhatsappLink,
        card_call_text: cardCallText,
        card_call_phone: cardCallPhone,
        social_facebook: socialFacebook,
        social_messenger: socialMessenger,
        social_whatsapp: socialWhatsapp,
        social_instagram: socialInstagram,
        social_telegram: socialTelegram,
        social_youtube: socialYoutube,
        social_tiktok: socialTiktok,
        social_facebook_enabled: socialFacebookEnabled,
        social_messenger_enabled: socialMessengerEnabled,
        social_whatsapp_enabled: socialWhatsappEnabled,
        social_instagram_enabled: socialInstagramEnabled,
        social_telegram_enabled: socialTelegramEnabled,
        social_youtube_enabled: socialYoutubeEnabled,
        social_tiktok_enabled: socialTiktokEnabled,
        quick_links: quickLinks,
        contact_address: contactAddress,
        contact_support_time: contactSupportTime,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        copyright_text: copyrightText,
        payment_badges: paymentBadges,
        show_footer_logo: showFooterLogo,
        show_about_section: showAboutSection,
        show_social_icons: showSocialIcons,
        show_quick_links: showQuickLinks,
        show_contact_info: showContactInfo,
        show_support_card: showSupportCard,
        show_copyright: showCopyright,
        show_payment_badges: showPaymentBadges
      };

      // Perform strict database write request
      const response = await fetch('/api/footer-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error code ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        // Reload values from the database and sync the global store
        await fetchFooterSettings();
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 4000);
      } else {
        throw new Error("Failed to verify saved values against the database after saving.");
      }
    } catch (e: any) {
      console.error(e);
      setDbErrorMessage(e.message || String(e));
      setSaveStatus('error');
    }
  };

  // Logo handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const url = await uploadImage(file, 'footer', `footer_logo_${Date.now()}`);
      if (url) {
        setFooterLogo(url);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFooterLogo('');
  };

  // Quick Links
  const handleAddLink = () => {
    setQuickLinks([...quickLinks, { name: 'New Link', url: '/' }]);
  };

  const handleUpdateLink = (index: number, field: keyof FooterQuickLink, value: string) => {
    const updated = [...quickLinks];
    updated[index] = { ...updated[index], [field]: value };
    setQuickLinks(updated);
  };

  const handleDeleteLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
  };

  // Drag & Drop Quick Links
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...quickLinks];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setQuickLinks(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Payment Badges
  const handleAddBadge = () => {
    if (!newBadgeText.trim()) return;
    const cleanBadge = newBadgeText.trim().toUpperCase();
    if (paymentBadges.includes(cleanBadge)) {
      setNewBadgeText('');
      return;
    }
    setPaymentBadges([...paymentBadges, cleanBadge]);
    setNewBadgeText('');
  };

  const handleDeleteBadge = (badgeName: string) => {
    setPaymentBadges(paymentBadges.filter(b => b !== badgeName));
  };

  return (
    <div className="bg-zinc-50 min-h-screen pb-24 font-sans text-zinc-950">
      
      {/* Top sticky banner header */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-zinc-900" />
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Footer Management</h1>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Configure dynamic contents, widgets, branding, and link structures for your main website footer.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex-1 sm:flex-initial h-10 px-5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
        
        {/* Schema Status Warning banner */}
        {checkingSchema ? (
          <div className="bg-zinc-100 border border-zinc-200 p-4 flex items-center gap-3 text-zinc-700">
            <Loader2 className="w-5 h-5 shrink-0 text-zinc-500 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-wider">Verifying database schema integrity...</span>
          </div>
        ) : schemaError ? (
          <div className="bg-red-50 border-2 border-red-200 p-4 flex gap-3 text-red-900">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-black uppercase tracking-wider text-red-800">Database Schema Warning</p>
              <p className="font-semibold leading-relaxed text-red-700">
                {schemaError}
              </p>
              <p className="text-[10px] text-red-500 font-bold">
                Please make sure your database tables and columns are fully created and migrated. Saving is disabled or restricted.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 p-4 flex gap-3 text-emerald-900">
            <Check className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold">Database Schema Verified</p>
              <p className="leading-relaxed text-emerald-800">
                Connection is active. The <code className="bg-emerald-100 px-1 font-mono">footer_settings</code> table and all required columns exist in the database.
              </p>
            </div>
          </div>
        )}

        {/* Validation or Save Errors */}
        {validationError && (
          <div className="bg-amber-50 border border-amber-300 p-4 flex gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-amber-800">Validation/Database Warning</p>
              <p className="font-semibold leading-relaxed text-amber-700">{validationError}</p>
            </div>
          </div>
        )}

        {dbErrorMessage && (
          <div className="bg-red-50 border border-red-300 p-4 flex gap-3 text-red-950">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-700 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-red-900">Database Write Error (Save Blocked)</p>
              <p className="font-mono text-[10px] leading-relaxed bg-red-100 p-2 border border-red-200 text-red-800 rounded-sm">
                {dbErrorMessage}
              </p>
              <p className="text-[9px] text-red-600 font-bold">
                Data was NOT written to the database due to the above SQL error. Correct the schema or values to retry.
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 p-4 flex gap-3 text-blue-900">
          <Info className="w-5 h-5 shrink-0 text-blue-700 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Independent Footer Logo Configuration</p>
            <p className="leading-relaxed text-blue-800">
              The Footer Logo is completely independent of the Website Header Logo. Updating the Logo here will only reflect in the website footer, and will never affect your header branding.
            </p>
          </div>
        </div>

        {/* Section 1 — Footer Logo */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 1 — Footer Logo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Upload Logo Image
              </label>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="h-10 px-4 border border-zinc-300 hover:border-zinc-900 text-zinc-900 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors bg-white">
                  <Upload className="w-4 h-4 text-zinc-500" />
                  {uploadingLogo ? 'Uploading...' : 'Choose Logo File'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                    disabled={uploadingLogo} 
                    className="hidden" 
                  />
                </label>

                {footerLogo && (
                  <button
                    onClick={handleRemoveLogo}
                    className="h-10 px-4 border border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Remove Logo
                  </button>
                )}
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-zinc-400">Preview:</span>
                <div className="border border-zinc-200 bg-zinc-900 p-4 flex items-center justify-center min-h-[90px]">
                  {footerLogo ? (
                    <img 
                      src={footerLogo} 
                      alt="Logo Preview" 
                      style={{ width: `${footerLogoWidth}px`, height: `${footerLogoHeight}px` }} 
                      className="object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xs font-black text-white/40 tracking-widest uppercase">
                      NO LOGO UPLOADED (Shows Text Brand)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Logo Width (px)
                </label>
                <input
                  type="number"
                  value={footerLogoWidth}
                  onChange={(e) => setFooterLogoWidth(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                  placeholder="e.g. 150"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Logo Height (px)
                </label>
                <input
                  type="number"
                  value={footerLogoHeight}
                  onChange={(e) => setFooterLogoHeight(Number(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                  placeholder="e.g. 40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 — About */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 2 — About Section
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                About Section Title
              </label>
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. About Tazu Mart"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                About Section Description
              </label>
              <textarea
                value={aboutDescription}
                onChange={(e) => setAboutDescription(e.target.value)}
                rows={3}
                className="w-full p-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors resize-none"
                placeholder="e.g. Browse and shop premium collections with our secure offline / online experience..."
              />
            </div>
          </div>
        </div>

        {/* Section 3 — Customer Support Card */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 3 — Customer Support Card Widget
          </h2>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Card Widget Title
                </label>
                <input
                  type="text"
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                  placeholder="e.g. Customer Support"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                  Card Description / Subtitle
                </label>
                <input
                  type="text"
                  value={cardDescription}
                  onChange={(e) => setCardDescription(e.target.value)}
                  className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                  placeholder="e.g. Need help? Contact us now!"
                />
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Action Option A: WhatsApp Button
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    WhatsApp Button Text
                  </label>
                  <input
                    type="text"
                    value={cardWhatsappText}
                    onChange={(e) => setCardWhatsappText(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                    placeholder="e.g. Chat on WhatsApp"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    WhatsApp Number or Redirect Link
                  </label>
                  <input
                    type="text"
                    value={cardWhatsappLink}
                    onChange={(e) => setCardWhatsappLink(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                    placeholder="e.g. https://wa.me/8801700000000"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Action Option B: Direct Call Button
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Call Button Text
                  </label>
                  <input
                    type="text"
                    value={cardCallText}
                    onChange={(e) => setCardCallText(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                    placeholder="e.g. Call Support"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                    Phone Number for Dialing
                  </label>
                  <input
                    type="text"
                    value={cardCallPhone}
                    onChange={(e) => setCardCallPhone(e.target.value)}
                    className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                    placeholder="e.g. +8801700000000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 — Social Media Links */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 4 — Social Media Channels
          </h2>

          <p className="text-xs text-zinc-500 leading-relaxed mb-4">
            Provide the links for your business social networks. Enable or disable individual switches to toggle visibility inside the social bar.
          </p>

          <div className="space-y-4">
            
            {/* Facebook */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3 w-40 shrink-0">
                <input 
                  type="checkbox"
                  id="soc_fb_en"
                  checked={socialFacebookEnabled}
                  onChange={(e) => setSocialFacebookEnabled(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="soc_fb_en" className="text-xs font-black uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
                  Facebook
                </label>
              </div>
              <input
                type="text"
                value={socialFacebook}
                onChange={(e) => setSocialFacebook(e.target.value)}
                disabled={!socialFacebookEnabled}
                className="flex-1 h-9 px-3 bg-white disabled:bg-zinc-100 border border-zinc-200 text-xs font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. https://facebook.com/your-page"
              />
            </div>

            {/* Messenger */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3 w-40 shrink-0">
                <input 
                  type="checkbox"
                  id="soc_msg_en"
                  checked={socialMessengerEnabled}
                  onChange={(e) => setSocialMessengerEnabled(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="soc_msg_en" className="text-xs font-black uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
                  Messenger
                </label>
              </div>
              <input
                type="text"
                value={socialMessenger}
                onChange={(e) => setSocialMessenger(e.target.value)}
                disabled={!socialMessengerEnabled}
                className="flex-1 h-9 px-3 bg-white disabled:bg-zinc-100 border border-zinc-200 text-xs font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. https://m.me/your-profile"
              />
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3 w-40 shrink-0">
                <input 
                  type="checkbox"
                  id="soc_wa_en"
                  checked={socialWhatsappEnabled}
                  onChange={(e) => setSocialWhatsappEnabled(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="soc_wa_en" className="text-xs font-black uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
                  WhatsApp
                </label>
              </div>
              <input
                type="text"
                value={socialWhatsapp}
                onChange={(e) => setSocialWhatsapp(e.target.value)}
                disabled={!socialWhatsappEnabled}
                className="flex-1 h-9 px-3 bg-white disabled:bg-zinc-100 border border-zinc-200 text-xs font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. https://wa.me/8801700000000"
              />
            </div>

            {/* Instagram */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3 w-40 shrink-0">
                <input 
                  type="checkbox"
                  id="soc_ig_en"
                  checked={socialInstagramEnabled}
                  onChange={(e) => setSocialInstagramEnabled(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="soc_ig_en" className="text-xs font-black uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
                  Instagram
                </label>
              </div>
              <input
                type="text"
                value={socialInstagram}
                onChange={(e) => setSocialInstagram(e.target.value)}
                disabled={!socialInstagramEnabled}
                className="flex-1 h-9 px-3 bg-white disabled:bg-zinc-100 border border-zinc-200 text-xs font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. https://instagram.com/your-handle"
              />
            </div>

            {/* Telegram */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3 w-40 shrink-0">
                <input 
                  type="checkbox"
                  id="soc_tg_en"
                  checked={socialTelegramEnabled}
                  onChange={(e) => setSocialTelegramEnabled(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="soc_tg_en" className="text-xs font-black uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
                  Telegram
                </label>
              </div>
              <input
                type="text"
                value={socialTelegram}
                onChange={(e) => setSocialTelegram(e.target.value)}
                disabled={!socialTelegramEnabled}
                className="flex-1 h-9 px-3 bg-white disabled:bg-zinc-100 border border-zinc-200 text-xs font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. https://t.me/your-channel"
              />
            </div>

            {/* YouTube */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3 w-40 shrink-0">
                <input 
                  type="checkbox"
                  id="soc_yt_en"
                  checked={socialYoutubeEnabled}
                  onChange={(e) => setSocialYoutubeEnabled(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="soc_yt_en" className="text-xs font-black uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
                  YouTube
                </label>
              </div>
              <input
                type="text"
                value={socialYoutube}
                onChange={(e) => setSocialYoutube(e.target.value)}
                disabled={!socialYoutubeEnabled}
                className="flex-1 h-9 px-3 bg-white disabled:bg-zinc-100 border border-zinc-200 text-xs font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. https://youtube.com/your-channel"
              />
            </div>

            {/* TikTok */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-3 w-40 shrink-0">
                <input 
                  type="checkbox"
                  id="soc_tt_en"
                  checked={socialTiktokEnabled}
                  onChange={(e) => setSocialTiktokEnabled(e.target.checked)}
                  className="w-4 h-4 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900"
                />
                <label htmlFor="soc_tt_en" className="text-xs font-black uppercase tracking-wider text-zinc-700 cursor-pointer select-none">
                  TikTok
                </label>
              </div>
              <input
                type="text"
                value={socialTiktok}
                onChange={(e) => setSocialTiktok(e.target.value)}
                disabled={!socialTiktokEnabled}
                className="flex-1 h-9 px-3 bg-white disabled:bg-zinc-100 border border-zinc-200 text-xs font-semibold focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. https://tiktok.com/@your-profile"
              />
            </div>

          </div>
        </div>

        {/* Section 5 — Quick Links */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900">
              Section 5 — Quick Navigation Links
            </h2>
            <button
              onClick={handleAddLink}
              className="h-8 px-3 border border-zinc-950 text-zinc-950 hover:bg-zinc-50 font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Link
            </button>
          </div>

          <div className="bg-zinc-50 p-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Drag rows using the handle icon to change order instantly.
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {quickLinks.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-200 text-zinc-400 text-xs">
                No links added. Click 'Add Link' above to begin building navigation.
              </div>
            ) : (
              quickLinks.map((link, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-3 bg-white border ${
                    draggedIndex === idx ? 'border-zinc-950 shadow-md opacity-50' : 'border-zinc-200'
                  } transition-all duration-150 group`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-900 p-1">
                    <GripVertical className="w-4 h-4 shrink-0" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div>
                      <input
                        type="text"
                        value={link.name}
                        onChange={(e) => handleUpdateLink(idx, 'name', e.target.value)}
                        className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                        placeholder="Link Display Name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                        className="w-full h-9 px-3 bg-zinc-50 border border-zinc-200 text-xs font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                        placeholder="Link URL (e.g. /all-products)"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLink(idx)}
                    className="p-2 border border-zinc-200 text-zinc-400 hover:text-red-600 hover:border-red-200 transition-colors"
                    title="Delete Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 6 — Contact Information */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 6 — Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Physical Address
              </label>
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. Dhaka, Bangladesh"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Support Time / Service Hours
              </label>
              <input
                type="text"
                value={contactSupportTime}
                onChange={(e) => setContactSupportTime(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. 10 AM - 10 PM (Everyday)"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. +8801700000000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                Direct Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
                placeholder="e.g. support@tazumartbd.com"
              />
            </div>
          </div>
        </div>

        {/* Section 7 — Copyright */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 7 — Copyright Text
          </h2>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
              Copyright Text Line
            </label>
            <input
              type="text"
              value={copyrightText}
              onChange={(e) => setCopyrightText(e.target.value)}
              className="w-full h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-semibold focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors"
              placeholder="e.g. © 2026 TAZU MART BD. All Rights Reserved."
            />
            <span className="block text-[10px] text-zinc-400 mt-1">
              Hint: Use HTML symbols directly if needed (e.g. © is just written directly or pasted)
            </span>
          </div>
        </div>

        {/* Section 8 — Payment Badges */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 8 — Payment Badges
          </h2>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newBadgeText}
                onChange={(e) => setNewBadgeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBadge()}
                className="flex-1 h-10 px-3 bg-zinc-50 border border-zinc-200 text-sm font-bold placeholder:font-normal placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none transition-colors uppercase"
                placeholder="Type badge label (e.g. COD, SSL, SECURE PAY)"
              />
              <button
                onClick={handleAddBadge}
                className="h-10 px-5 bg-zinc-950 hover:bg-zinc-800 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Badge
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              {paymentBadges.length === 0 ? (
                <div className="text-xs text-zinc-400 py-3 w-full border border-dashed border-zinc-200 text-center">
                  No payment stickers configured.
                </div>
              ) : (
                paymentBadges.map((badge, idx) => (
                  <div 
                    key={idx}
                    className="h-9 px-3 bg-zinc-100 border border-zinc-200 text-xs font-black uppercase tracking-wider flex items-center gap-2 text-zinc-800"
                  >
                    <span>{badge}</span>
                    <button
                      onClick={() => handleDeleteBadge(badge)}
                      className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 9 — Visibility Switches */}
        <div className="bg-white border border-zinc-200 p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-900 border-b border-zinc-100 pb-3">
            Section 9 — Block Visibility Switches
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show Footer Logo</span>
              <input 
                type="checkbox"
                checked={showFooterLogo}
                onChange={(e) => setShowFooterLogo(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show About Section</span>
              <input 
                type="checkbox"
                checked={showAboutSection}
                onChange={(e) => setShowAboutSection(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show Social Icons</span>
              <input 
                type="checkbox"
                checked={showSocialIcons}
                onChange={(e) => setShowSocialIcons(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show Quick Links</span>
              <input 
                type="checkbox"
                checked={showQuickLinks}
                onChange={(e) => setShowQuickLinks(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show Contact Info</span>
              <input 
                type="checkbox"
                checked={showContactInfo}
                onChange={(e) => setShowContactInfo(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show Customer Support</span>
              <input 
                type="checkbox"
                checked={showSupportCard}
                onChange={(e) => setShowSupportCard(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show Payment Badges</span>
              <input 
                type="checkbox"
                checked={showPaymentBadges}
                onChange={(e) => setShowPaymentBadges(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-700">Show Copyright</span>
              <input 
                type="checkbox"
                checked={showCopyright}
                onChange={(e) => setShowCopyright(e.target.checked)}
                className="w-5 h-5 text-zinc-900 border-zinc-300 rounded focus:ring-zinc-900 cursor-pointer"
              />
            </div>

          </div>
        </div>

        {/* Save Banner Block */}
        <div className="bg-zinc-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Save All Configurations</h4>
            <p className="text-zinc-400 text-xs mt-0.5">Commit current forms and link lists to persistence.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-zinc-200 disabled:bg-zinc-500 text-zinc-950 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                Saving Changes...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Saved Successfully!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                ✅ Save Changes
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
