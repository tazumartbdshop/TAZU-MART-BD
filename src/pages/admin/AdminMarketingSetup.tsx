import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  ChevronRight, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Upload, 
  Activity, 
  ShieldAlert, 
  CheckCircle,
  X,
  RefreshCw,
  Database,
  Sliders,
  Sparkles,
  Zap,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminMarketingSetupProps {
  type: 'facebook' | 'tiktok' | 'google';
}

// Persisted configuration interface
interface MarketingConfig {
  facebook: {
    pixelId: string;
    conversionApiToken: string;
    datasetId: string;
    accessToken: string;
    businessAccountId: string;
    events: {
      pageView: boolean;
      viewContent: boolean;
      addToCart: boolean;
      initiateCheckout: boolean;
      purchase: boolean;
      lead: boolean;
      completeRegistration: boolean;
    };
    domainVerification: string;
    eventMatchQuality: string;
    serverSideTracking: boolean;
    autoEventDetection: boolean;
    status: 'CONNECTED' | 'NOT_CONNECTED';
    lastUpdated: string;
  };
  tiktok: {
    pixelId: string;
    eventsApiToken: string;
    advertiserId: string;
    businessCenterId: string;
    accessToken: string;
    events: {
      viewContent: boolean;
      addToCart: boolean;
      checkout: boolean;
      purchase: boolean;
      completePayment: boolean;
    };
    status: 'CONNECTED' | 'NOT_CONNECTED';
    lastSyncTime: string;
    apiHealth: 'EXCELLENT' | 'GOOD' | 'CRITICAL' | 'UNKNOWN';
  };
  google: {
    measurementId: string;
    gtmId: string;
    conversionId: string;
    conversionLabel: string;
    serviceAccountJsonName: string;
    events: {
      pageTracking: boolean;
      ecommerceTracking: boolean;
      purchaseTracking: boolean;
      scrollTracking: boolean;
      buttonClickTracking: boolean;
      conversionTracking: boolean;
    };
    status: 'CONNECTED' | 'NOT_CONNECTED';
    lastUpdated: string;
  };
}

const defaultConfig: MarketingConfig = {
  facebook: {
    pixelId: 'FB-991823102-1X',
    conversionApiToken: 'ca_prod_90a18f2f66304cb3b4aef9b2eb8c1507d',
    datasetId: 'DS-29011832',
    accessToken: 'EAABy36YZA1YIBADb3ZCOp05C8ZCO7dE0mSg1mP6mZCw9bIiz24ZC7G65w3mGZA6Yp6xZB1lGv6Yf1wZBqWd9v2Y',
    businessAccountId: 'BA-77196023',
    events: {
      pageView: true,
      viewContent: true,
      addToCart: true,
      initiateCheckout: true,
      purchase: true,
      lead: false,
      completeRegistration: false,
    },
    domainVerification: 'tazumart.com-fb-verify-91zobpq83',
    eventMatchQuality: '8.4 / 10 (Very High)',
    serverSideTracking: true,
    autoEventDetection: true,
    status: 'CONNECTED',
    lastUpdated: 'May 24, 2026, 12:45 PM',
  },
  tiktok: {
    pixelId: 'TT-PXL-900381',
    eventsApiToken: 'tt_api_token_c88bb7d0a2104db809e2',
    advertiserId: 'ADV-771289',
    businessCenterId: 'BC-11203819',
    accessToken: 'tt_access_89e4cbf8da029bcf8910d6a4fe3',
    events: {
      viewContent: true,
      addToCart: true,
      checkout: true,
      purchase: true,
      completePayment: false,
    },
    status: 'CONNECTED',
    lastSyncTime: 'May 24, 2026, 1:12 PM',
    apiHealth: 'EXCELLENT',
  },
  google: {
    measurementId: 'G-XNK827B1LZ',
    gtmId: 'GTM-K98ZFXB',
    conversionId: 'AW-110283918-X',
    conversionLabel: 'g_ads_purchase_conv',
    serviceAccountJsonName: 'tazu-analytics-service-key.json',
    events: {
      pageTracking: true,
      ecommerceTracking: true,
      purchaseTracking: true,
      scrollTracking: false,
      buttonClickTracking: true,
      conversionTracking: true,
    },
    status: 'NOT_CONNECTED',
    lastUpdated: 'May 23, 2026, 8:14 AM',
  }
};

