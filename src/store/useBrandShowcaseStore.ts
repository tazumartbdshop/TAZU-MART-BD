import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';
import { broadcastSync } from '../lib/broadcastSync';

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
  slides: [],
  autoScrollSpeed: 4000,
  companyName: 'TAZU MART',
  companySubtext: 'Premium Ecommerce Platform',
};

export const useBrandShowcaseStore = create<BrandShowcaseState>((set, get) => ({
  ...defaultState,
  isLoaded: false,
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) {
        set({ isLoaded: true });
        return () => {};
    }

    const loadSettings = async () => {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'brandShowcase').limit(1);
        if (!error && data && data.length > 0) {
            const dataObj = data[0];
            set({ 
              slides: dataObj.slides || defaultState.slides, 
              autoScrollSpeed: dataObj.autoScrollSpeed || defaultState.autoScrollSpeed,
              companyName: dataObj.companyName || defaultState.companyName,
              companySubtext: dataObj.companySubtext || defaultState.companySubtext,
              isLoaded: true 
            });
        } else if (!error && data && data.length === 0) {
            supabase.from('settings').upsert([{ id: 'brandShowcase', ...defaultState }]).then(({error}) => error && console.warn(error));
            set({ ...defaultState, isLoaded: true });
        } else {
            set({ isLoaded: true });
        }
    };
    
    loadSettings();
    
    const channel = supabase
      .channel('public:settings:brandShowcase')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.brandShowcase' }, () => {
         loadSettings();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
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
    broadcastSync.publish('brands', newSlides);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update({ slides: newSlides }).eq('id', 'brandShowcase').then(({error}) => error && console.warn(error));
    }
  },
  
  updateSlide: (id, updates) => {
    const state = get();
    const newSlides = state.slides.map((s) => s.id === id ? { ...s, ...updates } : s);
    set({ slides: newSlides });
    broadcastSync.publish('brands', newSlides);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update({ slides: newSlides }).eq('id', 'brandShowcase').then(({error}) => error && console.warn(error));
    }
  },
  
  removeSlide: (id) => {
    const state = get();
    const newSlides = state.slides.filter((s) => s.id !== id);
    set({ slides: newSlides });
    broadcastSync.publish('brands', newSlides);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update({ slides: newSlides }).eq('id', 'brandShowcase').then(({error}) => error && console.warn(error));
    }
  },
  
  setConfig: (updates) => {
    set((state) => {
      const nextState = { ...state, ...updates };
      // Broadcast entire slides list just to be safe, though config doesn't have its own type yet.
      return nextState;
    });
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('settings').update(updates).eq('id', 'brandShowcase').then(({error}) => error && console.warn(error));
    }
  }
}));
