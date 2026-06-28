import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Save, 
  Facebook, 
  Instagram, 
  Youtube, 
  Music2, 
  Chrome, 
  MessageCircle, 
  MessageSquare, 
  Send, 
  Twitter, 
  Linkedin,
  Info,
  ExternalLink,
  Globe,
  Settings,
  Loader2
} from 'lucide-react';
import { useSettingsStore, AppSettings } from '../../store/useSettingsStore';

interface SocialChannelItem {
  id: string;
  name: string;
  urlField: keyof AppSettings;
  enabledField: keyof AppSettings;
  placeholder: string;
  color: string;
  icon: any;
}

export default function AdminSocialLinks() {
  const { settings, updateSettings, updateDraftSettings } = useSettingsStore();
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Define local form fields linked directly with AppSettings
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || '');
  const [facebookEnabled, setFacebookEnabled] = useState(settings.facebookEnabled ?? true);

  const [facebookPageUrl, setFacebookPageUrl] = useState(settings.facebookPageUrl || '');
  const [facebookPageEnabled, setFacebookPageEnabled] = useState(settings.facebookPageEnabled ?? true);

  const [messengerUrl, setMessengerUrl] = useState(settings.messengerUrl || '');
  const [messengerEnabled, setMessengerEnabled] = useState(settings.messengerEnabled ?? true);

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '');
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings.whatsappEnabled ?? true);

  const [instagramUrl, setInstagramUrl] = useState(settings.instagramUrl || '');
  const [instagramEnabled, setInstagramEnabled] = useState(settings.instagramEnabled ?? true);

  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || '');
  const [youtubeEnabled, setYoutubeEnabled] = useState(settings.youtubeEnabled ?? false);

  const [tiktokUrl, setTiktokUrl] = useState(settings.tiktokUrl || '');
  const [tiktokEnabled, setTiktokEnabled] = useState(settings.tiktokEnabled ?? false);

  const [telegramUrl, setTelegramUrl] = useState(settings.telegramUrl || '');
  const [telegramEnabled, setTelegramEnabled] = useState(settings.telegramEnabled ?? true);

  const [twitterUrl, setTwitterUrl] = useState(settings.twitterUrl || '');
  const [twitterEnabled, setTwitterEnabled] = useState(settings.twitterEnabled ?? false);

  const [linkedinUrl, setLinkedinUrl] = useState(settings.linkedinUrl || '');
  const [linkedinEnabled, setLinkedinEnabled] = useState(settings.linkedinEnabled ?? false);

  // Keep state updated in case settings change in background store
  useEffect(() => {
    if (settings) {
      setFacebookUrl(settings.facebookUrl || '');
      setFacebookEnabled(settings.facebookEnabled ?? true);

      setFacebookPageUrl(settings.facebookPageUrl || '');
      setFacebookPageEnabled(settings.facebookPageEnabled ?? true);

      setMessengerUrl(settings.messengerUrl || '');
      setMessengerEnabled(settings.messengerEnabled ?? true);

      setWhatsappNumber(settings.whatsappNumber || '');
      setWhatsappEnabled(settings.whatsappEnabled ?? true);

      setInstagramUrl(settings.instagramUrl || '');
      setInstagramEnabled(settings.instagramEnabled ?? true);

      setYoutubeUrl(settings.youtubeUrl || '');
      setYoutubeEnabled(settings.youtubeEnabled ?? false);

      setTiktokUrl(settings.tiktokUrl || '');
      setTiktokEnabled(settings.tiktokEnabled ?? false);

      setTelegramUrl(settings.telegramUrl || '');
      setTelegramEnabled(settings.telegramEnabled ?? true);

      setTwitterUrl(settings.twitterUrl || '');
      setTwitterEnabled(settings.twitterEnabled ?? false);

      setLinkedinUrl(settings.linkedinUrl || '');
      setLinkedinEnabled(settings.linkedinEnabled ?? false);
    }
  }, [settings]);

  const triggerFeedback = (message: string) => {
    setSaveFeedback(message);
    setTimeout(() => {
      setSaveFeedback(null);
    }, 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updates: Partial<AppSettings> = {
      facebookUrl,
      facebookEnabled,
      facebookPageUrl,
      facebookPageEnabled,
      messengerUrl,
      messengerEnabled,
      whatsappNumber,
      whatsappEnabled,
      instagramUrl,
      instagramEnabled,
      youtubeUrl,
      youtubeEnabled,
      tiktokUrl,
      tiktokEnabled,
      telegramUrl,
      telegramLink: telegramUrl, // keep in sync
      telegramEnabled,
      twitterUrl,
      twitterEnabled,
      linkedinUrl,
      linkedinEnabled
    };

    try {
      await updateSettings(updates);
      updateDraftSettings(updates);
      triggerFeedback('🔗 Social media connectivity parameters updated!');
    } catch (err) {
      console.error(err);
      triggerFeedback('❌ Failed to update social media connectivity parameters');
    } finally {
      setIsSaving(false);
    }
  };

  const channels = [
    {
      id: 'facebook',
      name: 'Facebook Profile / Group URL',
      url: facebookUrl,
      setUrl: setFacebookUrl,
      enabled: facebookEnabled,
      setEnabled: setFacebookEnabled,
      placeholder: 'e.g. https://facebook.com/tazumartbd',
      icon: Facebook,
      color: '#1877F2',
      hint: 'Required for main Facebook profile or retail community group redirects.'
    },
    {
      id: 'facebookPage',
      name: 'Facebook Page URL',
      url: facebookPageUrl,
      setUrl: setFacebookPageUrl,
      enabled: facebookPageEnabled,
      setEnabled: setFacebookPageEnabled,
      placeholder: 'e.g. https://facebook.com/tazumartbd.page',
      icon: Facebook,
      color: '#0866FF',
      hint: 'Primary customer support and review page link.'
    },
    {
      id: 'messenger',
      name: 'Messenger Chat URL',
      url: messengerUrl,
      setUrl: setMessengerUrl,
      enabled: messengerEnabled,
      setEnabled: setMessengerEnabled,
      placeholder: 'e.g. https://m.me/tazumartbd',
      icon: MessageSquare,
      color: '#00B2FF',
      hint: 'Allows clients to dial straight into your live messenger chat thread.'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Number / Chat Link',
      url: whatsappNumber,
      setUrl: setWhatsappNumber,
      enabled: whatsappEnabled,
      setEnabled: setWhatsappEnabled,
      placeholder: 'e.g. +8801711223344',
      icon: MessageCircle,
      color: '#25D366',
      hint: 'Highly recommended for direct communication and mobile orders.'
    },
    {
      id: 'instagram',
      name: 'Instagram Profile URL',
      url: instagramUrl,
      setUrl: setInstagramUrl,
      enabled: instagramEnabled,
      setEnabled: setInstagramEnabled,
      placeholder: 'e.g. https://instagram.com/tazumartbd',
      icon: Instagram,
      color: '#E4405F',
      hint: 'Showcases your product designs and user stories.'
    },
    {
      id: 'youtube',
      name: 'YouTube Channel URL',
      url: youtubeUrl,
      setUrl: setYoutubeUrl,
      enabled: youtubeEnabled,
      setEnabled: setYoutubeEnabled,
      placeholder: 'e.g. https://youtube.com/c/tazumartbd',
      icon: Youtube,
      color: '#FF0000',
      hint: 'Ideal for tech previews, device walkthroughs, and promotion tapes.'
    },
    {
      id: 'tiktok',
      name: 'TikTok Video URL',
      url: tiktokUrl,
      setUrl: setTiktokUrl,
      enabled: tiktokEnabled,
      setEnabled: setTiktokEnabled,
      placeholder: 'e.g. https://tiktok.com/@tazumartbd',
      icon: Music2,
      color: '#000000',
      hint: 'Short-form promotional content video source anchor.'
    },
    {
      id: 'telegram',
      name: 'Telegram Channel / Username URL',
      url: telegramUrl,
      setUrl: setTelegramUrl,
      enabled: telegramEnabled,
      setEnabled: setTelegramEnabled,
      placeholder: 'e.g. https://t.me/tazumartbd',
      icon: Send,
      color: '#0088CC',
      hint: 'Great for bulk stock updates, flash campaign posts, and notifications.'
    },
    {
      id: 'twitter',
      name: 'X (Twitter) Feed URL',
      url: twitterUrl,
      setUrl: setTwitterUrl,
      enabled: twitterEnabled,
      setEnabled: setTwitterEnabled,
      placeholder: 'e.g. https://twitter.com/tazumartbd',
      icon: Twitter,
      color: '#1DA1F2',
      hint: 'Updates micro-news and corporate tracking milestones.'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Company URL',
      url: linkedinUrl,
      setUrl: setLinkedinUrl,
      enabled: linkedinEnabled,
      setEnabled: setLinkedinEnabled,
      placeholder: 'e.g. https://linkedin.com/company/tazumartbd',
      icon: Linkedin,
      color: '#0077B5',
      hint: 'B2B interactions and corporate structure links.'
    }
  ];

  return (
    <div id="admin-social-links-page" className="space-y-6 max-w-5xl mx-auto pb-16 font-sans text-neutral-900 text-left">
      
      {/* Toast Feedback Notification */}
      {saveFeedback && (
        <div id="toast-social-success" className="fixed top-20 right-6 z-[110] bg-neutral-900 text-white border border-neutral-800 px-4 py-3 shadow-xl flex items-center gap-2.5 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">{saveFeedback}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-white border border-neutral-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-indigo-650" />
            <h2 className="text-xl font-black text-neutral-950 uppercase tracking-widest leading-none">
              🔗 SOCIAL LINKS MANAGEMENT
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 uppercase font-semibold">
            Configure customer-facing connectivity links. Toggle independent visibility parameters for footers, contact dialogs, and support sections.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Helper Sidecard */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-neutral-200 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Globe className="w-4 h-4 text-neutral-500" />
              INTEGRATION TIP
            </h3>
            
            <p className="text-xs text-neutral-500 leading-relaxed font-semibold uppercase">
              Social linkages help consumers establish real-world trust. Make sure to toggle active links that are fully operational.
            </p>

            <div className="bg-neutral-50 p-3 text-[10.5px] text-neutral-500 leading-relaxed space-y-2 border border-neutral-200">
              <span className="font-extrabold text-[11px] block uppercase text-neutral-700">Dynamic Behavior Rules:</span>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-bold">Active:</span> Render link on the website footer, support and contact section cards.</li>
                <li><span className="font-bold">Inactive:</span> Completely exclude the social node option from the front-end rendering loop.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Channels Inputs Form */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-neutral-200 p-5 space-y-5">
            <h3 className="text-xs font-black uppercase text-neutral-900 tracking-wider pb-3 border-b border-neutral-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-neutral-500" />
              SOCIAL MEDIA CHANNELS ({channels.length})
            </h3>

            <div className="space-y-6">
              {channels.map((ch) => {
                const IconComponent = ch.icon;
                return (
                  <div key={ch.id} className="p-4 border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50/80 transition-colors space-y-3">
                    {/* Header line containing platform name and Toggle Button */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 flex items-center justify-center text-white border border-black/10 shadow-sm"
                          style={{ backgroundColor: ch.color }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold uppercase text-neutral-950 tracking-tight">{ch.name}</h4>
                          <span className="text-[9px] text-neutral-450 uppercase font-bold">{ch.id} node control</span>
                        </div>
                      </div>

                      {/* Cool High-Contrast Toggle Switch */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${ch.enabled ? 'text-emerald-600' : 'text-neutral-400'}`}>
                          {ch.enabled ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          onClick={() => ch.setEnabled(!ch.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center transition-colors focus:outline-none border border-neutral-300 rounded-none cursor-pointer ${
                            ch.enabled ? 'bg-neutral-900 border-neutral-950' : 'bg-neutral-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform transition-transform bg-white border border-neutral-450 ${
                              ch.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Input Field and hint */}
                    <div className="space-y-1">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={ch.url} 
                          onChange={(e) => ch.setUrl(e.target.value)} 
                          className="w-full h-10 border border-neutral-200 bg-white px-3 text-xs focus:outline-none focus:border-neutral-900 rounded-none text-neutral-900 font-bold" 
                          placeholder={ch.placeholder}
                          disabled={!ch.enabled}
                        />
                        {ch.url && (
                          <a 
                            href={ch.url.startsWith('http') ? ch.url : `https://${ch.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
                            title="Test Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-450 font-semibold uppercase">{ch.hint}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-150 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-neutral-900 hover:bg-black text-white h-11 px-8 text-xs font-black uppercase tracking-widest transition-all cursor-pointer select-none flex items-center justify-center gap-2 disabled:bg-neutral-500 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save Social Links</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
