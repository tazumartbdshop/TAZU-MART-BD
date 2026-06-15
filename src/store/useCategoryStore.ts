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
    set({ isLoaded: false });
    const supabase = getSupabase();
    if (!supabase) {
        console.warn("[Supabase Categories Sync] Supabase client is not available or configured. Defaulting to empty array.");
        set({ isLoaded: true });
        return () => {}; // fallback
    }

    const mapDbToCategory = (row: any): Category => {
      if (!row) return row;
      const getVal = (exactKey: string, snakeKey: string) => {
        if (row[exactKey] !== undefined) return row[exactKey];
        if (row[snakeKey] !== undefined) return row[snakeKey];
        const lowerExact = exactKey.toLowerCase();
        const lowerSnake = snakeKey.toLowerCase();
        for (const k of Object.keys(row)) {
          const lk = k.toLowerCase();
          if (lk === lowerExact || lk === lowerSnake) {
            return row[k];
          }
        }
        return undefined;
      };

      return {
        id: row.id || '',
        name: row.name || '',
        slug: row.slug || '',
        bannerName: getVal('bannerName', 'banner_name') || '',
        bannerImage: getVal('bannerImage', 'banner_image') || '',
        bannerImages: getVal('bannerImages', 'banner_images') || (getVal('bannerImage', 'banner_image') ? [getVal('bannerImage', 'banner_image')] : []),
        iconImage: getVal('iconImage', 'icon_image') || '',
        wideBannerImage: getVal('wideBannerImage', 'wide_banner_image') || '',
        buttonText: getVal('buttonText', 'button_text') || '',
        buttonLink: getVal('buttonLink', 'button_link') || '',
        featuredProducts: getVal('featuredProducts', 'featured_products') || '',
        description: row.description || '',
        displayOrder: Number(getVal('displayOrder', 'display_order') ?? 1),
        status: getVal('status', 'status') || 'Active',
        showOnHomepage: getVal('showOnHomepage', 'show_on_homepage') !== false,
        createdAt: getVal('createdAt', 'created_at') || '',
        metaTitle: getVal('metaTitle', 'meta_title') || '',
        metaDescription: getVal('metaDescription', 'meta_description') || '',
        keywords: getVal('keywords', 'keywords') || '',
        isDemo: getVal('isDemo', 'is_demo') || false,
        sliderSettings: getVal('sliderSettings', 'slider_settings') || null
      };
    };

    console.log("[Supabase Categories Fetch] Querying from 'categories' table...");
    // Initial fetch
    supabase.from('categories').select('*')
      .then(({ data, error }) => {
        if (error) {
            console.error("[Supabase Categories Fetch ERROR]:", error);
            set({ isLoaded: true });
        } else if (data) {
            console.log(`[Supabase Categories Fetch SUCCESS] Count: ${data.length}`);
            const mappedData = data.map(mapDbToCategory).sort((a: any, b: any) => Number(a.displayOrder) - Number(b.displayOrder));
            set({ categories: mappedData, isLoaded: true });
        } else {
            console.log("[Supabase Categories Fetch] No data returned from categories table.");
            set({ isLoaded: true });
        }
    }, (err) => {
        console.error("[Supabase Categories Fetch CRITICAL ERROR]:", err);
        set({ isLoaded: true });
    });
    
    const channel = supabase
      .channel('public:categories:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        console.log("[Supabase Categories Sync] postgres_changes change detected:", payload);
        supabase.from('categories').select('*')
            .then(({ data, error }) => {
                if (!error && data) {
                    const mappedData = data.map(mapDbToCategory).sort((a: any, b: any) => Number(a.displayOrder) - Number(b.displayOrder));
                    console.log("[Supabase Categories Sync] Reloaded items count:", mappedData.length, "Loaded:", mappedData);
                    set({ categories: mappedData, isLoaded: true });
                }
            });
      })
      .subscribe();
      
    return () => {
      console.log("[Supabase Categories Sync] Unsubscribing real-time channel");
      supabase.removeChannel(channel);
    };
  }
}));

