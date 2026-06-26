import React, { useState, useEffect } from 'react';
import { 
  Zap, Save, Palette, Settings, Video, CheckCircle, 
  Plus, Trash2, Sliders, Activity, Monitor, Smartphone,
  ExternalLink, Play, Search, Gamepad, RefreshCw, Trophy,
  Grid, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface SnakeTheme {
  id: string;
  name: string;
  head: string;
  tail: string;
  primary: string;
  secondary: string;
  glow: string;
  pattern: string;
}

interface GameConfig {
  settings: {
    gameName: string;
    tagline: string;
    turboSpeed: number;
    snakeAcceleration: number;
    spawnRate: number;
    reviveCount: number;
    soundEnabled: boolean;
    hapticEnabled: boolean;
    activeThemeIds: string[];
  };
  themes: SnakeTheme[];
  reviveAd: {
    enableRewardAd: boolean;
    enableVideoAd: boolean;
    enableImageAd: boolean;
    videoUrl: string;
    imageUrl: string;
    title: string;
    duration: number;
    skipEnabled: boolean;
    skipAfter: number;
    continueFromPreviousState: boolean;
  };
}

const PATTERNS = [
  "Solid", "Stripes", "Dots", "Neon Tube", 
  "Electric", "Pulse", "Gradient", 
  "Metallic", "Scale Texture", "RGB Animation"
];

export default function AdminGameControl() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'themes' | 'ads'>('settings');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/game-config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig: GameConfig) => {
    setSaving(true);
    try {
      await fetch('/api/game-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof GameConfig['settings'], value: any) => {
    if (!config) return;
    const newConfig = {
      ...config,
      settings: { ...config.settings, [key]: value }
    };
    saveConfig(newConfig);
  };

  const toggleThemeActive = (themeId: string) => {
    if (!config) return;
    let newActiveIds = [...config.settings.activeThemeIds];
    if (newActiveIds.includes(themeId)) {
      newActiveIds = newActiveIds.filter(id => id !== themeId);
    } else {
      if (newActiveIds.length >= 6) {
        newActiveIds.shift(); // Remove oldest to keep 6
      }
      newActiveIds.push(themeId);
    }
    handleSettingChange('activeThemeIds', newActiveIds);
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#F5F7FA]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw className="w-8 h-8 text-[#00C2FF]" />
      </motion.div>
    </div>
  );

  if (!config) return <div className="p-8 text-gray-500">Error loading configuration.</div>;

  return (
    <div className="flex-1 bg-[#F5F7FA] text-gray-900 min-h-screen pb-20 relative">
      {/* Header */}
      <header className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-6 lg:mb-8 px-4 sm:px-6 lg:px-8 py-5 border-b border-gray-200 bg-white shadow-sm relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-gray-900">
              <Gamepad className="w-6 h-6 text-[#00C2FF]" />
              Game Control Center
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Live Management System • Tazu Arena</p>
          </div>
          
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'settings' ? "bg-[#00C2FF] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Settings
            </button>
            <button 
              onClick={() => setActiveTab('themes')}
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'themes' ? "bg-[#00C2FF] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Skins & Themes
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={cn(
                "px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === 'ads' ? "bg-[#00C2FF] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
              )}
            >
              Revive Ads
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              {/* General Config */}
              <div className="pb-8 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Monitor className="w-5 h-5 text-gray-400" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">Global Branding</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Game Name</label>
                     <input 
                       type="text" 
                       value={config.settings.gameName}
                       onChange={(e) => handleSettingChange('gameName', e.target.value)}
                       className="w-full h-12 bg-white border-b-2 border-gray-200 px-0 font-bold focus:border-[#00C2FF] outline-none transition-colors text-gray-900"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Tagline</label>
                     <input 
                       type="text" 
                       value={config.settings.tagline}
                       onChange={(e) => handleSettingChange('tagline', e.target.value)}
                       className="w-full h-12 bg-white border-b-2 border-gray-200 px-0 font-bold focus:border-[#00C2FF] outline-none transition-colors text-gray-900"
                     />
                  </div>
                </div>
              </div>

              {/* Gameplay Physics */}
              <div className="pb-8 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">Gameplay Control</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Turbo Speed', key: 'turboSpeed', min: 1, max: 3, step: 0.1 },
                    { label: 'Acceleration', key: 'snakeAcceleration', min: 0.01, max: 0.2, step: 0.01 },
                    { label: 'Food Spawn Rate', key: 'spawnRate', min: 0.005, max: 0.1, step: 0.005 },
                    { label: 'Max Revives', key: 'reviveCount', min: 1, max: 5, step: 1 }
                  ].map((slider) => (
                    <div key={slider.key} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[2px]">{slider.label}</label>
                        <span className="text-[#00C2FF] font-mono font-bold">{(config.settings as any)[slider.key]}</span>
                      </div>
                      <input 
                        type="range"
                        min={slider.min}
                        max={slider.max}
                        step={slider.step}
                        value={(config.settings as any)[slider.key]}
                        onChange={(e) => handleSettingChange(slider.key as any, parseFloat(e.target.value))}
                        className="w-full accent-[#00C2FF] h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                {[
                  { label: 'Global Sound', key: 'soundEnabled', icon: Radio },
                  { label: 'Haptic Feedback', key: 'hapticEnabled', icon: Smartphone },
                ].map((toggle) => (
                  <button 
                    key={toggle.key}
                    onClick={() => handleSettingChange(toggle.key as any, !(config.settings as any)[toggle.key])}
                    className={cn(
                      "p-4 flex items-center justify-between gap-4 transition-all rounded-lg",
                      (config.settings as any)[toggle.key] 
                        ? "bg-[#00C2FF]/5 text-[#00C2FF]" 
                        : "bg-white hover:bg-gray-50 text-gray-500"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <toggle.icon className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{toggle.label}</span>
                    </div>
                    <div className={cn(
                      "w-8 h-4 rounded-full relative transition-colors border",
                      (config.settings as any)[toggle.key] ? "bg-[#00C2FF] border-[#00C2FF]" : "bg-gray-200 border-gray-300"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all shadow-sm",
                        (config.settings as any)[toggle.key] ? "left-[18px]" : "left-[3px]"
                      )} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'themes' && (
            <motion.div 
              key="themes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Active Selection Info */}
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4 mb-6">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Active Themes System</h3>
                   <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Only 6 themes appear in-game at once</p>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                   {config.settings.activeThemeIds.map(id => {
                     const theme = config.themes.find(t => t.id === id);
                     if (!theme) return null;
                     return (
                        <div key={id} className="w-8 h-8 rounded-full border border-gray-200 p-0.5 shadow-sm bg-white" title={theme.name}>
                          <div className="w-full h-full rounded-full" style={{ background: theme.head }} />
                        </div>
                     );
                   })}
                   <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 ml-3">
                     {config.settings.activeThemeIds.length}/6 ACTIVE
                   </span>
                </div>
              </div>

              {/* Theme List */}
              <div className="space-y-0 divide-y divide-gray-100">
                {config.themes.map((theme) => {
                  const isActive = config.settings.activeThemeIds.includes(theme.id);
                  return (
                    <div 
                      key={theme.id}
                      className="flex items-center justify-between py-5 group hover:bg-white transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        {/* Snake Preview Inline */}
                        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                           <div 
                             className="w-10 h-10 rounded-full border border-gray-200/50 shadow-sm flex items-center justify-center gap-0.5"
                             style={{ background: theme.head, boxShadow: `0 0 15px ${theme.head}20` }}
                           >
                              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                           </div>
                           <div className="flex gap-1">
                             {[1, 2, 3].map(i => (
                               <div key={i} className="w-4 h-4 rounded-full border border-gray-200/30" style={{ background: theme.tail, opacity: 1 - i*0.2 }} />
                             ))}
                           </div>
                        </div>

                        <div>
                           <div className="flex items-center gap-3">
                             <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 leading-none">{theme.name}</h4>
                             {isActive && (
                               <span className="text-[8px] font-black uppercase tracking-widest text-[#00C2FF] bg-[#00C2FF]/10 px-2 py-0.5 rounded-full">
                                 ACTIVE
                               </span>
                             )}
                           </div>
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 block">{theme.pattern}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                         <button 
                           onClick={() => toggleThemeActive(theme.id)}
                           className={cn(
                             "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                             isActive 
                               ? "text-gray-400 hover:text-[#FF5A36] hover:bg-red-50" 
                               : "text-[#00C2FF] hover:bg-[#00C2FF]/10"
                           )}
                         >
                           {isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                         </button>
                         <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                            <Settings className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Theme */}
                <button className="w-full flex items-center justify-center gap-3 py-8 text-gray-400 hover:text-[#00C2FF] hover:bg-[#00C2FF]/5 transition-all border-b border-gray-100 group">
                   <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   <span className="text-xs font-black uppercase tracking-[3px]">Add New Color</span>
                </button>
              </div>
            </motion.div>
          )}           {activeTab === 'ads' && (
            <motion.div 
               key="ads"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="grid grid-cols-1 lg:grid-cols-3 gap-12"
            >
               {/* Ad Content Manager */}
               <div className="lg:col-span-2 space-y-8">
                  <div className="pb-8 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <Video className="w-5 h-5 text-[#00C2FF]" />
                      <h3 className="text-xl font-black uppercase tracking-widest text-gray-900">Revive Ad Manager</h3>
                    </div>

                    <div className="space-y-6">
                       {/* Row 1: Main Toggles */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                             <div>
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Enable Reward Ad</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Revive system active status</p>
                             </div>
                             <button 
                                onClick={() => setConfig({ ...config, reviveAd: { ...config.reviveAd, enableRewardAd: !config.reviveAd.enableRewardAd }})}
                                className={cn(
                                   "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                   config.reviveAd.enableRewardAd ? "bg-[#00C2FF]/10 text-[#00C2FF]" : "bg-gray-200 text-gray-500"
                                )}
                             >
                                {config.reviveAd.enableRewardAd ? "ACTIVE" : "INACTIVE"}
                             </button>
                          </div>

                          <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                             <div>
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Continue From Previous State</h4>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Restore exact length/score on revive</p>
                             </div>
                             <button 
                                onClick={() => setConfig({ ...config, reviveAd: { ...config.reviveAd, continueFromPreviousState: !config.reviveAd.continueFromPreviousState }})}
                                className={cn(
                                   "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                   config.reviveAd.continueFromPreviousState ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-200 text-gray-500"
                                )}
                             >
                                {config.reviveAd.continueFromPreviousState ? "RESTORE" : "RESET"}
                             </button>
                          </div>
                       </div>

                       {/* Row 2: Ad Format Selection */}
                       <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">Ad Format Configuration</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <button 
                                onClick={() => setConfig({ ...config, reviveAd: { ...config.reviveAd, enableVideoAd: true, enableImageAd: false }})}
                                className={cn(
                                   "p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                                   config.reviveAd.enableVideoAd ? "bg-[#00C2FF]/5 border-[#00C2FF]" : "bg-white border-transparent"
                                )}
                             >
                                <div>
                                   <span className="text-[10px] font-black uppercase tracking-wider block text-gray-900">Video Ad Format</span>
                                   <span className="text-[9px] text-gray-400 font-bold block mt-1">Show custom video URL (.mp4)</span>
                                </div>
                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", config.reviveAd.enableVideoAd ? "border-[#00C2FF]" : "border-gray-300")}>
                                   {config.reviveAd.enableVideoAd && <div className="w-2 h-2 rounded-full bg-[#00C2FF]" />}
                                </div>
                             </button>

                             <button 
                                onClick={() => setConfig({ ...config, reviveAd: { ...config.reviveAd, enableVideoAd: false, enableImageAd: true }})}
                                className={cn(
                                   "p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                                   config.reviveAd.enableImageAd ? "bg-[#00C2FF]/5 border-[#00C2FF]" : "bg-white border-transparent"
                                )}
                             >
                                <div>
                                   <span className="text-[10px] font-black uppercase tracking-wider block text-gray-900">Image Ad Format</span>
                                   <span className="text-[9px] text-gray-400 font-bold block mt-1">Show premium static graphic image</span>
                                </div>
                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", config.reviveAd.enableImageAd ? "border-[#00C2FF]" : "border-gray-300")}>
                                   {config.reviveAd.enableImageAd && <div className="w-2 h-2 rounded-full bg-[#00C2FF]" />}
                                </div>
                             </button>
                          </div>
                       </div>

                       {/* Fields based on formats */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Ad Title</label>
                                <input 
                                  type="text" 
                                  value={config.reviveAd.title}
                                  onChange={(e) => setConfig({ ...config, reviveAd: { ...config.reviveAd, title: e.target.value }})}
                                  className="w-full h-12 bg-white border-b-2 border-gray-200 px-0 font-bold outline-none text-gray-900 focus:border-[#00C2FF] transition-colors"
                                />
                             </div>

                             {config.reviveAd.enableVideoAd && (
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Video URL (MP4)</label>
                                   <input 
                                     type="text" 
                                     value={config.reviveAd.videoUrl}
                                     onChange={(e) => setConfig({ ...config, reviveAd: { ...config.reviveAd, videoUrl: e.target.value }})}
                                     className="w-full h-12 bg-white border-b-2 border-gray-200 px-0 font-bold outline-none text-gray-900 focus:border-[#00C2FF] transition-colors"
                                     placeholder="https://example.com/video.mp4"
                                   />
                                </div>
                             )}

                             {config.reviveAd.enableImageAd && (
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Image URL (JPG/PNG)</label>
                                   <input 
                                     type="text" 
                                     value={config.reviveAd.imageUrl}
                                     onChange={(e) => setConfig({ ...config, reviveAd: { ...config.reviveAd, imageUrl: e.target.value }})}
                                     className="w-full h-12 bg-white border-b-2 border-gray-200 px-0 font-bold outline-none text-gray-900 focus:border-[#00C2FF] transition-colors"
                                     placeholder="https://example.com/image.jpg"
                                   />
                                </div>
                             )}

                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Duration (s)</label>
                                   <select 
                                     value={config.reviveAd.duration}
                                     onChange={(e) => setConfig({ ...config, reviveAd: { ...config.reviveAd, duration: parseInt(e.target.value) }})}
                                     className="w-full h-12 bg-white border-b-2 border-gray-200 px-0 font-bold outline-none text-gray-900 focus:border-[#00C2FF] transition-colors"
                                   >
                                      {[5, 10, 15, 20, 30].map(sec => (
                                         <option key={sec} value={sec}>{sec} Seconds</option>
                                      ))}
                                   </select>
                                </div>

                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-[4px]">Skip After (s)</label>
                                   <input 
                                     type="number" 
                                     disabled={!config.reviveAd.skipEnabled}
                                     value={config.reviveAd.skipAfter}
                                     onChange={(e) => setConfig({ ...config, reviveAd: { ...config.reviveAd, skipAfter: Math.min(config.reviveAd.duration, parseInt(e.target.value) || 0) }})}
                                     className="w-full h-12 bg-white border-b-2 border-gray-200 px-0 font-bold outline-none text-gray-900 focus:border-[#00C2FF] transition-colors disabled:opacity-50"
                                   />
                                </div>
                             </div>

                             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                   <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Skip Button Enabled</h4>
                                   <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">Allow skipping after configured time</p>
                                </div>
                                <button 
                                   onClick={() => setConfig({ ...config, reviveAd: { ...config.reviveAd, skipEnabled: !config.reviveAd.skipEnabled }})}
                                   className={cn(
                                      "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all",
                                      config.reviveAd.skipEnabled ? "bg-[#00C2FF]/10 text-[#00C2FF]" : "bg-gray-200 text-gray-500"
                                   )}
                                 >
                                    {config.reviveAd.skipEnabled ? "ENABLED" : "DISABLED"}
                                 </button>
                             </div>
                          </div>

                          {/* Preview Box */}
                          <div className="bg-gray-100 rounded-[20px] border border-gray-200 overflow-hidden group relative shadow-inner h-[320px] flex items-center justify-center">
                             {config.reviveAd.enableVideoAd && config.reviveAd.videoUrl ? (
                                <>
                                   <video 
                                     key={config.reviveAd.videoUrl}
                                     src={config.reviveAd.videoUrl} 
                                     className="w-full h-full object-cover"
                                     autoPlay
                                     muted
                                     loop
                                   />
                                   <div className="absolute inset-0 bg-black/20" />
                                   <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white/90">
                                      Video Preview
                                   </div>
                                </>
                             ) : config.reviveAd.enableImageAd && config.reviveAd.imageUrl ? (
                                <>
                                   <img 
                                     src={config.reviveAd.imageUrl} 
                                     className="w-full h-full object-cover"
                                     alt="Ad Preview"
                                   />
                                   <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-white/90">
                                      Image Preview
                                   </div>
                                </>
                             ) : (
                                <div className="text-center p-6">
                                   <Video className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">No Media Selected</span>
                                </div>
                             )}
                             
                             <div className="absolute bottom-6 left-6 right-6">
                                <div className="flex items-center justify-between mb-2">
                                   <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-widest">{config.reviveAd.title || 'Exclusive Ad Offer'}</span>
                                   <span className="text-[10px] font-bold text-white drop-shadow-md">00:00 / 00:{config.reviveAd.duration}</span>
                                </div>
                                <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                                   <div className="w-1/3 h-full bg-[#00C2FF]" />
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-4">
                     <button 
                       onClick={() => saveConfig(config)}
                       disabled={saving}
                       className="w-[90%] md:w-[600px] mx-auto h-[52px] flex items-center justify-center gap-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[12px] font-black uppercase tracking-[3px] active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                       {saving ? (
                         <RefreshCw className="w-5 h-5 animate-spin" />
                       ) : (
                         <Save className="w-5 h-5" />
                       )}
                       {saving ? 'SAVING...' : 'PUBLISH CHANGES'}
                     </button>
                  </div>
               </div>

               {/* Ad Settings Highlights */}
               <div className="space-y-10 border-l border-gray-200 pl-8 hidden lg:block">
                  <div>
                     <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-6">Requirements</h4>
                     <ul className="space-y-4">
                        {[
                          { text: 'MP4 Preferred', check: true },
                          { text: 'Under 5MB Recommended', check: true },
                          { text: 'HD 16:9 Aspect Ratio', check: true },
                          { text: 'Silent Preload Enabled', check: true },
                        ].map((req, i) => (
                           <li key={i} className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-900">
                              <CheckCircle className="w-4 h-4 text-[#00C2FF]" /> {req.text}
                           </li>
                        ))}
                     </ul>
                  </div>
                  
                  <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-6">Analytics (24H)</h4>
                      
                      <div className="space-y-6">
                          <div>
                              <span className="text-[9px] font-bold uppercase tracking-[2px] text-gray-500 block mb-1">Impressions</span>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-gray-900">1.2k</span>
                                <span className="text-[10px] font-bold text-emerald-500">+12%</span>
                              </div>
                          </div>
                          <div>
                              <span className="text-[9px] font-bold uppercase tracking-[2px] text-gray-500 block mb-1">Estimated Earnings</span>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-gray-900">$142.50</span>
                                <span className="text-[10px] font-bold text-emerald-500">+8.4%</span>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Action Section */}
      {config && activeTab !== 'ads' && (
        <div className="w-full mt-10 pb-10 flex justify-center">
          <button 
            onClick={() => saveConfig(config)}
            disabled={saving}
            className="w-[90%] md:w-[600px] h-[52px] flex items-center justify-center gap-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[12px] font-black uppercase tracking-[3px] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'SAVING...' : 'PUBLISH CHANGES'}
          </button>
        </div>
      )}
    </div>
  );
}
