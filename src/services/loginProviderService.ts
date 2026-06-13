import { getSupabase } from '../lib/supabase';

export interface LoginProvider {
  id: string; // e.g. 'google', 'facebook', 'email_password'
  name: string;
  enabled: boolean;
  order: number;
  color: string;
  textColor?: string;
  icon?: string;
}

export const defaultProviders: LoginProvider[] = [
  { id: 'google', name: 'Google', enabled: false, order: 1, color: '#EA4335', textColor: '#FFFFFF' },
  { id: 'facebook', name: 'Facebook', enabled: false, order: 2, color: '#1877F2', textColor: '#FFFFFF' },
  { id: 'apple', name: 'Apple', enabled: false, order: 3, color: '#000000', textColor: '#FFFFFF' },
  { id: 'microsoft', name: 'Microsoft', enabled: false, order: 4, color: '#00A4EF', textColor: '#FFFFFF' },
  { id: 'github', name: 'GitHub', enabled: false, order: 5, color: '#333333', textColor: '#FFFFFF' },
  { id: 'twitter', name: 'Twitter', enabled: false, order: 6, color: '#1DA1F2', textColor: '#FFFFFF' },
  { id: 'yahoo', name: 'Yahoo', enabled: false, order: 7, color: '#410093', textColor: '#FFFFFF' },
  { id: 'phone', name: 'Phone OTP', enabled: false, order: 8, color: '#34A853', textColor: '#FFFFFF' },
  { id: 'anonymous', name: 'Anonymous', enabled: false, order: 9, color: '#6c757d', textColor: '#FFFFFF' },
  { id: 'email_link', name: 'Email Link', enabled: false, order: 10, color: '#FABB05', textColor: '#000000' },
  { id: 'email_password', name: 'Email & Password', enabled: true, order: 0, color: '#000000', textColor: '#FFFFFF' },
];

export const loginProviderService = {
  getProviders: async (): Promise<LoginProvider[]> => {
    try {
      const supabase = getSupabase();
      if (!supabase) return defaultProviders;
      
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'login_providers').single();
      if (data && !error && data.providers) {
        const parsedProviders = data.providers as LoginProvider[];
        // Merge with defaults to ensure missing providers are added
        const merged = defaultProviders.map(def => {
          const found = parsedProviders.find(p => p.id === def.id);
          return found ? { ...def, ...found } : def;
        });
        return merged.sort((a, b) => a.order - b.order);
      } else {
        await supabase.from('settings').upsert([{ id: 'login_providers', providers: defaultProviders }]);
        return defaultProviders;
      }
    } catch (error) {
      console.warn("Unable to fetch login providers, using defaults.", error);
      return defaultProviders;
    }
  },

  updateProviders: async (providers: LoginProvider[]): Promise<void> => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      await supabase.from('settings').upsert([{ id: 'login_providers', providers }]);
    } catch (error) {
      console.error("Error updating login providers:", error);
      throw error;
    }
  }
};
