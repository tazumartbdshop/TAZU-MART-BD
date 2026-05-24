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
  Shield
} from 'lucide-react';
import { useThemeStore, ThemeConfig } from '../../store/useThemeStore';
import { motion, AnimatePresence } from 'framer-motion';

const PRESET_THEMES = [
  { name: 'Black & White Pro', primary: '#000000', secondary: '#ffffff' },
  { name: 'Purple Premium', primary: '#9333ea', secondary: '#000000' },
  { name: 'Modern Ecommerce', primary: '#2563eb', secondary: '#1e40af' },
  { name: 'Luxury Dark', primary: '#c4b5fd', secondary: '#000000' },
  { name: 'Minimal White', primary: '#000000', secondary: '#f3f4f6' },
  { name: 'Neon Tech', primary: '#22c55e', secondary: '#000000' },
];

export default function AdminThemeSettings() {
  const { theme, updateTheme, resetTheme, updateButton } = useThemeStore();
  const [activeTab, setActiveTab] = useState('colors');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
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
             <div className="w-full h-full bg-white overflow-y-auto custom-scrollbar flex flex-col pt-1" style={{ backgroundColor: theme.backgroundColor, fontFamily: theme.fontFamily }}>
                
                <AnimatePresence mode="wait">
                  {currentTab.preview === 'home' && <HomePreview theme={theme} />}
                  {currentTab.preview === 'header' && <HeaderPreview theme={theme} />}
                  {currentTab.preview === 'product' && <ProductPagePreview theme={theme} />}
                  {currentTab.preview === 'buttons' && <ButtonPanelPreview theme={theme} />}
                  {currentTab.preview === 'footer' && <FooterPreview theme={theme} />}
                </AnimatePresence>

             </div>
           </div>

           {/* Contextual Save Bar under Preview */}
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-black p-6 shadow-2xl"
           >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-white/50 border border-white/10">
                    <Save className="w-5 h-5" />
                 </div>
                 <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Save {currentTab.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Apply changes to live website environment</p>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={resetTheme}
                  className="px-6 py-3 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                 >
                   Save Changes
                 </button>
                 <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-12 py-3 bg-purple-600 text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 hover:scale-105 active:scale-95 ${isSaving ? 'opacity-50' : 'shadow-xl shadow-purple-900/40'}`}
                  >
                    {isSaving ? 'Applying...' : saveSuccess ? (
                      <>APPLIED SUCCESS <CheckCircle2 className="w-4 h-4" /></>
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

// --- Preview Components ---

function HeaderPreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="p-8 space-y-12 min-h-full">
       <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-8">Standard Header Layout</p>
          <header className="px-6 py-5 flex items-center justify-between shadow-sm transition-all" style={{ backgroundColor: theme.navbarBg, color: theme.navbarTextColor, borderColor: theme.borderColor, borderWidth: 1 }}>
             <div className="flex items-center gap-4">
                <Menu className="w-6 h-6" style={{ color: theme.menuIconColor }} />
                <span className="font-black tracking-tighter text-xl uppercase" style={{ color: theme.navbarTextColor, fontFamily: theme.headingFont }}>TAZU MART</span>
             </div>
             <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 px-4 py-2" style={{ backgroundColor: theme.searchBoxColor }}>
                   <Search className="w-4 h-4" style={{ color: theme.searchPlaceholderColor }} />
                   <span className="text-[10px] font-bold" style={{ color: theme.searchPlaceholderColor }}>Search premium products...</span>
                </div>
                <div className="flex items-center gap-4">
                   <BellRing className="w-5 h-5" style={{ color: theme.notificationIconColor }} />
                   <div className="relative">
                      <ShoppingCart className="w-5 h-5" style={{ color: theme.cartIconColor }} />
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-purple-600 text-[8px] text-white flex items-center justify-center rounded-full font-black">2</span>
                   </div>
                </div>
             </div>
          </header>
       </div>

       <div className="bg-gray-50/50 p-12 border border-dashed border-gray-200 text-center">
          <Layout className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Layout Area</p>
       </div>
    </div>
  );
}

function HomePreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="space-y-0 min-h-full flex flex-col">
       {/* Small Mock Header */}
       <header className="px-6 py-4 flex items-center justify-between border-b" style={{ backgroundColor: theme.navbarBg, borderColor: theme.borderColor }}>
          <span className="font-black tracking-tighter text-sm uppercase" style={{ color: theme.navbarTextColor, fontFamily: theme.headingFont }}>TAZU MART</span>
          <ShoppingCart className="w-4 h-4" style={{ color: theme.cartIconColor }} />
       </header>

       {/* Banner Section */}
       <div className="relative aspect-[16/7] w-full" style={{ backgroundColor: theme.primaryColor }}>
          <div className="absolute inset-0" style={{ background: theme.bannerGradient }}></div>
          <div className="absolute inset-0" style={{ backgroundColor: theme.bannerOverlayColor }}></div>
          <div className="absolute inset-0 flex flex-col items-start justify-center px-8 gap-4">
             <span className="text-[10px] font-black text-white bg-purple-600 px-3 py-1 uppercase tracking-widest">Flash Offer 2026</span>
             <h2 className="text-3xl font-black uppercase tracking-tighter leading-none" style={{ color: theme.bannerTextColor, fontFamily: theme.headingFont }}>URBAN LUXURY<br/>COLLECTION</h2>
             <button className="px-6 py-3 font-black uppercase tracking-widest text-[10px] shadow-2xl transition-transform hover:scale-105" style={{ backgroundColor: theme.buttons.shopNow.bg, color: theme.buttons.shopNow.textColor, borderRadius: theme.buttons.shopNow.radius }}>EXPLORE NOW</button>
          </div>
       </div>

       {/* Categories */}
       <div className="p-8">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-black uppercase tracking-tight" style={{ color: theme.textColor, fontFamily: theme.headingFont }}>Quick Categories</h3>
             <ArrowRight className="w-4 h-4" />
          </div>
          <div className="grid grid-cols-4 gap-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="space-y-2 text-center">
                  <div className="aspect-square bg-gray-100 rounded-full border border-gray-200"></div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Category {i}</p>
               </div>
             ))}
          </div>
       </div>

       {/* Products */}
       <div className="p-8 flex-1">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-black uppercase tracking-tight" style={{ color: theme.textColor, fontFamily: theme.headingFont }}>Trending Sale</h3>
          </div>
          <div className="grid grid-cols-2 gap-6" style={{ gap: theme.gridSpacing }}>
            {[1, 2].map((i) => (
              <div 
                key={i} 
                className={`group transition-all ${theme.cardHoverAnimation ? 'hover:-translate-y-2' : ''}`}
                style={{ 
                  backgroundColor: theme.cardBg, 
                  borderRadius: theme.cardRadius, 
                  boxShadow: theme.cardShadow,
                  border: `1px solid ${theme.borderColor}`
                }}
              >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden" style={{ borderRadius: `${theme.cardRadius}px ${theme.cardRadius}px 0 0` }}>
                    <div className="absolute top-2 left-2 px-2 py-1 text-[8px] font-black text-white bg-green-500 uppercase">Save 50%</div>
                    <Heart className="absolute top-2 right-2 w-4 h-4 text-gray-300" style={{ color: theme.wishlistIconColor }} />
                  </div>
                  <div className="p-4 space-y-2 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" style={{ color: theme.ratingStarColor }} />)}
                    </div>
                    <h3 className="text-[10px] font-bold uppercase truncate" style={{ color: theme.productNameColor }}>Essential Urban Tee</h3>
                    <p className="text-xs font-black" style={{ color: theme.priceColor }}>BDT 1,290</p>
                    <button 
                      className={`w-full py-2.5 font-black uppercase text-[8px] tracking-widest ${theme.buttonHoverZoom ? 'hover:scale-105 active:scale-95' : ''}`} 
                      style={{ 
                        backgroundColor: theme.buttons.addToCart.bg, 
                        color: theme.buttons.addToCart.textColor,
                        borderRadius: theme.buttons.addToCart.radius
                      }}
                    >
                      ADD TO CART
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navbar Mock */}
        <div className="mt-12 bg-white border-t p-4 flex items-center justify-between" style={{ backgroundColor: theme.navbarBg, borderColor: theme.borderColor }}>
           {[Layout, Search, ShoppingCart, Smartphone].map((Icon, idx) => (
             <div key={idx} className="flex flex-col items-center gap-1 opacity-60">
                <Icon className="w-5 h-5" style={{ color: theme.navbarTextColor }} />
             </div>
           ))}
        </div>
    </div>
  );
}

function ProductPagePreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="p-8 space-y-8 min-h-full">
       <header className="py-4 border-b flex items-center justify-between" style={{ borderColor: theme.borderColor }}>
          <ChevronRight className="w-5 h-5 rotate-180" />
          <Heart className="w-5 h-5 text-gray-300" />
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="aspect-[4/5] bg-gray-50 border border-gray-100 flex items-center justify-center rounded-xl overflow-hidden shadow-sm">
             <ImageIcon className="w-16 h-16 text-gray-200" />
          </div>
          <div className="space-y-6">
             <div className="space-y-2">
                <div className="flex items-center gap-2">
                   <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                   </div>
                   <span className="text-[10px] font-bold text-gray-400">(128 Reviews)</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: theme.textColor, fontFamily: theme.headingFont }}>SMART WATCH SERIES 8 PRO</h2>
             </div>

             <div className="flex items-center gap-4">
                <span className="text-xl font-black" style={{ color: theme.priceColor }}>BDT 4,500</span>
                <span className="text-sm font-bold text-gray-300 line-through">BDT 9,000</span>
                <span className="bg-green-500 text-white px-2 py-0.5 text-[10px] font-black">50% OFF</span>
             </div>

             <p className="text-[11px] font-bold text-gray-400 leading-relaxed uppercase">
                Premium high-tech smart watch with 1.9 inch AMOLED display, health sensors, and global connectivity. 
             </p>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: theme.borderColor }}>
                <button 
                  className={`w-full py-4 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${theme.buttonHoverZoom ? 'hover:scale-105 active:scale-95' : ''}`}
                  style={{ backgroundColor: theme.buttons.addToCart.bg, color: theme.buttons.addToCart.textColor, borderRadius: theme.buttons.addToCart.radius }}
                >
                  ADD TO CART
                </button>
                <button 
                  className={`w-full py-4 text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${theme.buttonHoverZoom ? 'hover:scale-105 active:scale-95' : ''}`}
                  style={{ backgroundColor: theme.buttons.buyNow.bg, color: theme.buttons.buyNow.textColor, borderRadius: theme.buttons.buyNow.radius }}
                >
                  BUY NOW
                </button>
             </div>
          </div>
       </div>
    </div>
  );
}

function ButtonPanelPreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="p-12 space-y-12 min-h-full bg-gray-50/50">
       <h3 className="text-xs font-black uppercase tracking-widest text-black border-b border-gray-100 pb-3">Website Action Buttons</h3>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {Object.entries(theme.buttons).map(([key, config]) => (
            <div key={key} className="space-y-4 p-8 bg-white border border-[#EEEEEE] shadow-sm text-center">
               <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-6">{key.replace(/([A-Z])/g, ' $1')} Style</p>
               <button 
                className={`px-10 py-5 text-sm font-black uppercase tracking-widest shadow-2xl transition-all mx-auto block ${theme.buttonHoverZoom ? 'hover:scale-110 active:scale-90' : ''}`}
                style={{ backgroundColor: config.bg, color: config.textColor, borderRadius: `${config.radius}px`, boxShadow: config.shadow, border: config.borderColor !== 'transparent' ? `2px solid ${config.borderColor}` : 'none' }}
               >
                  {key.toUpperCase()} BUTTON
               </button>
               <div className="mt-8 flex justify-center gap-4">
                  <div className="text-[8px] font-black text-gray-300 uppercase">Shadow: {config.shadow !== 'none' ? 'Active' : 'Off'}</div>
                  <div className="text-[8px] font-black text-gray-300 uppercase">Zoom: {theme.buttonHoverZoom ? 'On' : 'Off'}</div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}

function FooterPreview({ theme }: { theme: ThemeConfig }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center">
       <footer className="w-full h-full p-20 text-center space-y-12" style={{ backgroundColor: theme.footerBg, color: theme.footerText }}>
          <div className="space-y-4">
             <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: theme.footerText, fontFamily: theme.headingFont }}>TAZU MART</h2>
             <p className="max-w-md mx-auto text-[10px] font-bold uppercase tracking-widest opacity-60 leading-relaxed">
                Premium E-commerce experience with curated collections for the modern lifestyle. Fast delivery and global support.
             </p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 text-[11px] font-black uppercase tracking-[0.2em]">
             {['Categories', 'Flash Sale', 'Account', 'Order Logs', 'Support'].map(link => (
                <span key={link} className="hover:scale-110 transition-transform cursor-pointer" style={{ color: theme.footerLinkColor }}>{link}</span>
             ))}
          </div>

          <div className="flex justify-center gap-8 border-t border-white/10 pt-12">
             {[Smartphone, Heart, Zap, Shield].map((Icon, idx) => (
                <div key={idx} className="w-12 h-12 bg-white/5 flex items-center justify-center transition-colors group cursor-pointer">
                   <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" style={{ color: theme.footerIconColor }} />
                </div>
             ))}
          </div>

          <div className="space-y-2 pt-8 opacity-40">
             <p className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af]">Powered by Admin Dashboard Pro</p>
             <p className="text-[8px] font-bold uppercase tracking-widest">© 2026 TAZU MART GLOBAL LLC. ALL RIGHTS RESERVED.</p>
          </div>
       </footer>
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
