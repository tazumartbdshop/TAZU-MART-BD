import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export interface Offer {
  id: string;
  name: string;
  type: 'Flash Sale' | 'Trending Items' | 'Best Selling' | 'Weekly Sale' | 'Eid Sale' | 'New Arrival' | 'Custom Offer' | 'Limited Time Deal' | 'Coupon Offer' | 'Special Campaign' | 'Seasonal Offer' | 'Weekend Deal' | 'Special Discount';
  bannerStyle: string; // Gradient css classes
  startDate: string;
  endDate: string;
  status: 'Active' | 'Hidden';
  homepageVisibility: boolean;
  offersPageVisibility: boolean;
  priority: number; // Added for sorting categories
  showAsFlashSale: boolean;
  showAsTrending: boolean;
  showAsBestSelling: boolean;
  description: string;
  productIds: string[]; // Existing product IDs
  manualProductIds: string[]; // Product IDs added manually that are bound to this offer
  bannerMode?: 'auto' | 'custom';
  banners?: { url: string; link: string }[]; // Updated from customBannerUrls
  customBannerUrls?: string[]; // Backwards compatibility
  autoSlide?: boolean; // Added
  slideDurationSeconds?: number; // Added
  layoutMode?: 'grid' | 'marquee';
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  autoExpire?: boolean;
}

interface OfferState {
  offers: Offer[];
  isLoaded: boolean;
  addOffer: (offer: Omit<Offer, 'id' | 'bannerStyle'>) => void;
  updateOffer: (id: string, updatedFields: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  getBannerStyleByType: (type: Offer['type']) => string;
  subscribe: () => () => void;
}

const getBannerStyleByType = (type: Offer['type']) => {
  switch (type) {
    case 'Flash Sale':
      return 'bg-gradient-to-br from-[#E2125B] via-red-600 to-pink-500';
    case 'Trending Items':
      return 'bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600';
    case 'Best Selling':
      return 'bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950';
    case 'Weekly Sale':
      return 'bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-500';
    case 'Eid Sale':
    case 'Seasonal Offer':
      return 'bg-gradient-to-br from-emerald-800 via-green-700 to-teal-900';
    case 'New Arrival':
      return 'bg-gradient-to-br from-amber-600 via-neutral-900 to-neutral-950';
    case 'Limited Time Deal':
      return 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600';
    case 'Coupon Offer':
      return 'bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600';
    case 'Special Campaign':
      return 'bg-gradient-to-br from-rose-500 via-fuchsia-600 to-purple-600';
    default:
      return 'bg-gradient-to-br from-zinc-800 to-zinc-950';
  }
};

const initialOffers: Offer[] = [
  {
    id: 'o-flash-sale',
    name: 'Flash Sale Offers',
    type: 'Flash Sale',
    bannerStyle: 'bg-gradient-to-br from-[#E2125B] via-red-600 to-pink-500',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    status: 'Active',
    homepageVisibility: true,
    offersPageVisibility: true,
    priority: 0,
    showAsFlashSale: true,
    showAsTrending: false,
    showAsBestSelling: false,
    description: 'Grab yours before they are completely sold out!',
    productIds: ['smart-watch-series-x', 'wireless-earbuds-pro', 'bluetooth-speaker-mini', 'gaming-mouse-rgb', 'fast-charging-powerbank', 'fast-charger-33w'],
    manualProductIds: [],
  },
  {
    id: 'o-trending',
    name: 'Trending Items',
    type: 'Trending Items',
    bannerStyle: 'bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    status: 'Active',
    homepageVisibility: true,
    offersPageVisibility: true,
    priority: 1,
    showAsFlashSale: false,
    showAsTrending: true,
    showAsBestSelling: false,
    description: 'Tested and loved by thousands of verified purchasers.',
    productIds: ['travel-backpack-pro', 'mens-casual-shoe', 'womens-handbag', 'smart-led-lamp', 'fitness-band', 'wireless-keyboard'],
    manualProductIds: [],
  },
  {
    id: 'o-eid-offers',
    name: 'Eid Offers',
    type: 'Eid Sale',
    bannerStyle: 'bg-gradient-to-br from-emerald-800 via-green-700 to-teal-900',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    status: 'Active',
    homepageVisibility: true,
    offersPageVisibility: true,
    priority: 2,
    showAsFlashSale: false,
    showAsTrending: false,
    showAsBestSelling: false,
    description: 'Exquisite collections for the upcoming festival.',
    productIds: ['panjabi-collection', 'premium-shirt', 'ladies-3-piece', 'panjabi-combo-set', 'arabic-oud-perfume', 'gift-box-package'],
    manualProductIds: [],
  },
];

export const useOfferStore = create<OfferState>((set, get) => ({
  offers: initialOffers,
  isLoaded: false,
  getBannerStyleByType,
  
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadOffers = async () => {
        const { data, error } = await supabase.from('offers').select('*').order('priority', { ascending: true });
        if (!error && data && data.length > 0) {
            set({ offers: data as Offer[], isLoaded: true });
        } else if (!error && data && data.length === 0) {
            supabase.from('offers').upsert(initialOffers).then(({error}) => error && console.warn(error));
            set({ offers: initialOffers, isLoaded: true });
        }
    };
    
    loadOffers();
    
    const channel = supabase
      .channel('public:offers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, () => {
         loadOffers();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  },

  addOffer: (offerPayload) => {
    const id = 'o-' + Math.random().toString(36).substring(2, 9);
    const bannerStyle = getBannerStyleByType(offerPayload.type);
    const newOffer: Offer = {
      ...offerPayload,
      priority: offerPayload.priority ?? 0,
      id,
      bannerStyle,
    };
    
    const supabase = getSupabase();
    if (supabase) supabase.from('offers').insert([newOffer]).then(({error}) => error && console.warn(error));
      
    set((state) => ({ offers: [newOffer, ...state.offers] }));
  },

  updateOffer: (id, updatedFields) => {
    const state = get();
    const updatedOffers = state.offers.map((o) => {
      if (o.id === id) {
        const updated = { ...o, ...updatedFields };
        if (updatedFields.type) {
          updated.bannerStyle = getBannerStyleByType(updatedFields.type);
        }
        return updated;
      }
      return o;
    });
    
    const offerToUpdate = updatedOffers.find(o => o.id === id);
    if (offerToUpdate) {
      const supabase = getSupabase();
      if (supabase) supabase.from('offers').update(offerToUpdate).eq('id', id).then(({error}) => error && console.warn(error));
    }
    
    set({ offers: updatedOffers });
  },

  deleteOffer: (id) => {
    const supabase = getSupabase();
    if (supabase) supabase.from('offers').delete().eq('id', id).then(({error}) => error && console.warn(error));
      
    set((state) => ({
      offers: state.offers.filter((o) => o.id !== id),
    }));
  },
}));
