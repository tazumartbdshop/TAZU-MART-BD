import { create } from 'zustand';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export type DiscountType = 'Percentage' | 'Fixed Amount';

export interface PromoCode {
  id: string;
  name: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'Active' | 'Inactive';
  createdAt: number;
}

interface PromoStore {
  promoCodes: PromoCode[];
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usedCount' | 'createdAt'>) => Promise<void>;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;
  incrementPromoUsedCount: (id: string) => Promise<void>;
}

export const usePromoStore = create<PromoStore>()((set, get) => ({
  promoCodes: [],
  addPromoCode: async (promo) => {
    try {
      const docId = promo.code.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const newPromo: PromoCode = {
        ...promo,
        id: docId || Math.random().toString(36).substring(2, 9),
        usedCount: 0,
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'promo_codes', newPromo.id), newPromo);
    } catch (err) {
      console.error('Error adding promo code to Firestore:', err);
    }
  },
  updatePromoCode: async (id, updates) => {
    try {
      const promoRef = doc(db, 'promo_codes', id);
      await updateDoc(promoRef, updates);
    } catch (err) {
      console.error('Error updating promo code in Firestore:', err);
    }
  },
  deletePromoCode: async (id) => {
    try {
      const promoRef = doc(db, 'promo_codes', id);
      await deleteDoc(promoRef);
    } catch (err) {
      console.error('Error deleting promo code from Firestore:', err);
    }
  },
  incrementPromoUsedCount: async (id) => {
    try {
      const codes = get().promoCodes;
      const found = codes.find(c => c.id === id);
      if (found) {
        const promoRef = doc(db, 'promo_codes', id);
        await updateDoc(promoRef, {
          usedCount: (found.usedCount || 0) + 1
        });
      }
    } catch (err) {
      console.error('Error incrementing promo used count in Firestore:', err);
    }
  }
}));

// Setup Real-Time Sync Listener for Promo Codes
onSnapshot(collection(db, 'promo_codes'), (snapshot) => {
  if (snapshot.empty) {
    // Seed default codes to Firestore if the collection doesn't exist or is empty
    const initialPromos: PromoCode[] = [
      {
        id: 'SAVE100',
        name: 'Save 100 Taka Promo',
        code: 'SAVE100',
        type: 'Fixed Amount',
        value: 100,
        minOrder: 1000,
        expiryDate: '2026-12-31',
        usageLimit: 200,
        usedCount: 0,
        status: 'Active',
        createdAt: Date.now(),
      },
      {
        id: 'WELCOME50',
        name: 'New Customer Welcome',
        code: 'WELCOME50',
        type: 'Fixed Amount',
        value: 50,
        minOrder: 500,
        expiryDate: '2026-12-31',
        usageLimit: 500,
        usedCount: 0,
        status: 'Active',
        createdAt: Date.now(),
      },
      {
        id: 'SAVE10',
        name: 'Mega 10 Percent Save',
        code: 'SAVE10',
        type: 'Percentage',
        value: 10,
        minOrder: 1000,
        expiryDate: '2026-12-31',
        usageLimit: 100,
        usedCount: 0,
        status: 'Active',
        createdAt: Date.now(),
      }
    ];
    initialPromos.forEach(async (p) => {
      try {
        await setDoc(doc(db, 'promo_codes', p.id), p);
      } catch (err) {
        console.error('Seed promo code error:', err);
      }
    });
    return;
  }

  const list: PromoCode[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    list.push({
      id: docSnap.id,
      name: data.name || data.code,
      code: data.code || docSnap.id,
      type: data.type || 'Fixed Amount',
      value: Number(data.value) || 0,
      minOrder: Number(data.minOrder) || 0,
      expiryDate: data.expiryDate || '',
      usageLimit: Number(data.usageLimit) || 0,
      usedCount: Number(data.usedCount) || 0,
      status: data.status || 'Active',
      createdAt: data.createdAt || Date.now(),
    } as PromoCode);
  });
  
  // Update the Zustand store instance with the Firestore synchronized documents list
  usePromoStore.setState({ promoCodes: list });
}, (error) => {
  handleFirestoreError(error, OperationType.GET, 'promo_codes');
});
