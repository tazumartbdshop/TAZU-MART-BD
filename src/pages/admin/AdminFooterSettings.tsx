import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2, 
  Check, 
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

  const [socialFacebook, setSocialFacebook] = useState('');
  const [socialMessenger, setSocialMessenger] = useState('');
  const [socialWhatsapp, setSocialWhatsapp] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTelegram, setSocialTelegram] = useState('');
  const [socialYoutube, setSocialYoutube] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');

  const [quickLinks, setQuickLinks] = useState<FooterQuickLink[]>([]);

  const [contactAddress, setContactAddress] = useState('');
  const [contactSupportTime, setContactSupportTime] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const [cardTitle, setCardTitle] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [cardWhatsappText, setCardWhatsappText] = useState('');
  const [cardWhatsappLink, setCardWhatsappLink] = useState('');
  const [cardCallText, setCardCallText] = useState('');
  const [cardCallPhone, setCardCallPhone] = useState('');

  const [copyrightText, setCopyrightText] = useState('');
  const [paymentBadges, setPaymentBadges] = useState<string[]>([]);
  const [newBadgeText, setNewBadgeText] = useState('');

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

      setQuickLinks(settings.quick_links || []);

      setContactAddress(settings.contact_address || '');
      setContactSupportTime(settings.contact_support_time || '');
      setContactPhone(settings.contact_phone || '');
      setContactEmail(settings.contact_email || '');

      setCopyrightText(settings.copyright_text || '');
      setPaymentBadges(settings.payment_badges || []);
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
        social_facebook_enabled: !!socialFacebook,
        social_messenger_enabled: !!socialMessenger,
        social_whatsapp_enabled: !!socialWhatsapp,
        social_instagram_enabled: !!socialInstagram,
        social_telegram_enabled: !!socialTelegram,
        social_youtube_enabled: !!socialYoutube,
        social_tiktok_enabled: !!socialTiktok,
        quick_links: quickLinks,
        contact_address: contactAddress,
        contact_support_time: contactSupportTime,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        copyright_text: copyrightText,
        payment_badges: paymentBadges,
        show_footer_logo: !!footerLogo,
        show_about_section: !!aboutTitle || !!aboutDescription,
        show_social_icons: !!(socialFacebook || socialMessenger || socialWhatsapp || socialInstagram || socialTelegram || socialYoutube || socialTiktok),
        show_quick_links: quickLinks.length > 0,
        show_contact_info: !!(contactAddress || contactSupportTime || contactPhone || contactEmail),
        show_support_card: !!cardTitle || !!cardDescription,
        show_copyright: !!copyrightText,
        show_payment_badges: paymentBadges.length > 0
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

  // Quick Links
  const handleAddLink = () => {
    setQuickLinks([...quickLinks, { name: '', url: '' }]);
  };

  const handleUpdateLink = (index: number, field: keyof FooterQuickLink, value: string) => {
    const updated = [...quickLinks];
    updated[index] = { ...updated[index], [field]: value };
    setQuickLinks(updated);
  };

  const handleDeleteLink = (index: number) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
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

  if (isLoading && !settings) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-zinc-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs uppercase tracking-widest font-black">Loading configurations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 px-4 sm:px-6 md:px-8 font-sans text-zinc-950">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="border-y border-zinc-200 py-6 mb-8 text-center">
          <h1 className="text-lg font-black tracking-widest text-zinc-900 uppercase">Footer Management</h1>
        </div>

        {/* Dynamic Warning Alert banners (simple and flat) */}
        {checkingSchema ? (
          <div className="border-l-2 border-zinc-300 bg-zinc-50 p-3 text-[10px] uppercase tracking-wider font-bold text-zinc-600">
            Verifying database schema integrity...
          </div>
        ) : schemaError ? (
          <div className="border-l-2 border-red-500 bg-red-50 p-3 text-xs text-red-800">
            <strong>Database Schema Warning:</strong> {schemaError}
          </div>
        ) : null}

        {validationError && (
          <div className="border-l-2 border-amber-500 bg-amber-50 p-3 text-xs text-amber-800">
            {validationError}
          </div>
        )}

        {dbErrorMessage && (
          <div className="border-l-2 border-red-500 bg-red-50 p-3 text-xs text-red-800 font-mono">
            <strong>Database Write Error:</strong> {dbErrorMessage}
          </div>
        )}

        {saveStatus === 'success' && (
          <div className="border-l-2 border-emerald-500 bg-emerald-50 p-3 text-xs text-emerald-800 font-bold">
            ✓ Changes saved and verified successfully in the database.
          </div>
        )}

        {/* Footer Logo Section */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Footer Logo</label>
          <div className="flex gap-2">
            <label className="flex-1 h-11 px-3 border border-zinc-300 hover:border-black flex items-center justify-between text-sm bg-white cursor-pointer transition-colors">
              <span className="text-zinc-500 truncate text-xs">
                {uploadingLogo ? 'Uploading logo image...' : footerLogo || 'Choose Logo File'}
              </span>
              <span className="text-xs font-bold uppercase text-zinc-800 border-l border-zinc-200 pl-3 shrink-0">Upload Logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
            </label>
            {footerLogo && (
              <button 
                type="button" 
                onClick={() => setFooterLogo('')} 
                className="h-11 px-4 border border-zinc-300 hover:border-red-500 text-zinc-500 hover:text-red-500 transition-colors text-xs font-bold uppercase shrink-0"
              >
                Remove
              </button>
            )}
          </div>
          {footerLogo && (
            <div className="mt-2 p-2 border border-zinc-200 bg-zinc-900 inline-block">
              <img 
                src={footerLogo} 
                alt="Logo Preview" 
                style={{ width: `${footerLogoWidth}px`, height: `${footerLogoHeight}px` }} 
                className="object-contain max-w-full"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        {/* Footer Logo Width */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Footer Logo Width</label>
          <input 
            type="number" 
            value={footerLogoWidth} 
            onChange={(e) => setFooterLogoWidth(Number(e.target.value) || 0)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. 150"
          />
        </div>

        {/* Footer Logo Height */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Footer Logo Height</label>
          <input 
            type="number" 
            value={footerLogoHeight} 
            onChange={(e) => setFooterLogoHeight(Number(e.target.value) || 0)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. 40"
          />
        </div>

        {/* About Title */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">About Title</label>
          <input 
            type="text" 
            value={aboutTitle} 
            onChange={(e) => setAboutTitle(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. About Tazu Mart"
          />
        </div>

        {/* About Description */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">About Description</label>
          <textarea 
            value={aboutDescription} 
            onChange={(e) => setAboutDescription(e.target.value)} 
            rows={3}
            className="w-full p-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white resize-none"
            placeholder="e.g. Browse and shop premium collections with our secure offline / online experience..."
          />
        </div>

        {/* Facebook URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Facebook URL</label>
          <input 
            type="text" 
            value={socialFacebook} 
            onChange={(e) => setSocialFacebook(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://facebook.com/tazumartbd"
          />
        </div>

        {/* Messenger URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Messenger URL</label>
          <input 
            type="text" 
            value={socialMessenger} 
            onChange={(e) => setSocialMessenger(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://m.me/tazumartbd"
          />
        </div>

        {/* WhatsApp URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">WhatsApp URL</label>
          <input 
            type="text" 
            value={socialWhatsapp} 
            onChange={(e) => setSocialWhatsapp(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://wa.me/8801700000000"
          />
        </div>

        {/* Instagram URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Instagram URL</label>
          <input 
            type="text" 
            value={socialInstagram} 
            onChange={(e) => setSocialInstagram(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://instagram.com/tazumartbd"
          />
        </div>

        {/* Telegram URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Telegram URL</label>
          <input 
            type="text" 
            value={socialTelegram} 
            onChange={(e) => setSocialTelegram(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://t.me/tazumartbd"
          />
        </div>

        {/* YouTube URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">YouTube URL</label>
          <input 
            type="text" 
            value={socialYoutube} 
            onChange={(e) => setSocialYoutube(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://youtube.com/tazumartbd"
          />
        </div>

        {/* TikTok URL */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">TikTok URL</label>
          <input 
            type="text" 
            value={socialTiktok} 
            onChange={(e) => setSocialTiktok(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://tiktok.com/@tazumartbd"
          />
        </div>

        {/* Quick Links Group */}
        {quickLinks.map((link, idx) => (
          <div key={idx} className="space-y-3 pt-3 pb-3 border-b border-zinc-100 relative">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Quick Link {idx + 1} Name
                </label>
                <button
                  type="button"
                  onClick={() => handleDeleteLink(idx)}
                  className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Delete Link
                </button>
              </div>
              <input 
                type="text" 
                value={link.name} 
                onChange={(e) => handleUpdateLink(idx, 'name', e.target.value)} 
                className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
                placeholder="Link Display Name"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Quick Link {idx + 1} URL
              </label>
              <input 
                type="text" 
                value={link.url} 
                onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)} 
                className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
                placeholder="Link URL (e.g. /all-products)"
              />
            </div>
          </div>
        ))}

        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddLink}
            className="text-xs font-bold text-zinc-900 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            (+ Add New Link)
          </button>
        </div>

        {/* Store Address */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Store Address</label>
          <input 
            type="text" 
            value={contactAddress} 
            onChange={(e) => setContactAddress(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. Dhaka, Bangladesh"
          />
        </div>

        {/* Support Time */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Support Time</label>
          <input 
            type="text" 
            value={contactSupportTime} 
            onChange={(e) => setContactSupportTime(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. 10 AM - 10 PM (Everyday)"
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Phone Number</label>
          <input 
            type="text" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. +8801700000000"
          />
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Email Address</label>
          <input 
            type="email" 
            value={contactEmail} 
            onChange={(e) => setContactEmail(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. support@tazumartbd.com"
          />
        </div>

        {/* Customer Support Title */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Customer Support Title</label>
          <input 
            type="text" 
            value={cardTitle} 
            onChange={(e) => setCardTitle(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. Customer Support"
          />
        </div>

        {/* Customer Support Description */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Customer Support Description</label>
          <input 
            type="text" 
            value={cardDescription} 
            onChange={(e) => setCardDescription(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. Need help? Contact us now!"
          />
        </div>

        {/* WhatsApp Button Text */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">WhatsApp Button Text</label>
          <input 
            type="text" 
            value={cardWhatsappText} 
            onChange={(e) => setCardWhatsappText(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. Chat on WhatsApp"
          />
        </div>

        {/* WhatsApp Number */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">WhatsApp Number</label>
          <input 
            type="text" 
            value={cardWhatsappLink} 
            onChange={(e) => setCardWhatsappLink(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. https://wa.me/8801700000000"
          />
        </div>

        {/* Call Button Text */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Call Button Text</label>
          <input 
            type="text" 
            value={cardCallText} 
            onChange={(e) => setCardCallText(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. Call Support"
          />
        </div>

        {/* Call Number */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Call Number</label>
          <input 
            type="text" 
            value={cardCallPhone} 
            onChange={(e) => setCardCallPhone(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. +8801700000000"
          />
        </div>

        {/* Copyright Text */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Copyright Text</label>
          <input 
            type="text" 
            value={copyrightText} 
            onChange={(e) => setCopyrightText(e.target.value)} 
            className="w-full h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white"
            placeholder="e.g. © 2026 TAZU MART BD. All Rights Reserved."
          />
        </div>

        {/* Payment Badges Group */}
        {paymentBadges.map((badge, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                Payment Badge {idx + 1}
              </label>
              <button
                type="button"
                onClick={() => handleDeleteBadge(badge)}
                className="text-[10px] text-red-600 hover:text-red-800 font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Remove Badge
              </button>
            </div>
            <input 
              type="text" 
              value={badge} 
              disabled
              className="w-full h-11 px-3 border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-500 uppercase"
            />
          </div>
        ))}

        <div className="space-y-1 pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">Add Payment Badge</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newBadgeText} 
              onChange={(e) => setNewBadgeText(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBadge())}
              className="flex-1 h-11 px-3 border border-zinc-300 focus:border-black focus:ring-0 focus:outline-none text-sm transition-colors bg-white uppercase"
              placeholder="e.g. SSL, COD, VISA"
            />
            <button
              type="button"
              onClick={handleAddBadge}
              className="h-11 px-4 border border-zinc-950 text-zinc-950 hover:bg-zinc-50 font-bold uppercase tracking-wider text-xs transition-colors shrink-0"
            >
              Add Badge
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddBadge}
            className="text-xs font-bold text-zinc-900 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            (+ Add Badge)
          </button>
        </div>

        {/* Save Changes button */}
        <div className="border-t border-zinc-200 pt-8 mt-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full h-12 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                SAVING CHANGES...
              </>
            ) : saveStatus === 'success' ? (
              'SAVED SUCCESSFULLY!'
            ) : (
              'SAVE CHANGES'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
