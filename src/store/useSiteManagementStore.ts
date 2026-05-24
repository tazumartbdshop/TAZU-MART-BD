import { create } from 'zustand';
import { siteManagementService, SiteManagementData } from '../services/siteManagementService';

interface SiteManagementState {
  data: SiteManagementData | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<SiteManagementData>) => Promise<void>;
}

export const useSiteManagementStore = create<SiteManagementState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await siteManagementService.getSettings();
      set({ data: settings, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  updateSettings: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      await siteManagementService.updateSettings(updates);
      set((state) => ({ 
        data: state.data ? { ...state.data, ...updates } : null,
        isLoading: false 
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
