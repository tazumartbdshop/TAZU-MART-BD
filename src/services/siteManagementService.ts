import { getSupabase } from '../lib/supabase';

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

export interface CustomLink {
  id: string;
  name: string;
  url: string;
  status: boolean;
  logo: string;
}

export interface SiteManagementData {
  developer_button_name: string;
  developer_link: string;
  developer_logo: string;
  developer_status: boolean;
  
  fashion_button_name: string;
  fashion_link: string;
  fashion_logo: string;
  fashion_status: boolean;
  
  custom_links: CustomLink[];
  
  linkPages: LinkPage[];
  
  updated_at?: number;
}

const DEFAULT_DATA: SiteManagementData = {
  developer_button_name: 'Web Developer',
  developer_link: 'https://developer-site.com',
  developer_logo: '',
  developer_status: true,
  
  fashion_button_name: 'Visit Fashion Site',
  fashion_link: 'https://fashion-site.com',
  fashion_logo: '',
  fashion_status: true,
  
  custom_links: [],
  linkPages: []
};

export const siteManagementService = {
  async getSettings(): Promise<SiteManagementData> {
    const supabase = getSupabase();
    if (!supabase) return DEFAULT_DATA;
    
    try {
      const { data, error } = await supabase.from('site_management').select('*').eq('id', 'global').limit(1);
      if (data && data.length > 0) {
        return { ...DEFAULT_DATA, ...data[0] };
      } else {
        await supabase.from('site_management').upsert([{ id: 'global', ...DEFAULT_DATA }]);
        return DEFAULT_DATA;
      }
    } catch (e) {
      console.warn("Supabase getSettings failed, using defaults:", e);
      return DEFAULT_DATA;
    }
  },

  async updateSettings(updates: Partial<SiteManagementData>): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
      const current = await this.getSettings();
      const updated = {
        ...current,
        ...updates,
        updated_at: Date.now()
      };
      const { error } = await supabase.from('site_management').upsert([{ id: 'global', ...updated }]);
      if (error && error.code !== '42P01') throw error;
    } catch (e) {
      console.error("Supabase updateSettings failed:", e);
      throw e;
    }
  },

  async getLinkPages(): Promise<LinkPage[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase.from('link_pages').select('*');
      if (error && error.code !== '42P01') throw error;
      return (data || []) as LinkPage[];
    } catch (e) {
      console.error("Supabase getLinkPages failed:", e);
      return [];
    }
  },

  async saveLinkPage(page: LinkPage): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;
    
    try {
      const { error } = await supabase.from('link_pages').upsert([{ ...page }]);
      if (error && error.code !== '42P01') throw error;
    } catch (err) {
      console.error("Supabase saveLinkPage failed:", err);
      throw err;
    }
  },

  async getLinkPageBySlug(slug: string): Promise<LinkPage | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase.from('link_pages').select('*').eq('slug', slug).limit(1);
      if (error && error.code !== '42P01') throw error;
      
      if (!data || data.length === 0) {
        return null;
      }
      
      return data[0] as LinkPage;
    } catch (e) {
      console.error('Error fetching link page by slug in siteManagementService:', e);
      return null;
    }
  }
};
