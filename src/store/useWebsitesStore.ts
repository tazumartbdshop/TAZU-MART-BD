import { create } from 'zustand';
import { getSupabase } from '../lib/supabase';

export interface DynamicWebsite {
  domain: string;
  website_name: string;
  business_name: string;
  logo: string;
  banner: string;
  primary_color: string;
  admin_email: string;
  admin_password: string;
  support_number: string;
  categories: string[];
  theme_type: string;
  currency: string;
  address: string;
  status: 'Active' | 'Maintenance' | 'Suspended';
  createdAt: string;
}

interface WebsitesStore {
  websites: DynamicWebsite[];
  addWebsite: (website: DynamicWebsite) => Promise<void>;
  getWebsiteByDomain: (domain: string) => DynamicWebsite | undefined;
  removeWebsite: (domain: string) => Promise<void>;
  updateWebsite: (domain: string, updates: Partial<DynamicWebsite>) => Promise<void>;
  subscribe: () => () => void;
}

const STORAGE_KEY = 'dynamic_websites_data';

// Helper to sanitize domain
const sanitizeDomain = (domain: string) => {
  return domain.toLowerCase().trim().replace(/[^a-z0-9.-]/g, '');
};

const DEFAULT_WEBSITES: DynamicWebsite[] = [
  {
    domain: 'digitalexpress.com.bd',
    website_name: 'Digital Express Store',
    business_name: 'Digital Express Tech Ltd',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
    primary_color: '#2563eb',
    admin_email: 'admin@digitalexpress.com',
    admin_password: 'adminpassword',
    support_number: '+8801712345678',
    categories: ['Smartphone', 'Laptop', 'Smartwatch', 'Accessories'],
    theme_type: 'Sharp Corners (Square)',
    currency: 'BDT',
    address: 'Pragati Sarani, Kuril, Dhaka, Bangladesh',
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    domain: 'nova-agency.co',
    website_name: 'Creative Agency Nova',
    business_name: 'Nova Creative Hub',
    logo: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1441996607285-ed334f6c101b?w=1200&q=80',
    primary_color: '#16a34a',
    admin_email: 'info@nova-agency.co',
    admin_password: 'novapassword',
    support_number: '+8801912345678',
    categories: ['Design', 'Marketing', 'Development'],
    theme_type: 'Rounded Corners',
    currency: 'USD',
    address: 'Gulshan 2, Dhaka, Bangladesh',
    status: 'Active',
    createdAt: new Date().toISOString()
  },
  {
    domain: 'foodie-eats.app',
    website_name: 'Foodie Eats Hub',
    business_name: 'Foodie Eats Restaurant',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80',
    banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    primary_color: '#dc2626',
    admin_email: 'chef@foodie.com',
    admin_password: 'chefpassword',
    support_number: '+8801812345678',
    categories: ['Fast Food', 'Dessert', 'Drinks', 'Platters'],
    theme_type: 'Pill Shape',
    currency: 'BDT',
    address: 'Dhanmondi, Dhaka, Bangladesh',
    status: 'Maintenance',
    createdAt: new Date().toISOString()
  }
];

const loadWebsites = (): DynamicWebsite[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error loading websites', e);
    }
  }
  return DEFAULT_WEBSITES;
};

export const useWebsitesStore = create<WebsitesStore>((set, get) => ({
  websites: loadWebsites(),
  
  subscribe: () => {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    const loadData = async () => {
        const { data, error } = await supabase.from('websites').select('*');
        if (!error && data) {
            set({ websites: data as DynamicWebsite[] });
        }
    };
    
    loadData();
    
    const channel = supabase
      .channel('public:websites')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'websites' }, () => {
         loadData();
      })
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  },

  addWebsite: async (website) => {
    const sanitizedDomain = sanitizeDomain(website.domain);
    const newWebsite = { ...website, domain: sanitizedDomain };
    
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('websites').insert([newWebsite]);
          if(error) throw error;
      }
    } catch (e) {
      console.error('Error adding website:', e);
      throw e;
    }

    const current = get().websites;
    const filtered = current.filter(w => sanitizeDomain(w.domain) !== sanitizedDomain);
    const updated = [newWebsite, ...filtered];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ websites: updated });
  },

  getWebsiteByDomain: (domain) => {
    const sanitized = sanitizeDomain(domain);
    const found = get().websites.find(w => sanitizeDomain(w.domain) === sanitized);
    if (!found) {
      // Return a default dynamic website structure for any generic route parameter
      return {
        domain: sanitized,
        website_name: sanitized.toUpperCase().replace(/[.-]/g, ' '),
        business_name: sanitized.toUpperCase().replace(/[.-]/g, ' ') + ' BD',
        logo: '',
        banner: '',
        primary_color: '#000000',
        admin_email: 'admin@' + sanitized,
        admin_password: '12345678',
        support_number: '+8801700000000',
        categories: ['Gadgets', 'Clothing', 'Grocery'],
        theme_type: 'Sharp Corners (Square)',
        currency: 'BDT',
        address: 'Dhaka, Bangladesh',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
    }
    return found;
  },

  removeWebsite: async (domain) => {
    const sanitized = sanitizeDomain(domain);
    
    try {
      const supabase = getSupabase();
      if (supabase) {
          const { error } = await supabase.from('websites').delete().eq('domain', sanitized);
          if (error) throw error;
      }
    } catch (e) {
      console.error('Error deleting website:', e);
      throw e;
    }

    const updated = get().websites.filter(w => sanitizeDomain(w.domain) !== sanitized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ websites: updated });
  },

  updateWebsite: async (domain, updates) => {
    const sanitized = sanitizeDomain(domain);
    const target = get().websites.find(w => sanitizeDomain(w.domain) === sanitized);
    if (target) {
      const updatedWebsite = { ...target, ...updates };
      try {
        const supabase = getSupabase();
        if (supabase) {
             const { error } = await supabase.from('websites').update(updates).eq('domain', sanitized);
             if (error) throw error;
        }
      } catch (e) {
        console.error('Error updating website:', e);
        throw e;
      }
    }

    const updated = get().websites.map(w => {
      if (sanitizeDomain(w.domain) === sanitized) {
        return { ...w, ...updates };
      }
      return w;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ websites: updated });
  }
}));
