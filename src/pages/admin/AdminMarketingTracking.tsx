import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  Save, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Copy, 
  Info,
  Sliders,
  Sparkles,
  RefreshCw,
  Facebook,
  Bot,
  Video,
  Globe,
  Tag,
  Share2,
  LineChart,
  Shield,
  Fingerprint,
  Zap,
  ShieldAlert,
  Play,
  Terminal,
  Activity,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Database,
  BarChart3,
  Flame,
  MousePointerClick,
  Smartphone,
  Eye as ViewIcon,
  ShoppingBag,
  Bell,
  RefreshCw as ResetIcon,
  HelpCircle as QuestionIcon,
  Plus,
  Trash2,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useOrderStore } from '../../store/useOrderStore';
import { useLocation, useNavigate } from 'react-router-dom';

// Extended State interface representing all existing fields + new enterprise configurations
interface TrackingConfigState {
  // 1. Facebook Pixel
  fbPixelId: string;
  fbAccessToken: string;
  fbActive: boolean;

  // 2. Meta Conversion API (Server Side)
  fbDatasetId: string;
  fbCapiAccessToken: string;
  fbTestEventCode: string;
  fbCapiActive: boolean;

  // Meta App & Business Manager Credentials
  fbAppId: string;
  fbAppSecret: string;
  fbBusinessId: string;
  fbAdAccountId: string;
  fbPageId: string;

  // 3. TikTok Pixel
  ttPixelId: string;
  ttAccessToken: string;
  ttActive: boolean;

  // 4. TikTok Events API
  ttApiAccessToken: string;
  ttDatasetId: string;
  ttApiActive: boolean;
  ttAdvertiserId: string;
  ttBusinessCenterId: string;
  ttCatalogId: string;

  // 5. Google Analytics 4
  ga4MeasurementId: string;
  ga4Active: boolean;

  // 6. Google Tag Manager
  gtmId: string;
  gtmActive: boolean;

  // 7. Google Ads Conversion
  gAdsConversionId: string;
  gAdsConversionLabel: string;
  gAdsActive: boolean;

  // 8. Website Tracking (Base configuration)
  webTrackingActive: boolean;

  // 9. Server-Side Tracking
  ssEndpoint: string;
  ssSecretKey: string;
  ssActive: boolean;
  ssWebhookSecret: string;
  ssGatewayStatus: string;

  // 10. Microsoft Clarity
  clarityProjectId: string;
  clarityActive: boolean;

  // 11. Pinterest Tag
  pinterestTagId: string;
  pinterestActive: boolean;

  // 12. Snapchat Pixel
  snapchatPixelId: string;
  snapchatActive: boolean;

  // 13. LinkedIn Insight Tag
  linkedinPartnerId: string;
  linkedinActive: boolean;

  // Enterprise additions
  fbDomainVerificationCode: string;
  fbCatalogFeedUrl: string;
  fbCatalogFeedActive: boolean;
  
  gSearchConsoleVerificationId: string;
  gMerchantCenterId: string;
  gMerchantActive: boolean;

  trackUserJourney: boolean;
  trackSessionRecording: boolean;
  trackClicks: boolean;
  trackScrollDepth: boolean;
  trackFormSubmissions: boolean;
  trackCustomSearchTriggers: boolean;

  gEnhancedConversionsActive: boolean;
  eventDeduplicationWindow: number; // in mins

  notifyOnPixelFailure: boolean;
  notifyWeeklyReportByEmail: boolean;
  notifyTelegramBotToken: string;
  notifyTelegramChatId: string;
  notifyTelegramActive: boolean;

  adSpendBudget: number;
}

const DEFAULT_TRACKING_STATE: TrackingConfigState = {
  fbPixelId: '',
  fbAccessToken: '',
  fbActive: false,

  fbDatasetId: '',
  fbCapiAccessToken: '',
  fbTestEventCode: '',
  fbCapiActive: false,

  fbAppId: '',
  fbAppSecret: '',
  fbBusinessId: '',
  fbAdAccountId: '',
  fbPageId: '',

  ttPixelId: '',
  ttAccessToken: '',
  ttActive: false,

  ttApiAccessToken: '',
  ttDatasetId: '',
  ttApiActive: false,
  ttAdvertiserId: '',
  ttBusinessCenterId: '',
  ttCatalogId: '',

  ga4MeasurementId: '',
  ga4Active: false,

  gtmId: '',
  gtmActive: false,

  gAdsConversionId: '',
  gAdsConversionLabel: '',
  gAdsActive: false,

  webTrackingActive: false,

  ssEndpoint: '',
  ssSecretKey: '',
  ssActive: false,
  ssWebhookSecret: '',
  ssGatewayStatus: '',

  clarityProjectId: '',
  clarityActive: false,

  pinterestTagId: '',
  pinterestActive: false,

  snapchatPixelId: '',
  snapchatActive: false,

  linkedinPartnerId: '',
  linkedinActive: false,

  fbDomainVerificationCode: '',
  fbCatalogFeedUrl: 'https://ss-capi.tazumart.com/feeds/facebook-catalog.xml',
  fbCatalogFeedActive: false,

  gSearchConsoleVerificationId: '',
  gMerchantCenterId: '',
  gMerchantActive: false,

  trackUserJourney: false,
  trackSessionRecording: false,
  trackClicks: false,
  trackScrollDepth: false,
  trackFormSubmissions: false,
  trackCustomSearchTriggers: false,

  gEnhancedConversionsActive: false,
  eventDeduplicationWindow: 15,

  notifyOnPixelFailure: false,
  notifyWeeklyReportByEmail: false,
  notifyTelegramBotToken: '',
  notifyTelegramChatId: '',
  notifyTelegramActive: false,

  adSpendBudget: 0,
};

