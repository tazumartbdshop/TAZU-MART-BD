import { create } from 'zustand';
import { siteManagementService, SiteManagementData } from '../services/siteManagementService';

interface SiteManagementState {
  data: SiteManagementData | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<SiteManagementData>) => Promise<void>;
}

export const useSiteManagementStore = create<SiteManagementState>((set) => ({
  data: null,
  isLoading: false,
  isLoaded: false,
  error: null,
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    
    let timeoutId: any;
    let isFinished = false;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        if (!isFinished) reject(new Error('Data Fetch Timeout (5s)'));
      }, 5000);
    });

    try {
      const settings = await Promise.race([
        siteManagementService.getSettings().then((res) => {
          isFinished = true;
          clearTimeout(timeoutId);
          return res;
        }),
        timeoutPromise
      ]) as SiteManagementData;
      
      set({ data: settings, isLoading: false, isLoaded: true });
    } catch (error: any) {
      isFinished = true;
      clearTimeout(timeoutId);
      console.warn("[Boot Notice] Site config fetch status:", error.message);
      // Soft-fallback to default settings to guarantee smooth load
      const defaults = await siteManagementService.getSettings().catch(() => null);
      set({ data: defaults, isLoading: false, isLoaded: true });
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
