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
    const fallback = this.getFallbackBanner();

    try {
      const res = await fetch('/api/login-banner', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) {
          this.setFallbackBanner(json.url);
          return json.url;
        }
      }
    } catch (apiErr) {
      console.warn("API fetch for active login banner warning:", apiErr);
    }

    const supabase = getSupabase();
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
    const dataToSave = {
      title: payload.title || 'Login Banner',
      image_url: payload.image_url,
      is_active: payload.is_active !== undefined ? payload.is_active : true,
      sort_order: payload.sort_order ?? 0,
      updated_at: new Date().toISOString()
    };

    let resultRecord: LoginBannerRecord = {
      id: payload.id || `login_ban_${Date.now()}`,
      ...dataToSave,
      created_at: new Date().toISOString()
    };

    // 1. Post to backend API (which updates or inserts into Supabase and local JSON)
    try {
      const res = await fetch('/api/login-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payload.id,
          title: dataToSave.title,
          image_url: dataToSave.image_url,
          is_active: dataToSave.is_active,
          sort_order: dataToSave.sort_order
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.banners)) {
          const matched = json.banners.find((b: any) => b.image_url === payload.image_url || b.image === payload.image_url || String(b.id) === String(payload.id));
          if (matched) {
            resultRecord = {
              id: String(matched.id),
              title: matched.title || matched.name || dataToSave.title,
              image_url: matched.image_url || matched.image || dataToSave.image_url,
              is_active: matched.is_active !== undefined ? Boolean(matched.is_active) : true,
              sort_order: Number(matched.sort_order ?? dataToSave.sort_order),
              created_at: matched.created_at || new Date().toISOString(),
              updated_at: matched.updated_at || new Date().toISOString()
            };
          }
        }
      }
    } catch (apiErr) {
      console.warn("POST /api/login-banner warning:", apiErr);
    }

    // 2. Save local fallback
    if (dataToSave.is_active && dataToSave.image_url) {
      this.setFallbackBanner(dataToSave.image_url);
    }

    // 3. Sync branding settings
    try {
      await brandingService.updateBrandingSettings({ login_banner: payload.image_url });
    } catch (bErr) {
      console.warn('Branding sync note:', bErr);
    }

    return resultRecord;
  },

  async deleteLoginBanner(id: string): Promise<boolean> {
    try {
      // 1. Call server API
      const res = await fetch(`/api/login-banners/${id}`, { method: 'DELETE' });
      
      // 2. Direct Supabase delete
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('login_banners').delete().eq('id', id);
      }

      return res.ok;
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
