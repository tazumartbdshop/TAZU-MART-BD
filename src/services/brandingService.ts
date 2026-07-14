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

  default_profile_image: '',
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
    const supabase = getSupabase();
    const fallback = this.getFallbackSettings();
    if (!supabase) return fallback;
    
    try {
      const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .eq('id', 'global')
        .limit(1);
        
      if (error) {
        // Table may not be created yet, use fallback smoothly
        if (error.code === '42P01') {
          console.warn("branding_settings table relation does not exist yet. Using offline premium fallback.");
          return fallback;
        }
        throw error;
      }
      
      if (data && data.length > 0) {
        // Save to fallback cache for super fast initial load next time
        this.saveFallbackSettings(data[0] as BrandingSettings);
        return { ...DEFAULT_BRANDING_SETTINGS, ...data[0] };
      } else {
        // If row doesn't exist, insert defaults
        await supabase.from('branding_settings').upsert([{ id: 'global', ...fallback }]);
        return fallback;
      }
    } catch (e) {
      console.warn("Supabase fetch for branding_settings failed, fallback in use:", e);
      return fallback;
    }
  },

  async updateBrandingSettings(updates: Partial<BrandingSettings>): Promise<BrandingSettings> {
    const current = await this.getBrandingSettings();
    const updated = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    // Save locally first for instant reactive update
    this.saveFallbackSettings(updated);
    
    const supabase = getSupabase();
    if (!supabase) return updated;
    
    try {
      const { error } = await supabase
        .from('branding_settings')
        .upsert([{ id: 'global', ...updated }]);
        
      if (error && error.code !== '42P01') {
        throw error;
      }
    } catch (e) {
      console.error("Supabase failed to save branding_settings:", e);
    }
    
    return updated;
  }
};
