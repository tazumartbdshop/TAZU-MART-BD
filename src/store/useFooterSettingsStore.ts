import { create } from 'zustand';
import { footerSettingsService, FooterSettings, DEFAULT_FOOTER_SETTINGS } from '../services/footerSettingsService';
import { getSupabase } from '../lib/supabase';

interface FooterSettingsState {
  settings: FooterSettings;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  fetchFooterSettings: () => Promise<void>;
  updateFooterSettings: (updates: Partial<FooterSettings>) => Promise<void>;
  subscribeRealtime: () => () => void;
}

export const useFooterSettingsStore = create<FooterSettingsState>((set, get) => ({
  settings: footerSettingsService.getFallbackSettings(),
  isLoading: false,
  isLoaded: false,
  error: null,

  fetchFooterSettings: async () => {
    set({ isLoading: true });
    try {
      const data = await footerSettingsService.getFooterSettings();
      set({ settings: data, isLoaded: true, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to load footer settings', isLoading: false, isLoaded: true });
    }
  },

  updateFooterSettings: async (updates) => {
    set({ isLoading: true });
    try {
      const current = get().settings;
      const merged = { ...current, ...updates };
      const success = await footerSettingsService.saveFooterSettings(merged);
      if (success) {
        set({ settings: merged, isLoading: false });
        // Dispatch custom event for immediate UI live update across any listening views
        window.dispatchEvent(new CustomEvent('tazu-footer-updated', { detail: merged }));
      } else {
        throw new Error('Failed to save footer settings');
      }
    } catch (e: any) {
      set({ error: e.message || 'Failed to update footer settings', isLoading: false });
      throw e;
    }
  },

  subscribeRealtime: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const channel = supabase
      .channel('public:footer_settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'footer_settings',
          filter: 'id=eq.global'
        },
        (payload) => {
          if (payload.new) {
            const newSettings = { ...DEFAULT_FOOTER_SETTINGS, ...payload.new } as FooterSettings;
            set({ settings: newSettings });
            window.dispatchEvent(new CustomEvent('tazu-footer-updated', { detail: newSettings }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
