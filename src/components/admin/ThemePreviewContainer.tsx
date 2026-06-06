import React, { useMemo } from 'react';
import { ThemeConfig } from '../../store/useThemeStore';

/**
 * ThemePreviewContainer wraps a component and applies theme settings as CSS variables.
 * This ensures the preview reflects live changes without affecting the actual admin panel UI.
 */
export function ThemePreviewContainer({ theme, children }: { theme: ThemeConfig, children: React.ReactNode }) {
  const styles = useMemo(() => {
    const s: Record<string, string | number> = {
      '--primary-color': theme.primaryColor,
      '--secondary-color': theme.secondaryColor,
      '--background-color': theme.backgroundColor,
      '--text-color': theme.textColor,
      '--border-color': theme.borderColor,
      '--shadow-color': theme.shadowColor,
      
      '--navbar-bg': theme.navbarBg,
      '--navbar-text': theme.navbarTextColor,
      
      '--font-family': theme.fontFamily,
      '--heading-font': theme.headingFont,
      '--button-font': theme.buttonFont,
      '--product-font': theme.productFont,
      
      '--card-bg': theme.cardBg,
      '--card-radius': `${theme.cardRadius}px`,
      '--card-name-color': theme.productNameColor,
      '--card-price-color': theme.priceColor,
      '--card-shadow': theme.cardShadow,
      '--wishlist-icon-color': theme.wishlistIconColor,
      '--rating-star-color': theme.ratingStarColor,
      '--grid-spacing': `${theme.gridSpacing}px`,

      '--banner-overlay': theme.bannerOverlayColor,
      '--banner-text': theme.bannerTextColor,
      '--banner-button': theme.bannerButtonColor,

      '--footer-bg': theme.footerBg,
      '--footer-text': theme.footerText,
      '--footer-link': theme.footerLinkColor,
      '--footer-icon': theme.footerIconColor,
    };
    
    // Add buttons
    Object.entries(theme.buttons).forEach(([key, config]) => {
      const btn = config as { bg: string; textColor: string; radius: number; hoverColor: string; shadow: string; borderColor: string };
      s[`--btn-${key}-bg`] = btn.bg;
      s[`--btn-${key}-text`] = btn.textColor;
      s[`--btn-${key}-radius`] = `${btn.radius}px`;
      s[`--btn-${key}-hover`] = btn.hoverColor;
      s[`--btn-${key}-shadow`] = btn.shadow;
      s[`--btn-${key}-border`] = btn.borderColor;
    });

    const sizes = { small: '0.875rem', medium: '1rem', large: '1.125rem' };
    s['--base-font-size'] = sizes[theme.fontSize];

    return s as React.CSSProperties;
  }, [theme]);

  return (
    <div 
      style={styles} 
      className={`theme-preview-root h-full w-full overflow-y-auto custom-scrollbar flex flex-col ${theme.mode === 'dark' ? 'dark' : ''}`}
    >
      <div className="bg-theme-bg min-h-full transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
