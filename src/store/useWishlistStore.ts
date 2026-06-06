import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],

      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.wishlistIds.includes(productId);
          const updated = exists
            ? state.wishlistIds.filter((id) => id !== productId)
            : [...state.wishlistIds, productId];
          return { wishlistIds: updated };
        });
      },

      isInWishlist: (productId) => {
        return get().wishlistIds.includes(productId);
      },

      clearWishlist: () => {
        set({ wishlistIds: [] });
      },
    }),
    {
      name: 'tazu-wishlist',
    }
  )
);
