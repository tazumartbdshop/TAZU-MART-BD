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

export const CATEGORY_FALLBACKS = [
  { name: "watches", image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "wallets", image: "https://images.unsplash.com/photo-1588444839799-eaa4344ecc1e?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "gift", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=200&h=200&auto=format&fit=crop" },
  { name: "premium", image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=200&h=200&auto=format&fit=crop" }
];

export function resolveCategoryThumbnail(cat: Partial<Category> | null | undefined): string {
  if (!cat) return "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=200&h=200&auto=format&fit=crop";
  if (cat.iconImage && cat.iconImage.trim() !== '') {
    return cat.iconImage;
  }
  if (cat.bannerImage && cat.bannerImage.trim() !== '') {
    return cat.bannerImage;
  }
  if (cat.bannerImages && Array.isArray(cat.bannerImages) && cat.bannerImages.length > 0 && cat.bannerImages[0]) {
    return cat.bannerImages[0];
  }
  const term = String(cat.name || cat.slug || '').toLowerCase();
  for (const fallback of CATEGORY_FALLBACKS) {
    if (term.includes(fallback.name)) {
      return fallback.image;
    }
  }
  return "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=200&h=200&auto=format&fit=crop";
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

const getInitialCategories = (): Category[] => {
  return [];
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoaded: false,
  
  addCategory: async (payload) => {
    const supabase = getSupabase();
    const creds = (window as any).getSupabaseCredentials?.() || { url: 'Unknown', key: 'Unknown' };
    const id = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCategory: Category = {
      ...payload,
      id,
      createdAt: new Date().toISOString(),
    };
    
    console.log(`%c[Supabase Category Insert] Attempting INSERT in 'categories' table`, "color: #3b82f6; font-weight: bold; font-size: 13px;");
    console.log(`%c[Supabase Connection Details] Targeting URL: ${creds.url}`, "color: #0ea5e9; font-weight: bold;");
    console.log("[Supabase Category Payload]", newCategory);
    
    // Optimistic Update
    const currentCats = get().categories;
    const nextCats = [...currentCats, newCategory];
    set({ categories: nextCats, isLoaded: true });
    
    if (supabase) {
      try {
        const { data, error, status, statusText } = await supabase.from('categories').insert([newCategory]).select();
        
        console.log(`%c[Supabase Insert Response] HTTP Status: ${status} (${statusText})`, "color: #a855f7; font-weight: bold;");
        
        if (error) {
          // Rollback on error
          set({ categories: currentCats });
          console.error("%c[Supabase DB Insert Fail Error Details]:", "color: #ef4444; font-weight: bold;", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            status,
            statusText
          });
          throw new Error(`Database Insert Failed [Code: ${error.code}]: ${error.message} (Hint: ${error.hint || 'None'})`);
        } else {
          console.log(`%c[Supabase DB Insert SUCCESS] Record written successfully!`, "color: #10b981; font-weight: bold; font-size: 12px;", data);
        }
      } catch (err: any) {
        // Rollback on catch
        set({ categories: currentCats });
        console.error("%c[Supabase DB Insert Exception]:", "color: #f43f5e; font-weight: bold;", err);
        throw new Error(err?.message || err || "Database connection failure during insert");
      }
    } else {
      // Rollback
      set({ categories: currentCats });
      console.error("%c[Supabase Client Missing] Cannot write category: Supabase Client not initialized.", "color: #ef4444; font-weight: bold;");
      throw new Error("Database client is not initialized");
    }
  },
  
  updateCategory: async (id, payload) => {
    const supabase = getSupabase();
    const creds = (window as any).getSupabaseCredentials?.() || { url: 'Unknown', key: 'Unknown' };
    const currentCats = get().categories;
    const existing = currentCats.find(c => c.id === id);
    const mergedPayload = existing ? { ...existing, ...payload } : payload;
    
    console.log(`%c[Supabase Category Update] Attempting UPDATE in 'categories' for ID: ${id}`, "color: #eab308; font-weight: bold; font-size: 13px;");
    console.log(`%c[Supabase Connection Details] Targeting URL: ${creds.url}`, "color: #0ea5e9; font-weight: bold;");
    console.log("[Supabase Category Update Payload]", mergedPayload);
    
    // Optimistic Update
    const updatedCats = currentCats.map(c => c.id === id ? { ...c, ...mergedPayload } : c);
    set({ categories: updatedCats as Category[], isLoaded: true });
    
    if (supabase) {
      try {
        const { data, error, status, statusText } = await supabase.from('categories').update(mergedPayload).eq('id', id).select();
        
        console.log(`%c[Supabase Update Response] HTTP Status: ${status} (${statusText})`, "color: #a855f7; font-weight: bold;");
        
        if (error) {
          // Rollback on error
          set({ categories: currentCats });
          console.error("%c[Supabase DB Update Fail Error Details]:", "color: #ef4444; font-weight: bold;", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            status,
            statusText
          });
          throw new Error(`Database Update Failed [Code: ${error.code}]: ${error.message} (Hint: ${error.hint || 'None'})`);
        } else {
          console.log(`%c[Supabase DB Update SUCCESS] Record updated successfully!`, "color: #10b981; font-weight: bold; font-size: 12px;", data);
        }
      } catch (err: any) {
        // Rollback on catch
        set({ categories: currentCats });
        console.error("%c[Supabase DB Update Exception]:", "color: #f43f5e; font-weight: bold;", err);
        throw new Error(err?.message || err || "Database connection failure during update");
      }
    } else {
      // Rollback
      set({ categories: currentCats });
      console.error("%c[Supabase Client Missing] Cannot update category: Supabase Client not initialized.", "color: #ef4444; font-weight: bold;");
      throw new Error("Database client is not initialized");
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
    set({ categories: newCats, isLoaded: true });
    
    if (supabase) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
          // Rollback on error
          set({ categories: currentCats });
          console.error("Supabase category delete error:", error);
          throw new Error(error.message || "Failed to delete category from database");
        }
      } catch (err: any) {
        // Rollback on catch
        set({ categories: currentCats });
        console.error("Supabase delete catch exception:", err);
        throw new Error(err?.message || err || "Database connection failure");
      }
    } else {
      // Rollback
      set({ categories: currentCats });
      throw new Error("Database client is not initialized");
    }
  },
  
  clearDemoData: () => {
    set({ categories: [] });
  },
  
  subscribe: () => {
    // Strictly database-driven loading: start with isLoaded false on subscription (refresh)
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

    const { url } = (window as any).getSupabaseCredentials?.() || {};
    
    // Core Fetch Function
    const fetchCategoriesData = () => {
      supabase.from('categories').select('*')
        .then(({ data, error, status, statusText }) => {
          if (error) {
              console.warn("%c[Supabase Categories FETCH ERROR]:", "color: #f59e0b; font-weight: bold;", {
                code: error.code,
                message: error.message,
                hint: (error as any).hint,
                details: (error as any).details,
                httpStatus: status,
                httpStatusText: statusText
              });
              set({ isLoaded: true });
          } else if (data) {
              try {
                const mappedData = data.map((row, idx) => {
                  try {
                    return mapDbToCategory(row);
                  } catch (e) {
                     console.error(`[Supabase Categories] Mapping failed at index ${idx}:`, row, e);
                     throw e;
                  }
                }).sort((a: any, b: any) => Number(a.displayOrder) - Number(b.displayOrder));
                set({ categories: mappedData, isLoaded: true });
              } catch (err) {
                console.error("[Supabase Categories] Critical processing error:", err);
                set({ isLoaded: true });
              }
          } else {
              set({ isLoaded: true });
          }
      }, (err) => {
          console.warn("[Supabase Categories Fetch CONNECTION ERROR]:", err);
          set({ isLoaded: true });
      });
    };

    // 1. Initial Load immediately
    fetchCategoriesData();

    // 2. Real-time changes subscription
    let channel: any = null;
    try {
      channel = supabase
        .channel('public:categories:' + Math.random().toString(36).substring(2, 9))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
          console.log("[Supabase Categories Sync] Real-time postgres_changes event received:", payload);
          fetchCategoriesData();
        })
        .subscribe();
    } catch (realtimeErr) {
      console.warn("[Supabase Categories Real-time Subscription - Suppressed]:", realtimeErr);
    }

    // 3. Robust background polling interval (every 12 seconds) 
    // This acts as a bulletproof failsafe if WebSocket drops or during cross-device navigation.
    const pollInterval = setInterval(() => {
      fetchCategoriesData();
    }, 12000);
      
    // 4. Return complete cleanup
    return () => {
      clearInterval(pollInterval);
      if (channel) {
        console.log("[Supabase Categories Sync] Unsubscribing real-time channel and polling");
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }
}));

