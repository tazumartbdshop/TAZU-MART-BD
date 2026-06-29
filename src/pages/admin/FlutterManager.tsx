import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Palette, 
  Link as LinkIcon, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Layout, 
  Save, 
  RefreshCw,
  Facebook,
  Instagram,
  Youtube,
  Music2,
  Trash2,
  Plus,
  ChevronRight,
  Monitor,
  Check,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlutterConfig, saveFlutterConfig, FlutterConfig } from '../../services/flutterService';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function FlutterManager() {
  const settings = useSettingsStore(state => state.settings);
  const [config, setConfig] = useState<FlutterConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'brand' | 'description' | 'social' | 'links' | 'contact' | 'design'>('brand');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const data = await getFlutterConfig();
    // Auto synchronize master store settings to Flutter configuration
    if (settings.storeLogo && data.brand.logoUrl !== settings.storeLogo) {
      data.brand.logoUrl = settings.storeLogo;
    }
    if (settings.storeName && data.brand.name !== settings.storeName) {
      data.brand.name = settings.storeName;
    }
    if (settings.contactNumber) {
      if (data.contact.phone !== settings.contactNumber) {
        data.contact.phone = settings.contactNumber;
      }
      const cleanNum = settings.contactNumber.replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanNum}`;
      if (data.socialLinks && Array.isArray(data.socialLinks)) {
        const waIdx = data.socialLinks.findIndex(l => l.platform === 'WhatsApp');
        if (waIdx !== -1 && data.socialLinks[waIdx].url !== waLink) {
          data.socialLinks[waIdx].url = waLink;
        }
      }
    }
    setConfig(data);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await saveFlutterConfig(config);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (section: keyof FlutterConfig, data: any) => {
    if (!config) return;
    setConfig({ ...config, [section]: { ...config[section], ...data } });
  };

  const updateArray = (section: 'socialLinks' | 'quickLinks', index: number, data: any) => {
    if (!config) return;
    const newArr = [...config[section]];
    newArr[index] = { ...newArr[index], ...data };
    setConfig({ ...config, [section]: newArr });
  };

  const addQuickLink = () => {
    if (!config) return;
    const newLink = { name: 'New Link', url: '/', order: config.quickLinks.length + 1 };
    setConfig({ ...config, quickLinks: [...config.quickLinks, newLink] });
  };

  const removeQuickLink = (index: number) => {
    if (!config) return;
    const newArr = config.quickLinks.filter((_, i) => i !== index);
    setConfig({ ...config, quickLinks: newArr });
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8">
      {/* Settings Form */}
      <div className="flex-1 space-y-6">
        <div className="bg-white border border-gray-100 shadow-sm rounded-none overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto hide-scrollbar">
            {[
              { id: 'brand', label: 'Brand', icon: Palette },
              { id: 'description', label: 'Description', icon: Layout },
              { id: 'social', label: 'Social Links', icon: LinkIcon },
              { id: 'links', label: 'Quick Links', icon: Grid },
              { id: 'contact', label: 'Contact', icon: Mail },
              { id: 'design', label: 'Design', icon: Monitor },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-black text-black bg-gray-50' 
                    : 'border-transparent text-gray-400 hover:text-black hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'brand' && (
                <motion.div
                  key="brand"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Brand Name</label>
                      <input 
                        type="text" 
                        value={config.brand.name} 
                        onChange={(e) => updateConfig('brand', { name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Logo URL</label>
                      <input 
                        type="text" 
                        value={config.brand.logoUrl} 
                        onChange={(e) => updateConfig('brand', { logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Brand Color</label>
                      <div className="flex gap-3">
                        <input 
                          type="color" 
                          value={config.brand.brandColor} 
                          onChange={(e) => updateConfig('brand', { brandColor: e.target.value })}
                          className="w-12 h-12 rounded-none cursor-pointer border-none p-0"
                        />
                        <input 
                          type="text" 
                          value={config.brand.brandColor} 
                          onChange={(e) => updateConfig('brand', { brandColor: e.target.value })}
                          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Footer Background</label>
                      <div className="flex gap-3">
                        <input 
                          type="color" 
                          value={config.brand.footerBgColor} 
                          onChange={(e) => updateConfig('brand', { footerBgColor: e.target.value })}
                          className="w-12 h-12 rounded-none cursor-pointer border-none p-0"
                        />
                        <input 
                          type="text" 
                          value={config.brand.footerBgColor} 
                          onChange={(e) => updateConfig('brand', { footerBgColor: e.target.value })}
                          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black font-mono"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-gray-500">Footer Content Color (Global)</label>
                      <div className="flex gap-3">
                        <input 
                          type="color" 
                          value={config.brand.footerContentColor || '#E5E5E5'} 
                          onChange={(e) => updateConfig('brand', { footerContentColor: e.target.value })}
                          className="w-12 h-12 rounded-none cursor-pointer border-none p-0"
                        />
                        <input 
                          type="text" 
                          value={config.brand.footerContentColor || '#E5E5E5'} 
                          onChange={(e) => updateConfig('brand', { footerContentColor: e.target.value })}
                          className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        Advanced Footer Typography
                        <span className="bg-black text-white text-[8px] px-1.5 py-0.5 rounded ml-2">PRO</span>
                      </h4>
                      <label className="flex items-center cursor-pointer">
                        <span className="text-[10px] font-bold mr-3 text-gray-400">Auto Contrast Detection</span>
                        <input 
                          type="checkbox" 
                          checked={config.brand.autoContrast} 
                          onChange={(e) => updateConfig('brand', { autoContrast: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black relative"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {[
                        { label: 'Heading Color', key: 'footerHeadingColor', default: '#FFFFFF' },
                        { label: 'Muted/Paragraph Color', key: 'footerMutedColor', default: '#B8B8B8' },
                        { label: 'Icon/Link Color', key: 'footerIconColor', default: '#DADADA' },
                        { label: 'Small Text Color', key: 'footerSmallTextColor', default: '#B8B8B8' },
                        { label: 'Copyright Color', key: 'footerCopyrightColor', default: '#888888' },
                      ].map((item) => (
                        <div key={item.key} className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={(config.brand as any)[item.key] || item.default} 
                              onChange={(e) => updateConfig('brand', { [item.key]: e.target.value })}
                              className="w-10 h-10 rounded-none cursor-pointer border-none p-0"
                            />
                            <input 
                              type="text" 
                              value={(config.brand as any)[item.key] || item.default} 
                              onChange={(e) => updateConfig('brand', { [item.key]: e.target.value })}
                              className="flex-1 bg-gray-50 border border-gray-100 px-3 py-2 rounded-none focus:outline-none focus:border-black font-mono text-[10px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Short Description</label>
                    <textarea 
                      value={config.description.short} 
                      onChange={(e) => updateConfig('description', { short: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Long Description</label>
                    <textarea 
                      value={config.description.long} 
                      onChange={(e) => updateConfig('description', { long: e.target.value })}
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Copyright Text</label>
                    <input 
                      type="text" 
                      value={config.description.copyright} 
                      onChange={(e) => updateConfig('description', { copyright: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-none focus:outline-none focus:border-black font-bold"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'social' && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {config.socialLinks.map((link, idx) => (
                    <div key={link.platform} className="flex items-center gap-4 bg-gray-50 p-4 border border-gray-100">
                      <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center border border-gray-200">
                        {link.platform === 'Facebook' && <Facebook className="w-5 h-5" />}
                        {link.platform === 'Instagram' && <Instagram className="w-5 h-5" />}
                        {link.platform === 'TikTok' && <Music2 className="w-5 h-5" />}
                        {link.platform === 'YouTube' && <Youtube className="w-5 h-5" />}
                        {link.platform === 'WhatsApp' && <MessageSquare className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">{link.platform}</span>
                          <label className="flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={link.enabled} 
                              onChange={(e) => updateArray('socialLinks', idx, { enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black relative"></div>
                          </label>
                        </div>
                        <input 
                          type="text" 
                          value={link.url}
                          onChange={(e) => updateArray('socialLinks', idx, { url: e.target.value })}
                          placeholder={`https://www.${link.platform.toLowerCase()}.com/...`}
                          className="w-full bg-white border border-gray-200 px-3 py-1.5 text-xs rounded-none focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'links' && (
                <motion.div
                  key="links"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold">Manage Footer Links</h4>
                    <button 
                      onClick={addQuickLink}
                      className="bg-black text-white px-4 py-2 text-xs font-bold rounded-none flex items-center gap-2 hover:bg-gray-800 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Add Link
                    </button>
                  </div>
                  <div className="space-y-3">
                    {config.quickLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 group">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <input 
                            type="text" 
                            value={link.name}
                            onChange={(e) => updateArray('quickLinks', idx, { name: e.target.value })}
                            className="bg-white border border-gray-200 px-3 py-2 text-sm font-bold rounded-none focus:outline-none focus:border-black"
                          />
                          <input 
                            type="text" 
                            value={link.url}
                            onChange={(e) => updateArray('quickLinks', idx, { url: e.target.value })}
                            className="bg-white border border-gray-200 px-3 py-2 text-sm rounded-none focus:outline-none focus:border-black font-mono text-[10px]"
                          />
                        </div>
                        <button 
                          onClick={() => removeQuickLink(idx)}
                          className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        value={config.contact.email} 
                        onChange={(e) => updateConfig('contact', { email: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3 rounded-none focus:outline-none focus:border-black font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Support Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={config.contact.phone} 
                        onChange={(e) => updateConfig('contact', { phone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3 rounded-none focus:outline-none focus:border-black font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Office Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={config.contact.address} 
                        onChange={(e) => updateConfig('contact', { address: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3 rounded-none focus:outline-none focus:border-black font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Working Hours</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={config.contact.officeTime} 
                        onChange={(e) => updateConfig('contact', { officeTime: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3 rounded-none focus:outline-none focus:border-black font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Google Map Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={config.contact.mapLink} 
                        onChange={(e) => updateConfig('contact', { mapLink: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-3 rounded-none focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'design' && (
                <motion.div
                  key="design"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-xs font-black uppercase tracking-widest text-gray-500">Layout Presets</label>
                       <div className="grid grid-cols-3 gap-2">
                          {['compact', 'premium', 'minimal'].map((l) => (
                            <button
                              key={l}
                              onClick={() => updateConfig('design', { layout: l })}
                              className={`p-3 text-[10px] font-black uppercase border tracking-widest ${config.design.layout === l ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 hover:border-gray-300'}`}
                            >
                              {l}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-xs font-black uppercase tracking-widest text-gray-500">Border Radius ({config.design.borderRadius}px)</label>
                       <input 
                        type="range" 
                        min="0" max="40"
                        value={config.design.borderRadius} 
                        onChange={(e) => updateConfig('design', { borderRadius: parseInt(e.target.value) })}
                        className="w-full accent-black"
                      />
                    </div>
                    <div className="space-y-4">
                       <label className="text-xs font-black uppercase tracking-widest text-gray-500">Footer Padding ({config.design.padding}px)</label>
                       <input 
                        type="range" 
                        min="10" max="80"
                        value={config.design.padding} 
                        onChange={(e) => updateConfig('design', { padding: parseInt(e.target.value) })}
                        className="w-full accent-black"
                      />
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Show Divider</span>
                          <button 
                            onClick={() => updateConfig('design', { divider: !config.design.divider })}
                            className={`w-10 h-6 rounded-full relative transition-colors ${config.design.divider ? 'bg-black' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.design.divider ? 'left-5' : 'left-1'}`}></div>
                          </button>
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Enable Shadow</span>
                          <button 
                            onClick={() => updateConfig('design', { shadow: !config.design.shadow })}
                            className={`w-10 h-6 rounded-full relative transition-colors ${config.design.shadow ? 'bg-black' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.design.shadow ? 'left-5' : 'left-1'}`}></div>
                          </button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <p className="text-xs text-gray-400 italic">Settings are synced with Flutter App APIs</p>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-black text-white px-8 py-3 font-black uppercase tracking-widest text-xs rounded-none flex items-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Publish Changes'}
            </button>
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-none border font-bold text-sm ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
          >
            {message.type === 'success' ? <Check className="w-4 h-4 inline mr-2" /> : <AlertCircle className="w-4 h-4 inline mr-2" />}
            {message.text}
          </motion.div>
        )}
      </div>

      {/* Live Mobile Preview */}
      <div className="w-full xl:w-[400px] shrink-0">
        <div className="sticky top-6">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Mobile Preview</h3>
            <div className="flex gap-2 text-[10px] items-center text-green-500 font-bold">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Live Sync Active
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[350px] h-[750px] bg-white border-[12px] border-[#111111] rounded-[52px] shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
            {/* Top Speaker & Notch Bar */}
            <div className="h-6 w-full bg-[#111111] flex justify-center items-end pb-1 shrink-0 z-20">
               <div className="h-3.5 w-24 bg-black rounded-b-xl flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#1f1f1f] rounded-full mr-1.5 border border-[#333333]"></div>
                  <div className="w-10 h-1 bg-[#151515] rounded-full"></div>
               </div>
            </div>
            
            <div className="flex-1 bg-gray-50 relative overflow-hidden flex flex-col">
              {/* POLISHED REAL APP BAR */}
              <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between shrink-0" style={{ borderBottomColor: config.design.divider ? 'rgba(0,0,0,0.06)' : 'transparent' }}>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-800">☰</span>
                    {config.brand.logoUrl ? (
                      <img src={config.brand.logoUrl} className="h-4 object-contain" alt="brand-logo" />
                    ) : (
                      <span className="text-[11px] font-black uppercase tracking-tight" style={{ color: config.brand.brandColor }}>
                         {config.brand.name}
                      </span>
                    )}
                 </div>
                 
                 <div className="flex items-center gap-3.5">
                    <span className="text-xs text-gray-400">🔍</span>
                    <div className="relative">
                       <span className="text-xs" style={{ color: config.brand.brandColor }}>🛒</span>
                       <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-purple-600 text-[6px] text-white flex items-center justify-center rounded-full font-black">3</span>
                    </div>
                 </div>
              </div>

              {/* SCROLLABLE CONTENT BODY */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50">
                 {/* DYNAMIC HERO BANNER */}
                 <div className="p-3">
                    <div 
                      className="relative h-28 w-full overflow-hidden flex flex-col justify-center px-4 gap-1 transition-all duration-500 shadow-sm"
                      style={{ 
                        backgroundColor: config.brand.brandColor,
                        borderRadius: `${config.design.borderRadius}px`
                      }}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
                       <span className="text-[7px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded-full w-max uppercase tracking-wider relative z-10">Limited edition</span>
                       <h4 className="text-xs font-black text-white tracking-tight uppercase leading-none relative z-10">
                          {config.brand.name}<br/>Summer Collection
                       </h4>
                       <button className="mt-1 px-3 py-1 bg-white text-[7px] font-black uppercase tracking-widest text-black w-max transition-all hover:scale-105" style={{ borderRadius: `${config.design.borderRadius / 2}px` }}>
                          Shop Now
                       </button>
                    </div>
                 </div>

                 {/* CATEGORIES ROW */}
                 <div className="px-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Top Categories</p>
                    <div className="flex gap-2 pb-1 overflow-x-auto hide-scrollbar">
                       {['Trending', 'Flash Deals', 'New Arrivals', 'Exclusive'].map((cat, idx) => (
                         <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                            <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center text-sm shadow-sm">
                               {idx === 0 && '🔥'}
                               {idx === 1 && '🏷️'}
                               {idx === 2 && '✨'}
                               {idx === 3 && '🥇'}
                            </div>
                            <span className="text-[7px] font-bold text-gray-500 uppercase tracking-tight">{cat}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* FEATURED PRODUCTS */}
                 <div className="px-3 flex-1">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-2">Featured Products</p>
                    <div className="grid grid-cols-2 gap-2.5">
                       {[
                         { name: 'Urban Leather sneakers', price: '2,500 BDT', icon: '👟' },
                         { name: 'Elite Series 8 Pro', price: '4,500 BDT', icon: '⌚' }
                       ].map((item, idx) => (
                          <div 
                            key={idx}
                            className="bg-white border p-3 flex flex-col justify-between shadow-sm transition-all duration-300"
                            style={{ 
                              borderRadius: `${config.design.borderRadius}px`,
                              borderColor: config.design.divider ? 'rgba(0,0,0,0.08)' : 'transparent',
                              boxShadow: config.design.shadow ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                            }}
                          >
                             <div>
                                <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-xl relative mb-2">
                                   <span className="absolute top-1 left-1 bg-purple-600 text-white text-[6px] font-black px-1 py-0.5 rounded">Hot</span>
                                   {item.icon}
                                </div>
                                <h5 className="text-[9px] font-bold uppercase text-gray-800 line-clamp-1 leading-tight">{item.name}</h5>
                             </div>
                             <div className="mt-2 flex items-center justify-between pt-1">
                                <span className="text-[9px] font-black" style={{ color: config.brand.brandColor }}>{item.price}</span>
                                <button className="w-4 h-4 text-white text-[9px] rounded-full flex items-center justify-center transition-transform hover:scale-110 font-bold" style={{ backgroundColor: config.brand.brandColor }}>
                                   +
                                </button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* DYNAMIC FOOTER PREVIEW */}
                 <div 
                   className="transition-all duration-500 border-t mt-6"
                   style={{ 
                     backgroundColor: config.brand.footerBgColor,
                     color: config.brand.footerContentColor,
                     padding: `${config.design.padding / 2}px`,
                     borderRadius: `${config.design.borderRadius}px`,
                     borderTopColor: config.design.divider ? 'rgba(0,0,0,0.05)' : 'transparent',
                     boxShadow: config.design.shadow ? '0 -10px 30px rgba(0,0,0,0.02)' : 'none'
                   }}
                 >
                   <div className="flex flex-col gap-4">
                      <div style={{ color: config.brand.brandColor }} className="text-[11px] font-black tracking-tighter uppercase">
                         {config.brand.logoUrl ? <img src={config.brand.logoUrl} className="h-4 object-contain" /> : config.brand.name}
                      </div>
                      
                      <p className="text-[8px] leading-relaxed" style={{ color: config.brand.footerMutedColor || '#888888' }}>
                         {config.description.short}
                      </p>

                      <div className="flex gap-2">
                         {config.socialLinks.filter(l => l.enabled).map(l => (
                           <div key={l.platform} className="p-1" style={{ color: config.brand.footerIconColor || '#DADADA' }}>
                              {l.platform === 'Facebook' && <Facebook className="w-3.5 h-3.5" />}
                              {l.platform === 'Instagram' && <Instagram className="w-3.5 h-3.5" />}
                              {l.platform === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5" />}
                           </div>
                         ))}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[7px] font-bold py-1.5 border-t border-white/10">
                         {config.quickLinks.slice(0, 4).map(l => (
                           <div key={l.name} className="flex items-center gap-1" style={{ color: config.brand.footerContentColor || '#E5E5E5' }}>
                              <ChevronRight className="w-2.5 h-2.5 opacity-30" /> {l.name}
                           </div>
                         ))}
                      </div>

                      <div className="border-t border-white/10 pt-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-[7.5px]" style={{ color: config.brand.footerMutedColor || '#888888' }}>
                             <Mail className="w-2.5 h-2.5 opacity-40 shrink-0" />
                             <span className="truncate">{config.contact.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[7.5px]" style={{ color: config.brand.footerMutedColor || '#888888' }}>
                             <Phone className="w-2.5 h-2.5 opacity-40 shrink-0" />
                             <span>{config.contact.phone}</span>
                          </div>
                      </div>

                      <div className="text-[6.5px] text-center pt-2 uppercase tracking-widest font-black border-t border-white/5" style={{ color: config.brand.footerCopyrightColor || '#888888' }}>
                         {config.description.copyright}
                      </div>
                   </div>
                 </div>
              </div>

              {/* HIGH POLISHED STICKY BOTTOM NAVIGATION */}
              <div className="h-12 border-t bg-white flex items-center justify-around shrink-0 z-10" style={{ borderTopColor: config.design.divider ? 'rgba(0,0,0,0.05)' : 'transparent' }}>
                 {['Home', 'Search', 'Cart', 'Profile'].map((tab, idx) => (
                   <div key={idx} className="flex flex-col items-center justify-center cursor-pointer">
                      <span className="text-[11px]" style={{ color: idx === 0 ? config.brand.brandColor : '#9CA3AF' }}>
                         {idx === 0 && '🏠'}
                         {idx === 1 && '🔎'}
                         {idx === 2 && '🛍️'}
                         {idx === 3 && '👤'}
                      </span>
                      <span className="text-[6.5px] font-black uppercase tracking-tight mt-0.5" style={{ color: idx === 0 ? config.brand.brandColor : '#9CA3AF' }}>{tab}</span>
                   </div>
                 ))}
              </div>
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="h-5 w-full bg-[#111111] flex justify-center items-start pt-1.5 shrink-0 z-20">
               <div className="h-1 w-20 bg-[#333333] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
