import { create } from 'zustand';
import { loginProviderService, LoginProvider, defaultProviders } from '../services/loginProviderService';

interface LoginProviderState {
  providers: LoginProvider[];
  isLoading: boolean;
  error: string | null;
  fetchProviders: () => Promise<void>;
  updateProviders: (providers: LoginProvider[]) => Promise<void>;
}

export const useLoginProviderStore = create<LoginProviderState>((set) => ({
  providers: defaultProviders,
  isLoading: false,
  error: null,
  fetchProviders: async () => {
    set({ isLoading: true, error: null });
    try {
      const providers = await loginProviderService.getProviders();
      set({ providers, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
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
