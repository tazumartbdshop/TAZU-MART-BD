import { create } from 'zustand';
import { loginProviderService, LoginProvider, defaultProviders } from '../services/loginProviderService';
import { getSupabase } from '../lib/supabase';

interface LoginProviderState {
  providers: LoginProvider[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  fetchProviders: () => Promise<void>;
  updateProviders: (providers: LoginProvider[]) => Promise<void>;
  subscribe: () => () => void;
}

export const useLoginProviderStore = create<LoginProviderState>((set) => ({
  providers: defaultProviders,
  isLoading: false,
  isLoaded: false,
  error: null,
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) {
      set({ isLoaded: true });
      return () => {};
    }

    const loadProviders = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'login_providers').single();
        if (data && !error && data.providers) {
          const parsedProviders = data.providers as LoginProvider[];
          const merged = defaultProviders.map(def => {
            const found = parsedProviders.find(p => p.id === def.id);
            return found ? { ...def, ...found } : def;
          });
          set({ providers: merged.sort((a, b) => a.order - b.order), isLoaded: true });
        } else {
          set({ isLoaded: true });
        }
      } catch (err) {
        set({ isLoaded: true });
      }
    };

    loadProviders();

    const channel = supabase
      .channel('login-providers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
          filter: 'id=eq.login_providers'
        },
        (payload) => {
          if (payload.new && (payload.new as any).providers) {
            const parsedProviders = (payload.new as any).providers as LoginProvider[];
            const merged = defaultProviders.map(def => {
              const found = parsedProviders.find(p => p.id === def.id);
              return found ? { ...def, ...found } : def;
            });
            set({ providers: merged.sort((a, b) => a.order - b.order) });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
  fetchProviders: async () => {
    set({ isLoading: true, error: null });
    try {
      const providers = await loginProviderService.getProviders();
      set({ providers, isLoading: false, isLoaded: true });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, isLoaded: true });
    }
  },
  updateProviders: async (providers) => {
    set({ isLoading: true, error: null });
    try {
      await loginProviderService.updateProviders(providers);
      set({ providers, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));

