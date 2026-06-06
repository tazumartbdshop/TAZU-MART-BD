import { create } from 'zustand';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export interface PopupOffer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  productId: string; // Direct Linked Product ID
  categoryId: string; // Optional Category Select (Popup triggers for products in this category)
  bannerUrl: string; // Ratio 1:1 Crop
  primaryButtonText: string; // Default: 'Buy Now'
  secondaryButtonText: string; // Default: 'Skip Deal'
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: 'Draft' | 'Published' | 'Expired';
  views: number;
  buyNowClicks: number;
  skipClicks: number;
  createdAt: number;
}

interface PopupOfferStore {
  popupOffers: PopupOffer[];
  addPopupOffer: (offer: Omit<PopupOffer, 'id' | 'views' | 'buyNowClicks' | 'skipClicks' | 'createdAt'>) => Promise<void>;
  updatePopupOffer: (id: string, updates: Partial<PopupOffer>) => Promise<void>;
  deletePopupOffer: (id: string) => Promise<void>;
  incrementViews: (id: string) => Promise<void>;
  incrementBuyNowClicks: (id: string) => Promise<void>;
  incrementSkipClicks: (id: string) => Promise<void>;
}

export const usePopupOfferStore = create<PopupOfferStore>()((set, get) => ({
  popupOffers: [],
  
  addPopupOffer: async (offer) => {
    try {
      const docId = `popup-${Date.now()}`;
      const newOffer: PopupOffer = {
        ...offer,
        id: docId,
        views: 0,
        buyNowClicks: 0,
        skipClicks: 0,
        createdAt: Date.now(),
      };
      await setDoc(doc(db, 'popup_offers', docId), newOffer);
    } catch (err) {
      console.error('Error adding popup offer to Firestore:', err);
    }
  },

  updatePopupOffer: async (id, updates) => {
    try {
      const offerRef = doc(db, 'popup_offers', id);
      await updateDoc(offerRef, updates);
    } catch (err) {
      console.error('Error updating popup offer in Firestore:', err);
    }
  },

  deletePopupOffer: async (id) => {
    try {
      const offerRef = doc(db, 'popup_offers', id);
      await deleteDoc(offerRef);
    } catch (err) {
      console.error('Error deleting popup offer from Firestore:', err);
    }
  },

  incrementViews: async (id) => {
    try {
      const offerRef = doc(db, 'popup_offers', id);
      await updateDoc(offerRef, {
        views: increment(1)
      });
    } catch (err) {
      console.error('Error incrementing views for popup offer:', err);
    }
  },

  incrementBuyNowClicks: async (id) => {
    try {
      const offerRef = doc(db, 'popup_offers', id);
      await updateDoc(offerRef, {
        buyNowClicks: increment(1)
      });
    } catch (err) {
      console.error('Error incrementing Buy Now clicks for popup offer:', err);
    }
  },

  incrementSkipClicks: async (id) => {
    try {
      const offerRef = doc(db, 'popup_offers', id);
      await updateDoc(offerRef, {
        skipClicks: increment(1)
      });
    } catch (err) {
      console.error('Error incrementing Skip clicks for popup offer:', err);
    }
  }
}));

// Setup Real-time listener
onSnapshot(collection(db, 'popup_offers'), (snapshot) => {
  if (snapshot.empty) {
    // Seed default welcome offer
    const defaultOffer: PopupOffer = {
      id: 'popup-default',
      title: 'Daraz Weekly Surprise Offer',
      subtitle: 'EXCLUSIVE MEGA DISCOUNT',
      description: 'Grab our special selected super deal today before the stock runs out. Limited times only!',
      productId: '', // empty originally until products are mapped
      categoryId: '', // empty originally
      bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600', // high quality square banner
      primaryButtonText: 'Buy Now',
      secondaryButtonText: 'Skip Deal',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Published',
      views: 154,
      buyNowClicks: 42,
      skipClicks: 112,
      createdAt: Date.now()
    };
    
    setDoc(doc(db, 'popup_offers', defaultOffer.id), defaultOffer)
      .catch((err) => console.error('Error seeding default popup offer:', err));
    return;
  }

  const list: PopupOffer[] = [];
  snapshot.forEach((snap) => {
    const data = snap.data();
    list.push({
      id: snap.id,
      title: data.title || '',
      subtitle: data.subtitle || '',
      description: data.description || '',
      productId: data.productId || '',
      categoryId: data.categoryId || '',
      bannerUrl: data.bannerUrl || '',
      primaryButtonText: data.primaryButtonText || 'Buy Now',
      secondaryButtonText: data.secondaryButtonText || 'Skip Deal',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: data.status || 'Draft',
      views: Number(data.views) || 0,
      buyNowClicks: Number(data.buyNowClicks) || 0,
      skipClicks: Number(data.skipClicks) || 0,
      createdAt: data.createdAt || Date.now()
    } as PopupOffer);
  });

  // Sort by newest
  list.sort((a,b) => b.createdAt - a.createdAt);

  usePopupOfferStore.setState({ popupOffers: list });
}, (error) => {
  handleFirestoreError(error, OperationType.GET, 'popup_offers');
});
