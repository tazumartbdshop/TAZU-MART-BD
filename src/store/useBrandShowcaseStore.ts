import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BrandShowcaseSlide {
  id: string;
  image: string;
  title: string;
  tagline?: string;
  redirectLink?: string;
  isActive: boolean;
  scheduledStart?: string; // Datetime ISO
  scheduledEnd?: string;   // Datetime ISO
}

interface BrandShowcaseState {
  slides: BrandShowcaseSlide[];
  autoScrollSpeed: number; // in milliseconds
  companyName: string;
  companySubtext: string;
  addSlide: (slide?: Partial<BrandShowcaseSlide>) => void;
  updateSlide: (id: string, updates: Partial<BrandShowcaseSlide>) => void;
  removeSlide: (id: string) => void;
  setConfig: (updates: Partial<{ autoScrollSpeed: number; companyName: string; companySubtext: string }>) => void;
}

export const useBrandShowcaseStore = create<BrandShowcaseState>()(
  persist(
    (set) => ({
      slides: [
        {
          id: 'slide-1',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
          title: 'EXQUISITE ARTISAN SELECTIONS',
          tagline: 'Step into a world of curated digital craftsmanship',
          redirectLink: '/categories',
          isActive: true,
        },
        {
          id: 'slide-2',
          image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
          title: 'MEMBERS ONLY VIP ACCORDS',
          tagline: 'Exclusive brand alignments with worldwide shipping',
          redirectLink: '/offers',
          isActive: true,
        },
      ],
      autoScrollSpeed: 4000,
      companyName: 'TAZU MART',
      companySubtext: 'Premium Ecommerce Platform',
      
      addSlide: (slide) => set((state) => ({
        slides: [
          ...state.slides,
          {
            id: Math.random().toString(36).substring(2, 9),
            image: '',
            title: 'NEW BRAND SLIDE',
            tagline: 'Curated premium quality item',
            redirectLink: '',
            isActive: true,
            ...slide
          }
        ]
      })),
      
      updateSlide: (id, updates) => set((state) => ({
        slides: state.slides.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      
      removeSlide: (id) => set((state) => ({
        slides: state.slides.filter((s) => s.id !== id)
      })),
      
      setConfig: (updates) => set((state) => ({
        ...state,
        ...updates
      }))
    }),
    {
      name: 'brand-showcase-storage',
    }
  )
);
