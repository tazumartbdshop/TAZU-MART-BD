import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { deleteImage } from '../lib/imageUtils';

export interface Product {
  id: string;
  name: string;
  sku: string;
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
  seoPoints?: string[];
  variants?: { title: string; option: string; price: string }[];
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
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
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
  const getVal = (exactKey: string, snakeKey: string) => {
    if (row[exactKey] !== undefined) return row[exactKey];
    if (row[snakeKey] !== undefined) return row[snakeKey];
    return undefined;
  };

  return {
    ...row,
    id: row.id || '',
    name: row.name || '',
    sku: row.sku || '',
    category: row.category || '',
    price: Number(row.price || 0),
    discountPrice: getVal('discountPrice', 'discount_price'),
    stock: Number(row.stock || 0),
    image: getVal('image', 'image_url') || row.imageUrl || row.featured_image || '',
    imageUrl: getVal('imageUrl', 'image_url') || row.image || '',
    featured_image: getVal('featured_image', 'featured_image') || row.image || '',
    banner_image: getVal('banner_image', 'banner_image') || '',
    images: row.images || [],
    videoUrl: getVal('videoUrl', 'video_url') || row.mediaUrl || '',
    mediaUrl: getVal('mediaUrl', 'video_url') || row.videoUrl || '',
    rating: Number(row.rating || 4.5),
    reviews: Number(row.reviews || 0),
    isNew: row.isNew !== undefined ? row.isNew : (row.is_new !== undefined ? row.is_new : true),
    brand: row.brand || '',
    status: (row.status || 'active').toLowerCase(),
    description: row.description || '',
    createdAt: row.createdAt || (row.created_at ? new Date(row.created_at).getTime() : Date.now()),
    buyingPrice: getVal('buyingPrice', 'buying_price'),
    warranty: row.warranty || '',
    unitName: getVal('unitName', 'unit_name'),
    soldCount: Number(getVal('soldCount', 'sold_count') || 0),
    seoPoints: row.seoPoints || row.seo_points || [],
    variants: row.variants || [],
    shippingZones: row.shippingZones || row.shipping_zones || [],
    is_flash_sale: getVal('is_flash_sale', 'isFlashSale'),
    is_trending: getVal('is_trending', 'isTrending'),
    is_best_selling: getVal('is_best_selling', 'isBestSelling'),
    is_regular: getVal('is_regular', 'isRegular'),
    is_offer: getVal('is_offer', 'isOffer'),
    reward_coins: getVal('reward_coins', 'rewardCoins'),
    coin_enabled: getVal('coin_enabled', 'coinEnabled'),
    isDemo: !!row.isDemo,
    keywords: row.keywords || []
  };
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
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
  },
  
  addProduct: async (payload) => {
    const supabase = getSupabase();
    const id = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const keywords = generateKeywords(payload.name, payload.category, payload.brand, payload.description);
    const newProduct: Product = {
      ...payload,
      id,
      keywords,
      createdAt: Date.now(),
    };
    
    // Optimistic Update
    const currentProducts = get().products;
    set({ products: [...currentProducts, newProduct] });
    
    if (supabase) {
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) {
        // Rollback on error
        set({ products: currentProducts });
        console.error("Supabase insert error:", error);
        throw new Error(error.message || "Failed to add product to database");
      }
    }
  },
  
  updateProduct: async (id, payload) => {
    const supabase = getSupabase();
    console.log(`[Supabase Log] Preparing to update product document: products/${id}`);
    
    const currentProducts = get().products;
    const currentProduct = currentProducts.find(p => p.id === id);
    const finalPayload = { ...payload };

    if (
      payload.name !== undefined ||
      payload.category !== undefined ||
      payload.brand !== undefined ||
      payload.description !== undefined
    ) {
      const name = payload.name !== undefined ? payload.name : (currentProduct?.name || '');
      const category = payload.category !== undefined ? payload.category : (currentProduct?.category || '');
      const brand = payload.brand !== undefined ? payload.brand : (currentProduct?.brand || '');
      const description = payload.description !== undefined ? payload.description : (currentProduct?.description || '');
      finalPayload.keywords = generateKeywords(name, category, brand, description);
    }
    
    // Optimistic Update
    const updatedProducts = currentProducts.map(p => p.id === id ? { ...p, ...finalPayload } : p);
    set({ products: updatedProducts });
    
    if (supabase) {
      const { error } = await supabase.from('products').update(finalPayload).eq('id', id);
      if (error) {
        // Rollback on error
        set({ products: currentProducts });
        console.error("Supabase update error:", error);
        throw new Error(error.message || "Failed to update product in database");
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
    
    if (supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        // Rollback on error
        set({ products: currentProducts });
        console.error("Supabase delete error:", error);
        throw new Error(error.message || "Failed to delete product from database");
      }
    }
  },
  
  subscribe: () => {
    set({ isLoading: true });
    const supabase = getSupabase();
    
    if (!supabase) {
        set({ isLoading: false });
        return () => {}; // No-op if not configured
    }
    
    console.log("[Supabase Log] Initializing real-time subscription for collection 'products'");
    
    // Initial fetch
    supabase.from('products').select('*').then(({ data, error }) => {
        if (!error && data) {
            set({ products: data.map(mapDbToProduct), isLoading: false });
        } else if (error && error.code !== '42P01') {
            console.error("Failed to fetch products:", error);
            set({ isLoading: false });
        } else {
            set({ isLoading: false });
        }
    });

    const channel = supabase
      .channel('public:products:' + Math.random().toString(36).substring(2, 9))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        // Simple reload strategy on any change
        supabase.from('products').select('*').then(({ data, error }) => {
            if (!error && data) {
                set({ products: data.map(mapDbToProduct) });
            }
        });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
