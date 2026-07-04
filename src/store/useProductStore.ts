import { create } from 'zustand';

export interface Product {
  id: string;
  slug?: string;
  name: string;
  sku: string;
  sku_code?: string; // mapping
  category_id?: number;
  category?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  image?: string;
  imageUrl?: string; // mapping
  featured_image?: string; // mapping
  images?: string[];
  description?: string;
  status?: string;
  is_active?: boolean;
  is_flash_sale?: boolean;
  is_trending?: boolean;
  is_best_selling?: boolean;
  is_offer?: boolean;
  isNew?: boolean;
  is_regular?: boolean;
  banner_image?: string;
  videoUrl?: string;
  soldCount?: number;
  rating?: number;
  reviews?: any[];
  brand?: string;
  warranty?: string;
  seoPoints?: number;
  keywords?: string;
  reward_coins?: number;
  coin_enabled?: boolean;
  variants?: any[];
  shippingZones?: any[];
  buyingPrice?: number;
  unitName?: string;
  created_at?: string;
  createdAt?: string; // mapping
  isDemo?: boolean;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  isLoaded: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, updates: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  subscribe: () => () => void;
  clearDemoData: () => void;
  autoRankTrending?: () => void;
  autoRankBestSellers?: () => void;
}

export const generateKeywords = (...args: string[]) => {
  return args.filter(Boolean).map(s => s.toLowerCase()).join(', ');
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  isLoaded: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      const mapped = data.map((p: any) => ({
        ...p,
        id: String(p.id),
        discountPrice: p.discount_price,
        imageUrl: p.image,
        featured_image: p.image,
        createdAt: p.created_at,
        sku_code: p.sku,
        images: p.images || (p.image ? [p.image] : [])
      }));
      set({ products: mapped, isLoaded: true });
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (payload) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        get().fetchProducts();
      }
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        get().fetchProducts();
      }
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        get().fetchProducts();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  },

  subscribe: () => {
    get().fetchProducts();
    return () => {};
  },

  clearDemoData: () => set({ products: [] }),
  autoRankTrending: () => {},
  autoRankBestSellers: () => {}
}));
