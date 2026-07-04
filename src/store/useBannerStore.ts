import { create } from 'zustand';

export interface Banner {
  id: string | number;
  image: string;
  name?: string;
  link?: string;
  title?: string;
  subtitle?: string;
  offerText?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  buttonEnabled?: boolean;
  isCustomButtonText?: boolean;
  connectedProductId?: string;
  status?: string;
  is_active?: boolean;
  bannerType?: string;
  bannerSize?: string;
  discountText?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  isGradient?: boolean;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  italic?: boolean;
  alignment?: string;
  logoImage?: string;
  productImage?: string;
  stickerType?: string;
  stickerText?: string;
  countdownEnabled?: boolean;
  countdownDate?: string;
  locations?: string[];
  order?: number;
  createdDate?: string;
}

interface BannerState {
  banners: Banner[];
  draftBanners: Banner[];
  isLoading: boolean;
  isLoaded: boolean;
  sliderConfig?: any;
  fetchBanners: () => Promise<void>;
  addBanner: (banner: any) => Promise<void>;
  updateBanner: (id: string | number, updates: any) => Promise<void>;
  deleteBanner: (id: string | number) => Promise<void>;
  deleteBannerPermanently: (id: string | number) => Promise<void>;
  reorderBanners: (startIndex: number, endIndex: number) => void;
  setBanners: (banners: Banner[]) => void;
  setDraftBanners: (banners: Banner[]) => void;
  publishBanners: () => Promise<void>;
  resetDraftBanners: () => void;
  subscribe: () => () => void;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  draftBanners: [],
  isLoading: false,
  isLoaded: false,
  sliderConfig: { autoSlide: true, duration: 5 },

  fetchBanners: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      set({ banners: data, draftBanners: data, isLoaded: true });
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addBanner: async (payload) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        get().fetchBanners();
      }
    } catch (err) {
      console.error("Failed to add banner:", err);
    }
  },

  updateBanner: async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        get().fetchBanners();
      }
    } catch (err) {
      console.error("Failed to update banner:", err);
    }
  },

  deleteBanner: async (id) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        get().fetchBanners();
      }
    } catch (err) {
      console.error("Failed to delete banner:", err);
    }
  },

  deleteBannerPermanently: async (id) => {
    await get().deleteBanner(id);
  },

  reorderBanners: (startIndex, endIndex) => {
    const result = Array.from(get().banners);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    set({ banners: result });
  },

  setBanners: (banners) => set({ banners }),
  setDraftBanners: (draftBanners) => set({ draftBanners }),
  publishBanners: async () => {
     set({ banners: get().draftBanners });
  },
  resetDraftBanners: () => set({ draftBanners: get().banners }),

  subscribe: () => {
    get().fetchBanners();
    return () => {};
  }
}));
