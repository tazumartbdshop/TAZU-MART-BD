import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export interface PopupOffer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  productId: string; // Direct Linked Product ID
  categoryId: string; // Optional Category Select (Popup triggers for products in this category)
  bannerUrl: string; // Ratio 1:1 Crop
  primaryButtonText: string; // Default: 'Buy Now'
  secondaryButtonText: string; // Default: 'Skip Deal'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'Draft' | 'Published' | 'Expired';
  views: number;
  buyNowClicks: number;
  skipClicks: number;
  createdAt: number;
}

interface PopupOfferStore {
  popupOffers: PopupOffer[];
  isLoaded: boolean;
  subscribe: () => () => void;
  addPopupOffer: (offer: Omit<PopupOffer, 'id' | 'views' | 'buyNowClicks' | 'skipClicks' | 'createdAt'>) => Promise<void>;
  updatePopupOffer: (id: string, updates: Partial<PopupOffer>) => Promise<void>;
  deletePopupOffer: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  incrementBuyNowClicks: (id: string) => Promise<void>;
  incrementSkipClicks: (id: string) => Promise<void>;
}

const defaultOffer: PopupOffer = {
  id: 'popup-default',
  title: 'Daraz Weekly Surprise Offer',
  subtitle: 'EXCLUSIVE MEGA DISCOUNT',
  description: 'Grab our special selected super deal today before the stock runs out. Limited times only!',
  productId: '', // empty originally until products are mapped
  categoryId: '', // empty originally
  bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', // high quality square banner
  primaryButtonText: 'Buy Now',
  secondaryButtonText: 'Skip Deal',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: 'Published',
  views: 154,
  buyNowClicks: 42,
  skipClicks: 112,
  createdAt: Date.now()
};

export const usePopupOfferStore = create<PopupOfferStore>()((set, get) => ({
  popupOffers: [],
  isLoaded: false,

  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadOffers = async () => {
        const { data, error } = await supabase.from('popup_offers').select('*').order('createdAt', { ascending: false });
        if (!error && data && data.length > 0) {
            set({ popupOffers: data as PopupOffer[], isLoaded: true });
        } else if (!error && data && data.length === 0) {
            supabase.from('popup_offers').upsert([defaultOffer]).then(({error}) => error && console.warn(error));
            set({ popupOffers: [defaultOffer], isLoaded: true });
        }
    };
    
    loadOffers();
    
    const channel = supabase
      .channel('public:popup_offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'popup_offers' }, () => {
         loadOffers();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  },

  addPopupOffer: async (offer) => {
    try {
      const docId = `popup-${Date.now()}`;
      const newOffer: PopupOffer = {
        ...offer,
        id: docId,
        views: 0,
        buyNowClicks: 0,
        skipClicks: 0,
        createdAt: Date.now(),
      };
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('popup_offers').insert([newOffer]);
          if(error) throw error;
      }
    } catch (err) {
      console.error('Error adding popup offer to Supabase:', err);
    }
  },

  updatePopupOffer: async (id, updates) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('popup_offers').update(updates).eq('id', id);
          if(error) throw error;
      }
    } catch (err) {
      console.error('Error updating popup offer in Supabase:', err);
    }
  },

  deletePopupOffer: async (id) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('popup_offers').delete().eq('id', id);
          if(error) throw error;
      }
    } catch (err) {
      console.error('Error deleting popup offer from Supabase:', err);
    }
  },

  incrementViews: async (id) => {
    try {
      const state = get();
      const offer = state.popupOffers.find(o => o.id === id);
      if (offer) {
          const supabase = getSupabase();
          if (supabase) await supabase.from('popup_offers').update({views: offer.views + 1}).eq('id', id);
      }
    } catch (err) {
      console.error('Error incrementing views for popup offer:', err);
    }
  },

  incrementBuyNowClicks: async (id) => {
    try {
      const state = get();
      const offer = state.popupOffers.find(o => o.id === id);
      if (offer) {
          const supabase = getSupabase();
          if (supabase) await supabase.from('popup_offers').update({buyNowClicks: offer.buyNowClicks + 1}).eq('id', id);
      }
    } catch (err) {
      console.error('Error incrementing Buy Now clicks for popup offer:', err);
    }
  },

  incrementSkipClicks: async (id) => {
    try {
      const state = get();
      const offer = state.popupOffers.find(o => o.id === id);
      if (offer) {
          const supabase = getSupabase();
          if (supabase) await supabase.from('popup_offers').update({skipClicks: offer.skipClicks + 1}).eq('id', id);
      }
    } catch (err) {
      console.error('Error incrementing Skip clicks for popup offer:', err);
    }
  }
}));
