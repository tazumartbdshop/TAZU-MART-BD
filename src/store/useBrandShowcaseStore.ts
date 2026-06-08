import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
  isLoaded: boolean;
  subscribe: () => () => void;
  addSlide: (slide?: Partial<BrandShowcaseSlide>) => void;
  updateSlide: (id: string, updates: Partial<BrandShowcaseSlide>) => void;
  removeSlide: (id: string) => void;
  setConfig: (updates: Partial<{ autoScrollSpeed: number; companyName: string; companySubtext: string }>) => void;
}

const defaultState = {
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
};

export const useBrandShowcaseStore = create<BrandShowcaseState>((set, get) => ({
  ...defaultState,
  isLoaded: false,
  subscribe: () => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'brandShowcase'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        set({ 
          slides: data.slides || defaultState.slides, 
          autoScrollSpeed: data.autoScrollSpeed || defaultState.autoScrollSpeed,
          companyName: data.companyName || defaultState.companyName,
          companySubtext: data.companySubtext || defaultState.companySubtext,
          isLoaded: true 
        });
      } else {
        setDoc(doc(db, 'settings', 'brandShowcase'), defaultState).then(() => {
          set({ ...defaultState, isLoaded: true });
        }).catch(err => console.error("Initial brand showcase seed failed", err));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/brandShowcase');
    });
    return unsubscribe;
  },
  addSlide: (slide) => {
    const state = get();
    const newSlides = [
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
    ];
    set({ slides: newSlides });
    setDoc(doc(db, 'settings', 'brandShowcase'), { slides: newSlides }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/brandShowcase'));
  },
  
  updateSlide: (id, updates) => {
    const state = get();
    const newSlides = state.slides.map((s) => s.id === id ? { ...s, ...updates } : s);
    set({ slides: newSlides });
    setDoc(doc(db, 'settings', 'brandShowcase'), { slides: newSlides }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/brandShowcase'));
  },
  
  removeSlide: (id) => {
    const state = get();
    const newSlides = state.slides.filter((s) => s.id !== id);
    set({ slides: newSlides });
    setDoc(doc(db, 'settings', 'brandShowcase'), { slides: newSlides }, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/brandShowcase'));
  },
  
  setConfig: (updates) => {
    set((state) => ({ ...state, ...updates }));
    setDoc(doc(db, 'settings', 'brandShowcase'), updates, { merge: true })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, 'settings/brandShowcase'));
  }
}));
