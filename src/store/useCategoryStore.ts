import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, deleteField } from 'firebase/firestore';
import { deleteImage } from '../lib/imageUtils';

export interface Category {
  id: string;
  name: string;
  bannerName: string;
  slug: string;
  bannerImage: string;
  bannerImages?: string[];
  iconImage?: string;
  wideBannerImage?: string;
  buttonText?: string;
  buttonLink?: string;
  featuredProducts?: string;
  description?: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  showOnHomepage: boolean;
  createdAt: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  isDemo?: boolean;
  sliderSettings?: any;
}

interface CategoryState {
  categories: Category[];
  isLoaded: boolean;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearDemoData: () => void;
  subscribe: () => () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoaded: false,
  
  addCategory: async (payload) => {
    try {
      const id = doc(collection(db, 'categories')).id;
      const newCategory: Category = {
        ...payload,
        id,
        createdAt: new Date().toISOString(),
      };
      
      const docRef = doc(db, 'categories', 'WQxF5FxiMKWRLemwIVwE');
      await setDoc(docRef, {
        categoryList: {
          [id]: newCategory
        }
      }, { merge: true });
    } catch (error) {
      console.error("Firebase setDoc error in addCategory:", error);
      handleFirestoreError(error, OperationType.WRITE, 'categories/WQxF5FxiMKWRLemwIVwE');
      throw error;
    }
  },
  
  updateCategory: async (id, payload) => {
    try {
      const existing = get().categories.find(c => c.id === id);
      const mergedPayload = existing ? { ...existing, ...payload } : payload;
      const docRef = doc(db, 'categories', 'WQxF5FxiMKWRLemwIVwE');
      await setDoc(docRef, {
        categoryList: {
          [id]: mergedPayload
        }
      }, { merge: true });
    } catch (error) {
      console.error("Firebase setDoc error in updateCategory:", error);
      handleFirestoreError(error, OperationType.WRITE, 'categories/WQxF5FxiMKWRLemwIVwE');
      throw error;
    }
  },
  
  deleteCategory: async (id) => {
    const category = get().categories.find(c => c.id === id);
    if (category) {
      try {
        const urlsToDelete = new Set<string>();
        if (category.iconImage) urlsToDelete.add(category.iconImage);
        if (category.bannerImage) urlsToDelete.add(category.bannerImage);
        if (category.wideBannerImage) urlsToDelete.add(category.wideBannerImage);
        if (category.bannerImages && Array.isArray(category.bannerImages)) {
          category.bannerImages.forEach(img => {
            if (img) urlsToDelete.add(img);
          });
        }
        
        // Execute background deletions securely
        Promise.all(Array.from(urlsToDelete).map(url => deleteImage(url)))
          .catch(err => console.warn("Failed to delete some category storage files:", err));
      } catch (importErr) {
        console.error("Failed to import imageUtils during deleteCategory:", importErr);
      }
    }
    try {
      const docRef = doc(db, 'categories', 'WQxF5FxiMKWRLemwIVwE');
      await setDoc(docRef, {
        categoryList: {
          [id]: deleteField()
        }
      }, { merge: true });
    } catch (error) {
      console.error("Firebase setDoc error in deleteCategory:", error);
      handleFirestoreError(error, OperationType.WRITE, 'categories/WQxF5FxiMKWRLemwIVwE');
      throw error;
    }
  },
  
  clearDemoData: () => set(() => ({ categories: [] })),
  
  subscribe: () => {
    const docRef = doc(db, 'categories', 'WQxF5FxiMKWRLemwIVwE');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const categoryList = data.categoryList || {};
        let categories: Category[] = [];
        if (typeof categoryList === 'object' && !Array.isArray(categoryList)) {
          categories = Object.entries(categoryList).map(([id, catData]: [string, any]) => ({
            id,
            ...catData
          }));
        } else if (Array.isArray(categoryList)) {
          categories = categoryList;
        }
        categories.sort((a, b) => (Number(a.displayOrder) ?? 0) - (Number(b.displayOrder) ?? 0));
        set({ categories, isLoaded: true });
      } else {
        set({ categories: [], isLoaded: true });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories/WQxF5FxiMKWRLemwIVwE');
    });
    return unsubscribe;
  }
}));

