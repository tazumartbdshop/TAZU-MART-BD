import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Banner {
  id: string;
  image: string;
  name: string;
  buttonEnabled: boolean;
  buttonText: string;
  isCustomButtonText: boolean;
  connectedProductId?: string;
  status: 'active' | 'draft' | 'hidden';
  order: number;
}

interface BannerState {
  banners: Banner[];
  setBanners: (banners: Banner[]) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  addBanner: () => void;
  removeBanner: (id: string) => void;
  reorderBanners: (startIndex: number, endIndex: number) => void;
}

export const useBannerStore = create<BannerState>()(
  persist(
    (set) => ({
      banners: [
        {
          id: '1',
          image: '',
          name: '',
          buttonEnabled: false,
          buttonText: 'Shop Now',
          isCustomButtonText: false,
          status: 'active',
          order: 0,
        }
      ],
      setBanners: (banners) => set({ banners }),
      updateBanner: (id, updates) => set((state) => ({
        banners: state.banners.map((b) => b.id === id ? { ...b, ...updates } : b)
      })),
      addBanner: () => set((state) => ({
        banners: [
          ...state.banners,
          {
            id: Math.random().toString(36).substring(2, 9),
            image: '',
            name: '',
            buttonEnabled: false,
            buttonText: 'Shop Now',
            isCustomButtonText: false,
            status: 'draft',
            order: state.banners.length,
          }
        ]
      })),
      removeBanner: (id) => set((state) => ({
        banners: state.banners.filter((b) => b.id !== id)
      })),
      reorderBanners: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.banners);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        
        // Update order property
        return {
          banners: result.map((b, idx) => ({ ...b, order: idx }))
        };
      }),
    }),
    {
      name: 'banner-storage',
    }
  )
);
