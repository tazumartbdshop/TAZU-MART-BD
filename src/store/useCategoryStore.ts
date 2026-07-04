import { create } from 'zustand';

export interface Category {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_url?: string;
  iconImage?: string;
  bannerImage?: string;
  bannerName?: string;
  wideBannerImage?: string;
  buttonText?: string;
  buttonLink?: string;
  featuredProducts?: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  bannerImages?: string[];
  sliderSettings?: any;
  displayOrder?: number;
  status?: string;
  showOnHomepage?: boolean;
  isDemo?: boolean;
  created_at?: string;
  createdAt?: string; // mapping
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  isLoaded: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (category: any) => Promise<void>;
  updateCategory: (id: string | number, updates: any) => Promise<void>;
  deleteCategory: (id: string | number) => Promise<void>;
  subscribe: () => () => void;
  clearDemoData: () => void;
}

export const CATEGORY_FALLBACKS: any[] = [
  { name: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=200&h=200&auto=format&fit=crop' },
  { name: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=200&h=200&auto=format&fit=crop' },
  { name: 'home', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=200&h=200&auto=format&fit=crop' }
];

export const resolveCategoryThumbnail = (category: Category) => {
  return category.iconImage || category.image || category.image_url || (CATEGORY_FALLBACKS[0]?.image);
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  isLoaded: false,

  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      set({ 
        categories: data.map((c: any) => ({ ...c, id: String(c.id), createdAt: c.created_at })), 
        isLoaded: true 
      });
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (payload) => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        get().fetchCategories();
      }
    } catch (err) {
      console.error("Failed to add category:", err);
    }
  },

  updateCategory: async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        get().fetchCategories();
      }
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  },

  deleteCategory: async (id) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        get().fetchCategories();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  },

  subscribe: () => {
    get().fetchCategories();
    return () => {};
  },

  clearDemoData: () => set({ categories: [] })
}));
