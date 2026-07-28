import React, { useEffect } from 'react';
import { useFooterSettingsStore } from '../../store/useFooterSettingsStore';

export function FooterBanner() {
  const { settings, fetchFooterSettings } = useFooterSettingsStore();

  useEffect(() => {
    fetchFooterSettings();

    const handleLiveUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        useFooterSettingsStore.setState({ settings: customEvent.detail });
      }
    };

    window.addEventListener('tazu-footer-updated', handleLiveUpdate);
    return () => {
      window.removeEventListener('tazu-footer-updated', handleLiveUpdate);
    };
  }, [fetchFooterSettings]);

  if (!settings || !settings.footerBannerUrl) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 md:mt-4">
      <div className="w-full rounded-xl overflow-hidden shadow-sm">
        <img 
          src={settings.footerBannerUrl} 
          alt="Footer Banner" 
          className="w-full h-auto object-cover max-h-64 sm:max-h-80 rounded-xl" 
        />
      </div>
    </div>
  );
}
