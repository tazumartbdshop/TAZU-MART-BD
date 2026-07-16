import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { deleteImage } from '../lib/imageUtils';
import { objectToSnake, objectToCamel } from '../lib/supabaseUtils';
import { broadcastSync } from '../lib/broadcastSync';
import { generateSlug } from '../lib/utils';
import { resolveImageUrl } from '../utils/apiUrl';

// Strict list of actual database columns present in the MySQL `products` table
export const VALID_PRODUCT_COLUMNS = new Set([
  'id',
  'name',
  'sku',
  'category',
  'price',
  'discount_price',
  'stock',
  'image',
  'image_url',
  'featured_image',
  'banner_image',
  'images',
  'video_url',
  'media_url',
  'rating',
  'reviews',
  'is_new',
  'brand',
  'status',
  'description',
  'created_at',
  'buying_price',
  'warranty',
  'unit_name',
  'sold_count',
  'seo_points',
  'variants',
  'shipping_zones',
  'is_flash_sale',
  'is_trending',
  'is_best_selling',
  'is_regular',
  'is_offer',
  'reward_coins',
  'coin_enabled',
  'is_demo',
  'keywords',
  'display_order',
  'thumbnail',
  'slug'
]);

export const pruneInvalidProductColumns = (payload: any) => {
  const pruned: any = {};
  Object.keys(payload).forEach(key => {
    if (VALID_PRODUCT_COLUMNS.has(key)) {
      pruned[key] = payload[key];
    } else {
      console.warn(`[Prune Column] Filtered out invalid product column '${key}' from database write payload`);
    }
  });
  return pruned;
};

// Cache of columns detected as non-existent to avoid redundant network attempts
const knownInvalidProductColumns = new Set<string>();

