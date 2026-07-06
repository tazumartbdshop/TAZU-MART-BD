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
  variant?: string;
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
      addItem: (item) => {
        set((state) => {
          let originalPrice = item.originalPrice;
          let price = item.price;
          const baseId = item.id.split('-')[0];
          
          try {
            const products = useProductStore.getState().products;
            const product = products.find((p) => p.id === baseId);
            if (product) {
              if (originalPrice === undefined) {
                originalPrice = product.price;
              }
              // If the added price matches standard product price or static product discountPrice,
              // let's verify if there is an active offer boosting it further
              if (price === product.price || price === product.discountPrice) {
                const offers = useOfferStore.getState().offers;
                const discountDetails = getProductDiscountDetails(product, offers);
                price = discountDetails.discountPrice;
              }
            }
          } catch (e) {
            // Ignore lazy load error
          }

          if (originalPrice === undefined) {
            originalPrice = price;
          }

          const quantity = item.quantity || 1;
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, price, originalPrice, quantity }] };
        });
      },
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
