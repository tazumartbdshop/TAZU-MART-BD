import { useProductStore } from '../store/useProductStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useBannerStore } from '../store/useBannerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useBrandShowcaseStore } from '../store/useBrandShowcaseStore';
import { useOfferStore } from '../store/useOfferStore';
import { useMenuSortStore } from '../store/useMenuSortStore';
import { useNotificationStore } from '../store/useNotificationStore';

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  channel = new BroadcastChannel('tazu_mart_realtime_sync');
}

const listeners: Map<string, Set<(data: any) => void>> = new Map();

export const broadcastSync = {
  publish: (type: string, data: any) => {
    if (channel) {
      channel.postMessage({ type, data });
    }
  },

  subscribe: (type: string, callback: (data: any) => void) => {
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type)!.add(callback);

    if (channel && !channel.onmessage) {
      channel.onmessage = (event) => {
        const { type: evtType, data } = event.data || {};
        if (evtType && listeners.has(evtType)) {
          listeners.get(evtType)!.forEach(cb => cb(data));
        }
      };
    }

    return () => {
      listeners.get(type)?.delete(callback);
    };
  },
  
  init: () => {
    if (!channel) return;
    
    channel.onmessage = (event) => {
      const { type, data } = event.data || {};
      console.log(`%c[Cross-Tab Realtime Sync] Received update for: ${type}`, "color: #10b981; font-weight: bold;");
      
      if (type && listeners.has(type)) {
        listeners.get(type)!.forEach(cb => cb(data));
      }

      switch (type) {
        case 'products':
          useProductStore.setState({ products: data, isLoaded: true });
          try { localStorage.setItem('supabase_cached_products', JSON.stringify(data)); } catch(e) {}
          break;
          
        case 'categories':
          useCategoryStore.setState({ categories: data, isLoaded: true });
          try { localStorage.setItem('supabase_cached_categories', JSON.stringify(data)); } catch(e) {}
          break;
          
        case 'banners':
          useBannerStore.setState({ banners: data, isLoaded: true });
          try { localStorage.setItem('supabase_cached_banners', JSON.stringify(data)); } catch(e) {}
          break;
          
        case 'settings':
          useSettingsStore.setState({ settings: data, draftSettings: data, isLoaded: true });
          break;
          
        case 'brands':
          useBrandShowcaseStore.setState({ slides: data, isLoaded: true });
          break;
          
        case 'offers':
          useOfferStore.setState({ offers: data, isLoaded: true });
          break;
          
        case 'menuSort':
          useMenuSortStore.setState({ ...data, isLoaded: true });
          break;

        case 'notifications':
          useNotificationStore.setState({ notifications: data });
          try { localStorage.setItem('tazu-promotional-notifications', JSON.stringify({ state: { notifications: data } })); } catch(e) {}
          break;
      }
    };

    // Listen to StorageEvent as a redundant fallback
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === 'supabase_cached_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          useProductStore.setState({ products: parsed, isLoaded: true });
        } catch(err) {}
      }
      if (e.key === 'supabase_cached_categories' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          useCategoryStore.setState({ categories: parsed, isLoaded: true });
        } catch(err) {}
      }
      if (e.key === 'supabase_cached_banners' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          useBannerStore.setState({ banners: parsed, isLoaded: true });
        } catch(err) {}
      }
    });
  }
};
