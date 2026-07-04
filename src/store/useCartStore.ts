import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useProductStore } from './useProductStore';
import { useOfferStore } from './useOfferStore';
import { getProductDiscountDetails } from '../lib/offerUtils';

export interface CartItem {
  id: string;
  slug?: string;
  sku?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  originalPrice?: number;
  discountType?: 'Percentage' | 'Fixed Amount';
  discountValue?: number;
  isOfferItem?: boolean;
  campaignId?: string;
  campaignDiscountPercent?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: async (item) => {
        const { user } = (await import('./useAuthStore')).useAuthStore.getState();
        
        if (user) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, productId: item.id, quantity: item.quantity || 1, variant: '' })
          });
        }

        set((state) => {
          // ... (keep local optimistic update)
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
        });
      },
      // ... (add fetchCartItems if needed)
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },
      clearCart: () => set({ items: [] }),
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'luxe-cart-storage',
    }
  )
);