export default function AdminMarketingSetup({ type }: AdminMarketingSetupProps) {
  const [config, setConfig] = useState<MarketingConfig>(defaultConfig);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<{ [key: string]: boolean }>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  // Custom non-floating alert state
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // File Upload drag states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  // High fidelity interactive handshake simulation state
  const [handshakeProgress, setHandshakeProgress] = useState<number>(0);
  const [handshakeStep, setHandshakeStep] = useState<string>('');
  const [showProgressToast, setShowProgressToast] = useState<boolean>(false);
  const [activeHandshakeType, setActiveHandshakeType] = useState<'facebook' | 'tiktok' | 'google' | null>(null);
  const [handshakeSuccess, setHandshakeSuccess] = useState<boolean | null>(null);

  // Load configuration from localstorage on mount or type change
  useEffect(() => {
    const saved = localStorage.getItem('tazu_mart_marketing_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse marketing configuration', e);
      }
    } else {
      localStorage.setItem('tazu_mart_marketing_config', JSON.stringify(defaultConfig));
    }
  }, [type]);

  const saveToLocalStorage = (updatedConfig: MarketingConfig) => {
    localStorage.setItem('tazu_mart_marketing_config', JSON.stringify(updatedConfig));
  };

  const handleCopyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleFieldVisibility = (fieldName: string) => {
    setVisibleFields(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleToggleEvent = (section: 'facebook' | 'tiktok' | 'google', eventKey: string) => {
    const updated = {
      ...config,
      [section]: {
        ...config[section],
        events: {
          ...config[section].events,
          [eventKey]: !((config[section].events as any)[eventKey])
        }
      }
    };
    setConfig(updated);
  };

  const handleFieldChange = (section: 'facebook' | 'tiktok' | 'google', field: string, value: string) => {
    const updated = {
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    };
    setConfig(updated);
  };

  const handleSaveSettings = () => {
    setSaving(true);
    setAlert(null);
    
    setTimeout(() => {
      setSaving(false);
      // Update the last updated time
      const nowString = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      const updated = {
        ...config,
        [type]: {
          ...config[type],
          lastUpdated: nowString,
          lastSyncTime: type === 'tiktok' ? nowString : (config.tiktok.lastSyncTime || nowString)
        }
      };
      
      setConfig(updated);
      saveToLocalStorage(updated);
      
      setAlert({
        type: 'success',
        message: `${type.toUpperCase()} Tracking configuration published and connected successfully.`
      });
    }, 1200);
  };

  const handleVerifyConnection = () => {
    setVerifying(true);
    setAlert(null);
    setHandshakeProgress(0);
    setHandshakeSuccess(null);
    setShowProgressToast(true);
    setActiveHandshakeType(type);

    const hasInputs = type === 'facebook' ? config.facebook.pixelId && config.facebook.accessToken :
                      type === 'tiktok' ? config.tiktok.pixelId && config.tiktok.accessToken :
                      config.google.measurementId;

    const steps = [
      { progress: 15, msg: 'Initializing secure TLS handshake...' },
      { progress: 40, msg: `Resolving DNS host endpoints to direct API servers for ${type === 'facebook' ? 'Meta Graph' : type === 'tiktok' ? 'TikTok Ads' : 'Google GA4'}...` },
      { progress: 65, msg: 'Hashing Client ID / Access Token credentials and transmitting secure payload...' },
      { progress: 85, msg: 'Validating payload headers and receiving secure handshake response stream...' },
      { progress: 100, msg: hasInputs ? 'HTTP/2 200 OK Connection verified successfully.' : 'HTTP/2 401 Unauthorized handshake credentials rejected.' }
    ];

    let currentStepIdx = 0;
    setHandshakeStep(steps[currentStepIdx].msg);

    const intervalId = setInterval(() => {
      setHandshakeProgress((prev) => {
        const increment = Math.floor(Math.random() * 8) + 6;
        const nextProgress = Math.min(prev + increment, 100);
        
        // Find corresponding message step depending on current progress
        const appropriateStep = steps.find(s => nextProgress <= s.progress);
        if (appropriateStep && appropriateStep.msg !== handshakeStep) {
          setHandshakeStep(appropriateStep.msg);
        }

        if (nextProgress >= 100) {
          clearInterval(intervalId);
          setHandshakeStep(steps[steps.length - 1].msg);
          
          setTimeout(() => {
            setVerifying(false);
            if (hasInputs) {
              setHandshakeSuccess(true);
              const updated = {
                ...config,
                [type]: {
                  ...config[type],
                  status: 'CONNECTED' as const,
                  apiHealth: type === 'tiktok' ? 'EXCELLENT' as const : undefined
                }
              };
              setConfig(updated);
              saveToLocalStorage(updated);
            } else {
              setHandshakeSuccess(false);
            }
          }, 350);
          return 100;
        }
        return nextProgress;
      });
    }, 120);
  };

  // Google specific Service Account File upload simulator
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.json')) {
        setUploadedFile(file.name);
        handleFieldChange('google', 'serviceAccountJsonName', file.name);
        setAlert({ type: 'info', message: `Service Account JSON file "${file.name}" ready for upload.` });
      } else {
        setAlert({ type: 'error', message: 'Invalid file format. Only service account keys in JSON format are supported.' });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.endsWith('.json')) {
        setUploadedFile(file.name);
        handleFieldChange('google', 'serviceAccountJsonName', file.name);
        setAlert({ type: 'info', message: `Service Account JSON file "${file.name}" selected.` });
      } else {
        setAlert({ type: 'error', message: 'Invalid file format. Only service account keys in JSON format are supported.' });
      }
    }
  };

  const clearUploadedFile = () => {
    setUploadedFile(null);
    handleFieldChange('google', 'serviceAccountJsonName', '');
  };

  return (
    <div className="space-y-8 font-sans text-black pb-12">
      {/* Alert System - Flat, Sharp, Black Border, strictly No floating overlay */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-start justify-between p-4 border-2 border-black rounded-none shadow-[3px_3px_0px_#000] ${
              alert.type === 'success' ? 'bg-[#E8F5E9] text-black border-black' :
              alert.type === 'error' ? 'bg-[#FFEBEE] text-black border-black' :
              'bg-[#EBF8FF] text-black border-black'
            }`}
          >
            <div className="flex gap-3">
              <span className="mt-0.5">
                {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-700" />}
                {alert.type === 'error' && <ShieldAlert className="w-5 h-5 text-red-700" />}
                {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-700" />}
              </span>
              <div>
                <h4 className="font-extrabold uppercase text-[11px] tracking-wider">
                  {alert.type === 'success' ? 'System Success' : alert.type === 'error' ? 'Validation Alert' : 'Integration Notice'}
                </h4>
                <p className="text-xs font-semibold mt-1 opacity-90">{alert.message}</p>
              </div>
            </div>
            <button 
              onClick={() => setAlert(null)}
              className="p-1 hover:bg-black/5 transition-colors rounded-none"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-black bg-white shadow-[3px_3px_0px_#000] rounded-none gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 block mb-1">
            Tracking Engine Connectivity
          </span>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            {type === 'facebook' && 'Facebook Pixel & API'}
            {type === 'tiktok' && 'TikTok Pixel & Events'}
            {type === 'google' && 'Google Analytics & GTM'}
          </h1>
          <p className="text-xs font-bold text-gray-500 mt-1 max-w-xl uppercase tracking-wide">
            {type === 'facebook' && 'Connect Facebook Conversion API (CAPI) & Pixel to track frontend and server events.'}
            {type === 'tiktok' && 'Synthesize TikTok events API to sync conversion data, optimize campaign bids, and track metrics.'}
            {type === 'google' && 'Configure Google Tag Manager (GTM) and GA4 Measurement ID for deep funnel insights.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            type="button"
            onClick={handleVerifyConnection}
            disabled={verifying}
            className="flex-1 md:flex-initial h-12 bg-white hover:bg-gray-50 text-black border border-black font-black uppercase text-xs tracking-[1.5px] rounded-none px-6 shadow-[3px_3px_0px_#000] transition-all flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000]"
          >
            {verifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Activity className="w-4 h-4 text-black" />
                <span>Test Connection</span>
              </>
            )}
          </button>
          
          <button 
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex-1 md:flex-initial h-12 bg-black hover:bg-zinc-800 text-white font-black uppercase text-xs tracking-[1.5px] rounded-none px-6 shadow-[3px_3px_0px_#000] transition-all flex items-center justify-center gap-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#000]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Save & Sync</span>
              </>
            )}
          </button>
        </div>
      </div>

      {type === 'facebook' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls of Facebook */}
          <div className="lg:col-span-8 space-y-8">
            {/* Connection Form Section */}
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Section 1 — Pixel Credentials</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Connect your business manager to receive secure signals.
                </p>
              </div>
              <hr className="border-t border-black"></hr>

              <div className="space-y-5">
                {/* Facebook Pixel ID */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Facebook Pixel ID
                    </label>
                    <button 
                      onClick={() => handleCopyToClipboard(config.facebook.pixelId, 'fb_pixel')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedField === 'fb_pixel' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={config.facebook.pixelId}
                    onChange={(e) => handleFieldChange('facebook', 'pixelId', e.target.value)}
                    placeholder="e.g. 1029481726354"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Conversion API Token */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Conversion API Token
                    </label>
                    <button 
                      onClick={() => toggleFieldVisibility('fb_capi')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      {visibleFields['fb_capi'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {visibleFields['fb_capi'] ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <input 
                    type={visibleFields['fb_capi'] ? 'text' : 'password'}
                    value={config.facebook.conversionApiToken}
                    onChange={(e) => handleFieldChange('facebook', 'conversionApiToken', e.target.value)}
                    placeholder="e.g. ca_prod_..."
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Dataset ID */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Dataset ID (CAPI)
                    </label>
                    <button 
                      onClick={() => handleCopyToClipboard(config.facebook.datasetId, 'fb_dataset')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedField === 'fb_dataset' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={config.facebook.datasetId}
                    onChange={(e) => handleFieldChange('facebook', 'datasetId', e.target.value)}
                    placeholder="e.g. DS-9011832"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Access Token */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      System User Access Token
                    </label>
                    <button 
                      onClick={() => toggleFieldVisibility('fb_access')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      {visibleFields['fb_access'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {visibleFields['fb_access'] ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <input 
                    type={visibleFields['fb_access'] ? 'text' : 'password'}
                    value={config.facebook.accessToken}
                    onChange={(e) => handleFieldChange('facebook', 'accessToken', e.target.value)}
                    placeholder="e.g. EAAB..."
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Business Account ID */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                    Meta Business Account ID
                  </label>
                  <input 
                    type="text"
                    value={config.facebook.businessAccountId}
                    onChange={(e) => handleFieldChange('facebook', 'businessAccountId', e.target.value)}
                    placeholder="e.g. BA-10029312"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>
              </div>

              {/* Action Handlers Inside Section */}
              <div className="flex gap-4 pt-3 flex-wrap">
                <button 
                  type="button"
                  onClick={handleVerifyConnection}
                  disabled={verifying}
                  className="flex-1 min-w-[140px] h-11 bg-black text-white hover:bg-zinc-800 border border-black font-extrabold text-[10px] tracking-widest uppercase rounded-none px-4 transition-all shadow-[2px_2px_0px_#000]"
                >
                  Connect Facebook
                </button>
                <button 
                  type="button"
                  onClick={handleVerifyConnection}
                  disabled={verifying}
                  className="flex-1 min-w-[140px] h-11 bg-white hover:bg-gray-50 text-black border border-black font-extrabold text-[10px] tracking-widest uppercase rounded-none px-4 transition-all shadow-[2px_2px_0px_#000]"
                >
                  Verify Pixel
                </button>
              </div>
            </div>

            {/* Event Tracking Toggles Card */}
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Section 2 — Event Tracking Scope</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Select events to transmit over API and pixel browser sessions.
                </p>
              </div>
              <hr className="border-t border-black"></hr>

              <div className="space-y-4">
                {[
                  { key: 'pageView', label: 'Page View (Standard)', desc: 'Fires on initial visitor load across any page.' },
                  { key: 'viewContent', label: 'View Content (E-Commerce)', desc: 'Fires when user lands on product description pages.' },
                  { key: 'addToCart', label: 'Add To Cart', desc: 'Fires when customer adds products to cart.' },
                  { key: 'initiateCheckout', label: 'Initiate Checkout', desc: 'Fires immediately upon entering secure checkout form.' },
                  { key: 'purchase', label: 'Purchase (Conversions)', desc: 'Critical conversion telemetry sent on invoice load.' },
                  { key: 'lead', label: 'Lead Trigger', desc: 'Triggers on newsletters or pre-bookings.' },
                  { key: 'completeRegistration', label: 'Complete Registration', desc: 'Fires on successful new account registration.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-zinc-200 bg-zinc-50 rounded-none gap-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[1px] text-black">
                        {item.label}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
                        {item.desc}
                      </p>
                    </div>

                    {/* Minimalist Switch: All sharp corners, Black Active, Smooth Translation */}
                    <button 
                      type="button"
                      onClick={() => handleToggleEvent('facebook', item.key)}
                      className={`w-12 h-6 border-2 border-black flex items-center p-0.5 transition-colors duration-200 focus:outline-none rounded-none ${
                        (config.facebook.events as any)[item.key] ? 'bg-black' : 'bg-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 border border-black transition-transform duration-200 rounded-none ${
                        (config.facebook.events as any)[item.key] ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-neutral-300'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Highlights & Advanced Settings */}
          <div className="lg:col-span-4 space-y-8">
            {/* Status Panel */}
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-black">CAPI Infrastructure</h3>
              <hr className="border-t border-black"></hr>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Status:</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-wider border border-black ${
                    config.facebook.status === 'CONNECTED' ? 'bg-[#E8F5E9] text-emerald-800' : 'bg-[#FFEBEE] text-red-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-none border border-black ${config.facebook.status === 'CONNECTED' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                    {config.facebook.status}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Match Quality:</span>
                  <span className="font-extrabold text-black uppercase">{config.facebook.eventMatchQuality}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">API Version:</span>
                  <span className="font-extrabold text-black font-mono">v19.0 (Latest)</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Last Sync:</span>
                  <span className="font-bold text-gray-500 text-[11px] font-mono">{config.facebook.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Advanced Settings Card */}
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-black">Facebook Advanced</h3>
              <hr className="border-t border-black"></hr>

              <div className="space-y-4">
                {/* Domain Verification */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                    Domain Verification ID
                  </label>
                  <input 
                    type="text"
                    value={config.facebook.domainVerification}
                    onChange={(e) => handleFieldChange('facebook', 'domainVerification', e.target.value)}
                    placeholder="Verification Token"
                    className="h-[40px] bg-white border border-black rounded-none px-3 font-semibold text-xs tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Event Match Quality Info */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-black block">
                    Telemetry Quality Gauge
                  </label>
                  <input 
                    type="text"
                    value={config.facebook.eventMatchQuality}
                    onChange={(e) => handleFieldChange('facebook', 'eventMatchQuality', e.target.value)}
                    className="h-[40px] bg-white border border-black rounded-none px-3 font-semibold text-xs tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Server-Side Tracking Toggle */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black block">Server side (CAPI)</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Proxy and clean signals</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...config,
                        facebook: { ...config.facebook, serverSideTracking: !config.facebook.serverSideTracking }
                      };
                      setConfig(updated);
                      saveToLocalStorage(updated);
                    }}
                    className={`w-12 h-6 border-2 border-black flex items-center p-0.5 transition-colors duration-200 focus:outline-none rounded-none ${
                      config.facebook.serverSideTracking ? 'bg-black' : 'bg-white'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 border border-black transition-transform duration-200 rounded-none ${
                      config.facebook.serverSideTracking ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-neutral-300'
                    }`} />
                  </button>
                </div>

                {/* Auto Event Detection */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black block">Browser Auto Events</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">AI telemetry parsing</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = {
                        ...config,
                        facebook: { ...config.facebook, autoEventDetection: !config.facebook.autoEventDetection }
                      };
                      setConfig(updated);
                      saveToLocalStorage(updated);
                    }}
                    className={`w-12 h-6 border-2 border-black flex items-center p-0.5 transition-colors duration-200 focus:outline-none rounded-none ${
                      config.facebook.autoEventDetection ? 'bg-black' : 'bg-white'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 border border-black transition-transform duration-200 rounded-none ${
                      config.facebook.autoEventDetection ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-neutral-300'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'tiktok' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TikTok Main Fields */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black">TikTok Connection Setup</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Configure the TikTok Pixel ID and Access Token for marketing synchronization.
                </p>
              </div>
              <hr className="border-t border-black"></hr>

              <div className="space-y-5">
                {/* TikTok Pixel ID */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      TikTok Pixel ID
                    </label>
                    <button 
                      onClick={() => handleCopyToClipboard(config.tiktok.pixelId, 'tt_pixel')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedField === 'tt_pixel' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={config.tiktok.pixelId}
                    onChange={(e) => handleFieldChange('tiktok', 'pixelId', e.target.value)}
                    placeholder="e.g. TT-PXL-900381"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Events API Token */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Events API Token (Server Side)
                    </label>
                    <button 
                      onClick={() => toggleFieldVisibility('tt_api_tok')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      {visibleFields['tt_api_tok'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {visibleFields['tt_api_tok'] ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <input 
                    type={visibleFields['tt_api_tok'] ? 'text' : 'password'}
                    value={config.tiktok.eventsApiToken}
                    onChange={(e) => handleFieldChange('tiktok', 'eventsApiToken', e.target.value)}
                    placeholder="e.g. tt_api_token_..."
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Advertiser ID */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      TikTok Advertiser ID
                    </label>
                    <button 
                      onClick={() => handleCopyToClipboard(config.tiktok.advertiserId, 'tt_advertiser')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedField === 'tt_advertiser' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={config.tiktok.advertiserId}
                    onChange={(e) => handleFieldChange('tiktok', 'advertiserId', e.target.value)}
                    placeholder="e.g. ADV-771289"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Business Center ID */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                    TikTok Business Center ID
                  </label>
                  <input 
                    type="text"
                    value={config.tiktok.businessCenterId}
                    onChange={(e) => handleFieldChange('tiktok', 'businessCenterId', e.target.value)}
                    placeholder="e.g. BC-11203819"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Access Token */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Secure Access Token
                    </label>
                    <button 
                      onClick={() => toggleFieldVisibility('tt_access')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      {visibleFields['tt_access'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {visibleFields['tt_access'] ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                  <input 
                    type={visibleFields['tt_access'] ? 'text' : 'password'}
                    value={config.tiktok.accessToken}
                    onChange={(e) => handleFieldChange('tiktok', 'accessToken', e.target.value)}
                    placeholder="e.g. tt_access_..."
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-3 flex-wrap">
                <button 
                  type="button"
                  onClick={handleVerifyConnection}
                  disabled={verifying}
                  className="flex-1 min-w-[140px] h-11 bg-black text-white hover:bg-zinc-800 border border-black font-extrabold text-[10px] tracking-widest uppercase rounded-none px-4 transition-all shadow-[2px_2px_0px_#000]"
                >
                  Connect TikTok
                </button>
                <button 
                  type="button"
                  onClick={handleVerifyConnection}
                  disabled={verifying}
                  className="flex-1 min-w-[140px] h-11 bg-white hover:bg-gray-50 text-black border border-black font-extrabold text-[10px] tracking-widest uppercase rounded-none px-4 transition-all shadow-[2px_2px_0px_#000]"
                >
                  Verify Connection
                </button>
              </div>
            </div>

            {/* Tracking Events Area */}
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Section 2 — TikTok Action Maps</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Enable specific event filters for target optimization matching.
                </p>
              </div>
              <hr className="border-t border-black"></hr>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'viewContent', label: 'View Content', desc: 'Syncs dynamic catalog lists' },
                  { key: 'addToCart', label: 'Add To Cart', desc: 'Saves pixel logs on hover carts' },
                  { key: 'checkout', label: 'Checkout', desc: 'Maps the precise steps to purchase' },
                  { key: 'purchase', label: 'Purchase Tracking', desc: 'Returns direct ROAS feedback values' },
                  { key: 'completePayment', label: 'Complete Payment', desc: 'Extra gate confirmation event' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-zinc-200 bg-zinc-50 rounded-none">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[1px] text-black">
                        {item.label}
                      </h4>
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
                        {item.desc}
                      </p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleToggleEvent('tiktok', item.key)}
                      className={`w-12 h-6 border-2 border-black flex items-center p-0.5 transition-colors duration-200 focus:outline-none rounded-none ${
                        (config.tiktok.events as any)[item.key] ? 'bg-black' : 'bg-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 border border-black transition-transform duration-200 rounded-none ${
                        (config.tiktok.events as any)[item.key] ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-neutral-300'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TikTok Right Bar Metrics */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-black">TikTok Connection Status</h3>
              <hr className="border-t border-black"></hr>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Status:</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-wider border border-black ${
                    config.tiktok.status === 'CONNECTED' ? 'bg-[#E8F5E9] text-emerald-800' : 'bg-[#FFEBEE] text-red-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-none border border-black ${config.tiktok.status === 'CONNECTED' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                    {config.tiktok.status}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">API Health:</span>
                  <span className="font-extrabold text-black uppercase">{config.tiktok.apiHealth}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Last Sync Time:</span>
                  <span className="font-semibold text-gray-500 text-[11px] font-mono">{config.tiktok.lastSyncTime || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Box - Premium Terminal Look */}
            <div className="p-6 bg-black text-lime-400 border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-3 font-mono">
              <div className="flex justify-between items-center text-zinc-400 text-[10px]">
                <span className="uppercase tracking-widest">Diagnostic Console</span>
                <span className="w-2 h-2 bg-lime-400 animate-pulse"></span>
              </div>
              <hr className="border-t border-zinc-800"></hr>
              <div className="text-[11px] leading-relaxed space-y-1">
                <p>&gt; sys_verify --tiktok</p>
                <p>&gt; loading credential validations...</p>
                <p className="text-white">&gt; PIXEL_OK: ID {config.tiktok.pixelId}</p>
                <p className="text-lime-500">&gt; SDK: v2.3.1 active and listening</p>
                <p className="text-[#00C2FF]">&gt; connection status stable (82ms)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {type === 'google' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Google Analytics & Tag Manager inputs */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Section 1 — Analytics Core Setup</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Input Google Tag Manager Container IDs and measurement credentials.
                </p>
              </div>
              <hr className="border-t border-black"></hr>

              <div className="space-y-5">
                {/* Google Analytics ID */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Google Analytics Measurement ID (GA4)
                    </label>
                    <button 
                      onClick={() => handleCopyToClipboard(config.google.measurementId, 'ga_meas')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedField === 'ga_meas' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={config.google.measurementId}
                    onChange={(e) => handleFieldChange('google', 'measurementId', e.target.value)}
                    placeholder="e.g. G-H27XB90"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* GTM container ID */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                      Google Tag Manager Container ID
                    </label>
                    <button 
                      onClick={() => handleCopyToClipboard(config.google.gtmId, 'ga_gtm')}
                      className="text-[10px] font-bold text-zinc-500 hover:text-black uppercase tracking-wider flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedField === 'ga_gtm' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={config.google.gtmId}
                    onChange={(e) => handleFieldChange('google', 'gtmId', e.target.value)}
                    placeholder="e.g. GTM-N92B"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Google Ads Conversion ID */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                    Google Ads Conversion ID
                  </label>
                  <input 
                    type="text"
                    value={config.google.conversionId}
                    onChange={(e) => handleFieldChange('google', 'conversionId', e.target.value)}
                    placeholder="e.g. AW-110283918-X"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Google Ads Label */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                    Google Ads Conversion Label
                  </label>
                  <input 
                    type="text"
                    value={config.google.conversionLabel}
                    onChange={(e) => handleFieldChange('google', 'conversionLabel', e.target.value)}
                    placeholder="e.g. tracking_gads_conv"
                    className="h-[50px] bg-white border border-black rounded-none px-4 font-bold text-sm tracking-wide focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400 text-black w-full"
                  />
                </div>

                {/* Service Account JSON Upload Option */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                    Google Service Account JSON Key (Upload API Authorization)
                  </label>
                  
                  {/* Upload Drop Zone: 100% Sharp corners, White background, black border */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-none p-6 text-center transition-all bg-white flex flex-col items-center justify-center gap-3 cursor-pointer ${
                      isDragging ? 'border-[#00C2FF] bg-[#00C2FF]/5' : 'border-zinc-300 hover:border-black'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="json-file-input" 
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden" 
                    />
                    
                    {uploadedFile || config.google.serviceAccountJsonName ? (
                      <div className="space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-black" />
                        <p className="text-xs font-black uppercase text-black">
                          {uploadedFile || config.google.serviceAccountJsonName}
                        </p>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearUploadedFile();
                          }}
                          className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-widest block mx-auto mt-2"
                        >
                          Remove Key
                        </button>
                      </div>
                    ) : (
                      <label htmlFor="json-file-input" className="cursor-pointer space-y-2 w-full block">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 hover:text-black transition-colors" />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Drag and Drop Service Account JSON or <span className="text-black underline">click to browse</span>
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          JSON format key required for backend conversions API
                        </p>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Google Tracking Scope Options */}
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-black">Section 2 — Analytics Rules Scope</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  Adjust custom tracking layers loaded into GA4 tags dynamically.
                </p>
              </div>
              <hr className="border-t border-black"></hr>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'pageTracking', label: 'Page Tracking', desc: 'Sync view frequencies' },
                  { key: 'ecommerceTracking', label: 'Ecommerce Tracking (GA4)', desc: 'Cart entries, checkouts, removals' },
                  { key: 'purchaseTracking', label: 'Purchase Tracking', desc: 'Transmits currency data and invoice values' },
                  { key: 'scrollTracking', label: 'Scroll Tracking Depth', desc: 'Verifies visitor layout consumption' },
                  { key: 'buttonClickTracking', label: 'Smart Button Tracking', desc: 'Saves clicks on call-to-actions' },
                  { key: 'conversionTracking', label: 'Conversion Tracking ID', desc: 'Fires tag triggers immediately' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border border-zinc-200 bg-zinc-50 rounded-none">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-[1px] text-black">
                        {item.label}
                      </h4>
                      <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
                        {item.desc}
                      </p>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleToggleEvent('google', item.key)}
                      className={`w-12 h-6 border-2 border-black flex items-center p-0.5 transition-colors duration-200 focus:outline-none rounded-none ${
                        (config.google.events as any)[item.key] ? 'bg-black' : 'bg-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 border border-black transition-transform duration-200 rounded-none ${
                        (config.google.events as any)[item.key] ? 'translate-x-[22px] bg-white' : 'translate-x-0 bg-neutral-300'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Google Analytics Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-black">GA4 Engine Monitor</h3>
              <hr className="border-t border-black"></hr>

              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Status:</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 font-black uppercase text-[10px] tracking-wider border border-black ${
                    config.google.status === 'CONNECTED' ? 'bg-[#E8F5E9] text-emerald-800' : 'bg-[#FFEBEE] text-red-800'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-none border border-black ${config.google.status === 'CONNECTED' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                    {config.google.status}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Protocol version:</span>
                  <span className="font-extrabold text-black font-mono">Measurement v2</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Service Key Auth:</span>
                  <span className={`font-black uppercase text-[10px] ${config.google.serviceAccountJsonName ? 'text-black' : 'text-zinc-400'}`}>
                    {config.google.serviceAccountJsonName ? 'AUTHORIZED' : 'MISSING'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 uppercase font-bold text-[10px] tracking-wider">Last Published:</span>
                  <span className="font-bold text-zinc-500 font-mono text-[11px]">{config.google.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Google Integrations Quick Info */}
            <div className="p-6 bg-white border border-black shadow-[3px_3px_0px_#000] rounded-none space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-black">Tracking Checklist</h3>
              <hr className="border-t border-black"></hr>
              <ul className="space-y-3 text-xs font-bold text-black uppercase tracking-wider">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black"></span>
                  Multi-account measurement enabled
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black"></span>
                  GTM direct async payload preloading
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black"></span>
                  Standard JSON key decrypt ready
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* High Fidelity Verification Toast & Live Handshake Progress */}
      <AnimatePresence>
        {showProgressToast && (
          <motion.div
            initial={{ opacity: 0, x: 200, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 200 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white border-2 border-black rounded-none p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-black font-sans"
          >
            <div className="flex items-start justify-between mb-3 border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 border border-black ${verifying ? 'bg-amber-400 animate-pulse' : handshakeSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                <span className="text-xs font-black uppercase tracking-widest text-black">
                  {activeHandshakeType?.toUpperCase()} HANDSHAKE SIGNAL
                </span>
              </div>
              <button 
                onClick={() => setShowProgressToast(false)}
                className="text-black hover:bg-neutral-100 p-0.5 border border-transparent hover:border-black rounded-none transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {verifying ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-neutral-500 leading-none">
                  <span>Simulating Handshake...</span>
                  <span className="font-mono">{handshakeProgress}%</span>
                </div>
                
                {/* Simulated Handshake Log Line */}
                <div className="bg-zinc-50 border border-black p-2 rounded-none min-h-[44px] flex items-center">
                  <p className="text-[10px] font-bold font-mono text-zinc-700 leading-tight uppercase tracking-wide">
                    &gt; {handshakeStep}
                  </p>
                </div>
                
                {/* Sharp Corner Progress Bar */}
                <div className="w-full h-3 bg-zinc-100 border border-black rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-150 rounded-none"
                    style={{ width: `${handshakeProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {handshakeSuccess ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle className="w-5 h-5 text-emerald-600 animate-bounce" />
                      <h4 className="font-extrabold uppercase text-xs tracking-wider">Verification Complete</h4>
                    </div>
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                      Successfully established a clean telemetry link with {activeHandshakeType === 'facebook' ? 'Meta Graph' : activeHandshakeType === 'tiktok' ? 'TikTok ad-exchange' : 'Google GA4'} server!
                    </p>
                    
                    {/* Metadata Table */}
                    <div className="p-2 border border-black bg-zinc-50 rounded-none font-mono text-[9px] text-zinc-600 space-y-1">
                      <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                        <span className="font-bold text-black uppercase">LINK STATUS:</span>
                        <span className="text-emerald-600 font-extrabold uppercase">OK (HTTP 200)</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200 pb-0.5">
                        <span className="font-bold text-black uppercase">SIGNAL SPEED:</span>
                        <span className="font-extrabold">34ms (UTC)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-black uppercase">SIGNATURE TYPE:</span>
                        <span className="font-extrabold">ECDSA-SHA256</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-red-700">
                      <ShieldAlert className="w-5 h-5 text-red-600" />
                      <h4 className="font-extrabold uppercase text-xs tracking-wider">Verification Failed</h4>
                    </div>
                    <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wide leading-relaxed">
                      API handshake returned a <span className="font-mono bg-red-50 px-1 border border-red-300 text-red-700 font-black">401 Unauthorized</span> response header.
                    </p>
                    <div className="p-2 border border-black bg-red-50 rounded-none font-mono text-[9px] text-red-700 space-y-1">
                      <p className="font-bold uppercase">&gt; EXCEPTION DETECTED:</p>
                      <p className="uppercase">Invalid token formatting or dataset authentication failure. Check system user keys.</p>
                    </div>
                  </div>
                )}
                
                {/* Secondary verification trigger inside toast */}
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => {
                      setShowProgressToast(false);
                    }}
                    className="h-8 bg-black hover:bg-zinc-800 text-white font-extrabold text-[10px] tracking-wider uppercase rounded-none px-4 shadow-[2px_2px_0px_#000] border border-black active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    Close Log
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
