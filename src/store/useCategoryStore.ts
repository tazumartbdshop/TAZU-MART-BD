import { create } from 'zustand';

export interface Category {
  id: string;
  name: string;
  bannerName: string;
  slug: string;
  bannerImage: string;
  bannerImages?: string[];
  iconImage?: string;
  description?: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  showOnHomepage: boolean;
  createdAt: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

interface CategoryState {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const initialCategories: Category[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    bannerName: 'PREMIUM FASHION COLLECTION',
    slug: 'fashion',
    bannerImage: 'https://images.unsplash.com/photo-1445205170230-053b830c6050?w=1200&auto=format&fit=crop&q=80',
    description: 'Discover the latest trends in clothing and accessories.',
    displayOrder: 1,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'electronics',
    name: 'Electronics',
    bannerName: 'NEXT-GEN ELECTRONICS',
    slug: 'electronics',
    bannerImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&auto=format&fit=crop&q=80',
    description: 'High-quality electronics and gadgets for your daily life.',
    displayOrder: 2,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'perfume',
    name: 'Perfume',
    bannerName: 'LUXURY FRAGRANCES',
    slug: 'perfume',
    bannerImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&auto=format&fit=crop&q=80',
    description: 'Premium scents that leave a lasting impression.',
    displayOrder: 3,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'wallet',
    name: 'Wallet',
    bannerName: 'PREMIUM LEATHER WALLETS',
    slug: 'wallet',
    bannerImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=1200&auto=format&fit=crop&q=80',
    description: 'Handcrafted leather wallets for elegance and durability.',
    displayOrder: 4,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'leather-products',
    name: 'Leather Products',
    bannerName: 'HANDCRAFTED LEATHER GOODS',
    slug: 'leather-products',
    bannerImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&auto=format&fit=crop&q=80',
    description: 'High-quality leather belts, bags, and more.',
    displayOrder: 5,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mobile-accessories',
    name: 'Mobile Accessories',
    bannerName: 'ESSENTIAL MOBILE GADGETS',
    slug: 'mobile-accessories',
    bannerImage: 'https://images.unsplash.com/photo-1522273500616-6b4757e4c184?w=1200&auto=format&fit=crop&q=80',
    description: 'Enhance your mobile experience with premium accessories.',
    displayOrder: 6,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    bannerName: 'MODERN HOME ESSENTIALS',
    slug: 'home-living',
    bannerImage: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&auto=format&fit=crop&q=80',
    description: 'Beautify your home with our unique collection.',
    displayOrder: 7,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'beauty-care',
    name: 'Beauty & Care',
    bannerName: 'PREMIUM BEAUTY PRODUCTS',
    slug: 'beauty-care',
    bannerImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80',
    description: 'Care for yourself with our premium beauty range.',
    displayOrder: 8,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'smart-gadgets',
    name: 'Smart Gadgets',
    bannerName: 'INNOVATIVE SMART GADGETS',
    slug: 'smart-gadgets',
    bannerImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&auto=format&fit=crop&q=80',
    description: 'The future of technology in the palm of your hand.',
    displayOrder: 9,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    bannerName: 'PREMIUM HYDRATION SERIES',
    slug: 'water-bottle',
    bannerImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200&auto=format&fit=crop&q=80',
    description: 'Stay hydrated with our stylish and durable bottles.',
    displayOrder: 10,
    status: 'Active',
    showOnHomepage: true,
    createdAt: new Date().toISOString(),
  }
];

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: initialCategories,
  addCategory: (payload) => set((state) => ({
    categories: [
      {
        ...payload,
        id: Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      },
      ...state.categories
    ]
  })),
  updateCategory: (id, payload) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...payload } : c)
  })),
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  }))
}));
