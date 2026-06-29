import { create } from 'zustand';
import { brandingService, BrandingSettings, DEFAULT_BRANDING_SETTINGS } from '../services/brandingService';
import { getSupabase } from '../lib/supabase';

interface BrandingState {
  settings: BrandingSettings;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  fetchBranding: () => Promise<void>;
  updateBranding: (updates: Partial<BrandingSettings>) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useBrandingStore = create<BrandingState>((set, get) => ({
  settings: DEFAULT_BRANDING_SETTINGS,
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchBranding: async () => {
    set({ isLoading: true });
    try {
      const data = await brandingService.getBrandingSettings();
      set({ settings: data, isLoaded: true, isLoading: false });
      
      // Dynamically sync theme colors in style tags if present
      applyDynamicThemeColors(data);
    } catch (e: any) {
      set({ error: e.message || 'Failed to load branding', isLoading: false, isLoaded: true });
    }
  },

  updateBranding: async (updates) => {
    set({ isLoading: true });
    try {
      const updated = await brandingService.updateBrandingSettings(updates);
      set({ settings: updated, isLoading: false });
      applyDynamicThemeColors(updated);
    } catch (e: any) {
      set({ error: e.message || 'Failed to update branding', isLoading: false });
      throw e;
    }
  },

  subscribeRealtime: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const channel = supabase
      .channel('public:branding_settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'branding_settings',
          filter: 'id=eq.global'
        },
        (payload) => {
          if (payload.new) {
            const newSettings = { ...DEFAULT_BRANDING_SETTINGS, ...payload.new } as BrandingSettings;
            set({ settings: newSettings });
            applyDynamicThemeColors(newSettings);
            
            // Dispatch a native event so other modules can handle it if needed
            window.dispatchEvent(new CustomEvent('tazu-branding-updated', { detail: newSettings }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));

// Helper to inject branding configurations dynamically to DOM (e.g. Favicon & dynamic CSS variable themes)
export function applyDynamicThemeColors(settings: BrandingSettings) {
  // 1. Update Browser Tab Favicon
  if (settings.favicon) {
    const faviconElement = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (faviconElement) {
      faviconElement.href = settings.favicon;
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = settings.favicon;
      document.head.appendChild(link);
    }
  }

  // 2. Update Document Title Tagline dynamically
  if (settings.meta_title) {
    document.title = settings.meta_title;
  } else if (settings.site_name) {
    document.title = `${settings.site_name} - ${settings.site_tagline || 'Premium Online Shop'}`;
  }

  // 3. Dynamic Meta Tags (SEO Branding)
  if (settings.meta_description) {
    let metaDesc = document.querySelector("meta[name='description']") as HTMLMetaElement;
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = settings.meta_description;
  }

  if (settings.meta_keywords) {
    let metaKey = document.querySelector("meta[name='keywords']") as HTMLMetaElement;
    if (!metaKey) {
      metaKey = document.createElement('meta');
      metaKey.name = 'keywords';
      document.head.appendChild(metaKey);
    }
    metaKey.content = settings.meta_keywords;
  }

  // 4. Dynamic OpenGraph Social Image Banners
  const shareImg = settings.og_image || settings.facebook_image || settings.share_logo || settings.primary_logo;
  if (shareImg) {
    let ogImg = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.content = shareImg;
  }

  // 5. CSS Custom properties injection
  const primaryColor = settings.primary_color || '#000000';
  const secondaryColor = settings.secondary_color || '#666666';
  const accentColor = settings.accent_color || '#10B981';

  // We set custom styles in a dynamic style block to update any custom tailwind-like elements
  let styleElement = document.getElementById('tazu-branding-dynamic-styles');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'tazu-branding-dynamic-styles';
    document.head.appendChild(styleElement);
  }

  styleElement.innerHTML = `
    :root {
      --brand-primary: ${primaryColor};
      --brand-secondary: ${secondaryColor};
      --brand-accent: ${accentColor};
    }
    .text-brand-primary { color: ${primaryColor} !important; }
    .bg-brand-primary { background-color: ${primaryColor} !important; }
    .border-brand-primary { border-color: ${primaryColor} !important; }
    
    .text-brand-secondary { color: ${secondaryColor} !important; }
    .bg-brand-secondary { background-color: ${secondaryColor} !important; }
    .border-brand-secondary { border-color: ${secondaryColor} !important; }

    .text-brand-accent { color: ${accentColor} !important; }
    .bg-brand-accent { background-color: ${accentColor} !important; }
    .border-brand-accent { border-color: ${accentColor} !important; }
  `;
}
