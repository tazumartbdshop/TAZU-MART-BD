import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { brandingService } from './brandingService';

export interface LoginBannerRecord {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

const CACHE_KEY = 'tazu_active_login_banner_cache';

export const loginBannerService = {
  getFallbackBanner(): string {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) return cached;
    } catch (e) {
      console.warn('LocalStorage error reading login banner cache:', e);
    }
    return '';
  },

  setFallbackBanner(url: string) {
    try {
      if (url) {
        localStorage.setItem(CACHE_KEY, url);
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (e) {
      console.warn('LocalStorage error saving login banner cache:', e);
    }
  },

  async getActiveLoginBanner(): Promise<string> {
    const supabase = getSupabase();
    const fallback = this.getFallbackBanner();

    if (!supabase) return fallback;

    try {
      // 1. Query dedicated login_banners table
      const { data, error } = await supabase
        .from('login_banners')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0 && data[0].image_url) {
        const activeUrl = data[0].image_url;
        this.setFallbackBanner(activeUrl);
        return activeUrl;
      }

      // 2. Fallback check from branding_settings if login_banners table is empty
      const { data: brandData, error: brandErr } = await supabase
        .from('branding_settings')
        .select('login_banner')
        .limit(1);

      if (!brandErr && brandData && brandData.length > 0 && brandData[0].login_banner) {
        const brandUrl = brandData[0].login_banner;
        this.setFallbackBanner(brandUrl);
        return brandUrl;
      }
    } catch (err) {
      console.warn('Failed to fetch active login banner from Supabase:', err);
    }

    return fallback;
  },

  async getAllLoginBanners(): Promise<LoginBannerRecord[]> {
    const supabase = getSupabase();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('login_banners')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching all login banners:', error);
        return [];
      }
      return (data || []) as LoginBannerRecord[];
    } catch (err) {
      console.error('getAllLoginBanners exception:', err);
      return [];
    }
  },

  async saveLoginBanner(payload: {
    id?: string;
    title?: string;
    image_url: string;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<LoginBannerRecord> {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('Database connection unavailable');
    }

    const dataToSave = {
      title: payload.title || 'Login Banner',
      image_url: payload.image_url,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      sort_order: payload.sort_order ?? 0,
      updated_at: new Date().toISOString()
    };

    let resultRecord: LoginBannerRecord;

    if (payload.id && !payload.id.startsWith('ban_') && payload.id.length > 20) {
      // Update existing
      const { data, error } = await supabase
        .from('login_banners')
        .update(dataToSave)
        .eq('id', payload.id)
        .select()
        .single();

      if (error) throw error;
      resultRecord = data as LoginBannerRecord;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('login_banners')
        .insert([dataToSave])
        .select()
        .single();

      if (error) throw error;
      resultRecord = data as LoginBannerRecord;
    }

    // Save locally
    if (resultRecord.is_active && resultRecord.image_url) {
      this.setFallbackBanner(resultRecord.image_url);
    }

    // Also sync branding_settings.login_banner
    try {
      await brandingService.updateBrandingSettings({ login_banner: payload.image_url });
    } catch (bErr) {
      console.warn('Branding sync note:', bErr);
    }

    return resultRecord;
  },

  async deleteLoginBanner(id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('login_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Delete login banner error:', err);
      return false;
    }
  }
};

/**
 * Custom React Hook for Live Real-Time Login Banner Subscription
 */
export function useLoginBanner() {
  const [bannerUrl, setBannerUrl] = useState<string>(() => loginBannerService.getFallbackBanner());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadBanner = async () => {
      try {
        const activeBanner = await loginBannerService.getActiveLoginBanner();
        if (isMounted && activeBanner) {
          setBannerUrl(activeBanner);
        }
      } catch (err) {
        console.warn('Banner fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadBanner();

    // Subscribe to realtime changes on login_banners table
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel('public:login_banners_live:' + Math.random().toString(36).substr(2, 8))
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'login_banners' },
        () => {
          loadBanner();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { bannerUrl, isLoading, refreshBanner: () => loginBannerService.getActiveLoginBanner() };
}
