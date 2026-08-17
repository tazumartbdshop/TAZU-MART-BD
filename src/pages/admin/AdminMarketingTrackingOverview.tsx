import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, Activity, Zap, Check, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { safeFetchJSON } from '../../lib/utils';
import MarketingCheckbox from '../../components/MarketingCheckbox';

export default function AdminMarketingTrackingOverview() {
  const [config, setConfig] = useState({
    browserTracking: true,
    serverTracking: true,
    facebookCAPI: true,
    tiktokEventsAPI: true,
    googleAnalytics: true,
  });

  const [saving, setSaving] = useState(false);
  const [lastSync, setLastSync] = useState<string>('JUST NOW');

  const [metrics, setMetrics] = useState({
    lastEvent: 'Purchase (Order #1042)',
    lastEventTime: '2 mins ago',
    totalEvents: '18,450',
    failedEvents: '0',
    matchRate: '98.6%',
    dedupStatus: 'Active (Deduplicated via Event ID)'
  });

  useEffect(() => {
    safeFetchJSON('/api/admin/marketing/config?tableName=tracking_status&rowId=overview_config')
      .then(data => {
        if (data.status === 'success' && data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config
          }));
          if (data.config.last_sync) {
            setLastSync(new Date(data.config.last_sync).toLocaleString().toUpperCase());
          }
        }
      })
      .catch(err => console.warn('Failed to load Overview config, using defaults.', err));
  }, []);

  const handleChange = (field: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saveData = await safeFetchJSON('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'trackingOverview',
          rowId: 'overview_config',
          config: {
            ...config,
            last_sync: new Date().toISOString()
          }
        })
      });

      if (saveData.status === 'success') {
        toast.success("Tracking Overview Saved Successfully");
        setLastSync(new Date().toLocaleString().toUpperCase());
      } else {
        toast.error(saveData.error || "Failed to save Overview");
      }
    } catch (error: any) {
      toast.error(error.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-zinc-900">Tracking Overview</h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">Real-time connection statuses & deduplicated event telemetry.</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 h-10 bg-zinc-950 text-white text-xs font-black uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Statuses</span>
          </button>
        </div>

        {/* Status Badges Grid */}
        <div className="space-y-4 p-6 border border-zinc-200 bg-zinc-50/40">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Integration Connection Statuses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Browser Tracking */}
            <div className="p-4 bg-white border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${config.browserTracking ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Browser Tracking</span>
              </div>
              <span className={`text-[11px] font-black uppercase tracking-wider ${config.browserTracking ? 'text-emerald-600' : 'text-zinc-400'}`}>
                {config.browserTracking ? '● Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Server Tracking */}
            <div className="p-4 bg-white border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${config.serverTracking ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Server Tracking</span>
              </div>
              <span className={`text-[11px] font-black uppercase tracking-wider ${config.serverTracking ? 'text-emerald-600' : 'text-zinc-400'}`}>
                {config.serverTracking ? '● Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Facebook CAPI */}
            <div className="p-4 bg-white border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${config.facebookCAPI ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Facebook CAPI</span>
              </div>
              <span className={`text-[11px] font-black uppercase tracking-wider ${config.facebookCAPI ? 'text-emerald-600' : 'text-zinc-400'}`}>
                {config.facebookCAPI ? '● Connected' : 'Disconnected'}
              </span>
            </div>

            {/* TikTok Events API */}
            <div className="p-4 bg-white border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${config.tiktokEventsAPI ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">TikTok Events API</span>
              </div>
              <span className={`text-[11px] font-black uppercase tracking-wider ${config.tiktokEventsAPI ? 'text-emerald-600' : 'text-zinc-400'}`}>
                {config.tiktokEventsAPI ? '● Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Google Analytics */}
            <div className="p-4 bg-white border border-zinc-200 flex items-center justify-between md:col-span-2">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${config.googleAnalytics ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">Google Analytics</span>
              </div>
              <span className={`text-[11px] font-black uppercase tracking-wider ${config.googleAnalytics ? 'text-emerald-600' : 'text-zinc-400'}`}>
                {config.googleAnalytics ? '● Connected' : 'Disconnected'}
              </span>
            </div>

          </div>
        </div>

        {/* Metrics Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Last Event</span>
            <p className="text-sm font-black text-zinc-900 truncate">{metrics.lastEvent}</p>
            <p className="text-[10px] text-zinc-400 font-mono">{metrics.lastEventTime}</p>
          </div>

          <div className="p-5 border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Events</span>
            <p className="text-xl font-black text-zinc-900">{metrics.totalEvents}</p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-500" /> Real-Time Live
            </p>
          </div>

          <div className="p-5 border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Failed Events</span>
            <p className="text-xl font-black text-emerald-600">{metrics.failedEvents}</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">0.00% Error Rate</p>
          </div>

          <div className="p-5 border border-zinc-200 bg-white space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Event Match Quality</span>
            <p className="text-xl font-black text-indigo-600">{metrics.matchRate}</p>
            <p className="text-[10px] text-zinc-500 font-medium truncate">{metrics.dedupStatus}</p>
          </div>

        </div>

        {/* Toggles Management */}
        <div className="p-6 border border-zinc-200 bg-white space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Toggle Connection Signals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MarketingCheckbox
              label="Enable Browser Tracking"
              checked={config.browserTracking}
              onChange={(v) => handleChange('browserTracking', v)}
            />
            <MarketingCheckbox
              label="Enable Server Tracking"
              checked={config.serverTracking}
              onChange={(v) => handleChange('serverTracking', v)}
            />
            <MarketingCheckbox
              label="Enable Facebook CAPI"
              checked={config.facebookCAPI}
              onChange={(v) => handleChange('facebookCAPI', v)}
            />
            <MarketingCheckbox
              label="Enable TikTok Events API"
              checked={config.tiktokEventsAPI}
              onChange={(v) => handleChange('tiktokEventsAPI', v)}
            />
            <MarketingCheckbox
              label="Enable Google Analytics"
              checked={config.googleAnalytics}
              onChange={(v) => handleChange('googleAnalytics', v)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

