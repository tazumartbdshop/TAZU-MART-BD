import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';

interface RecentlyViewedState {
  viewedIdsByAccount: Record<string, string[]>;
  addViewedProduct: (productId: string) => void;
  clearViewedProducts: () => void;
  getViewedProducts: () => string[];
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      viewedIdsByAccount: {},

      addViewedProduct: (productId) => {
        // Resolve user ID or guest status
        const userId = useAuthStore.getState().user?.id || 'guest';
        set((state) => {
          const currentList = state.viewedIdsByAccount[userId] || [];
          
          // Duplicate control: remove any existing occurrence
          const filtered = currentList.filter((id) => id !== productId);
          
          // Insert newest at top
          const newList = [productId, ...filtered].slice(0, 10);

          return {
            viewedIdsByAccount: {
              ...state.viewedIdsByAccount,
              [userId]: newList,
            },
          };
        });
      },

      clearViewedProducts: () => {
        const userId = useAuthStore.getState().user?.id || 'guest';
        set((state) => ({
          viewedIdsByAccount: {
            ...state.viewedIdsByAccount,
            [userId]: [],
          },
        }));
      },

      getViewedProducts: () => {
        const userId = useAuthStore.getState().user?.id || 'guest';
        return get().viewedIdsByAccount[userId] || [];
      },
    }),
    {
      name: 'tazu-recently-viewed',
    }
  )
);
