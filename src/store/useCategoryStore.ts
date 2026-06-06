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
    const id = doc(collection(db, 'categories')).id;
    const newCategory: Category = {
      ...payload,
      id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'categories', id), newCategory);
  },
  
  updateCategory: async (id, payload) => {
    await setDoc(doc(db, 'categories', id), payload, { merge: true });
  },
  
  deleteCategory: async (id) => {
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

