import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';

export interface Banner {
  id: string;
  image: string;
  originalImage?: string;
  name: string;
  description?: string;
  buttonEnabled: boolean;
  buttonText: string;
  buttonLink?: string;
  isCustomButtonText: boolean;
  connectedProductId?: string;
  locations?: string[];
  bannerSize?: 'small' | 'medium' | 'large' | 'hero' | 'custom';
  ctaDestination?: string;
  destinationType?: 'Product Page' | 'Category Page' | 'Flash Sale' | 'Offer Page' | 'Brand Page' | 'External Link' | 'custom' | string;
  ctaText?: string;
  ctaLink?: string;
  status: 'active' | 'draft' | 'hidden';
  order: number;
  bannerType?: 'uploaded' | 'designed';
  offerText?: string;
  discountText?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  isGradient?: boolean;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right';
  logoImage?: string;
  productImage?: string;
  stickerType?: 'none' | 'percent' | 'sale' | 'new' | 'hot';
  stickerText?: string;
  countdownEnabled?: boolean;
  countdownDate?: string;
  connectedCategoryId?: string;
  connectedOfferId?: string;
  createdDate?: string;
}

interface BannerState {
  banners: Banner[];
  draftBanners: Banner[];
  isLoaded: boolean;
  hasUnsavedChanges: boolean;
  sliderConfig: {
    autoSlide: boolean;
    duration: number; // in seconds
  };
  setBanners: (banners: Banner[]) => void;
  setDraftBanners: (banners: Banner[]) => void;
  setHasUnsavedChanges: (val: boolean) => void;
  updateSliderConfig: (autoSlide: boolean, duration: number) => void;
  updateSliderConfigLocal: (autoSlide: boolean, duration: number) => void;
  updateBanner: (id: string, updates: Partial<Banner>) => void;
  updateDraftBanner: (id: string, updates: Partial<Banner>) => void;
  addBanner: (type?: 'uploaded' | 'designed') => void;
  addDraftBanner: (type?: 'uploaded' | 'designed') => void;
  duplicateDraftBanner: (banner: Banner) => void;
  removeBanner: (id: string) => void;
  removeDraftBanner: (id: string) => void;
  deleteBannerPermanently: (id: string) => Promise<void>;
  reorderBanners: (startIndex: number, endIndex: number) => void;
  reorderDraftBanners: (startIndex: number, endIndex: number) => void;
  saveDraftBanners: () => Promise<void>;
  publishBanners: () => Promise<void>;
  resetDraftBanners: () => Promise<void>;
  seedDefaultBanner: () => Promise<void>;
  subscribe: () => () => void;
}

const getCachedBanners = (): Banner[] => {
  try {
    const cached = localStorage.getItem('supabase_cached_banners');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to parse cached banners from localStorage:", e);
  }
  return [];
};

