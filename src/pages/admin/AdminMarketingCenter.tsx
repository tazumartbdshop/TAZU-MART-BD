import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Megaphone, 
  Layers, 
  Activity, 
  Globe, 
  Server, 
  Sparkles, 
  Sliders, 
  BarChart2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Copy, 
  Save, 
  Plus, 
  Database,
  ArrowUpRight,
  Monitor,
  Smartphone,
  Tablet,
  Share2,
  LineChart as LineIcon,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  Users,
  Percent,
  Compass,
  Cpu,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// CONFIGURATION DATA STRUCTURES
// ==========================================

interface FacebookConfig {
  active: boolean;
  pixelId: string;
  datasetId: string;
  accessToken: string;
  conversionApiToken: string;
  testEventCode: string;
  domainVerificationStatus: 'Verified' | 'Pending' | 'Failed';
  domainVerification: string;
  
  // Business Assets
  metaBusinessId: string;
  businessPortfolioId: string;
  adAccountId: string;
  catalogId: string;
  commerceManagerId: string;
  facebookPageId: string;
  instagramBusinessAccountId: string;

  events: {
    pageView: boolean;
    viewContent: boolean;
    search: boolean;
    addToWishlist: boolean;
    addToCart: boolean;
    initiateCheckout: boolean;
    addPaymentInfo: boolean;
    purchase: boolean;
    lead: boolean;
    completeRegistration: boolean;
    contact: boolean;
    subscribe: boolean;
  };
  audiences: {
    customAudienceSync: boolean;
    websiteVisitors: boolean;
    addToCart: boolean;
    checkout: boolean;
    purchase: boolean;
    lookalikeSync: boolean;
  };
}

interface TikTokConfig {
  active: boolean;
  pixelId: string;
  businessCenterId: string;
  adAccountId: string;
  catalogId: string;
  eventApiToken: string;
  accessToken: string;
  events: {
    pageView: boolean;
    viewContent: boolean;
    search: boolean;
    addToWishlist: boolean;
    addToCart: boolean;
    checkout: boolean;
    addPaymentInfo: boolean;
    purchase: boolean;
    lead: boolean;
  };
}

interface GoogleConfig {
  active: boolean;
  measurementId: string;
  gtmContainerId: string;
  conversionId: string;
  conversionLabel: string;
  merchantCenterId: string;
  businessProfileId: string;
  events: {
    productView: boolean;
    search: boolean;
    addToWishlist: boolean;
    addToCart: boolean;
    beginCheckout: boolean;
    addPaymentInfo: boolean;
    purchase: boolean;
    refund: boolean;
    conversionValue: boolean;
  };
  advanced: {
    enhancedEcommerce: boolean;
    enhancedConversions: boolean;
    crossDomainTracking: boolean;
    userIdTracking: boolean;
  };
}

interface WebsiteTrackingConfig {
  uniqueVisitors: number;
  returningVisitors: number;
  sessionDuration: string;
  bounceRate: string;
  toggles: {
    scrollTracking: boolean;
    clickTracking: boolean;
    formTracking: boolean;
    searchTracking: boolean;
    exitTracking: boolean;
    buttonTracking: boolean;
    productInteractionTracking: boolean;
  };
  utm: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
    term: string;
  };
}

interface ServerSideTrackingConfig {
  active: boolean;
  endpointUrl: string;
  trackingToken: string;
  verificationKey: string;
  hmacSecretKey: string;
  retryQueueStatus: string;
  integrations: {
    facebookCapi: boolean;
    tiktokEventsApi: boolean;
    googleEnhanced: boolean;
    googleAdsOffline: boolean;
  };
  events: {
    pageView: boolean;
    productView: boolean;
    search: boolean;
    addToWishlist: boolean;
    addToCart: boolean;
    checkout: boolean;
    addPaymentInfo: boolean;
    purchase: boolean;
    refund: boolean;
  };
}

interface CatalogSyncConfig {
  facebookCatalogSync: boolean;
  tiktokCatalogSync: boolean;
  googleMerchantFeed: boolean;
  autoProductFeedUpdate: boolean;
  feedValidation: boolean;
  lastSyncTime: string;
  feedUrl: string;
  syncInterval: string;
}

interface AudienceConfig {
  websiteVisitors: boolean;
  productViewers: boolean;
  cartAbandoners: boolean;
  checkoutAbandoners: boolean;
  purchasers: boolean;
  lookalikePercentage: string;
  syncStatus: string;
}

interface ConversionState {
  roas: number;
  cpa: number;
  cpc: number;
  cpm: number;
  ctr: number;
  conversionRate: number;
  revenue: number;
}

interface MarketingCenterConfig {
  facebook: FacebookConfig;
  tiktok: TikTokConfig;
  google: GoogleConfig;
  websiteTracking: WebsiteTrackingConfig;
  serverSide: ServerSideTrackingConfig;
  catalog: CatalogSyncConfig;
  audience: AudienceConfig;
  conversion: ConversionState;
}

// ==========================================
// INITIAL & DEFAULT VALUES
// ==========================================

const INITIAL_MARKETING_CONFIG: MarketingCenterConfig = {
  facebook: {
    active: true,
    pixelId: 'FB-9981024-X2',
    datasetId: 'DS-481923182',
    accessToken: 'EAADb3ZCOp05C8ZCO7dE548G91ZAMbIiz24ZC7G65w3mGZA6Yp6xZB1lGv6Yf1wZBqWd9v2Y',
    conversionApiToken: 'capi_token_fb_120893120381028390',
    testEventCode: 'TEST90831',
    domainVerificationStatus: 'Verified',
    domainVerification: 'tazumart.com-fb-verify-91zobpq83',
    metaBusinessId: 'MB-100238129',
    businessPortfolioId: 'BP-881290382',
    adAccountId: 'ACT-90218932',
    catalogId: 'CAT-22819201',
    commerceManagerId: 'COMM_MGR-7712108a',
    facebookPageId: 'FP-3901283921',
    instagramBusinessAccountId: 'IG-9018312',
    events: {
      pageView: true,
      viewContent: true,
      search: true,
      addToWishlist: true,
      addToCart: true,
      initiateCheckout: true,
      addPaymentInfo: true,
      purchase: true,
      lead: false,
      completeRegistration: false,
      contact: false,
      subscribe: false,
    },
    audiences: {
      customAudienceSync: true,
      websiteVisitors: true,
      addToCart: true,
      checkout: true,
      purchase: true,
      lookalikeSync: false,
    }
  },
  tiktok: {
    active: true,
    pixelId: 'TT-PXL-900381',
    businessCenterId: 'BC-11203819',
    adAccountId: 'ADV-771289',
    catalogId: 'TT-CAT-11029',
    eventApiToken: 'tt_api_tok_e901a8f2f66304cb3b4aef9b2eb8c1507d',
    accessToken: 'tt_access_89e4cbf8da029bcf8910d6a4fe3',
    events: {
      pageView: true,
      viewContent: true,
      search: true,
      addToWishlist: false,
      addToCart: true,
      checkout: true,
      addPaymentInfo: true,
      purchase: true,
      lead: false,
    }
  },
  google: {
    active: false,
    measurementId: 'G-XNK827B1LZ',
    gtmContainerId: 'GTM-K98ZFXB',
    conversionId: 'AW-110283918-X',
    conversionLabel: 'g_ads_purchase_conv',
    merchantCenterId: 'MC-108239',
    businessProfileId: 'GBP-77312',
    events: {
      productView: true,
      search: true,
      addToWishlist: true,
      addToCart: true,
      beginCheckout: true,
      addPaymentInfo: true,
      purchase: true,
      refund: false,
      conversionValue: true,
    },
    advanced: {
      enhancedEcommerce: true,
      enhancedConversions: true,
      crossDomainTracking: false,
      userIdTracking: true,
    }
  },
  websiteTracking: {
    uniqueVisitors: 4892,
    returningVisitors: 2190,
    sessionDuration: '3m 14s',
    bounceRate: '41.2%',
    toggles: {
      scrollTracking: true,
      clickTracking: true,
      formTracking: true,
      searchTracking: true,
      exitTracking: false,
      buttonTracking: true,
      productInteractionTracking: true,
    },
    utm: {
      source: 'google',
      medium: 'cpc',
      campaign: 'eid_ul_adha_sale',
      content: 'banner_blue',
      term: 'premium_panjabi'
    }
  },
  serverSide: {
    active: true,
    endpointUrl: 'https://ss-capi.tazumart.com/v1/collect',
    trackingToken: 'ss_tok_ef48a901f4cb3b4aef9b2eb8c1507d',
    verificationKey: 'ev_key_88cb3b4aef9',
    hmacSecretKey: 'hmac_tazu_sec_90812390812abc',
    retryQueueStatus: '0 Pending (Healthy)',
    integrations: {
      facebookCapi: true,
      tiktokEventsApi: true,
      googleEnhanced: true,
      googleAdsOffline: false,
    },
    events: {
      pageView: true,
      productView: true,
      search: true,
      addToWishlist: true,
      addToCart: true,
      checkout: true,
      addPaymentInfo: true,
      purchase: true,
      refund: false
    }
  },
  catalog: {
    facebookCatalogSync: true,
    tiktokCatalogSync: false,
    googleMerchantFeed: true,
    autoProductFeedUpdate: true,
    feedValidation: true,
    lastSyncTime: '2026-05-29 12:00:15',
    feedUrl: 'https://tazumart.com/api/catalog/feed.xml',
    syncInterval: 'Every 6 Hours'
  },
  audience: {
    websiteVisitors: true,
    productViewers: true,
    cartAbandoners: true,
    checkoutAbandoners: true,
    purchasers: true,
    lookalikePercentage: '1%',
    syncStatus: 'Active & Synchronized'
  },
  conversion: {
    roas: 4.82,
    cpa: 380, // BDT average cost per acquisition
    cpc: 8.50, // BDT average cost per click
    cpm: 120, // BDT per mile impressions
    ctr: 2.14, // %
    conversionRate: 3.42, // %
    revenue: 472190 // Total converted sales value BDT
  }
};

