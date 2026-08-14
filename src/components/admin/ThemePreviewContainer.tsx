import React, { useMemo } from 'react';
import { ThemeConfig } from '../../store/useThemeStore';

/**
 * ThemePreviewContainer wraps a component and applies theme settings as CSS variables.
 * This ensures the preview reflects live changes without affecting the actual admin panel UI.
 */
export function ThemePreviewContainer({ theme, children }: { theme: ThemeConfig, children: React.ReactNode }) {
  const styles = useMemo(() => {
    if (!theme) return {} as React.CSSProperties;

    const s: Record<string, string | number> = {
      '--primary-color': theme.primaryColor || '#000000',
      '--secondary-color': theme.secondaryColor || '#ffffff',
      '--background-color': theme.backgroundColor || '#ffffff',
      '--text-color': theme.textColor || '#000000',
      '--border-color': theme.borderColor || '#e5e7eb',
      '--shadow-color': theme.shadowColor || 'rgba(0,0,0,0.1)',
      
      '--navbar-bg': theme.navbarBg || '#ffffff',
      '--navbar-text': theme.navbarTextColor || '#000000',
      
      '--font-family': theme.fontFamily || 'sans-serif',
      '--heading-font': theme.headingFont || 'sans-serif',
      '--button-font': theme.buttonFont || 'sans-serif',
      '--product-font': theme.productFont || 'sans-serif',
      
      '--card-bg': theme.cardBg || '#ffffff',
      '--card-radius': `${theme.cardRadius ?? 12}px`,
      '--card-name-color': theme.productNameColor || '#000000',
      '--card-price-color': theme.priceColor || '#000000',
      '--card-shadow': theme.cardShadow || 'none',
      '--wishlist-icon-color': theme.wishlistIconColor || '#ff0000',
      '--rating-star-color': theme.ratingStarColor || '#f59e0b',
      '--grid-spacing': `${theme.gridSpacing ?? 16}px`,

      '--banner-overlay': theme.bannerOverlayColor || 'rgba(0,0,0,0.3)',
      '--banner-text': theme.bannerTextColor || '#ffffff',
      '--banner-button': theme.bannerButtonColor || '#ffffff',

      '--footer-bg': theme.footerBg || '#ffffff',
      '--footer-text': theme.footerText || '#000000',
      '--footer-link': theme.footerLinkColor || '#3b82f6',
      '--footer-icon': theme.footerIconColor || '#000000',
    };
    
    // Add buttons safely
    if (theme.buttons) {
      Object.entries(theme.buttons).forEach(([key, config]) => {
        if (config) {
          const btn = config as { bg?: string; textColor?: string; radius?: number; hoverColor?: string; shadow?: string; borderColor?: string };
          s[`--btn-${key}-bg`] = btn.bg || '#000000';
          s[`--btn-${key}-text`] = btn.textColor || '#ffffff';
          s[`--btn-${key}-radius`] = `${btn.radius ?? 8}px`;
          s[`--btn-${key}-hover`] = btn.hoverColor || '#333333';
          s[`--btn-${key}-shadow`] = btn.shadow || 'none';
          s[`--btn-${key}-border`] = btn.borderColor || 'transparent';
        }
      });
    }

    const sizes = { small: '0.875rem', medium: '1rem', large: '1.125rem' };
    s['--base-font-size'] = (theme.fontSize && sizes[theme.fontSize]) || '1rem';

    return s as React.CSSProperties;
  }, [theme]);

  if (!theme) return null;

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
