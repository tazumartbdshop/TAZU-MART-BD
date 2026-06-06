import React, { useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { useBannerStore, Banner } from './store/useBannerStore';
import { useCategoryStore } from './store/useCategoryStore';

/**
 * ThemeInitializer injected into the App root to apply dynamic styling 
 * and CSS variables based on the Theme Customizer settings.
 */
export const ThemeInitializer: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    // Global Colors
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--shadow-color', theme.shadowColor);

    // Navbar
    root.style.setProperty('--navbar-bg', theme.navbarBg);
    root.style.setProperty('--navbar-text', theme.navbarTextColor);

    // Buttons
    Object.entries(theme.buttons).forEach(([key, config]) => {
      root.style.setProperty(`--btn-${key}-bg`, config.bg);
      root.style.setProperty(`--btn-${key}-text`, config.textColor);
      root.style.setProperty(`--btn-${key}-radius`, `${config.radius}px`);
      root.style.setProperty(`--btn-${key}-hover`, config.hoverColor);
      root.style.setProperty(`--btn-${key}-shadow`, config.shadow);
      root.style.setProperty(`--btn-${key}-border`, config.borderColor);
    });

    // Typography
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.setProperty('--heading-font', theme.headingFont);
    root.style.setProperty('--button-font', theme.buttonFont);
    root.style.setProperty('--product-font', theme.productFont);

    // Font Sizes
    const sizes = { small: '0.875rem', medium: '1rem', large: '1.125rem' };
    root.style.setProperty('--base-font-size', sizes[theme.fontSize]);

    // Product Card
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--card-radius', `${theme.cardRadius}px`);
    root.style.setProperty('--card-name-color', theme.productNameColor);
    root.style.setProperty('--card-price-color', theme.priceColor);
    root.style.setProperty('--card-shadow', theme.cardShadow);
    root.style.setProperty('--wishlist-icon-color', theme.wishlistIconColor);
    root.style.setProperty('--rating-star-color', theme.ratingStarColor);
    root.style.setProperty('--grid-spacing', `${theme.gridSpacing}px`);

    // Banner
    root.style.setProperty('--banner-overlay', theme.bannerOverlayColor);
    root.style.setProperty('--banner-text', theme.bannerTextColor);
    root.style.setProperty('--banner-button', theme.bannerButtonColor);

    // Footer
    root.style.setProperty('--footer-bg', theme.footerBg);
    root.style.setProperty('--footer-text', theme.footerText);
    root.style.setProperty('--footer-link', theme.footerLinkColor);
    root.style.setProperty('--footer-icon', theme.footerIconColor);

    // Mode
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else if (theme.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Apply typography fonts dynamically
  useEffect(() => {
    // If we had a font loader, we'd use it here. 
    // For now, we assume fonts are imported in index.css
  }, [theme.fontFamily, theme.headingFont]);

  // Subscribe to real-time Banners & Draft Banners from Firestore
  useEffect(() => {
    const bannersRef = collection(db, 'banners');
    const qLive = query(bannersRef, orderBy('order', 'asc'));
    const unsubscribeLive = onSnapshot(qLive, (snapshot) => {
      const liveList: Banner[] = [];
      snapshot.forEach((doc) => {
        liveList.push({ id: doc.id, ...doc.data() } as Banner);
      });
      useBannerStore.getState().setBanners(liveList);
      
      if (snapshot.empty) {
        useBannerStore.getState().seedDefaultBanner();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'banners');
    });

    const draftRef = collection(db, 'banners_draft');
    const qDraft = query(draftRef, orderBy('order', 'asc'));
    const unsubscribeDraft = onSnapshot(qDraft, (snapshot) => {
      const draftList: Banner[] = [];
      snapshot.forEach((doc) => {
        draftList.push({ id: doc.id, ...doc.data() } as Banner);
      });
      
      // Only set drafts from DB if the admin hasn't started doing local changes
      if (!useBannerStore.getState().hasUnsavedChanges) {
        useBannerStore.getState().setDraftBanners(draftList);
      }
      
      if (snapshot.empty) {
        useBannerStore.getState().seedDefaultBanner();
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'banners_draft');
    });

    const unsubscribeCategories = useCategoryStore.getState().subscribe();

    const unsubscribeSliderConfig = onSnapshot(doc(db, 'settings', 'slider_config'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        useBannerStore.getState().updateSliderConfigLocal(!!data.autoSlide, Number(data.duration || 5));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/slider_config');
    });

    return () => {
      unsubscribeLive();
      unsubscribeDraft();
      unsubscribeCategories();
      unsubscribeSliderConfig();
    };
  }, []);

  return null;
};
