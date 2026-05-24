import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  discountPrice?: number;
  stock: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  isNew: boolean;
  brand?: string;
  status: 'active' | 'draft';
  description?: string;
  createdAt: number;
  // New Fields
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
}

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  deleteProduct: (id: string) => void;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
}

// Initial mock data
const initialProducts: Product[] = [
  // Fashion
  { id: 'f1', name: 'Premium Cotton T-Shirt', sku: 'F-001', category: 'Fashion', price: 1200, discountPrice: 950, stock: 50, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 124, isNew: true, status: 'active', createdAt: Date.now(), soldCount: 450, is_flash_sale: true, is_trending: true, is_regular: true },
  { id: 'f2', name: 'Vintage Summer Hoodie', sku: 'F-002', category: 'Fashion', price: 2500, discountPrice: 1800, stock: 30, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 89, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 120, is_trending: true, is_regular: true },
  { id: 'f3', name: 'Casual Linen Shirt', sku: 'F-003', category: 'Fashion', price: 1800, stock: 45, image: 'https://images.unsplash.com/photo-1596755094514-f87034a264c7?w=500&auto=format&fit=crop&q=60', rating: 4.5, reviews: 56, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 85, is_best_selling: true, is_regular: true },
  { id: 'f4', name: 'Trendy Urban Sneakers', sku: 'F-004', category: 'Fashion', price: 4500, discountPrice: 3800, stock: 20, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 210, isNew: true, status: 'active', createdAt: Date.now(), soldCount: 520, is_flash_sale: true, is_best_selling: true, is_regular: true },
  { id: 'f5', name: 'Slim Fit Denim Jeans', sku: 'F-005', category: 'Fashion', price: 3200, stock: 25, image: 'https://images.unsplash.com/photo-1542272604-787c38355358?w=500&auto=format&fit=crop&q=60', rating: 4.6, reviews: 42, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 30, is_regular: true },
  { id: 'f6', name: 'Designer Leather Jacket', sku: 'F-006', category: 'Fashion', price: 8500, discountPrice: 7200, stock: 10, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=60', rating: 5.0, reviews: 15, isNew: true, status: 'active', createdAt: Date.now(), soldCount: 12, is_trending: true, is_regular: true },
  
  // Electronics
  { id: 'e1', name: 'Smart Watch Series 8', sku: 'E-001', category: 'Electronics', price: 5500, discountPrice: 4200, stock: 15, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 320, isNew: true, status: 'active', createdAt: Date.now(), soldCount: 840, is_flash_sale: true, is_trending: true, is_best_selling: true, is_regular: true },
  { id: 'e2', name: 'Pro Noise Cancelling Earbuds', sku: 'E-002', category: 'Electronics', price: 3500, stock: 40, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 150, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 230 },
  { id: 'e3', name: 'High Capacity Power Bank', sku: 'E-003', category: 'Electronics', price: 1800, discountPrice: 1500, stock: 60, image: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=500&auto=format&fit=crop&q=60', rating: 4.6, reviews: 85, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 1500 },
  { id: 'e4', name: 'Portable Bluetooth Speaker', sku: 'E-004', category: 'Electronics', price: 2800, stock: 35, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7ff?w=500&auto=format&fit=crop&q=60', rating: 4.5, reviews: 210, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 620 },
  { id: 'e5', name: 'Mechanical Gaming Keyboard', sku: 'E-005', category: 'Electronics', price: 4500, discountPrice: 3900, stock: 20, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 95, isNew: true, status: 'active', createdAt: Date.now(), soldCount: 45 },
  { id: 'e6', name: 'Wireless Ergonomic Mouse', sku: 'E-006', category: 'Electronics', price: 1500, stock: 50, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 120, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 310 },

  // Perfume
  { id: 'p1', name: 'Luxury Oud Wood Perfume', sku: 'P-001', category: 'Perfume', price: 6500, discountPrice: 5200, stock: 12, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 75, isNew: true, status: 'active', createdAt: Date.now(), soldCount: 245 },
  { id: 'p2', name: 'Signature Rose Attar', sku: 'P-002', category: 'Perfume', price: 1200, stock: 45, image: 'https://images.unsplash.com/photo-1615397323862-5e6616eb6e8b?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 45, isNew: false, status: 'active', createdAt: Date.now(), soldCount: 110 },
  { id: 'p3', name: 'Midnight Jasmine Cologne', sku: 'P-003', category: 'Perfume', price: 3500, discountPrice: 2800, stock: 20, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 110, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'p4', name: 'Ocean Breeze Eau de Toilette', sku: 'P-004', category: 'Perfume', price: 2200, stock: 30, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&auto=format&fit=crop&q=60', rating: 4.6, reviews: 65, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'p5', name: 'Golden Amber Essence', sku: 'P-005', category: 'Perfume', price: 4800, discountPrice: 4100, stock: 15, image: 'https://images.unsplash.com/photo-1595425970377-c9703c5ae120?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 124, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'p6', name: 'Velvet Musk Attar', sku: 'P-006', category: 'Perfume', price: 1500, stock: 55, image: 'https://images.unsplash.com/photo-1585120040315-2241b774ad0f?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 32, isNew: false, status: 'active', createdAt: Date.now() },

  // Wallet
  { id: 'w1', name: 'Classic Black Bi-fold Wallet', sku: 'W-001', category: 'Wallet', price: 1800, discountPrice: 1500, stock: 40, image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 85, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'w2', name: 'Premium Brown Leather Wallet', sku: 'W-002', category: 'Wallet', price: 2100, stock: 35, image: 'https://images.unsplash.com/photo-1590247813693-5541d1c609fd?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 56, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'w3', name: 'Minimalist Card Holder', sku: 'W-003', category: 'Wallet', price: 950, discountPrice: 750, stock: 100, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 120, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'w4', name: 'Handcrafted Vintage Wallet', sku: 'W-004', category: 'Wallet', price: 2800, stock: 20, image: 'https://images.unsplash.com/photo-1554403303-34e8579af954?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 24, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'w5', name: 'Carbon Fiber Smart Wallet', sku: 'W-005', category: 'Wallet', price: 4200, discountPrice: 3500, stock: 15, image: 'https://images.unsplash.com/photo-1620063259842-ae5935f4df8e?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 42, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'w6', name: 'Luxury Crocodile Text Wallet', sku: 'W-006', category: 'Wallet', price: 5500, stock: 8, image: 'https://images.unsplash.com/photo-1543789065-27a361546747?w=500&auto=format&fit=crop&q=60', rating: 5.0, reviews: 10, isNew: true, status: 'active', createdAt: Date.now() },

  // Leather Products
  { id: 'lp1', name: 'Premium Leather Double Belt', sku: 'LP-001', category: 'Leather Products', price: 2500, discountPrice: 2100, stock: 50, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 67, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'lp2', name: 'Executive Leather Briefcase', sku: 'LP-002', category: 'Leather Products', price: 9500, stock: 10, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 25, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'lp3', name: 'Leather Key Organizer', sku: 'LP-003', category: 'Leather Products', price: 850, stock: 80, image: 'https://images.unsplash.com/photo-1590736704170-8438676239f1?w=500&auto=format&fit=crop&q=60', rating: 4.5, reviews: 110, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'lp4', name: 'Suede Leather Casual Shoes', sku: 'LP-004', category: 'Leather Products', price: 4800, discountPrice: 3900, stock: 25, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 42, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'lp5', name: 'Leather Passport Holder', sku: 'LP-005', category: 'Leather Products', price: 1500, stock: 40, image: 'https://images.unsplash.com/photo-1601931551221-5f2122650cc8?w=500&auto=format&fit=crop&q=60', rating: 4.6, reviews: 30, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'lp6', name: 'Braided Leather Bracelet', sku: 'LP-006', category: 'Leather Products', price: 650, stock: 120, image: 'https://images.unsplash.com/photo-1573868388381-33161390457d?w=500&auto=format&fit=crop&q=60', rating: 4.4, reviews: 85, isNew: false, status: 'active', createdAt: Date.now() },

  // Home & Living
  { id: 'hl1', name: 'Modern Minimalist Wall Clock', sku: 'HL-001', category: 'Home & Living', price: 2200, discountPrice: 1800, stock: 30, image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 45, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'hl2', name: 'Aromatic Diffuser Lamp', sku: 'HL-002', category: 'Home & Living', price: 2800, stock: 25, image: 'https://images.unsplash.com/photo-1540316315620-d412027518a2?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 32, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'hl3', name: 'Premium Ceramic Vase Set', sku: 'HL-003', category: 'Home & Living', price: 3500, stock: 15, image: 'https://images.unsplash.com/photo-1578500484698-f3b17e38f0cd?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 18, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'hl4', name: 'Soft Velvet Cushion Pack', sku: 'HL-004', category: 'Home & Living', price: 1200, discountPrice: 990, stock: 40, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=500&auto=format&fit=crop&q=60', rating: 4.6, reviews: 110, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'hl5', name: 'Smart LED Desk Lamp', sku: 'HL-005', category: 'Home & Living', price: 1800, stock: 35, image: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=500&auto=format&fit=crop&q=60', rating: 4.5, reviews: 67, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'hl6', name: 'Exotic Scented Candle Set', sku: 'HL-006', category: 'Home & Living', price: 1500, stock: 50, image: 'https://images.unsplash.com/photo-1572726710708-17823f4255ca?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 89, isNew: false, status: 'active', createdAt: Date.now() },

  // Other categories
  { id: 'wb1', name: 'Smart Temperature Bottle', sku: 'WB-001', category: 'Water Bottle', price: 1500, discountPrice: 1200, stock: 100, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 112, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'wb2', name: 'Insulated Sports Flask', sku: 'WB-002', category: 'Water Bottle', price: 1800, stock: 80, image: 'https://images.unsplash.com/photo-1544003387-4223037f71d7?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 45, isNew: false, status: 'active', createdAt: Date.now() },
  { id: 'sg1', name: 'Virtual Reality Headset', sku: 'SG-001', category: 'Smart Gadgets', price: 8500, discountPrice: 6900, stock: 10, image: 'https://images.unsplash.com/photo-1592477976530-fa670719d8d4?w=500&auto=format&fit=crop&q=60', rating: 4.9, reviews: 25, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'bc1', name: 'Luxury Skincare Set', sku: 'BC-001', category: 'Beauty & Care', price: 4200, discountPrice: 3500, stock: 20, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=60', rating: 4.8, reviews: 67, isNew: true, status: 'active', createdAt: Date.now() },
  { id: 'ma1', name: 'Ultra-Fast Charger 65W', sku: 'MA-001', category: 'Mobile Accessories', price: 2200, stock: 50, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60', rating: 4.7, reviews: 150, isNew: false, status: 'active', createdAt: Date.now() },
];

export const useProductStore = create<ProductState>((set) => ({
  products: initialProducts,
  addProduct: (productPayload) => set((state) => {
    const newProduct: Product = {
      ...productPayload,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
    };
    return { products: [newProduct, ...state.products] }; // Newest first
  }),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),
  updateProduct: (id, updatedFields) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updatedFields } : p)
  }))
}));
