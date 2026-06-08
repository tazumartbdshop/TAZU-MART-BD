import { create } from 'zustand';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
  isLoaded: boolean;
  subscribe: () => () => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  updateDraftTheme: (updates: Partial<ThemeConfig>) => void;
  updateButton: (type: keyof ThemeConfig['buttons'], updates: Partial<ButtonConfig>) => void;
  updateDraftButton: (type: keyof ThemeConfig['buttons'], updates: Partial<ButtonConfig>) => void;
  publishTheme: () => Promise<void>;
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

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: defaultConfig,
  draftTheme: defaultConfig,
  isLoaded: false,
  subscribe: () => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'theme'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<ThemeConfig>;
        const mergedSettings = { ...defaultConfig, ...data };
        set({ theme: mergedSettings, draftTheme: mergedSettings, isLoaded: true });
      } else {
        setDoc(doc(db, 'settings', 'theme'), defaultConfig).then(() => {
          set({ theme: defaultConfig, draftTheme: defaultConfig, isLoaded: true });
        }).catch(err => console.error("Initial theme seed failed", err));
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/theme');
    });
    return unsubscribe;
  },
  updateTheme: (updates) => {
    const newTheme = { ...get().theme, ...updates };
    set({ theme: newTheme });
    setDoc(doc(db, 'settings', 'theme'), newTheme, { merge: true })
      .catch(err => console.error("Firestore theme update fail", err));
  },
  updateDraftTheme: (updates) => set((state) => ({
    draftTheme: { ...state.draftTheme, ...updates }
  })),
  updateButton: (type, updates) => {
    const state = get();
    const newTheme = {
      ...state.theme,
      buttons: {
        ...state.theme.buttons,
        [type]: { ...state.theme.buttons[type], ...updates }
      }
    };
    set({ theme: newTheme });
    setDoc(doc(db, 'settings', 'theme'), newTheme, { merge: true })
      .catch(err => console.error("Firestore theme button update fail", err));
  },
  updateDraftButton: (type, updates) => set((state) => ({
    draftTheme: {
      ...state.draftTheme,
      buttons: {
        ...state.draftTheme.buttons,
        [type]: { ...state.draftTheme.buttons[type], ...updates }
      }
    }
  })),
  publishTheme: async () => {
    try {
      const draft = get().draftTheme;
      await setDoc(doc(db, 'settings', 'theme'), draft, { merge: true });
      set({ theme: draft });
    } catch (error) {
      console.error("Firebase publishTheme error:", error);
      throw error;
    }
  },
  resetTheme: () => set({ theme: defaultConfig }),
  resetDraftTheme: () => set((state) => ({ draftTheme: state.theme })),
}));
