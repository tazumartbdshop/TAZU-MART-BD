import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
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

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  autoRankTrending: () => {
    const products = get().products;
    const sorted = [...products].sort((a, b) => (b.reviews || 0) * (b.rating || 0) - (a.reviews || 0) * (a.rating || 0));
    sorted.slice(0, 5).forEach(p => {
      get().updateProduct(p.id, { is_trending: true });
    });
  },
  autoRankBestSellers: () => {
    const products = get().products;
    const sorted = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    sorted.slice(0, 5).forEach(p => {
      get().updateProduct(p.id, { is_best_selling: true });
    });
  },
  clearDemoData: () => {
    const nonDemo = get().products.filter(p => !p.isDemo);
    set({ products: nonDemo });
  },
  
  addProduct: async (payload) => {
    const id = doc(collection(db, 'waV2UZ8TS38mSAwaYpFf')).id;
    try {
      const keywords = generateKeywords(payload.name, payload.category, payload.brand, payload.description);
      const newProduct: Product = {
        ...payload,
        id,
        keywords,
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'waV2UZ8TS38mSAwaYpFf', id), newProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `waV2UZ8TS38mSAwaYpFf/${id}`);
      throw error;
    }
  },
  
  updateProduct: async (id, payload) => {
    try {
      const currentProduct = get().products.find(p => p.id === id);
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
      
      await setDoc(doc(db, 'waV2UZ8TS38mSAwaYpFf', id), finalPayload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `waV2UZ8TS38mSAwaYpFf/${id}`);
      throw error;
    }
  },
  
  deleteProduct: async (id) => {
    try {
      const product = get().products.find(p => p.id === id);
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
      await deleteDoc(doc(db, 'waV2UZ8TS38mSAwaYpFf', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `waV2UZ8TS38mSAwaYpFf/${id}`);
      throw error;
    }
  },
  
  subscribe: () => {
    const q = query(collection(db, 'waV2UZ8TS38mSAwaYpFf'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      set({ products });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'waV2UZ8TS38mSAwaYpFf');
    });
    return unsubscribe;
  }
}));
