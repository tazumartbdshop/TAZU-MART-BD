import { create } from 'zustand';
import { supportBannerService, SupportBannerData } from '../services/supportBannerService';

interface SupportBannerState {
  banner: SupportBannerData | null;
  draftBanner: SupportBannerData | null;
  isLoading: boolean;
  error: string | null;
  fetchBanner: () => Promise<void>;
  updateBanner: (updates: Partial<SupportBannerData>) => Promise<void>;
  updateDraftBanner: (updates: Partial<SupportBannerData>) => void;
  publishBanner: () => Promise<void>;
  resetDraftBanner: () => void;
}

export const useSupportBannerStore = create<SupportBannerState>((set, get) => ({
  banner: null,
  draftBanner: null,
  isLoading: false,
  error: null,
  fetchBanner: async () => {
    set({ isLoading: true, error: null });
    try {
      const banner = await supportBannerService.getBanner();
      set({ 
        banner, 
        draftBanner: banner, // Initialize draft with live data
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  updateBanner: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      await supportBannerService.updateBanner(updates);
      const newBanner = get().banner ? { ...get().banner!, ...updates } : null;
      set({ 
        banner: newBanner,
        draftBanner: newBanner,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  updateDraftBanner: (updates) => {
    set((state) => ({
      draftBanner: state.draftBanner ? { ...state.draftBanner, ...updates } : null
    }));
  },
  publishBanner: async () => {
    const { draftBanner } = get();
    if (draftBanner) {
      await get().updateBanner(draftBanner);
    }
  },
  resetDraftBanner: () => {
    set((state) => ({
      draftBanner: state.banner
    }));
  }
}));
