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
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('tazu_categories_backup');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse categories backup from localStorage:", e);
    }
  }
  return [];
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: getInitialCategories(),
  isLoaded: typeof window !== 'undefined' && !!localStorage.getItem('tazu_categories_backup'),
  
  addCategory: async (payload) => {
    const supabase = getSupabase();
    const id = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCategory: Category = {
      ...payload,
      id,
      createdAt: new Date().toISOString(),
    };
    
    // Update local state and backup immediately
    const currentCats = get().categories;
    const nextCats = [...currentCats, newCategory];
    set({ categories: nextCats, isLoaded: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('tazu_categories_backup', JSON.stringify(nextCats));
    }
    
    if (supabase) {
      try {
        const { error } = await supabase.from('categories').insert([newCategory]);
        if (error) {
          console.warn("[Supabase Insert Warning - Suppressed]:", error.message || error);
        }
      } catch (err) {
        console.warn("[Supabase Insert Catch Warning - Suppressed]:", err);
      }
    }
  },
  
  updateCategory: async (id, payload) => {
    const supabase = getSupabase();
    const currentCats = get().categories;
    const existing = currentCats.find(c => c.id === id);
    const mergedPayload = existing ? { ...existing, ...payload } : payload;
    
    // Update local state and backup immediately
    const updatedCats = currentCats.map(c => c.id === id ? { ...c, ...mergedPayload } : c);
    set({ categories: updatedCats as Category[], isLoaded: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('tazu_categories_backup', JSON.stringify(updatedCats));
    }
    
    if (supabase) {
      try {
        const { error } = await supabase.from('categories').update(mergedPayload).eq('id', id);
        if (error) {
          console.warn("[Supabase Update Warning - Suppressed]:", error.message || error);
        }
      } catch (err) {
        console.warn("[Supabase Update Catch Warning - Suppressed]:", err);
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
    
    // Update local state and backup immediately
    const newCats = currentCats.filter(c => c.id !== id);
    set({ categories: newCats, isLoaded: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('tazu_categories_backup', JSON.stringify(newCats));
    }
    
    if (supabase) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
          console.warn("[Supabase Delete Warning - Suppressed]:", error.message || error);
        }
      } catch (err) {
        console.warn("[Supabase Delete Catch Warning - Suppressed]:", err);
      }
    }
  },
  
  clearDemoData: () => {
    set({ categories: [] });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tazu_categories_backup');
    }
  },
  
  subscribe: () => {
    const existingBackup = typeof window !== 'undefined' ? localStorage.getItem('tazu_categories_backup') : null;
    set({ isLoaded: !!existingBackup });
    
    const supabase = getSupabase();
    if (!supabase) {
        console.warn("[Supabase Categories Sync] Supabase client is not available or configured. Defaulting to empty array or localStorage backup.");
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
    console.log(`%c[Supabase Categories Fetch] Querying 'categories' from: ${url || 'Current Instance'}`, "color: #3b82f6;");
    
    supabase.from('categories').select('*')
      .then(({ data, error, status, statusText }) => {
        if (error) {
            console.warn("%c[Supabase Categories FETCH ERROR - Suppressed]:", "color: #f59e0b; font-weight: bold;", {
              code: error.code,
              message: error.message,
              hint: (error as any).hint,
              details: (error as any).details,
              httpStatus: status,
              httpStatusText: statusText
            });
            set({ isLoaded: true });
        } else if (data) {
            console.log(`%c[Supabase Categories SUCCESS] Rows: ${data.length} (HTTP ${status})`, "color: #10b981; font-weight: bold;");
            if (data.length === 0) {
              console.warn("[Supabase Categories] Table is EMPTY. If you have data, this is almost certainly an RLS 'anon' role read-denied issue.");
            }
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
              if (typeof window !== 'undefined') {
                localStorage.setItem('tazu_categories_backup', JSON.stringify(mappedData));
              }
            } catch (err) {
              console.error("[Supabase Categories] Critical processing error:", err);
              set({ isLoaded: true });
            }
        } else {
            console.log("[Supabase Categories Fetch] No data or error returned (Unexpected).");
            set({ isLoaded: true });
        }
    }, (err) => {
        console.warn("[Supabase Categories Fetch CONNECTION ERROR - Suppressed]:", err);
        set({ isLoaded: true });
    });
    
    let channel: any = null;
    try {
      channel = supabase
        .channel('public:categories:' + Math.random().toString(36).substring(2, 9))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
          console.log("[Supabase Categories Sync] postgres_changes change detected:", payload);
          supabase.from('categories').select('*')
              .then(({ data, error }) => {
                  if (!error && data) {
                      const mappedData = data.map(mapDbToCategory).sort((a: any, b: any) => Number(a.displayOrder) - Number(b.displayOrder));
                      console.log("[Supabase Categories Sync] Reloaded items count:", mappedData.length, "Loaded:", mappedData);
                      set({ categories: mappedData, isLoaded: true });
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('tazu_categories_backup', JSON.stringify(mappedData));
                      }
                  }
              }, () => {});
          })
          .subscribe();
    } catch (realtimeErr) {
      console.warn("[Supabase Categories Real-time Subscription - Suppressed]:", realtimeErr);
    }
      
    return () => {
      if (channel) {
        console.log("[Supabase Categories Sync] Unsubscribing real-time channel");
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }
}));

