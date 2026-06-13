import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export interface SearchRecord {
  id: string; // lowerecased keyword
  keyword: string;
  category?: string;
  relatedProduct?: string;
  timestamp: number;
  count: number;
  isRead: boolean;
  hasResults?: boolean;
  resultCount?: number;
}

interface SearchState {
  searches: SearchRecord[];
  isLoading: boolean;
  addSearch: (keyword: string, hasResults: boolean, resultCount: number, category?: string, relatedProduct?: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearSearches: () => Promise<void>;
  subscribe: () => () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searches: [],
  isLoading: false,

  addSearch: async (keyword, hasResults, resultCount, category, relatedProduct) => {
    const cleanKeyword = keyword.trim();
    if (!cleanKeyword) return;
    const id = cleanKeyword.toLowerCase();

    const existing = get().searches.find(s => s.id === id);
    const count = existing ? (existing.count + 1) : 1;

    try {
      const supabase = getSupabase();
      if (supabase) {
          const payload = {
            id,
            keyword: cleanKeyword,
            category: category || existing?.category || '',
            relatedProduct: relatedProduct || existing?.relatedProduct || '',
            timestamp: Date.now(),
            count,
            isRead: false,
            hasResults,
            resultCount
          };
          const { error } = await supabase.from('searches').upsert([payload]);
          if (error) throw error;
      }
    } catch (error) {
       console.error('Error in addSearch Supabase:', error);
    }
  },

  markAsRead: async (id) => {
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('searches').update({ isRead: true }).eq('id', id);
          if (error) throw error;
      }
    } catch (error) {
       console.error('Error in markAsRead Supabase:', error);
    }
  },

  markAllAsRead: async () => {
    const { searches } = get();
    for (const search of searches) {
      if (!search.isRead) {
        try {
          const supabase = getSupabase();
          if (supabase) {
             const { error } = await supabase.from('searches').update({ isRead: true }).eq('id', search.id);
             if (error) throw error;
          }
        } catch (error) {
           console.error('Error in markAllAsRead Supabase:', error);
        }
      }
    }
  },

  clearSearches: async () => {
    const { searches } = get();
    for (const s of searches) {
      try {
          const supabase = getSupabase();
          if (supabase) {
             const { error } = await supabase.from('searches').delete().eq('id', s.id);
             if (error) throw error;
          }
      } catch (error) {
         console.error('Error in clearSearches Supabase:', error);
      }
    }
  },

  subscribe: () => {
    set({ isLoading: true });
    
    const supabase = getSupabase();
    if (!supabase) {
        set({ isLoading: false });
        return () => {};
    }

    const loadSearches = async () => {
        const { data, error } = await supabase.from('searches').select('*');
        if (!error && data) {
            set({ searches: data as SearchRecord[], isLoading: false });
        } else {
             set({ isLoading: false });
        }
    };
    
    loadSearches();
    
    const channel = supabase
      .channel('public:searches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'searches' }, () => {
         loadSearches();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }
}));
