import { getSupabase } from '../lib/supabase';

export interface FooterQuickLink {
  name: string;
  url: string;
  id?: string;
}

export interface FooterSettings {
  id: string;
  footer_logo: string;
  footer_logo_width: number;
  footer_logo_height: number;
  about_title: string;
  about_description: string;
  social_facebook: string;
  social_messenger: string;
  social_whatsapp: string;
  social_instagram: string;
  social_telegram: string;
  social_youtube: string;
  social_tiktok: string;
  social_facebook_enabled: boolean;
  social_messenger_enabled: boolean;
  social_whatsapp_enabled: boolean;
  social_instagram_enabled: boolean;
  social_telegram_enabled: boolean;
  social_youtube_enabled: boolean;
  social_tiktok_enabled: boolean;
  quick_links: FooterQuickLink[];
  contact_address: string;
  contact_support_time: string;
  contact_phone: string;
  contact_email: string;
  card_title: string;
  card_subtitle: string;
  card_description: string;
  card_whatsapp_text: string;
  card_whatsapp_link: string;
  card_call_text: string;
  card_call_phone: string;
  copyright_text: string;
  payment_badges: string[];
  show_footer_logo: boolean;
  show_about_section: boolean;
  show_social_icons: boolean;
  show_quick_links: boolean;
  show_contact_info: boolean;
  show_support_card: boolean;
  show_copyright: boolean;
  show_payment_badges: boolean;
  updated_at?: string;
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  id: 'global',
  footer_logo: '',
  footer_logo_width: 150,
  footer_logo_height: 40,
  about_title: '',
  about_description: '',
  social_facebook: '',
  social_messenger: '',
  social_whatsapp: '',
  social_instagram: '',
  social_telegram: '',
  social_youtube: '',
  social_tiktok: '',
  social_facebook_enabled: false,
  social_messenger_enabled: false,
  social_whatsapp_enabled: false,
  social_instagram_enabled: false,
  social_telegram_enabled: false,
  social_youtube_enabled: false,
  social_tiktok_enabled: false,
  quick_links: [],
  contact_address: '',
  contact_support_time: '',
  contact_phone: '',
  contact_email: '',
  card_title: '',
  card_subtitle: '',
  card_description: '',
  card_whatsapp_text: '',
  card_whatsapp_link: '',
  card_call_text: '',
  card_call_phone: '',
  copyright_text: '',
  payment_badges: [],
  show_footer_logo: false,
  show_about_section: false,
  show_social_icons: false,
  show_quick_links: false,
  show_contact_info: false,
  show_support_card: false,
  show_copyright: false,
  show_payment_badges: false
};

const LOCAL_STORAGE_KEY = 'tazu_footer_settings_fallback';

export function sanitizeFooterSettings(settings: any): FooterSettings {
  if (!settings) return { ...DEFAULT_FOOTER_SETTINGS };
  const sanitized = { ...DEFAULT_FOOTER_SETTINGS, ...settings };
  
  if (typeof sanitized.quick_links === 'string') {
    try {
      sanitized.quick_links = JSON.parse(sanitized.quick_links);
    } catch (e) {
      sanitized.quick_links = [];
    }
  }
  if (!Array.isArray(sanitized.quick_links)) {
    sanitized.quick_links = [];
  }
  
  if (typeof sanitized.payment_badges === 'string') {
    try {
      sanitized.payment_badges = JSON.parse(sanitized.payment_badges);
    } catch (e) {
      sanitized.payment_badges = [];
    }
  }
  if (!Array.isArray(sanitized.payment_badges)) {
    sanitized.payment_badges = [];
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
    
    // First, try to fetch from Express server proxy API
    try {
      const response = await fetch('/api/footer-settings');
      if (response.ok) {
        const data = await response.json();
        if (data && data.id === 'global') {
          const sanitized = sanitizeFooterSettings(data);
          this.saveFallbackSettings(sanitized);
          return sanitized;
        }
      }
    } catch (e) {
      console.warn("Express server getFooterSettings failed, trying direct Supabase...", e);
    }

    if (!supabase) return fallback;

    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('id', 'global')
        .limit(1);

      if (error) {
        // If table doesn't exist, try querying settings table under 'footer_settings' id
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('id', 'footer_settings')
          .limit(1);
        
        if (settingsData && settingsData.length > 0) {
          const val = settingsData[0].value;
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          const sanitized = sanitizeFooterSettings(parsed);
          this.saveFallbackSettings(sanitized);
          return sanitized;
        }
        throw error;
      }

      if (data && data.length > 0) {
        const settings = sanitizeFooterSettings(data[0]);
        this.saveFallbackSettings(settings);
        return settings;
      } else {
        // Seed default settings to table
        await this.saveFooterSettings(fallback);
        return fallback;
      }
    } catch (err) {
      console.warn("Failed to fetch footer settings from database, using fallback", err);
      return fallback;
    }
  },

  async saveFooterSettings(settings: FooterSettings): Promise<boolean> {
    this.saveFallbackSettings(settings);
    const supabase = getSupabase();

    // 1. Save to Express server proxy API
    let apiSuccess = false;
    try {
      const response = await fetch('/api/footer-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        apiSuccess = true;
      }
    } catch (e) {
      console.warn("Express server saveFooterSettings failed", e);
    }

    if (!supabase) return apiSuccess;

    try {
      const dbSettings = {
        ...settings,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('footer_settings')
        .upsert(dbSettings);

      if (error) {
        // Table doesn't exist, try fallback saving to settings table with JSON string value
        const { error: settingsError } = await supabase
          .from('settings')
          .upsert({
            id: 'footer_settings',
            value: JSON.stringify(dbSettings),
            updated_at: new Date().toISOString()
          });
        
        if (settingsError) throw settingsError;
      }

      return true;
    } catch (err) {
      console.error("Failed to save footer settings to database:", err);
      return apiSuccess;
    }
  }
};
