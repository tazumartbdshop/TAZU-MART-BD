import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

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

    const docRef = doc(db, 'searches', id);
    try {
      await setDoc(docRef, {
        id,
        keyword: cleanKeyword,
        category: category || existing?.category || '',
        relatedProduct: relatedProduct || existing?.relatedProduct || '',
        timestamp: Date.now(),
        count,
        isRead: false,
        hasResults,
        resultCount
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `searches/${id}`);
    }
  },

  markAsRead: async (id) => {
    const docRef = doc(db, 'searches', id);
    try {
      await setDoc(docRef, { isRead: true }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `searches/${id}`);
    }
  },

  markAllAsRead: async () => {
    const { searches } = get();
    for (const search of searches) {
      if (!search.isRead) {
        const docRef = doc(db, 'searches', search.id);
        try {
          await setDoc(docRef, { isRead: true }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `searches/${search.id}`);
        }
      }
    }
  },

  clearSearches: async () => {
    const { searches } = get();
    for (const s of searches) {
      try {
        await deleteDoc(doc(db, 'searches', s.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `searches/${s.id}`);
      }
    }
  },

  subscribe: () => {
    set({ isLoading: true });
    const q = query(collection(db, 'searches'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const searches = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          keyword: data.keyword || doc.id,
          category: data.category || '',
          relatedProduct: data.relatedProduct || '',
          timestamp: data.timestamp || Date.now(),
          count: data.count || 1,
          isRead: data.isRead !== undefined ? data.isRead : false,
          hasResults: data.hasResults !== undefined ? data.hasResults : true,
          resultCount: data.resultCount !== undefined ? data.resultCount : 1,
        } as SearchRecord;
      });
      set({ searches, isLoading: false });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'searches');
    });
    return unsubscribe;
  }
}));
