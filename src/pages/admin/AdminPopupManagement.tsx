import React, { useState } from 'react';
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  Eye, 
  Calendar, 
  Clock, 
  Layout, 
  Type, 
  MousePointer, 
  Settings, 
  X, 
  AlertTriangle,
  Flame,
  Check,
  Smartphone,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';
import { usePopupStore, getPopupStatus, PopupConfig } from '../../store/usePopupStore';
import { useProductStore } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';

// Common event lists matching instructions
const numberCampaigns = [
  '1.1', '2.2', '3.3', '4.4', '5.5', '6.6', '7.7', '8.8', '9.9', '10.10', '11.11', '12.12'
];

const eventCampaigns = [
  'Eid Sale', 'Eid Mega Sale', 'Ramadan Offer', 'Pohela Boishakh', 'Victory Day',
  'Independence Day', 'New Year Sale', 'Flash Sale', 'Weekly Sale', 'Monthly Sale',
  'Summer Sale', 'Winter Sale', 'Couple Day', 'Black Friday', 'Cyber Monday',
  'Mega Campaign', 'Anniversary Sale', 'Store Launch Offer', 'Limited Time Offer',
  'Special Offer', 'Exclusive Deal', 'Clearance Sale', 'Hot Deal', 'Festival Sale',
  'Mega Discount'
];

