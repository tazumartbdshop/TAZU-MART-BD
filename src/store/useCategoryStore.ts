import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  bannerName: string;
  slug: string;
  bannerImage: string;
  bannerImages?: string[];
  iconImage?: string;
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
      await setDoc(doc(db, 'categories', id), newCategory);
    } catch (error) {
      console.error("Firebase setDoc error in addCategory:", error);
      throw error;
    }
  },
  
  updateCategory: async (id, payload) => {
    await setDoc(doc(db, 'categories', id), payload, { merge: true });
  },
  
  deleteCategory: async (id) => {
    const category = get().categories.find(c => c.id === id);
    if (category) {
      try {
        const { deleteImage } = await import('../lib/imageUtils');
        const urlsToDelete = new Set<string>();
        if (category.iconImage) urlsToDelete.add(category.iconImage);
        if (category.bannerImage) urlsToDelete.add(category.bannerImage);
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
    await deleteDoc(doc(db, 'categories', id));
  },
  
  clearDemoData: () => set(() => ({ categories: [] })),
  
  subscribe: () => {
    const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      set({ categories, isLoaded: true });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
    });
    return unsubscribe;
  }
}));

