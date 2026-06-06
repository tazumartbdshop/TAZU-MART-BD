import { collection, query, where, getDocs, limit } from 'firebase/firestore';
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
  
  fashion_button_name: string;
  fashion_link: string;
  fashion_color: string;
  fashion_status: boolean;
  
  facebook_button_name: string;
  facebook_link: string;
  facebook_status: boolean;

  linkPages: LinkPage[];
  
  updated_at?: number;
}

const STORAGE_KEY = 'site_management_settings';

const DEFAULT_DATA: SiteManagementData = {
  developer_button_name: 'Web Developer',
  developer_link: 'https://developer-site.com',
  developer_color: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
  developer_status: true,
  
  fashion_button_name: 'Visit Fashion Site',
  fashion_link: 'https://fashion-site.com',
  fashion_color: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
  fashion_status: true,
  
  facebook_button_name: 'Facebook Updates',
  facebook_link: 'https://facebook.com/page-name',
  facebook_status: true,
  linkPages: []
};

export const siteManagementService = {
  async getSettings(): Promise<SiteManagementData> {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_DATA;
      }
    }
    return DEFAULT_DATA;
  },

  async updateSettings(updates: Partial<SiteManagementData>): Promise<void> {
    const current = await this.getSettings();
    const updated = {
      ...current,
      ...updates,
      updated_at: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  async getLinkPages(): Promise<LinkPage[]> {
    const q = query(collection(db, 'link_pages'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LinkPage));
  },

  async saveLinkPage(page: LinkPage): Promise<void> {
    // Implement save logic, maybe add/update doc
    // For simplicity, using setDoc with id
    import('firebase/firestore').then(({ doc, setDoc }) => {
        setDoc(doc(db, 'link_pages', page.id || page.slug), page);
    });
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
      console.error('Error fetching link page:', e);
      return null;
    }
  }
};