interface LiveEventLog {
  id: string;
  time: string;
  event: string;
  source: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  status: 'Matched' | 'Synced' | 'Pending';
}

const INITIAL_EVENT_LOGS: LiveEventLog[] = [
  { id: '1', time: '13:31:50', event: 'PageView', source: 'Facebook Pixel', device: 'Mobile', status: 'Matched' },
  { id: '2', time: '13:31:42', event: 'ViewContent', source: 'TikTok API', device: 'Desktop', status: 'Synced' },
  { id: '3', time: '13:31:25', event: 'AddToCart', source: 'GTM Client', device: 'Mobile', status: 'Matched' },
  { id: '4', time: '13:31:10', event: 'InitiateCheckout', source: 'Server CAPI', device: 'Mobile', status: 'Synced' },
  { id: '5', time: '13:30:52', event: 'Purchase', source: 'Server CAPI', device: 'Desktop', status: 'Synced' }
];

export default function AdminMarketingCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeSubTab = (tabParam as any) || 'dashboard';

  const [config, setConfig] = useState<MarketingCenterConfig>(INITIAL_MARKETING_CONFIG);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<{ [key: string]: boolean }>({});
  
  // Realtime simulation state variables
  const [liveVisitors, setLiveVisitors] = useState(38);
  const [pixelFires, setPixelFires] = useState(14872);
  const [eventLogs, setEventLogs] = useState<LiveEventLog[]>(INITIAL_EVENT_LOGS);
  
  // Custom states for interactive modules
  const [calcBudget, setCalcBudget] = useState('15000');
  const [calcReturn, setCalcReturn] = useState('72300');
  const [calcConversions, setCalcConversions] = useState('50');

  const [inputFeedProduct, setInputFeedProduct] = useState('');
  const [feedLogs, setFeedLogs] = useState<string[]>([
    'FB Sync: Successfully fetched 1,480 active products, no issues.',
    'Merchant Feed: 3 product images lacking high resolution warned, feed generated.',
    'TikTok Catalog: Synced via Pixel catalog API.'
  ]);

  const [audienceLogs, setAudienceLogs] = useState<{name: string, size: string, match: string, lastSync: string}[]>([
    { name: 'Last 14D General Visitors', size: '15,480', match: '96.5%', lastSync: '10 Mins Ago' },
    { name: 'High Value Add To Cart', size: '2,920', match: '98.1%', lastSync: '2 Hours Ago' },
    { name: 'Checkout Drop-offs', size: '1,150', match: '97.2%', lastSync: '1 Hour Ago' },
    { name: 'VIP Fashion Segment (Lookalike)', size: '120,500', match: 'High (8.9)', lastSync: '1 Day Ago' }
  ]);

  // Loading data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tazumart_marketing_center_config_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial config to make sure any missing schema items are safely loaded
        setConfig({
          ...INITIAL_MARKETING_CONFIG,
          ...parsed,
          facebook: { ...INITIAL_MARKETING_CONFIG.facebook, ...parsed.facebook },
          tiktok: { ...INITIAL_MARKETING_CONFIG.tiktok, ...parsed.tiktok },
          google: { ...INITIAL_MARKETING_CONFIG.google, ...parsed.google },
          websiteTracking: { ...INITIAL_MARKETING_CONFIG.websiteTracking, ...parsed.websiteTracking },
          serverSide: { ...INITIAL_MARKETING_CONFIG.serverSide, ...parsed.serverSide },
          catalog: { ...INITIAL_MARKETING_CONFIG.catalog, ...parsed.catalog },
          audience: { ...INITIAL_MARKETING_CONFIG.audience, ...parsed.audience },
          conversion: { ...INITIAL_MARKETING_CONFIG.conversion, ...parsed.conversion },
        });
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }
  }, []);

  // Simulation counters
  useEffect(() => {
    const streamTimer = setInterval(() => {
      setLiveVisitors(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.max(15, Math.min(84, prev + delta));
      });
      setPixelFires(prev => prev + Math.floor(Math.random() * 5));
    }, 4000);

    const logTimer = setInterval(() => {
      const events = ['PageView', 'ViewContent', 'Search', 'AddToCart', 'InitiateCheckout', 'Purchase'];
      const origins = ['Facebook Pixel', 'TikTok Events API', 'GTM Client', 'Server CAPI'];
      const devices: ('Mobile' | 'Desktop' | 'Tablet')[] = ['Mobile', 'Desktop', 'Tablet'];
      const statuses: ('Matched' | 'Synced' | 'Pending')[] = ['Matched', 'Synced', 'Pending'];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const randomOrigin = origins[Math.floor(Math.random() * origins.length)];
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const rawTime = new Date();
      const timeString = rawTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

      const nextLog: LiveEventLog = {
        id: Math.random().toString(),
        time: timeString,
        event: randomEvent,
        source: randomOrigin,
        device: randomDevice,
        status: randomStatus
      };

      setEventLogs(prev => [nextLog, ...prev.slice(0, 6)]);
    }, 5500);

    return () => {
      clearInterval(streamTimer);
      clearInterval(logTimer);
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tazumart_marketing_center_config_v2', JSON.stringify(config));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3050);
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleToggleReveal = (key: string) => {
    setVisibleFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setActiveSubTab = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  // Add custom feed validation log
  const handleAddFeedValidation = () => {
    if (!inputFeedProduct.trim()) return;
    const time = new Date().toLocaleTimeString();
    setFeedLogs(prev => [
      `[${time}] Validated Product URL "${inputFeedProduct}": Schema tags (Schema.org/Product) parsed perfectly. Standard matches FB Meta and Google Merchant formatting requirements.`,
      ...prev
    ]);
    setInputFeedProduct('');
  };

  // Safe toggler helpers
  const toggleFacebookEvent = (key: keyof FacebookConfig['events']) => {
    setConfig(prev => ({
      ...prev,
      facebook: {
        ...prev.facebook,
        events: { ...prev.facebook.events, [key]: !prev.facebook.events[key] }
      }
    }));
  };

  const toggleFacebookAudience = (key: keyof FacebookConfig['audiences']) => {
    setConfig(prev => ({
      ...prev,
      facebook: {
        ...prev.facebook,
        audiences: { ...prev.facebook.audiences, [key]: !prev.facebook.audiences[key] }
      }
    }));
  };

  const toggleTikTokEvent = (key: keyof TikTokConfig['events']) => {
    setConfig(prev => ({
      ...prev,
      tiktok: {
        ...prev.tiktok,
        events: { ...prev.tiktok.events, [key]: !prev.tiktok.events[key] }
      }
    }));
  };

  const toggleGoogleEvent = (key: keyof GoogleConfig['events']) => {
    setConfig(prev => ({
      ...prev,
      google: {
        ...prev.google,
        events: { ...prev.google.events, [key]: !prev.google.events[key] }
      }
    }));
  };

  const toggleGoogleAdvanced = (key: keyof GoogleConfig['advanced']) => {
    setConfig(prev => ({
      ...prev,
      google: {
        ...prev.google,
        advanced: { ...prev.google.advanced, [key]: !prev.google.advanced[key] }
      }
    }));
  };

  const toggleWebToggles = (key: keyof WebsiteTrackingConfig['toggles']) => {
    setConfig(prev => ({
      ...prev,
      websiteTracking: {
        ...prev.websiteTracking,
        toggles: { ...prev.websiteTracking.toggles, [key]: !prev.websiteTracking.toggles[key] }
      }
    }));
  };

  const toggleServerEvent = (key: keyof ServerSideTrackingConfig['events']) => {
    setConfig(prev => ({
      ...prev,
      serverSide: {
        ...prev.serverSide,
        events: { ...prev.serverSide.events, [key]: !prev.serverSide.events[key] }
      }
    }));
  };

  const toggleServerIntegration = (key: keyof ServerSideTrackingConfig['integrations']) => {
    setConfig(prev => ({
      ...prev,
      serverSide: {
        ...prev.serverSide,
        integrations: { ...prev.serverSide.integrations, [key]: !prev.serverSide.integrations[key] }
      }
    }));
  };

  // Static performance analytics datasets config
  const chartData = [
    { hour: '08:00', fires: 340, conversions: 12, quality: 84 },
    { hour: '10:00', fires: 512, conversions: 24, quality: 86 },
    { hour: '12:00', fires: 980, conversions: 45, quality: 91 },
    { hour: '14:00', fires: 780, conversions: 38, quality: 89 },
    { hour: '16:00', fires: 1240, conversions: 62, quality: 92 },
    { hour: '18:00', fires: 1650, conversions: 78, quality: 94 },
    { hour: '20:00', fires: 1420, conversions: 70, quality: 95 }
  ];

  // ==========================================
  // HELPER COMPONENT FOR STATUS DOTS
  // ==========================================
  const StatusBullet = ({ active }: { active: boolean }) => (
    <span className={`px-2 py-0.5 text-[8.5px] font-mono font-black border uppercase rounded-[4px] inline-flex items-center gap-1 ${
      active 
        ? 'bg-emerald-50 text-emerald-800 border-emerald-250' 
        : 'bg-zinc-50 text-zinc-400 border-zinc-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
      {active ? 'Active' : 'Disabled'}
    </span>
  );

  return (
    <div className="py-6 px-4 md:px-8 max-w-[1550px] w-full mx-auto space-y-6 font-sans text-left bg-zinc-50/50">
      
      {/* ==========================================
          HEADER & CONTEXT BANNER
          ========================================== */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-zinc-200 pb-5">
         <div>
            <div className="flex items-center gap-2 mb-1.5">
               <span className="bg-black text-white px-2 py-0.5 text-[9px] font-black tracking-widest uppercase rounded-[4px] shadow-sm">
                 ENTERPRISE 3.0
               </span>
               <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Professional Marketing Hub</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-950 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-black" /> Marketing Center
            </h1>
            <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mt-1">
               Fully-integrated advertising telemetry matrix. Configure Facebook CAPI, TikTok API, Google enhanced tag managers and server-to-server endpoints
            </p>
         </div>

         {/* Navigation Pills (Mobile & Desktop Friendly Grid) */}
         <div className="flex flex-wrap gap-1 p-1 bg-zinc-100 rounded-[8px] border border-zinc-200/50 w-full xl:w-auto">
            {[
              { id: 'dashboard', label: 'Overview', icon: BarChart2 },
              { id: 'facebook', label: 'Facebook Marketing', icon: Globe },
              { id: 'tiktok', label: 'TikTok Analytics', icon: CirclePlay },
              { id: 'google', label: 'Google Suite', icon: Cpu },
              { id: 'website', label: 'Website Tracking', icon: Monitor },
              { id: 'serverside', label: 'Server Side', icon: Server },
              { id: 'catalog', label: 'Catalog Sync', icon: FileSpreadsheet },
              { id: 'audience', label: 'Audience Hub', icon: Users },
              { id: 'conversion', label: 'Conversion metrics', icon: Percent },
              { id: 'diagnostics', label: 'Diagnostics', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon || Globe;
              const isSelected = activeSubTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-[6px] transition-all flex items-center gap-1 shrink-0 ${
                    isSelected 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-black hover:bg-zinc-200/50'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
         </div>
      </div>

      {/* Save Success Banner */}
      <AnimatePresence>
      {isSaved && (
        <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-[8px] flex items-center justify-between shadow-xs animate-fade-in">
           <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                 <h4 className="font-sans text-xs font-black uppercase tracking-wider text-emerald-950">Marketing Matrix Config Saved</h4>
                 <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide mt-0.5">All pixel verification tags, catalog payload nodes, and server API integrations updated successfully inside browser storage.</p>
              </div>
           </div>
           <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[4px] uppercase font-black">Synced Active</span>
        </div>
      )}
      </AnimatePresence>

      {/* Copy Field Feedback */}
      {copiedField && (
        <div className="p-2.5 bg-zinc-900 text-white rounded-[6px] text-[10px] uppercase font-bold tracking-widest fixed bottom-4 right-4 z-50 shadow-lg flex items-center gap-1.5">
           <CheckCircle className="w-4 h-4 text-emerald-400" />
           Copied {copiedField} to Clipboard
        </div>
      )}

      {/* ==========================================
          SUBTAB 1: PERFORMANCE DASHBOARD OVERVIEW
          ========================================== */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Stat Card 1 */}
             <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-start">
                   <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">Interactive Live Users</span>
                   <span className="px-2 py-0.5 text-[8.5px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-[4px] uppercase flex items-center gap-0.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                   </span>
                </div>
                <div>
                   <h2 className="text-2xl font-black text-zinc-950 font-mono">{liveVisitors}</h2>
                   <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1">Real-time tracking ping sessions</p>
                </div>
             </div>

             {/* Stat Card 2 */}
             <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-start">
                   <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">Calculated API Duplication</span>
                   <span className="px-2 py-0.5 text-[8.5px] font-mono font-black text-indigo-800 bg-indigo-50 border border-indigo-100 rounded-[4px] uppercase">
                      Healthy Matches
                   </span>
                </div>
                <div>
                   <h2 className="text-2xl font-black text-zinc-950 font-mono">99.82%</h2>
                   <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1">Event deduplication success rate</p>
                </div>
             </div>

             {/* Stat Card 3 */}
             <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-start">
                   <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">Omni-Channel Fires</span>
                   <span className="px-2 py-0.5 text-[8.5px] font-mono font-black text-purple-800 bg-purple-50 border border-purple-100 rounded-[4px] uppercase">
                     Total Signals
                   </span>
                </div>
                <div>
                   <h2 className="text-2xl font-black text-zinc-950 font-mono">{pixelFires.toLocaleString()}</h2>
                   <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1">Combined tag events dispatched</p>
                </div>
             </div>

             {/* Stat Card 4 */}
             <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs flex flex-col justify-between min-h-[110px]">
                <div className="flex justify-between items-start">
                   <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">Attribution Health Score</span>
                   <span className="px-2 py-0.5 text-[8.5px] font-mono font-black text-amber-800 bg-amber-50 border border-amber-100 rounded-[4px] uppercase">
                      Score Card
                   </span>
                </div>
                <div>
                   <h2 className="text-2xl font-black text-zinc-950 font-mono">98/100</h2>
                   <p className="text-[9px] text-zinc-400 font-extrabold uppercase mt-1">Exceptional pixel-matching quality</p>
                </div>
             </div>
          </div>

          {/* Central Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             <div className="lg:col-span-8 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Enterprise Segment Volume</h3>
                      <p className="text-[9px] text-zinc-400 font-extrabold uppercase">Telemetry pixels processed by hours</p>
                   </div>
                </div>
                <div className="h-[250px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                         <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#000000" stopOpacity={0.08}/>
                               <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                         <XAxis dataKey="hour" tick={{ fontSize: 9, fontWeight: '700', fill: '#71717a' }} />
                         <YAxis tick={{ fontSize: 9, fontWeight: '700', fill: '#71717a' }} />
                         <Tooltip contentStyle={{ fontSize: 10, borderRadius: 6, border: '1px solid #e4e4e7' }} />
                         <Area type="monotone" dataKey="fires" stroke="#000000" strokeWidth={2} fill="url(#areaGradient)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="lg:col-span-4 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs flex flex-col justify-between">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-1">Pixel Hub Integrations</h3>
                   <p className="text-[9px] text-zinc-400 font-extrabold uppercase">Live API connectivity endpoints status</p>
                </div>
                <div className="divide-y divide-zinc-100 my-4 flex-1 flex flex-col justify-center">
                   {[
                     { name: 'Meta (Facebook) CAPI API', status: config.facebook.active },
                     { name: 'TikTok Event Match CAPI', status: config.tiktok.active },
                     { name: 'Google Suite Analytics Signal', status: config.google.active },
                     { name: 'Server Side Sync Webhook', status: config.serverSide.active }
                   ].map(api => (
                     <div key={api.name} className="py-2.5 flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-800">{api.name}</span>
                        <StatusBullet active={api.status} />
                     </div>
                   ))}
                </div>
                <div className="bg-zinc-50 p-3 rounded-[6px] border border-zinc-200 text-[10px]">
                   <span className="font-extrabold text-zinc-400 uppercase tracking-wider block">Diagnostics Sync Health</span>
                   <p className="font-black text-zinc-900 uppercase tracking-wide mt-0.5">Dual-Tagging Redundancy Active. Browser cookies are reinforced via high throughput Server-Side APIs.</p>
                </div>
             </div>
          </div>

          {/* Real-time continuous stream table */}
          <div className="bg-white rounded-[8px] border border-zinc-200 overflow-hidden shadow-xs">
             <div className="px-5 py-3 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Real-Time Continuous Stream Analytics</h3>
                   <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5 font-semibold">Active tracing cookies matched to Server-Side backend routers</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-mono bg-zinc-900 text-white rounded font-black tracking-widest uppercase">Stream Enabled</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                   <thead>
                      <tr className="bg-zinc-100/55 border-b border-zinc-200 text-zinc-400 text-[8.5px] uppercase font-black tracking-widest">
                         <th className="p-3 pl-5">Ping Time</th>
                         <th className="p-3">Matched Event Trigger</th>
                         <th className="p-3">Telemetry Origin</th>
                         <th className="p-3">Device Agent</th>
                         <th className="p-3 text-right pr-5">Gateway Sync</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-zinc-100 font-sans font-medium text-zinc-700">
                      {eventLogs.map(log => (
                        <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                           <td className="p-3 pl-5 text-zinc-500 font-mono text-[10px] font-bold">{log.time}</td>
                           <td className="p-3">
                              <span className="bg-zinc-900 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                                 {log.event}
                              </span>
                           </td>
                           <td className="p-3 text-zinc-900 font-bold uppercase text-[9.5px]">{log.source}</td>
                           <td className="p-3 text-zinc-500 text-[10px] uppercase font-black inline-flex items-center gap-1 mt-1">
                              {log.device === 'Mobile' ? <Smartphone className="w-3.5 h-3.5" /> : log.device === 'Tablet' ? <Tablet className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                              {log.device}
                           </td>
                           <td className="p-3 text-right pr-5">
                              <span className={`px-2 py-0.5 rounded-[4px] text-[8.5px] font-black uppercase tracking-wider border ${
                                log.status === 'Synced' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-indigo-50 text-indigo-800 border-indigo-100'
                              }`}>
                                 {log.status}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 2: FB MARKETING (EXPANDED) 
          ========================================== */}
      {activeSubTab === 'facebook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           {/* Left Config Panel */}
           <div className="lg:col-span-8 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Facebook Meta Setup Configurations</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Primary tags, API cookies, and business catalog sync matrices</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{config.facebook.active ? 'ACTIVE' : 'INACTIVE'}</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        facebook: { ...prev.facebook, active: !prev.facebook.active }
                      }))}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors outline-none flex items-center ${config.facebook.active ? 'bg-black' : 'bg-zinc-200'}`}
                    >
                       <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform duration-150 ${config.facebook.active ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>

              {/* Business Assets Form Grid */}
              <div>
                 <span className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400 mb-3.5 block">Business Assets Configurations</span>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'metaBusinessId', label: 'Meta Business BM ID', placeholder: 'Ex: 100238129' },
                      { key: 'businessPortfolioId', label: 'Business Portfolio ID', placeholder: 'Ex: BP-881290382' },
                      { key: 'adAccountId', label: 'Facebook Ads Account ID', placeholder: 'Ex: ACT-90218932' },
                      { key: 'catalogId', label: 'Product Catalog ID', placeholder: 'Ex: CAT-22819201' },
                      { key: 'commerceManagerId', label: 'Commerce Manager ID', placeholder: 'Ex: COMM_MGR-7712108a' },
                      { key: 'facebookPageId', label: 'Official Facebook Page ID', placeholder: 'Ex: FP-3901283921' },
                      { key: 'instagramBusinessAccountId', label: 'Instagram Business Account ID', placeholder: 'Ex: IG-9018312' }
                    ].map(field => (
                      <div key={field.key} className="space-y-1">
                         <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{field.label}</label>
                         <input 
                           type="text"
                           value={(config.facebook as any)[field.key] || ''}
                           onChange={(e) => setConfig(prev => ({
                             ...prev,
                             facebook: { ...prev.facebook, [field.key]: e.target.value }
                           }))}
                           placeholder={field.placeholder}
                           className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-[6px] text-xs font-medium focus:outline-none focus:border-black font-mono"
                         />
                      </div>
                    ))}
                 </div>
              </div>

              {/* Pixel & Events config */}
              <div className="space-y-4 pt-2">
                 <span className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400 block border-b border-zinc-100 pb-2">Pixel Credentials & Conversion Token</span>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Facebook Pixel ID</label>
                       <input 
                         type="text" 
                         value={config.facebook.pixelId}
                         onChange={(e) => setConfig(prev => ({ ...prev, facebook: { ...prev.facebook, pixelId: e.target.value } }))}
                         className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono font-bold"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Dataset ID</label>
                       <input 
                         type="text" 
                         value={config.facebook.datasetId}
                         onChange={(e) => setConfig(prev => ({ ...prev, facebook: { ...prev.facebook, datasetId: e.target.value } }))}
                         className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono font-bold"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Domain Verification Path</label>
                       <input 
                         type="text" 
                         value={config.facebook.domainVerification}
                         onChange={(e) => setConfig(prev => ({ ...prev, facebook: { ...prev.facebook, domainVerification: e.target.value } }))}
                         className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">CAPI API Test Event Code</label>
                       <input 
                         type="text" 
                         value={config.facebook.testEventCode}
                         onChange={(e) => setConfig(prev => ({ ...prev, facebook: { ...prev.facebook, testEventCode: e.target.value } }))}
                         className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono"
                       />
                    </div>
                 </div>

                 {/* Secret Access Token */}
                 <div className="space-y-1 pt-2">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
                       <span>Conversion API & Cloud Access Token</span>
                       <button
                         type="button"
                         onClick={() => handleToggleReveal('fb_token')}
                         className="text-zinc-400 hover:text-black flex items-center gap-1 text-[8.5px] uppercase font-bold"
                       >
                          {visibleFields['fb_token'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {visibleFields['fb_token'] ? 'Hide Secret Key' : 'Reveal Security Credentials'}
                       </button>
                    </div>
                    <input 
                      type={visibleFields['fb_token'] ? 'text' : 'password'}
                      value={config.facebook.accessToken}
                      onChange={(e) => setConfig(prev => ({ ...prev, facebook: { ...prev.facebook, accessToken: e.target.value } }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono bg-zinc-55 text-zinc-800"
                    />
                 </div>
              </div>

              {/* Save CTA */}
              <div className="flex justify-between items-center pt-2">
                 <span className="text-[9.5px] font-bold text-zinc-400 uppercase">Domain Status Indicator: <span className="text-emerald-600 font-extrabold">{config.facebook.domainVerificationStatus}</span></span>
                 <button 
                   onClick={handleSave}
                   className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-2 shadow-sm"
                 >
                    <Save className="w-4 h-4" /> Save Facebook Marketing Matrix
                 </button>
              </div>
           </div>

           {/* Right Column: Events & Audiences list */}
           <div className="lg:col-span-4 space-y-6">
              
              {/* Event toggle scopes */}
              <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">Advanced Triggers Scopes</h3>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Facebook Standard SDK & Server Conversion API Event signals</p>
                 </div>
                 <hr className="border-zinc-100" />
                 <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'pageView', label: 'PageView (Required)' },
                      { key: 'viewContent', label: 'ViewContent' },
                      { key: 'search', label: 'Search Query' },
                      { key: 'addToWishlist', label: 'AddToWishlist' },
                      { key: 'addToCart', label: 'AddToCart' },
                      { key: 'initiateCheckout', label: 'InitiateCheckout' },
                      { key: 'addPaymentInfo', label: 'AddPaymentInfo' },
                      { key: 'purchase', label: 'Purchase Success' },
                      { key: 'lead', label: 'Lead' },
                      { key: 'completeRegistration', label: 'Register' },
                      { key: 'contact', label: 'Contact Submit' },
                      { key: 'subscribe', label: 'Subscribe Fee' }
                    ].map(evt => (
                      <label 
                        key={evt.key} 
                        className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[9.5px] font-bold text-zinc-805"
                      >
                         <span>{evt.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.facebook.events as any)[evt.key]}
                           onChange={() => toggleFacebookEvent(evt.key as any)}
                           className="w-4 h-4 rounded text-black focus:ring-black border-zinc-300 pointer-events-auto"
                         />
                      </label>
                    ))}
                 </div>
              </div>

              {/* Audience Hub Synch */}
              <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">Audience Segment Core-Sync</h3>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Sync Meta Business Segment SDK audiences on page visits</p>
                 </div>
                 <hr className="border-zinc-100" />
                 <div className="space-y-2">
                    {[
                      { key: 'customAudienceSync', label: 'Meta Custom Audience Pipeline Sync' },
                      { key: 'websiteVisitors', label: 'Target Web Visitors Segment (180D)' },
                      { key: 'addToCart', label: 'Flipped Cart Abandoned Segment (14D)' },
                      { key: 'checkout', label: 'Checkout Abandoned Segment (30D)' },
                      { key: 'purchase', label: 'Active VIP Purchasers Hub Sync' },
                      { key: 'lookalikeSync', label: 'Lookalike Audience (1% BD Segment)' }
                    ].map(aud => (
                      <label 
                        key={aud.key}
                        className="flex items-center justify-between p-2.5 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/60 cursor-pointer text-[10px] font-black text-zinc-800 uppercase tracking-wide"
                      >
                         <span>{aud.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.facebook.audiences as any)[aud.key]}
                           onChange={() => toggleFacebookAudience(aud.key as any)}
                           className="w-4 h-4 rounded text-black focus:ring-black border-zinc-300"
                         />
                      </label>
                    ))}
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 3: TIKTOK MARKETING (EXPANDED)
          ========================================== */}
      {activeSubTab === 'tiktok' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           <div className="lg:col-span-8 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">TikTok Professional Commerce Analytics</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Set pixels and custom token APIs to optimize TikTok shopping feeds</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{config.tiktok.active ? 'ACTIVE' : 'INACTIVE'}</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        tiktok: { ...prev.tiktok, active: !prev.tiktok.active }
                      }))}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors outline-none flex items-center ${config.tiktok.active ? 'bg-black' : 'bg-zinc-200'}`}
                    >
                       <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform duration-150 ${config.tiktok.active ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>

              {/* TikTok Forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { key: 'pixelId', label: 'TikTok Pixel Tracker ID' },
                   { key: 'businessCenterId', label: 'TikTok Business Center ID' },
                   { key: 'adAccountId', label: 'Ad Account Tracking ID' },
                   { key: 'catalogId', label: 'TikTok Product SKU Catalog ID' }
                 ].map(field => (
                   <div key={field.key} className="space-y-1">
                      <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">{field.label}</label>
                      <input 
                        type="text" 
                        value={(config.tiktok as any)[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          tiktok: { ...prev.tiktok, [field.key]: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono font-bold"
                      />
                   </div>
                 ))}
              </div>

              {/* Secret keys */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                 <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">TikTok Events Conversion API Token</label>
                    <input 
                      type="password"
                      value={config.tiktok.eventApiToken}
                      onChange={(e) => setConfig(prev => ({ ...prev, tiktok: { ...prev.tiktok, eventApiToken: e.target.value } }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Core Access Token (OAuth Matrix)</label>
                    <input 
                      type="password"
                      value={config.tiktok.accessToken}
                      onChange={(e) => setConfig(prev => ({ ...prev, tiktok: { ...prev.tiktok, accessToken: e.target.value } }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono"
                    />
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button 
                   onClick={handleSave}
                   className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-sm"
                 >
                    <Save className="w-4 h-4" /> Save TikTok Parameters
                 </button>
              </div>
           </div>

           {/* Event checklists */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">TikTok Standard Events</h3>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Dispatched tracking triggers for short-video commerce ads Optimization</p>
                 </div>
                 <hr className="border-zinc-100" />
                 <div className="space-y-2">
                    {[
                      { key: 'pageView', label: 'PageView (Interactive)' },
                      { key: 'viewContent', label: 'ViewContent (PDP View)' },
                      { key: 'search', label: 'Search Item Trigger' },
                      { key: 'addToWishlist', label: 'AddToWishlist Analytics' },
                      { key: 'addToCart', label: 'AddToCart Session' },
                      { key: 'checkout', label: 'Checkouts Trigger' },
                      { key: 'addPaymentInfo', label: 'Submit Payment Info' },
                      { key: 'purchase', label: 'Complete Purchase Order' },
                      { key: 'lead', label: 'Registration Interest' }
                    ].map(evt => (
                      <label 
                        key={evt.key}
                        className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-bold text-zinc-800"
                      >
                         <span>{evt.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.tiktok.events as any)[evt.key]}
                           onChange={() => toggleTikTokEvent(evt.key as any)}
                           className="w-4 h-4 rounded text-black focus:ring-black border-zinc-300"
                         />
                      </label>
                    ))}
                 </div>
              </div>

               {/* Diagnostics card for TikTok */}
              <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-3">
                 <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">TikTok Metrics Diagnostics</span>
                 <div className="space-y-2 text-[10.5px]">
                    <div className="flex justify-between">
                       <span className="text-zinc-500">Pixel Delivery Diagnostics</span>
                       <span className="font-extrabold text-emerald-600">Excellent (94%)</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-zinc-500">Event Match Standard</span>
                       <span className="font-extrabold text-indigo-600">Matched CAPI API</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-zinc-500">Catalog Sync Status</span>
                       <span className="font-extrabold text-zinc-900">Synchronized Sync</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 4: GOOGLE ANALYTICS & ADS (EXPANDED)
          ========================================== */}
      {activeSubTab === 'google' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           <div className="lg:col-span-8 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Google Measurement Suite Configuration</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Setup GA4, GTM tags, Merchant Center and Enhanced Customer Conversions data</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{config.google.active ? 'ACTIVE' : 'INACTIVE'}</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        google: { ...prev.google, active: !prev.google.active }
                      }))}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors outline-none flex items-center ${config.google.active ? 'bg-black' : 'bg-zinc-200'}`}
                    >
                       <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform duration-150 ${config.google.active ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>

              {/* Google inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { key: 'measurementId', label: 'GA4 Measurement Stream ID (G-xxxx)' },
                   { key: 'gtmContainerId', label: 'GTM Container Tracking ID (GTM-xxxx)' },
                   { key: 'conversionId', label: 'Google Ads Conversion Tag ID' },
                   { key: 'conversionLabel', label: 'Google Ads Purchase Label' },
                   { key: 'merchantCenterId', label: 'Google Merchant Center ID' },
                   { key: 'businessProfileId', label: 'Google Business Profile Store ID' }
                 ].map(field => (
                   <div key={field.key} className="space-y-1">
                      <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">{field.label}</label>
                      <input 
                        type="text" 
                        value={(config.google as any)[field.key] || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          google: { ...prev.google, [field.key]: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono font-bold"
                      />
                   </div>
                 ))}
              </div>

              {/* Advanced Optimization Options toggles */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Google Conversion Optimization Methods</span>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'enhancedEcommerce', label: 'Google Enhanced Ecommerce Purchase tracking' },
                      { key: 'enhancedConversions', label: 'Google Enhanced Conversions (SHA256 privacy hashed data)' },
                      { key: 'crossDomainTracking', label: 'Google Analytics Safe Cross Domain Cookie Session Tracking' },
                      { key: 'userIdTracking', label: 'Authenticated Customer User ID sync' }
                    ].map(adv => (
                      <label 
                        key={adv.key}
                        className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-black text-zinc-805 uppercase tracking-wide"
                      >
                         <span>{adv.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.google.advanced as any)[adv.key]}
                           onChange={() => toggleGoogleAdvanced(adv.key as any)}
                           className="w-4.5 h-4.5 rounded text-black focus:ring-black border-zinc-350"
                         />
                      </label>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button 
                   onClick={handleSave}
                   className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-sm"
                 >
                    <Save className="w-4 h-4" /> Save Google tag parameters
                 </button>
              </div>
           </div>

           {/* Event checklists */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">Fired GA4 Event Tags</h3>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Universal e-commerce signals mapped to GA4 and Google Ads tags</p>
                 </div>
                 <hr className="border-zinc-100" />
                 <div className="space-y-2">
                    {[
                      { key: 'productView', label: 'view_item (PDP View Check)' },
                      { key: 'search', label: 'search_query' },
                      { key: 'addToWishlist', label: 'add_to_wishlist' },
                      { key: 'addToCart', label: 'add_to_cart' },
                      { key: 'beginCheckout', label: 'begin_checkout sequence' },
                      { key: 'addPaymentInfo', label: 'add_payment_info' },
                      { key: 'purchase', label: 'purchase order successful' },
                      { key: 'refund', label: 'refund' },
                      { key: 'conversionValue', label: 'GAds conversion_value tracking flag' }
                    ].map(evt => (
                      <label 
                        key={evt.key}
                        className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-bold text-zinc-800"
                      >
                         <span>{evt.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.google.events as any)[evt.key]}
                           onChange={() => toggleGoogleEvent(evt.key as any)}
                           className="w-4 h-4 rounded text-black focus:ring-black border-zinc-300"
                         />
                      </label>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 5: WEBSITE TRACKING (EXPANDED)
          ========================================== */}
      {activeSubTab === 'website' && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Advanced Website Behavior Analytics</h3>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Analyze real-time visitor interactions, scroll logs, bounce statistics, and live query campaigns</p>
              </div>

              {/* KPI indicators row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-50 p-4 border border-zinc-200 rounded-[8px]">
                 <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Total Unique Visitors</span>
                    <h4 className="text-xl font-bold text-zinc-950 font-mono mt-0.5">{config.websiteTracking.uniqueVisitors.toLocaleString()}</h4>
                 </div>
                 <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Returning Customers</span>
                    <h4 className="text-xl font-bold text-zinc-950 font-mono mt-0.5">{config.websiteTracking.returningVisitors.toLocaleString()}</h4>
                 </div>
                 <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Mean Session Duration</span>
                    <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{config.websiteTracking.sessionDuration}</h4>
                 </div>
                 <div>
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Session Bounce Rate</span>
                    <h4 className="text-xl font-bold text-zinc-900 mt-0.5">{config.websiteTracking.bounceRate}</h4>
                 </div>
              </div>

              {/* Tracking switches list */}
              <div className="space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block border-b border-zinc-100 pb-2">Interaction Tracking Switches</span>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { key: 'scrollTracking', label: 'Monitor Scroll depth' },
                      { key: 'clickTracking', label: 'Log link/CTA clicks' },
                      { key: 'formTracking', label: 'Form submission logs' },
                      { key: 'searchTracking', label: 'Internal Search tags' },
                      { key: 'exitTracking', label: 'Detect user page exits' },
                      { key: 'buttonTracking', label: 'Button click triggers' },
                      { key: 'productInteractionTracking', label: 'Live physical product clicks' }
                    ].map(item => (
                      <label 
                        key={item.key}
                        className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-black text-zinc-800 uppercase tracking-wide"
                      >
                         <span>{item.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.websiteTracking.toggles as any)[item.key]}
                           onChange={() => toggleWebToggles(item.key as any)}
                           className="w-4.5 h-4.5 rounded text-black focus:ring-black border-zinc-350"
                         />
                      </label>
                    ))}
                 </div>
              </div>

              {/* UTM Campaign builders */}
              <div className="space-y-4 pt-3 border-t border-zinc-150">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">E-commerce Ad Campaign UTM Parameter Builder</span>
                 <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                    {[
                      { key: 'source', label: 'UTM Source', placeholder: 'google / facebook / newsletter' },
                      { key: 'medium', label: 'UTM Medium', placeholder: 'cpc / social / banner' },
                      { key: 'campaign', label: 'UTM Campaign Name', placeholder: 'sacred_feast_bazar_sale' },
                      { key: 'content', label: 'UTM Content Banner', placeholder: 'carousel_photo' },
                      { key: 'term', label: 'UTM Term Search', placeholder: 'leather_bags_bdt' }
                    ].map(field => (
                      <div key={field.key} className="space-y-1">
                         <label className="text-[8.5px] font-black uppercase tracking-widest text-zinc-500">{field.label}</label>
                         <input 
                           type="text"
                           value={(config.websiteTracking.utm as any)[field.key] || ''}
                           onChange={(e) => setConfig(prev => ({
                             ...prev,
                             websiteTracking: {
                               ...prev.websiteTracking,
                               utm: { ...prev.websiteTracking.utm, [field.key]: e.target.value }
                             }
                           }))}
                           placeholder={field.placeholder}
                           className="w-full px-3 py-1.5 border border-zinc-200 rounded-[4px] text-xs font-mono font-bold"
                         />
                      </div>
                    ))}
                 </div>

                 {/* Calculated URL output box */}
                 <div className="bg-zinc-100 p-3 rounded-[6px] border border-zinc-200 text-xs flex justify-between items-center mt-3">
                    <div className="flex-1 mr-4 overflow-hidden text-ellipsis whitespace-nowrap">
                       <span className="text-[8.5px] font-black text-zinc-400 block uppercase mb-1">Calculated Campaign Target Destination URL</span>
                       <span className="font-mono text-zinc-700 select-all font-semibold">
                          {`https://tazumart.com/?utm_source=${config.websiteTracking.utm.source}&utm_medium=${config.websiteTracking.utm.medium}&utm_campaign=${config.websiteTracking.utm.campaign}&utm_content=${config.websiteTracking.utm.content}&utm_term=${config.websiteTracking.utm.term}`}
                       </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleCopy(`https://tazumart.com/?utm_source=${config.websiteTracking.utm.source}&utm_medium=${config.websiteTracking.utm.medium}&utm_campaign=${config.websiteTracking.utm.campaign}&utm_content=${config.websiteTracking.utm.content}&utm_term=${config.websiteTracking.utm.term}`, 'utm')}
                      className="px-3 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-wider rounded"
                    >
                       Copy URL
                    </button>
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button 
                   onClick={handleSave}
                   className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-sm"
                 >
                    <Save className="w-4 h-4" /> Save Website Analytics Tags
                 </button>
              </div>

           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 6: SERVER SIDE TRACKING (EXPANDED)
          ========================================== */}
      {activeSubTab === 'serverside' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           <div className="lg:col-span-8 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Server Side Conversion API Tracking Gateway</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Setup secure cloud tracking proxies to bypass iOS ad-blocker restrictions</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">{config.serverSide.active ? 'ACTIVE' : 'INACTIVE'}</span>
                    <button
                      type="button"
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        serverSide: { ...prev.serverSide, active: !prev.serverSide.active }
                      }))}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors outline-none flex items-center ${config.serverSide.active ? 'bg-black' : 'bg-zinc-200'}`}
                    >
                       <div className={`w-5 h-5 bg-white rounded-full shadow-xs transform transition-transform duration-150 ${config.serverSide.active ? 'translate-x-[24px]' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>

              {/* Configuration fields */}
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Secure Server CAPI Endpoint URL</label>
                    <input 
                      type="text" 
                      value={config.serverSide.endpointUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, serverSide: { ...prev.serverSide, endpointUrl: e.target.value } }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono font-bold"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Server Authorization Token</label>
                       <input 
                         type="password" 
                         value={config.serverSide.trackingToken}
                         onChange={(e) => setConfig(prev => ({ ...prev, serverSide: { ...prev.serverSide, trackingToken: e.target.value } }))}
                         className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Event Verification Handshake Key</label>
                       <input 
                         type="password" 
                         value={config.serverSide.verificationKey}
                         onChange={(e) => setConfig(prev => ({ ...prev, serverSide: { ...prev.serverSide, verificationKey: e.target.value } }))}
                         className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Secure HMAC Cryptographic Key</label>
                       <input 
                         type="password" 
                         value={config.serverSide.hmacSecretKey}
                         onChange={(e) => setConfig(prev => ({ ...prev, serverSide: { ...prev.serverSide, hmacSecretKey: e.target.value } }))}
                         className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Fallback Queued Cache Retry Mode</label>
                       <input 
                         type="text" 
                         readOnly
                         value={config.serverSide.retryQueueStatus}
                         className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[6px] text-xs font-mono font-bold text-zinc-500"
                       />
                    </div>
                 </div>
              </div>

              {/* Platform syncing syncs */}
              <div className="space-y-3 pt-3 border-t border-zinc-150">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Omni-Channel Sync Providers</span>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {[
                      { key: 'facebookCapi', label: 'Meta Conversions API (CAPI)' },
                      { key: 'tiktokEventsApi', label: 'TikTok Events API Protocol' },
                      { key: 'googleEnhanced', label: 'Google Analytics Advanced Conversions' },
                      { key: 'googleAdsOffline', label: 'Google Ads Server CRM Offline Conversions' }
                    ].map(provider => (
                      <label 
                        key={provider.key}
                        className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-155 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-black text-zinc-805 uppercase tracking-wide"
                      >
                         <span>{provider.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.serverSide.integrations as any)[provider.key]}
                           onChange={() => toggleServerIntegration(provider.key as any)}
                           className="w-4.5 h-4.5 rounded text-black focus:ring-black border-zinc-300"
                         />
                      </label>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button 
                   onClick={handleSave}
                   className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-sm"
                 >
                    <Save className="w-4 h-4" /> Save Server Side tracking Setup
                 </button>
              </div>
           </div>

           {/* Event checklists */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">Active CAPI Server Events</h3>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Conversions triggered directly within Tazumart backend routers</p>
                 </div>
                 <hr className="border-zinc-100" />
                 <div className="space-y-2 font-medium">
                    {[
                      { key: 'pageView', label: 'PageView / route_change' },
                      { key: 'productView', label: 'view_item (PDP load event)' },
                      { key: 'search', label: 'search_query backend search' },
                      { key: 'addToWishlist', label: 'add_to_wishlist database sync' },
                      { key: 'addToCart', label: 'add_to_cart database persistent cache' },
                      { key: 'checkout', label: 'begin_checkout sequence' },
                      { key: 'addPaymentInfo', label: 'store_payment_info verification' },
                      { key: 'purchase', label: 'purchase payment verified order' },
                      { key: 'refund', label: 'refund refund_chargebacks' }
                    ].map(evt => (
                      <label 
                        key={evt.key}
                        className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-bold text-zinc-800"
                      >
                         <span>{evt.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.serverSide.events as any)[evt.key]}
                           onChange={() => toggleServerEvent(evt.key as any)}
                           className="w-4 h-4 rounded text-black focus:ring-black border-zinc-300"
                         />
                      </label>
                    ))}
                 </div>
              </div>

               <div className="bg-zinc-900 text-white p-5 rounded-[8px] space-y-2">
                  <span className="text-[9px] font-black bg-zinc-850 px-2 py-0.5 text-emerald-400 border border-zinc-800 rounded tracking-widest uppercase">
                     Live Debug CAPI Logs
                  </span>
                  <div className="font-mono text-[9px] text-zinc-400 space-y-1.5 max-h-[140px] overflow-y-auto">
                     <p className="text-emerald-400">[2026-05-29 13:30:12] INFO: Server PageView synced with Meta CAPI. Score: 9.4/10</p>
                     <p className="text-zinc-500">[2026-05-29 13:29:50] WARN: Duplication key matched, dropped client trigger to prevent duplicates</p>
                     <p className="text-emerald-400">[2026-05-29 13:28:11] INFO: Server Purchase Order generated, successfully pushed payload to Facebook & GADS offline endpoints</p>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 7: CATALOG MANAGER (NEW TAB)
          ========================================== */}
      {activeSubTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           <div className="lg:col-span-8 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Advanced Catalog Manager & Product Feeds</h3>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Generate dynamic XML/JSON feeds for Facebook, TikTok and Google Merchant platforms</p>
              </div>

              {/* Feed Configurations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Live Dynamic Feed URL</label>
                    <input 
                      type="text" 
                      value={config.catalog.feedUrl}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        catalog: { ...prev.catalog, feedUrl: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-mono font-bold font-semibold"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9.5px] font-black uppercase tracking-widest text-zinc-500">Dynamic Update Interval</label>
                    <select 
                      value={config.catalog.syncInterval}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        catalog: { ...prev.catalog, syncInterval: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-[6px] text-xs font-medium focus:outline-none focus:border-black"
                    >
                       <option value="Every 1 Hour">Every 1 Hour (Enterprise VIP)</option>
                       <option value="Every 6 Hours">Every 6 Hours (Standard Pro)</option>
                       <option value="Every 24 Hours">Every 24 Hours</option>
                       <option value="Manual Only">Manual Feed Refresh Only</option>
                    </select>
                 </div>
              </div>

              {/* Feed Sync Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3">
                 {[
                   { key: 'facebookCatalogSync', label: 'Push dynamic updates to Facebook Catalog' },
                   { key: 'tiktokCatalogSync', label: 'Push dynamic updates to TikTok Catalog' },
                   { key: 'googleMerchantFeed', label: 'Activate Google Merchant Product Feed (xml)' },
                   { key: 'autoProductFeedUpdate', label: 'Automatically sync stock updates immediately' },
                   { key: 'feedValidation', label: 'Trigger automated pre-publishing verification tests' }
                 ].map(item => (
                   <label 
                     key={item.key}
                     className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-black text-zinc-800 uppercase tracking-wide"
                   >
                      <span>{item.label}</span>
                      <input 
                        type="checkbox"
                        checked={(config.catalog as any)[item.key]}
                        onChange={() => setConfig(prev => ({
                          ...prev,
                          catalog: { ...prev.catalog, [item.key]: !(prev.catalog as any)[item.key] }
                        }))}
                        className="w-4.5 h-4.5 rounded text-black focus:ring-black border-zinc-350"
                      />
                   </label>
                 ))}
              </div>

              {/* Live interactive checker input wrapper */}
              <div className="space-y-2.5 pt-4 border-t border-zinc-100">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Interactive Pre-Publish Validation Testing Terminal</span>
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={inputFeedProduct}
                      onChange={(e) => setInputFeedProduct(e.target.value)}
                      placeholder="Insert Tazumart Product Slug URL to test (e.g., premium-punjabi-cotton)"
                      className="flex-1 px-3 py-2 border border-zinc-200 rounded-[6px] text-xs focus:outline-none focus:border-black font-semibold"
                    />
                    <button 
                      type="button"
                      onClick={handleAddFeedValidation}
                      className="px-4 py-2 bg-neutral-900 text-white hover:bg-black text-[9.5px] font-black uppercase tracking-widest rounded"
                    >
                       Run Validation Match
                    </button>
                 </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                 <span className="text-zinc-400 font-bold uppercase">LAST AUTOMATED SYNC TIMESTAMP: <span className="font-mono text-zinc-900">{config.catalog.lastSyncTime}</span></span>
                 <button 
                   onClick={handleSave}
                   className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-sm"
                 >
                    <Save className="w-4 h-4" /> Save Catalog Configurations
                 </button>
              </div>
           </div>

           {/* Live Feed Event Logs */}
           <div className="lg:col-span-4 bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-4">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">Active Catalog Status</h3>
                 <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Pre-flight checks, feeds generated, and warning alerts</p>
              </div>
              <hr className="border-zinc-100" />
              <div className="space-y-2 font-mono text-[9.5px] max-h-[350px] overflow-y-auto">
                 {feedLogs.map((log, idx) => (
                   <div key={idx} className="p-2.5 bg-zinc-50 border border-zinc-150 rounded text-zinc-650 leading-relaxed font-bold">
                      {log}
                   </div>
                 ))}
                 <div className="p-3 bg-emerald-50 border border-emerald-150 rounded text-[9.5px] text-emerald-800">
                    <span className="font-black block uppercase mb-1 text-emerald-955">Schema Status Checker</span>
                    ✓ Google merchant compatibility verified.<br/>
                    ✓ Facebook meta tag properties match.<br/>
                    ✓ OpenGraph product tags detected correctly.
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 8: AUDIENCE MANAGER (NEW TAB)
          ========================================== */}
      {activeSubTab === 'audience' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
           <div className="lg:col-span-8 bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Custom Audience cohort Builder & Lookalikes</h3>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Configure retargeting cohorts and synced Lookalike groupings across systems</p>
              </div>

              {/* Dynamic toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-[8px] flex justify-between items-center">
                    <div>
                       <span className="text-xs font-black text-zinc-800 block uppercase">Faceted lookalike Percentage</span>
                       <span className="text-[9.5px] text-zinc-400 block uppercase font-bold mt-0.5">Define broad matching precision scales</span>
                    </div>
                    <select 
                      value={config.audience.lookalikePercentage}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        audience: { ...prev.audience, lookalikePercentage: e.target.value }
                      }))}
                      className="px-3.5 py-1.5 border border-zinc-200 text-xs font-mono font-bold bg-white rounded"
                    >
                       <option value="1%">1% Accurate (Highest CPC conversions)</option>
                       <option value="2%">2% Optimized</option>
                       <option value="5%">5% High Impressions volume</option>
                       <option value="10%">10% Extreme Scale</option>
                    </select>
                 </div>

                 <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-[8px] flex justify-between items-center">
                    <div>
                       <span className="text-xs font-black text-zinc-800 block uppercase">Cohort Synch Status</span>
                       <span className="text-[9.5px] text-zinc-400 block uppercase font-bold mt-0.5">Enterprise trigger pipeline status</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border-emerald-150 border uppercase rounded text-[9.5px] font-black">
                       Active Realtime
                    </span>
                 </div>
              </div>

              {/* Active segments */}
              <div className="space-y-3.5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">Retargeting Segment Triggers</span>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'websiteVisitors', label: 'Monitor general web visitors segment' },
                      { key: 'productViewers', label: 'PDP viewers / high-interest cohorts' },
                      { key: 'cartAbandoners', label: 'Shopping cart abandoners retargeting dynamic' },
                      { key: 'checkoutAbandoners', label: 'Checkout abandoned drop-offs sequence tag' },
                      { key: 'purchasers', label: 'VIP Repeat lifetime buyers segment' }
                    ].map(cohort => (
                      <label 
                        key={cohort.key}
                        className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-150 rounded-[4px] hover:bg-zinc-100/50 cursor-pointer text-[10px] font-black text-zinc-80"
                      >
                         <span className="uppercase tracking-wide">{cohort.label}</span>
                         <input 
                           type="checkbox"
                           checked={(config.audience as any)[cohort.key]}
                           onChange={() => setConfig(prev => ({
                             ...prev,
                             audience: { ...prev.audience, [cohort.key]: !(prev.audience as any)[cohort.key] }
                           }))}
                           className="w-4.5 h-4.5 rounded text-black focus:ring-black border-zinc-300"
                         />
                      </label>
                    ))}
                 </div>
              </div>

              {/* Interactive audience creator simulation form */}
              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-[8px] space-y-3">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950 block">Create Retargeting Custom Segment Cohort</span>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      id="new-aud-name"
                      placeholder="Retargeting Audience Name"
                      className="px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded focus:outline-none"
                    />
                    <select 
                      id="new-aud-days"
                      className="px-2 py-1.5 text-xs bg-white border border-zinc-200 rounded focus:outline-none"
                    >
                       <option value="14">Last 14 Days Visit</option>
                       <option value="30">Last 30 Days Visit</option>
                       <option value="180">Last 180 Days Visit</option>
                    </select>
                    <button 
                      type="button"
                      onClick={() => {
                        const nameEl = document.getElementById('new-aud-name') as HTMLInputElement;
                        const daysEl = document.getElementById('new-aud-days') as HTMLSelectElement;
                        if (!nameEl?.value) return;
                        setAudienceLogs(prev => [
                          { name: nameEl.value, size: 'Calculating...', match: 'Optimizing...', lastSync: 'Just Created' },
                          ...prev
                        ]);
                        nameEl.value = '';
                      }}
                      className="px-4 py-1.5 bg-black hover:bg-zinc-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded"
                    >
                       Deploy New Cohort
                    </button>
                 </div>
              </div>

              <div className="flex justify-end pt-2">
                 <button 
                   onClick={handleSave}
                   className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-[9.5px] font-black uppercase tracking-widest rounded flex items-center gap-1.5 shadow-sm"
                 >
                    <Save className="w-4 h-4" /> Sync Audience Parameters
                 </button>
              </div>

           </div>

           {/* Live audiences cohort list */}
           <div className="lg:col-span-4 bg-white p-5 rounded-[8px] border border-zinc-200 shadow-xs space-y-4">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-zinc-950">Active Synced Audiences</h3>
                 <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Telemetry segments matched against Meta & Google networks</p>
              </div>
              <hr className="border-zinc-100" />
              <div className="space-y-3">
                 {audienceLogs.map((aud, idx) => (
                   <div key={idx} className="p-3 bg-zinc-50 border border-zinc-150 rounded-[6px] space-y-1">
                      <span className="text-[10px] font-black text-zinc-800 block uppercase tracking-wide">{aud.name}</span>
                      <div className="flex justify-between items-center text-[9px] text-zinc-400 font-extrabold uppercase font-mono">
                         <span>Size: {aud.size}</span>
                         <span>Match: {aud.match}</span>
                         <span>Refreshed: {aud.lastSync}</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 9: CONVERSION CENTER (NEW TAB)
          ========================================== */}
      {activeSubTab === 'conversion' && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div>
                 <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Conversion Center Analytics (ROAS, CPA, CAC & Conversions)</h3>
                 <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Examine marketing channels metrics, CTR, conversion rates, and ROI calculations</p>
              </div>

              {/* Conversion Scoreboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                 {[
                   { label: 'Attributed ROAS', val: `${config.conversion.roas}x`, col: 'text-zinc-900' },
                   { label: 'Cost Per Acquisition', val: `৳ ${config.conversion.cpa}`, col: 'text-zinc-900' },
                   { label: 'Cost Per Click', val: `৳ ${config.conversion.cpc}`, col: 'text-zinc-900' },
                   { label: 'CPM (1,000 Views)', val: `৳ ${config.conversion.cpm}`, col: 'text-zinc-900' },
                   { label: 'Mean CTR Rate', val: `${config.conversion.ctr}%`, col: 'text-zinc-900' },
                   { label: 'Conversion Rate', val: `${config.conversion.conversionRate}%`, col: 'text-zinc-900' },
                   { label: 'Attributed Revenue', val: `৳ ${config.conversion.revenue.toLocaleString()}`, col: 'text-zinc-900 font-mono font-bold' }
                 ].map(card => (
                   <div key={card.label} className="bg-zinc-50/70 p-3.5 border border-zinc-200 rounded-[6px] text-center">
                      <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400 block mb-1">{card.label}</span>
                      <span className={`text-base font-black ${card.col}`}>{card.val}</span>
                   </div>
                 ))}
              </div>

              {/* Live interactive ROAS Attribution & scaling calculator */}
              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-[8px] space-y-4">
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-950">Attributed ROAS & Profitability scaling Calculator</h4>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">Test potential revenue generation by scaling Facebook and Google Ads spend rates</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Scheduled Ad Spent (BDT)</label>
                       <input 
                         type="number" 
                         value={calcBudget}
                         onChange={(e) => setCalcBudget(e.target.value)}
                         className="w-full px-3 py-2 border border-zinc-200 rounded text-xs font-mono font-bold bg-white"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Attributed Total Converted Return (BDT)</label>
                       <input 
                         type="number" 
                         value={calcReturn}
                         onChange={(e) => setCalcReturn(e.target.value)}
                         className="w-full px-3 py-2 border border-zinc-200 rounded text-xs font-mono font-bold bg-white"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Total Purchase Conversions count</label>
                       <input 
                         type="number" 
                         value={calcConversions}
                         onChange={(e) => setCalcConversions(e.target.value)}
                         className="w-full px-3 py-2 border border-zinc-200 rounded text-xs font-mono font-bold bg-white"
                       />
                    </div>
                 </div>

                 {/* Calculated outputs */}
                 {calcBudget && calcReturn && calcConversions && (
                   <div className="p-4 bg-zinc-900 text-white rounded-[6px] grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                         <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">CALCULATED ROAS</span>
                         <p className="text-lg font-black text-white">
                            {(parseFloat(calcReturn) / Math.max(1, parseFloat(calcBudget))).toFixed(2)}x
                         </p>
                      </div>
                      <div>
                         <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">CALCULATED CPA</span>
                         <p className="text-lg font-black text-white">
                            ৳ {(parseFloat(calcBudget) / Math.max(1, parseFloat(calcConversions))).toFixed(0)}
                         </p>
                      </div>
                      <div>
                         <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">ROI PERCENTAGE</span>
                         <p className="text-lg font-black text-emerald-400">
                            {(((parseFloat(calcReturn) - parseFloat(calcBudget)) / Math.max(1, parseFloat(calcBudget))) * 100).toFixed(0)}%
                         </p>
                      </div>
                      <div>
                         <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">MARGIN SCALE</span>
                         <p className="text-lg font-black text-indigo-300">
                            {(((parseFloat(calcReturn) - parseFloat(calcBudget)) / Math.max(1, parseFloat(calcReturn))) * 100).toFixed(0)}% Profit
                         </p>
                      </div>
                   </div>
                 )}
              </div>

               <div className="flex gap-4">
                  <div className="w-1/2 p-4 bg-emerald-50 text-emerald-900 border border-emerald-250 rounded-[8px] text-[10.5px]">
                     <span className="font-black uppercase tracking-wider block text-emerald-950">Attributed ROAS Optimization Recommendation</span>
                     <p className="mt-1 leading-relaxed text-[10px] font-bold text-emerald-700">
                        Based on the current ROAS scale of 4.82x across Facebook campaign, you should scale budget up by 15% using lookalike cohorts defined inside Audience Manager.
                     </p>
                  </div>
                  <div className="w-1/2 p-4 bg-zinc-100 text-zinc-800 border border-zinc-200 rounded-[8px] text-[10.5px]">
                     <span className="font-semibold uppercase tracking-wider block text-zinc-950 font-black">Attribution Protocol Configuration</span>
                     <p className="mt-1 leading-relaxed text-[10px] font-bold text-zinc-500">
                        Attribution standard is locked to **7-Day Click / 1-Day View** default. Server conversions API reports duplication matching within a 5-minute threshold.
                     </p>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* ==========================================
          SUBTAB 10: PIXEL DIAGNOSTICS (NEW TAB)
          ========================================== */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-6">
           <div className="bg-white p-6 rounded-[8px] border border-zinc-200 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4">
                 <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Pixel Diagnostics Core & Signal Error Detection</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Real-time scan logs and warning flags on customer e-commerce event triggers</p>
                 </div>
                 <button 
                   type="button" 
                   onClick={() => {
                     const logsEl = document.getElementById('debug-terminal-output') as HTMLDivElement;
                     if (logsEl) {
                       logsEl.innerHTML = `[PING] Synchronized and matched pixel checks triggered...\n` +
                         `[OK] Meta pixel FB-9981024-X2 is online and successfully listening to browser routes.\n` +
                         `[OK] GTM GA4 measurement tag is running without duplication errors.\n` + 
                         `[OK] Conversion API token validated, handshake status verified.\n` +
                         `[DIAGNOSTICS] Done, 0 errors, 1 warning detected. Ready.`;
                     }
                   }}
                   className="px-4.5 py-1.5 bg-zinc-900 hover:bg-black text-white text-[9.5px] font-black uppercase tracking-widest rounded transition flex items-center gap-1.5"
                >
                   <RefreshCw className="w-3.5 h-3.5" /> Force Full System Scan
                </button>
              </div>

              {/* Diagnostics statistics grids */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-[8px] flex items-center gap-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
                    <div>
                       <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Attribution Status</span>
                       <h4 className="text-xs font-black text-zinc-950 mt-0.5 uppercase">All Systems Synced</h4>
                    </div>
                 </div>

                 <div className="bg-zinc-55 p-4 border border-zinc-200 rounded-[8px] flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                    <div>
                       <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Warnings Checked</span>
                       <h4 className="text-xs font-black text-zinc-950 mt-0.5 uppercase">1 Minor Alert</h4>
                    </div>
                 </div>

                 <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-[8px] flex items-center gap-4">
                    <Cpu className="w-8 h-8 text-black shrink-0" />
                    <div>
                       <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Handshake latency</span>
                       <h4 className="text-xs font-bold text-zinc-900 mt-0.5">84ms (Excellent)</h4>
                    </div>
                 </div>

                 <div className="bg-zinc-55 p-4 border border-zinc-250 rounded-[8px] flex items-center gap-4">
                    <ShieldCheck className="w-8 h-8 text-purple-650 shrink-0" />
                    <div>
                       <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400">Core Security</span>
                       <h4 className="text-xs font-black text-zinc-950 mt-0.5 uppercase">SHA-256 Hashing Enforced</h4>
                    </div>
                 </div>
              </div>

              {/* Detected exceptions list */}
              <div className="space-y-3.5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block border-b border-zinc-100 pb-2">Active Telemetry Exceptions Log</span>
                 <div className="space-y-2">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-[6px] flex justify-between items-center text-xs">
                       <div className="flex gap-2 items-center">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-amber-950">Warning: GA4 Measurement Stream G-XNK827B1LZ did not receive any events for 24h</span>
                       </div>
                       <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">Currently Disabled</span>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[6px] flex justify-between items-center text-xs">
                       <div className="flex gap-2 items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-950">Verify CAPI match: Facebook Pixel matched with Server CAPI for PageView trigger</span>
                       </div>
                       <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">Healthy handshakes</span>
                    </div>

                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[6px] flex justify-between items-center text-xs">
                       <div className="flex gap-2 items-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-950">Verify deduplication: Removed duplicated purchase tags synced over SSL</span>
                       </div>
                       <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">Fully Healthy</span>
                    </div>
                 </div>
              </div>

              {/* Interactive terminal readout logs */}
              <div className="space-y-2.5">
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block flex items-center gap-1.5">
                   <Terminal className="w-4 h-4 text-zinc-500" /> Interactive Systems diagnostics logs Readout Terminal
                 </span>
                 <div 
                   id="debug-terminal-output"
                   className="bg-zinc-950 text-zinc-300 p-4 rounded-[6px] border border-zinc-800 text-[10px] font-mono leading-relaxed h-[155px] overflow-y-auto whitespace-pre-wrap select-text"
                 >
                    [SYSTEM STACK INITIALIZED] Logging triggers verified on route controllers...
                    [OK] Checking browser-side cookies for standard PageView sequences.
                    [OK] Verification token matched for Facebook Conversions API.
                    [WARN] Custom payload warning: GAds conversions label AW-110283918-X purchase tag should be double audited.
                    [PING] Ping diagnostics successfully returned 200 OK from server endpoint: ss-capi.tazumart.com.
                 </div>
              </div>

           </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="p-5 bg-white border border-zinc-200 rounded-[8px] flex flex-col md:flex-row justify-between items-center text-[10.5px] text-zinc-400 font-extrabold uppercase tracking-wide gap-3">
         <span>© 2026 Tazumart Inc. Enterprise Integration Framework.</span>
         <div className="flex gap-4">
            <span className="text-zinc-650 hover:text-black cursor-help">Technical API Manual</span>
            <span className="text-zinc-650 hover:text-black cursor-help">Cookie Privacy Declarations</span>
         </div>
      </div>

    </div>
  );
}

// Simple dynamic fallback placeholder icons to prevent compilation errors
const CirclePlay = (props: any) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
     <circle cx="12" cy="12" r="10" />
     <polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);
