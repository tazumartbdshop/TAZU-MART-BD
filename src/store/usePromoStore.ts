import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DiscountType = 'Percentage' | 'Fixed Amount' | 'Free Delivery';

export interface PromoCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  freeDelivery: boolean;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'Active' | 'Disabled';
  createdAt: number;
}

interface PromoStore {
  promoCodes: PromoCode[];
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'>) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  deletePromoCode: (id: string) => void;
  validatePromoCode: (code: string, subtotal: number) => { 
    isValid: boolean; 
    error?: string; 
    promo?: PromoCode;
  };
}

export const usePromoStore = create<PromoStore>()(
  persist(
    (set, get) => ({
      promoCodes: [
        {
          id: '1',
          code: 'WELCOME50',
          type: 'Fixed Amount',
          value: 50,
          minOrder: 500,
          freeDelivery: false,
          expiryDate: '2026-12-31',
          usageLimit: 100,
          usedCount: 15,
          status: 'Active',
          createdAt: Date.now(),
        },
        {
          id: '2',
          code: 'SAVE10',
          type: 'Percentage',
          value: 10,
          minOrder: 1000,
          freeDelivery: false,
          expiryDate: '2026-12-31',
          usageLimit: 50,
          usedCount: 5,
          status: 'Active',
          createdAt: Date.now(),
        },
        {
          id: '3',
          code: 'FREESHIP',
          type: 'Free Delivery',
          value: 0,
          minOrder: 0,
          freeDelivery: true,
          expiryDate: '2026-12-31',
          usageLimit: 200,
          usedCount: 42,
          status: 'Active',
          createdAt: Date.now(),
        }
      ],
      addPromoCode: (promo) => set((state) => ({
        promoCodes: [
          ...state.promoCodes,
          {
            ...promo,
            id: Math.random().toString(36).substring(2, 9),
            usedCount: 0,
            createdAt: Date.now(),
          }
        ]
      })),
      updatePromoCode: (id, updates) => set((state) => ({
        promoCodes: state.promoCodes.map((p) => (p.id === id ? { ...p, ...updates } : p))
      })),
      deletePromoCode: (id) => set((state) => ({
        promoCodes: state.promoCodes.filter((p) => p.id !== id)
      })),
      validatePromoCode: (code, subtotal) => {
        const promo = get().promoCodes.find((p) => p.code.toUpperCase() === code.toUpperCase());
        
        if (!promo) return { isValid: false, error: 'Invalid Code' };
        if (promo.status === 'Disabled') return { isValid: false, error: 'Invalid Code' };
        
        const now = new Date();
        const expiry = new Date(promo.expiryDate);
        if (expiry < now) return { isValid: false, error: 'Coupon Expired' };
        
        if (promo.usedCount >= promo.usageLimit) return { isValid: false, error: 'Usage limit reached' };
        if (subtotal < promo.minOrder) {
          return { isValid: false, error: `Minimum order for this code is ৳${promo.minOrder}` };
        }
        
        return { isValid: true, promo };
      }
    }),
    {
      name: 'tazu-promo-store',
    }
  )
);
