
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

const STORAGE_KEY = 'support_banner_settings';

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
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_BANNER;
      }
    }
    return DEFAULT_BANNER;
  },

  async updateBanner(updates: Partial<SupportBannerData>): Promise<void> {
    const current = await this.getBanner();
    const updated = {
      ...current,
      ...updates,
      updated_at: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
};
