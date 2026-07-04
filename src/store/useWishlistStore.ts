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

      toggleWishlist: async (productId) => {
        const { user } = (await import('./useAuthStore')).useAuthStore.getState();
        const exists = get().wishlistIds.includes(productId);

        if (user) {
          if (exists) {
            await fetch(`/api/wishlist?userId=${user.id}&productId=${productId}`, {
              method: 'DELETE'
            });
          } else {
            await fetch('/api/wishlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, productId })
            });
          }
        }

        set((state) => {
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
