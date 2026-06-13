import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
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
    const supabase = getSupabase();
    const id = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCategory: Category = {
      ...payload,
      id,
      createdAt: new Date().toISOString(),
    };
    
    if (supabase) {
      const { error } = await supabase.from('categories').insert([newCategory]);
      if (error && error.code !== '42P01') console.error("Supabase insert error", error);
    } else {
        const currentCats = get().categories;
        set({ categories: [...currentCats, newCategory] });
    }
  },
  
  updateCategory: async (id, payload) => {
    const supabase = getSupabase();
    const existing = get().categories.find(c => c.id === id);
    const mergedPayload = existing ? { ...existing, ...payload } : payload;
    
    if (supabase) {
      const { error } = await supabase.from('categories').update(mergedPayload).eq('id', id);
      if (error && error.code !== '42P01') console.error("Supabase update error", error);
    } else {
        const newCats = get().categories.map(c => c.id === id ? { ...c, ...mergedPayload } : c);
        set({ categories: newCats as Category[] });
    }
  },
  
  deleteCategory: async (id) => {
    const category = get().categories.find(c => c.id === id);
    const supabase = getSupabase();
    
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
    
    if (supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error && error.code !== '42P01') console.error("Supabase delete error", error);
    } else {
        const newCats = get().categories.filter(c => c.id !== id);
        set({ categories: newCats });
    }
  },
  
  clearDemoData: () => set(() => ({ categories: [] })),
  
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) {
        set({ isLoaded: true });
        return () => {}; // fallback
    }

    supabase.from('categories').select('*')
      .order('displayOrder', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) {
            set({ categories: data as Category[], isLoaded: true });
        } else {
            if (error && error.code !== '42P01') console.error("Fetch categories error:", error);
            set({ isLoaded: true });
        }
    });
    
    const channel = supabase
      .channel('public:categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        supabase.from('categories').select('*').order('displayOrder', { ascending: true })
            .then(({ data, error }) => {
                if (!error && data) {
                    set({ categories: data as Category[], isLoaded: true });
                }
            });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));