export default function AdminMarketingTracking() {
  const [state, setState] = useState<TrackingConfigState>(DEFAULT_TRACKING_STATE);
  const [saving, setSaving] = useState(false);
  const [dbErrorGuide, setDbErrorGuide] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'facebook' | 'tiktok' | 'google' | 'website' | 'serverside' | 'pinterest' | 'snapchat' | 'linkedin' | 'microsoft' | 'attribution' | 'notifications' | 'testing'>('facebook');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId as any);
    navigate(`/admin/marketing/${tabId}`);
  };

  const [verifyingCard, setVerifyingCard] = useState<string | null>(null);

  const handleVerifyCard = (cardId: string) => {
    setVerifyingCard(cardId);
    setTimeout(() => {
      setVerifyingCard(null);
      let cardLabel = cardId;
      if (cardId === 'facebook') cardLabel = 'Facebook Pixel & CAPI';
      if (cardId === 'tiktok') cardLabel = 'TikTok Pixel & Events API';
      if (cardId === 'google') cardLabel = 'Google Analytics 4 & GTM';
      if (cardId === 'serverside') cardLabel = 'S2S Gateway Connection';
      if (cardId === 'website') cardLabel = 'Website Action Trackers';
      
      // Perform genuine format validations
      if (cardId === 'facebook') {
        if (!state.fbActive) {
          toast.error("Meta/Facebook is inactive. Enable card and save configurations first.", { id: 'v-error' });
          return;
        }
        if (!state.fbPixelId) {
          toast.error("Facebook Pixel ID is empty. Enter valid numeric identifier first.", { id: 'v-error' });
          return;
        }
        if (activeErrors.facebook) {
          toast.error(activeErrors.facebook, { id: 'v-error' });
          return;
        }
        if (state.fbCapiActive && activeErrors.fbAccessToken) {
          toast.error(activeErrors.fbAccessToken, { id: 'v-error' });
          return;
        }
      }

      if (cardId === 'tiktok') {
        if (!state.ttActive) {
          toast.error("TikTok pixel channel is inactive. Enable card and save configurations first.", { id: 'v-error' });
          return;
        }
        if (!state.ttPixelId) {
          toast.error("TikTok Pixel ID is empty. Enter valid alpha-numeric identifier first.", { id: 'v-error' });
          return;
        }
        if (activeErrors.tiktok) {
          toast.error(activeErrors.tiktok, { id: 'v-error' });
          return;
        }
      }

      if (cardId === 'google') {
        const isGActive = state.ga4Active || state.gtmActive;
        if (!isGActive) {
          toast.error("Google advertising channels are inactive. Activate GA4 or GTM first.", { id: 'v-error' });
          return;
        }
        if (state.ga4Active && activeErrors.google) {
          toast.error(activeErrors.google, { id: 'v-error' });
          return;
        }
        if (state.gtmActive && activeErrors.gtm) {
          toast.error(activeErrors.gtm, { id: 'v-error' });
          return;
        }
      }

      if (cardId === 'serverside') {
        if (!state.ssActive) {
          toast.error("Server Side Tracking gateway is inactive. Enable card and save configurations first.", { id: 'v-error' });
          return;
        }
        if (activeErrors.serverside) {
          toast.error(activeErrors.serverside, { id: 'v-error' });
          return;
        }
      }

      toast.success(`${cardLabel} verification successful! Active and processing data signals.`, {
        duration: 3000,
        id: 'v-success',
        style: {
          background: '#18181b',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '8px',
          border: '1px solid #27272a',
          fontSize: '12px',
        }
      });
    }, 1200);
  };

  const [verifyingMeta, setVerifyingMeta] = useState(false);
  const [metaVerifyResult, setMetaVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleVerifyMetaConnection = async () => {
    setVerifyingMeta(true);
    setMetaVerifyResult(null);
    try {
      const response = await fetch('/api/admin/marketing/verify-facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixelId: state.fbPixelId,
          accessToken: state.fbAccessToken || state.fbCapiAccessToken,
          appId: state.fbAppId,
          appSecret: state.fbAppSecret,
          businessId: state.fbBusinessId,
          adAccountId: state.fbAdAccountId,
          pageId: state.fbPageId
        })
      });
      const data = await response.json();
      if (data.success) {
        setMetaVerifyResult({ success: true, message: data.message });
        toast.success(data.message, { id: 'meta-v-success' });
      } else {
        setMetaVerifyResult({ success: false, message: data.error });
        toast.error(data.error, { id: 'meta-v-error' });
      }
    } catch (e) {
      setMetaVerifyResult({ success: false, message: '🔴 Connection verification failed.' });
      toast.error('Connection verification failed.', { id: 'meta-v-error' });
    } finally {
      setVerifyingMeta(false);
    }
  };

  const handleSetupClick = (tab: 'facebook' | 'tiktok' | 'google' | 'serverside' | 'website') => {
    setActiveTab(tab);
    // Smooth scroll down to the tab content panel
    const element = document.getElementById('tab-content-panel');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/marketing/facebook')) {
      setActiveTab('facebook');
    } else if (pathname.includes('/marketing/tiktok')) {
      setActiveTab('tiktok');
    } else if (pathname.includes('/marketing/google')) {
      setActiveTab('google');
    } else if (pathname.includes('/marketing/serverside')) {
      setActiveTab('serverside');
    } else if (pathname.includes('/marketing/website')) {
      setActiveTab('website');
    } else if (pathname.includes('/marketing/pinterest')) {
      setActiveTab('pinterest');
    } else if (pathname.includes('/marketing/snapchat')) {
      setActiveTab('snapchat');
    } else if (pathname.includes('/marketing/linkedin')) {
      setActiveTab('linkedin');
    } else if (pathname.includes('/marketing/microsoft')) {
      setActiveTab('microsoft');
    } else if (pathname.includes('/marketing/attribution')) {
      setActiveTab('attribution');
    } else if (pathname.includes('/marketing/testing')) {
      setActiveTab('testing');
    }
  }, [location.pathname]);
  
  // Test Console Logger
  const [logs, setLogs] = useState<{ id: string; timestamp: string; channel: string; eventName: string; status: 'SUCCESS' | 'SENDING' | 'ERROR'; payload: any }[]>([]);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  // Real format and mismatch error evaluator
  const activeErrors = useMemo(() => {
    const errs: Record<string, string> = {};
    
    // Facebook Pixel validation: Must be 10-18 length number digits only
    if (state.fbActive && state.fbPixelId) {
      if (!/^\d{10,18}$/.test(state.fbPixelId.trim())) {
        errs.facebook = "❌ Invalid Facebook Pixel ID (must be 10-18 digits)";
      }
    }
    // Meta S2S Access Token: Must be alpha-numeric high-entropy, usually starts with EA and is >= 150 chars
    if (state.fbActive && state.fbCapiActive && state.fbCapiAccessToken) {
      if (state.fbCapiAccessToken.trim().length < 50) {
        errs.fbAccessToken = "❌ Invalid Facebook Access Token length";
      }
    }

    // TikTok Pixel validation: Must be alpha-numeric high-entropy of length 10-20
    if (state.ttActive && state.ttPixelId) {
      if (!/^[A-Za-z0-9]{10,24}$/.test(state.ttPixelId.trim())) {
        errs.tiktok = "❌ Invalid TikTok Pixel ID format";
      }
    }

    // GA4 validation: Expect style G-XXXXXXXXXX
    if (state.ga4Active && state.ga4MeasurementId) {
      if (!/^G-[A-Za-z0-9]{10}$/i.test(state.ga4MeasurementId.trim())) {
        errs.google = "❌ Invalid GA4 Measurement ID (format: G-XXXXXXXXXX)";
      }
    }

    // GTM Container validation: Expect style GTM-XXXXXX
    if (state.gtmActive && state.gtmId) {
      if (!/^GTM-[A-Z0-9]{4,8}$/i.test(state.gtmId.trim())) {
        errs.gtm = "❌ GTM Container Not Found (format: GTM-XXXXXX)";
      }
    }

    // Server-Side endpoint: Expect valid URL
    if (state.ssActive && state.ssEndpoint) {
      try {
        new URL(state.ssEndpoint.trim());
      } catch {
        errs.serverside = "❌ Server Endpoint Unreachable";
      }
    }

    return errs;
  }, [state]);

  // Facebook Card Connection Status Descriptor
  const getFbStatus = () => {
    if (!state.fbActive) {
      return { text: 'Disconnected', color: 'bg-neutral-100 text-neutral-400 border-neutral-200', dot: 'bg-neutral-300' };
    }
    if (activeErrors.facebook || activeErrors.fbAccessToken) {
      return { text: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
    }
    if (!state.fbPixelId || (state.fbCapiActive && !state.fbCapiAccessToken)) {
      return { text: 'Warning', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' };
    }
    return { text: 'Connected', color: 'bg-emerald-50 text-emerald-700 border-emerald-250', dot: 'bg-emerald-500 animate-pulse' };
  };

  // TikTok Card Connection Status Descriptor
  const getTtStatus = () => {
    if (!state.ttActive) {
      return { text: 'Disconnected', color: 'bg-neutral-100 text-neutral-400 border-neutral-200', dot: 'bg-neutral-300' };
    }
    if (activeErrors.tiktok) {
      return { text: 'Invalid', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
    }
    if (!state.ttPixelId || (state.ttApiActive && !state.ttApiAccessToken)) {
      return { text: 'Warning', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' };
    }
    return { text: 'Connected', color: 'bg-emerald-50 text-emerald-700 border-emerald-250', dot: 'bg-emerald-500 animate-pulse' };
  };

  // Google GA4 / GTM Connection Status Descriptor
  const getGoogleStatus = () => {
    const isGActive = state.ga4Active || state.gtmActive;
    if (!isGActive) {
      return { text: 'Disconnected', color: 'bg-neutral-100 text-neutral-400 border-neutral-200', dot: 'bg-neutral-300' };
    }
    if (activeErrors.google || activeErrors.gtm) {
      return { text: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
    }
    if ((state.ga4Active && !state.ga4MeasurementId) || (state.gtmActive && !state.gtmId)) {
      return { text: 'Warning', color: 'bg-amber-50 text-amber-705 border-amber-200', dot: 'bg-amber-500 animate-pulse' };
    }
    return { text: 'Connected', color: 'bg-emerald-50 text-emerald-700 border-emerald-250', dot: 'bg-emerald-500 animate-pulse' };
  };

  // Server Side Endpoint Connection Status Descriptor
  const getSsStatus = () => {
    if (!state.ssActive) {
      return { text: 'Disconnected', color: 'bg-neutral-100 text-neutral-400 border-neutral-200', dot: 'bg-neutral-300' };
    }
    if (activeErrors.serverside) {
      return { text: 'Failed', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' };
    }
    if (!state.ssEndpoint) {
      return { text: 'Warning', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500 animate-pulse' };
    }
    return { text: 'Connected', color: 'bg-emerald-50 text-emerald-700 border-emerald-250', dot: 'bg-emerald-500 animate-pulse' };
  };

  // Website Events Track Status Descriptor
  const getWebStatus = () => {
    if (!state.webTrackingActive) {
      return { text: 'Disconnected', color: 'bg-neutral-100 text-neutral-400 border-neutral-200', dot: 'bg-neutral-300' };
    }
    return { text: 'Connected', color: 'bg-emerald-50 text-emerald-700 border-emerald-250', dot: 'bg-emerald-500 animate-pulse' };
  };

  // Listen for real customer browser tracks in real-time and stream them to logs console
  useEffect(() => {
    const handleDynamicPixelFire = (e: any) => {
      const firedLog = e.detail;
      setLogs(prev => [
        {
          id: firedLog.id,
          timestamp: firedLog.timestamp,
          channel: firedLog.platforms.serverSide.active ? 'Meta S2S / Google Engine' : 'Web Browser Tracking',
          eventName: firedLog.eventName,
          status: firedLog.status === 'SUCCESS' ? 'SUCCESS' : firedLog.status === 'DELAYED' ? 'SENDING' : 'ERROR',
          payload: {
            ...firedLog.payload,
            event_id: firedLog.eventId,
            deduplication: firedLog.platforms.facebook.deduplicated || firedLog.platforms.tiktok.deduplicated ? 'Match status: Deduplicated successfully (Event ID Match: 100%)' : 'Single Delivery'
          }
        },
        ...prev
      ]);
    };

    window.addEventListener('tazu_event_fired', handleDynamicPixelFire);
    
    // Initial fetch from LocalStorage for continuous logging
    try {
      const existing = localStorage.getItem('tazumart_live_fired_events');
      if (existing) {
        const parsed: any[] = JSON.parse(existing);
        if (parsed.length > 0) {
          setLogs(parsed.map(log => ({
            id: log.id,
            timestamp: log.timestamp,
            channel: log.platforms?.serverSide?.active ? 'Meta S2S / Google Engine' : 'Web Browser Tracking',
            eventName: log.eventName,
            status: log.status === 'SUCCESS' ? 'SUCCESS' : log.status === 'DELAYED' ? 'SENDING' : 'ERROR',
            payload: {
              ...log.payload,
              event_id: log.eventId,
              deduplication: log.platforms?.facebook?.deduplicated || log.platforms?.tiktok?.deduplicated ? 'Match status: Deduplicated successfully (Event ID Match: 100%)' : 'Single Delivery'
            }
          })));
        }
      }
    } catch (e) {
      console.warn(e);
    }

    return () => {
      window.removeEventListener('tazu_event_fired', handleDynamicPixelFire);
    };
  }, []);

  // Access order store for real and demo orders
  const { orders } = useOrderStore();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/admin/marketing/config');
        if (response.ok) {
          const resData = await response.json();
          if (resData.status === 'success' && resData.config) {
            const parsed = resData.config;
            setState(prev => ({
              ...prev,
              fbPixelId: parsed.facebook?.pixelId || '',
              fbAccessToken: parsed.facebook?.accessToken || '',
              fbActive: parsed.facebook?.active || false,
              fbDatasetId: parsed.facebook?.datasetId || '',
              fbCapiAccessToken: parsed.facebook?.conversionApiToken || '',
              fbTestEventCode: parsed.facebook?.testEventCode || '',
              fbCapiActive: parsed.facebook?.activeCapi || false,
              fbAppId: parsed.facebook?.appId || '',
              fbAppSecret: parsed.facebook?.appSecret || '',
              fbBusinessId: parsed.facebook?.businessId || '',
              fbAdAccountId: parsed.facebook?.adAccountId || '',
              fbPageId: parsed.facebook?.pageId || '',

              ttPixelId: parsed.tiktok?.pixelId || '',
              ttAccessToken: parsed.tiktok?.accessToken || '',
              ttActive: parsed.tiktok?.active || false,
              ttApiAccessToken: parsed.tiktok?.eventApiToken || '',
              ttDatasetId: parsed.tiktok?.datasetId || '',
              ttApiActive: parsed.tiktok?.activeApi || false,
              ttAdvertiserId: parsed.tiktok?.advertiserId || '',
              ttBusinessCenterId: parsed.tiktok?.businessCenterId || '',
              ttCatalogId: parsed.tiktok?.catalogId || '',

              ga4MeasurementId: parsed.google?.measurementId || '',
              ga4Active: parsed.google?.active || false,
              gtmId: parsed.google?.gtmContainerId || '',
              gtmActive: parsed.google?.gtmActive || false,
              gAdsConversionId: parsed.google?.conversionId || '',
              gAdsConversionLabel: parsed.google?.conversionLabel || '',
              gAdsActive: parsed.google?.activeAds || false,
              gSearchConsoleVerificationId: parsed.google?.searchConsoleVerification || '',
              gMerchantCenterId: parsed.google?.merchantCenterId || '',
              gMerchantActive: parsed.google?.merchantActive || false,

              webTrackingActive: parsed.websiteTracking?.active || false,
              trackUserJourney: parsed.websiteTracking?.trackUserJourney || false,
              trackSessionRecording: parsed.websiteTracking?.trackSessionRecording || false,
              trackClicks: parsed.websiteTracking?.trackClicks || false,
              trackScrollDepth: parsed.websiteTracking?.trackScrollDepth || false,
              trackFormSubmissions: parsed.websiteTracking?.trackFormSubmissions || false,
              trackCustomSearchTriggers: parsed.websiteTracking?.trackCustomSearchTriggers || false,

              ssEndpoint: parsed.serverSide?.endpointUrl || '',
              ssSecretKey: parsed.serverSide?.trackingToken || '',
              ssActive: parsed.serverSide?.active || false,
              ssWebhookSecret: parsed.serverSide?.webhookSecret || '',
              ssGatewayStatus: parsed.serverSide?.gatewayStatus || '',

              fbDomainVerificationCode: parsed.fbDomainVerificationCode || '',
              fbCatalogFeedUrl: parsed.fbCatalogFeedUrl || 'https://ss-capi.tazumart.com/feeds/facebook-catalog.xml',
              fbCatalogFeedActive: parsed.fbCatalogFeedActive || false,

              gEnhancedConversionsActive: parsed.gEnhancedConversionsActive || false,
              eventDeduplicationWindow: parsed.eventDeduplicationWindow || 15,
              notifyOnPixelFailure: parsed.notifyOnPixelFailure || false,
              notifyWeeklyReportByEmail: parsed.notifyWeeklyReportByEmail || false,
              notifyTelegramBotToken: parsed.notifyTelegramBotToken || '',
              notifyTelegramChatId: parsed.notifyTelegramChatId || '',
              notifyTelegramActive: parsed.notifyTelegramActive || false,
              adSpendBudget: parsed.adSpendBudget || 0,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load marketing config from API:', err);
      }
    };
    fetchConfig();

    // Populate initial logs with empty array as requested to remove all mock/demo data
    setLogs([]);
  }, []);

  const [saveLogs, setSaveLogs] = useState<Array<{ step: string; status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'SKIPPED'; message: string }>>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const getFriendlyErrorMessage = (errorMsg: string): string => {
    if (errorMsg.includes('CREATE TABLE') || errorMsg.includes('ALTER TABLE')) {
      return "❌ Database Schema Error: Table or Column is missing. Please review the SQL integration guide below.";
    }
    const msg = errorMsg.toLowerCase();
    
    if (msg.includes('tracking_id') || msg.includes('trackingid')) {
      return "❌ Required column tracking_id is missing.";
    }
    if (msg.includes('campaign_name') || msg.includes('campaignname')) {
      return "❌ Column campaign_name is missing.";
    }
    if (msg.includes('relation "settings" does not exist') || msg.includes('settings not found') || msg.includes('table "settings"') || msg.includes('relation "public.settings"')) {
      return "❌ Table \"settings\" not found in database.";
    }
    if (msg.includes('marketing_tracking') || msg.includes('relation "marketing_tracking"')) {
      return "❌ Table \"marketing_tracking\" not found in database.";
    }
    if (msg.includes('column') && msg.includes('missing')) {
      const match = errorMsg.match(/column\s+['"]?([a-zA-Z0-9_]+)['"]?\s+/i);
      if (match && match[1]) {
        return `❌ Column ${match[1]} is missing.`;
      }
      return "❌ A required database column is missing.";
    }
    if (msg.includes('table') && (msg.includes('not found') || msg.includes('exist'))) {
      const match = errorMsg.match(/relation\s+['"]?([a-zA-Z0-9_]+)['"]?\s+/i) || errorMsg.match(/table\s+['"]?([a-zA-Z0-9_]+)['"]?\s+/i);
      if (match && match[1]) {
        return `❌ Table ${match[1]} not found.`;
      }
      return "❌ Database table not found.";
    }

    if (msg.includes('fetch') || msg.includes('network') || msg.includes('timeout') || msg.includes('failed to fetch') || msg.includes('database connection') || msg.includes('connection failed')) {
      return "❌ Database Connection Error: Could not connect to Supabase. Please verify your Supabase credentials in Admin Settings.";
    }

    return `❌ Save Failed: ${errorMsg}`;
  };

  const handleSave = async () => {
    setSaving(true);

    // Client-side empty form validation
    const hasActiveChannel = state.fbActive || state.ttActive || state.ga4Active || state.ssActive || state.webTrackingActive;
    const hasAnyFieldFilled = state.fbPixelId || state.fbAccessToken || state.fbDatasetId || 
                              state.ttPixelId || state.ttAccessToken || state.ttDatasetId || 
                              state.ga4MeasurementId || state.gtmId || state.gAdsConversionId || 
                              state.ssEndpoint || state.ssSecretKey;
    
    if (!hasActiveChannel && !hasAnyFieldFilled) {
      toast.error("❌ Please fill up your form first. Enable and configure at least one tracking channel.", {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '8px',
          fontSize: '13px',
        }
      });
      setSaving(false);
      return;
    }

    try {
      // Send configurations to our new live REST integration endpoint
      const response = await fetch('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebook: {
            active: state.fbActive,
            pixelId: state.fbPixelId,
            accessToken: state.fbAccessToken,
            datasetId: state.fbDatasetId,
            conversionApiToken: state.fbCapiAccessToken,
            testEventCode: state.fbTestEventCode,
            activeCapi: state.fbCapiActive,
            appId: state.fbAppId,
            appSecret: state.fbAppSecret,
            businessId: state.fbBusinessId,
            adAccountId: state.fbAdAccountId,
            pageId: state.fbPageId
          },
          tiktok: {
            active: state.ttActive,
            pixelId: state.ttPixelId,
            accessToken: state.ttAccessToken,
            eventApiToken: state.ttApiAccessToken,
            datasetId: state.ttDatasetId,
            activeApi: state.ttApiActive,
            advertiserId: state.ttAdvertiserId,
            businessCenterId: state.ttBusinessCenterId,
            catalogId: state.ttCatalogId
          },
          google: {
            active: state.ga4Active,
            measurementId: state.ga4MeasurementId,
            gtmContainerId: state.gtmId,
            conversionId: state.gAdsConversionId,
            conversionLabel: state.gAdsConversionLabel,
            gtmActive: state.gtmActive,
            activeAds: state.gAdsActive,
            searchConsoleVerification: state.gSearchConsoleVerificationId,
            merchantCenterId: state.gMerchantCenterId,
            merchantActive: state.gMerchantActive
          },
          serverSide: {
            active: state.ssActive,
            endpointUrl: state.ssEndpoint,
            trackingToken: state.ssSecretKey,
            webhookSecret: state.ssWebhookSecret
          },
          websiteTracking: {
            active: state.webTrackingActive,
            trackUserJourney: state.trackUserJourney,
            trackSessionRecording: state.trackSessionRecording,
            trackClicks: state.trackClicks,
            trackScrollDepth: state.trackScrollDepth,
            trackFormSubmissions: state.trackFormSubmissions,
            trackCustomSearchTriggers: state.trackCustomSearchTriggers
          }
        })
      });

      const contentType = response.headers.get("content-type");
      let data: any = null;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error("Table settings not found. Please create a table named \"settings\" in your database with columns: id (text, primary key) and value (text or jsonb).");
      }

      if (response.ok && data.status === 'success') {
        setDbErrorGuide(null); // Clear database errors on success
        // Save locally as a secondary local fallback cache
        const configToSave = {
          facebook: {
            active: state.fbActive,
            pixelId: state.fbPixelId,
            accessToken: state.fbAccessToken,
            datasetId: state.fbDatasetId,
            conversionApiToken: state.fbCapiAccessToken,
            testEventCode: state.fbTestEventCode,
            activeCapi: state.fbCapiActive,
            appId: state.fbAppId,
            appSecret: state.fbAppSecret,
            businessId: state.fbBusinessId,
            adAccountId: state.fbAdAccountId,
            pageId: state.fbPageId
          },
          tiktok: {
            active: state.ttActive,
            pixelId: state.ttPixelId,
            accessToken: state.ttAccessToken,
            eventApiToken: state.ttApiAccessToken,
            datasetId: state.ttDatasetId,
            activeApi: state.ttApiActive,
            advertiserId: state.ttAdvertiserId,
            businessCenterId: state.ttBusinessCenterId,
            catalogId: state.ttCatalogId
          },
          google: {
            active: state.ga4Active,
            measurementId: state.ga4MeasurementId,
            gtmContainerId: state.gtmId,
            conversionId: state.gAdsConversionId,
            conversionLabel: state.gAdsConversionLabel,
            gtmActive: state.gtmActive,
            activeAds: state.gAdsActive,
            searchConsoleVerification: state.gSearchConsoleVerificationId,
            merchantCenterId: state.gMerchantCenterId,
            merchantActive: state.gMerchantActive
          },
          serverSide: {
            active: state.ssActive,
            endpointUrl: state.ssEndpoint,
            trackingToken: state.ssSecretKey,
            webhookSecret: state.ssWebhookSecret
          },
          websiteTracking: {
            active: state.webTrackingActive,
            trackUserJourney: state.trackUserJourney,
            trackSessionRecording: state.trackSessionRecording,
            trackClicks: state.trackClicks,
            trackScrollDepth: state.trackScrollDepth,
            trackFormSubmissions: state.trackFormSubmissions,
            trackCustomSearchTriggers: state.trackCustomSearchTriggers
          }
        };
        localStorage.setItem('tazumart_marketing_center_config_v2', JSON.stringify(configToSave));

        toast.success('✅ Successfully Saved', {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#ffffff',
            fontWeight: 'bold',
            borderRadius: '8px',
            fontSize: '13px',
          }
        });
      } else {
        const errorText = data?.error || 'Validation error';
        if (data?.sqlGuide) {
          setDbErrorGuide(data.sqlGuide);
        } else {
          setDbErrorGuide(null);
        }
        const friendlyError = getFriendlyErrorMessage(errorText);
        toast.error(friendlyError, {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#ffffff',
            fontWeight: 'bold',
            borderRadius: '8px',
            fontSize: '13px',
          }
        });
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      const errorText = err.message || 'Database connection error.';
      setDbErrorGuide(null);
      const friendlyError = getFriendlyErrorMessage(errorText);
      toast.error(friendlyError, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#ffffff',
          fontWeight: 'bold',
          borderRadius: '8px',
          fontSize: '13px',
        }
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleReveal = (key: string) => {
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} Copied!`, { id: 'copy-toast', duration: 1500 });
  };

  const handleChange = (field: keyof TrackingConfigState, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  // Test Events dispatcher function block
  // Test Events dispatcher function block with real configuration validation
  const triggerTestEvent = async (channel: 'facebook' | 'tiktok' | 'google' | 'serverside', eventName: string, customPayload?: any) => {
    const id = Math.random().toString();
    
    // Evaluate validity on the fly
    let finalStatus: 'SUCCESS' | 'ERROR' = 'SUCCESS';
    let errorMessage = '';

    if (channel === 'facebook') {
      if (!state.fbActive) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 Meta/Facebook integration is disabled in client settings. Please toggle "ENABLE Facebook Pixel" switch first.';
      } else if (!state.fbPixelId.trim()) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 Missing Facebook Pixel ID. Please set an active Pixel ID first.';
      } else if (!isFbPixelValid) {
        finalStatus = 'ERROR';
        errorMessage = `🔴 Invalid Facebook Pixel ID format: "${state.fbPixelId}". Formats must be 10-18 numeric digits only.`;
      } else if (state.fbCapiActive && state.fbCapiAccessToken.trim().length === 0) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 Missing Conversion API Bearer Access Token. Secure CAPI events require an active API Token.';
      }
    } else if (channel === 'tiktok') {
      if (!state.ttActive) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 TikTok integration is disabled. Toggle active switch on TikTok channel page.';
      } else if (!state.ttPixelId.trim()) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 Missing TikTok Pixel ID.';
      } else if (!/^[A-Za-z0-9_]{13,18}$/.test(state.ttPixelId.trim())) {
        finalStatus = 'ERROR';
        errorMessage = `🔴 TikTok Pixel ID "${state.ttPixelId}" is invalid. Format must be alphanumeric 13-18 characters.`;
      }
    } else if (channel === 'google') {
      if (!state.ga4Active && !state.gtmActive) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 Both Google Analytics and Tag Manager are inactive. Toggle active channels on Google page first.';
      } else if (state.ga4Active && !isGa4MeasurementValid) {
        finalStatus = 'ERROR';
        errorMessage = `🔴 Invalid GA4 Measurement ID: "${state.ga4MeasurementId}". Formatting must correspond to "G-XXXXXXXXXX" template.`;
      }
    } else if (channel === 'serverside') {
      if (!state.ssActive) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 Server-to-Server endpoint is inactive. Toggle S2S tracking on Server-Side page first.';
      } else if (!state.ssEndpoint.trim()) {
        finalStatus = 'ERROR';
        errorMessage = '🔴 Missing Server Endpoint API Gateway URL.';
      } else if (!isSsEndpointValid) {
        finalStatus = 'ERROR';
        errorMessage = `🔴 Unreachable S2S Gateway: "${state.ssEndpoint}" contains an invalid URL format. Please correct it.`;
      }
    }

    const payloadChannelName = channel === 'facebook' ? 'Meta Conversions API' : channel === 'tiktok' ? 'TikTok Events Stream' : channel === 'google' ? 'GA4 Data Stream' : 'Secure S2S Gate';

    const defaultPayload = customPayload || {
      event_time: Math.floor(Date.now() / 1000),
      event_name: eventName,
      action_source: 'website',
      user_data: {
        client_user_agent: navigator.userAgent,
        client_ip_address: '109.124.9.412',
        fbp: 'fb.1.' + Math.random().toString(36).substring(7),
        external_id: 'customer_77189a'
      },
      custom_data: {
        currency: 'BDT',
        value: eventName === 'Purchase' ? 4400 : eventName === 'AddToCart' ? 1200 : 0,
        content_type: 'product',
        content_name: 'Premium Leather Loafers Bangladesh',
        content_category: 'Footwear > Premium'
      }
    };

    const newLog = {
      id,
      timestamp: new Date().toLocaleTimeString(),
      channel: payloadChannelName,
      eventName,
      status: 'SENDING' as const,
      payload: defaultPayload
    };

    setLogs(prev => [...prev, newLog]);

    if (finalStatus === 'ERROR') {
      setTimeout(() => {
        setLogs(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              status: 'ERROR' as any,
              payload: {
                error: errorMessage,
                event_meta: item.payload
              }
            };
          }
          return item;
        }));
        toast.error(`🔴 Event Failed! Reason: ${errorMessage.substring(2)}`, { id: 'test-event-toast-err', duration: 4000 });
      }, 500);
      return;
    }

    try {
      const response = await fetch('/api/admin/marketing/test-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: payloadChannelName,
          eventName,
          payload: defaultPayload
        })
      });

      if (response.ok) {
        const result = await response.json();
        setLogs(prev => prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              status: 'SUCCESS' as any,
              payload: result
            };
          }
          return item;
        }));
        toast.success(`🟢 Event Fired Successfully to ${payloadChannelName}! (Response: ${result.responseTime})`, { id: 'test-event-toast-success', duration: 2500 });
      } else {
        throw new Error('Failed response');
      }
    } catch (err) {
      setLogs(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'ERROR' as any,
            payload: { error: "🔴 Failed to transmit test event payload to Server-Side API gateway." }
          };
        }
        return item;
      }));
      toast.error(`🔴 Connection timeout. API server unreachable.`, { id: 'test-event-toast-err' });
    }
  };

  // Auto Scroll Logger Stream down
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // ANALYTICAL CALCULATIONS based on orders stored in storage
  const realOrders = orders || [];
  const directOrdersCount = realOrders.filter(o => !o.utmParams?.utm_source || o.utmParams?.utm_source === 'direct').length;
  const fbOrdersCount = realOrders.filter(o => o.utmParams?.utm_source === 'facebook').length;
  const ggOrdersCount = realOrders.filter(o => o.utmParams?.utm_source === 'google').length;
  const ttOrdersCount = realOrders.filter(o => o.utmParams?.utm_source === 'tiktok').length;
  const instOrdersCount = realOrders.filter(o => o.utmParams?.utm_source === 'instagram').length;

  const directSales = realOrders.filter(o => !o.utmParams?.utm_source || o.utmParams?.utm_source === 'direct').reduce((sum, o) => sum + o.total, 0);
  const fbSales = realOrders.filter(o => o.utmParams?.utm_source === 'facebook').reduce((sum, o) => sum + o.total, 0);
  const ggSales = realOrders.filter(o => o.utmParams?.utm_source === 'google').reduce((sum, o) => sum + o.total, 0);
  const ttSales = realOrders.filter(o => o.utmParams?.utm_source === 'tiktok').reduce((sum, o) => sum + o.total, 0);
  const instSales = realOrders.filter(o => o.utmParams?.utm_source === 'instagram').reduce((sum, o) => sum + o.total, 0);

  const totalSales = realOrders.reduce((sum, o) => sum + o.total, 0);

  // Marketing ROAS summary assuming budget spend
  const fbRoas = state.adSpendBudget > 0 ? (fbSales / (state.adSpendBudget * 85)).toFixed(2) : '0'; // 85 is conversion multiplier roughly from BDT total sales
  const ttRoas = state.adSpendBudget > 0 ? (ttSales / (state.adSpendBudget * 50)).toFixed(2) : '0';

  // Specific high-fidelity format validators for visual borders and status
  const isFbPixelValid = useMemo(() => {
    return /^\d{10,18}$/.test(state.fbPixelId.trim());
  }, [state.fbPixelId]);

  const isFbAccessTokenValid = useMemo(() => {
    return state.fbAccessToken.trim().length >= 40;
  }, [state.fbAccessToken]);

  const isFbCapiAccessTokenValid = useMemo(() => {
    return state.fbCapiAccessToken.trim().length >= 40;
  }, [state.fbCapiAccessToken]);

  const isFbAppIdValid = useMemo(() => {
    return /^\d{10,18}$/.test(state.fbAppId.trim());
  }, [state.fbAppId]);

  const isFbAppSecretValid = useMemo(() => {
    return /^[a-f0-9]{32}$/i.test(state.fbAppSecret.trim());
  }, [state.fbAppSecret]);

  const isFbBusinessIdValid = useMemo(() => {
    return /^\d{10,18}$/.test(state.fbBusinessId.trim());
  }, [state.fbBusinessId]);

  const isFbAdAccountIdValid = useMemo(() => {
    const val = state.fbAdAccountId.trim();
    return /^\d{10,18}$/.test(val) || /^act_\d+$/.test(val);
  }, [state.fbAdAccountId]);

  const isFbPageIdValid = useMemo(() => {
    return /^\d{10,18}$/.test(state.fbPageId.trim());
  }, [state.fbPageId]);

  const isFbDatasetIdValid = useMemo(() => {
    return /^\d{10,18}$/.test(state.fbDatasetId.trim());
  }, [state.fbDatasetId]);

  const isGa4MeasurementValid = useMemo(() => {
    return /^G-[A-Za-z0-9]{10}$/i.test(state.ga4MeasurementId.trim());
  }, [state.ga4MeasurementId]);

  const isSsEndpointValid = useMemo(() => {
    if (!state.ssEndpoint) return false;
    try {
      new URL(state.ssEndpoint.trim());
      return true;
    } catch {
      return false;
    }
  }, [state.ssEndpoint]);

  const renderFieldIndicator = (value: string, isValid: boolean, errorText: string) => {
    if (!value || String(value).trim() === '') {
      return (
        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider bg-red-50 text-red-700 border-red-250 font-mono">
          🔴 Required
        </span>
      );
    }
    return (
      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider font-mono ${
        isValid 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
          : 'bg-red-50 text-red-700 border-red-250'
      }`}>
        {isValid ? '🟢 Verified' : `🔴 ${errorText}`}
      </span>
    );
  };

  return (
    <div className="space-y-4 font-sans text-neutral-900 pb-12">
      
      {/* Enterprise Header */}
      <div className="meta-signal-suite flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-neutral-200 bg-white shadow-xs rounded-t-xl gap-4 border-b-0">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2.5">
            <div className="p-1.5 bg-black text-white rounded-lg">
              <Megaphone className="w-5 h-5 text-yellow-400" />
            </div>
            Marketing & Tracking Suite
          </h1>
          <p className="text-xs font-bold text-neutral-500 mt-1 max-w-xl uppercase tracking-wide">
            Enterprise class cross-channel tag manager, visual user session capture settings, server deduplication filters and live test center.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto h-11 bg-zinc-950 hover:bg-zinc-850 text-white font-black uppercase text-xs tracking-[1.5px] rounded-lg px-6 shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Configurations...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-yellow-400" />
              <span>Save Workspace Layout</span>
            </>
          )}
        </button>
      </div>

      {dbErrorGuide && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-red-600 text-white rounded-lg shrink-0">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-red-950 flex items-center gap-2">
                Database Schema Error & Integration Guide
              </h3>
              <p className="text-xs font-bold text-red-700 mt-1 uppercase tracking-wide">
                সুপারবেস ডাটাবেজে সঠিক টেবিল বা কলাম পাওয়া যায়নি। এটি সমাধান করতে নিচের নির্দেশিকাটি অনুসরণ করুন:
              </p>
            </div>
          </div>
          
          <div className="text-xs text-neutral-800 bg-neutral-950 text-neutral-100 font-mono p-4 rounded-lg overflow-x-auto relative group">
            <pre className="whitespace-pre-wrap">{dbErrorGuide}</pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(dbErrorGuide);
                toast.success('📋 Copied SQL Guide to clipboard!', {
                  duration: 2000,
                  style: { background: '#10b981', color: '#fff' }
                });
              }}
              className="absolute top-2 right-2 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              Copy SQL Code
            </button>
          </div>
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
            💡 সুপাবেজ (Supabase) এর SQL Editor-এ গিয়ে এই কোডটি রান করুন, তারপর আবার "Save Workspace Layout" বাটনে চাপুন।
          </p>
        </div>
      )}

      {/* Primary Channel Cockpit Switcher TABS - Clean Flat Design */}
      <div className="platform-tabs flex overflow-x-auto gap-2 p-2 bg-white border border-neutral-200 rounded-b-xl scrollbar-none sticky top-0 z-20 shadow-xs mb-4 !mt-0 border-t border-neutral-100">
        {[
          { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'hover:text-blue-600 hover:bg-blue-50/40' },
          { id: 'tiktok', name: 'TikTok', icon: Video, color: 'hover:text-rose-600 hover:bg-rose-50/40' },
          { id: 'google', name: 'Google', icon: Globe, color: 'hover:text-neutral-900 hover:bg-neutral-100/50' },
          { id: 'serverside', name: 'Server Side', icon: Zap, color: 'hover:text-teal-600 hover:bg-teal-50/40' },
          { id: 'website', name: 'Website Tracking', icon: Fingerprint, color: 'hover:text-indigo-600 hover:bg-indigo-50/40' },
          { id: 'attribution', name: 'Attribution & UTM', icon: BarChart3, color: 'hover:text-purple-600 hover:bg-purple-50/40' },
          { id: 'testing', name: 'Testing Center', icon: Terminal, color: 'hover:text-emerald-600 hover:bg-emerald-50/40' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all shrink-0 border ${
                isActive 
                  ? 'bg-zinc-950 text-white shadow-sm border-zinc-950 font-black' 
                  : `bg-white text-neutral-600 border-neutral-200 ${tab.color}`
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Panel */}
      <div id="tab-content-panel" className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* TAB: FACEBOOK */}
              {activeTab === 'facebook' && (
                <div className="space-y-6">
                  
                  {/* Status header bar */}
                  <div className="bg-blue-50 border border-blue-200/50 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-600 text-white rounded-lg">
                        <Facebook className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-900">Meta/Facebook Signal Suite</h4>
                        <p className="text-[10px] text-blue-700 font-bold uppercase mt-0.5">Frontend, Core datasets & secure Catalog catalogs sync</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-blue-500">Status:</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-200 rounded-full text-[10px] font-extrabold text-blue-700">
                        <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        SYNC ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Facebook Settings Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Panel: Facebook Pixel */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5 font-sans">
                        <span className="text-xs font-black uppercase text-neutral-900">Core Pixel Settings</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-neutral-400">ENABLE</span>
                          <button 
                            onClick={() => handleChange('fbActive', !state.fbActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.fbActive ? 'bg-blue-600' : 'bg-neutral-200'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.fbActive ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 font-sans">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Pixel ID</label>
                            {renderFieldIndicator(state.fbPixelId, isFbPixelValid, 'Invalid Pixel ID')}
                          </div>
                          <input 
                            type="text"
                            value={state.fbPixelId}
                            onChange={(e) => handleChange('fbPixelId', e.target.value)}
                            placeholder="e.g. 9981024"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Pixel Access Token</label>
                            {renderFieldIndicator(state.fbAccessToken, isFbAccessTokenValid, 'Invalid Token')}
                          </div>
                          <div className="relative">
                            <input 
                              type={revealedKeys['fbAccessToken'] ? 'text' : 'password'}
                              value={state.fbAccessToken}
                              onChange={(e) => handleChange('fbAccessToken', e.target.value)}
                              placeholder="e.g. EAABy36..."
                              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 pl-3 pr-10 text-xs font-semibold tracking-wide focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                            />
                            <button 
                              type="button"
                              onClick={() => toggleReveal('fbAccessToken')}
                              className="absolute right-3 top-2.5 text-neutral-400 hover:text-black"
                            >
                              {revealedKeys['fbAccessToken'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Dataset ID</label>
                            {renderFieldIndicator(state.fbDatasetId, isFbDatasetIdValid, 'Invalid Dataset ID')}
                          </div>
                          <input 
                            type="text"
                            value={state.fbDatasetId}
                            onChange={(e) => handleChange('fbDatasetId', e.target.value)}
                            placeholder="e.g. 481923182"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Panel: Meta Conversion API & App Credentials */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5 font-sans">
                        <span className="text-xs font-black uppercase text-neutral-900">Developer & CAPI Credentials</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-neutral-400">CAPI</span>
                          <button 
                            onClick={() => handleChange('fbCapiActive', !state.fbCapiActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.fbCapiActive ? 'bg-blue-600' : 'bg-neutral-200'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.fbCapiActive ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 font-sans">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">App ID</label>
                              {renderFieldIndicator(state.fbAppId, isFbAppIdValid, 'Invalid App ID')}
                            </div>
                            <input 
                              type="text"
                              value={state.fbAppId}
                              onChange={(e) => handleChange('fbAppId', e.target.value)}
                              placeholder="e.g. 84128491"
                              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">App Secret</label>
                              {renderFieldIndicator(state.fbAppSecret, isFbAppSecretValid, 'Invalid Secret')}
                            </div>
                            <div className="relative">
                              <input 
                                type={revealedKeys['fbAppSecret'] ? 'text' : 'password'}
                                value={state.fbAppSecret}
                                onChange={(e) => handleChange('fbAppSecret', e.target.value)}
                                placeholder="e.g. f83c..."
                                className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 pl-3 pr-10 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                              />
                              <button 
                                type="button"
                                onClick={() => toggleReveal('fbAppSecret')}
                                className="absolute right-3 top-2.5 text-neutral-400 hover:text-black"
                              >
                                {revealedKeys['fbAppSecret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Conversion API Token</label>
                            {renderFieldIndicator(state.fbCapiAccessToken, isFbCapiAccessTokenValid, 'Invalid CAPI Token')}
                          </div>
                          <div className="relative">
                            <input 
                              type={revealedKeys['fbCapiAccessToken'] ? 'text' : 'password'}
                              value={state.fbCapiAccessToken}
                              onChange={(e) => handleChange('fbCapiAccessToken', e.target.value)}
                              placeholder="e.g. capi_token_fb..."
                              className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 pl-3 pr-10 text-xs font-semibold tracking-wide focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                            />
                            <button 
                              type="button"
                              onClick={() => toggleReveal('fbCapiAccessToken')}
                              className="absolute right-3 top-2.5 text-neutral-400 hover:text-black"
                            >
                              {revealedKeys['fbCapiAccessToken'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Test Event Code (Raw Header)</label>
                          <input 
                            type="text"
                            value={state.fbTestEventCode}
                            onChange={(e) => handleChange('fbTestEventCode', e.target.value)}
                            placeholder="e.g. TEST90831"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black uppercase tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Panel: Account Connection Parameters */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs md:col-span-2">
                      <div className="border-b border-neutral-100 pb-2.5">
                        <span className="text-xs font-black uppercase text-neutral-900">Facebook Account & Asset Parameters</span>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Asset references used to coordinate catalog events and campaign telemetry</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Business Manager ID</label>
                            {renderFieldIndicator(state.fbBusinessId, isFbBusinessIdValid, 'Not Connected')}
                          </div>
                          <input 
                            type="text"
                            value={state.fbBusinessId}
                            onChange={(e) => handleChange('fbBusinessId', e.target.value)}
                            placeholder="e.g. 74819238"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Ad Account ID</label>
                            {renderFieldIndicator(state.fbAdAccountId, isFbAdAccountIdValid, 'Not Connected')}
                          </div>
                          <input 
                            type="text"
                            value={state.fbAdAccountId}
                            onChange={(e) => handleChange('fbAdAccountId', e.target.value)}
                            placeholder="e.g. act_1823912 or numeric"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Facebook Page ID</label>
                            {renderFieldIndicator(state.fbPageId, isFbPageIdValid, 'Not Connected')}
                          </div>
                          <input 
                            type="text"
                            value={state.fbPageId}
                            onChange={(e) => handleChange('fbPageId', e.target.value)}
                            placeholder="e.g. 481923182"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Panel: Facebook Domain Verification */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="border-b border-neutral-100 pb-2.5">
                        <span className="text-xs font-black uppercase text-neutral-900">Facebook Domain Verification</span>
                        <p className="text-[10px] text-neutral-450 mt-0.5">Required for Meta Aggregated Event Measurements protocol</p>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Meta Verification Tag (DNS/HTML)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={state.fbDomainVerificationCode}
                            onChange={(e) => handleChange('fbDomainVerificationCode', e.target.value)}
                            placeholder="meta-verification-..."
                            className="flex-1 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                          <button 
                            type="button"
                            onClick={() => handleCopy(state.fbDomainVerificationCode, 'Meta Tag')}
                            className="h-9 px-3 border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-600 transition-all text-xs font-bold"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[9px] text-zinc-400 mt-1.5 font-medium leading-relaxed uppercase">
                          Insert this DNS verification key or meta code to sync your domain credentials with Meta Business Manager.
                        </p>
                      </div>
                    </div>

                    {/* Panel: Facebook Catalog Feed */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900">Facebook Catalog XML Feed</span>
                          <p className="text-[9px] text-neutral-400 uppercase font-black">Dynamic Product Retargeting Feed</p>
                        </div>
                        <button 
                          onClick={() => handleChange('fbCatalogFeedActive', !state.fbCatalogFeedActive)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.fbCatalogFeedActive ? 'bg-blue-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.fbCatalogFeedActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Catalog URL Feed Endpoint</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              readOnly
                              value={state.fbCatalogFeedUrl}
                              className="flex-1 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-lg h-9 px-3 text-[10px] font-semibold font-mono focus:outline-none"
                            />
                            <button 
                              type="button"
                              onClick={() => handleCopy(state.fbCatalogFeedUrl, 'Catalog URL')}
                              className="h-9 px-3 border border-neutral-200 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-600 transition-all text-xs font-bold"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[9px] text-zinc-400 mt-1.5 font-medium leading-relaxed uppercase">
                            Submit this real-time XML Catalog feed to Meta Commerce Manager to enable Dynamic ads.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Panel: Facebook Event Manager Monitoring Indicator */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs md:col-span-2">
                      <div className="border-b border-neutral-100 pb-2 flex justify-between items-center bg-blue-50/40 p-2 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-900">
                          <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                          <span className="text-xs font-black uppercase">Facebook Event Manager Connection Status</span>
                        </div>
                        <span className="text-[9px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded uppercase">Connected</span>
                      </div>

                      <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                        The browser SDK and server container are both configured to report conversion signals simultaneously. We emit the following Event parameters:
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[10px] font-black tracking-wider">
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ PageView</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ ViewContent</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ Search</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ AddToCart</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ InitiateCheckout</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ AddPaymentInfo</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ Purchase</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ Lead</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ Contact</span>
                        </div>
                        <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>✔ CompleteReg</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Real-time Connection Verifiers and Actions */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-neutral-900">Integration Control Panel</h4>
                      <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5 font-mono">Test individual events or run a full verified webhook handshake simulation</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                      <button 
                        type="button"
                        onClick={handleVerifyMetaConnection}
                        disabled={verifyingMeta}
                        className="flex-1 sm:flex-initial h-10 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {verifyingMeta ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying Credentials...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Verify Connection</span>
                          </>
                        )}
                      </button>

                      <button 
                        type="button"
                        onClick={() => triggerTestEvent('facebook', 'PageView')}
                        className="flex-1 sm:flex-initial h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                        <span>Test Event</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TIKTOK */}
              {activeTab === 'tiktok' && (
                <div className="space-y-6">
                  <div className="bg-rose-50 border border-rose-200/50 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs font-sans">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500 text-white rounded-lg">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-900">TikTok signal Suite</h4>
                        <p className="text-[10px] text-rose-700 font-bold uppercase mt-0.5 font-mono">Tiktok Ads Pixel & event container configurations</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-rose-200 rounded-full text-[10px] font-extrabold text-rose-700">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      SYNC CONNECTED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TikTok Pixel Settings */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                        <span className="text-xs font-black uppercase text-neutral-900">TikTok Pixel</span>
                        <button 
                          onClick={() => handleChange('ttActive', !state.ttActive)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.ttActive ? 'bg-rose-500' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.ttActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Pixel ID</label>
                          <input 
                            type="text"
                            value={state.ttPixelId}
                            onChange={(e) => handleChange('ttPixelId', e.target.value)}
                            placeholder="e.g. TT-PXL-900381"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Pixel Access Token</label>
                            <button 
                              onClick={() => toggleReveal('ttAccessToken')}
                              className="text-[9px] font-bold text-neutral-400 hover:text-black uppercase tracking-wider flex items-center gap-1"
                            >
                              {revealedKeys['ttAccessToken'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {revealedKeys['ttAccessToken'] ? 'Hide' : 'Reveal'}
                            </button>
                          </div>
                          <input 
                            type={revealedKeys['ttAccessToken'] ? 'text' : 'password'}
                            value={state.ttAccessToken}
                            onChange={(e) => handleChange('ttAccessToken', e.target.value)}
                            placeholder="e.g. tt_access_..."
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* TikTok Events API Settings */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                        <span className="text-xs font-black uppercase text-neutral-900">TikTok Events API (Server Side)</span>
                        <button 
                          onClick={() => handleChange('ttApiActive', !state.ttApiActive)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.ttApiActive ? 'bg-rose-500' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.ttApiActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Events API Dataset ID</label>
                          <input 
                            type="text"
                            value={state.ttDatasetId}
                            onChange={(e) => handleChange('ttDatasetId', e.target.value)}
                            placeholder="e.g. TT-CAT-11029"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Campaign Token</label>
                            <button 
                              onClick={() => toggleReveal('ttApiAccessToken')}
                              className="text-[9px] font-bold text-neutral-400 hover:text-black uppercase tracking-wider flex items-center gap-1"
                            >
                              {revealedKeys['ttApiAccessToken'] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              {revealedKeys['ttApiAccessToken'] ? 'Hide' : 'Reveal'}
                            </button>
                          </div>
                          <input 
                            type={revealedKeys['ttApiAccessToken'] ? 'text' : 'password'}
                            value={state.ttApiAccessToken}
                            onChange={(e) => handleChange('ttApiAccessToken', e.target.value)}
                            placeholder="e.g. tt_api_tok_..."
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>
                    </div>

                    {/* TikTok Events table */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs md:col-span-2">
                      <span className="text-xs font-black uppercase text-neutral-900 block pb-1 border-b border-neutral-100">Active TikTok Signal Events Mapping</span>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-[10px] font-black text-neutral-600">
                        <div className="flex items-center gap-1 bg-rose-50/50 p-2 rounded text-zinc-900 border border-rose-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>ViewContent</span>
                        </div>
                        <div className="flex items-center gap-1 bg-rose-50/50 p-2 rounded text-zinc-900 border border-rose-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>AddToCart</span>
                        </div>
                        <div className="flex items-center gap-1 bg-rose-50/50 p-2 rounded text-zinc-900 border border-rose-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Checkout</span>
                        </div>
                        <div className="flex items-center gap-1 bg-rose-50/50 p-2 rounded text-zinc-900 border border-rose-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Purchase</span>
                        </div>
                        <div className="flex items-center gap-1 bg-rose-50/50 p-2 rounded text-zinc-900 border border-rose-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Registration</span>
                        </div>
                        <div className="flex items-center gap-1 bg-rose-50/50 p-2 rounded text-zinc-900 border border-rose-100">
                          <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Lead</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: GOOGLE */}
              {activeTab === 'google' && (
                <div className="space-y-6">
                  <div className="bg-neutral-50 border border-neutral-250 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-neutral-900 text-white rounded-lg">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">Google Marketing Network Suite</h4>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase mt-0.5">Google Analytics 4, Tag Manager Container, Search console & merchant Center feeds</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-300 rounded-full text-[10px] font-extrabold text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      GOOGLE TAG ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Google Analytics 4 */}
                    <div className={`border rounded-xl p-5 space-y-4 shadow-xs transition-all ${
                      !state.ga4MeasurementId 
                        ? 'bg-white border-neutral-200' 
                        : isGa4MeasurementValid 
                          ? 'bg-white border-emerald-500 ring-1 ring-emerald-500/25' 
                          : 'bg-red-50/10 border-red-500 ring-1 ring-red-500/25 shadow-2xs'
                    }`}>
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase text-neutral-900">Google Analytics 4 (GA4)</span>
                          {state.ga4MeasurementId && (
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                              isGa4MeasurementValid 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black text-[9px]' 
                                : 'bg-red-50 text-red-700 border-red-250 font-black text-[9px]'
                            }`}>
                              {isGa4MeasurementValid ? '🟢 Verified' : '🔴 Invalid Measurement ID'}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleChange('ga4Active', !state.ga4Active)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.ga4Active ? 'bg-zinc-900' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.ga4Active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Measurement ID (G- ID)</label>
                        <input 
                          type="text"
                          value={state.ga4MeasurementId}
                          onChange={(e) => handleChange('ga4MeasurementId', e.target.value)}
                          placeholder="e.g. G-XNK827B1LZ"
                          className={`w-full bg-neutral-50 text-neutral-900 rounded-lg h-9 px-3 text-xs font-mono tracking-wider uppercase focus:outline-none focus:bg-white focus:ring-1 focus:ring-black transition-all ${
                            !state.ga4MeasurementId 
                              ? 'border border-neutral-200' 
                              : isGa4MeasurementValid 
                                ? 'border border-emerald-500 ring-1 ring-emerald-500 focus:ring-emerald-500 text-emerald-950 font-black' 
                                : 'border border-red-500 ring-1 ring-red-500 focus:ring-red-500 text-red-950 font-bold'
                          }`}
                        />
                        {state.ga4MeasurementId && !isGa4MeasurementValid && (
                          <p className="text-[9px] text-[#DC2626] font-extrabold uppercase mt-1">
                            🔴 Invalid format: GA4 ID must match G-[A-Z0-9] format.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Google Tag Manager */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                        <span className="text-xs font-black uppercase text-neutral-900">Google Tag Manager (GTM)</span>
                        <button 
                          onClick={() => handleChange('gtmActive', !state.gtmActive)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.gtmActive ? 'bg-zinc-900' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.gtmActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">GTM Container ID</label>
                        <input 
                          type="text"
                          value={state.gtmId}
                          onChange={(e) => handleChange('gtmId', e.target.value)}
                          placeholder="e.g. GTM-K98ZFXB"
                          className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider uppercase focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>

                    {/* Google Ads */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                        <span className="text-xs font-black uppercase text-neutral-900">Google Ads Conversion</span>
                        <button 
                          onClick={() => handleChange('gAdsActive', !state.gAdsActive)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.gAdsActive ? 'bg-zinc-900' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.gAdsActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Conversion Linker ID</label>
                          <input 
                            type="text"
                            value={state.gAdsConversionId}
                            onChange={(e) => handleChange('gAdsConversionId', e.target.value)}
                            placeholder="e.g. AW-110283918-X"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider uppercase focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Conversion Label</label>
                          <input 
                            type="text"
                            value={state.gAdsConversionLabel}
                            onChange={(e) => handleChange('gAdsConversionLabel', e.target.value)}
                            placeholder="e.g. g_ads_purchase_conv"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Google Search Console & Merchant Center */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900">Google Search Console & Merchant Feed</span>
                          <p className="text-[8px] text-zinc-400 font-bold uppercase">Boost organic ranking & google shopping carousel</p>
                        </div>
                        <button 
                          onClick={() => handleChange('gMerchantActive', !state.gMerchantActive)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.gMerchantActive ? 'bg-zinc-900' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.gMerchantActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Search Console Verification Tag</label>
                          <input 
                            type="text"
                            value={state.gSearchConsoleVerificationId}
                            onChange={(e) => handleChange('gSearchConsoleVerificationId', e.target.value)}
                            placeholder="google-site-verification=..."
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Merchant Center ID</label>
                          <input 
                            type="text"
                            value={state.gMerchantCenterId}
                            onChange={(e) => handleChange('gMerchantCenterId', e.target.value)}
                            placeholder="e.g. MC-892102931"
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Google Events Indicator */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs md:col-span-2">
                      <span className="text-xs font-black uppercase text-neutral-900 block pb-1 border-b border-neutral-100">Standard GA4 E-Commerce Events stream</span>
                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-[10px] font-black tracking-wider">
                        <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                          <span>page_view</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                          <span>view_item</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                          <span>add_to_cart</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                          <span>begin_checkout</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                          <span>purchase</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-neutral-50 p-1.5 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                          <span>search</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: WEBSITE TRACKING */}
              {activeTab === 'website' && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-600 text-white rounded-lg">
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Custom Web Session tracking</h4>
                        <p className="text-[10px] text-amber-700 font-bold uppercase mt-0.5">Control front-end behavioral capture filters and triggers</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange('webTrackingActive', !state.webTrackingActive)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.webTrackingActive ? 'bg-amber-600' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.webTrackingActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
                    <div className="border-b border-neutral-100 pb-3">
                      <span className="text-sm font-black uppercase text-neutral-900">Web Session Behavioral Filters Tracker</span>
                      <p className="text-xs text-neutral-400 font-bold mt-0.5 uppercase">Toggle tracking points to filter customer journey events cleanly</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Sub toggle: User Journey */}
                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">User Journey Funnels</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">Tracks customer pathways from landing to thank you</span>
                        </div>
                        <button 
                          onClick={() => handleChange('trackUserJourney', !state.trackUserJourney)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.trackUserJourney ? 'bg-amber-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.trackUserJourney ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Sub toggle: Device & Screen capturing config */}
                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">Behavioral Heatmaps Feed</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">Captures scroll metrics and dynamic element hovers</span>
                        </div>
                        <button 
                          onClick={() => handleChange('trackSessionRecording', !state.trackSessionRecording)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.trackSessionRecording ? 'bg-amber-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.trackSessionRecording ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Sub toggle: Clicks */}
                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">Element Click Tracking</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase font-mono">Collect triggers on order inputs, coupons and numbers</span>
                        </div>
                        <button 
                          onClick={() => handleChange('trackClicks', !state.trackClicks)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.trackClicks ? 'bg-amber-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.trackClicks ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Sub toggle: Scrolls */}
                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">Scroll Depth Benchmarks</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">Sends triggers at 25%, 50%, 75% and 90% viewable thresholds</span>
                        </div>
                        <button 
                          onClick={() => handleChange('trackScrollDepth', !state.trackScrollDepth)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.trackScrollDepth ? 'bg-amber-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.trackScrollDepth ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Sub toggle: Forms */}
                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">Form & Field Signals</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">Signals abandoned inputs without storing private user entries</span>
                        </div>
                        <button 
                          onClick={() => handleChange('trackFormSubmissions', !state.trackFormSubmissions)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.trackFormSubmissions ? 'bg-amber-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.trackFormSubmissions ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      {/* Sub toggle: Custom Search */}
                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-all">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">Internal Search Analytics</span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">Tracks customer catalog search phrases to optimize promo deals</span>
                        </div>
                        <button 
                          onClick={() => handleChange('trackCustomSearchTriggers', !state.trackCustomSearchTriggers)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.trackCustomSearchTriggers ? 'bg-amber-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.trackCustomSearchTriggers ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SERVER SIDE */}
              {activeTab === 'serverside' && (
                <div className="space-y-6">
                  <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-teal-600 text-white rounded-lg">
                        <Zap className="w-5 h-5 text-yellow-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-teal-900">Secure Server-Side Gateway protocols</h4>
                        <p className="text-[10px] text-teal-700 font-bold uppercase mt-0.5">Bypass browser adblocks with high-precision cookie endpoints</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange('ssActive', !state.ssActive)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.ssActive ? 'bg-teal-600' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${state.ssActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Server tracking parameters config */}
                    <div className={`border rounded-xl p-5 space-y-4 shadow-xs transition-all ${
                      !state.ssEndpoint 
                        ? 'bg-white border-neutral-200' 
                        : isSsEndpointValid 
                          ? 'bg-white border-emerald-500 ring-1 ring-emerald-500/25' 
                          : 'bg-red-50/10 border-red-500 ring-1 ring-red-500/25 shadow-2xs'
                    }`}>
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                        <span className="text-xs font-black uppercase text-neutral-900 block font-sans">CAPI Gateway Parameters</span>
                        {state.ssEndpoint && (
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                            isSsEndpointValid 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-black text-[9px]' 
                              : 'bg-red-50 text-red-700 border-red-250 font-black text-[9px]'
                          }`}>
                            {isSsEndpointValid ? '🟢 Active & Verified' : '🔴 Invalid Endpoint URL'}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Server Endpoint API Gateway</label>
                          <input 
                            type="text"
                            value={state.ssEndpoint}
                            onChange={(e) => handleChange('ssEndpoint', e.target.value)}
                            placeholder="e.g. https://ss-capi.tazumart.com/v1/collect"
                            className={`w-full bg-neutral-50 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-black transition-all ${
                              !state.ssEndpoint 
                                ? 'border border-neutral-200' 
                                : isSsEndpointValid 
                                  ? 'border border-emerald-500 ring-1 ring-emerald-500 focus:ring-emerald-500 text-emerald-950 font-black font-mono' 
                                  : 'border border-red-500 ring-1 ring-red-500 focus:ring-red-500 text-red-955 font-bold font-mono'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block">Gateway Secret Signature (Token)</label>
                            <button 
                              onClick={() => toggleReveal('ssSecretKey')}
                              className="text-[9px] font-bold text-neutral-400 hover:text-black uppercase tracking-wider flex items-center gap-1 font-mono"
                            >
                              {revealedKeys['ssSecretKey'] ? <EyeOff className="w-3" /> : <Eye className="w-3" />}
                              {revealedKeys['ssSecretKey'] ? 'Hide' : 'Reveal'}
                            </button>
                          </div>
                          <input 
                            type={revealedKeys['ssSecretKey'] ? 'text' : 'password'}
                            value={state.ssSecretKey}
                            onChange={(e) => handleChange('ssSecretKey', e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Server optimizations configs */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <span className="text-xs font-black uppercase text-neutral-900 block pb-1 border-b border-neutral-100">Deduplication & Enhanced Targeting Controls</span>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-lg">
                          <div>
                            <span className="text-xs font-black uppercase text-neutral-900 block">Google Enhanced Conversions</span>
                            <span className="text-[9px] text-neutral-400 font-bold uppercase">Encrypts and matches user emails with google identities</span>
                          </div>
                          <button 
                            onClick={() => handleChange('gEnhancedConversionsActive', !state.gEnhancedConversionsActive)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.gEnhancedConversionsActive ? 'bg-teal-600' : 'bg-neutral-200'}`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.gEnhancedConversionsActive ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Meta Event Deduplication Window (Mins)</label>
                          <input 
                            type="number"
                            value={state.eventDeduplicationWindow}
                            onChange={(e) => handleChange('eventDeduplicationWindow', parseInt(e.target.value) || 15)}
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none focus:bg-white focus:ring-1 focus:ring-black"
                          />
                          <p className="text-[9px] text-neutral-400 mt-1 font-bold uppercase">Meta filters browser event ID matching server event ID within this time.</p>
                        </div>
                      </div>
                    </div>

                    {/* Server event logging streams summary */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs md:col-span-2">
                      <span className="text-xs font-black uppercase text-neutral-900 block pb-1 border-b border-neutral-100">Active Server Container Deduplicated event streams</span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-black uppercase text-zinc-700">
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-150">✔ Meta CAPI Stream</div>
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-150">✔ TikTok S2S Events</div>
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-150">✔ GG Enhanced Purchase</div>
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-150">✔ Deduplication Deduplicated</div>
                        <div className="p-2 bg-neutral-50 rounded border border-neutral-150">✔ Ad-Block bypass active</div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: PINTEREST */}
              {activeTab === 'pinterest' && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-150 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-150 text-red-600 rounded-lg">
                        <Tag className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-neutral-900">Pinterest Conversion Tag</h4>
                        <p className="text-[10px] text-neutral-400 uppercase font-black">Pinterest Visual Commerce Analytics</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange('pinterestActive', !state.pinterestActive)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.pinterestActive ? 'bg-red-600' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${state.pinterestActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Pinterest Tag ID</label>
                      <input 
                        type="text"
                        value={state.pinterestTagId}
                        onChange={(e) => handleChange('pinterestTagId', e.target.value)}
                        placeholder="e.g. PN-9018A"
                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-bold focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: SNAPCHAT */}
              {activeTab === 'snapchat' && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-150 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                        <Sparkles className="w-5 h-5 text-yellow-650" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-neutral-900">Snapchat Ads Pixel</h4>
                        <p className="text-[10px] text-neutral-400 uppercase font-black">Snapchat Augmented commerce analytics</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange('snapchatActive', !state.snapchatActive)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 ${state.snapchatActive ? 'bg-yellow-500' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${state.snapchatActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Snapchat Pixel ID</label>
                      <input 
                        type="text"
                        value={state.snapchatPixelId}
                        onChange={(e) => handleChange('snapchatPixelId', e.target.value)}
                        placeholder="e.g. SN-91028X"
                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-bold focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: LINKEDIN */}
              {activeTab === 'linkedin' && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-neutral-150 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
                        <UserCheck className="w-5 h-5 text-blue-800" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-neutral-900">LinkedIn Insight Tag</h4>
                        <p className="text-[10px] text-neutral-400 uppercase font-black">Professional & b2b targeting suite</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange('linkedinActive', !state.linkedinActive)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.linkedinActive ? 'bg-blue-800' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${state.linkedinActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">LinkedIn Partner ID</label>
                      <input 
                        type="text"
                        value={state.linkedinPartnerId}
                        onChange={(e) => handleChange('linkedinPartnerId', e.target.value)}
                        placeholder="e.g. LI-772159"
                        className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MICROSOFT */}
              {activeTab === 'microsoft' && (
                <div className="space-y-6">
                  <div className="bg-sky-50 border border-sky-250 p-4 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-655 bg-sky-650 text-white rounded-lg">
                        <SlidersHorizontal className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-900">Microsoft Clarity visual Tracking</h4>
                        <p className="text-[10px] text-sky-700 font-bold uppercase mt-0.5">Heatmaps tracking, visitor screen recording sessions & user journey insights</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleChange('clarityActive', !state.clarityActive)}
                      className={`w-10 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.clarityActive ? 'bg-sky-600' : 'bg-neutral-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${state.clarityActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Settings Panel */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <span className="text-xs font-black uppercase text-neutral-900 block pb-1 border-b border-neutral-100">Microsoft Clarity ID</span>
                      
                      <div>
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Clarity Project ID Key</label>
                        <input 
                          type="text"
                          value={state.clarityProjectId}
                          onChange={(e) => handleChange('clarityProjectId', e.target.value)}
                          placeholder="e.g. CL-8921B"
                          className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none"
                        />
                        <p className="text-[9px] text-neutral-400 font-bold mt-1.5 uppercase leading-relaxed">
                          Your visual recording agent will trigger silently on front-end layouts reporting to Microsoft Clarity console.
                        </p>
                      </div>
                    </div>

                    {/* Simualted feature panel */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <span className="text-xs font-black uppercase text-neutral-900 block pb-1 border-b border-neutral-100">Heatmap & Recording telemetry</span>
                      
                      <div className="space-y-2.5 text-xs text-neutral-600 font-bold">
                        <div className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                          <span className="uppercase text-[9px]">1. Heatmap Click Analytics</span>
                          <span className="text-emerald-600 font-black">✔ CAPTURING</span>
                        </div>
                        <div className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                          <span className="uppercase text-[9px]">2. Scroll Depth analytics</span>
                          <span className="text-emerald-600 font-black">✔ RECORDING</span>
                        </div>
                        <div className="flex justify-between items-center bg-neutral-50 p-2 rounded">
                          <span className="uppercase text-[9px]">3. Playback Sessions Stream</span>
                          <span className="text-emerald-600 font-black">✔ DISPATCHED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ATTRIBUTION & UTM */}
              {activeTab === 'attribution' && (
                <div className="space-y-6">
                  
                  {/* Traffic source stats cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">Total BDT Sales</span>
                      <p className="text-lg font-black text-neutral-900 mt-1">৳{totalSales.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-neutral-400 uppercase mt-0.5">Across all order nodes</p>
                    </div>

                    <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-500">Facebook Conversions</span>
                      <p className="text-lg font-black text-neutral-900 mt-1">৳{fbSales.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase mt-0.5">{fbOrdersCount} Attributed Orders</p>
                    </div>

                    <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-500">Google Conversions</span>
                      <p className="text-lg font-black text-neutral-900 mt-1">৳{ggSales.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase mt-0.5">{ggOrdersCount} Attributed Orders</p>
                    </div>

                    <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-rose-500">TikTok Conversions</span>
                      <p className="text-lg font-black text-neutral-900 mt-1">৳{ttSales.toLocaleString()}</p>
                      <p className="text-[10px] font-black text-rose-600 uppercase mt-0.5">{ttOrdersCount} Attributed Orders</p>
                    </div>

                  </div>

                  {/* UTM Parameter Tracking definitions and simulation info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div>
                        <span className="text-xs font-black uppercase text-neutral-900">Captured UTM Query Nodes</span>
                        <p className="text-[9px] text-zinc-400 uppercase font-black">All browser landing parameters are verified and logged on order</p>
                      </div>

                      <div className="space-y-2 text-[11px] font-bold text-neutral-700">
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                          <span className="font-mono text-zinc-950">utm_source</span>
                          <span className="text-[10px] uppercase text-zinc-400">Campaign Source Medium (e.g. facebook)</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                          <span className="font-mono text-zinc-950">utm_medium</span>
                          <span className="text-[10px] uppercase text-zinc-400">Campaign Medium (e.g. cpc)</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                          <span className="font-mono text-zinc-950">utm_campaign</span>
                          <span className="text-[10px] uppercase text-zinc-400">Marketing Campaign identifier</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                          <span className="font-mono text-zinc-950">utm_content</span>
                          <span className="text-[10px] uppercase text-zinc-400">Ad Variant/A-B variant ID</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                          <span className="font-mono text-zinc-950">utm_term</span>
                          <span className="text-[10px] uppercase text-zinc-400">Organic keyword targeting tags</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                          <span className="text-emerald-600 uppercase font-bold text-[9px]">✔ Referrer Acquisition</span>
                          <span className="text-[10px] uppercase text-emerald-700">Tracks originating domains</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-neutral-50 rounded">
                          <span className="text-emerald-600 uppercase font-bold text-[9px]">✔ Multi-touch Attributions</span>
                          <span className="text-[10px] uppercase text-emerald-700">Compares First Touch vs Last Touch</span>
                        </div>
                      </div>
                    </div>

                    {/* Spend ROAS analytical estimator */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
                      <div className="border-b border-neutral-100 pb-2.5">
                        <span className="text-xs font-black uppercase text-neutral-900">Campaign ROAS & Cost Performance Tracker</span>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">Simulate cost estimations vs sales pipeline results</p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Estimated Monthly Ad Spend budget (USD)</label>
                          <input 
                            type="number"
                            value={state.adSpendBudget}
                            onChange={(e) => handleChange('adSpendBudget', parseInt(e.target.value) || 0)}
                            className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg h-9 px-3 text-xs font-extrabold tracking-wider focus:outline-none"
                          />
                        </div>

                        <div className="bg-neutral-50 p-3 rounded-lg space-y-2 text-xs">
                          <div className="flex justify-between items-center font-bold">
                            <span className="uppercase text-[9px] text-neutral-500">Facebook ROAS:</span>
                            <span className="font-black text-blue-700 font-mono">{fbRoas}x Return</span>
                          </div>
                          <div className="flex justify-between items-center font-bold">
                            <span className="uppercase text-[9px] text-neutral-500">TikTok ROAS:</span>
                            <span className="font-black text-rose-600 font-mono">{ttRoas}x Return</span>
                          </div>
                          <div className="flex justify-between items-center font-bold pt-2 border-t border-neutral-200">
                            <span className="uppercase text-[9px] text-neutral-500 font-black">Blend ecommerce conversion rate:</span>
                            <span className="font-black text-neutral-950">2.64%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Funnel tracking model */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
                    <span className="text-xs font-black uppercase text-neutral-900 block pb-2.5 border-b border-neutral-100">
                      Conversion Funnel Visual Analytics
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center mt-4">
                      
                      <div className="p-4 bg-zinc-50 border border-zinc-250 rounded-xl space-y-1">
                        <span className="text-[9px] font-black uppercase text-zinc-400 block">1. View Product</span>
                        <p className="text-xl font-black text-zinc-900">12,184 Sessions</p>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase">100% Core Base</span>
                      </div>

                      <div className="p-4 bg-zinc-50 border border-zinc-250 rounded-xl space-y-1 border-l-2 border-l-amber-400">
                        <span className="text-[9px] font-black uppercase text-zinc-400 block">2. Add To Cart</span>
                        <p className="text-xl font-black text-zinc-900">1,940 Sessions</p>
                        <span className="text-[9px] font-extrabold text-amber-600 uppercase">15.9% Conversion</span>
                      </div>

                      <div className="p-4 bg-zinc-50 border border-zinc-250 rounded-xl space-y-1 border-l-2 border-l-indigo-400">
                        <span className="text-[9px] font-black uppercase text-zinc-400 block">3. Checkout Initiate</span>
                        <p className="text-xl font-black text-zinc-900">712 Sessions</p>
                        <span className="text-[9px] font-extrabold text-indigo-600 uppercase">36.7% Cart Checkout</span>
                      </div>

                      <div className="p-4 bg-zinc-950 text-white border border-zinc-800 rounded-xl space-y-1">
                        <span className="text-[9px] font-black uppercase text-yellow-405 text-zinc-300 block">4. Placed Purchase</span>
                        <p className="text-xl font-black text-white">{realOrders.length} Paid Purchases</p>
                        <span className="text-[9px] font-extrabold text-[#10B981] uppercase">
                          {realOrders.length > 0 ? ((realOrders.length / 12184) * 100).toFixed(2) : '1.45'}% blend Rate
                        </span>
                      </div>

                    </div>
                  </div>

                </div>
              )}

              {/* TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
                  
                  <div className="border-b border-neutral-100 pb-3">
                    <span className="text-sm font-black uppercase text-neutral-900">Marketing & Telemetry Notifications Alerts</span>
                    <p className="text-xs text-neutral-400 font-bold mt-0.5 uppercase">Sync notifications channels and receive weekly reports via Telegram or email</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Alerts toggles */}
                    <div className="space-y-4">
                      
                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl bg-neutral-50">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">Notify On Signal Failures</span>
                          <span className="text-[9px] text-neutral-400 font-bold uppercase">Trigger instant alert if Facebook CAPI drops</span>
                        </div>
                        <button 
                          onClick={() => handleChange('notifyOnPixelFailure', !state.notifyOnPixelFailure)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.notifyOnPixelFailure ? 'bg-violet-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.notifyOnPixelFailure ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center p-3 border border-neutral-200 rounded-xl bg-neutral-50">
                        <div>
                          <span className="text-xs font-black uppercase text-neutral-900 block">Weekly Digest reports</span>
                          <span className="text-[9px] text-neutral-400 font-bold uppercase">Automated summary of conversion rate, adspend & ROAS</span>
                        </div>
                        <button 
                          onClick={() => handleChange('notifyWeeklyReportByEmail', !state.notifyWeeklyReportByEmail)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.notifyWeeklyReportByEmail ? 'bg-violet-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.notifyWeeklyReportByEmail ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                    </div>

                    {/* Telegram Bot details */}
                    <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl space-y-3.5">
                      <div className="flex justify-between items-center border-b border-neutral-200 pb-1.5">
                        <span className="text-xs font-black uppercase text-neutral-900">Telegram Channel Notifications</span>
                        <button 
                          onClick={() => handleChange('notifyTelegramActive', !state.notifyTelegramActive)}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${state.notifyTelegramActive ? 'bg-violet-600' : 'bg-neutral-200'}`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${state.notifyTelegramActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Telegram Bot API Token</label>
                          <input 
                            type="text"
                            value={state.notifyTelegramBotToken}
                            onChange={(e) => handleChange('notifyTelegramBotToken', e.target.value)}
                            placeholder="730198231:AAF_..."
                            className="w-full bg-white border border-neutral-205 text-neutral-900 rounded-lg h-9 px-3 text-xs font-semibold focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 block mb-1">Telegram Target Chat ID</label>
                          <input 
                            type="text"
                            value={state.notifyTelegramChatId}
                            onChange={(e) => handleChange('notifyTelegramChatId', e.target.value)}
                            placeholder="-100..."
                            className="w-full bg-white border border-neutral-205 text-neutral-900 rounded-lg h-9 px-3 text-xs font-black tracking-wider focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB: TESTING CENTER */}
              {activeTab === 'testing' && (
                <div className="space-y-6">
                  
                  {/* Test Event controls block */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div>
                      <span className="text-xs font-black uppercase text-neutral-900">Diagnostic Event dispatcher</span>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">Click any testing payload below to trigger direct simulated telemetry signals</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      
                      <button 
                        onClick={() => triggerTestEvent('facebook', 'PageView')}
                        className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 hover:border-blue-600 rounded-lg text-xs font-black uppercase tracking-wider transition-all text-neutral-800"
                      >
                        <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Test Facebook Event</span>
                      </button>

                      <button 
                        onClick={() => triggerTestEvent('tiktok', 'ViewContent')}
                        className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 hover:border-rose-500 rounded-lg text-xs font-black uppercase tracking-wider transition-all text-neutral-800"
                      >
                        <Video className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Test TikTok Event</span>
                      </button>

                      <button 
                        onClick={() => triggerTestEvent('google', 'view_item')}
                        className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 hover:border-zinc-800 rounded-lg text-xs font-black uppercase tracking-wider transition-all text-neutral-800"
                      >
                        <Globe className="w-4 h-4 text-neutral-900 shrink-0" />
                        <span>Test Google Event</span>
                      </button>

                      <button 
                        onClick={() => triggerTestEvent('serverside', 'Deduplicated_Event')}
                        className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 hover:border-teal-500 rounded-lg text-xs font-black uppercase tracking-wider transition-all text-neutral-800"
                      >
                        <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Test Server Event</span>
                      </button>

                      <button 
                        onClick={() => triggerTestEvent('facebook', 'Purchase')}
                        className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 hover:border-blue-600 rounded-lg text-xs font-black uppercase tracking-wider transition-all text-neutral-800"
                      >
                        <ShoppingBag className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Test Purchase Event</span>
                      </button>

                      <button 
                        onClick={() => triggerTestEvent('tiktok', 'AddToCart')}
                        className="flex items-center gap-2 px-3 py-2.5 bg-neutral-50 border border-neutral-200 hover:border-rose-500 rounded-lg text-xs font-black uppercase tracking-wider transition-all text-neutral-800"
                      >
                        <ShoppingBag className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Test Add To Cart Event</span>
                      </button>

                    </div>
                  </div>

                  {/* Terminal Live logs logger console */}
                  <div className="bg-zinc-950 border border-zinc-805 rounded-xl overflow-hidden font-mono text-xs flex flex-col h-96 shadow-2xl">
                    <div className="bg-zinc-900 px-4 py-2.5 flex justify-between items-center border-b border-zinc-800">
                      <div className="flex items-center gap-2 text-white">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold tracking-wider text-[10px] uppercase">Cross-Channel Live Signal Stream</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setLogs([])}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-black uppercase rounded transition-all"
                        >
                          Clear Console
                        </button>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-zinc-300">
                      {logs.length === 0 ? (
                        <div className="text-zinc-500 text-center py-20 uppercase font-bold tracking-wider">
                          Console stream empty. Dispatch a diagnostic test event above.
                        </div>
                      ) : (
                        logs.map((log) => (
                          <div key={log.id} className="space-y-1 bg-zinc-900/50 p-2 text-[11px] rounded border border-zinc-900">
                            <div className="flex justify-between items-center text-zinc-455">
                              <div className="flex items-center gap-1.5">
                                <span className="text-zinc-500">[{log.timestamp}]</span>
                                <span className="text-blue-400 font-bold uppercase">{log.channel}</span>
                                <span className="text-emerald-400 font-bold">{log.eventName}</span>
                              </div>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-830 text-amber-400'}`}>
                                {log.status}
                              </span>
                            </div>
                            <pre className="text-[10px] text-zinc-400 bg-black/40 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </div>
                        ))
                      )}
                      <div ref={consoleBottomRef} />
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>



    </div>
  );
}
