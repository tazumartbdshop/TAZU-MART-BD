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
    
    let timeoutId: any;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Data Fetch Timeout (5s)')), 5000);
    });

    try {
      const settings = await Promise.race([
        siteManagementService.getSettings(),
        timeoutPromise
      ]) as SiteManagementData;
      
      clearTimeout(timeoutId);
      set({ data: settings, isLoading: false });
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error("[Boot Error] Site config failed:", error.message);
      set({ error: error.message, isLoading: false });
      // We don't block the app, we let it use default values if possible
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
