import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, CheckCircle2, XCircle, Database } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MarketingCheckbox from '../../components/MarketingCheckbox';

export default function AdminMarketingTrackingOverview() {
  const [config, setConfig] = useState({
    facebook: { active: false },
    tiktok: { active: false },
    google: { active: false },
    serverSide: { active: false }
  });

  const [saving, setSaving] = useState(false);
  const [lastSync, setLastSync] = useState<string>('NEVER');
  
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [schemaState, setSchemaState] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/marketing/config?tableName=tracking_status&rowId=overview_config')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && data.config) {
          setConfig({
            facebook: { active: data.config.facebook_connected || false },
            tiktok: { active: data.config.tiktok_connected || false },
            google: { active: data.config.google_connected || false },
            serverSide: { active: data.config.server_connected || false }
          });
          if (data.config.last_sync) {
             setLastSync(new Date(data.config.last_sync).toLocaleString().toUpperCase());
          }
        }
      })
      .catch(err => console.warn('Failed to load Overview config, using defaults.', err));
  }, []);

  const handleChange = (section: keyof typeof config, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: { active: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/marketing/schema-check?tableName=tracking_status');
      const data = await res.json();
      if (data.status === 'success') {
        const isMissing = !data.schemaState.tracking_status?.exists || data.schemaState.tracking_status?.missingColumns.length > 0;
        if (isMissing) {
          setSchemaState(data.schemaState);
          setShowSchemaModal(true);
          setSaving(false);
          return;
        }
      }

      const response = await fetch('/api/admin/marketing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'trackingOverview',
          rowId: 'overview_config',
          config: {
            facebook_connected: config.facebook.active,
            tiktok_connected: config.tiktok.active,
            google_connected: config.google.active,
            server_connected: config.serverSide.active,
            last_sync: new Date().toISOString()
          }
        })
      });
      const saveData = await response.json();

      if (response.ok && saveData.status === 'success') {
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
          <h1 className="text-xl font-bold uppercase tracking-tighter">Tracking Overview</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 h-10 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Overview</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div className="space-y-6 p-6 border border-zinc-100 bg-zinc-50/30">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Channel Status</h2>
            <div className="space-y-6">
              <MarketingCheckbox
                label="Facebook Status"
                checked={config.facebook.active}
                onChange={(v) => handleChange('facebook', v)}
              />
              <MarketingCheckbox
                label="TikTok Status"
                checked={config.tiktok.active}
                onChange={(v) => handleChange('tiktok', v)}
              />
              <MarketingCheckbox
                label="Google Status"
                checked={config.google.active}
                onChange={(v) => handleChange('google', v)}
              />
              <MarketingCheckbox
                label="Server Side Status"
                checked={config.serverSide.active}
                onChange={(v) => handleChange('serverSide', v)}
              />
            </div>
          </div>

          <div className="space-y-6 p-6 border border-zinc-100 bg-zinc-50/30">
             <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">System Information</h2>
             <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Last Sync Timestamp</p>
                 <p className="text-sm font-mono text-zinc-900 bg-white p-3 border border-zinc-200">{lastSync}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">System Health</p>
                 <div className="flex items-center gap-2 text-emerald-600">
                   <CheckCircle2 className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase tracking-wider">All Systems Operational</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>

      {showSchemaModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-8 max-w-md w-full border border-zinc-200 shadow-2xl">
            <h2 className="text-lg font-bold uppercase tracking-tight mb-4">Database Schema Required</h2>
            <p className="text-sm text-zinc-600 mb-6">
              The tracking status table or required columns are missing in your Supabase database.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowSchemaModal(false)}
                className="px-6 h-10 border border-zinc-200 text-sm font-bold uppercase tracking-widest hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