async function executeWithSelfHealingProducts(
  action: (payload: any) => Promise<{ data: any; error: any; status: number; statusText: string }>,
  initialPayload: any
): Promise<{ data: any; error: any; status: number; statusText: string }> {
  // Always pre-prune to prevent issues
  let dbPayload = pruneInvalidProductColumns(initialPayload);
  
  // Prune any column already known to be invalid
  for (const col of knownInvalidProductColumns) {
    delete dbPayload[col];
  }

  let attempts = 0;
  const maxAttempts = 25;

  while (attempts < maxAttempts) {
    attempts++;
    console.log(`[Self-Healing Products Client] Attempting DB write (Attempt ${attempts}/${maxAttempts}) with keys:`, Object.keys(dbPayload));
    
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
        
        // Match 1: "Could not find the 'xyz' column"
        const match1 = errMsg.match(/['"“]([a-zA-Z0-9_]+)['"”]\s+column/i);
        if (match1) badCol = match1[1];
        
        // Match 2: "column products.xyz does not exist"
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
          knownInvalidProductColumns.add(badCol);
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

export interface Product {
  id: string;
  slug?: string;
  name: string;
  sku: string;
  sku_code?: string; // New field for consistency
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  image: string;
  imageUrl?: string;
  featured_image?: string;
  banner_image?: string;
  images?: string[];
  videoUrl?: string;
  mediaUrl?: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  brand?: string;
  status: 'active' | 'draft';
  description?: string;
  createdAt: number;
  buyingPrice?: number;
  warranty?: string;
  unitName?: string;
  soldCount?: number;
  productCode?: string;
  seoPoints?: string[];
  variants?: { name: string; price: number }[];
  shippingZones?: { zone: string; charge: string }[];
  is_flash_sale?: boolean;
  is_trending?: boolean;
  is_best_selling?: boolean;
  is_regular?: boolean;
  is_offer?: boolean;
  reward_coins?: number;
  coin_enabled?: boolean;
  isDemo?: boolean;
  keywords?: string[];
  qnas?: { question: string; answer: string }[];
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  isLoaded: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updatedFields: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  subscribe: () => () => void;
  autoRankTrending: () => void;
  autoRankBestSellers: () => void;
  clearDemoData: () => void;
}

// Global helper for spelling tolerance & auto keyword mapping
export function generateKeywords(name: string, category: string, brand?: string, description?: string): string[] {
  const keywords = new Set<string>();

  const addPhrases = (text: string) => {
    if (!text) return;
    const clean = text.toLowerCase().replace(/[^\s\w\u00C0-\uFFFF-]/g, '').trim();
    if (!clean) return;
    
    keywords.add(clean);

    const words = clean.split(/\s+/);
    // Add individual words if >= 3 characters (or any Bangla character representing words)
    words.forEach(w => {
      if (w.length >= 2) {
        keywords.add(w);
      }
    });

    // Add 2-word sequences (combination tags)
    for (let i = 0; i < words.length - 1; i++) {
      keywords.add(`${words[i]} ${words[i + 1]}`);
    }
    // Add 3-word sequences
    for (let i = 0; i < words.length - 2; i++) {
      keywords.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  };

  addPhrases(name);
  addPhrases(category);
  if (brand) addPhrases(brand);
  if (description) addPhrases(description);

  const lowerName = name.toLowerCase();
  const lowerCategory = category.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();

  // Bidirectional Bilingual mappings
  // 1. WATCHES
  if (
    lowerName.includes('watch') || lowerCategory.includes('watch') || lowerDesc.includes('watch') ||
    lowerName.includes('ঘড়ি') || lowerName.includes('হাত ঘড়ি') || lowerName.includes('হাতঘড়ি')
  ) {
    ['watch', 'wrist watch', 'smart watch', 'premium watch', 'luxury watch', 'men watch', 'women watch', 'ghori', 'clock', 'timepiece', 'ঘড়ি', 'হাত ঘড়ি', 'হাতঘড়ি', 'ছেলেদের ঘড়ি', 'সস্তা ঘড়ি', 'ভালো ঘড়ি'].forEach(k => keywords.add(k));
  }

  // 2. PERFUMES
  if (
    lowerName.includes('perfume') || lowerCategory.includes('perfume') || lowerName.includes('fragrance') || lowerDesc.includes('scent') ||
    lowerName.includes('সুগন্ধি') || lowerName.includes('সুগন্ধী') || lowerName.includes('পারফিউম') || lowerName.includes('আতর')
  ) {
    ['perfume', 'fragrance', 'scent', 'cologne', 'body spray', 'attar', 'sugondhi', 'সুগন্ধি', 'সুগন্ধী', 'পারফিউম', 'আতর', 'ভালো পারফিউম', 'সস্তা পারফিউম', 'ছেলেদের পারফিউম'].forEach(k => keywords.add(k));
  }

  // 3. WALLETS
  if (
    lowerName.includes('wallet') || lowerCategory.includes('wallet') || lowerName.includes('card holder') ||
    lowerName.includes('ওয়ালেট') || lowerName.includes('মানিব্যাগ') || lowerName.includes('মানি ব্যাগ')
  ) {
    ['wallet', 'leather wallet', 'money bag', 'pocket book', 'card holder', 'ওয়ালেট', 'মানিব্যাগ', 'মানি ব্যাগ', 'ভার্সোটাইল ওয়ালেট'].forEach(k => keywords.add(k));
  }

  // 4. EARBUDS & HEADPHONES
  if (
    lowerName.includes('earbud') || lowerName.includes('headphone') || lowerCategory.includes('audio') || lowerCategory.includes('electronics') ||
    lowerName.includes('হেডফোন') || lowerName.includes('ইয়ারবাড') || lowerName.includes('ইয়ারফোন')
  ) {
    ['earbud', 'earphone', 'wireless earbuds', 'bluetooth headphone', 'sound buds', 'হেডফোন', 'ইয়ারবাড', 'ইয়ারফোন', 'ভালো হেডফোন'].forEach(k => keywords.add(k));
  }

  // 5. PHONES & MOBILE
  if (
    lowerName.includes('phone') || lowerName.includes('mobile') || lowerCategory.includes('mobile') ||
    lowerName.includes('মোবাইল') || lowerName.includes('ফোন') || lowerName.includes('স্মার্টফোন')
  ) {
    ['phone', 'mobile', 'smartphone', 'smart phone', 'cellphone', 'মোবাইল', 'ফোন', 'স্মার্টফোন', 'সস্তা মোবাইল'].forEach(k => keywords.add(k));
  }

  // 6. SHOES
  if (
    lowerName.includes('shoe') || lowerName.includes('sneaker') || lowerCategory.includes('shoe') ||
    lowerName.includes('জুতা') || lowerName.includes('জুতো') || lowerName.includes('স্যান্ডেল')
  ) {
    ['shoe', 'shoes', 'sneakers', 'sandals', 'boots', 'জুতা', 'জুতো', 'স্যান্ডেল', 'ছেলেদের জুতা'].forEach(k => keywords.add(k));
  }

  // 7. SHIRTS & CLOTHING
  if (
    lowerName.includes('shirt') || lowerCategory.includes('clothing') ||
    lowerName.includes('শার্ট') || lowerName.includes('টি-শার্ট') || lowerName.includes('টি শার্ট')
  ) {
    ['shirt', 'shirts', 'tshirt', 't-shirt', 'শার্ট', 'টি-শার্ট', 'টি শার্ট', 'ছেলেদের শার্ট'].forEach(k => keywords.add(k));
  }

  // 8. PANTS
  if (
    lowerName.includes('pant') || lowerName.includes('jeans') ||
    lowerName.includes('প্যান্ট') || lowerName.includes('প্যান্টস')
  ) {
    ['pant', 'pants', 'jeans', 'trouser', 'trousers', 'প্যান্ট', 'প্যান্টস'].forEach(k => keywords.add(k));
  }

  return Array.from(keywords);
}

// Robust mapper for Product table to handle both snake_case and camelCase variants
const mapDbToProduct = (row: any): Product => {
  const camelRow: any = objectToCamel(row);

  let parsedImages: string[] = [];
  if (Array.isArray(camelRow.images)) {
    parsedImages = camelRow.images;
  } else if (typeof camelRow.images === 'string') {
    const trimmed = camelRow.images.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedImages = parsed;
        } else {
          parsedImages = [trimmed];
        }
      } catch {
        parsedImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
      }
    } else {
      parsedImages = trimmed.split(',').map((img: string) => img.trim()).filter(Boolean);
    }
  } else if (camelRow.images) {
    parsedImages = [String(camelRow.images)];
  }

  let parsedSeoPoints: string[] = [];
  if (Array.isArray(camelRow.seoPoints)) {
    parsedSeoPoints = camelRow.seoPoints;
  } else if (typeof camelRow.seoPoints === 'string') {
    const trimmed = camelRow.seoPoints.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedSeoPoints = parsed;
        } else {
          parsedSeoPoints = [trimmed];
        }
      } catch {
        parsedSeoPoints = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
      }
    } else {
      parsedSeoPoints = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
    }
  } else if (camelRow.seoPoints) {
    parsedSeoPoints = [String(camelRow.seoPoints)];
  }

  let parsedVariants: any[] = [];
  if (Array.isArray(camelRow.variants)) {
    parsedVariants = camelRow.variants;
  } else if (typeof camelRow.variants === 'string') {
    const trimmed = camelRow.variants.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        parsedVariants = JSON.parse(trimmed);
      } catch {}
    }
  }

  let parsedShippingZones: any[] = [];
  if (Array.isArray(camelRow.shippingZones)) {
    parsedShippingZones = camelRow.shippingZones;
  } else if (typeof camelRow.shippingZones === 'string') {
    const trimmed = camelRow.shippingZones.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        parsedShippingZones = JSON.parse(trimmed);
      } catch {}
    }
  }

  let parsedKeywords: string[] = [];
  if (Array.isArray(camelRow.keywords)) {
    parsedKeywords = camelRow.keywords;
  } else if (typeof camelRow.keywords === 'string') {
    const trimmed = camelRow.keywords.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          parsedKeywords = parsed;
        } else {
          parsedKeywords = [trimmed];
        }
      } catch {
        parsedKeywords = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
      }
    } else {
      parsedKeywords = trimmed.split(',').map((p: string) => p.trim()).filter(Boolean);
    }
  } else if (camelRow.keywords) {
    parsedKeywords = [String(camelRow.keywords)];
  }

  let description = camelRow.description || '';
  let parsedQnas: { question: string; answer: string }[] = [];
  
  if (description.includes('<!-- QNA_START -->')) {
    const startIdx = description.indexOf('<!-- QNA_START -->');
    const endIdx = description.indexOf('<!-- QNA_END -->');
    if (endIdx > startIdx) {
      const jsonStr = description.substring(startIdx + '<!-- QNA_START -->'.length, endIdx).trim();
      try {
        parsedQnas = JSON.parse(jsonStr);
      } catch (e) {
        console.warn("Failed to parse QnAs from description", e);
      }
      description = description.substring(0, startIdx).trim();
    }
  }

  return {
    ...camelRow,
    id: camelRow.id || '',
    name: camelRow.name || '',
    sku: camelRow.sku || camelRow.skuCode || '',
    sku_code: camelRow.skuCode || camelRow.sku || '',
    category: camelRow.category || '',
    price: Number(camelRow.price || 0),
    discountPrice: camelRow.discountPrice,
    stock: Number(camelRow.stock || 0),
    image: resolveImageUrl(camelRow.image || camelRow.imageUrl || camelRow.featuredImage || ''),
    imageUrl: resolveImageUrl(camelRow.imageUrl || camelRow.image || ''),
    featured_image: resolveImageUrl(camelRow.featuredImage || camelRow.image || ''),
    banner_image: resolveImageUrl(camelRow.bannerImage || ''),
    images: parsedImages.map(resolveImageUrl),
    videoUrl: camelRow.videoUrl || camelRow.mediaUrl || '',
    mediaUrl: camelRow.mediaUrl || camelRow.videoUrl || '',
    rating: Number(camelRow.rating || 4.5),
    reviews: Number(camelRow.reviews || 0),
    isNew: camelRow.isNew !== undefined ? camelRow.isNew : true,
    brand: camelRow.brand || '',
    status: (camelRow.status || 'active').toLowerCase(),
    description,
    qnas: parsedQnas,
    createdAt: camelRow.createdAt || Date.now(),
    buyingPrice: camelRow.buyingPrice,
    warranty: camelRow.warranty || '',
    unitName: camelRow.unitName,
    soldCount: Number(camelRow.soldCount || 0),
    productCode: camelRow.productCode || '',
    seoPoints: parsedSeoPoints,
    variants: parsedVariants,
    shippingZones: parsedShippingZones,
    is_flash_sale: !!camelRow.isFlashSale,
    is_trending: !!camelRow.isTrending,
    is_best_selling: !!camelRow.isBestSelling,
    is_regular: !!camelRow.isRegular,
    is_offer: !!camelRow.isOffer,
    reward_coins: camelRow.rewardCoins,
    coin_enabled: camelRow.coinEnabled,
    isDemo: !!camelRow.isDemo,
    keywords: parsedKeywords
  };
};

