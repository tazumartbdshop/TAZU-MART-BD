import React, { useEffect } from 'react';
import { useThemeStore } from './store/useThemeStore';

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

    // Footer
    root.style.setProperty('--footer-bg', theme.footerBg);
    root.style.setProperty('--footer-text', theme.footerText);

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

  return null;
};
