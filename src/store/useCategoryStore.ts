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
    
    // Optimistic Update
    const currentCats = get().categories;
    set({ categories: [...currentCats, newCategory] });
    
    if (supabase) {
      const { error } = await supabase.from('categories').insert([newCategory]);
      if (error) {
        // Rollback on error
        set({ categories: currentCats });
        console.error("Supabase insert error:", error);
        throw new Error(error.message || "Failed to add category to database");
      }
    }
  },
  
  updateCategory: async (id, payload) => {
    const supabase = getSupabase();
    const currentCats = get().categories;
    const existing = currentCats.find(c => c.id === id);
    const mergedPayload = existing ? { ...existing, ...payload } : payload;
    
    // Optimistic Update
    const updatedCats = currentCats.map(c => c.id === id ? { ...c, ...mergedPayload } : c);
    set({ categories: updatedCats as Category[] });
    
    if (supabase) {
      const { error } = await supabase.from('categories').update(mergedPayload).eq('id', id);
      if (error) {
        // Rollback on error
        set({ categories: currentCats });
        console.error("Supabase update error:", error);
        throw new Error(error.message || "Failed to update category in database");
      }
    }
  },
  
  deleteCategory: async (id) => {
    const currentCats = get().categories;
    const category = currentCats.find(c => c.id === id);
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
    
    // Optimistic Update
    const newCats = currentCats.filter(c => c.id !== id);
    set({ categories: newCats });
    
    if (supabase) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        // Rollback on error
        set({ categories: currentCats });
        console.error("Supabase delete error:", error);
        throw new Error(error.message || "Failed to delete category from database");
      }
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
      .channel('public:categories:' + Math.random().toString(36).substring(2, 9))
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

