import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Music2, 
  MessageCircle,
  ChevronRight,
  Clock,
  Send,
  Linkedin,
  MessageSquare
} from 'lucide-react';
import { getFlutterConfig, FlutterConfig } from '../../services/flutterService';
import { useSettingsStore } from '../../store/useSettingsStore';

export function Footer() {
  const [config, setConfig] = useState<FlutterConfig | null>(null);
  const { settings } = useSettingsStore();

  useEffect(() => {
    async function load() {
      const data = await getFlutterConfig();
      setConfig(data);
    }
    load();
  }, []);

  if (!config) return null;

  const { brand, description, socialLinks, quickLinks, contact, design } = config;

  const isBgDark = (color: string) => {
    if (!color) return true;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const getStyleColor = (key: keyof typeof brand, defaultVal: string) => {
    if (brand.autoContrast && isBgDark(brand.footerBgColor)) {
      return defaultVal;
    }
    return (brand as any)[key] || brand.footerContentColor || brand.textColor;
  };

  const socialIconColor = getStyleColor('footerIconColor', brand.footerIconColor || '#DADADA');
  const headingColor = getStyleColor('footerHeadingColor', brand.footerHeadingColor || '#FFFFFF');
  const mutedColor = getStyleColor('footerMutedColor', brand.footerMutedColor || '#B8B8B8');
  const smallTextColor = getStyleColor('footerSmallTextColor', brand.footerSmallTextColor || '#B8B8B8');
  const copyrightColor = getStyleColor('footerCopyrightColor', brand.footerCopyrightColor || '#888888');
  const globalContentColor = brand.footerContentColor || brand.textColor;

  const SocialIcon = ({ platform, className }: { platform: string, className?: string }) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className={className} />;
      case 'facebookpage': return <Facebook className={className} />;
      case 'messenger': return <MessageSquare className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'twitter': return <Twitter className={className} />;
      case 'youtube': return <Youtube className={className} />;
      case 'tiktok': return <Music2 className={className} />;
      case 'whatsapp': return <MessageCircle className={className} />;
      case 'telegram': return <Send className={className} />;
      case 'linkedin': return <Linkedin className={className} />;
      default: return null;
    }
  };

  return (
    <footer 
      className="border-t pt-8 pb-20 md:pb-8 transition-all duration-500"
      style={{ 
        backgroundColor: brand.footerBgColor,
        color: globalContentColor,
        borderTopColor: design.divider ? 'rgba(0,0,0,0.05)' : 'transparent',
        boxShadow: design.shadow ? '0 -10px 30px rgba(0,0,0,0.02)' : 'none'
      }}
    >
      <div className="container mx-auto px-4" style={{ padding: `${design.padding}px` }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="h-8 object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 rounded flex items-center justify-center font-sans font-bold text-xl text-white" style={{ backgroundColor: brand.brandColor }}>
                    {brand.name.charAt(0)}
                  </div>
                  <span className="font-sans font-bold text-xl tracking-wide" style={{ color: brand.brandColor }}>
                    {brand.name}
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: mutedColor }}>
              {description.short}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {(() => {
                const activeSocialLinks = [];
                if (settings.facebookEnabled && settings.facebookUrl) {
                  activeSocialLinks.push({ platform: 'facebook', url: settings.facebookUrl });
                }
                if (settings.facebookPageEnabled && settings.facebookPageUrl) {
                  activeSocialLinks.push({ platform: 'facebookpage', url: settings.facebookPageUrl });
                }
                if (settings.messengerEnabled && settings.messengerUrl) {
                  activeSocialLinks.push({ platform: 'messenger', url: settings.messengerUrl });
                }
                if (settings.whatsappEnabled && settings.whatsappNumber) {
                  const num = settings.whatsappNumber.replace(/\+/g, '').replace(/\s/g, '');
                  const url = num.startsWith('http') ? num : `https://wa.me/${num}`;
                  activeSocialLinks.push({ platform: 'whatsapp', url });
                }
                if (settings.instagramEnabled && settings.instagramUrl) {
                  activeSocialLinks.push({ platform: 'instagram', url: settings.instagramUrl });
                }
                if (settings.youtubeEnabled && settings.youtubeUrl) {
                  activeSocialLinks.push({ platform: 'youtube', url: settings.youtubeUrl });
                }
                if (settings.tiktokEnabled && settings.tiktokUrl) {
                  activeSocialLinks.push({ platform: 'tiktok', url: settings.tiktokUrl });
                }
                const telLink = settings.telegramUrl || settings.telegramLink;
                if (settings.telegramEnabled && telLink) {
                  activeSocialLinks.push({ platform: 'telegram', url: telLink });
                }
                if (settings.twitterEnabled && settings.twitterUrl) {
                  activeSocialLinks.push({ platform: 'twitter', url: settings.twitterUrl });
                }
                if (settings.linkedinEnabled && settings.linkedinUrl) {
                  activeSocialLinks.push({ platform: 'linkedin', url: settings.linkedinUrl });
                }

                return activeSocialLinks.map((link, idx) => (
                  <a 
                    key={link.platform + idx}
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: socialIconColor }}
                    className="w-9 h-9 rounded-none border border-current flex items-center justify-center opacity-60 hover:opacity-100 transition-all hover:-translate-y-1"
                  >
                    <SocialIcon platform={link.platform} className="w-[18px] h-[18px]" />
                  </a>
                ));
              })()}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs mb-6 opacity-40" style={{ color: headingColor }}>Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.sort((a, b) => a.order - b.order).map((item) => (
                <li key={item.name}>
                  <Link 
                    to={item.url} 
                    style={{ color: globalContentColor }}
                    className="hover:opacity-100 opacity-60 transition-all text-sm flex items-center gap-1 group"
                  >
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2">
            <h4 className="font-black uppercase tracking-widest text-xs mb-6 opacity-40" style={{ color: headingColor }}>Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 opacity-60" style={{ color: socialIconColor }} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: smallTextColor }}>Store Location</span>
                    <p className="text-sm font-medium leading-relaxed" style={{ color: globalContentColor }}>{contact.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 opacity-60" style={{ color: socialIconColor }} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: smallTextColor }}>Support Time</span>
                    <p className="text-sm font-medium uppercase" style={{ color: globalContentColor }}>{contact.officeTime}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
                    <Phone className="w-4 h-4 opacity-60 group-hover:opacity-100" style={{ color: socialIconColor }} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: smallTextColor }}>Phone Number</span>
                    <p className="text-sm font-bold tracking-tight" style={{ color: globalContentColor }}>{contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors">
                    <Mail className="w-4 h-4 opacity-60 group-hover:opacity-100" style={{ color: socialIconColor }} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: smallTextColor }}>Email Support</span>
                    <p className="text-sm font-bold" style={{ color: globalContentColor }}>{contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-current/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: copyrightColor }}>
            {description.copyright}
          </p>
          <div className="flex gap-3">
             {['COD', 'SECURE PAY', 'SSL'].map(badge => (
                <div key={badge} className="px-3 py-1 border border-current/20 text-[9px] font-black tracking-widest uppercase">
                  {badge}
                </div>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
