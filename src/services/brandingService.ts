import { getSupabase } from '../lib/supabase';

export interface BrandingSettings {
  id: string;
  site_name: string;
  site_short_name: string;
  site_tagline: string;
  
  // Logos
  primary_logo: string;
  secondary_logo: string;
  favicon: string;
  apple_touch_icon: string;
  mobile_logo: string;
  desktop_logo: string;
  dark_logo: string;
  light_logo: string;
  footer_logo: string;
  invoice_logo: string;
  email_logo: string;
  loading_logo: string;
  watermark_logo: string;
  share_logo: string;
  login_logo: string;
  signup_logo: string;
  
  // Branding Images
  default_profile_image: string;
  male_profile_image: string;
  female_profile_image: string;
  login_banner: string;
  default_store_banner: string;
  default_category_banner: string;
  default_product_image: string;
  default_blog_banner: string;
  og_image: string;
  
  // Theme Branding
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  background_color: string;
  
  // SEO Branding
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  
  // Social Branding
  facebook_image: string;
  twitter_image: string;
  linkedin_image: string;
  
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_BRANDING_SETTINGS: BrandingSettings = {
  id: 'global',
  site_name: '',
  site_short_name: '',
  site_tagline: '',

  primary_logo: '',
  secondary_logo: '',
  favicon: '',
  apple_touch_icon: '',
  mobile_logo: '',
  desktop_logo: '',
  dark_logo: '',
  light_logo: '',
  footer_logo: '',
  invoice_logo: '',
  email_logo: '',
  loading_logo: '',
  watermark_logo: '',
  share_logo: '',
  login_logo: '',
  signup_logo: '',

  default_profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  male_profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  female_profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  login_banner: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
  default_store_banner: '',
  default_category_banner: '',
  default_product_image: '',
  default_blog_banner: '',
  og_image: '',

  primary_color: '#000000',
  secondary_color: '#666666',
  accent_color: '#10B981',
  text_color: '#171717',
  background_color: '#FAFAFA',
  
  // SEO Branding
  meta_title: 'TAZU MART BD - Premium Lifetime Collection',
  meta_description: 'Browse and shop premium collections from Tazu Mart BD. Enjoy secure checkout, fast shipping, and exceptional customer support.',
  meta_keywords: 'Tazu Mart BD, Premium Collection, Online Shop, Bangladesh, Dhaka Shopping',
  
  // Social Branding
  facebook_image: '',
  twitter_image: '',
  linkedin_image: '',
};

const LOCAL_STORAGE_KEY = 'tazu_branding_settings_fallback';

export const brandingService = {
  getFallbackSettings(): BrandingSettings {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_BRANDING_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("localStorage fallback parse failed:", e);
    }
    return DEFAULT_BRANDING_SETTINGS;
  },

  saveFallbackSettings(settings: BrandingSettings) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("localStorage fallback save failed:", e);
    }
  },

  async getBrandingSettings(): Promise<BrandingSettings> {
    const fallback = this.getFallbackSettings();
    let apiSettings: Partial<BrandingSettings> = {};

    try {
      const res = await fetch('/api/account-characters', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          apiSettings = json.settings;
        }
      }
    } catch (apiErr) {
      console.warn("API fetch for account-characters failed:", apiErr);
    }

    const supabase = getSupabase();
    if (!supabase) return { ...DEFAULT_BRANDING_SETTINGS, ...fallback, ...apiSettings };
    
    try {
      const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .eq('id', 'global')
        .limit(1);
        
      if (error) {
        if (error.code === '42P01') {
          return { ...DEFAULT_BRANDING_SETTINGS, ...fallback, ...apiSettings };
        }
        throw error;
      }
      
      if (data && data.length > 0) {
        const dbRow = data[0];
        const mappedRow = {
          ...dbRow,
          primary_logo: dbRow.logo_url || dbRow.primary_logo || '',
          favicon: dbRow.favicon_url || dbRow.favicon || '',
          site_name: dbRow.site_title || dbRow.site_name || ''
        };
        const merged = { ...DEFAULT_BRANDING_SETTINGS, ...fallback, ...mappedRow, ...apiSettings };
        this.saveFallbackSettings(merged as BrandingSettings);
        return merged;
      } else {
        const cleanRecord = {
          id: 'global',
          login_banner: fallback.login_banner || apiSettings.login_banner || '',
          male_profile_image: fallback.male_profile_image || apiSettings.male_profile_image || '',
          female_profile_image: fallback.female_profile_image || apiSettings.female_profile_image || '',
          default_profile_image: fallback.default_profile_image || apiSettings.default_profile_image || ''
        };
        await supabase.from('branding_settings').upsert([cleanRecord]);
        return { ...DEFAULT_BRANDING_SETTINGS, ...fallback, ...apiSettings };
      }
    } catch (e) {
      console.warn("Supabase fetch for branding_settings failed, using fallback:", e);
      return { ...DEFAULT_BRANDING_SETTINGS, ...fallback, ...apiSettings };
    }
  },

  async updateBrandingSettings(updates: Partial<BrandingSettings>): Promise<BrandingSettings> {
    const current = await this.getBrandingSettings();
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // 1. Save locally for instant reactive UI sync
    this.saveFallbackSettings(updated);

    // 2. Post to backend API
    try {
      await fetch('/api/account-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (apiErr) {
      console.warn("POST /api/account-characters warning:", apiErr);
    }

    // 3. Sync directly with Supabase using clean table schema columns
    const supabase = getSupabase();
    if (supabase) {
      try {
        const cleanDbRecord: Record<string, any> = {
          id: 'global',
          updated_at: new Date().toISOString()
        };
        if (updated.login_banner !== undefined) cleanDbRecord.login_banner = updated.login_banner;
        if (updated.male_profile_image !== undefined) cleanDbRecord.male_profile_image = updated.male_profile_image;
        if (updated.female_profile_image !== undefined) cleanDbRecord.female_profile_image = updated.female_profile_image;
        if (updated.default_profile_image !== undefined) cleanDbRecord.default_profile_image = updated.default_profile_image;
        if (updated.primary_logo !== undefined) cleanDbRecord.logo_url = updated.primary_logo;
        if (updated.favicon !== undefined) cleanDbRecord.favicon_url = updated.favicon;
        if (updated.site_name !== undefined) cleanDbRecord.site_title = updated.site_name;

        const { error } = await supabase
          .from('branding_settings')
          .upsert([cleanDbRecord]);
          
        if (error && error.code !== '42P01') {
          console.warn("Supabase branding_settings notice:", error.message);
        }
      } catch (e) {
        console.error("Supabase failed to save branding_settings:", e);
      }
    }
    
    return updated;
  }
};
