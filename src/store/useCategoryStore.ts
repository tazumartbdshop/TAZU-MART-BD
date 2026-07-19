import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { deleteImage } from '../lib/imageUtils';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';
import { broadcastSync } from '../lib/broadcastSync';
import { resolveImageUrl } from '../utils/apiUrl';

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
  createdAt: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  isDemo?: boolean;
  sliderSettings?: any;
  imageUrl?: string;
  image_url?: string;
}

export const CATEGORY_FALLBACKS = [];

export function resolveCategoryThumbnail(cat: Partial<Category> | null | undefined): string {
  const placeholder = "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=200&h=200&auto=format&fit=crop";
  if (!cat) return placeholder;
  if (cat.imageUrl && cat.imageUrl.trim() !== '') {
    return cat.imageUrl;
  }
  if (cat.image_url && cat.image_url.trim() !== '') {
    return cat.image_url;
  }
  if (cat.iconImage && cat.iconImage.trim() !== '') {
    return cat.iconImage;
  }
  if (cat.bannerImage && cat.bannerImage.trim() !== '') {
    return cat.bannerImage;
  }
  if (cat.bannerImages && Array.isArray(cat.bannerImages) && cat.bannerImages.length > 0 && cat.bannerImages[0]) {
    return cat.bannerImages[0];
  }
  return placeholder;
}

interface CategoryState {
  categories: Category[];
  isLoaded: boolean;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  clearDemoData: () => void;
  subscribe: () => () => void;
}

const getInitialCategories = (): Category[] => {
  return [];
};

// Strict list of actual database columns present in the MySQL `categories` table
const VALID_CATEGORY_COLUMNS = new Set([
  'id',
  'name',
  'slug',
  'banner_name',
  'banner_image',
  'banner_images',
  'icon_image',
  'wide_banner_image',
  'button_text',
  'button_link',
  'featured_products',
  'description',
  'display_order',
  'status',
  'show_on_homepage',
  'created_at',
  'meta_title',
  'meta_description',
  'keywords',
  'is_demo',
  'slider_settings'
]);

// Helper to strictly prune payload to only include actual database columns before query
export const pruneInvalidCategoryColumns = (payload: any) => {
  const pruned: any = {};
  Object.keys(payload).forEach(key => {
    if (VALID_CATEGORY_COLUMNS.has(key)) {
      pruned[key] = payload[key];
    } else {
      console.warn(`[Prune Column] Filtered out invalid category column '${key}' from database write payload`);
    }
  });
  return pruned;
};

// Cache of columns detected as non-existent to avoid redundant network attempts
const knownInvalidColumns = new Set<string>();

