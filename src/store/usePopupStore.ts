import { create } from 'zustand';

export interface PopupConfig {
  id: string;
  status: 'ACTIVE' | 'DISABLED';
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  
  campaignType: 'NUMBER' | 'EVENT';
  campaignValue: string; // e.g. "11.11" or "Eid Mega Sale"

  templateId: string; // '1' - '10'
  bannerUrl: string; // Image URL

  title: string;
  titleFontSize: number; // Font size in px

  discountLabel: string; // e.g. "FLAT OFF"
  discountPercentage: string; // percentage e.g. "50%"

  subtitle: string;
  subtitleFontSize: number; // Font size in px

  buttonText: string;
  buttonUrl: string;
  buttonStyle: 'solid-black' | 'solid-accent' | 'luxury-gradient' | 'minimal-outline' | 'glass-translucent';

  secondaryButtonText: string;
  secondaryButtonUrl: string;

  // Products and Category Targeting Fields
  selectedProducts: string[]; // List of targeted product IDs
  selectedCategories: string[]; // List of targeted category IDs

  // Rotation and display timings
  displayDuration: number; // Display duration in seconds per popup (default is 2)
  displayOrder: number; // Order starting from 1

  // Auto Display Settings
  showOncePerUser: boolean;
  showEveryVisit: boolean;
  showAfter3Seconds: boolean;
  showAfterScroll: boolean;
  showOnlyHomepage: boolean;

  // Popup Close Settings
  closeButtonVisible: boolean;
  backgroundDarkOverlay: boolean;
  clickOutsideToClose: boolean;
  autoCloseAfterXSeconds: boolean; // Auto-close sequence after all play
  entranceAnimation: 'Fade In' | 'Zoom In' | 'Slide Up' | 'Bounce' | 'Scale Pop' | 'Rotate Fade';
}

const defaultCampaigns: PopupConfig[] = [
  {
    id: 'campaign-1',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days in future
    endTime: '23:59',
    campaignType: 'EVENT',
    campaignValue: 'Eid Mega Sale',
    templateId: '1',
    bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    title: 'WELCOME EID MEGA SALE FLAT OFF',
    titleFontSize: 28,
    discountLabel: 'FLAT OFF',
    discountPercentage: '50%',
    subtitle: 'ON YOUR FIRST ORDER TODAY',
    subtitleFontSize: 14,
    buttonText: 'CLAIM OFFER NOW',
    buttonUrl: '/category/fashion',
    buttonStyle: 'luxury-gradient',
    secondaryButtonText: 'LEARN MORE',
    secondaryButtonUrl: '/about-sale',
    selectedProducts: [],
    selectedCategories: ['fashion'],
    displayDuration: 2,
    displayOrder: 1,
    showOncePerUser: false,
    showEveryVisit: true,
    showAfter3Seconds: false,
    showAfterScroll: false,
    showOnlyHomepage: true,
    closeButtonVisible: true,
    backgroundDarkOverlay: true,
    clickOutsideToClose: true,
    autoCloseAfterXSeconds: false,
    entranceAnimation: 'Zoom In'
  },
  {
    id: 'campaign-2',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endTime: '23:59',
    campaignType: 'EVENT',
    campaignValue: 'Black Friday',
    templateId: '4', // Luxury black template
    bannerUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    title: 'ULTIMATE CHRONO SMART WATCH',
    titleFontSize: 24,
    discountLabel: 'EXCLUSIVITY DISCOUNT',
    discountPercentage: '30%',
    subtitle: 'FOR PRECISION LUXURY DESIGN',
    subtitleFontSize: 12,
    buttonText: 'SHOP SMARTSPECS',
    buttonUrl: '/category/electronics',
    buttonStyle: 'solid-black',
    secondaryButtonText: 'VIEW DEAL',
    secondaryButtonUrl: '/deals/electronics',
    selectedProducts: [],
    selectedCategories: ['electronics'],
    displayDuration: 2,
    displayOrder: 2,
    showOncePerUser: false,
    showEveryVisit: true,
    showAfter3Seconds: false,
    showAfterScroll: false,
    showOnlyHomepage: true,
    closeButtonVisible: true,
    backgroundDarkOverlay: true,
    clickOutsideToClose: true,
    autoCloseAfterXSeconds: false,
    entranceAnimation: 'Scale Pop'
  },
  {
    id: 'campaign-3',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endTime: '23:59',
    campaignType: 'EVENT',
    campaignValue: 'Flash Sale',
    templateId: '10', // Daraz style template
    bannerUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    title: 'COUTURE AMBRE INDULGENCE',
    titleFontSize: 24,
    discountLabel: 'MEGA BONUS OFFER',
    discountPercentage: '20%',
    subtitle: 'THE SWEETEST SUMMER SMELL',
    subtitleFontSize: 11,
    buttonText: 'GRAB CUPON',
    buttonUrl: '/category/home-living',
    buttonStyle: 'glass-translucent',
    secondaryButtonText: 'SEE PRODUCTS',
    secondaryButtonUrl: '/category/fashion',
    selectedProducts: [],
    selectedCategories: ['home-living', 'fashion'],
    displayDuration: 3,
    displayOrder: 3,
    showOncePerUser: false,
    showEveryVisit: true,
    showAfter3Seconds: false,
    showAfterScroll: false,
    showOnlyHomepage: true,
    closeButtonVisible: true,
    backgroundDarkOverlay: true,
    clickOutsideToClose: true,
    autoCloseAfterXSeconds: false,
    entranceAnimation: 'Slide Up'
  }
];