// Initial state helper to read from localStorage synchronous cache
const getCachedProducts = (): Product[] => {
  try {
    const cached = localStorage.getItem('supabase_cached_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to parse cached products from localStorage:", e);
  }
  return [];
};

const saveCachedProducts = (products: Product[]) => {
  try {
    localStorage.setItem('supabase_cached_products', JSON.stringify(products));
  } catch (e) {
    console.warn("Failed to save products to localStorage cache:", e);
  }
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: getCachedProducts(),
  isLoading: false,
  isLoaded: getCachedProducts().length > 0,
  autoRankTrending: () => {
    const products = get().products;
    const sorted = [...products].sort((a, b) => (b.reviews || 0) * (b.rating || 0) - (a.reviews || 0) * (a.rating || 0));
    sorted.slice(0, 5).forEach(p => {
      get().updateProduct(p.id, { is_trending: true }).catch(err => {
        console.warn(`Auto-rank trending failed for ${p.id}`, err);
      });
    });
  },
  autoRankBestSellers: () => {
    const products = get().products;
    const sorted = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    sorted.slice(0, 5).forEach(p => {
      get().updateProduct(p.id, { is_best_selling: true }).catch(err => {
        console.warn(`Auto-rank best sellers failed for ${p.id}`, err);
      });
    });
  },
  clearDemoData: () => {
    const nonDemo = get().products.filter(p => !p.isDemo);
    set({ products: nonDemo });
    saveCachedProducts(nonDemo);
  },
  
  addProduct: async (payload) => {
    const supabase = getSupabase();
    const id = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Serialize QnAs into description HTML comments
    let finalDescription = payload.description || '';
    if (finalDescription.includes('<!-- QNA_START -->')) {
      const startIdx = finalDescription.indexOf('<!-- QNA_START -->');
      finalDescription = finalDescription.substring(0, startIdx).trim();
    }
    if (payload.qnas && payload.qnas.length > 0) {
      finalDescription = `${finalDescription}\n\n<!-- QNA_START -->${JSON.stringify(payload.qnas)}<!-- QNA_END -->`;
    }

    const keywords = generateKeywords(payload.name, payload.category, payload.brand, finalDescription);
    let baseSlug = payload.slug || generateSlug(payload.name);
    if (!baseSlug) baseSlug = "product-" + Date.now();
    let slug = baseSlug;
    const existingSlugs = new Set(get().products.map(p => p.slug));
    while (existingSlugs.has(slug)) {
      slug = baseSlug + "-" + Math.random().toString(36).substring(2, 6);
    }
    const newProduct: Product = {
      ...payload,
      id,
      description: finalDescription,
      keywords,
      slug,
      createdAt: Date.now(),
    };
    
    // Optimistic Update
    const currentProducts = get().products;
    const nextProducts = [...currentProducts, newProduct];
    set({ products: nextProducts });
    saveCachedProducts(nextProducts);
    broadcastSync.publish('products', nextProducts);
    
    if (supabase) {
      try {
        const dbPayload = objectToSnake(newProduct);
        delete dbPayload.qnas; // Prevent column mismatch in DB
        
        const selfHealResult = await executeWithSelfHealingProducts(
          async (prunedDbPayload) => {
            return await supabase.from('products').insert([prunedDbPayload]);
          },
          dbPayload
        );
        
        const { error, status, statusText } = selfHealResult;
        if (error) {
          // Rollback on error
          set({ products: currentProducts });
          saveCachedProducts(currentProducts);
          broadcastSync.publish('products', currentProducts);
          console.error("%c[Supabase Product Sync] INSERT ERROR:", "color: #ef4444; font-weight: bold;", {
            code: error.code,
            message: error.message,
            hint: (error as any).hint,
            details: (error as any).details,
            httpStatus: status,
            httpStatusText: statusText
          });
          
          if (error.code === 'PGRST205') {
            throw new Error(`Database Table Not Found [Code: ${error.code}]: The 'products' table was not found. Please ensure you have run the provisioning SQL script and clicked 'Reload Schema' in Supabase Settings.`);
          }
          
          throw new Error(error.message || "Failed to add product to database");
        }
      } catch (err: any) {
        // Rollback on error
        set({ products: currentProducts });
        saveCachedProducts(currentProducts);
        broadcastSync.publish('products', currentProducts);
        console.error("Product insert exception:", err);
        throw new Error(err.message || "Failed to add product to database");
      }
    }
  },
  
  updateProduct: async (id, payload) => {
    const supabase = getSupabase();
    console.log(`[Supabase Log] Preparing to update product document: products/${id}`);
    
    const currentProducts = get().products;
    const currentProduct = currentProducts.find(p => p.id === id);
    const finalPayload = { ...payload };

    // Process QNAs if they are updated
    if (payload.qnas !== undefined) {
      let desc = payload.description !== undefined ? payload.description : (currentProduct?.description || '');
      if (desc.includes('<!-- QNA_START -->')) {
        const startIdx = desc.indexOf('<!-- QNA_START -->');
        desc = desc.substring(0, startIdx).trim();
      }
      if (payload.qnas && payload.qnas.length > 0) {
        desc = `${desc}\n\n<!-- QNA_START -->${JSON.stringify(payload.qnas)}<!-- QNA_END -->`;
      }
      finalPayload.description = desc;
    }

    if (
      payload.name !== undefined ||
      payload.category !== undefined ||
      payload.brand !== undefined ||
      payload.description !== undefined ||
      payload.qnas !== undefined
    ) {
      const name = payload.name !== undefined ? payload.name : (currentProduct?.name || '');
      const category = payload.category !== undefined ? payload.category : (currentProduct?.category || '');
      const brand = payload.brand !== undefined ? payload.brand : (currentProduct?.brand || '');
      const description = finalPayload.description !== undefined ? finalPayload.description : (currentProduct?.description || '');
      finalPayload.keywords = generateKeywords(name, category, brand, description);
    }
    
    // Optimistic Update
    const updatedProducts = currentProducts.map(p => p.id === id ? { ...p, ...finalPayload } : p);
    set({ products: updatedProducts });
    saveCachedProducts(updatedProducts);
    broadcastSync.publish('products', updatedProducts);
    
    if (supabase) {
      try {
        const dbPayload = objectToSnake(finalPayload);
        delete dbPayload.qnas; // Prevent column mismatch in DB
        delete dbPayload.id; // Prevent updating id key
        delete dbPayload.created_at; // Prevent changing created_at timestamp
        
        const selfHealResult = await executeWithSelfHealingProducts(
          async (prunedDbPayload) => {
            return await supabase.from('products').update(prunedDbPayload).eq('id', id);
          },
          dbPayload
        );
        
        const { error } = selfHealResult;
        if (error) {
          // Rollback on error
          set({ products: currentProducts });
          saveCachedProducts(currentProducts);
          broadcastSync.publish('products', currentProducts);
          console.error("Supabase update error:", error);
          throw new Error(error.message || "Failed to update product in database");
        }
      } catch (err: any) {
        // Rollback on error
        set({ products: currentProducts });
        saveCachedProducts(currentProducts);
        broadcastSync.publish('products', currentProducts);
        console.error("Product update exception:", err);
        throw new Error(err.message || "Failed to update product in database");
      }
    }
  },
  
  deleteProduct: async (id) => {
    const supabase = getSupabase();
    console.log(`[Supabase Log] Preparing to delete product document: products/${id}`);
    
    const currentProducts = get().products;
    const product = currentProducts.find(p => p.id === id);
    if (product) {
      try {
        const urlsToDelete = new Set<string>();
        if (product.image) urlsToDelete.add(product.image);
        if (product.imageUrl) urlsToDelete.add(product.imageUrl);
        if (product.featured_image) urlsToDelete.add(product.featured_image);
        if (product.banner_image) urlsToDelete.add(product.banner_image);
        if (product.images && Array.isArray(product.images)) {
          product.images.forEach(img => {
            if (img) urlsToDelete.add(img);
          });
        }
        
        // Execute background deletions securely
        Promise.all(Array.from(urlsToDelete).map(url => deleteImage(url)))
          .catch(err => console.warn("Failed to delete some product storage files:", err));
      } catch (importErr) {
        console.error("Failed to import imageUtils during deleteProduct:", importErr);
      }
    }
    
    // Optimistic Update
    const newProducts = currentProducts.filter(p => p.id !== id);
    set({ products: newProducts });
    saveCachedProducts(newProducts);
    broadcastSync.publish('products', newProducts);
    
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        // Rollback on error
        set({ products: currentProducts });
        saveCachedProducts(currentProducts);
        broadcastSync.publish('products', currentProducts);
        console.error("Supabase delete error:", error);
        throw new Error(error.message || "Failed to delete product from database");
      }
    }
  },
  
  subscribe: () => {
    // Start non-blocking directly from cache
    set({ isLoading: false });
    const supabase = getSupabase();
    
    if (!supabase) {
        set({ isLoaded: true });
        return () => {}; // No-op if not configured
    }
    
    const { url } = (window as any).getSupabaseCredentials?.() || {};
    console.log(`[Supabase Product Sync] Querying 'products' from: ${url || 'Injected Key'}`);
    
    // Direct, fast asynchronous fetch from the live database
    supabase.from('products').select('*').then(({ data, error, status, statusText }) => {
        if (!error && data) {
            console.log(`%c[Supabase Product Sync] SUCCESS: Fetched ${data.length} products. (HTTP ${status})`, "color: #10b981; font-weight: bold;");
            try {
              const mapped = data.map((row, index) => {
                try {
                  return mapDbToProduct(row);
                } catch (err) {
                  console.error(`[Supabase Product Sync] Mapping failed for row index ${index}:`, row, err);
                  throw err;
                }
              });
              
              set({ products: mapped, isLoading: false, isLoaded: true });
              saveCachedProducts(mapped);
            } catch (mapErr) {
              console.error("[Supabase Product Sync] Critical mapping error:", mapErr);
              set({ isLoaded: true });
            }
        } else if (error) {
            console.error("%c[Supabase Product Sync] FETCH ERROR:", "color: #ef4444; font-weight: bold;", {
              code: error.code,
              message: error.message,
              hint: (error as any).hint,
              details: (error as any).details,
              httpStatus: status,
              httpStatusText: statusText
            });
            set({ isLoaded: true });
        }
    }, (pErr) => {
        console.error("[Supabase Product Sync] CONNECTION ERROR:", pErr);
    });
 
    const channel = supabase
      .channel('public:products:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        // Real-time synchronization
        supabase.from('products').select('*').then(({ data, error }) => {
            if (!error && data) {
                const mapped = data.map(mapDbToProduct);
                set({ products: mapped });
                saveCachedProducts(mapped);
                broadcastSync.publish('products', mapped);
            }
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