// Presets for gorgeous banners to make customization effortless and high fidelity
const bannerPresets = [
  { name: 'Red Sneakers Shoe Campaign', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600' },
  { name: 'Gold Perfume Elegance Class', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
  { name: 'Vibrant Cosmetics Spray', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600' },
  { name: 'Premium Leather Wallets', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600' },
  { name: 'Smart Gadget Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600' }
];

export default function AdminPopupManagement() {
  const { popupCampaigns, addPopupCampaign, updatePopupCampaign, deletePopupCampaign, resetPopupCampaigns } = usePopupStore();
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  const [activeTab, setActiveTab] = useState<'listings' | 'form'>('listings');
  
  // Create / Edit active working state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PopupConfig, 'id'>>({
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endTime: '23:59',
    campaignType: 'EVENT',
    campaignValue: 'Eid Mega Sale',
    templateId: '1',
    bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    title: 'WELCOME EID MEGA SALE FLAT 50% OFF',
    titleFontSize: 24,
    discountLabel: 'FLAT OFF',
    discountPercentage: '50%',
    subtitle: 'ON YOUR FIRST ORDER TODAY',
    subtitleFontSize: 12,
    buttonText: 'CLAIM OFFER NOW',
    buttonUrl: '',
    buttonStyle: 'luxury-gradient',
    secondaryButtonText: 'LEARN MORE',
    secondaryButtonUrl: '',
    selectedProducts: [],
    selectedCategories: [],
    displayDuration: 2,
    displayOrder: 1,
    showOncePerUser: false,
    showEveryVisit: true,
    showAfter3Seconds: false,
    showAfterScroll: false,
    showOnlyHomepage: true,
    closeButtonVisible: true,
    backgroundDarkOverlay: true,
    clickOutsideToClose: true,
    autoCloseAfterXSeconds: false,
    entranceAnimation: 'Fade In'
  });

  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  
  const [customCampaign, setCustomCampaign] = useState('');
  const [customDiscount, setCustomDiscount] = useState('');
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  
  // Form error notification
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  // Filter products matching search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filter categories matching search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Mock status computed from edit/creation formData
  const mockCalculatedStatus = getPopupStatus(formData as unknown as PopupConfig);
  const mockupBtnStyleClasses = {
    'solid-black': 'bg-black text-white border-transparent',
    'solid-accent': 'bg-red-600 text-white border-transparent',
    'luxury-gradient': 'bg-gradient-to-r from-amber-500 to-amber-700 text-white border-transparent',
    'minimal-outline': 'bg-transparent text-black border-black border-2',
    'glass-translucent': 'bg-white/20 border-white/30 text-white'
  };
  const mockBtnClass = mockupBtnStyleClasses[formData.buttonStyle] || mockupBtnStyleClasses['luxury-gradient'];

  const getStatusBadge = (popup: PopupConfig) => {
    const calculatedStatus = getPopupStatus(popup);
    switch (calculatedStatus) {
      case 'ACTIVE':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-250">🟢 Active</span>;
      case 'EXPIRED':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-750 border border-rose-200">🔴 Expired</span>;
      case 'SCHEDULED':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-250">🟡 Scheduled</span>;
      case 'DISABLED':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-550 border border-zinc-200">⚫ Disabled</span>;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'titleFontSize' || name === 'subtitleFontSize' || name === 'displayDuration' || name === 'displayOrder' ? Number(value) : value 
      }));
    }
  };

  // Toggle products target selection
  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const exists = prev.selectedProducts.includes(productId);
      const nextProducts = exists 
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId];
      return { ...prev, selectedProducts: nextProducts };
    });
  };

  // Toggle category target selection
  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const exists = prev.selectedCategories.includes(categoryId);
      const nextCategories = exists
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId];
      return { ...prev, selectedCategories: nextCategories };
    });
  };

  const handleTriggerCreateNew = () => {
    setEditingId(null);
    setFormData({
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endTime: '23:59',
      campaignType: 'EVENT',
      campaignValue: 'Flash Sale',
      templateId: '1',
      bannerUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
      title: 'SPECIAL BUNDLE EVENT DISCOUNT',
      titleFontSize: 24,
      discountLabel: 'FLAT OFF',
      discountPercentage: '10%',
      subtitle: 'VALID FOR 24 HOURS ONLY',
      subtitleFontSize: 12,
      buttonText: 'SHOP EXCLUSIVES',
      buttonUrl: '',
      buttonStyle: 'solid-black',
      secondaryButtonText: 'LEARN MORE',
      secondaryButtonUrl: '',
      selectedProducts: [],
      selectedCategories: [],
      displayDuration: 2,
      displayOrder: 1,
      showOncePerUser: false,
      showEveryVisit: true,
      showAfter3Seconds: false,
      showAfterScroll: false,
      showOnlyHomepage: true,
      closeButtonVisible: true,
      backgroundDarkOverlay: true,
      clickOutsideToClose: true,
      autoCloseAfterXSeconds: false,
      entranceAnimation: 'Fade In'
    });
    setProductSearch('');
    setCategorySearch('');
    setCustomCampaign('');
    setCustomDiscount('');
    setCustomBannerUrl('');
    setErrorMessage(null);
    setActiveTab('form');
  };

  const handleTriggerEdit = (popup: PopupConfig) => {
    setEditingId(popup.id);
    // Destructure of p instance to formData
    const { id, ...rest } = popup;
    setFormData(rest);
    setProductSearch('');
    setCategorySearch('');
    setCustomCampaign('');
    setCustomDiscount('');
    setCustomBannerUrl('');
    setErrorMessage(null);
    setActiveTab('form');
  };

  const handleSave = async () => {
    setErrorMessage(null);

    // 1. Mandatory Validations
    if (!formData.title.trim()) {
      setErrorMessage("Popup Title cannot be empty. Please specify a gorgeous display title.");
      return;
    }

    if (!formData.bannerUrl.trim()) {
      setErrorMessage("Banner Image URL is required. Choose a preset or paste a custom Unsplash image link.");
      return;
    }

    // "Empty popup validation: Popup cannot save without title, image, product OR category selected"
    const hasProducts = formData.selectedProducts && formData.selectedProducts.length > 0;
    const hasCategories = formData.selectedCategories && formData.selectedCategories.length > 0;
    if (!hasProducts && !hasCategories) {
      setErrorMessage("Empty popup validation: You must check at least one Product OR Category under 'Popup Targeting System' to map the conversion flow.");
      return;
    }

    try {
      // 2. Commit transaction
      if (editingId) {
        await updatePopupCampaign(editingId, { ...formData, id: editingId });
      } else {
        await addPopupCampaign(formData);
      }

      setShowSaveAlert(true);
      setTimeout(() => {
        setShowSaveAlert(false);
        setActiveTab('listings');
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Failed to save popup campaign. Please verify connection and try again.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the popup campaign "${name}"? This action cannot be undone.`)) {
      try {
        await deletePopupCampaign(id);
      } catch (err) {
        console.error("Error deleting campaign:", err);
      }
    }
  };

  const handleResetSystem = async () => {
    if (window.confirm('WARNING: Are you sure you want to reset all popup campaigns back to system presets? This will delete your custom popups.')) {
      try {
        await resetPopupCampaigns();
      } catch (err) {
        console.error("Error resetting campaigns:", err);
      }
    }
  };

  const templatesList = [
    { id: '1', title: 'Center Poster', desc: 'Full height premium poster suited for major discounts.' },
    { id: '2', title: 'Side Float', desc: 'Compact bottom corner teaser that does not block core UI.' },
    { id: '3', title: 'Rounded Circle', desc: 'Chic circular crop suited for luxury beauty products.' },
    { id: '4', title: 'Luxury Gold-Black', desc: 'Prestige look with gold lining accents.' },
    { id: '5', title: 'Glassmorphism Blur', desc: 'Frosted modern overlay optimized for dark sites.' },
    { id: '6', title: 'Festival Banner', desc: 'Vibrant celebratory borders matching South Asian holidays.' },
    { id: '7', title: 'Minimal Line Art', desc: 'Monochrome, heavy typewriter headers and fine black wireframe edges.' },
    { id: '8', title: 'Vaporwave Ambient', desc: 'Moving colorful spectrum accents.' },
    { id: '9', title: 'Charcoal Glow', desc: 'Solid sleek dark metal layout.' },
    { id: '10', title: 'Daraz Mega Fire', desc: 'Bright orange grids optimized for ecommerce mobile sliders.' }
  ];

  const buttonStyleLabels = {
    'solid-black': 'Solid Dark Black (Contrast)',
    'solid-accent': 'Vibrant Red Accent',
    'luxury-gradient': 'Premium Amber Luxury Gradient',
    'minimal-outline': 'Monochrome Wire Outline',
    'glass-translucent': 'Frosted Translucent Glass'
  };

  const animationTypes = [
    'Fade In', 'Zoom In', 'Slide Up', 'Bounce', 'Scale Pop', 'Rotate Fade'
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-16">
      
      {/* 1. Header Control block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-black text-black uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 fill-purple-600/10" /> Popup Campaign Management
          </h2>
          <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-wider">
            Deploy conversion boosters, welcome offers, and scheduled rotation slides dynamically.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {activeTab === 'listings' ? (
            <button
              onClick={handleTriggerCreateNew}
              className="flex items-center justify-center gap-2 bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-none transition-all w-full md:w-auto"
            >
              <Plus className="w-4 h-4" /> [ + Add Popup ]
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('listings')}
              className="flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-black font-black text-xs uppercase tracking-widest px-4 py-3 rounded-none transition-all w-full md:w-auto"
            >
              Back to List ({popupCampaigns.length})
            </button>
          )}

          <button
            onClick={handleResetSystem}
            title="Reset to factory preset popups"
            className="p-3 text-gray-400 hover:text-red-605 bg-gray-50 border border-gray-100 hover:bg-gray-100"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSaveAlert && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 text-emerald-800 text-xs font-black uppercase tracking-widest text-center animate-pulse">
          🎉 Popup saved successfully! Customer storefront updated instantly live!
        </div>
      )}

      {/* TAB 1: listings Grid */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 p-6 shadow-sm">
            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-4 border-b pb-2">
              ACTIVE POPUP SEQUENCE OVERVIEW ({popupCampaigns.length} campaigns)
            </h3>
            
            {popupCampaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-neutral-350" />
                <p className="text-sm uppercase font-black tracking-widest">No Popup campaigns created yet</p>
                <p className="text-xs font-medium text-gray-505 mt-1">Click the Add Popup button to design your first conversion card.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popupCampaigns.map((popup, index) => {
                  const status = getPopupStatus(popup);
                  const targetsProducts = popup.selectedProducts?.length || 0;
                  const targetsCategories = popup.selectedCategories?.length || 0;

                  return (
                    <div key={popup.id} className="border border-neutral-100 hover:border-neutral-350 transition-all bg-white flex flex-col justify-between">
                      {/* Thumbnail Header */}
                      <div className="relative h-28 bg-neutral-900 overflow-hidden">
                        {popup.bannerUrl ? (
                          <img src={popup.bannerUrl} alt={popup.title} className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-stone-900 to-black flex items-center justify-center text-xs font-mono uppercase text-gray-500">No Image</div>
                        )}
                        <div className="absolute top-2.5 left-2.5">
                          {getStatusBadge(popup)}
                        </div>
                        <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white px-2 py-0.5 font-bold rounded-sm">
                          Index: #{index + 1}
                        </div>
                        <div className="absolute bottom-2 left-2.5 text-xs text-white font-black uppercase tracking-widest line-clamp-1 bg-black/40 px-1 py-0.5">
                          {popup.campaignValue}
                        </div>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-3 flex-1">
                        <div>
                          <h4 className="font-serif text-black font-black text-sm uppercase group-hover:text-amber-700 line-clamp-1">
                            {popup.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                            Template: {templatesList.find(t => t.id === popup.templateId)?.title || `Template ${popup.templateId}`} • Dur: {popup.displayDuration}s
                          </p>
                        </div>

                        {/* Targeting Indicators */}
                        <div className="space-y-1.5 border-t pt-2.5">
                          <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Target Conditions:</p>
                          <div className="flex flex-wrap gap-1">
                            {targetsCategories > 0 && (
                              <span className="bg-purple-50 text-purple-750 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-purple-200">
                                📂 {targetsCategories} Categories
                              </span>
                            )}
                            {targetsProducts > 0 && (
                              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-emerald-200">
                                🛒 {targetsProducts} Products
                              </span>
                            )}
                            {targetsProducts === 0 && targetsCategories === 0 && (
                              <span className="bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border border-red-200 animate-pulse">
                                ⚠️ No Target Map!
                              </span>
                            )}
                          </div>
                          
                          {/* Selected targeting value names snippet */}
                          <p className="text-[10px] text-neutral-500 font-medium line-clamp-1 tracking-tight">
                            {targetsCategories > 0 && categories.filter(c => popup.selectedCategories.includes(c.id)).map(c => c.name).join(', ')}
                            {targetsProducts > 0 && targetsCategories > 0 && ' | '}
                            {targetsProducts > 0 && products.filter(p => popup.selectedProducts.includes(p.id)).map(p => p.name).join(', ')}
                          </p>
                        </div>

                        {/* Timing Block */}
                        <div className="text-[9px] text-gray-405 font-mono uppercase tracking-wider space-y-0.5">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-neutral-400" /> Start: {popup.startDate} ({popup.startTime})
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" /> Ends: {popup.endDate} ({popup.endTime})
                          </div>
                        </div>
                      </div>

                      {/* Action trigger footer */}
                      <div className="bg-gray-50 border-t flex divide-x text-center text-xs">
                        <button
                          type="button"
                          onClick={() => handleTriggerEdit(popup)}
                          className="flex-1 py-3 hover:bg-neutral-105 text-black hover:text-neutral-900 font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(popup.id, popup.title)}
                          className="flex-1 py-3 hover:bg-red-50 text-red-650 hover:text-red-700 font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}


      {/* TAB 2: Dynamic Creator / Edit Form Panel */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Complete Setup parameters (Form configuration cols 7) */}
          <div className="lg:col-span-7 space-y-6">

            {errorMessage && (
              <div className="bg-red-50 border border-red-250 p-4 text-red-800 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> {errorMessage}
              </div>
            )}

            {/* A. Info header */}
            <div className="bg-white p-5 border border-gray-150 shadow-xs">
              <span className="bg-purple-600 text-white font-black text-[9px] uppercase px-2.5 py-1 tracking-widest mb-2 inline-block">
                {editingId ? "Currently Editing Active Popup" : "New Popup Campaign Designer"}
              </span>
              <h3 className="text-base font-black text-black uppercase tracking-wider mt-1">
                {editingId ? `Customize Campaign Settings [${editingId}]` : "Enter Conversion Campaign Mechanics"}
              </h3>
            </div>

            {/* SECTION 1: Popup Status & Timing Schedulers */}
            <div className="bg-white border border-gray-150 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b pb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-purple-600" /> 1. Timeline & Rotation Timer
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Campaign Status Mode</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-black text-xs font-black uppercase p-2.5 focus:border-stone-400 focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Joins Active Storefront Rotation)</option>
                    <option value="DISABLED">DISABLED (Hidden Completely)</option>
                  </select>
                </div>

                <div className="bg-purple-50/30 p-3.5 border border-purple-100/50 rounded-sm">
                  <label className="block text-[10px] font-black text-purple-900 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <RotateCcw className="w-3 h-3" /> POPUP ROTATION (DURATION & SEQUENCE-ORDER)
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">Display Duration</span>
                      <div className="relative">
                        <input
                          type="number"
                          name="displayDuration"
                          min="1"
                          max="30"
                          value={formData.displayDuration}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 text-xs font-black p-2.5 focus:border-purple-400 focus:outline-none pr-10 bg-white"
                        />
                        <span className="absolute right-2 top-2.5 text-[8px] font-black text-gray-400">SEC</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">Display Order</span>
                      <input
                        type="number"
                        name="displayOrder"
                        min="1"
                        value={formData.displayOrder || 1}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 text-xs font-black p-2.5 focus:border-purple-400 focus:outline-none bg-white"
                        placeholder="e.g. 1, 2, 3"
                      />
                    </div>
                  </div>
                  <p className="text-[8px] text-purple-600/70 font-bold uppercase tracking-wider mt-2.5 px-0.5">Controls visibility duration & sequential order of popups</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-xs p-2 focus:border-stone-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-xs p-2 focus:border-stone-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-xs p-2 focus:border-stone-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-xs p-2 focus:border-stone-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ADVANCED TARGETING SYSTEM (Required - Products or Categories selected) */}
            <div className="bg-white border border-gray-150 p-5 shadow-xs space-y-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b pb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><MousePointer className="w-4 h-4 text-purple-600" /> 2. Popup Targeting System</span>
                <span className="text-[9px] bg-red-50 text-red-650 px-2.0 py-0.5 border border-red-200 normal-case font-bold font-mono">Mandatory condition mapping</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Product Mapping column */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10.5px] font-black text-neutral-800 uppercase tracking-wider">A. Target Products ({formData.selectedProducts.length} selected)</label>
                    {formData.selectedProducts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, selectedProducts: [] }))}
                        className="text-[9px] text-red-650 font-black tracking-wider uppercase hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search box for products */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search items SKU or name..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full border border-gray-200 text-xs pl-8 pr-3 py-2.5 focus:outline-none focus:border-neutral-400"
                    />
                  </div>

                  {/* Filtered list height limits scrollable */}
                  <div className="border border-neutral-100 divide-y divide-neutral-50 max-h-[180px] overflow-y-auto bg-neutral-50 px-2 py-1">
                    {filteredProducts.length === 0 ? (
                      <p className="text-[11px] text-gray-400 text-center py-6">No matching products found.</p>
                    ) : (
                      filteredProducts.map(p => {
                        const isChecked = formData.selectedProducts.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleProductToggle(p.id)}
                            className="flex items-center gap-2 py-2 px-1 text-xs cursor-pointer hover:bg-white select-none transition-all"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-300 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-neutral-800 line-clamp-1 leading-snug">{p.name}</p>
                              <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">{p.sku} | Price: ${p.price}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Category Mapping column */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10.5px] font-black text-neutral-800 uppercase tracking-wider">B. Target Categories ({formData.selectedCategories.length} selected)</label>
                    {formData.selectedCategories.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, selectedCategories: [] }))}
                        className="text-[9px] text-red-650 font-black tracking-wider uppercase hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search box for categories */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full border border-gray-200 text-xs pl-8 pr-3 py-2.5 focus:outline-none focus:border-neutral-400"
                    />
                  </div>

                  {/* Filtered category list checkboxes */}
                  <div className="border border-neutral-100 divide-y divide-neutral-50 max-h-[180px] overflow-y-auto bg-neutral-50 px-2 py-1">
                    {filteredCategories.length === 0 ? (
                      <p className="text-[11px] text-gray-400 text-center py-6">No matching categories found.</p>
                    ) : (
                      filteredCategories.map(c => {
                        const isChecked = formData.selectedCategories.includes(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleCategoryToggle(c.id)}
                            className="flex items-center gap-2.5 py-2 px-1 text-xs cursor-pointer hover:bg-white select-none transition-all"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-purple-650 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-350 shrink-0" />
                            )}
                            <div>
                              <p className="font-bold text-neutral-850">{c.name}</p>
                              <p className="text-[8.5px] text-neutral-400 font-mono tracking-wider">SLUG: {c.slug}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* Status checklist warnings */}
              <div className="p-3 bg-purple-50/50 border border-purple-100 max-w-full text-[11px] leading-relaxed text-purple-900 rounded-sm">
                <span className="font-black">💡 REDIRECT TARGET TRACE SYSTEM:</span> If product targets are mapped, clicking the popup CTA button redirects customer to <strong>Product Details Page</strong>. If only categories are mapped, clicking points they directly to select <strong>Category Page</strong>. Product targeting takes landing page priority.
              </div>
            </div>

            {/* SECTION 3: Design Presets, Presets, Image Banner */}
            <div className="bg-white border border-gray-150 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b pb-1.5 flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-purple-600" /> 3. Structural template & Visuals
              </h4>

              {/* Image Presets Selection */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Interactive Preset Banners</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {bannerPresets.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bannerUrl: preset.url }))}
                      className={`relative aspect-video rounded-none overflow-hidden hover:scale-105 transition-all text-left group border ${formData.bannerUrl === preset.url ? 'ring-2 ring-purple-600 border-transparent' : 'border-gray-100'}`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors"></div>
                      <span className="absolute bottom-1 left-1.5 text-[8px] font-black uppercase tracking-wider text-white line-clamp-1 bg-black/60 px-1 py-0.5 max-w-[90%]">
                        Preset {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL Entry */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Or paste custom Image Banner URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="bannerUrl"
                    value={formData.bannerUrl}
                    onChange={handleInputChange}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 border border-gray-200 text-xs p-2.5 focus:border-stone-400 focus:outline-none"
                  />
                  {formData.bannerUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bannerUrl: '' }))}
                      className="px-3 border border-gray-200 text-xs font-bold text-gray-400 hover:text-red-700"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Template Selectors */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Campaign Structure Layout Template</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {templatesList.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, templateId: tmpl.id }))}
                      className={`p-3 text-center border transition-all text-left flex flex-col justify-between h-20 group rounded-none select-none ${formData.templateId === tmpl.id ? 'border-neutral-900 bg-neutral-950 text-white' : 'border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-250'}`}
                    >
                      <span className="text-[10px] font-mono text-gray-400 font-bold tracking-widest block uppercase">#{tmpl.id}</span>
                      <p className={`text-[11px] font-black uppercase leading-snug line-clamp-1 mt-1 ${formData.templateId === tmpl.id ? 'text-[#D4AF37]' : 'text-neutral-900'}`}>{tmpl.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4: TEXTS, DISCOUNT VOUCHERS AND CAPMGAINS */}
            <div className="bg-white border border-gray-150 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b pb-1.5 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-purple-600" /> 4. Typography Content Setting
              </h4>

              {/* Campaign / Event Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Campaign Event Scope</label>
                  <div className="flex gap-2.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, campaignType: 'EVENT' }))}
                      className={`flex-1 py-1 px-3 text-[10px] font-black uppercase tracking-wider border rounded-sm ${formData.campaignType === 'EVENT' ? 'bg-indigo-900 text-white border-transparent' : 'bg-white text-black border-zinc-200'}`}
                    >
                      Seasonal Events
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, campaignType: 'NUMBER' }))}
                      className={`flex-1 py-1 px-3 text-[10px] font-black uppercase tracking-wider border rounded-sm ${formData.campaignType === 'NUMBER' ? 'bg-indigo-900 text-white border-transparent' : 'bg-white text-black border-zinc-200'}`}
                    >
                      Numerical Sale (11.11)
                    </button>
                  </div>
                  
                  <select
                    name="campaignValue"
                    value={formData.campaignValue}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-xs p-2.5 pr-8 focus:border-stone-400 focus:outline-none uppercase font-bold"
                  >
                    {(formData.campaignType === 'EVENT' ? eventCampaigns : numberCampaigns).map(val => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>

                {/* Custom Campaign Overwrite */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Custom Event Name Overrule</label>
                  <div className="flex gap-2 mt-[34px]">
                    <input
                      type="text"
                      placeholder="e.g. Ramadan Super Save"
                      value={customCampaign}
                      onChange={(e) => setCustomCampaign(e.target.value)}
                      className="flex-1 border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-neutral-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customCampaign.trim()) {
                          setFormData(prev => ({ ...prev, campaignValue: customCampaign }));
                          setCustomCampaign('');
                        }
                      }}
                      className="px-3 bg-neutral-900 text-white text-[10px] uppercase font-black tracking-wider"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Title & Underlines */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Promotion Title Name</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="WELCOME HOLIDAYS FLAT OFF"
                    className="w-full border border-gray-200 text-xs font-bold p-2.5 focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10.5px] font-black text-gray-400 uppercase tracking-widest mb-1">Title Font Size: {formData.titleFontSize}px</label>
                  <input
                    type="range"
                    name="titleFontSize"
                    min="14"
                    max="36"
                    value={formData.titleFontSize}
                    onChange={handleInputChange}
                    className="w-full accent-neutral-805 mt-3.5"
                  />
                </div>
              </div>

              {/* Subtitles details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Promotion Text Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-neutral-400"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10.5px] font-black text-gray-400 uppercase tracking-widest mb-1">Sub Font Size: {formData.subtitleFontSize}px</label>
                  <input
                    type="range"
                    name="subtitleFontSize"
                    min="10"
                    max="22"
                    value={formData.subtitleFontSize}
                    onChange={handleInputChange}
                    className="w-full accent-neutral-805 mt-3.5"
                  />
                </div>
              </div>

              {/* Voucher Values Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Offer Discount Value (e.g. 50%)</label>
                  <input
                    type="text"
                    name="discountPercentage"
                    placeholder="e.g. 50% or $20"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 font-black text-red-655 text-xs p-2.5 focus:outline-none focus:border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Offer Promo Label (e.g. FLAT OFF)</label>
                  <input
                    type="text"
                    name="discountLabel"
                    placeholder="e.g. FLAT OFF / STORE VOUCHER"
                    value={formData.discountLabel}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-neutral-300"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: CTA BUTTONS, CONTROLS */}
            <div className="bg-white border border-gray-150 p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 border-b pb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-purple-600" /> 5. Call To Action (CTA) & Interaction settings
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-sm space-y-3">
                  <span className="text-[10px] font-black text-neutral-800 uppercase tracking-widest border-b pb-1 block">Left Action - Secondary</span>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Button Text</label>
                    <input
                      type="text"
                      name="secondaryButtonText"
                      value={formData.secondaryButtonText}
                      onChange={handleInputChange}
                      placeholder="e.g. LEARN MORE"
                      className="w-full border border-gray-200 text-[10px] font-black p-2.5 focus:outline-none focus:border-neutral-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Redirect URL</label>
                    <input
                      type="text"
                      name="secondaryButtonUrl"
                      value={formData.secondaryButtonUrl}
                      onChange={handleInputChange}
                      placeholder="/about"
                      className="w-full border border-gray-200 text-xs p-2.5 focus:outline-none focus:border-neutral-300"
                    />
                  </div>
                </div>

                <div className="bg-neutral-900 p-4 border border-neutral-800 rounded-sm space-y-3 text-white">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-1 block">Center Action - Primary</span>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Button Text</label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      placeholder="e.g. SHOP NOW"
                      className="w-full border border-neutral-700 bg-neutral-800 text-white text-[10px] font-black p-2.5 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Redirect URL</label>
                    <input
                      type="text"
                      name="buttonUrl"
                      value={formData.buttonUrl}
                      onChange={handleInputChange}
                      placeholder="/shop"
                      className="w-full border border-neutral-700 bg-neutral-800 text-white text-xs p-2.5 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Primary Button Style Theme (Global Mockup)</label>
                <select
                  name="buttonStyle"
                  value={formData.buttonStyle}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 text-xs font-bold p-2.5 pr-8 focus:outline-none focus:border-neutral-300"
                >
                  {Object.entries(buttonStyleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Auto Expire closing and triggers settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                
                {/* Triggers preferences lists */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-neutral-800 uppercase tracking-widest mb-2 border-b pb-0.5">🚀 Trigger Rules & Visibility</span>
                  
                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="showOnlyHomepage"
                      checked={formData.showOnlyHomepage}
                      onChange={handleInputChange}
                      className="rounded text-purple-600 focus:ring-purple-600 focus:outline-none accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px]">Restrict Only to Homepage</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="showOncePerUser"
                      checked={formData.showOncePerUser}
                      onChange={handleInputChange}
                      className="rounded text-purple-600 focus:ring-purple-600 focus:outline-none accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px]">Show Once per session</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="showEveryVisit"
                      checked={formData.showEveryVisit}
                      onChange={handleInputChange}
                      className="rounded text-purple-600 focus:ring-purple-600 focus:outline-none accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px]">Show every page visit</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="showAfter3Seconds"
                      checked={formData.showAfter3Seconds}
                      onChange={handleInputChange}
                      disabled={formData.showAfterScroll}
                      className="rounded text-purple-600 focus:ring-purple-600 focus:outline-none accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px] disabled:opacity-50">Trigger Delay by 3 seconds</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="showAfterScroll"
                      checked={formData.showAfterScroll}
                      onChange={handleInputChange}
                      disabled={formData.showAfter3Seconds}
                      className="rounded text-purple-600 focus:ring-purple-600 focus:outline-none accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px] disabled:opacity-50">Show only past 300px Scroll</span>
                  </label>
                </div>

                {/* Closing rules list */}
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-neutral-800 uppercase tracking-widest mb-2 border-b pb-0.5">🔒 Closing & Entrance Controls</span>
                  
                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="closeButtonVisible"
                      checked={formData.closeButtonVisible}
                      onChange={handleInputChange}
                      className="rounded focus:ring-purple-600 accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px]">Show exit Close Button (X)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="backgroundDarkOverlay"
                      checked={formData.backgroundDarkOverlay}
                      onChange={handleInputChange}
                      className="rounded focus:ring-purple-600 accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px]">Enable Dim Dark Background Overlay</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="clickOutsideToClose"
                      checked={formData.clickOutsideToClose}
                      onChange={handleInputChange}
                      className="rounded focus:ring-purple-600 accent-purple-605"
                    />
                    <span className="font-bold text-neutral-800 uppercase text-[10.5px]">Click outside backdrop to Close</span>
                  </label>

                  {/* Auto Close Overlay System after all finish */}
                  <label className="flex items-center gap-2 text-xs select-none cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoCloseAfterXSeconds"
                      checked={formData.autoCloseAfterXSeconds}
                      onChange={handleInputChange}
                      className="rounded focus:ring-purple-600 accent-purple-605"
                    />
                    <span className="font-black text-purple-900 uppercase text-[10.5px]">Auto Close rotation after play ends</span>
                  </label>

                  <div>
                    <label className="block text-[10.5px] font-black text-gray-400 uppercase tracking-widest mb-1 mt-1">Entrance Animation Style</label>
                    <select
                      name="entranceAnimation"
                      value={formData.entranceAnimation}
                      onChange={handleInputChange}
                      className="w-full border border-gray-200 text-xs font-bold p-2 focus:outline-none"
                    >
                      {animationTypes.map(anim => (
                        <option key={anim} value={anim}>{anim}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-neutral-900 border-2 border-neutral-900 hover:bg-neutral-850 hover:border-neutral-850 text-white font-black text-xs uppercase tracking-widest py-3.5 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Save className="w-5 h-5" /> {editingId ? "Update Campaign Details" : "Publish Popup Campaign"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Disconnect changes? Any unsaved edits will be discarded.")) {
                    setActiveTab('listings');
                  }
                }}
                className="px-6 border-2 border-neutral-200 hover:border-neutral-400 text-neutral-800 text-xs font-black uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>

          </div>


          {/* RIGHT SIDE: Real-time Premium Mobile Simulator Mockup (cols 5) */}
          <div className="lg:col-span-5 sticky top-6 space-y-4">
            
            {/* Visual Header */}
            <div className="bg-white p-4 border border-gray-150 shadow-xs flex justify-between items-center bg-gradient-to-r from-[#00E5FF]/5 via-purple-100/5 to-white">
              <div>
                <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-600" /> Preview Emulator
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Temu / Daraz Style Mobile Mock</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] bg-black text-white px-2 py-0.5 uppercase tracking-wide font-black">
                Type: {templatesList.find(t => t.id === formData.templateId)?.title}
              </div>
            </div>

            {/* Simulated Smartphone container */}
            <div className="relative mx-auto w-full max-w-[320px] aspect-[9/16] bg-neutral-900 rounded-[44px] border-[8px] border-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-between p-5 select-none">
              
              {/* Speaker & camera slot notches */}
              <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-24 h-4.5 bg-neutral-800 rounded-full z-40 flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-700"></div>
                <div className="w-9 h-1 rounded-full bg-neutral-700"></div>
              </div>

              {/* Status bar details inside mockup */}
              <div className="w-full flex justify-between px-3 pt-2 text-[8px] font-black text-white/50 z-30 tracking-tight font-mono select-none">
                <span>10:58 AM</span>
                <div className="flex gap-1.5 items-center">
                  <span>LTE</span>
                  <span>🔋 99%</span>
                </div>
              </div>

              {/* Dim Dark overlay emulator */}
              {formData.backgroundDarkOverlay && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xxs z-10 transition-all duration-300"></div>
              )}

              {/* Background website mockup mock elements */}
              <div className="absolute inset-0 p-6 pt-12 space-y-4 z-0 opacity-20 text-white/70">
                <div className="h-6 bg-white/20 w-3/4 rounded-sm"></div>
                <div className="h-28 bg-white/10 w-full rounded-sm"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-16 bg-white/10 rounded-sm"></div>
                  <div className="h-16 bg-white/10 rounded-sm"></div>
                </div>
                <div className="h-12 bg-white/20 w-1/2 rounded-sm mx-auto"></div>
              </div>

              {/* THE MOBILE POPUP MOCK INTERACTIVE WRAPPER */}
              <div className="flex-1 w-full flex items-center justify-center z-20">
                
                {/* Visual template mock implementation */}
                <div className={`
                  relative w-full overflow-hidden text-center bg-white shadow-xl transition-all duration-300
                  ${formData.templateId === '3' ? 'rounded-full aspect-square max-w-[220px] flex flex-col justify-center' : ''}
                  ${formData.templateId === '4' ? 'rounded-none border-2 border-[#D4AF37] bg-neutral-950 text-[#D4AF37]' : ''}
                  ${formData.templateId === '5' ? 'rounded-3xl bg-[#171717]/90 text-white' : ''}
                  ${formData.templateId === '7' ? 'rounded-none border-2 border-black text-black' : ''}
                  ${formData.templateId === '9' ? 'rounded-2xl bg-zinc-950 text-white border border-zinc-900' : ''}
                  ${formData.templateId === '10' ? 'rounded-2xl bg-[#f57224] text-white' : 'rounded-2xl'}
                `}>
                  
                  {/* Close button placement */}
                  {formData.closeButtonVisible && (
                    <button type="button" className={`absolute top-2 right-2 p-1 rounded-full text-[9px] ${formData.templateId === '4' ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : formData.templateId === '5' || formData.templateId === '9' || formData.templateId === '10' ? 'bg-white/10 text-white' : 'bg-neutral-100 text-[#171717]'}`}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}

                  {/* Render template visual block details */}
                  {(() => {
                    const btnStyleClasses = {
                      'solid-black': 'bg-black text-white border-transparent',
                      'solid-accent': 'bg-red-600 text-white border-transparent',
                      'luxury-gradient': 'bg-gradient-to-r from-amber-500 to-amber-700 text-white border-transparent',
                      'minimal-outline': 'bg-transparent text-black border-black border-2',
                      'glass-translucent': 'bg-white/20 border-white/30 text-white'
                    };
                    const btnClass = btnStyleClasses[formData.buttonStyle] || btnStyleClasses['luxury-gradient'];
                    const bannerUrl = formData.bannerUrl;

                    switch (formData.templateId) {
                      case '1':
                        return (
                          <div className="text-center">
                            {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-20 object-cover" />}
                            <div className="p-3">
                              <span className="text-[7.5px] bg-red-100 text-red-600 font-extrabold uppercase px-1.5 py-0.5 rounded-full mb-1 inline-flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 text-red-500 fill-red-500" /> {formData.campaignValue}
                              </span>
                              <h5 className="font-serif font-black uppercase tracking-tight text-neutral-900 text-xs leading-tight mb-1" style={{ fontSize: `${formData.titleFontSize * 0.45}px` }}>{formData.title}</h5>
                              <div className="text-red-600 font-extrabold text-base">{formData.discountPercentage} {formData.discountLabel}</div>
                              <p className="text-zinc-500 text-[8.5px] leading-tight uppercase max-w-[90%] mx-auto mt-0.5" style={{ fontSize: `${formData.subtitleFontSize * 0.75}px` }}>{formData.subtitle}</p>
                            </div>
                          </div>
                        );

                      case '2':
                        return (
                          <div className="p-3 text-center">
                            <span className="text-[7px] text-zinc-400 font-black tracking-widest uppercase block mb-1">★ {formData.campaignValue} ★</span>
                            {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-14 rounded-lg object-cover mb-1.5" />}
                            <h5 className="font-sans font-black text-[10px] uppercase text-black" style={{ fontSize: `${formData.titleFontSize * 0.4}px` }}>{formData.title}</h5>
                            <div className="text-neutral-900 font-extrabold text-sm mb-1">{formData.discountPercentage} <span className="text-[8px] text-gray-500 font-bold">{formData.discountLabel}</span></div>
                            <p className="text-zinc-400 text-[8px]" style={{ fontSize: `${formData.subtitleFontSize * 0.75}px` }}>{formData.subtitle}</p>
                          </div>
                        );

                      case '3':
                        return (
                          <div className="p-3 text-center flex flex-col items-center justify-center">
                            {bannerUrl && <img src={bannerUrl} alt="" className="w-10 h-10 rounded-full border border-amber-500 object-cover p-0.5 mb-1" />}
                            <h5 className="font-serif font-black text-[9px] text-amber-950 uppercase leading-tight max-w-[140px]" style={{ fontSize: `${formData.titleFontSize * 0.35}px` }}>{formData.title}</h5>
                            <div className="bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg my-1">
                              <span className="text-amber-800 font-black text-xs block">{formData.discountPercentage}</span>
                              <span className="text-amber-500 font-bold text-[6px] tracking-wider block uppercase">{formData.discountLabel}</span>
                            </div>
                            <p className="text-amber-900 text-[7.5px]" style={{ fontSize: `${formData.subtitleFontSize * 0.7}px` }}>{formData.subtitle}</p>
                          </div>
                        );

                      case '4':
                        return (
                          <div className="text-center relative">
                            {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-16 object-cover opacity-60 grayscale" />}
                            <div className="p-3">
                              <span className="text-[7.5px] font-bold block mb-1 text-[#D4AF37] tracking-[0.2em]">⚜️ {formData.campaignValue} ⚜️</span>
                              <h5 className="font-serif font-bold text-white uppercase" style={{ fontSize: `${formData.titleFontSize * 0.42}px` }}>{formData.title}</h5>
                              <div className="text-[#D4AF37] font-serif font-black text-sm my-1">{formData.discountPercentage} {formData.discountLabel}</div>
                              <p className="text-neutral-400 text-[8px] uppercase tracking-wider" style={{ fontSize: `${formData.subtitleFontSize * 0.7}px` }}>{formData.subtitle}</p>
                            </div>
                          </div>
                        );

                      case '5':
                        return (
                          <div className="p-3 text-center">
                            {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-16 rounded-xl object-cover mb-2" />}
                            <span className="bg-white/15 text-white text-[7px] uppercase font-black px-1.5 py-0.5 rounded-full mb-1 inline-block">✨ {formData.campaignValue}</span>
                            <h5 className="font-sans font-black text-[10px] uppercase text-white" style={{ fontSize: `${formData.titleFontSize * 0.4}px` }}>{formData.title}</h5>
                            <div className="text-white font-extrabold text-sm my-0.5">{formData.discountPercentage} <span className="text-white/60 text-[9px]">{formData.discountLabel}</span></div>
                            <p className="text-white/60 text-[7px]" style={{ fontSize: `${formData.subtitleFontSize * 0.7}px` }}>{formData.subtitle}</p>
                          </div>
                        );

                      case '6':
                        return (
                          <div className="p-3 text-center bg-gradient-to-br from-indigo-900 to-zinc-950 border border-yellow-400 text-yellow-300 relative">
                            <span className="text-[7px] tracking-wider block mb-1">★ {formData.campaignValue} ★</span>
                            <h5 className="font-sans font-black text-[10px] uppercase text-white leading-tight" style={{ fontSize: `${formData.titleFontSize * 0.4}px` }}>{formData.title}</h5>
                            <div className="text-yellow-400 font-extrabold text-xs my-1">{formData.discountPercentage} DISCOUNT!</div>
                            <p className="text-indigo-200 text-[7.5px]" style={{ fontSize: `${formData.subtitleFontSize * 0.72}px` }}>{formData.subtitle}</p>
                          </div>
                        );

                      case '7':
                        return (
                          <div className="p-3 text-left border border-black bg-white text-black font-mono">
                            <span className="text-[7.5px] block border-b border-black pb-1 mb-1 font-black">{formData.campaignValue}</span>
                            <h5 className="font-black text-[10.5px] uppercase leading-tight" style={{ fontSize: `${formData.titleFontSize * 0.4}px` }}>{formData.title}</h5>
                            <div className="text-neutral-900 text-base font-extrabold">-{formData.discountPercentage}</div>
                            <p className="text-neutral-500 text-[7.5px]" style={{ fontSize: `${formData.subtitleFontSize * 0.75}px` }}>* {formData.subtitle}</p>
                          </div>
                        );

                      case '8':
                        return (
                          <div className="p-3 text-center bg-zinc-900 border border-purple-500/10 text-white relative">
                            <span className="text-[7px] bg-purple-500 text-white font-bold tracking-widest uppercase px-1 py-0.5 rounded-md mb-1 inline-block">✨ {formData.campaignValue}</span>
                            <h5 className="font-sans font-black text-[10px] text-white leading-tight" style={{ fontSize: `${formData.titleFontSize * 0.42}px` }}>{formData.title}</h5>
                            <div className="text-sm font-black text-purple-400 my-0.5">{formData.discountPercentage}</div>
                            <p className="text-gray-400 text-[7.5px]" style={{ fontSize: `${formData.subtitleFontSize * 0.7}px` }}>{formData.subtitle}</p>
                          </div>
                        );

                      case '9':
                        return (
                          <div className="p-3 text-center bg-zinc-950 border border-zinc-90 w-full flex flex-col items-center">
                            {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-14 rounded-lg object-cover mb-1.5" />}
                            <span className="text-[7px] text-[#00E5FF] tracking-widest font-bold border border-[#00E5FF]/30 px-1 py-0.5 rounded block mb-1">PROMO: {formData.campaignValue}</span>
                            <h5 className="font-serif font-black text-[9.5px] text-white uppercase max-w-[90%]" style={{ fontSize: `${formData.titleFontSize * 0.38}px` }}>{formData.title}</h5>
                            <div className="text-[#00E5FF] font-black text-sm my-0.5">{formData.discountPercentage} {formData.discountLabel}</div>
                            <p className="text-zinc-500 text-[7.5px]" style={{ fontSize: `${formData.subtitleFontSize * 0.7}px` }}>{formData.subtitle}</p>
                          </div>
                        );

                      case '10':
                        return (
                          <div className="text-center bg-[#f57224] text-white w-full">
                            <span className="text-[7px] block bg-black py-0.5 uppercase tracking-widest font-black">🔥 EVENT: {formData.campaignValue}</span>
                            {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-14 object-cover" />}
                            <div className="p-3">
                              <h5 className="font-sans font-black uppercase text-[10px] leading-tight" style={{ fontSize: `${formData.titleFontSize * 0.4}px` }}>{formData.title}</h5>
                              <div className="bg-white text-[#f57224] font-black text-xs py-0.5 rounded border border-dashed border-[#f57224] my-1 font-sans">{formData.discountPercentage} OFF</div>
                              <p className="text-white/85 text-[7px]" style={{ fontSize: `${formData.subtitleFontSize * 0.7}px` }}>{formData.subtitle}</p>
                            </div>
                          </div>
                        );

                      default:
                        return null;
                    }
                  })()}

                  {/* GLOBAL ACTION BAR MOCKUP - 16px below popup */}
                  <div className="mt-4 flex gap-2 w-full">
                    {/* Secondary: Luxury Yellow */}
                    <div className="flex-1 h-10 bg-[#FFD700] rounded-[10px] text-black font-black text-[7px] flex items-center justify-center uppercase truncate px-2 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                      {formData.secondaryButtonText || 'VIEW DEAL'}
                    </div>
                    {/* Primary: Premium Red */}
                    <div className="flex-1 h-10 bg-[#EE0000] text-white rounded-[10px] font-black text-[7px] flex items-center justify-center uppercase truncate px-2 shadow-[0_0_10px_rgba(238,0,0,0.2)]">
                      {formData.buttonText || 'SHOP NOW'}
                    </div>
                    {/* SKIP: Purple Gradient */}
                    <div className="flex-1 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[10px] text-white font-black text-[7px] flex items-center justify-center uppercase tracking-widest shadow-lg">
                      SKIP
                    </div>
                  </div>

                  {formData.endDate && (
                    <div className="flex items-center gap-1 mt-3 justify-center text-[7px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                      <Clock className="w-2.5 h-2.5 text-red-500/50" /> ENDS: {formData.endDate}
                    </div>
                  )}

                </div>

              </div>

              {/* Bottom mic and volume slots of mobile device screen */}
              <div className="w-full flex justify-center items-center gap-1 opacity-40 z-30">
                <div className="w-24 h-1 bg-white/30 rounded-full"></div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
