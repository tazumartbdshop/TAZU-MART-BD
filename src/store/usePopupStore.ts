import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addPopupCampaign: (popup: Omit<PopupConfig, 'id'>) => void;
  updatePopupCampaign: (id: string, updates: Partial<PopupConfig>) => void;
  deletePopupCampaign: (id: string) => void;
  resetPopupCampaigns: () => void;
  // Fallback config state to sustain backwards-compatibility with static files
  config: PopupConfig;
  updateConfig: (updates: Partial<PopupConfig>) => void;
}

export const usePopupStore = create<PopupStore>()(
  persist(
    (set) => ({
      popupCampaigns: defaultCampaigns,
      addPopupCampaign: (popup) => set((state) => ({
        popupCampaigns: [
          ...state.popupCampaigns,
          { ...popup, id: `campaign-${Date.now()}` }
        ]
      })),
      updatePopupCampaign: (id, updates) => set((state) => ({
        popupCampaigns: state.popupCampaigns.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      deletePopupCampaign: (id) => set((state) => ({
        popupCampaigns: state.popupCampaigns.filter((item) => item.id !== id)
      })),
      resetPopupCampaigns: () => set({ popupCampaigns: defaultCampaigns }),
      
      // Keep backwards compatibility for existing setup fields in case references remain standard
      config: defaultCampaigns[0],
      updateConfig: (updates) => set((state) => {
        const nextConfig = { ...state.config, ...updates };
        return {
          config: nextConfig,
          popupCampaigns: state.popupCampaigns.map((item, index) =>
            index === 0 ? { ...item, ...updates } : item
          )
        };
      })
    }),
    {
      name: 'luxemart-popup-settings-multiv2',
    }
  )
);

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
