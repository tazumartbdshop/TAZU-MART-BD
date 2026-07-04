import { useProductStore } from '../store/useProductStore';
import { useCategoryStore } from '../store/useCategoryStore';
import { useBannerStore } from '../store/useBannerStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useBrandShowcaseStore } from '../store/useBrandShowcaseStore';
import { useOfferStore } from '../store/useOfferStore';
import { useMenuSortStore } from '../store/useMenuSortStore';

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  channel = new BroadcastChannel('tazu_mart_realtime_sync');
}

export const broadcastSync = {
  publish: (type: string, data: any) => {
    if (channel) {
      channel.postMessage({ type, data });
    }
  },
  
  init: () => {
    if (!channel) return;
    
    channel.onmessage = (event) => {
      const { type, data } = event.data || {};
      console.log(`%c[Cross-Tab Realtime Sync] Received update for: ${type}`, "color: #10b981; font-weight: bold;");
      
      switch (type) {
        case 'products':
          useProductStore.setState({ products: data });
          try { localStorage.setItem('tazu_cached_products', JSON.stringify(data)); } catch(e) {}
          break;
          
        case 'categories':
          useCategoryStore.setState({ categories: data });
          try { localStorage.setItem('tazu_cached_categories', JSON.stringify(data)); } catch(e) {}
          break;
          
        case 'banners':
          useBannerStore.setState({ banners: data });
          try { localStorage.setItem('tazu_cached_banners', JSON.stringify(data)); } catch(e) {}
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
      }
    };

    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key === 'tazu_cached_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          useProductStore.setState({ products: parsed });
        } catch(err) {}
      }
      if (e.key === 'tazu_cached_categories' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          useCategoryStore.setState({ categories: parsed });
        } catch(err) {}
      }
      if (e.key === 'tazu_cached_banners' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          useBannerStore.setState({ banners: parsed });
        } catch(err) {}
      }
    });
  }
};
