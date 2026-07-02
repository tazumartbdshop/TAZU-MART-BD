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
      
      if (error) {
        console.warn("[Developer Log] Fetch settings failed (table might be missing):", error.message);
        return DEFAULT_DATA;
      }

      if (data && data.length > 0) {
        return { ...DEFAULT_DATA, ...data[0] };
      } else {
        const { error: insertError } = await supabase.from('site_management').upsert([{ id: 'global', ...DEFAULT_DATA }]);
        if (insertError) {
          console.warn("[Developer Log] Insert defaults failed:", insertError.message);
        }
        return DEFAULT_DATA;
      }
    } catch (e) {
      console.warn("[Developer Log] Supabase getSettings exception:", e);
      return DEFAULT_DATA;
    }
  },

  async updateSettings(updates: Partial<SiteManagementData>): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('System configuration error.');
    
    try {
      // Don't use getSettings here, as it might return DEFAULT_DATA if table is missing,
      // and we want to know if the table actually exists before upserting.
      
      // Let's first check if table exists by doing a simple select
      const { error: checkError } = await supabase.from('site_management').select('id').limit(1);
      
      if (checkError) {
        console.error("[Developer Log] Table check failed before update:", checkError.message);
        throw new Error('System synchronization failed. Please try again later.');
      }

      const current = await this.getSettings();
      const updated = {
        ...current,
        ...updates,
        updated_at: Date.now()
      };
      
      const { error } = await supabase.from('site_management').upsert([{ id: 'global', ...updated }]);
      
      if (error) {
        console.error("[Developer Log] Supabase upsert failed:", error.message);
        throw new Error('Failed to save settings. System error occurred.');
      }
    } catch (e: any) {
      console.error("[Developer Log] Supabase updateSettings exception:", e);
      // Ensure we never leak table/schema names to UI
      const safeErrorMessage = e.message?.includes('schema') || e.message?.includes('table') || e.message?.includes('relation') 
        ? 'Settings could not be saved. System synchronization failed.' 
        : (e.message || 'Settings could not be saved.');
      throw new Error(safeErrorMessage);
    }
  },

  async getLinkPages(): Promise<LinkPage[]> {
    const supabase = getSupabase();
    if (!supabase) return [];
    
    try {
      const { data, error } = await supabase.from('link_pages').select('*');
      if (error) {
        console.warn("[Developer Log] Fetch link_pages failed:", error.message);
        return [];
      }
      return (data || []) as LinkPage[];
    } catch (e) {
      console.error("[Developer Log] Supabase getLinkPages failed:", e);
      return [];
    }
  },

  async saveLinkPage(page: LinkPage): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('System configuration error.');
    
    try {
      const { error: checkError } = await supabase.from('link_pages').select('id').limit(1);
      if (checkError) {
        console.error("[Developer Log] Table check failed before saving link page:", checkError.message);
        throw new Error('System synchronization failed. Please try again later.');
      }

      const { error } = await supabase.from('link_pages').upsert([{ ...page }]);
      
      if (error) {
        console.error("[Developer Log] Supabase saveLinkPage failed:", error.message);
        throw new Error('Failed to save link page. System error occurred.');
      }
    } catch (e: any) {
      console.error("[Developer Log] Supabase saveLinkPage exception:", e);
      const safeErrorMessage = e.message?.includes('schema') || e.message?.includes('table') || e.message?.includes('relation') 
        ? 'Page could not be saved. System synchronization failed.' 
        : (e.message || 'Page could not be saved.');
      throw new Error(safeErrorMessage);
    }
  },

  async getLinkPageBySlug(slug: string): Promise<LinkPage | null> {
    const supabase = getSupabase();
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase.from('link_pages').select('*').eq('slug', slug).limit(1);
      if (error) {
        console.warn("[Developer Log] Fetch link page by slug failed:", error.message);
        return null;
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      return data[0] as LinkPage;
    } catch (e) {
      console.error('[Developer Log] Error fetching link page by slug:', e);
      return null;
    }
  }
};
