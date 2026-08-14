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
    if (!theme) return;
    const root = document.documentElement;

    // Permanent White / Light Theme enforcement
    root.classList.remove('dark');
    root.setAttribute('data-footer-theme', 'light');

    // Global Colors
    root.style.setProperty('--primary-color', theme.primaryColor || '#9333ea');
    root.style.setProperty('--secondary-color', theme.secondaryColor || '#000000');
    root.style.setProperty('--background-color', theme.backgroundColor || '#ffffff');
    root.style.setProperty('--text-color', theme.textColor || '#111111');
    root.style.setProperty('--border-color', theme.borderColor || '#eeeeee');
    root.style.setProperty('--shadow-color', theme.shadowColor || 'rgba(0,0,0,0.05)');

    // Navbar
    root.style.setProperty('--navbar-bg', theme.navbarBg || '#ffffff');
    root.style.setProperty('--navbar-text', theme.navbarTextColor || '#000000');

    // Global layout & element CSS variables
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f9fafb');
    root.style.setProperty('--text-primary', '#111111');
    root.style.setProperty('--text-secondary', '#4b5563');
    root.style.setProperty('--card-bg', theme.cardBg || '#ffffff');
    root.style.setProperty('--input-bg', '#ffffff');
    root.style.setProperty('--border-theme', '#eeeeee');

    // Buttons
    if (theme.buttons) {
      Object.entries(theme.buttons).forEach(([key, config]) => {
        if (config) {
          root.style.setProperty(`--btn-${key}-bg`, config.bg || '#000000');
          root.style.setProperty(`--btn-${key}-text`, config.textColor || '#ffffff');
          root.style.setProperty(`--btn-${key}-radius`, `${config.radius ?? 8}px`);
          root.style.setProperty(`--btn-${key}-hover`, config.hoverColor || '#333333');
          root.style.setProperty(`--btn-${key}-shadow`, config.shadow || 'none');
          root.style.setProperty(`--btn-${key}-border`, config.borderColor || 'transparent');
        }
      });
    }

    // Typography
    root.style.setProperty('--font-family', theme.fontFamily || 'sans-serif');
    root.style.setProperty('--heading-font', theme.headingFont || 'sans-serif');
    root.style.setProperty('--button-font', theme.buttonFont || 'sans-serif');
    root.style.setProperty('--product-font', theme.productFont || 'sans-serif');

    // Font Sizes
    const sizes = { small: '0.875rem', medium: '1rem', large: '1.125rem' };
    root.style.setProperty('--base-font-size', sizes[theme.fontSize] || '1rem');

    // Product Card
    root.style.setProperty('--card-radius', `${theme.cardRadius ?? 12}px`);
    root.style.setProperty('--card-name-color', theme.productNameColor || '#000000');
    root.style.setProperty('--card-price-color', theme.priceColor || '#000000');
    root.style.setProperty('--card-shadow', theme.cardShadow || 'none');
    root.style.setProperty('--wishlist-icon-color', theme.wishlistIconColor || '#ff0000');
    root.style.setProperty('--rating-star-color', theme.ratingStarColor || '#f59e0b');
    root.style.setProperty('--grid-spacing', `${theme.gridSpacing ?? 16}px`);

    // Banner
    root.style.setProperty('--banner-overlay', theme.bannerOverlayColor || 'rgba(0,0,0,0.3)');
    root.style.setProperty('--banner-text', theme.bannerTextColor || '#ffffff');
    root.style.setProperty('--banner-button', theme.bannerButtonColor || '#ffffff');

    // Footer
    root.style.setProperty('--footer-bg', theme.footerBg || '#ffffff');
    root.style.setProperty('--footer-text', theme.footerText || '#111111');
    root.style.setProperty('--footer-link', theme.footerLinkColor || '#4b5563');
    root.style.setProperty('--footer-icon', theme.footerIconColor || '#111111');
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
