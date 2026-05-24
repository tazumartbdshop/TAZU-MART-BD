import { create } from 'zustand';
import { supportBannerService, SupportBannerData } from '../services/supportBannerService';

interface SupportBannerState {
  banner: SupportBannerData | null;
  isLoading: boolean;
  error: string | null;
  fetchBanner: () => Promise<void>;
  updateBanner: (updates: Partial<SupportBannerData>) => Promise<void>;
}

export const useSupportBannerStore = create<SupportBannerState>((set) => ({
  banner: null,
  isLoading: false,
  error: null,
  fetchBanner: async () => {
    set({ isLoading: true, error: null });
    try {
      const banner = await supportBannerService.getBanner();
      set({ banner, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  updateBanner: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      await supportBannerService.updateBanner(updates);
      set((state) => ({ 
        banner: state.banner ? { ...state.banner, ...updates } : null,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