async function executeWithSelfHealing(
  action: (payload: any) => Promise<{ data: any; error: any; status: number; statusText: string }>,
  initialPayload: any
): Promise<{ data: any; error: any; status: number; statusText: string }> {
  // Always pre-prune to prevent issues
  let dbPayload = pruneInvalidCategoryColumns(initialPayload);
  
  // Prune any column already known to be invalid
  for (const col of knownInvalidColumns) {
    delete dbPayload[col];
  }

  let attempts = 0;
  const maxAttempts = 25;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Self-Healing Client] Attempting DB write (Attempt ${attempts}/${maxAttempts}) with keys:`, Object.keys(dbPayload));
    
    const result = await action(dbPayload);
    
    if (result.error) {
      const errMsg = String(result.error.message || '');
      const errCode = String(result.error.code || '');
      
      console.warn(`[Self-Healing Error Received] Code: ${errCode} | Status: ${result.status} | Msg: ${errMsg}`);
      
      // PGRST204: column not found. PGRST205: table/relation mismatch. 42703: undefined_column.
      // Also match MySQL "Unknown column" or "field list" issues
      if (
        errCode === 'PGRST204' || 
        errCode === 'PGRST205' || 
        errCode === '42703' || 
        result.status === 400 || 
        errMsg.toLowerCase().includes('unknown column') || 
        errMsg.toLowerCase().includes('field list')
      ) {
        let badCol = '';
        
        // Match 1: "Could not find the 'banner_image' column"
        const match1 = errMsg.match(/['"“]([a-zA-Z0-9_]+)['"”]\s+column/i);
        if (match1) badCol = match1[1];
        
        // Match 2: "column categories.display_order does not exist"
        if (!badCol) {
          const match2 = errMsg.match(/column\s+['"“]?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)/i);
          if (match2) badCol = match2[1];
        }

        // Match MySQL: "Unknown column 'image_url' in 'field list'"
        if (!badCol) {
          const mysqlMatch = errMsg.match(/Unknown column ['"“]?([a-zA-Z0-9_]+)['"”]? in/i);
          if (mysqlMatch) badCol = mysqlMatch[1];
        }
        
        // Fallback: find any word term mentioned in quotes that exists in the payload keys
        if (!badCol) {
          const matches = errMsg.match(/['"“]([a-zA-Z0-9_]+)['"”]/g);
          if (matches) {
            for (const item of matches) {
              const cleaned = item.replace(/['"“’”]/g, '');
              if (dbPayload[cleaned] !== undefined) {
                badCol = cleaned;
                break;
              }
            }
          }
        }

        if (badCol) {
          console.warn(`[Self-Healing Database Engine] Pruning non-existent column '${badCol}' and retrying write...`);
          knownInvalidColumns.add(badCol);
          delete dbPayload[badCol];
          continue;
        }
      }
      return result;
    }
    return result;
  }
  return { data: null, error: new Error("Too many self-healing retrieval attempts"), status: 400, statusText: "Bad Request" };
}

// Initial state helper to read from localStorage synchronous cache
const getCachedCategories = (): Category[] => {
  try {
    const cached = localStorage.getItem('supabase_cached_categories');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to parse cached categories from localStorage:", e);
  }
  return [];
};

const saveCachedCategories = (categories: Category[]) => {
  try {
    localStorage.setItem('supabase_cached_categories', JSON.stringify(categories));
  } catch (e) {
    console.warn("Failed to save categories to localStorage cache:", e);
  }
};

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: getCachedCategories(),
  isLoaded: getCachedCategories().length > 0,
  
  addCategory: async (payload) => {
    const supabase = getSupabase();
    const id = `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newCategory: Category = {
      ...payload,
      id,
      createdAt: Date.now(),
    };
    
    console.log(`%c[MySQL Category Insert] Attempting INSERT in 'categories' table`, "color: #3b82f6; font-weight: bold; font-size: 13px;");
    
    // Transform to snake_case for MySQL
    const dbPayload = objectToSnake(newCategory);
    console.log("[MySQL Category DB Payload]", dbPayload);
    
    // Optimistic Update
    const currentCats = get().categories;
    const nextCats = [...currentCats, newCategory];
    set({ categories: nextCats, isLoaded: true });
    saveCachedCategories(nextCats);
    broadcastSync.publish('categories', nextCats);
    
    if (supabase) {
      try {
        const selfHealResult = await executeWithSelfHealing(
          async (prunedDbPayload) => {
            return await supabase.from('categories').insert([prunedDbPayload]).select();
          },
          dbPayload
        );
        
        const { data, error, status, statusText } = selfHealResult;
        console.log(`%c[MySQL Insert Response] HTTP Status: ${status} (${statusText})`, "color: #a855f7; font-weight: bold;");
        
        if (error) {
          // Rollback on error
          set({ categories: currentCats });
          saveCachedCategories(currentCats);
          broadcastSync.publish('categories', currentCats);
          console.error("%c[MySQL DB Insert Fail Error Details]:", "color: #ef4444; font-weight: bold;", {
            message: error.message,
            code: error.code,
            status,
            statusText
          });
          
          throw new Error(`MySQL Insert Failed: ${error.message}`);
        } else {
          console.log(`%c[MySQL DB Insert SUCCESS] Record written successfully!`, "color: #10b981; font-weight: bold; font-size: 12px;", data);
          await get().fetchCategories();
        }
      } catch (err: any) {
        // Rollback on catch
        set({ categories: currentCats });
        saveCachedCategories(currentCats);
        broadcastSync.publish('categories', currentCats);
        console.error("%c[MySQL DB Insert Exception]:", "color: #f43f5e; font-weight: bold;", err);
        throw new Error(err?.message || err || "MySQL connection failure during insert");
      }
    } else {
      // Rollback
      set({ categories: currentCats });
      saveCachedCategories(currentCats);
      broadcastSync.publish('categories', currentCats);
      console.error("%c[MySQL Client Missing] Cannot write category: MySQL client not initialized.", "color: #ef4444; font-weight: bold;");
      throw new Error("Database client is not initialized");
    }
  },
  
  updateCategory: async (id, payload) => {
    const supabase = getSupabase();
    const currentCats = get().categories;
    const existing = currentCats.find(c => c.id === id);
    const mergedPayload = existing ? { ...existing, ...payload } : payload;
    
    console.log(`%c[MySQL Category Update] Attempting UPDATE in 'categories' for ID: ${id}`, "color: #eab308; font-weight: bold; font-size: 13px;");
    
    // Transform to snake_case for MySQL
    const dbPayload = objectToSnake(mergedPayload);
    // Remove auto-generated timestamp and id from updates just in case
    delete dbPayload.id;
    delete dbPayload.created_at;
    
    console.log("[MySQL Category DB Update Payload]", dbPayload);
    
    // Optimistic Update
    const updatedCats = currentCats.map(c => c.id === id ? { ...c, ...mergedPayload } : c);
    set({ categories: updatedCats as Category[], isLoaded: true });
    saveCachedCategories(updatedCats as Category[]);
    broadcastSync.publish('categories', updatedCats as Category[]);
    
    if (supabase) {
      try {
        const selfHealResult = await executeWithSelfHealing(
          async (prunedDbPayload) => {
            return await supabase.from('categories').update(prunedDbPayload).eq('id', id).select();
          },
          dbPayload
        );
        
        const { data, error, status, statusText } = selfHealResult;
        console.log(`%c[MySQL Update Response] HTTP Status: ${status} (${statusText})`, "color: #a855f7; font-weight: bold;");
        
        if (error) {
          // Rollback on error
          set({ categories: currentCats });
          saveCachedCategories(currentCats);
          broadcastSync.publish('categories', currentCats);
          console.error("%c[MySQL DB Update Fail Error Details]:", "color: #ef4444; font-weight: bold;", {
            message: error.message,
            code: error.code,
            status,
            statusText
          });
          throw new Error(`MySQL Update Failed: ${error.message}`);
        } else {
          console.log(`%c[MySQL DB Update SUCCESS] Record updated successfully!`, "color: #10b981; font-weight: bold; font-size: 12px;", data);
          await get().fetchCategories();
        }
      } catch (err: any) {
        // Rollback on catch
        set({ categories: currentCats });
        saveCachedCategories(currentCats);
        broadcastSync.publish('categories', currentCats);
        console.error("%c[MySQL DB Update Exception]:", "color: #f43f5e; font-weight: bold;", err);
        throw new Error(err?.message || err || "MySQL connection failure during update");
      }
    } else {
      // Rollback
      set({ categories: currentCats });
      saveCachedCategories(currentCats);
      broadcastSync.publish('categories', currentCats);
      console.error("%c[MySQL Client Missing] Cannot update category: MySQL client not initialized.", "color: #ef4444; font-weight: bold;");
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
    saveCachedCategories(newCats);
    broadcastSync.publish('categories', newCats);
    
    if (supabase) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
          // Rollback on error
          set({ categories: currentCats });
          saveCachedCategories(currentCats);
          broadcastSync.publish('categories', currentCats);
          console.error("MySQL category delete error:", error);
          throw new Error(error.message || "Failed to delete category from MySQL database");
        } else {
          await get().fetchCategories();
        }
      } catch (err: any) {
        // Rollback on catch
        set({ categories: currentCats });
        saveCachedCategories(currentCats);
        broadcastSync.publish('categories', currentCats);
        console.error("MySQL delete catch exception:", err);
        throw new Error(err?.message || err || "MySQL database connection failure");
      }
    } else {
      // Rollback
      set({ categories: currentCats });
      saveCachedCategories(currentCats);
      broadcastSync.publish('categories', currentCats);
      throw new Error("Database client is not initialized");
    }
  },

  fetchCategories: async () => {
    const supabase = getSupabase();
    if (!supabase) {
      set({ isLoaded: true });
      return;
    }

    const mapDbToCategory = (row: any): Category => {
      if (!row) return row;
      const camelRow: any = objectToCamel(row);
      
      return {
        id: camelRow.id || '',
        name: camelRow.name || '',
        slug: camelRow.slug || '',
        bannerName: camelRow.bannerName || '',
        bannerImage: resolveImageUrl(camelRow.bannerImage),
        bannerImages: (camelRow.bannerImages && Array.isArray(camelRow.bannerImages))
          ? camelRow.bannerImages.map(resolveImageUrl)
          : (camelRow.bannerImage ? [resolveImageUrl(camelRow.bannerImage)] : []),
        iconImage: resolveImageUrl(camelRow.iconImage),
        wideBannerImage: resolveImageUrl(camelRow.wideBannerImage),
        buttonText: camelRow.buttonText || '',
        buttonLink: camelRow.buttonLink || '',
        featuredProducts: camelRow.featuredProducts || '',
        description: camelRow.description || '',
        displayOrder: Number(camelRow.displayOrder ?? 1),
        status: camelRow.status || 'Active',
        showOnHomepage: camelRow.showOnHomepage !== false,
        createdAt: Number(camelRow.createdAt) || 0,
        metaTitle: camelRow.metaTitle || '',
        metaDescription: camelRow.metaDescription || '',
        keywords: camelRow.keywords || '',
        isDemo: camelRow.isDemo || false,
        sliderSettings: camelRow.sliderSettings || null
      };
    };

    try {
      const { data, error, status, statusText } = await supabase.from('categories').select('*');
      if (error) {
        console.warn("%c[MySQL Categories FETCH ERROR]:", "color: #f59e0b; font-weight: bold;", {
          code: error.code,
          message: error.message,
          httpStatus: status,
          httpStatusText: statusText
        });
        set({ isLoaded: true });
      } else if (data) {
        const mappedData = data.map((row: any, idx: number) => {
          try {
            return mapDbToCategory(row);
          } catch (e) {
            console.error(`[MySQL Categories] Mapping failed at index ${idx}:`, row, e);
            throw e;
          }
        }).sort((a: any, b: any) => Number(a.displayOrder) - Number(b.displayOrder));
        set({ categories: mappedData, isLoaded: true });
        saveCachedCategories(mappedData);
        broadcastSync.publish('categories', mappedData);
      } else {
        set({ isLoaded: true });
      }
    } catch (err) {
      console.warn("[MySQL Categories Fetch CONNECTION ERROR]:", err);
      set({ isLoaded: true });
    }
  },

  clearDemoData: () => {
    set({ categories: [] });
    saveCachedCategories([]);
  },
  
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) {
        console.warn("[MySQL Categories Sync] MySQL client is not available. Defaulting to empty array.");
        set({ isLoaded: true });
        return () => {}; // fallback
    }

    // 1. Initial Load immediately
    get().fetchCategories();

    // 2. Real-time changes subscription
    let channel: any = null;
    try {
      channel = supabase
        .channel('public:categories:' + Math.random().toString(36).substring(2, 9))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
          console.log("[MySQL Categories Sync] Real-time changes event received:", payload);
          get().fetchCategories();
        })
        .subscribe();
    } catch (realtimeErr) {
      console.warn("[MySQL Categories Real-time Subscription - Suppressed]:", realtimeErr);
    }

    // 3. Robust background polling interval (every 12 seconds) 
    // This acts as a bulletproof failsafe if WebSocket drops or during cross-device navigation.
    const pollInterval = setInterval(() => {
      get().fetchCategories();
    }, 12000);
      
    // 4. Return complete cleanup
    return () => {
      clearInterval(pollInterval);
      if (channel) {
        console.log("[MySQL Categories Sync] Unsubscribing real-time channel and polling");
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
    };
  }
}));

