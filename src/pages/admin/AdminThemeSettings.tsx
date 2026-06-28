import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layout, 
  Type, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Zap, 
  Moon, 
  Sun, 
  Eye, 
  RefreshCw, 
  Download, 
  Save, 
  RotateCcw, 
  CheckCircle2,
  ChevronRight,
  MousePointer2,
  Image as ImageIcon,
  Square,
  Search,
  ShoppingCart,
  Menu,
  Heart,
  Star,
  Layers,
  Sparkles,
  ArrowRight,
  BellRing,
  Shield,
  Loader2
} from 'lucide-react';
import { useThemeStore, ThemeConfig } from '../../store/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';

import { ThemePreviewContainer } from '../../components/admin/ThemePreviewContainer';
import Home from '../../pages/Home';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import Product from '../../pages/Product';
import { CompactProductCard } from '../../components/product/CompactProductCard';
import TemplateDraftBar from '../../components/admin/TemplateDraftBar';

const PRESET_THEMES = [
  { name: 'Black & White Pro', primary: '#000000', secondary: '#ffffff' },
  { name: 'Purple Premium', primary: '#9333ea', secondary: '#000000' },
  { name: 'Modern Ecommerce', primary: '#2563eb', secondary: '#1e40af' },
  { name: 'Luxury Dark', primary: '#c4b5fd', secondary: '#000000' },
  { name: 'Minimal White', primary: '#000000', secondary: '#f3f4f6' },
  { name: 'Neon Tech', primary: '#22c55e', secondary: '#000000' },
];

