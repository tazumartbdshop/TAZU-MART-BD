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
  facebook_status: true
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
  }
};
