import React, { useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';
import { useBannerStore, Banner } from './store/useBannerStore';
import { useCategoryStore } from './store/useCategoryStore';
import { useSettingsStore } from './store/useSettingsStore';

/**
 * ThemeInitializer injected into the App root to apply dynamic styling 
 * and CSS variables based on the Theme Customizer settings.
 */
export const ThemeInitializer: React.FC = () => {
  const { theme } = useThemeStore();
  const googleSearchConsoleCode = useSettingsStore((s) => s.settings.googleSearchConsoleCode);

  useEffect(() => {
    // Remove existing verification meta tags first
    const existing = document.querySelectorAll('meta[name="google-site-verification"]');
    existing.forEach(el => (el as HTMLElement).remove());

    if (!googleSearchConsoleCode) return;

    let contentValue = '';
    // Let's parse if it is an HTML tag
    if (googleSearchConsoleCode.includes('<meta') || googleSearchConsoleCode.includes('google-site-verification')) {
      // Find content="value" or content='value'
      const match = googleSearchConsoleCode.match(/content=["']([^"']+)["']/);
      if (match && match[1]) {
        contentValue = match[1];
      }
    } else {
      // If they just entered the raw token instead of the tag, use it directly
      contentValue = googleSearchConsoleCode.trim();
    }

    if (contentValue) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = contentValue;
      document.head.appendChild(meta);
    }
  }, [googleSearchConsoleCode]);

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

  // All store subscriptions (Categories, Banners, etc.) are centrally handled in App.tsx
  // to ensure they are only registered after server-side configuration is fully loaded.
  return null;
};
