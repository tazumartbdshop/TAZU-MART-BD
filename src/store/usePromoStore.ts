import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export type DiscountType = 'Percentage' | 'Fixed Amount';

export interface PromoCode {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'Active' | 'Inactive';
  createdAt: number;
}

interface PromoStore {
  promoCodes: PromoCode[];
  isLoaded: boolean;
  subscribe: () => () => void;
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'>) => Promise<void>;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  incrementPromoUsedCount: (id: string) => Promise<void>;
}

const initialPromos: PromoCode[] = [
  {
    id: 'SAVE100',
    name: 'Save 100 Taka Promo',
    code: 'SAVE100',
    type: 'Fixed Amount',
    value: 100,
    minOrder: 1000,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usedCount: 0,
    status: 'Active',
    createdAt: Date.now(),
  },
  {
    id: 'WELCOME50',
    name: 'New Customer Welcome',
    code: 'WELCOME50',
    type: 'Fixed Amount',
    value: 50,
    minOrder: 500,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 0,
    status: 'Active',
    createdAt: Date.now(),
  },
  {
    id: 'SAVE10',
    name: 'Mega 10 Percent Save',
    code: 'SAVE10',
    type: 'Percentage',
    value: 10,
    minOrder: 1000,
    expiryDate: '2026-12-31',
    usageLimit: 100,
    usedCount: 0,
    status: 'Active',
    createdAt: Date.now(),
  }
];

export const usePromoStore = create<PromoStore>()((set, get) => ({
  promoCodes: [],
  isLoaded: false,

  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadPromos = async () => {
        const { data, error } = await supabase.from('promo_codes').select('*');
        if (!error && data && data.length > 0) {
            set({ promoCodes: data as PromoCode[], isLoaded: true });
        } else if (!error && data && data.length === 0) {
            supabase.from('promo_codes').upsert(initialPromos).then(({error}) => error && console.warn(error));
             set({ promoCodes: initialPromos, isLoaded: true });
        }
    };
    
    loadPromos();
    
    const channel = supabase
      .channel('public:promo_codes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_codes' }, () => {
         loadPromos();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  },

  addPromoCode: async (promo) => {
    try {
      const docId = promo.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const newPromo: PromoCode = {
        ...promo,
        id: docId || Math.random().toString(36).substring(2, 9),
        usedCount: 0,
        createdAt: Date.now(),
      };
      
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('promo_codes').insert([newPromo]);
          if(error) throw error;
      }
    } catch (err) {
      console.error('Error adding promo code to Supabase:', err);
    }
  },
  updatePromoCode: async (id, updates) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('promo_codes').update(updates).eq('id', id);
          if(error) throw error;
      }
    } catch (err) {
      console.error('Error updating promo code in Supabase:', err);
    }
  },
  deletePromoCode: async (id) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('promo_codes').delete().eq('id', id);
          if (error) throw error;
      }
    } catch (err) {
      console.error('Error deleting promo code from Supabase:', err);
    }
  },
  incrementPromoUsedCount: async (id) => {
    try {
      const codes = get().promoCodes;
      const found = codes.find(c => c.id === id);
      if (found) {
        const supabase = getSupabase();
        if (supabase) {
             const { error } = await supabase.from('promo_codes').update({ usedCount: (found.usedCount || 0) + 1 }).eq('id', id);
             if (error) throw error;
        }
      }
    } catch (err) {
      console.error('Error incrementing promo used count in Supabase:', err);
    }
  }
}));
