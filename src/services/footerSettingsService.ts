import { getSupabase } from '../lib/supabase';

export interface FooterQuickLink {
  label: string;
  url: string;
}

export interface SocialMediaSetting {
  url: string;
  enabled: boolean;
}

export interface PaymentMethodSetting {
  id: string;
  name: string;
  enabled: boolean;
}

export interface FooterSettings {
  // Section 1: Company Information
  companyName: string;
  companyTagline: string;
  businessDescription: string;
  copyrightText: string;

  // Section 2: Contact Information
  phone: string;
  contactWhatsapp: string; // WhatsApp Number
  email: string;
  address: string;
  workingHours: string;

  // Section 3: Quick Links
  quickLinks: FooterQuickLink[];

  // Section 4: Social Media
  facebook: SocialMediaSetting;
  instagram: SocialMediaSetting;
  youtube: SocialMediaSetting;
  tiktok: SocialMediaSetting;
  messenger: SocialMediaSetting;
  socialWhatsapp: SocialMediaSetting;

  // Section 5: Payment Methods
  paymentMethods: PaymentMethodSetting[];

  // Section 6: Footer Logo
  footerLogoUrl: string;

  // Section 7: Footer Banner
  footerBannerUrl: string;
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  companyName: 'Your Company',
  companyTagline: 'Your Tagline',
  businessDescription: 'Your business description goes here.',
  copyrightText: '© 2026 Your Company. All rights reserved.',
  phone: '',
  contactWhatsapp: '',
  email: '',
  address: '',
  workingHours: '',
  quickLinks: [
    { label: 'Brands', url: '/brands' },
    { label: 'About Us', url: '/about-us' },
    { label: 'Contact Us', url: '/contact-us' },
    { label: 'Privacy Policy', url: '/privacy-policy' },
    { label: 'Terms & Conditions', url: '/terms-and-conditions' },
    { label: 'Refund Policy', url: '/refund-policy' }
  ],
  facebook: { url: '', enabled: false },
  instagram: { url: '', enabled: false },
  youtube: { url: '', enabled: false },
  tiktok: { url: '', enabled: false },
  messenger: { url: '', enabled: false },
  socialWhatsapp: { url: '', enabled: false },
  paymentMethods: [
    { id: 'visa', name: 'Visa', enabled: false },
    { id: 'mastercard', name: 'MasterCard', enabled: false },
    { id: 'bkash', name: 'Bkash', enabled: false },
    { id: 'nagad', name: 'Nagad', enabled: false },
    { id: 'rocket', name: 'Rocket', enabled: false },
    { id: 'sslcommerz', name: 'SSLCommerz', enabled: false },
    { id: 'cod', name: 'Cash On Delivery', enabled: false }
  ],
  footerLogoUrl: '',
  footerBannerUrl: ''
};

const LOCAL_STORAGE_KEY = 'tazu_footer_settings_v2';
const SETTINGS_DB_ID = 'footer_config_v2';

export function sanitizeFooterSettings(settings: any): FooterSettings {
  if (!settings) return { ...DEFAULT_FOOTER_SETTINGS };
  const sanitized = { ...DEFAULT_FOOTER_SETTINGS, ...settings };
  
  // Ensure objects are initialized if undefined
  sanitized.facebook = { ...DEFAULT_FOOTER_SETTINGS.facebook, ...(settings.facebook || {}) };
  sanitized.instagram = { ...DEFAULT_FOOTER_SETTINGS.instagram, ...(settings.instagram || {}) };
  sanitized.youtube = { ...DEFAULT_FOOTER_SETTINGS.youtube, ...(settings.youtube || {}) };
  sanitized.tiktok = { ...DEFAULT_FOOTER_SETTINGS.tiktok, ...(settings.tiktok || {}) };
  sanitized.messenger = { ...DEFAULT_FOOTER_SETTINGS.messenger, ...(settings.messenger || {}) };
  sanitized.socialWhatsapp = { ...DEFAULT_FOOTER_SETTINGS.socialWhatsapp, ...(settings.socialWhatsapp || {}) };
  
  if (Array.isArray(settings.quickLinks)) {
    sanitized.quickLinks = settings.quickLinks;
  }
  
  if (Array.isArray(settings.paymentMethods)) {
    // Merge enabled state with defaults to ensure all 7 are present
    const updatedMethods = DEFAULT_FOOTER_SETTINGS.paymentMethods.map(def => {
      const found = settings.paymentMethods.find((m: any) => m.id === def.id);
      return found ? { ...def, enabled: found.enabled } : def;
    });
    sanitized.paymentMethods = updatedMethods;
  }
  
  return sanitized;
}

export const footerSettingsService = {
  getFallbackSettings(): FooterSettings {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return sanitizeFooterSettings(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("localStorage fallback parse failed:", e);
    }
    return DEFAULT_FOOTER_SETTINGS;
  },

  saveFallbackSettings(settings: FooterSettings) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("localStorage fallback save failed:", e);
    }
  },

  async getFooterSettings(): Promise<FooterSettings> {
    const supabase = getSupabase();
    const fallback = this.getFallbackSettings();
    
    if (!supabase) return fallback;
    
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('id', SETTINGS_DB_ID)
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data && data.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        const settings = sanitizeFooterSettings(parsed);
        this.saveFallbackSettings(settings);
        return settings;
      } else {
        return fallback;
      }
    } catch (err) {
      console.error("Failed to fetch footer settings from database, using fallback", err);
      return fallback;
    }
  },

  async saveFooterSettings(settings: FooterSettings): Promise<boolean> {
    this.saveFallbackSettings(settings);
    const supabase = getSupabase();
    
    if (!supabase) return true; // Pretend it succeeded if no DB
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: SETTINGS_DB_ID,
          value: JSON.stringify(settings)
        });
        
      if (error) throw error;
      
      // Dispatch live update event for the customer panel
      window.dispatchEvent(new CustomEvent('tazu-footer-updated', { detail: settings }));
      
      return true;
    } catch (err) {
      console.error("Failed to save footer settings to database:", err);
      return false;
    }
  }
};

