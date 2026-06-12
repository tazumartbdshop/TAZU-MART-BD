import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SupportBannerData {
  id: string;
  banner_image: string;
  heading: string;
  sub_heading: string;
  button_text: string;
  button_link: string;
  status: boolean;
  updated_at?: number;
}

const DEFAULT_BANNER: SupportBannerData = {
  id: 'main-banner',
  banner_image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2000',
  heading: 'How can we help you today?',
  sub_heading: 'Our dedicated support team is here to assist you 24/7 with any queries or concerns.',
  button_text: 'Track Order',
  button_link: '/orders',
  status: true
};

export const supportBannerService = {
  async getBanner(): Promise<SupportBannerData> {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'supportBanner'));
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SupportBannerData>;
        return { ...DEFAULT_BANNER, ...data };
      } else {
        // Automatically publish default support banner to Firestore if it does not exist
        await setDoc(doc(db, 'settings', 'supportBanner'), DEFAULT_BANNER);
        return DEFAULT_BANNER;
      }
    } catch (e) {
      console.error("Firestore getBanner failed, using fallback:", e);
      return DEFAULT_BANNER;
    }
  },

  async updateBanner(updates: Partial<SupportBannerData>): Promise<void> {
    try {
      const current = await this.getBanner();
      const updated = {
        ...current,
        ...updates,
        updated_at: Date.now()
      };
      await setDoc(doc(db, 'settings', 'supportBanner'), updated, { merge: true });
    } catch (e) {
      console.error("Firestore updateBanner failed:", e);
      throw e;
    }
  }
};
