import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2, 
  Check, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useFooterSettingsStore } from '../../store/useFooterSettingsStore';
import { FooterSettings, FooterQuickLink } from '../../services/footerSettingsService';
import { uploadImage } from '../../lib/imageUtils';

export default function AdminFooterSettings() {
  const { settings, isLoading, fetchFooterSettings } = useFooterSettingsStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  // Form Submission Validation Flag to highlight empty fields
  const [hasSubmittedAttempt, setHasSubmittedAttempt] = useState(false);

  // Initialize
  useEffect(() => {
    fetchFooterSettings();
  }, []);

  // Sync state with store values (Populates fields on initial load)
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

  // Validation checks for empty required fields
  const isAboutTitleEmpty = !aboutTitle || aboutTitle.trim() === '';
  const isAboutDescriptionEmpty = !aboutDescription || aboutDescription.trim() === '';
  const isContactAddressEmpty = !contactAddress || contactAddress.trim() === '';
  const isContactSupportTimeEmpty = !contactSupportTime || contactSupportTime.trim() === '';
  const isContactPhoneEmpty = !contactPhone || contactPhone.trim() === '';
  const isContactEmailEmpty = !contactEmail || contactEmail.trim() === '';
  const isCardTitleEmpty = !cardTitle || cardTitle.trim() === '';
  const isCardDescriptionEmpty = !cardDescription || cardDescription.trim() === '';
  const isCopyrightTextEmpty = !copyrightText || copyrightText.trim() === '';

  // Quick link item validation (prevent empty name or URL inside added links)
  const isAnyQuickLinkEmpty = quickLinks.some(link => !link.name || link.name.trim() === '' || !link.url || link.url.trim() === '');

  // Form overall validity helper
  const isFormValid = 
    !isAboutTitleEmpty &&
    !isAboutDescriptionEmpty &&
    !isContactAddressEmpty &&
    !isContactSupportTimeEmpty &&
    !isContactPhoneEmpty &&
    !isContactEmailEmpty &&
    !isCardTitleEmpty &&
    !isCardDescriptionEmpty &&
    !isCopyrightTextEmpty &&
    !isAnyQuickLinkEmpty;

  // Save changes
  const handleSave = async () => {
    setHasSubmittedAttempt(true);
    setValidationError(null);
    setDbErrorMessage(null);

    // Front-end strict validation safeguard
    if (!isFormValid) {
      setValidationError("Validation failed. Please fill out all required fields marked with * and ensure no Quick Link is blank.");
      setSaveStatus('error');
      // Scroll smoothly to top of the page to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaveStatus('saving');

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
      if (resData.success) {
        // Reload values from the database and sync the global store
        await fetchFooterSettings();
        setSaveStatus('success');
        setHasSubmittedAttempt(false);
        setTimeout(() => setSaveStatus('idle'), 5000);
      } else {
        throw new Error("Failed to verify saved values against the database after saving.");
      }
    } catch (e: any) {
      console.error("Detailed error while saving footer settings:", e);
      setDbErrorMessage("Failed to save footer settings. Please try again.");
      setSaveStatus('error');
    }
  };

  // Reset Form back to empty/default blank state
  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear the form? This will reset all local text inputs to empty. (Your database records will not change until you click Save Changes).")) {
      setFooterLogo('');
      setFooterLogoWidth(150);
      setFooterLogoHeight(40);
      setAboutTitle('');
      setAboutDescription('');
      setSocialFacebook('');
      setSocialMessenger('');
      setSocialWhatsapp('');
      setSocialInstagram('');
      setSocialTelegram('');
      setSocialYoutube('');
      setSocialTiktok('');
      setQuickLinks([]);
      setContactAddress('');
      setContactSupportTime('');
      setContactPhone('');
      setContactEmail('');
      setCardTitle('');
      setCardDescription('');
      setCardWhatsappText('');
      setCardWhatsappLink('');
      setCardCallText('');
      setCardCallPhone('');
      setCopyrightText('');
      setPaymentBadges([]);
      setValidationError(null);
      setDbErrorMessage(null);
      setHasSubmittedAttempt(false);
      setSaveStatus('idle');
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

  // Quick Links handlers
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

  // Payment Badges handlers
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

        {validationError && (
          <div className="border-l-2 border-red-500 bg-red-50 p-3 text-xs text-red-800 font-semibold">
            {validationError}
          </div>
        )}

        {dbErrorMessage && (
          <div className="border-l-2 border-red-500 bg-red-50 p-3 text-xs text-red-800 font-semibold">
            {dbErrorMessage}
          </div>
        )}

        {saveStatus === 'success' && (
          <div className="border-l-2 border-emerald-500 bg-emerald-50 p-3 text-xs text-emerald-800 font-bold">
            ✓ Footer settings saved successfully.
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
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            About Title <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text" 
            value={aboutTitle} 
            onChange={(e) => setAboutTitle(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isAboutTitleEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. About Tazu Mart"
          />
          {hasSubmittedAttempt && isAboutTitleEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
        </div>

        {/* About Description */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            About Description <span className="text-red-500 font-bold">*</span>
          </label>
          <textarea 
            value={aboutDescription} 
            onChange={(e) => setAboutDescription(e.target.value)} 
            rows={3}
            className={`w-full p-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white resize-none ${
              hasSubmittedAttempt && isAboutDescriptionEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. Browse and shop premium collections with our secure offline / online experience..."
          />
          {hasSubmittedAttempt && isAboutDescriptionEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
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
        {quickLinks.map((link, idx) => {
          const isNameEmpty = !link.name || link.name.trim() === '';
          const isUrlEmpty = !link.url || link.url.trim() === '';
          return (
            <div key={idx} className="space-y-3 pt-3 pb-3 border-b border-zinc-100 relative">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Quick Link {idx + 1} Name <span className="text-red-500 font-bold">*</span>
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
                  className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
                    hasSubmittedAttempt && isNameEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
                  }`}
                  placeholder="Link Display Name"
                />
                {hasSubmittedAttempt && isNameEmpty && (
                  <p className="text-red-500 text-xs font-bold">This field is required.</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Quick Link {idx + 1} URL <span className="text-red-500 font-bold">*</span>
                </label>
                <input 
                  type="text" 
                  value={link.url} 
                  onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)} 
                  className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
                    hasSubmittedAttempt && isUrlEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
                  }`}
                  placeholder="Link URL (e.g. /all-products)"
                />
                {hasSubmittedAttempt && isUrlEmpty && (
                  <p className="text-red-500 text-xs font-bold">This field is required.</p>
                )}
              </div>
            </div>
          );
        })}

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
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Store Address <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text" 
            value={contactAddress} 
            onChange={(e) => setContactAddress(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isContactAddressEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. Dhaka, Bangladesh"
          />
          {hasSubmittedAttempt && isContactAddressEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
        </div>

        {/* Support Time */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Support Time <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text" 
            value={contactSupportTime} 
            onChange={(e) => setContactSupportTime(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isContactSupportTimeEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. 10 AM - 10 PM (Everyday)"
          />
          {hasSubmittedAttempt && isContactSupportTimeEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Phone Number <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text" 
            value={contactPhone} 
            onChange={(e) => setContactPhone(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isContactPhoneEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. +8801700000000"
          />
          {hasSubmittedAttempt && isContactPhoneEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Email Address <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="email" 
            value={contactEmail} 
            onChange={(e) => setContactEmail(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isContactEmailEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. support@tazumartbd.com"
          />
          {hasSubmittedAttempt && isContactEmailEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
        </div>

        {/* Customer Support Title */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Customer Support Title <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text" 
            value={cardTitle} 
            onChange={(e) => setCardTitle(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isCardTitleEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. Customer Support"
          />
          {hasSubmittedAttempt && isCardTitleEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
        </div>

        {/* Customer Support Description */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Customer Support Description <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text" 
            value={cardDescription} 
            onChange={(e) => setCardDescription(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isCardDescriptionEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. Need help? Contact us now!"
          />
          {hasSubmittedAttempt && isCardDescriptionEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
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
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Copyright Text <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text" 
            value={copyrightText} 
            onChange={(e) => setCopyrightText(e.target.value)} 
            className={`w-full h-11 px-3 border focus:ring-0 focus:outline-none text-sm transition-colors bg-white ${
              hasSubmittedAttempt && isCopyrightTextEmpty ? 'border-red-500 bg-red-50/20 focus:border-red-500' : 'border-zinc-300 focus:border-black'
            }`}
            placeholder="e.g. © 2026 TAZU MART BD. All Rights Reserved."
          />
          {hasSubmittedAttempt && isCopyrightTextEmpty && (
            <p className="text-red-500 text-xs font-bold">This field is required.</p>
          )}
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
              className="w-full h-11 px-3 border border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-500 uppercase cursor-not-allowed"
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
              className="h-11 px-4 border border-zinc-950 text-zinc-950 hover:bg-zinc-50 font-bold uppercase tracking-wider text-xs transition-colors shrink-0 cursor-pointer"
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

        {/* Save & Reset Changes Buttons */}
        <div className="border-t border-zinc-200 pt-8 mt-10 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 h-12 border border-zinc-300 hover:border-black text-zinc-800 hover:text-black font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer bg-white"
          >
            <RotateCcw className="w-4 h-4" />
            RESET FORM
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveStatus === 'saving' || (hasSubmittedAttempt && !isFormValid)}
            className="flex-[2] h-12 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
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
