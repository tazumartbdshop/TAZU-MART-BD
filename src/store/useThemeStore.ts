import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeConfig {
  // Global Colors
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;

  // Header & Navbar
  navbarBg: string;
  navbarTextColor: string;
  menuIconColor: string;
  searchBoxColor: string;
  searchPlaceholderColor: string;
  cartIconColor: string;
  notificationIconColor: string;
  stickyNavbar: boolean;

  // Buttons
  buttons: {
    primary: ButtonConfig;
    secondary: ButtonConfig;
    buyNow: ButtonConfig;
    addToCart: ButtonConfig;
    shopNow: ButtonConfig;
    order: ButtonConfig;
    login: ButtonConfig;
  };

  // Banner
  bannerOverlayColor: string;
  bannerTextColor: string;
  bannerButtonColor: string;
  bannerShadow: string;
  bannerGradient: string;
  sliderSpeed: number;

  // Product Card
  cardBg: string;
  productNameColor: string;
  priceColor: string;
  discountBadgeColor: string;
  cardRadius: number;
  cardShadow: string;
  wishlistIconColor: string;
  ratingStarColor: string;
  gridSpacing: number;

  // Footer
  footerBg: string;
  footerText: string;
  footerLinkColor: string;
  footerIconColor: string;
  socialIconHoverColor: string;

  // Typography
  fontFamily: string;
  headingFont: string;
  buttonFont: string;
  productFont: string;
  fontSize: 'small' | 'medium' | 'large';

  // Dark/Light Mode
  mode: 'light' | 'dark' | 'auto';

  // Effects
  smoothAnimation: boolean;
  glassEffect: boolean;
  cardHoverAnimation: boolean;
  buttonHoverZoom: boolean;
  bannerFadeAnimation: boolean;
  productHoverShadow: boolean;

  // Mobile Controls
  mobilePadding: number;
  mobileFontSize: number;
  mobileButtonRadius: number;
  mobileNavbarHeight: number;
}

interface ButtonConfig {
  bg: string;
  textColor: string;
  radius: number;
  hoverColor: string;
  shadow: string;
  borderColor: string;
}

interface ThemeState {
  theme: ThemeConfig;
  draftTheme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  updateDraftTheme: (updates: Partial<ThemeConfig>) => void;
  updateButton: (type: keyof ThemeConfig['buttons'], updates: Partial<ButtonConfig>) => void;
  updateDraftButton: (type: keyof ThemeConfig['buttons'], updates: Partial<ButtonConfig>) => void;
  publishTheme: () => void;
  resetTheme: () => void;
  resetDraftTheme: () => void;
}

const defaultConfig: ThemeConfig = {
  primaryColor: '#9333ea',
  secondaryColor: '#000000',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  borderColor: '#EEEEEE',
  shadowColor: 'rgba(0,0,0,0.05)',

  navbarBg: '#ffffff',
  navbarTextColor: '#000000',
  menuIconColor: '#000000',
  searchBoxColor: '#f3f4f6',
  searchPlaceholderColor: '#9ca3af',
  cartIconColor: '#000000',
  notificationIconColor: '#000000',
  stickyNavbar: true,

  buttons: {
    primary: { bg: '#9333ea', textColor: '#ffffff', radius: 8, hoverColor: '#7e22ce', shadow: '0 4px 6px -1px rgba(0,0,0,0.1)', borderColor: 'transparent' },
    secondary: { bg: '#000000', textColor: '#ffffff', radius: 8, hoverColor: '#1a1a1a', shadow: 'none', borderColor: 'transparent' },
    buyNow: { bg: '#9333ea', textColor: '#ffffff', radius: 8, hoverColor: '#7e22ce', shadow: 'none', borderColor: 'transparent' },
    addToCart: { bg: '#000000', textColor: '#ffffff', radius: 8, hoverColor: '#1a1a1a', shadow: 'none', borderColor: 'transparent' },
    shopNow: { bg: '#9333ea', textColor: '#ffffff', radius: 8, hoverColor: '#7e22ce', shadow: 'none', borderColor: 'transparent' },
    order: { bg: '#9333ea', textColor: '#ffffff', radius: 8, hoverColor: '#7e22ce', shadow: 'none', borderColor: 'transparent' },
    login: { bg: '#000000', textColor: '#ffffff', radius: 8, hoverColor: '#1a1a1a', shadow: 'none', borderColor: 'transparent' },
  },

  bannerOverlayColor: 'rgba(0,0,0,0.1)',
  bannerTextColor: '#ffffff',
  bannerButtonColor: '#9333ea',
  bannerShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
  bannerGradient: 'linear-gradient(to right, rgba(0,0,0,0.5), transparent)',
  sliderSpeed: 5000,

  cardBg: '#ffffff',
  productNameColor: '#000000',
  priceColor: '#9333ea',
  discountBadgeColor: '#22c55e',
  cardRadius: 12,
  cardShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  wishlistIconColor: '#ef4444',
  ratingStarColor: '#eab308',
  gridSpacing: 16,

  footerBg: '#000000',
  footerText: '#ffffff',
  footerLinkColor: '#9ca3af',
  footerIconColor: '#ffffff',
  socialIconHoverColor: '#9333ea',

  fontFamily: 'Inter',
  headingFont: 'Space Grotesk',
  buttonFont: 'Inter',
  productFont: 'Inter',
  fontSize: 'medium',

  mode: 'light',

  smoothAnimation: true,
  glassEffect: true,
  cardHoverAnimation: true,
  buttonHoverZoom: true,
  bannerFadeAnimation: true,
  productHoverShadow: true,

  mobilePadding: 16,
  mobileFontSize: 14,
  mobileButtonRadius: 8,
  mobileNavbarHeight: 64,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: defaultConfig,
      draftTheme: defaultConfig,
      updateTheme: (updates) => set((state) => ({
        theme: { ...state.theme, ...updates }
      })),
      updateDraftTheme: (updates) => set((state) => ({
        draftTheme: { ...state.draftTheme, ...updates }
      })),
      updateButton: (type, updates) => set((state) => ({
        theme: {
          ...state.theme,
          buttons: {
            ...state.theme.buttons,
            [type]: { ...state.theme.buttons[type], ...updates }
          }
        }
      })),
      updateDraftButton: (type, updates) => set((state) => ({
        draftTheme: {
          ...state.draftTheme,
          buttons: {
            ...state.draftTheme.buttons,
            [type]: { ...state.draftTheme.buttons[type], ...updates }
          }
        }
      })),
      publishTheme: () => set((state) => ({ theme: state.draftTheme })),
      resetTheme: () => set({ theme: defaultConfig }),
      resetDraftTheme: () => set((state) => ({ draftTheme: state.theme })),
    }),
    {
      name: 'theme-storage',
    }
  )
);
