import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, Send, MessageCircle, Clock } from 'lucide-react';
import { useFooterSettingsStore } from '../../store/useFooterSettingsStore';
import { themeSettingsService } from '../../services/themeSettingsService';
import { useTranslation } from '../../store/useLanguageStore';

export function Footer() {
  const { t } = useTranslation();
  const { settings, fetchFooterSettings } = useFooterSettingsStore();
  const [themeMode, setThemeMode] = useState<'black' | 'white'>('white');

  useEffect(() => {
    fetchFooterSettings();

    themeSettingsService.getThemeMode().then((mode) => {
      setThemeMode(mode === 'black' ? 'black' : 'white');
    });

    const handleLiveUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        useFooterSettingsStore.setState({ settings: customEvent.detail });
      }
    };

    const handleThemeModeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setThemeMode(customEvent.detail === 'black' ? 'black' : 'white');
      }
    };

    window.addEventListener('tazu-footer-updated', handleLiveUpdate);
    window.addEventListener('tazu-theme-mode-changed', handleThemeModeChange);
    return () => {
      window.removeEventListener('tazu-footer-updated', handleLiveUpdate);
      window.removeEventListener('tazu-theme-mode-changed', handleThemeModeChange);
    };
  }, []);

  if (!settings) return null;

  const isDark = themeMode === 'black';

  const socialLinks = [
    { key: 'facebook', icon: Facebook, data: settings.facebook },
    { key: 'instagram', icon: Instagram, data: settings.instagram },
    { key: 'youtube', icon: Youtube, data: settings.youtube },
    { key: 'messenger', icon: Send, data: settings.messenger },
    { key: 'whatsapp', icon: MessageCircle, data: settings.socialWhatsapp },
    { key: 'tiktok', icon: ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.32 6.32 6.32 0 0 0 6.27-6.32V10a8.2 8.2 0 0 0 4.46 1.34v-3.45a4.8 4.8 0 0 1-2.41-1.2z"/></svg>, data: settings.tiktok }
  ].filter(s => s.data && s.data.enabled && s.data.url);

  const activePayments = (settings.paymentMethods || []).filter(p => p.enabled);

  return (
    <footer className={`transition-colors duration-200 border-t ${
      isDark 
        ? 'bg-[#0a0a0a] text-white border-zinc-800' 
        : 'bg-white text-zinc-900 border-zinc-200'
    }`} data-footer-theme={isDark ? 'dark' : 'light'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Company Logo & About */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              {settings.footerLogoUrl && (
                <img 
                  src={settings.footerLogoUrl} 
                  alt={settings.companyName || 'Logo'} 
                  className="h-10 w-auto object-contain shrink-0" 
                />
              )}
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {settings.companyName || 'TAZU MART'}
              </h2>
            </div>
            
            <div className="space-y-2">
              {settings.companyTagline && (
                <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                  {settings.companyTagline}
                </p>
              )}
              {settings.businessDescription && (
                <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {settings.businessDescription}
                </p>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a 
                      key={social.key} 
                      href={social.data.url} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`w-10 h-10 border flex items-center justify-center transition-colors ${
                        isDark 
                          ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white' 
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {t.quickLinks}
            </h3>
            <ul className="space-y-3">
              {(settings.quickLinks || []).map((link, idx) => (
                link.label && link.url ? (
                  <li key={idx}>
                    <Link to={link.url} className={`text-sm transition-colors font-medium ${
                      isDark 
                        ? 'text-zinc-300 hover:text-white' 
                        : 'text-zinc-500 hover:text-zinc-900'
                    }`}>
                      {link.label}
                    </Link>
                  </li>
                ) : null
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Support / Address */}
          <div className="space-y-6">
            <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {(t as any).customerSupport || 'Customer Support'}
            </h3>
            <ul className="space-y-4">
              {settings.address && (
                <li className={`flex gap-3 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  <MapPin className={`w-5 h-5 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`} />
                  <span className="leading-relaxed">{settings.address}</span>
                </li>
              )}
              {settings.workingHours && (
                <li className={`flex gap-3 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                  <Clock className={`w-5 h-5 shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`} />
                  <span>{settings.workingHours}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-6">
            <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {(t as any).contactInfo || 'Contact Info'}
            </h3>
            <ul className="space-y-4">
              {settings.phone && (
                <li className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center ${
                    isDark ? 'bg-zinc-900' : 'bg-zinc-50'
                  }`}>
                    <Phone className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{(t as any).phone || 'Phone'}</span>
                    <a href={`tel:${settings.phone}`} className={`text-sm font-bold hover:underline ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>{settings.phone}</a>
                  </div>
                </li>
              )}
              {settings.contactWhatsapp && (
                <li className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center ${
                    isDark ? 'bg-emerald-950/60' : 'bg-emerald-50'
                  }`}>
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">WhatsApp</span>
                    <a href={`https://wa.me/${settings.contactWhatsapp}`} target="_blank" rel="noreferrer" className={`text-sm font-bold hover:underline ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>{settings.contactWhatsapp}</a>
                  </div>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center ${
                    isDark ? 'bg-zinc-900' : 'bg-zinc-50'
                  }`}>
                    <Mail className={`w-4 h-4 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{(t as any).email || 'Email'}</span>
                    <a href={`mailto:${settings.email}`} className={`text-sm font-bold hover:underline ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>{settings.email}</a>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-6 ${
          isDark ? 'border-zinc-800' : 'border-zinc-100'
        }`}>
          <p className={`text-sm font-medium text-center md:text-left ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            {settings.copyrightText}
          </p>
          
          {activePayments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activePayments.map(payment => (
                <div key={payment.id} className={`px-3 py-1.5 border text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'border-zinc-800 text-zinc-300 bg-zinc-900' : 'border-zinc-200 text-zinc-600'
                }`}>
                  {payment.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
