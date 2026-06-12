import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, writeBatch, getDocs, onSnapshot } from 'firebase/firestore';

export function cleanObjectForFirestore<T extends object>(obj: T): T {
  const result: any = {};
  Object.keys(obj).forEach((key) => {
    const val = (obj as any)[key];
    if (val !== undefined) {
      result[key] = val;
    }
  });
  return result;
}

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
  reorderBanners: (startIndex: number, endIndex: number) => void;
  reorderDraftBanners: (startIndex: number, endIndex: number) => void;
  saveDraftBanners: () => Promise<void>;
  publishBanners: () => Promise<void>;
  resetDraftBanners: () => Promise<void>;
  seedDefaultBanner: () => Promise<void>;
  subscribe: () => () => void;
}

export const useBannerStore = create<BannerState>((set, get) => ({
  banners: [],
  draftBanners: [],
  isLoaded: false,
  hasUnsavedChanges: false,
  sliderConfig: {
    autoSlide: true,
    duration: 5,
  },

  subscribe: () => {
    const unsubLive = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const liveList: Banner[] = [];
      snapshot.forEach((docRef) => {
        liveList.push({ id: docRef.id, ...docRef.data() } as Banner);
      });
      liveList.sort((a, b) => (Number(a.order) ?? 0) - (Number(b.order) ?? 0));
      set({ banners: liveList, isLoaded: true });
    }, (err) => {
      console.error("Firestore live banners listen error:", err);
    });

    const unsubDraft = onSnapshot(collection(db, 'banners_draft'), (snapshot) => {
      const draftList: Banner[] = [];
      snapshot.forEach((docRef) => {
        draftList.push({ id: docRef.id, ...docRef.data() } as Banner);
      });
      draftList.sort((a, b) => (Number(a.order) ?? 0) - (Number(b.order) ?? 0));
      set({ draftBanners: draftList });
    }, (err) => {
      console.error("Firestore draft banners listen error:", err);
    });

    const unsubSlider = onSnapshot(doc(db, 'settings', 'slider_config'), (docSnap) => {
      if (docSnap.exists()) {
        const config = docSnap.data();
        set({
          sliderConfig: {
            autoSlide: config.autoSlide ?? true,
            duration: config.duration ?? 5
          }
        });
      }
    }, (err) => {
      console.error("Firestore slider config listen error:", err);
    });

    return () => {
      unsubLive();
      unsubDraft();
      unsubSlider();
    };
  },

  setBanners: (banners) => set({ banners, isLoaded: true }),
  setDraftBanners: (draftBanners) => set({ draftBanners }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  
  updateSliderConfig: (autoSlide, duration) => {
    set({ sliderConfig: { autoSlide, duration } });
    setDoc(doc(db, 'settings', 'slider_config'), { autoSlide, duration })
      .catch(err => console.error("Firestore updateSliderConfig failed:", err));
  },

  updateSliderConfigLocal: (autoSlide, duration) => set({ sliderConfig: { autoSlide, duration } }),

  updateBanner: (id, updates) => {
    set((state) => ({
      banners: state.banners.map((b) => b.id === id ? { ...b, ...updates } : b)
    }));
    // Live update directly to Firestore
    setDoc(doc(db, 'banners', id), cleanObjectForFirestore(updates), { merge: true })
      .catch(err => console.error("Firestore updateBanner failed:", err));
  },

  updateDraftBanner: (id, updates) => set((state) => ({
    draftBanners: state.draftBanners.map((b) => b.id === id ? { ...b, ...updates } : b),
    hasUnsavedChanges: true
  })),

  addBanner: (type = 'uploaded') => {
    const id = doc(collection(db, 'banners')).id;
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
    set((state) => ({
      banners: [...state.banners, newBanner]
    }));
    setDoc(doc(db, 'banners', id), cleanObjectForFirestore(newBanner))
      .catch(err => console.error("Firestore addBanner failed:", err));
  },

  addDraftBanner: (type = 'uploaded') => {
    const id = doc(collection(db, 'banners_draft')).id;
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
    const id = doc(collection(db, 'banners_draft')).id;
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
    set((state) => ({
      banners: state.banners.filter((b) => b.id !== id)
    }));
    deleteDoc(doc(db, 'banners', id))
      .catch(err => console.error("Firestore removeBanner failed:", err));
  },

  removeDraftBanner: (id) => {
    set((state) => ({
      draftBanners: state.draftBanners.filter((b) => b.id !== id)
    }));
    deleteDoc(doc(db, 'banners_draft', id))
      .catch(err => console.error("Firestore removeDraftBanner failed:", err));
    deleteDoc(doc(db, 'banners', id))
      .catch(err => console.error("Firestore auto remove live banner failed:", err));
  },

  reorderBanners: (startIndex, endIndex) => {
    const result = Array.from(get().banners);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    const reordered = result.map((b, idx) => ({ ...b, order: idx }));
    set({ banners: reordered });

    // Save batch orders to Firestore
    try {
      const batch = writeBatch(db);
      reordered.forEach((b) => {
        batch.set(doc(db, 'banners', b.id), { order: b.order }, { merge: true });
      });
      batch.commit().catch(err => console.error("Reorder batch failed:", err));
    } catch (e) {
      console.error(e);
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
      
      // 1. Sync Draft Collection in Firestore
      const querySnapshot = await getDocs(collection(db, 'banners_draft'));
      const batch = writeBatch(db);

      // Clean old draft documents
      querySnapshot.forEach((d) => {
        batch.delete(d.ref);
      });

      // Save updated draft documents preserving their order or fallback to index
      draftBanners.forEach((b, idx) => {
        const docRef = doc(db, 'banners_draft', b.id);
        const orderVal = b.order !== undefined && b.order !== null ? Number(b.order) : idx;
        batch.set(docRef, cleanObjectForFirestore({ ...b, order: orderVal }));
      });

      await batch.commit();

      // 2. ALSO Sync Live Collection directly so Homepage and Slider are updated immediately in real time
      const liveSnapshot = await getDocs(collection(db, 'banners'));
      const liveBatch = writeBatch(db);

      // Clean old live documents
      liveSnapshot.forEach((d) => {
        liveBatch.delete(d.ref);
      });

      // Save updated banners to live collection preserving status and locations
      draftBanners.forEach((b, idx) => {
        const docRef = doc(db, 'banners', b.id);
        const orderVal = b.order !== undefined && b.order !== null ? Number(b.order) : idx;
        liveBatch.set(docRef, cleanObjectForFirestore({ ...b, order: orderVal }));
      });

      await liveBatch.commit();

      // Update store state for instant visual refresh across all components without hard reloading
      set({ 
        banners: draftBanners,
        draftBanners, 
        hasUnsavedChanges: false 
      });
      console.log("Both Draft and Live Banners collections persisted to Firestore successfully.");
    } catch (error) {
      console.error("Error saving banners to Firestore collections:", error);
      throw error;
    }
  },

  publishBanners: async () => {
    try {
      const draftBanners = [...get().draftBanners].sort((a, b) => (Number(a.order) ?? 0) - (Number(b.order) ?? 0));
      
      // Auto-update 'draft' statuses to 'active' on publish
      const updatedDraftBanners = draftBanners.map(b => 
        b.status === 'draft' ? { ...b, status: 'active' as const } : b
      );

      // Save the updated list both with active statuses to draft collection in firestore
      const draftSnapshot = await getDocs(collection(db, 'banners_draft'));
      const draftBatch = writeBatch(db);
      draftSnapshot.forEach((d) => {
        draftBatch.delete(d.ref);
      });
      updatedDraftBanners.forEach((b, idx) => {
        const docRef = doc(db, 'banners_draft', b.id);
        const orderVal = b.order !== undefined && b.order !== null ? Number(b.order) : idx;
        draftBatch.set(docRef, cleanObjectForFirestore({ ...b, order: orderVal }));
      });
      await draftBatch.commit();

      // Copy that updated draft content to the live collection
      const liveSnapshot = await getDocs(collection(db, 'banners'));
      const liveBatch = writeBatch(db);
      liveSnapshot.forEach((d) => {
        liveBatch.delete(d.ref);
      });
      updatedDraftBanners.forEach((b, idx) => {
        const docRef = doc(db, 'banners', b.id);
        const orderVal = b.order !== undefined && b.order !== null ? Number(b.order) : idx;
        liveBatch.set(docRef, cleanObjectForFirestore({ ...b, order: orderVal }));
      });
      await liveBatch.commit();

      console.log("Banners published successfully to Firestore.");
      set({ banners: updatedDraftBanners, draftBanners: updatedDraftBanners, hasUnsavedChanges: false });
    } catch (error) {
      console.error("Error publishing banners to Firestore:", error);
      throw error;
    }
  },

  resetDraftBanners: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'banners_draft'));
      const draftList: Banner[] = [];
      querySnapshot.forEach((doc) => {
        draftList.push({ id: doc.id, ...doc.data() } as Banner);
      });

      if (draftList.length > 0) {
        draftList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        set({ draftBanners: draftList, hasUnsavedChanges: false });
      } else {
        // Fallback to live banners from database
        const liveSnapshot = await getDocs(collection(db, 'banners'));
        const liveList: Banner[] = [];
        liveSnapshot.forEach((doc) => {
          liveList.push({ id: doc.id, ...doc.data() } as Banner);
        });
        if (liveList.length > 0) {
          liveList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          set({ draftBanners: liveList, hasUnsavedChanges: false });
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
    try {
      const liveSnapshot = await getDocs(collection(db, 'banners'));
      const draftSnapshot = await getDocs(collection(db, 'banners_draft'));
      
      if (liveSnapshot.empty && draftSnapshot.empty) {
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
        
        await setDoc(doc(db, 'banners_draft', 'initial_promo'), defaultBanner);
        await setDoc(doc(db, 'banners', 'initial_promo'), defaultBanner);
        console.log("Successfully seeded default banner to Firestore.");
      }
    } catch (err) {
      console.error("Failed to seed default banner:", err);
    }
  },
}));
