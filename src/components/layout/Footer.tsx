import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  ChevronRight,
  Clock,
  Send,
  MessageCircle,
  PhoneCall,
  Youtube,
  Music2
} from 'lucide-react';
import { useFooterSettingsStore } from '../../store/useFooterSettingsStore';

export function Footer() {
  const { settings, fetchFooterSettings } = useFooterSettingsStore();

  useEffect(() => {
    fetchFooterSettings();

    // Listen to live update event dispatched when admin saves settings
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
  }, []);

  const SocialIcon = ({ platform, className }: { platform: string, className?: string }) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className={className} />;
      case 'messenger': return <Send className={className} />; // clean representation
      case 'whatsapp': return <MessageCircle className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'telegram': return <Send className={className} />;
      case 'youtube': return <Youtube className={className} />;
      case 'tiktok': return <Music2 className={className} />;
      default: return null;
    }
  };

  // Build list of active, enabled social links from dynamic settings
  const activeSocials = [];
  if (settings?.social_facebook_enabled && settings?.social_facebook) {
    activeSocials.push({ name: 'facebook', url: settings.social_facebook });
  }
  if (settings?.social_messenger_enabled && settings?.social_messenger) {
    activeSocials.push({ name: 'messenger', url: settings.social_messenger });
  }
  if (settings?.social_whatsapp_enabled && settings?.social_whatsapp) {
    activeSocials.push({ name: 'whatsapp', url: settings.social_whatsapp });
  }
  if (settings?.social_instagram_enabled && settings?.social_instagram) {
    activeSocials.push({ name: 'instagram', url: settings.social_instagram });
  }
  if (settings?.social_telegram_enabled && settings?.social_telegram) {
    activeSocials.push({ name: 'telegram', url: settings.social_telegram });
  }
  if (settings?.social_youtube_enabled && settings?.social_youtube) {
    activeSocials.push({ name: 'youtube', url: settings.social_youtube });
  }
  if (settings?.social_tiktok_enabled && settings?.social_tiktok) {
    activeSocials.push({ name: 'tiktok', url: settings.social_tiktok });
  }

  // Safely parse quick_links
  let quickLinks: any[] = [];
  if (Array.isArray(settings?.quick_links)) {
    quickLinks = settings.quick_links;
  } else if (typeof settings?.quick_links === 'string') {
    try {
      quickLinks = JSON.parse(settings.quick_links);
    } catch (e) {}
  }
  if (!Array.isArray(quickLinks)) {
    quickLinks = [];
  }

  // Safely parse payment_badges
  let paymentBadges: string[] = [];
  if (Array.isArray(settings?.payment_badges)) {
    paymentBadges = settings.payment_badges;
  } else if (typeof settings?.payment_badges === 'string') {
    try {
      paymentBadges = JSON.parse(settings.payment_badges);
    } catch (e) {}
  }
  if (!Array.isArray(paymentBadges)) {
    paymentBadges = [];
  }

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900 pt-16 pb-24 md:pb-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Four Column Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Branding & About */}
          <div className="space-y-5">
            {settings.show_footer_logo && (
              <Link to="/" className="inline-block">
                {settings.footer_logo ? (
                  <img 
                    src={settings.footer_logo} 
                    alt="Footer Logo" 
                    style={{ 
                      width: settings.footer_logo_width ? `${settings.footer_logo_width}px` : '150px',
                      height: settings.footer_logo_height ? `${settings.footer_logo_height}px` : '40px'
                    }}
                    className="object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <span className="font-sans font-black text-lg tracking-widest text-white uppercase">
                    TAZU MART BD
                  </span>
                )}
              </Link>
            )}

            {settings.show_about_section && (
              <div className="space-y-2">
                {settings.about_title && (
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                    {settings.about_title}
                  </h5>
                )}
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                  {settings.about_description}
                </p>
              </div>
            )}

            {settings.show_social_icons && activeSocials.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {activeSocials.map((social) => (
                  <a 
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 border border-zinc-800 hover:border-white hover:text-white flex items-center justify-center transition-all bg-zinc-900/40 text-zinc-400"
                    title={`Follow us on ${social.name}`}
                  >
                    <SocialIcon platform={social.name} className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            {settings.show_quick_links && (
              <>
                <h4 className="font-black uppercase tracking-[0.25em] text-[10px] text-white mb-6 border-l-2 border-white pl-2">
                  Quick Navigation
                </h4>
                <ul className="space-y-3.5">
                  {quickLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link 
                        to={link.url} 
                        className="text-xs text-zinc-400 hover:text-white transition-all flex items-center gap-1 group w-max"
                      >
                        <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:translate-x-1 transition-transform shrink-0" />
                        <span className="font-semibold">{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Column 3: Contact Info */}
          <div>
            {settings.show_contact_info && (
              <>
                <h4 className="font-black uppercase tracking-[0.25em] text-[10px] text-white mb-6 border-l-2 border-white pl-2">
                  Contact Support
                </h4>
                <div className="space-y-4">
                  {settings.contact_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-500">Store Address</span>
                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">{settings.contact_address}</p>
                      </div>
                    </div>
                  )}

                  {settings.contact_support_time && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-500">Service Hours</span>
                        <p className="text-xs text-zinc-300 font-semibold">{settings.contact_support_time}</p>
                      </div>
                    </div>
                  )}

                  {settings.contact_phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-500">Direct Phone</span>
                        <p className="text-xs text-white font-bold tracking-tight">{settings.contact_phone}</p>
                      </div>
                    </div>
                  )}

                  {settings.contact_email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-500">Email Address</span>
                        <p className="text-xs text-zinc-300 font-bold">{settings.contact_email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Column 4: Customer Support Card Widget */}
          <div>
            {settings.show_support_card && (
              <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    {settings.card_title || 'Customer Support'}
                  </h4>
                  <p className="text-[10px] font-medium text-zinc-400">
                    {settings.card_description || settings.card_subtitle || 'Need help? Contact us now!'}
                  </p>
                </div>

                <div className="space-y-2">
                  {settings.card_whatsapp_link && (
                    <a 
                      href={settings.card_whatsapp_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 transition-colors w-full"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {settings.card_whatsapp_text || 'Chat on WhatsApp'}
                    </a>
                  )}

                  {settings.card_call_phone && (
                    <a 
                      href={`tel:${settings.card_call_phone}`}
                      className="h-9 px-4 border border-zinc-700 hover:bg-zinc-800 text-white font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1.5 transition-all w-full"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-zinc-400" />
                      {settings.card_call_text || 'Call Support'}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom copyright & payment stickers */}
        {(settings.show_copyright || (settings.show_payment_badges && paymentBadges.length > 0)) && (
          <div className="border-t border-zinc-900 pt-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
            {settings.show_copyright && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center md:text-left">
                {settings.copyright_text || '© 2026 TAZU MART BD. All Rights Reserved.'}
              </p>
            )}

            {settings.show_payment_badges && paymentBadges.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {paymentBadges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-[8px] font-black tracking-widest text-zinc-400 uppercase"
                  >
                    {badge}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </footer>
  );
}
