import { collection, query, where, getDocs, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface LinkPage {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  title: string;
  description: string;
  content: string;
  image: string;
  banner: string;
  titleColor: string;
  contentColor: string;
  backgroundColor: string;
  buttonColor: string;
  fontSize: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

export interface SiteManagementData {
  developer_button_name: string;
  developer_link: string;
  developer_color: string;
  developer_status: boolean;
  developer_new_tab: boolean;
  developer_webview: boolean;
  
  fashion_button_name: string;
  fashion_link: string;
  fashion_color: string;
  fashion_status: boolean;
  fashion_new_tab: boolean;
  fashion_webview: boolean;
  
  facebook_button_name: string;
  facebook_link: string;
  facebook_status: boolean;
  facebook_new_tab: boolean;
  facebook_webview: boolean;
  
  facebook_feed_enabled?: boolean;
  facebook_posts_per_load?: number;
  facebook_auto_refresh?: boolean;
  facebook_feed_title?: string;
  facebook_show_header?: boolean;
  facebook_show_cover?: boolean;

  linkPages: LinkPage[];
  
  updated_at?: number;
}

const DEFAULT_DATA: SiteManagementData = {
  developer_button_name: 'Web Developer',
  developer_link: 'https://developer-site.com',
  developer_color: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
  developer_status: true,
  developer_new_tab: true,
  developer_webview: false,
  
  fashion_button_name: 'Visit Fashion Site',
  fashion_link: 'https://fashion-site.com',
  fashion_color: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
  fashion_status: true,
  fashion_new_tab: true,
  fashion_webview: false,
  
  facebook_button_name: 'Facebook Updates',
  facebook_link: 'https://www.facebook.com/facebook',
  facebook_status: true,
  facebook_new_tab: false,
  facebook_webview: false,
  
  facebook_feed_enabled: true,
  facebook_posts_per_load: 10,
  facebook_auto_refresh: true,
  facebook_feed_title: 'Facebook Updates',
  facebook_show_header: true,
  facebook_show_cover: true,
  
  linkPages: []
};

export const siteManagementService = {
  async getSettings(): Promise<SiteManagementData> {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'siteManagement'));
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<SiteManagementData>;
        return { ...DEFAULT_DATA, ...data };
      } else {
        // Automatically publish default settings to Firestore if does not exist
        await setDoc(doc(db, 'settings', 'siteManagement'), DEFAULT_DATA);
        return DEFAULT_DATA;
      }
    } catch (e) {
      console.warn("Firestore getSettings failed, using defaults:", e);
      return DEFAULT_DATA;
    }
  },

  async updateSettings(updates: Partial<SiteManagementData>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = {
        ...current,
        ...updates,
        updated_at: Date.now()
      };
      await setDoc(doc(db, 'settings', 'siteManagement'), updated, { merge: true });
    } catch (e) {
      console.error("Firestore updateSettings failed:", e);
      throw e;
    }
  },

  async getLinkPages(): Promise<LinkPage[]> {
    try {
      const q = query(collection(db, 'link_pages'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LinkPage));
    } catch (e) {
      console.error("Firestore getLinkPages failed:", e);
      return [];
    }
  },

  async saveLinkPage(page: LinkPage): Promise<void> {
    try {
      await setDoc(doc(db, 'link_pages', page.id || page.slug), page);
    } catch (err) {
      console.error("Firestore saveLinkPage failed:", err);
      throw err;
    }
  },

  async getLinkPageBySlug(slug: string): Promise<LinkPage | null> {
    try {
      const q = query(collection(db, 'link_pages'), where('slug', '==', slug), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as LinkPage;
    } catch (e) {
      console.error('Error fetching link page by slug in siteManagementService:', e);
      return null;
    }
  }
};
