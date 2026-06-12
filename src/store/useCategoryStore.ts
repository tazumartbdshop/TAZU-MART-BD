import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { deleteImage } from '../lib/imageUtils';
import { useDebugStore } from './useDebugStore';

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
    const id = doc(collection(db, 'categories')).id;
    console.log(`[Firestore Log] Preparing to save new category. Generated document ID: categories/${id}`);
    useDebugStore.getState().setLastWrite(`categories/${id}`, 'Pending');
    try {
      const newCategory: Category = {
        ...payload,
        id,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'categories', id), newCategory);
      console.log(`[Firestore Log] Firestore write successful for categories/${id}. Details:`, newCategory);
      useDebugStore.getState().setLastWrite(`categories/${id}`, 'Success');
    } catch (error: any) {
      console.error(`[Firestore Log] Firestore write failed for categories/${id}:`, error);
      useDebugStore.getState().setLastWrite(`categories/${id}`, 'Failed');
      handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
      throw error;
    }
  },
  
  updateCategory: async (id, payload) => {
    console.log(`[Firestore Log] Preparing to update category document: categories/${id}`);
    useDebugStore.getState().setLastWrite(`categories/${id}`, 'Pending');
    try {
      await setDoc(doc(db, 'categories', id), payload, { merge: true });
      console.log(`[Firestore Log] Firestore update successful for categories/${id}. Fields:`, payload);
      useDebugStore.getState().setLastWrite(`categories/${id}`, 'Success');
    } catch (error: any) {
      console.error(`[Firestore Log] Firestore update failed for categories/${id}:`, error);
      useDebugStore.getState().setLastWrite(`categories/${id}`, 'Failed');
      handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
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
    console.log(`[Firestore Log] Preparing to delete category document: categories/${id}`);
    useDebugStore.getState().setLastWrite(`categories/${id}`, 'Pending');
    try {
      await deleteDoc(doc(db, 'categories', id));
      console.log(`[Firestore Log] Firestore delete successful for categories/${id}`);
      useDebugStore.getState().setLastWrite(`categories/${id} (deleted)`, 'Success');
    } catch (error: any) {
      console.error(`[Firestore Log] Firestore delete failed for categories/${id}:`, error);
      useDebugStore.getState().setLastWrite(`categories/${id} (delete-failed)`, 'Failed');
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
      throw error;
    }
  },
  
  clearDemoData: () => set(() => ({ categories: [] })),
  
  subscribe: () => {
    console.log("[Firestore Log] Initializing real-time subscription for collection 'categories'");
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categories: Category[] = [];
      snapshot.forEach(docSnap => {
        categories.push({ id: docSnap.id, ...docSnap.data() } as Category);
      });
      categories.sort((a, b) => (Number(a.displayOrder) ?? 0) - (Number(b.displayOrder) ?? 0));
      console.log(`[Firestore Log] Real-time read updated. Collection count: ${categories.length} categories found inside 'categories' on server.`);
      set({ categories, isLoaded: true });
    }, (error) => {
      console.error("[Firestore Log] Real-time subscription failed on collection 'categories':", error);
      handleFirestoreError(error, OperationType.GET, 'categories');
    });
    return unsubscribe;
  }
}));

