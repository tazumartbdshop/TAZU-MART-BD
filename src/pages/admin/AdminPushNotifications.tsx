import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, Send, Clock, Trash2, Plus, Sparkles, Check, X, Search,
  Upload, Eye, Edit3, CopyPlus, Ticket, FileText, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore, PromotionalNotification } from '../../store/useNotificationStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useProductStore, Product } from '../../store/useProductStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { usePromoStore } from '../../store/usePromoStore';
import { campaignService, Campaign } from '../../services/campaignService';

interface AdminPushNotificationsProps {
  activeTab?: 'create' | 'history';
}

export default function AdminPushNotifications({ activeTab: initialTab = 'create' }: AdminPushNotificationsProps) {
  const navigate = useNavigate();
  const { notifications, addNotification, updateNotification, duplicateNotification, deleteNotification } = useNotificationStore();
  const { categories } = useCategoryStore();
  const { products } = useProductStore();
  const { settings } = useSettingsStore();
  const { addPromoCode, promoCodes } = usePromoStore();

  const companyLogoFallback = settings.storeLogo || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200';

  const [currentTab, setCurrentTab] = useState<'create' | 'history'>(initialTab);

  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Coupon State
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [discountType, setDiscountType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [discountAmount, setDiscountAmount] = useState<number>(10);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  // Category & Product Selection
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Auto-expand Textarea refs
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Modal Preview state
  const [viewNotif, setViewNotif] = useState<PromotionalNotification | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [dbCampaigns, setDbCampaigns] = useState<any[]>([]);
  useEffect(() => { campaignService.getCampaigns().then(setDbCampaigns).catch(console.error); }, [currentTab]);

  // Toast State
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Auto-resize textareas when value changes
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${Math.max(38, titleRef.current.scrollHeight)}px`;
    }
  }, [title]);

  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = 'auto';
      descRef.current.style.height = `${Math.max(52, descRef.current.scrollHeight)}px`;
    }
  }, [description]);

  // Image File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        triggerToast('⚠️ File size exceeds 2MB limit (1200x800 recommended)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setCoverImage(reader.result as string);
        triggerToast('✅ Campaign banner image uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Category Chip
  const handleToggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Products filtered by selected categories & search term
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (selectedCategories.length > 0) {
        const prodCat = (prod.category || '').toLowerCase();
        const matchesCat = categories.some(c => {
          if (!selectedCategories.includes(c.id)) return false;
          const cName = (c.name || '').toLowerCase();
          const cId = (c.id || '').toLowerCase();
          return prodCat === cName || prodCat === cId || prodCat.includes(cName);
        });
        if (!matchesCat) return false;
      }

      if (productSearch.trim()) {
        const query = productSearch.toLowerCase();
        const matchName = (prod.name || '').toLowerCase().includes(query);
        const matchCat = (prod.category || '').toLowerCase().includes(query);
        return matchName || matchCat;
      }

      return true;
    });
  }, [products, categories, selectedCategories, productSearch]);

  // Toggle Product selection (Single product only)
  const handleToggleProduct = (prodId: string) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds([prodId]);
    }
  };

  // Populate form for Editing or Duplicating
  const handleEditCampaign = (notif: PromotionalNotification) => {
    setEditingId(notif.id);
    setTitle(notif.title || '');
    setDescription(notif.description || notif.message || '');
    setCoverImage(notif.coverImage || notif.bannerImage || '');
    setSelectedCategories(notif.selectedCategoryIds || []);
    setSelectedProductIds(notif.selectedProductIds || []);

    if (notif.couponCode) {
      setHasCoupon(true);
      setCouponCode(notif.couponCode);
      setCouponDesc(notif.couponDescription || '');
      setDiscountType(notif.discountType || 'Percentage');
      setDiscountAmount(notif.discountAmount || 10);
      setExpiryDate(notif.expiryDate || '2026-12-31');
    } else {
      setHasCoupon(false);
    }

    setCurrentTab('create');
    navigate('/admin/campaigns/create');
  };

  const handleDuplicateCampaign = (id: string) => {
    duplicateNotification(id);
    triggerToast('📋 Campaign duplicated! You can now edit and launch it.');
    setCurrentTab('history');
  };

  // Submit Handler (Create or Update)
  
  const handlePublishCampaign = async (status: 'Published' | 'Draft' = 'Published') => {
    if (!title.trim()) {
      triggerToast('⚠️ Title is required');
      return;
    }
    if (!description.trim()) {
      triggerToast('⚠️ Description is required');
      return;
    }
    if (!coverImage.trim()) {
      triggerToast('⚠️ Campaign Banner Image is required (1200x800)');
      return;
    }

    try {
      const finalCoupon = hasCoupon && couponCode.trim() ? couponCode.trim().toUpperCase() : undefined;
      const dbStatus = status === 'Published' ? 'active' : 'draft';
      
      let couponData = undefined;
      if (finalCoupon) {
        couponData = {
          code: finalCoupon,
          discount_type: discountType,
          discount_value: Number(discountAmount) || 10,
          active: true,
        };
      }

      await campaignService.createCampaign(
        {
          title: title.trim(),
          description: description.trim(),
          image_url: coverImage.trim(),
          status: dbStatus
        },
        selectedProductIds,
        selectedCategories,
        couponData as any
      );
      
      triggerToast(`✅ Campaign successfully saved (${dbStatus})`);
      setTitle('');
      setDescription('');
      setCoverImage('');
      setCouponCode('');
      setHasCoupon(false);
      setSelectedCategories([]);
      setSelectedProductIds([]);
      setCurrentTab('history');
      campaignService.getCampaigns().then(setDbCampaigns).catch(console.error);
    } catch (e: any) {
      triggerToast('❌ Error saving campaign: ' + e.message);
    }
  };

  // Get selected products for modal view
  const modalProducts = useMemo(() => {
    if (!viewNotif || !viewNotif.selectedProductIds) return [];
    const map = new Map<string, Product>();
    products.forEach(p => map.set(p.id, p));
    const list: Product[] = [];
    viewNotif.selectedProductIds.forEach(id => {
      const p = map.get(id);
      if (p) list.push(p);
    });
    return list;
  }, [viewNotif, products]);

  return (
    <div className="font-sans text-slate-900 w-full space-y-3">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-slate-950 text-white px-3.5 py-2 shadow-lg z-[300] rounded-xl flex items-center gap-2 border border-slate-800 animate-slide-up text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* COMPACT CLEAN HEADER (NO DESCRIPTION, DIRECT ON MAIN CANVAS) */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Megaphone className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-base font-black uppercase text-slate-950 tracking-tight leading-none">
            Campaign Center
          </h1>
        </div>

        {/* TAB SWITCHER & NEW CAMPAIGN BUTTON */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setCurrentTab('create');
                navigate('/admin/campaigns/create');
              }}
              className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'create'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {editingId ? 'Edit Campaign' : 'Create Campaign'}
            </button>

            <button
              onClick={() => {
                setCurrentTab('history');
                navigate('/admin/campaigns/history');
              }}
              className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                currentTab === 'history'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              History ({notifications.length})
            </button>
          </div>

          {currentTab === 'history' && (
            <button
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setDescription('');
                setCoverImage('');
                setHasCoupon(false);
                setCouponCode('');
                setCurrentTab('create');
                navigate('/admin/campaigns/create');
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT: CREATE CAMPAIGN */}
      {currentTab === 'create' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between py-1 border-b border-slate-200">
            <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{editingId ? 'Edit Campaign' : 'New Campaign Setup'}</span>
            </h2>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setDescription('');
                  setCoverImage('');
                  setHasCoupon(false);
                  setCouponCode('');
                }}
                className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* MAIN FORM FIELDS */}
            <div className="lg:col-span-8 space-y-3">
              
              {/* 1. CAMPAIGN IMAGE UPLOAD */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900">
                  Campaign Banner / Image
                </label>

                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {coverImage ? (
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                      <img
                        src={coverImage}
                        alt="Preview"
                        className="w-6 h-6 object-cover rounded border border-slate-200"
                      />
                      <span className="text-[10px] font-bold text-emerald-600">Uploaded</span>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="text-slate-400 hover:text-red-600 p-0.5 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400">
                      (Optional — defaults to Store Logo)
                    </span>
                  )}
                </div>
              </div>

              {/* 2. NOTIFICATION TITLE (AUTO-EXPANDING) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900">
                  Title *
                </label>
                <textarea
                  ref={titleRef}
                  rows={1}
                  required
                  placeholder="Campaign title (e.g. 🔥 50% OFF Premium Watches & Accessories)"
                  value={title}
                          maxLength={60}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 resize-none overflow-hidden"
                />
              </div>

              {/* 3. NOTIFICATION DESCRIPTION (AUTO-EXPANDING) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900">
                  Description *
                </label>
                <textarea
                  ref={descRef}
                  rows={2}
                  required
                  placeholder="Full description text... Expands automatically."
                  value={description}
                          maxLength={160}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 resize-none overflow-hidden"
                />
              </div>

              {/* 4. HORIZONTALLY SCROLLABLE CATEGORY SELECTION */}
              <div className="space-y-1 pt-1 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900">
                    Categories ({selectedCategories.length} Selected)
                  </label>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">
                    Scroll horizontally
                  </span>
                </div>

                {/* HORIZONTAL SCROLL CHIP ROW */}
                <div className="flex flex-row overflow-x-auto whitespace-nowrap gap-1.5 py-1 scrollbar-none border border-slate-200 rounded-lg p-1.5 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setSelectedCategories([])}
                    className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedCategories.length === 0
                        ? 'bg-slate-950 text-white border-slate-950'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    All
                  </button>

                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. PRODUCT SELECTION WITH SEARCH */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-900">
                    Product ({selectedProductIds.length} Selected)
                  </label>

                  <div className="relative w-44 sm:w-52">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search product..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-0.5 text-xs font-bold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50/50">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((prod) => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      const img = prod.images?.[0] || prod.image || companyLogoFallback;

                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleToggleProduct(prod.id)}
                          className={`p-1.5 rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 border-amber-400'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-3.5 h-3.5 text-amber-500 border-slate-300 pointer-events-none"
                          />

                          <img
                            src={img}
                            alt={prod.name}
                            className="w-7 h-7 object-cover rounded border border-slate-200 shrink-0"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-black text-slate-900 truncate">
                              {prod.name}
                            </h4>
                            <span className="text-[9px] font-bold text-slate-500 block">
                              BDT {(prod.salePrice || prod.price)?.toLocaleString()}
                            </span>
                          </div>

                          {isSelected && (
                            <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shrink-0">
                              Selected
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 py-4 text-center text-slate-400 text-xs font-bold">
                      No products match.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR: COUPON CODE (OPTIONAL) & PREVIEW */}
            <div className="lg:col-span-4 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-200 pt-3 lg:pt-0 lg:pl-4">
              
              {/* COUPON CODE SECTION (OPTIONAL) */}
              <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase text-amber-950 flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-amber-600" />
                    <span>Coupon Code (Optional)</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={hasCoupon}
                    onChange={(e) => setHasCoupon(e.target.checked)}
                    className="w-3.5 h-3.5 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                {hasCoupon && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 pt-1 border-t border-amber-200"
                  >
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-600 block">Code</span>
                      <input
                        type="text"
                        placeholder="e.g. SAVE10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-black text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-600 block">Description</span>
                      <input
                        type="text"
                        placeholder="e.g. 10% Off"
                        value={couponDesc}
                        onChange={(e) => setCouponDesc(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-semibold text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-600 block">Type</span>
                        <select
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value as any)}
                          className="w-full bg-white border border-amber-300 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-900 focus:outline-none"
                        >
                          <option value="Percentage">%</option>
                          <option value="Fixed Amount">BDT</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[9px] font-black uppercase text-slate-600 block">Value</span>
                        <input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(Number(e.target.value))}
                          className="w-full bg-white border border-amber-300 rounded px-2 py-0.5 text-xs font-black text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* LIVE CUSTOMER PREVIEW CARD (DARK MOBILE LOCKSCREEN STYLE) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Customer Notification Preview
                  </span>
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Phone Mockup
                  </span>
                </div>

                <div className="border border-slate-800 rounded-xl p-3 bg-slate-950 text-white shadow-xl space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 border-b border-slate-800/80 pb-1.5">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Bell className="w-3 h-3 text-amber-400" />
                      <span>{settings.storeName || 'TAZU'} App</span>
                    </span>
                    <span>Just Now</span>
                  </div>

                  <div className="flex items-start gap-2.5 pt-0.5">
                    <img
                      src={coverImage.trim() ? coverImage.trim() : companyLogoFallback}
                      alt="Banner"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-800 shrink-0 bg-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11.5px] font-black text-white truncate leading-tight">
                        {title || 'Campaign Title'}
                      </h4>
                      <p className="text-[10px] text-slate-300 line-clamp-2 font-medium leading-normal mt-0.5">
                        {description || 'Description preview...'}
                      </p>
                    </div>
                  </div>

                  {hasCoupon && couponCode && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-1.5 flex items-center justify-between text-[10px]">
                      <span className="font-mono font-black text-amber-400 tracking-wider">
                        COUPON: {couponCode}
                      </span>
                      <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[8.5px] uppercase tracking-wider">
                        VOUCHER
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <button
                  type="button"
                  onClick={() => handlePublishCampaign('Published')}
                  className="w-full h-9 bg-slate-950 hover:bg-black text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-amber-400" />
                  <span>{editingId ? 'Update & Launch' : 'Launch Campaign'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePublishCampaign('Draft')}
                  className="w-full h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span>Save Draft</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* TAB CONTENT: CAMPAIGN HISTORY */}
      {currentTab === 'history' && (
        <div className="space-y-3">
          
          {/* HISTORY CAMPAIGN LIST */}
          <div className="space-y-2">
            {dbCampaigns.length > 0 ? (
              dbCampaigns.map((camp: any) => {
                const notif = camp; // reuse var names temporarily
                const cover = notif.image_url || companyLogoFallback;
                const formattedDate = new Date(notif.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                const formattedTime = new Date(notif.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });

                return (
                  <div
                    key={notif.id}
                    className="border border-slate-200 rounded-xl p-2.5 sm:p-3 bg-white hover:border-slate-400 transition-all space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      
                      {/* CAMPAIGN BANNER, TITLE, DETAILS */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={cover}
                          alt={notif.title}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            (e.target as HTMLImageElement).src = companyLogoFallback;
                          }}
                        />

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-xs font-black text-slate-950 uppercase truncate">
                              {notif.title}
                            </h3>
                            {notif.publishedStatus === 'Draft' ? (
                              <span className="bg-slate-200 text-slate-700 text-[8.5px] font-black px-1.5 py-0.2 rounded uppercase">
                                Draft
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-800 text-[8.5px] font-black px-1.5 py-0.2 rounded uppercase">
                                Published
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase flex-wrap">
                            <span>{formattedDate} • {formattedTime}</span>
                            {notif.couponCode && (
                              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-black text-[9px]">
                                Code: {notif.couponCode}
                              </span>
                            )}
                            <span className="text-slate-400">({notif.selectedProductIds?.length || 0} Products)</span>
                          </div>
                        </div>
                      </div>

                      {/* COMPACT STATISTICS (SENT, OPENED, CLICKED) */}
                      <div className="flex items-center gap-2 shrink-0 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-center text-[10px]">
                        <div>
                          <span className="text-[8px] font-black uppercase text-slate-400 block">Sent</span>
                          <span className="font-black text-slate-900">{notif.totalSent || 1250}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-slate-400 block">Opened</span>
                          <span className="font-black text-amber-600">{notif.totalOpened || (notif.readBy?.length || 0)}</span>
                        </div>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <div>
                          <span className="text-[8px] font-black uppercase text-slate-400 block">Clicked</span>
                          <span className="font-black text-emerald-600">{notif.totalClicked || Math.floor((notif.totalOpened || 1) * 0.4)}</span>
                        </div>
                      </div>

                    </div>

                    {/* ACTION BUTTONS (SAME ROW, COMPACT, RESPONSIVE) */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 gap-2 flex-wrap">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">
                        By {notif.createdBy || 'Admin'}
                      </span>

                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => setViewNotif(notif)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleEditCampaign(notif)}
                          className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDuplicateCampaign(notif.id)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <CopyPlus className="w-3 h-3" />
                          <span>Duplicate</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm('Delete this campaign?')) {
                              campaignService.deleteCampaign(notif.id).then(() => setDbCampaigns(prev => prev.filter(c => c.id !== notif.id)));
                              triggerToast('Campaign deleted.');
                            }
                          }}
                          className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-1">
                <Megaphone className="w-6 h-6 text-slate-300 mx-auto" />
                <span className="text-xs font-black text-slate-400 uppercase block">No Campaign History</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW CAMPAIGN MODAL PREVIEW */}
      <AnimatePresence>
        {viewNotif && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-950 border border-slate-800 text-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-4"
            >
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Campaign Preview
                  </span>
                </div>
                <button
                  onClick={() => setViewNotif(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3.5">
                <div className="flex items-start gap-3">
                  <img
                    src={viewNotif.coverImage || viewNotif.bannerImage || companyLogoFallback}
                    alt={viewNotif.title}
                    className="w-12 h-12 object-cover rounded-xl border border-slate-800 shrink-0 bg-slate-900"
                  />
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-black uppercase text-white leading-snug">
                      {viewNotif.title}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed bg-slate-900/80 border border-slate-800 p-2 rounded-lg">
                      {viewNotif.description || viewNotif.message}
                    </p>
                  </div>
                </div>

                {viewNotif.couponCode && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase text-amber-400 block">Voucher Code</span>
                      <span className="text-xs font-black font-mono text-amber-300 tracking-wider">
                        {viewNotif.couponCode}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(viewNotif.couponCode || '');
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer transition-all active:scale-95"
                    >
                      {copiedCode ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                )}

                {modalProducts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-black uppercase text-slate-300 block">
                      Target Products ({modalProducts.length})
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {modalProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setViewNotif(null);
                            navigate(`/product/${p.slug || p.id}`);
                          }}
                          className="border border-slate-800 p-2 rounded-xl flex items-center gap-2 bg-slate-900 hover:border-amber-400 transition-all cursor-pointer"
                        >
                          <img
                            src={p.images?.[0] || p.image || companyLogoFallback}
                            alt={p.name}
                            className="w-8 h-8 object-cover rounded-lg shrink-0 border border-slate-800"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[10px] font-bold text-slate-200 truncate">{p.name}</h4>
                            <span className="text-[9.5px] font-black text-amber-400">
                              BDT {(p.discountPrice || p.price)?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-900 px-4 py-2.5 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setViewNotif(null)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