interface PopupStore {
  popupCampaigns: PopupConfig[];
  addPopupCampaign: (popup: Omit<PopupConfig, 'id'>) => Promise<void>;
  updatePopupCampaign: (id: string, updates: Partial<PopupConfig>) => Promise<void>;
  deletePopupCampaign: (id: string) => Promise<void>;
  resetPopupCampaigns: () => Promise<void>;
  // Fallback config state to sustain backwards-compatibility with static files
  config: PopupConfig;
  updateConfig: (updates: Partial<PopupConfig>) => void;
  subscribe: () => () => void;
}

export const usePopupStore = create<PopupStore>()((set, get) => ({
  popupCampaigns: [],
  config: defaultCampaigns[0],

  addPopupCampaign: async (popup) => {
    try {
      const docId = `campaign-${Date.now()}`;
      const newPopup: PopupConfig = {
        ...popup,
        id: docId,
      };
      const response = await fetch('/api/admin/popups/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPopup)
      });
      if (response.ok) {
        // Refresh local state if needed or rely on polling
      }
    } catch (err) {
      console.error('Error adding popup campaign:', err);
    }
  },

  updatePopupCampaign: async (id, updates) => {
    try {
      const existing = get().popupCampaigns.find(p => p.id === id);
      if (!existing) return;
      const updated = { ...existing, ...updates };
      const response = await fetch('/api/admin/popups/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Error updating popup campaign:', err);
    }
  },

  deletePopupCampaign: async (id) => {
    try {
      const response = await fetch(`/api/admin/popups/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        set((state) => ({
          popupCampaigns: state.popupCampaigns.filter(p => p.id !== id)
        }));
      }
    } catch (err) {
      console.error('Error deleting popup campaign:', err);
    }
  },

  resetPopupCampaigns: async () => {
    try {
      const response = await fetch('/api/admin/popups/reset', {
        method: 'POST'
      });
      if (response.ok) {
        for (const campaign of defaultCampaigns) {
          await get().addPopupCampaign(campaign);
        }
      }
    } catch (err) {
      console.error('Error resetting popup campaigns:', err);
    }
  },

  updateConfig: (updates) => set((state) => {
    const nextConfig = { ...state.config, ...updates };
    return {
      config: nextConfig,
    };
  }),

  subscribe: () => {
    const loadPopups = async () => {
      try {
        const response = await fetch('/api/admin/popups');
        if (response.ok) {
          const data = await response.json();
          const popups = data.map((p: any) => ({
            ...p,
            startDate: p.start_date,
            startTime: p.start_time,
            endDate: p.end_date,
            endTime: p.end_time,
            campaignType: p.campaign_type,
            campaignValue: p.campaign_value,
            templateId: p.template_id,
            bannerUrl: p.banner_url,
            titleFontSize: p.title_font_size,
            discountLabel: p.discount_label,
            discountPercentage: p.discount_percentage,
            subtitleFontSize: p.subtitle_font_size,
            buttonText: p.button_text,
            buttonUrl: p.button_url,
            buttonStyle: p.button_style,
            secondaryButtonText: p.secondary_button_text,
            secondaryButtonUrl: p.secondary_button_url,
            selectedProducts: typeof p.selected_products === 'string' ? JSON.parse(p.selected_products) : (p.selected_products || []),
            selectedCategories: typeof p.selected_categories === 'string' ? JSON.parse(p.selected_categories) : (p.selected_categories || []),
            displayDuration: p.display_duration,
            displayOrder: p.display_order,
            showOncePerUser: !!p.show_once_per_user,
            showEveryVisit: !!p.show_every_visit,
            showAfter3Seconds: !!p.show_after_3_seconds,
            showAfterScroll: !!p.show_after_scroll,
            showOnlyHomepage: !!p.show_only_homepage,
            closeButtonVisible: !!p.close_button_visible,
            backgroundDarkOverlay: !!p.background_dark_overlay,
            clickOutsideToClose: !!p.click_outside_to_close,
            autoCloseAfterXSeconds: !!p.auto_close_after_x_seconds,
            entranceAnimation: p.entrance_animation
          }));
          
          if (popups.length > 0) {
            set({ popupCampaigns: popups, config: popups[0] });
          } else {
             // If empty, maybe reset to defaults (handled by UI or manual reset)
          }
        }
      } catch (err) {
        console.error('Error loading popups:', err);
      }
    };
    
    loadPopups();
    const interval = setInterval(loadPopups, 5000);
    return () => clearInterval(interval);
  }
}));

export function getPopupStatus(config: PopupConfig): 'ACTIVE' | 'EXPIRED' | 'SCHEDULED' | 'DISABLED' {
  if (config.status === 'DISABLED') return 'DISABLED';
  
  try {
    const now = new Date();
    const startDateTime = new Date(`${config.startDate}T${config.startTime}`);
    const endDateTime = new Date(`${config.endDate}T${config.endTime}`);
    
    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return 'ACTIVE';
    }
    
    if (now < startDateTime) return 'SCHEDULED';
    if (now > endDateTime) return 'EXPIRED';
    return 'ACTIVE';
  } catch (e) {
    return 'ACTIVE';
  }
}