const saveCachedBanners = (banners: Banner[]) => {
  try {
    localStorage.setItem('supabase_cached_banners', JSON.stringify(banners));
  } catch (e) {
    console.warn("Failed to save banners to localStorage cache:", e);
  }
};

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: getCachedBanners(),
  draftBanners: [],
  isLoaded: getCachedBanners().length > 0,
  hasUnsavedChanges: false,
  sliderConfig: {
    autoSlide: true,
    duration: 5,
  },

  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) {
        set({ isLoaded: true });
        return () => {};
    }

    supabase.from('banners').select('*').order('order', { ascending: true }).then(({ data, error }) => {
        if (!error && data) {
          const mapped = (data as any[]).map(row => objectToCamel(row)) as Banner[];
          set({ banners: mapped, isLoaded: true });
          saveCachedBanners(mapped);
        } else {
          set({ isLoaded: true });
        }
    });

    supabase.from('banners_draft').select('*').order('order', { ascending: true }).then(({ data, error }) => {
        if (!error && data) set({ draftBanners: (data as any[]).map(row => objectToCamel(row)) as Banner[] });
    });
    
    // Fake slider config for now since we don't have key-value tables 
    // unless we create a generic settings table. 

    const channelLive = supabase
      .channel('public:banners:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, (payload) => {
          supabase.from('banners').select('*').order('order', { ascending: true }).then(({ data, error }) => {
            if (!error && data) {
              const mapped = (data as any[]).map(row => objectToCamel(row)) as Banner[];
              set({ banners: mapped, isLoaded: true });
              saveCachedBanners(mapped);
            }
          });
      })
      .subscribe();

    const channelDraft = supabase
      .channel('public:banners_draft:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners_draft' }, (payload) => {
          supabase.from('banners_draft').select('*').order('order', { ascending: true }).then(({ data, error }) => {
            if (!error && data) set({ draftBanners: (data as any[]).map(row => objectToCamel(row)) as Banner[] });
          });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelLive);
      supabase.removeChannel(channelDraft);
    };
  },

  setBanners: (banners) => {
    set({ banners, isLoaded: true });
    saveCachedBanners(banners);
  },
  setDraftBanners: (draftBanners) => set({ draftBanners }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  
  updateSliderConfig: (autoSlide, duration) => {
    set({ sliderConfig: { autoSlide, duration } });
  },

  updateSliderConfigLocal: (autoSlide, duration) => set({ sliderConfig: { autoSlide, duration } }),

  updateBanner: (id, updates) => {
    const nextBanners = get().banners.map((b) => b.id === id ? { ...b, ...updates } : b);
    set({ banners: nextBanners });
    saveCachedBanners(nextBanners);
    const supabase = getSupabase();
    if (supabase) {
      const dbPayload = objectToSnake(updates);
      supabase.from('banners').update(dbPayload).eq('id', id).then(({error}) => error && console.warn(error));
    }
  },

  updateDraftBanner: (id, updates) => set((state) => ({
    draftBanners: state.draftBanners.map((b) => b.id === id ? { ...b, ...updates } : b),
    hasUnsavedChanges: true
  })),

  addBanner: (type = 'uploaded') => {
    const id = `ban_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newBanner: Banner = {
      id,
      image: '',
      name: type === 'designed' ? 'New Summer Banner' : '',
      description: type === 'designed' ? 'Up to 50% Off on Premium Categories' : '',
      buttonEnabled: type === 'designed',
      buttonText: 'Shop Now',
      buttonLink: '',
      destinationType: 'custom',
      locations: ['homepage-hero'],
      bannerSize: 'hero',
      isCustomButtonText: type === 'designed',
      status: 'draft',
      order: get().banners.length,
      bannerType: type,
      backgroundColor: type === 'designed' ? '#1e1b4b' : '', // Royal Indigo
      textColor: type === 'designed' ? '#ffffff' : '',
      buttonColor: type === 'designed' ? '#fbbf24' : '', // Amber 400
      buttonTextColor: type === 'designed' ? '#111111' : '',
      borderColor: type === 'designed' ? '#312e81' : '',
      fontFamily: 'sans',
      fontSize: '3xl',
      fontWeight: 'bold',
      alignment: 'center',
      offerText: type === 'designed' ? 'MEGA SEASON DISCOUNTS' : '',
      discountText: type === 'designed' ? '60% FLAT OFF' : '',
      stickerType: 'none',
      countdownEnabled: false,
    };
    const nextBanners = [...get().banners, newBanner];
    set({ banners: nextBanners });
    saveCachedBanners(nextBanners);
    const supabase = getSupabase();
    if (supabase) {
      const dbPayload = objectToSnake(newBanner);
      supabase.from('banners').insert([dbPayload]).then(({error}) => error && console.warn(error));
    }
  },

  addDraftBanner: (type = 'uploaded') => {
    const id = `ban_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newBanner: Banner = {
      id,
      image: '',
      name: type === 'designed' ? 'New Summer Banner' : '',
      description: type === 'designed' ? 'Up to 50% Off on Premium Categories' : '',
      buttonEnabled: type === 'designed',
      buttonText: 'Shop Now',
      buttonLink: '',
      destinationType: 'custom',
      locations: ['homepage-hero'],
      bannerSize: 'hero',
      isCustomButtonText: type === 'designed',
      status: 'draft',
      order: get().draftBanners.length,
      bannerType: type,
      backgroundColor: type === 'designed' ? '#1e1b4b' : '', // Royal Indigo
      textColor: type === 'designed' ? '#ffffff' : '',
      buttonColor: type === 'designed' ? '#fbbf24' : '', // Amber 400
      buttonTextColor: type === 'designed' ? '#111111' : '',
      borderColor: type === 'designed' ? '#312e81' : '',
      fontFamily: 'sans',
      fontSize: '3xl',
      fontWeight: 'bold',
      alignment: 'center',
      offerText: type === 'designed' ? 'MEGA SEASON DISCOUNTS' : '',
      discountText: type === 'designed' ? '60% FLAT OFF' : '',
      stickerType: 'none',
      countdownEnabled: false,
      createdDate: new Date().toISOString(),
    };
    set((state) => ({
      draftBanners: [...state.draftBanners, newBanner],
      hasUnsavedChanges: true
    }));
  },

  duplicateDraftBanner: (banner: Banner) => {
    const id = `ban_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const duplicated: Banner = {
      ...banner,
      id,
      name: banner.name ? `${banner.name} (Copy)` : 'Copy of Banner',
      order: get().draftBanners.length,
      status: 'draft',
      createdDate: new Date().toISOString(),
    };
    set((state) => ({
      draftBanners: [...state.draftBanners, duplicated],
      hasUnsavedChanges: true
    }));
  },

  removeBanner: (id) => {
    const nextBanners = get().banners.filter((b) => b.id !== id);
    set({ banners: nextBanners });
    saveCachedBanners(nextBanners);
    const supabase = getSupabase();
    if (supabase) supabase.from('banners').delete().eq('id', id).then(({error}) => error && console.warn(error));
  },

  removeDraftBanner: (id) => {
    set((state) => ({
      draftBanners: state.draftBanners.filter((b) => b.id !== id)
    }));
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('banners_draft').delete().eq('id', id).then(({error}) => error && console.warn(error));
        supabase.from('banners').delete().eq('id', id).then(({error}) => error && console.warn(error));
    }
  },

  deleteBannerPermanently: async (id) => {
    const supabase = getSupabase();
    if (!supabase) {
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== id),
        draftBanners: state.draftBanners.filter((b) => b.id !== id)
      }));
      return;
    }

    const previousBanners = get().banners;
    const previousDraftBanners = get().draftBanners;

    // Optimistic Update
    const nextBanners = get().banners.filter((b) => b.id !== id);
    set({
      banners: nextBanners,
      draftBanners: get().draftBanners.filter((b) => b.id !== id)
    });
    saveCachedBanners(nextBanners);

    try {
      // Delete from banners table
      const { error: liveErr } = await supabase.from('banners').delete().eq('id', id);
      if (liveErr) {
        throw new Error(liveErr.message || "Failed to delete from banners table");
      }

      // Delete from banners_draft table
      const { error: draftErr } = await supabase.from('banners_draft').delete().eq('id', id);
      if (draftErr) {
        throw new Error(draftErr.message || "Failed to delete from banners_draft table");
      }
    } catch (err) {
      // Rollback on error
      set({
        banners: previousBanners,
        draftBanners: previousDraftBanners
      });
      throw err;
    }
  },

  reorderBanners: (startIndex, endIndex) => {
    const result = Array.from(get().banners);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const reordered = result.map((b, idx) => ({ ...b, order: idx }));
    set({ banners: reordered });
    saveCachedBanners(reordered);

    const supabase = getSupabase();
    if (supabase) {
        const dbPayloads = reordered.map(b => objectToSnake(b));
        supabase.from('banners').upsert(dbPayloads).then(({error}) => error && console.warn(error));
    }
  },

  reorderDraftBanners: (startIndex, endIndex) => {
    const result = Array.from(get().draftBanners);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const reordered = result.map((b, idx) => ({ ...b, order: idx }));
    set({ draftBanners: reordered, hasUnsavedChanges: true });
  },

  saveDraftBanners: async () => {
    try {
      const draftBanners = [...get().draftBanners].sort((a, b) => (Number(a.order) ?? 0) - (Number(b.order) ?? 0));
      const supabase = getSupabase();
      
      if (supabase) {
          // Sync Draft Collection in Supabase
          // First delete all existing rows
          await supabase.from('banners_draft').delete().neq('id', '0'); // Delete all filter
          
          const cleanDrafts = draftBanners.map((b, idx) => ({...b, order: b.order !== undefined && b.order !== null ? Number(b.order) : idx}));
          const dbDrafts = cleanDrafts.map(d => objectToSnake(d));
          await supabase.from('banners_draft').upsert(dbDrafts);
          
          await supabase.from('banners').delete().neq('id', '0');
          await supabase.from('banners').upsert(dbDrafts);
      }
      
      set({ 
        banners: draftBanners,
        draftBanners, 
        hasUnsavedChanges: false 
      });
      saveCachedBanners(draftBanners);
      console.log("Both Draft and Live Banners collections persisted successfully.");
    } catch (error) {
      console.error("Error saving banners:", error);
      throw error;
    }
  },

  publishBanners: async () => {
    try {
      const draftBanners = [...get().draftBanners].sort((a, b) => (Number(a.order) ?? 0) - (Number(b.order) ?? 0));
      
      const updatedDraftBanners = draftBanners.map(b => 
        b.status === 'draft' ? { ...b, status: 'active' as const } : b
      );

      const supabase = getSupabase();
      if (supabase) {
          await supabase.from('banners_draft').delete().neq('id', '0');
          const cleanDrafts = updatedDraftBanners.map((b, idx) => ({...b, order: b.order !== undefined && b.order !== null ? Number(b.order) : idx}));
          const dbPayloads = cleanDrafts.map(d => objectToSnake(d));
          await supabase.from('banners_draft').upsert(dbPayloads);
          
          await supabase.from('banners').delete().neq('id', '0');
          await supabase.from('banners').upsert(dbPayloads);
      }

      console.log("Banners published successfully.");
      set({ banners: updatedDraftBanners, draftBanners: updatedDraftBanners, hasUnsavedChanges: false });
      saveCachedBanners(updatedDraftBanners);
    } catch (error) {
      console.error("Error publishing banners:", error);
      throw error;
    }
  },

  resetDraftBanners: async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
      const { data: draftData } = await supabase.from('banners_draft').select('*');
      const draftList = (draftData || []) as Banner[];

      if (draftList.length > 0) {
        const camelList = draftList.map(row => objectToCamel(row)) as Banner[];
        camelList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        set({ draftBanners: camelList, hasUnsavedChanges: false });
      } else {
        const { data: liveData } = await supabase.from('banners').select('*');
        const liveList = (liveData || []) as any[];
        if (liveList.length > 0) {
          const camelLive = liveList.map(row => objectToCamel(row)) as Banner[];
          camelLive.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          set({ draftBanners: camelLive, hasUnsavedChanges: false });
        } else {
          set({ draftBanners: [], hasUnsavedChanges: false });
        }
      }
    } catch (error) {
      console.error("Error resetting draft banners:", error);
      throw error;
    }
  },

  seedDefaultBanner: async () => {
      const supabase = getSupabase();
      if (!supabase) return;
      
    try {
      const { data: liveSnapshot } = await supabase.from('banners').select('*').limit(1);
      const { data: draftSnapshot } = await supabase.from('banners_draft').select('*').limit(1);
      
      if ((!liveSnapshot || liveSnapshot.length === 0) && (!draftSnapshot || draftSnapshot.length === 0)) {
        const defaultBanner: Banner = {
          id: 'initial_promo',
          image: '',
          name: 'Launch Promotional Offer',
          description: 'Tazu Mart BD advanced premium banner management loaded.',
          buttonEnabled: true,
          buttonText: 'Shop Now',
          isCustomButtonText: false,
          status: 'active',
          order: 0,
          bannerType: 'designed',
          backgroundColor: '#0f172a',
          backgroundGradient: '#1e3a8a',
          isGradient: true,
          textColor: '#ffffff',
          buttonColor: '#ff007f',
          fontFamily: 'sans',
          alignment: 'center',
          createdDate: new Date().toISOString()
        };
        
        const dbPayload = objectToSnake(defaultBanner);
        await supabase.from('banners_draft').upsert([dbPayload]);
        await supabase.from('banners').upsert([dbPayload]);
        console.log("Successfully seeded default banner.");
      }
    } catch (err) {
      console.error("Failed to seed default banner:", err);
    }
  },
}));
