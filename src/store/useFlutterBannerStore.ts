import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface FlutterBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  redirectLink: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface FlutterBannerStore {
  flutterBanners: FlutterBanner[];
  loading: boolean;
  isLoaded: boolean;
  fetchFlutterBanners: () => Promise<void>;
  subscribeFlutterBanners: () => () => void;
  addFlutterBanner: (banner: Omit<FlutterBanner, 'id' | 'createdAt'>) => Promise<void>;
  updateFlutterBanner: (id: string, updates: Partial<FlutterBanner>) => Promise<void>;
  deleteFlutterBanner: (id: string) => Promise<void>;
}

export const useFlutterBannerStore = create<FlutterBannerStore>((set, get) => ({
  flutterBanners: [],
  loading: false,
  isLoaded: false,

  fetchFlutterBanners: async () => {
    set({ loading: true });
    try {
      const q = query(collection(db, 'flutterBanners'), orderBy('displayOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      const list: FlutterBanner[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as FlutterBanner);
      });
      set({ flutterBanners: list, isLoaded: true, loading: false });
    } catch (error) {
      console.error("Error fetching flutter banners:", error);
      set({ loading: false });
    }
  },

  subscribeFlutterBanners: () => {
    const q = query(collection(db, 'flutterBanners'), orderBy('displayOrder', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: FlutterBanner[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as FlutterBanner);
      });
      set({ flutterBanners: list, isLoaded: true });
    }, (error) => {
      console.error("Firestore onSnapshot error for flutterBanners:", error);
    });
    return unsubscribe;
  },

  addFlutterBanner: async (banner) => {
    try {
      const newId = doc(collection(db, 'flutterBanners')).id;
      const docRef = doc(db, 'flutterBanners', newId);
      const payload: FlutterBanner = {
        ...banner,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, payload);
    } catch (error) {
      console.error("Error adding flutter banner:", error);
      throw error;
    }
  },

  updateFlutterBanner: async (id, updates) => {
    try {
      const docRef = doc(db, 'flutterBanners', id);
      await setDoc(docRef, updates, { merge: true });
    } catch (error) {
      console.error("Error updating flutter banner:", error);
      throw error;
    }
  },

  deleteFlutterBanner: async (id) => {
    try {
      const docRef = doc(db, 'flutterBanners', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting flutter banner:", error);
      throw error;
    }
  },
}));
