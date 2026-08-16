import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';
import { broadcastSync } from '../lib/broadcastSync';

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
  bannerType?: 'main_banner' | 'login_banner' | 'uploaded' | 'designed' | string;
  bannerCategory?: 'main_banner' | 'login_banner' | 'main' | 'login' | 'custom' | string;
  mediaType?: 'banner' | 'character';
  characterRole?: 'male' | 'female' | 'guest';
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
  fetchAllBanners: () => Promise<void>;
  reorderBanners: (startIndex: number, endIndex: number, filterType?: 'all' | 'main' | 'login') => void;
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

  fetchAllBanners: async () => {
    const supabase = getSupabase();
    try {
      let fetchedMain: Banner[] = [];
      let fetchedLogin: Banner[] = [];

      // 1. Fetch Main Banners from API (which loads from Supabase settings & local backup)
      try {
        const mainRes = await fetch('/api/banners', { cache: 'no-store' });
        if (mainRes.ok) {
          const json = await mainRes.json();
          if (json.success && Array.isArray(json.banners)) {
            fetchedMain = json.banners.map((row: any) => {
              const item = objectToCamel(row) as Banner;
              item.bannerType = 'main_banner';
              item.bannerCategory = 'main_banner';
              return item;
            });
          }
        }
      } catch (mErr) {
        console.warn("API fetch /api/banners notice:", mErr);
      }

      // 2. Fetch Login Banners from API
      try {
        const loginRes = await fetch('/api/login-banner', { cache: 'no-store' });
        if (loginRes.ok) {
          const json = await loginRes.json();
          if (json.success && Array.isArray(json.banners) && json.banners.length > 0) {
            fetchedLogin = json.banners.map((row: any) => ({
              id: String(row.id || `login_${Date.now()}`),
              name: row.title || 'Login Banner',
              image: row.image_url || row.image || '',
              buttonEnabled: false,
              buttonText: '',
              buttonLink: '',
              isCustomButtonText: false,
              status: row.is_active !== false ? 'active' : 'hidden',
              order: Number(row.sort_order ?? 0),
              bannerType: 'login_banner',
              bannerCategory: 'login_banner',
              locations: ['auth-page'],
              bannerSize: 'hero',
              createdDate: row.created_at || new Date().toISOString()
            }));
          } else if (json.success && json.url) {
            fetchedLogin = [{
              id: 'active_login_banner',
              name: 'Login Banner',
              image: json.url,
              buttonEnabled: false,
              buttonText: '',
              buttonLink: '',
              isCustomButtonText: false,
              status: 'active',
              order: 0,
              bannerType: 'login_banner',
              bannerCategory: 'login_banner',
              locations: ['auth-page'],
              bannerSize: 'hero',
              createdDate: new Date().toISOString()
            }];
          }
        }
      } catch (lErr) {
        console.warn("API fetch /api/login-banner notice:", lErr);
      }

      // 3. Fallback ONLY if API queries returned no results
      if (supabase) {
        try {
          if (fetchedMain.length === 0) {
            const { data: sData } = await supabase.from('settings').select('value').eq('id', 'main_hero_banners').maybeSingle();
            if (sData?.value) {
              const parsed = typeof sData.value === 'string' ? JSON.parse(sData.value) : sData.value;
              if (Array.isArray(parsed) && parsed.length > 0) {
                fetchedMain = parsed.map((row: any) => {
                  const item = objectToCamel(row) as Banner;
                  item.bannerType = 'main_banner';
                  item.bannerCategory = 'main_banner';
                  return item;
                });
              }
            }
          }

          if (fetchedLogin.length === 0) {
            const { data: loginData } = await supabase
              .from('login_banners')
              .select('*')
              .order('sort_order', { ascending: true });

            if (loginData && loginData.length > 0) {
              fetchedLogin = loginData.map((row: any) => ({
                id: String(row.id || `login_${Date.now()}`),
                name: row.title || 'Login Banner',
                image: row.image_url || row.image || '',
                buttonEnabled: false,
                buttonText: '',
                buttonLink: '',
                isCustomButtonText: false,
                status: row.is_active !== false ? 'active' : 'hidden',
                order: Number(row.sort_order ?? 0),
                bannerType: 'login_banner',
                bannerCategory: 'login_banner',
                locations: ['auth-page'],
                bannerSize: 'hero',
                createdDate: row.created_at || new Date().toISOString()
              }));
            }
          }
        } catch (sbErr) {
          console.warn("Supabase query fallback notice:", sbErr);
        }
      }

      // Filter valid banners (keeping all active banners from database)
      const cleanMain = fetchedMain.filter(b => b && (b.status as string) !== 'deleted' && (b as any).is_active !== false && b.image && b.image.trim() !== '');
      const cleanLogin = fetchedLogin.filter(b => b && (b.status as string) !== 'deleted' && (b as any).is_active !== false && (b.image && b.image.trim() !== ''));

      const combined = [...cleanMain, ...cleanLogin];

      set({ banners: combined, isLoaded: true });
      saveCachedBanners(combined);
    } catch (err) {
      console.warn("Banner fetch fallback:", err);
      set({ isLoaded: true });
    }
  },

  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) {
      set({ isLoaded: true });
      return () => {};
    }

    get().fetchAllBanners();

    // Listen to local broadcast sync events
    const unsubBroadcast = broadcastSync.subscribe('banners', (newBanners: Banner[]) => {
      if (Array.isArray(newBanners) && newBanners.length > 0) {
        set({ banners: newBanners, isLoaded: true });
        saveCachedBanners(newBanners);
      }
    });

    const channelSettings = supabase
      .channel('public:settings:banners:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.main_hero_banners' }, () => {
        get().fetchAllBanners();
      })
      .subscribe();

    const channelLoginBanners = supabase
      .channel('public:login_banners:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'login_banners' }, () => {
        get().fetchAllBanners();
      })
      .subscribe();

    return () => {
      unsubBroadcast();
      supabase.removeChannel(channelSettings);
      supabase.removeChannel(channelLoginBanners);
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

  updateBanner: async (id, updates) => {
    const bannerToUpdate = get().banners.find(b => b.id === id);
    const isLogin = bannerToUpdate?.bannerCategory === 'login' || bannerToUpdate?.bannerCategory === 'login_banner';
    
    const nextBanners = get().banners.map((b) => b.id === id ? { ...b, ...updates } : b);
    set({ banners: nextBanners });
    saveCachedBanners(nextBanners);
    broadcastSync.publish('banners', nextBanners);

    try {
      const supabase = getSupabase();
      if (!isLogin) {
        const updatedBanner = nextBanners.find(b => b.id === id);
        if (updatedBanner) {
          await fetch('/api/banners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ banner: updatedBanner })
          });
        }
        if (supabase) {
          const mainBanners = nextBanners.filter(b => b.bannerCategory !== 'login' && b.bannerCategory !== 'login_banner');
          await supabase.from('settings').upsert({
            id: 'main_hero_banners',
            value: JSON.stringify(mainBanners)
          });
        }
      } else {
        if (supabase) {
          const loginUpdates: any = {};
          if (updates.name !== undefined) loginUpdates.title = updates.name;
          if (updates.image !== undefined) loginUpdates.image_url = updates.image;
          if (updates.status !== undefined) loginUpdates.is_active = updates.status === 'active';
          if (updates.order !== undefined) loginUpdates.sort_order = updates.order;
          if (Object.keys(loginUpdates).length > 0) {
            await supabase.from('login_banners').update(loginUpdates).eq('id', id);
          }
        }
      }
      await get().fetchAllBanners();
    } catch (err) {
      console.warn("updateBanner notice:", err);
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
      name: type === 'designed' ? 'New Summer Banner' : 'New Banner',
      description: type === 'designed' ? 'Up to 50% Off on Premium Categories' : '',
      buttonEnabled: type === 'designed',
      buttonText: 'Shop Now',
      buttonLink: '',
      destinationType: 'custom',
      locations: ['homepage-hero'],
      bannerSize: 'hero',
      isCustomButtonText: type === 'designed',
      status: 'active',
      order: get().banners.length,
      bannerType: 'main_banner',
      bannerCategory: 'main_banner',
      backgroundColor: type === 'designed' ? '#1e1b4b' : '',
      textColor: type === 'designed' ? '#ffffff' : '',
      buttonColor: type === 'designed' ? '#fbbf24' : '',
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
    const nextBanners = [...get().banners, newBanner];
    set({ banners: nextBanners });
    saveCachedBanners(nextBanners);
    broadcastSync.publish('banners', nextBanners);

    fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banner: newBanner })
    }).catch(console.warn);

    const supabase = getSupabase();
    if (supabase) {
      const mainBanners = nextBanners.filter(b => b.bannerCategory !== 'login' && b.bannerCategory !== 'login_banner');
      supabase.from('settings').upsert({
        id: 'main_hero_banners',
        value: JSON.stringify(mainBanners)
      }).then(({ error }) => { if (error) console.warn(error); });
    }
  },

  addDraftBanner: (type = 'uploaded') => {
    const id = `ban_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newBanner: Banner = {
      id,
      image: '',
      name: type === 'designed' ? 'New Summer Banner' : 'New Banner',
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
      bannerType: 'main_banner',
      bannerCategory: 'main_banner',
      backgroundColor: type === 'designed' ? '#1e1b4b' : '',
      textColor: type === 'designed' ? '#ffffff' : '',
      buttonColor: type === 'designed' ? '#fbbf24' : '',
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
    const allBanners = get().banners;
    const isLogin = allBanners.find(b => b.id === id)?.bannerCategory === 'login_banner' || allBanners.find(b => b.id === id)?.bannerCategory === 'login';

    const nextBanners = allBanners.filter((b) => b.id !== id);
    set({ banners: nextBanners });
    saveCachedBanners(nextBanners);
    broadcastSync.publish('banners', nextBanners);

    const supabase = getSupabase();

    if (isLogin) {
      fetch(`/api/login-banners/${id}`, { method: 'DELETE' }).catch(console.warn);
      if (supabase) {
        supabase.from('login_banners').delete().eq('id', id).then(({ error }) => { if (error) console.warn(error); });
      }
    } else {
      fetch(`/api/banners/${id}`, { method: 'DELETE' }).catch(console.warn);
      if (supabase) {
        const mainBanners = nextBanners.filter(b => b.bannerCategory !== 'login' && b.bannerCategory !== 'login_banner');
        supabase.from('settings').upsert({
          id: 'main_hero_banners',
          value: JSON.stringify(mainBanners)
        }).then(({ error }) => { if (error) console.warn(error); });
      }
    }
  },

  removeDraftBanner: (id) => {
    set((state) => ({
      draftBanners: state.draftBanners.filter((b) => b.id !== id)
    }));
  },

  deleteBannerPermanently: async (id: string) => {
    const previousBanners = get().banners;
    const targetBanner = previousBanners.find(b => b.id === id);
    const isLogin = targetBanner?.bannerCategory === 'login_banner' || targetBanner?.bannerCategory === 'login' || targetBanner?.bannerType === 'login_banner';

    try {
      const supabase = getSupabase();
      if (isLogin) {
        // 1. Call server DELETE endpoint for login banners
        const res = await fetch(`/api/login-banners/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to delete login banner (Status ${res.status})`);
        }

        // 2. Direct Supabase sync if client available
        if (supabase) {
          try {
            await supabase.from('login_banners').delete().eq('id', id);
          } catch (dbErr) {
            console.warn("Direct login banner deletion notice:", dbErr);
          }
        }
      } else {
        // 1. Call server DELETE endpoint for main banners
        const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to delete main banner (Status ${res.status})`);
        }

        // 2. Direct Supabase sync
        if (supabase) {
          try {
            await supabase.from('banners').delete().eq('id', id);
            await supabase.from('banners_draft').delete().eq('id', id);
          } catch (dbErr) {
            console.warn("Direct database banner deletion notice:", dbErr);
          }

          try {
            await supabase.from('banners').upsert({
              id,
              status: 'deleted',
              is_active: false,
              order: '-1',
              display_order: -1,
              locations: '[]'
            });
            await supabase.from('banners_draft').upsert({
              id,
              status: 'deleted',
              order: '-1'
            });
          } catch (uErr) {
            console.warn("Direct database banner status upsert notice:", uErr);
          }

          const remainingMainBanners = get().banners.filter(b => b.id !== id && b.bannerCategory !== 'login' && b.bannerCategory !== 'login_banner');
          try {
            await supabase.from('settings').upsert({
              id: 'main_hero_banners',
              value: JSON.stringify(remainingMainBanners)
            });
          } catch (sErr) {
            console.warn("Direct database settings sync notice:", sErr);
          }
        }
      }

      // 3. Immediately re-fetch latest data from database to stay 100% in sync
      await get().fetchAllBanners();
      const updatedBanners = get().banners;
      broadcastSync.publish('banners', updatedBanners);
    } catch (err: any) {
      console.error("deleteBannerPermanently error:", err);
      // Revert/refresh store to true server state on failure
      await get().fetchAllBanners();
      throw err;
    }
  },

  reorderBanners: (startIndex, endIndex, filterType = 'all') => {
    const allBanners = Array.from(get().banners);
    
    // Determine which subset of banners we are reordering
    const isLogin = (b: Banner) => b.bannerCategory === 'login_banner' || b.bannerCategory === 'login';
    
    let targetSubset: Banner[];
    let otherSubset: Banner[];
    
    if (filterType === 'login') {
      targetSubset = allBanners.filter(isLogin);
      otherSubset = allBanners.filter(b => !isLogin(b));
    } else if (filterType === 'main') {
      targetSubset = allBanners.filter(b => !isLogin(b));
      otherSubset = allBanners.filter(isLogin);
    } else {
      targetSubset = allBanners;
      otherSubset = [];
    }

    if (startIndex < 0 || startIndex >= targetSubset.length || endIndex < 0 || endIndex >= targetSubset.length) {
      return; // Safety check
    }

    const [removed] = targetSubset.splice(startIndex, 1);
    targetSubset.splice(endIndex, 0, removed);
    
    // Update order numbers
    const reorderedTarget = targetSubset.map((b, idx) => ({ ...b, order: idx }));
    
    // Combine back
    const combined = [...reorderedTarget, ...otherSubset];
    
    set({ banners: combined });
    saveCachedBanners(combined);
    broadcastSync.publish('banners', combined);

    const supabase = getSupabase();

    if (filterType === 'login' || filterType === 'all') {
      const loginOnly = combined.filter(isLogin);
      fetch('/api/login-banners/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: loginOnly })
      }).catch(console.warn);
      
      // We rely on the API to update the DB for login banners
    }

    if (filterType === 'main' || filterType === 'all') {
      const mainOnly = combined.filter(b => !isLogin(b));
      fetch('/api/banners/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: mainOnly })
      }).catch(console.warn);

      if (supabase) {
        supabase.from('settings').upsert({
          id: 'main_hero_banners',
          value: JSON.stringify(mainOnly)
        }).then(({ error }) => { if (error) console.warn(error); });
      }
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
      
      // Save via API
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: draftBanners })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('settings').upsert({
          id: 'main_hero_banners',
          value: JSON.stringify(draftBanners)
        });
      }
      
      await get().fetchAllBanners();
      set({ hasUnsavedChanges: false });
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

      // Save via API
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banners: updatedDraftBanners })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('settings').upsert({
          id: 'main_hero_banners',
          value: JSON.stringify(updatedDraftBanners)
        });
      }

      await get().fetchAllBanners();
      set({ hasUnsavedChanges: false });
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
    // No-op: Do not auto-generate test/demo banners
    return;
  },
}));