export default function AdminThemeSettings() {
  const { 
    draftTheme: theme, 
    updateDraftTheme: updateTheme, 
    updateDraftButton: updateButton,
    resetDraftTheme: resetTheme,
    publishTheme
  } = useThemeStore();
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await publishTheme();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to publish theme settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'colors', name: 'Global Colors', icon: Palette, preview: 'home' },
    { id: 'header', name: 'Header & Navbar', icon: Layout, preview: 'header' },
    { id: 'buttons', name: 'Buttons', icon: MousePointer2, preview: 'buttons' },
    { id: 'banner', name: 'Banners', icon: ImageIcon, preview: 'home' },
    { id: 'cards', name: 'Product Cards', icon: Square, preview: 'home' },
    { id: 'product', name: 'Product Page', icon: Smartphone, preview: 'product' },
    { id: 'footer', name: 'Footer', icon: Layers, preview: 'footer' },
    { id: 'typography', name: 'Typography', icon: Type, preview: 'home' },
    { id: 'modes', name: 'Dark/Light', icon: Moon, preview: 'home' },
    { id: 'effects', name: 'Effects', icon: Zap, preview: 'home' },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, preview: 'home' },
    { id: 'presets', name: 'Presets', icon: Sparkles, preview: 'home' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-32 font-sans relative">
      {/* Draft Toolbar (Publish/Save/Reset) */}
      <TemplateDraftBar />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 leading-none">Theme Customizer</h2>
          <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest flex items-center gap-2">
            <Palette className="w-3 h-3 text-purple-600" /> Professional Real-time Section Based Panel
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xs border border-gray-200">
           {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
             <button 
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className={`p-2 rounded-xs transition-all ${previewMode === mode ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
             >
                {mode === 'desktop' && <Monitor className="w-4 h-4" />}
                {mode === 'tablet' && <Tablet className="w-4 h-4" />}
                {mode === 'mobile' && <Smartphone className="w-4 h-4" />}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Controls Sidebar */}
        <div className="xl:col-span-4 space-y-6">
           <div className="bg-white border border-[#EEEEEE] shadow-sm flex flex-col">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-50 bg-gray-50/50 p-1">
                 {tabs.map((tab) => (
                   <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-2 border-b-2 ${activeTab === tab.id ? 'border-purple-600 text-purple-600 bg-white shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                   >
                     <tab.icon className="w-3.5 h-3.5" /> {tab.name}
                   </button>
                 ))}
              </div>

              <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-8"
                    >
                       {activeTab === 'colors' && (
                         <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Global Colors</h3>
                            <div className="grid grid-cols-2 gap-6">
                               <ColorPicker label="Primary Color" value={theme.primaryColor} onChange={(val) => updateTheme({ primaryColor: val })} />
                               <ColorPicker label="Secondary Color" value={theme.secondaryColor} onChange={(val) => updateTheme({ secondaryColor: val })} />
                               <ColorPicker label="Background Color" value={theme.backgroundColor} onChange={(val) => updateTheme({ backgroundColor: val })} />
                               <ColorPicker label="Text Color" value={theme.textColor} onChange={(val) => updateTheme({ textColor: val })} />
                               <ColorPicker label="Border Color" value={theme.borderColor} onChange={(val) => updateTheme({ borderColor: val })} />
                               <ColorPicker label="Shadow Color" value={theme.shadowColor} onChange={(val) => updateTheme({ shadowColor: val })} />
                            </div>
                         </div>
                       )}

                       {activeTab === 'header' && (
                         <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Header & Navbar</h3>
                            <div className="grid grid-cols-2 gap-6">
                               <ColorPicker label="Navbar BG" value={theme.navbarBg} onChange={(val) => updateTheme({ navbarBg: val })} />
                               <ColorPicker label="Navbar Text" value={theme.navbarTextColor} onChange={(val) => updateTheme({ navbarTextColor: val })} />
                               <ColorPicker label="Menu Icon" value={theme.menuIconColor} onChange={(val) => updateTheme({ menuIconColor: val })} />
                               <ColorPicker label="Search Box" value={theme.searchBoxColor} onChange={(val) => updateTheme({ searchBoxColor: val })} />
                               <ColorPicker label="Search Placeholder" value={theme.searchPlaceholderColor} onChange={(val) => updateTheme({ searchPlaceholderColor: val })} />
                               <ColorPicker label="Cart Icon" value={theme.cartIconColor} onChange={(val) => updateTheme({ cartIconColor: val })} />
                               <ColorPicker label="Notification Icon" value={theme.notificationIconColor} onChange={(val) => updateTheme({ notificationIconColor: val })} />
                            </div>
                            <Toggle label="Sticky Navbar" checked={theme.stickyNavbar} onChange={(val) => updateTheme({ stickyNavbar: val })} />
                         </div>
                       )}

                       {activeTab === 'buttons' && (
                         <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Button Customization</h3>
                            {Object.entries(theme.buttons).map(([key, config]) => (
                               <div key={key} className="space-y-4 p-4 bg-gray-50 border border-gray-100">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-purple-600">{key.replace(/([A-Z])/g, ' $1')} Button</p>
                                  <div className="grid grid-cols-2 gap-4">
                                     <ColorPicker label="BG Color" value={config.bg} onChange={(val) => updateButton(key as any, { bg: val })} />
                                     <ColorPicker label="Text Color" value={config.textColor} onChange={(val) => updateButton(key as any, { textColor: val })} />
                                     <Slider label="Radius" value={config.radius} min={0} max={50} onChange={(val) => updateButton(key as any, { radius: val })} />
                                     <ColorPicker label="Hover BG" value={config.hoverColor} onChange={(val) => updateButton(key as any, { hoverColor: val })} />
                                  </div>
                               </div>
                            ))}
                         </div>
                       )}

                       {activeTab === 'banner' && (
                         <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Banner Settings</h3>
                            <div className="grid grid-cols-1 gap-6">
                               <ColorPicker label="Overlay Color" value={theme.bannerOverlayColor} onChange={(val) => updateTheme({ bannerOverlayColor: val })} />
                               <ColorPicker label="Text Color" value={theme.bannerTextColor} onChange={(val) => updateTheme({ bannerTextColor: val })} />
                               <ColorPicker label="Button Color" value={theme.bannerButtonColor} onChange={(val) => updateTheme({ bannerButtonColor: val })} />
                               <Slider label="Slider Speed (ms)" value={theme.sliderSpeed} min={1000} max={10000} step={500} onChange={(val) => updateTheme({ sliderSpeed: val })} />
                            </div>
                         </div>
                       )}

                       {activeTab === 'cards' && (
                         <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Product Card Design</h3>
                            <div className="grid grid-cols-2 gap-6">
                               <ColorPicker label="Card BG" value={theme.cardBg} onChange={(val) => updateTheme({ cardBg: val })} />
                               <ColorPicker label="Product Name" value={theme.productNameColor} onChange={(val) => updateTheme({ productNameColor: val })} />
                               <ColorPicker label="Price Color" value={theme.priceColor} onChange={(val) => updateTheme({ priceColor: val })} />
                               <ColorPicker label="Discount Badge" value={theme.discountBadgeColor} onChange={(val) => updateTheme({ discountBadgeColor: val })} />
                               <Slider label="Card Radius" value={theme.cardRadius} min={0} max={40} onChange={(val) => updateTheme({ cardRadius: val })} />
                               <Slider label="Grid Spacing" value={theme.gridSpacing} min={8} max={40} onChange={(val) => updateTheme({ gridSpacing: val })} />
                            </div>
                         </div>
                       )}

                       {activeTab === 'typography' && (
                         <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Typography</h3>
                            <div className="space-y-4">
                               <Select label="Font Family" value={theme.fontFamily} options={['Inter', 'Roboto', 'Open Sans', 'Montserrat']} onChange={(val) => updateTheme({ fontFamily: val })} />
                               <Select label="Heading Font" value={theme.headingFont} options={['Space Grotesk', 'Outfit', 'Playfair Display', 'Inter']} onChange={(val) => updateTheme({ headingFont: val })} />
                               <Select label="Global Size" value={theme.fontSize} options={['small', 'medium', 'large']} onChange={(val) => updateTheme({ fontSize: val as any })} />
                            </div>
                         </div>
                       )}

                       {activeTab === 'modes' && (
                         <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Dark / Light Mode</h3>
                            <div className="flex bg-gray-100 p-1 rounded-xs border border-gray-200">
                               {(['light', 'dark', 'auto'] as const).map((m) => (
                                 <button 
                                  key={m}
                                  onClick={() => updateTheme({ mode: m })}
                                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${theme.mode === m ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                 >
                                   {m === 'light' && <Sun className="w-3.5 h-3.5 mx-auto mb-1" />}
                                   {m === 'dark' && <Moon className="w-3.5 h-3.5 mx-auto mb-1" />}
                                   {m === 'auto' && <RefreshCw className="w-3.5 h-3.5 mx-auto mb-1" />}
                                   {m}
                                 </button>
                               ))}
                            </div>
                         </div>
                       )}

                       {activeTab === 'effects' && (
                         <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-black border-l-4 border-purple-600 pl-3">Website Effects</h3>
                            <Toggle label="Smooth Animation" checked={theme.smoothAnimation} onChange={(val) => updateTheme({ smoothAnimation: val })} />
                            <Toggle label="Glass Effect" checked={theme.glassEffect} onChange={(val) => updateTheme({ glassEffect: val })} />
                            <Toggle label="Card Hover Animation" checked={theme.cardHoverAnimation} onChange={(val) => updateTheme({ cardHoverAnimation: val })} />
                            <Toggle label="Button Zoom" checked={theme.buttonHoverZoom} onChange={(val) => updateTheme({ buttonHoverZoom: val })} />
                            <Toggle label="Banner Fade" checked={theme.bannerFadeAnimation} onChange={(val) => updateTheme({ bannerFadeAnimation: val })} />
                         </div>
                       )}

                       {activeTab === 'presets' && (
                         <div className="grid grid-cols-1 gap-4">
                            {PRESET_THEMES.map((preset) => (
                               <button
                                key={preset.name}
                                onClick={() => updateTheme({ primaryColor: preset.primary, secondaryColor: preset.secondary })}
                                className="w-full p-4 border border-[#EEEEEE] hover:border-purple-600 hover:bg-purple-50/50 transition-all text-left flex items-center justify-between group"
                               >
                                  <div>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-black mb-2">{preset.name}</p>
                                     <div className="flex gap-2">
                                        <div className="w-6 h-6 border border-gray-200" style={{ backgroundColor: preset.primary }}></div>
                                        <div className="w-6 h-6 border border-gray-200" style={{ backgroundColor: preset.secondary }}></div>
                                     </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors" />
                               </button>
                            ))}
                         </div>
                       )}
                    </motion.div>
                 </AnimatePresence>
              </div>
           </div>

           <div className="bg-gray-900 border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between">
                 <button 
                  onClick={resetTheme}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                 >
                   <RotateCcw className="w-3.5 h-3.5" /> Reset Theme
                 </button>
              </div>
           </div>
        </div>

        {/* Live Preview System Redesign */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Section Live Preview • {currentTab.name}</span>
              </div>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300">Vertical Optimization Mode</p>
           </div>

           <div className={`bg-gray-200 border border-[#EEEEEE] overflow-hidden transition-all duration-500 mx-auto relative shadow-2xl ${
             previewMode === 'mobile' ? 'max-w-[400px] aspect-[9/19] rounded-[48px] border-[14px] border-[#0a0a0a]' : 
             previewMode === 'tablet' ? 'max-w-[800px] aspect-[4/3] rounded-[32px] border-[10px] border-[#0a0a0a]' : 
             'w-full min-h-[800px] rounded-none border border-gray-300'
           }`}>
              <ThemePreviewContainer theme={theme}>
                <div className="flex flex-col min-h-full">
                  <Header />
                  <main className="flex-1 overflow-x-hidden">
                    <AnimatePresence mode="wait">
                      {activeTab === 'product' ? (
                        <div key="product-preview" className="animate-in fade-in duration-500">
                          <Product />
                        </div>
                      ) : activeTab === 'buttons' ? (
                        <ButtonPanelPreview theme={theme} />
                      ) : (
                        <div key="home-preview" className="animate-in fade-in duration-500">
                          <Home />
                        </div>
                      )}
                    </AnimatePresence>
                  </main>
                  <Footer />
                </div>
              </ThemePreviewContainer>
           </div>

           {/* Contextual Save Bar under Preview */}
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-neutral-950 p-6 border border-white/5 shadow-2xl"
           >
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                    <Save className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Theme Configuration</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Staged changes for {currentTab.name}</p>
                 </div>
              </div>

              <div className="flex flex-col gap-2 w-full max-w-[200px]">
                 <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-11 border border-white/20 bg-transparent text-white text-[10px] font-black uppercase tracking-[0.15em] hover:bg-white/5 transition-all flex items-center justify-center gap-2 group"
                 >
                   <Save className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
                   Save Changes
                 </button>
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full h-11 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 hover:bg-purple-500 active:scale-95 shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] ${isSaving ? 'opacity-50' : ''}`}
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saveSuccess ? (
                      <>APPLIED <CheckCircle2 className="w-4 h-4" /></>
                    ) : (
                      <>APPLY THEME <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- Custom Preview Panels (Keep only needed ones) ---

function ButtonPanelPreview({ theme }: { theme: ThemeConfig }) {
  const sampleProduct: any = {
    id: 'placeholder',
    name: 'Theme Preview Product',
    price: 1000,
    discountPrice: 800,
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=200',
    rating: 4.5,
    category: 'Perfume'
  };
  
  return (
    <div className="p-12 space-y-12 min-h-full bg-theme-bg">
       <h3 className="text-xs font-black uppercase tracking-widest text-theme-text border-b border-theme-border pb-3">Theme Generated Buttons</h3>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 border border-theme-border flex flex-col items-center gap-6">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Primary Action</p>
             <button className="btn-primary px-12 py-4 text-xs font-black uppercase tracking-widest">Shop Now</button>
          </div>
          <div className="p-8 border border-theme-border flex flex-col items-center gap-6">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Secondary Action</p>
             <button className="btn-secondary px-12 py-4 text-xs font-black uppercase tracking-widest">Learn More</button>
          </div>
          <div className="p-8 border border-theme-border flex flex-col items-center gap-6">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Add to Cart</p>
             <button className="btn-add-to-cart px-10 py-3 text-[10px] font-black uppercase tracking-widest">Add to Cart</button>
          </div>
          <div className="p-8 border border-theme-border flex flex-col items-center gap-6">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Buy Now</p>
             <button className="btn-buy-now px-10 py-3 text-[10px] font-black uppercase tracking-widest">Buy Now</button>
          </div>
       </div>

       <div className="pt-12">
          <h3 className="text-xs font-black uppercase tracking-widest text-theme-text border-b border-theme-border pb-3 mb-6">Product Card Context</h3>
          <div className="max-w-[250px] mx-auto">
             <CompactProductCard product={sampleProduct} />
          </div>
       </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</label>
       <div className="flex items-center gap-2 p-1 bg-white border border-[#EEEEEE]">
          <input 
            type="color" 
            value={value.startsWith('rgba') ? '#000000' : value} // Basic hex only for HTML picker
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-none border-none bg-transparent cursor-pointer"
          />
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent border-none text-[10px] font-bold text-black uppercase focus:outline-none"
          />
       </div>
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, onChange }: { label: string, value: number, min: number, max: number, step?: number, onChange: (val: number) => void }) {
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center">
          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</label>
          <span className="text-[10px] font-black text-purple-600">{value}</span>
       </div>
       <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-600 h-1 bg-gray-100 appearance-none cursor-pointer"
       />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100">
       <label className="text-[9px] font-black uppercase tracking-widest text-gray-900">{label}</label>
       <button 
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4 rounded-full transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-300'}`}
      >
         <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
       </button>
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (val: string) => void }) {
  return (
    <div className="space-y-2">
       <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</label>
       <div className="relative">
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#EEEEEE] font-bold text-[10px] uppercase appearance-none"
          >
             {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none rotate-90" />
       </div>
    </div>
  );
}
