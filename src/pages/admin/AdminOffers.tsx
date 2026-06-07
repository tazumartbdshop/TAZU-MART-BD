import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Heart, ToggleLeft, ToggleRight, 
  Sparkles, CheckCircle, Eye, EyeOff, Search, HelpCircle, 
  ArrowLeft, Grid, Image as ImageIcon, Percent, ShoppingBag, 
  Flame, Calendar, FileText, ChevronRight, Package, DollarSign,
  Star
} from 'lucide-react';
import { useOfferStore, Offer } from '../../store/useOfferStore';
import { useProductStore, Product } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { formatPrice, cn } from '../../lib/utils';
import { resizeImage } from '../../lib/imageUtils';
import { motion, AnimatePresence } from 'motion/react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { BroadcastManager } from './components/BroadcastManager';
import AdminPopupOfferManager from './AdminPopupOfferManager';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function AdminOffers() {
  return (
    <Routes>
      <Route path="/" element={<AllOffersView />} />
      <Route path="/create" element={<OfferFormView />} />
      <Route path="/edit/:id" element={<OfferFormView />} />
      <Route path="/products/:id" element={<OfferProductsView />} />
      <Route path="/hub" element={<BroadcastManager />} />
      <Route path="/popup" element={<AdminPopupOfferManager />} />
    </Routes>
  );
}

// -----------------------------------------------------
// VIEW 1: ALL OFFERS PAGE
// -----------------------------------------------------
function AllOffersView() {
  const navigate = useNavigate();
  const { offers, deleteOffer, updateOffer } = useOfferStore();
  const { products } = useProductStore();

  const [offerBannerUrl, setOfferBannerUrl] = useState<string>('');
  const [isUpdatingBanner, setIsUpdatingBanner] = useState<boolean>(false);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'offers_page_banner');
    const unsub = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setOfferBannerUrl(snapshot.data().imageUrl || '');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/offers_page_banner');
    });
    return () => unsub();
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUpdatingBanner(true);
    try {
      const { uploadImage } = await import('../../lib/imageUtils');
      const downloadUrl = await uploadImage(file, 'banners', `offers-banner-${Date.now()}`);
      await setDoc(doc(db, 'settings', 'offers_page_banner'), { imageUrl: downloadUrl });
      toast.success("✅ Offers page banner uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to upload banner");
    } finally {
      setIsUpdatingBanner(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (confirm("Remove this custom offer banner? The fallback banner will be shown instead.")) {
      setIsUpdatingBanner(true);
      try {
        await deleteDoc(doc(db, 'settings', 'offers_page_banner'));
        setOfferBannerUrl('');
        toast.success("✅ Offers banner removed!");
      } catch (err) {
        console.error(err);
        toast.error("Failed to remove banner");
      } finally {
        setIsUpdatingBanner(false);
      }
    }
  };

  const getProductsCount = (offer: Offer) => {
    return (offer.productIds?.length || 0) + (offer.manualProductIds?.length || 0);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-none border border-neutral-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-sans text-neutral-950 uppercase tracking-tight">Campaigns & Offers</h2>
          <p className="text-xs text-neutral-500 mt-1">Design special banners, auto-assign sliders, and launch discount campaigns styled like Daraz.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/offers/create')}
          className="bg-black text-white hover:bg-neutral-800 font-sans font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-none transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create Offer
        </button>
      </div>

      {/* Global Offer Page Banner Upload */}
      <div className="bg-white p-6 rounded-none border border-neutral-150 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-black font-sans text-neutral-900 uppercase tracking-widest">Global Offers Page Banner</h3>
          <p className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">Define custom graphics representing special marketing seasons contextually (YouTube aspect ratio, e.g. 16:9)</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          <div className="relative border border-dashed border-neutral-300 hover:border-black transition-colors flex-1 min-h-[140px] flex items-center justify-center p-4 bg-neutral-50 group">
            {offerBannerUrl ? (
              <div className="w-full h-full relative aspect-[16/9] md:aspect-[24/10] max-h-[180px] overflow-hidden bg-neutral-950">
                <img 
                  src={offerBannerUrl} 
                  alt="Custom Offers Banner" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-center justify-center gap-2">
                  <button 
                    onClick={handleRemoveBanner}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-sans text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Delete Banner
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-4 text-center w-full">
                <ImageIcon className="w-8 h-8 text-neutral-300 group-hover:text-black transition-colors" />
                <span className="text-xs font-black uppercase tracking-wider text-neutral-500 group-hover:text-black">
                  {isUpdatingBanner ? "Uploading..." : "Click to Upload Banner Image"}
                </span>
                <span className="text-[10px] text-neutral-400 font-bold">Recommended Size: 1920x1080 (16:9 Youtube Ratio)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBannerUpload} 
                  disabled={isUpdatingBanner}
                  className="hidden" 
                />
              </label>
            )}
          </div>
          
          <div className="md:w-72 border border-neutral-100 p-4 bg-neutral-50/50 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Current Rules</span>
              <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                • If uploaded, this custom image will fill the entire header container of the customer Offers Page.
              </p>
              <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                • If no custom banner is uploaded, a professional, auto-generated promotional card will occupy the position dynamically.
              </p>
            </div>
            
            {offerBannerUrl && (
              <div className="pt-2 flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active online</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 gap-6">
        {offers.length === 0 ? (
          <div className="text-center py-24 bg-white border border-neutral-100 rounded-none flex flex-col items-center justify-center p-6 gap-3">
            <ShoppingBag className="w-12 h-12 text-neutral-200" />
            <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No Active Offers</span>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">Create festive sale bundles or quick weekend countdown banners from the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...offers].sort((a, b) => (a.priority || 0) - (b.priority || 0)).map((offer) => {
              const count = getProductsCount(offer);
              return (
                <div 
                  key={offer.id} 
                  className="bg-white border border-neutral-150 rounded-xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-all duration-300"
                >
                  {/* Banner Style Preview Header */}
                  <div 
                    className={cn(
                      "p-5 text-white h-36 flex flex-col justify-between relative overflow-hidden bg-neutral-900 transition-all duration-300",
                      offer.bannerMode !== 'custom' ? offer.bannerStyle : ""
                    )}
                    style={offer.bannerMode === 'custom' && offer.customBannerUrls && offer.customBannerUrls.length > 0 ? { backgroundImage: `url(${offer.customBannerUrls[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                  >
                    {offer.bannerMode === 'custom' && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25 pointer-events-none z-0" />
                    )}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-black pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                      <span className="bg-white/20 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/25">
                        {offer.type}
                      </span>
                      <div className="flex gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${offer.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'}`} />
                        <span className="text-[9px] font-bold uppercase tracking-wider">{offer.status}</span>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <h4 className="text-base font-black uppercase tracking-tight line-clamp-1">{offer.name}</h4>
                      <p className="text-[10px] opacity-75 line-clamp-1 mt-1 font-mono uppercase tracking-widest">
                        {offer.startDate} to {offer.endDate}
                      </p>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <p className="text-xs text-neutral-500 leading-relaxed font-sans line-clamp-2">
                        {offer.description || 'No description provided for this visual campaign.'}
                      </p>

                      <div className="flex justify-between text-xs py-2 border-y border-neutral-100 font-sans">
                        <span className="text-neutral-500">Products in Campaign</span>
                        <span className="font-bold text-neutral-950 font-mono">{count} Items</span>
                      </div>

                      <div className="flex justify-between text-xs pb-2 border-b border-neutral-100 font-sans">
                        <span className="text-neutral-500">Campaign Discount</span>
                        <span className="font-black text-red-650 uppercase">
                          {offer.discountType ? (
                            offer.discountType === 'percentage' 
                              ? `${offer.discountValue}% OFF` 
                              : `৳${offer.discountValue} OFF`
                          ) : (
                            'Product Specific'
                          )}
                        </span>
                      </div>

                      {/* Homepage placement preview */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Active Campaign Badge</span>
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-black bg-white border border-neutral-300 px-2.5 py-1.5 uppercase tracking-[0.14em] rounded-md shadow-sm">
                            <span className="w-2 h-2 bg-black rounded-full animate-pulse shrink-0" />
                            {offer.name.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick switch actions */}
                    <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3">
                      <button 
                        onClick={() => navigate(`/admin/offers/products/${offer.id}`)}
                        className="text-[10px] text-center bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 py-1.5 font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Package className="w-3.5 h-3.5" /> Items ({count})
                      </button>

                      <button 
                        onClick={() => navigate(`/admin/offers/edit/${offer.id}`)}
                        className="text-[10px] text-center bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 py-1.5 font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Core Settings
                      </button>

                      <button 
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the offer "${offer.name}"?`)) {
                            deleteOffer(offer.id);
                          }
                        }}
                        className="text-[10px] text-center bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-1.5 font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Drop
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------
// VIEW 2: CREATE / EDIT FORM WITH REALTIME BANNER PREVIEW
// -----------------------------------------------------
function OfferFormView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { offers, addOffer, updateOffer, getBannerStyleByType } = useOfferStore();

  const isEdit = !!id;
  const existingOffer = isEdit ? offers.find(o => o.id === id) : null;

  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(existingOffer?.name || '');
  const [type, setType] = useState<Offer['type']>(existingOffer?.type || 'Weekly Sale');
  const [priority, setPriority] = useState(existingOffer?.priority || 0);
  const [startDate, setStartDate] = useState(existingOffer?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(existingOffer?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Active' | 'Hidden'>(existingOffer?.status || 'Active');
  const [description, setDescription] = useState(existingOffer?.description || '');

  const [bannerMode, setBannerMode] = useState<'auto' | 'custom'>(existingOffer?.bannerMode || 'auto');
  const [banners, setBanners] = useState<{ url: string; link: string }[]>(
    existingOffer?.banners || 
    (existingOffer?.customBannerUrls?.map(url => ({ url, link: '#' })) || [])
  );
  const [autoSlide, setAutoSlide] = useState(existingOffer?.autoSlide ?? true);
  const [slideDurationSeconds, setSlideDurationSeconds] = useState(existingOffer?.slideDurationSeconds || 3);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'marquee'>(existingOffer?.layoutMode || 'grid');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Linked Products Form State
  const { products } = useProductStore();
  const [productIds, setProductIds] = useState<string[]>(existingOffer?.productIds || []);
  const [formSearchQuery, setFormSearchQuery] = useState('');

  // Website Control Toggles
  const [homepageVisibility, setHomepageVisibility] = useState(existingOffer?.homepageVisibility ?? true);
  const [offersPageVisibility, setOffersPageVisibility] = useState(existingOffer?.offersPageVisibility ?? true);
  const [showAsFlashSale, setShowAsFlashSale] = useState(existingOffer?.showAsFlashSale ?? false);
  const [showAsTrending, setShowAsTrending] = useState(existingOffer?.showAsTrending ?? false);
  const [showAsBestSelling, setShowAsBestSelling] = useState(existingOffer?.showAsBestSelling ?? false);

  // Discount Configuration Settings
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | ''>(existingOffer?.discountType || '');
  const [discountValue, setDiscountValue] = useState(existingOffer?.discountValue || 0);
  const [autoExpire, setAutoExpire] = useState(existingOffer?.autoExpire ?? true);

  const previewStyle = getBannerStyleByType(type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please fill out the offer title.');
      return;
    }

    setIsLoading(true);

    const payload = {
      name,
      type,
      priority,
      startDate,
      endDate,
      status,
      description,
      homepageVisibility,
      offersPageVisibility,
      showAsFlashSale,
      showAsTrending,
      showAsBestSelling,
      bannerMode,
      banners,
      autoSlide,
      slideDurationSeconds,
      layoutMode,
      productIds,
      manualProductIds: existingOffer?.manualProductIds || [],
      discountType: discountType || undefined,
      discountValue: Number(discountValue) || 0,
      autoExpire: Boolean(autoExpire),
    };

    try {
      if (isEdit && id) {
        await updateOffer(id, payload);
      } else {
        await addOffer(payload);
      }
      
      toast.success("✅ Offer Saved Successfully", {
        position: "top-center",
        style: {
          background: "#10B981",
          color: "#fff",
          fontWeight: "bold",
          borderRadius: "0px",
        }
      });
      
      setIsLoading(false);
      navigate('/admin/offers');
    } catch (error) {
      toast.error("❌ Failed to save offer");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate('/admin/offers')}
          className="p-2 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-full transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-700" />
        </button>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight text-neutral-950 font-sans">
            {isEdit ? 'Modify Visual Campaign' : 'Create Campaign Offer'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Configure live triggers, auto-banner visuals, and landing zones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Preview column */}
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
            Realtime Banner Mockup preview
          </span>
          
          <div 
            className={cn(
              "w-full overflow-hidden text-white flex flex-col justify-between shadow-md relative rounded-xl p-6 aspect-[3/1] select-none transition-all duration-300",
              bannerMode !== 'custom' ? previewStyle : "bg-neutral-900 border border-neutral-200"
            )}
            style={bannerMode === 'custom' && banners.length > 0 ? { backgroundImage: `url(${banners[0].url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {/* Pure Image Preview - No Text Overlays */}
            {bannerMode !== 'custom' && (
              <div className="absolute inset-0 bg-white/5 opacity-40 mix-blend-overlay pointer-events-none" />
            )}
          </div>

          <div className="bg-neutral-50 border border-neutral-150 rounded-xl p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-widest flex items-center gap-2">
              {bannerMode === 'custom' ? (
                <>
                  <ImageIcon className="w-4 h-4 text-emerald-600" /> Custom Banner Mode
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" /> Auto Banner Engine
                </>
              )}
            </h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              The template generator custom pairs display typography, accent scales, and micro-branding based on the chosen category. No custom coding needed for new events.
            </p>
          </div>
        </div>

        {/* Configuration settings form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-6 rounded-none border border-neutral-150 shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#000000] pb-2 border-b border-neutral-100">
              Campaign Properties
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Campaign Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Campaign Name / Offer Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Eid Mega Sale, Special Flash Weekend"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm bg-neutral-50/50 border border-neutral-200 focus:border-neutral-950 focus:bg-white p-2.5 rounded-lg outline-none transition-all"
                  required
                />
              </div>

              {/* Sorting Priority */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Page Sorting Priority (0 = Highest)
                </label>
                <input 
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  className="w-full text-sm bg-neutral-50/50 border border-neutral-200 focus:border-neutral-950 focus:bg-white p-2.5 rounded-lg outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Offer Type Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Offer Type
                </label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as Offer['type'])}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 p-2.5 rounded-lg focus:outline-none"
                >
                  <option value="Eid Sale">Eid Sale</option>
                  <option value="Seasonal Offer">Seasonal Offer</option>
                  <option value="Flash Sale">Flash Sale</option>
                  <option value="Trending Items">Trending Items</option>
                  <option value="Best Selling">Best Selling</option>
                  <option value="Weekly Sale">Weekly Sale</option>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Limited Time Deal">Limited Time Deal</option>
                  <option value="Coupon Offer">Coupon Offer</option>
                  <option value="Special Campaign">Special Campaign</option>
                  <option value="Custom Offer">Custom Offer</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Status
                </label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Hidden')}
                  className="w-full text-sm bg-neutral-50 border border-neutral-200 p-2.5 rounded-lg focus:outline-none"
                >
                  <option value="Active">Active / Visible</option>
                  <option value="Hidden">Hidden / Draft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Start Date
                </label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm bg-neutral-50/50 border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  End Date
                </label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm bg-neutral-50/50 border border-neutral-200 p-2.5 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Campaign Discount Rules */}
            <div className="bg-neutral-50/70 border border-neutral-150 p-4 rounded-xl space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-800 flex items-center gap-2">
                <Percent className="w-3.5 h-3.5 text-neutral-700" /> Campaign Checkout Discount Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    Discount Type
                  </label>
                  <select 
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full text-xs bg-white border border-neutral-200 p-2.5 rounded-lg focus:outline-none"
                  >
                    <option value="">No Campaign Discount (Product Level/None)</option>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
                    Discount Value {discountType === 'percentage' ? '(%)' : '(৳)'}
                  </label>
                  <input 
                    type="number"
                    disabled={!discountType}
                    placeholder="e.g. 20 or 200"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                    className="w-full text-xs bg-white border border-neutral-200 p-2.5 rounded-lg focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 select-none">
                <div className="text-left">
                  <span className="text-[9.5px] font-bold text-neutral-800 uppercase tracking-wide block">Auto Expire Campaign</span>
                  <span className="text-[8px] text-neutral-400 font-medium leading-none">Campaign automatically disables at the End Date cutoff.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoExpire(!autoExpire)}
                  className="text-neutral-900 focus:outline-none transition-colors"
                >
                  {autoExpire ? (
                    <ToggleRight className="w-8 h-8 text-black fill-black/10" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Campaign description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Campaign Description
              </label>
              <textarea 
                rows={3}
                placeholder="Tell users what to buy or introduce terms..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm bg-neutral-50/50 border border-neutral-200 focus:border-neutral-950 focus:bg-white p-2.5 rounded-lg outline-none transition-all resize-none"
              />
            </div>

            {/* LINKED PRODUCTS SELECTION SECTION */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-[0.12em] text-neutral-950 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-black" /> Select Campaign Products <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase mt-0.5">
                    Which products are linked and shown on clicking this Offer Banner?
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const currentActiveIds = products.map(p => p.id);
                      setProductIds(prev => Array.from(new Set([...prev, ...currentActiveIds])));
                    }}
                    className="text-[9px] font-bold uppercase tracking-wider text-black bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProductIds([]);
                    }}
                    className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Internal Product Filter Search box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -to-[10px] -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Quick search products by name, category or SKU..."
                  value={formSearchQuery}
                  onChange={(e) => setFormSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-4 py-2 bg-neutral-50/50 border border-neutral-200 rounded-lg outline-none focus:border-black focus:bg-white transition-all"
                />
              </div>

              {/* Scrollable checklist container */}
              <div className="border border-neutral-200 rounded-lg bg-neutral-50/30 divide-y divide-neutral-100 max-h-[250px] overflow-y-auto">
                {products.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400">
                    No products found in the store. Please add products first.
                  </div>
                ) : (
                  (() => {
                    const filtered = products.filter(p => {
                      if (!formSearchQuery.trim()) return true;
                      return (
                        p.name.toLowerCase().includes(formSearchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(formSearchQuery.toLowerCase()) ||
                        (p.category && p.category.toLowerCase().includes(formSearchQuery.toLowerCase()))
                      );
                    });
                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-xs text-neutral-400">
                          No matching products found.
                        </div>
                      );
                    }
                    return filtered.map((p) => {
                      const isSelected = productIds.includes(p.id);
                      return (
                        <div 
                          key={p.id}
                          onClick={() => {
                            if (isSelected) {
                              setProductIds(prev => prev.filter(id => id !== p.id));
                            } else {
                              setProductIds(prev => [...prev, p.id]);
                            }
                          }}
                          className={cn(
                            "flex items-center gap-3 p-2 hover:bg-neutral-100 transition-colors cursor-pointer select-none",
                            isSelected ? "bg-amber-100/10" : ""
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent click handler
                            className="w-4 h-4 text-black rounded border-neutral-300 focus:ring-black"
                          />
                          <img 
                            src={p.featured_image || p.image} 
                            alt={p.name} 
                            className="w-8 h-8 object-cover rounded border border-neutral-200 shrink-0" 
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <h5 className="text-[11px] font-bold text-neutral-900 truncate">{p.name}</h5>
                            <p className="text-[9px] text-neutral-500 font-mono tracking-tight mt-0.5">
                              {p.sku} • {p.category}
                            </p>
                          </div>
                          <div className="text-right shrink-0 pr-1">
                            <span className="text-[11px] font-black text-neutral-950">{formatPrice(p.price)}</span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
              <div className="flex justify-between items-center text-[9px] text-neutral-400 font-bold uppercase py-1">
                <span>Selected: <span className="text-black font-extrabold">{productIds.length}</span> products</span>
                {productIds.length > 0 && (
                  <span className="text-emerald-600 font-extrabold font-mono">Status: Connected to Campaign</span>
                )}
              </div>
            </div>

            {/* Banner Presentation System selector */}
            <div className="space-y-3 pt-3 border-t border-neutral-100">
              <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 block">
                Banner Presentation System
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBannerMode('auto')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 border-2 text-center transition-all cursor-pointer rounded-xl",
                    bannerMode === 'auto'
                      ? "border-black bg-neutral-950 text-white shadow-sm"
                      : "border-neutral-250 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                  )}
                >
                  <Sparkles className="w-5 h-5 mb-1.5 text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-wider">Auto Banner</span>
                  <span className="text-[9px] opacity-75 mt-0.5">Automated CSS Gradient</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBannerMode('custom')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 border-2 text-center transition-all cursor-pointer rounded-xl",
                    bannerMode === 'custom'
                      ? "border-black bg-neutral-950 text-white shadow-sm"
                      : "border-neutral-250 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                  )}
                >
                  <ImageIcon className="w-5 h-5 mb-1.5 text-blue-500" />
                  <span className="text-xs font-black uppercase tracking-wider">Upload Banner</span>
                  <span className="text-[9px] opacity-75 mt-0.5">YouTube 2560x1440 Ratio</span>
                </button>
              </div>
            </div>

            {/* Custom Banner Configuration Area */}
            {bannerMode === 'custom' && (
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800">
                    Custom Banner Uploader
                  </span>
                  <span className="text-[9.5px] bg-red-100 text-red-600 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-[0.08em]">
                    Ratio 2560 × 1440 (YouTube)
                  </span>
                </div>

                {/* Upload Banner Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                      <input type="checkbox" checked={autoSlide} onChange={(e) => setAutoSlide(e.target.checked)} />
                      Auto Slide
                    </label>
                    <input type="number" value={slideDurationSeconds} onChange={(e) => setSlideDurationSeconds(parseInt(e.target.value))} className="text-xs border rounded p-1" placeholder="Seconds" />
                  </div>

                  <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach(async (file: File) => {
                        try {
                          const { uploadImage } = await import('../../lib/imageUtils');
                          const downloadUrl = await uploadImage(file, 'banners', `offers-banner-${Date.now()}`);
                          setBanners(prev => [...prev, { url: downloadUrl, link: '#' }]);
                        } catch (err) {
                          console.error("Error processing image:", err);
                        }
                      });
                    }
                  }}/>
                  
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-neutral-300 hover:border-black rounded-lg p-5 text-center bg-white cursor-pointer transition-all flex flex-col items-center gap-2 group w-full">
                    <Plus className="w-6 h-6 text-neutral-400 group-hover:text-black transition-colors" />
                    <p className="text-xs font-black uppercase text-neutral-700">Upload Banners (+)</p>
                  </button>
                  
                  {banners.length > 0 && (
                     <div className="grid grid-cols-1 gap-3">
                       {banners.map((banner, index) => (
                         <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-lg border">
                           <img src={banner.url} alt={`Banner ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                           <input type="text" value={banner.link} onChange={(e) => setBanners(banners.map((b, i) => i === index ? { ...b, link: e.target.value } : b))} className="text-xs flex-1 border p-1 rounded" placeholder="Banner Link" />
                           <button type="button" onClick={() => setBanners(banners.filter((_, i) => i !== index))} className="p-1.5 rounded-full text-red-500 hover:bg-neutral-100"><Trash2 className="w-4 h-4"/></button>
                         </div>
                       ))}
                     </div>
                  )}
                </div>

                {/* Safezone responsive alert display */}
                <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg flex items-start gap-2 text-[10px] text-emerald-800 leading-relaxed font-sans">
                  <span className="text-xs">🛡️</span>
                  <div>
                    <span className="font-bold uppercase tracking-wide block mb-0.5">Premium Crop Safe Zone Enabled</span>
                    Always keeps content details aligned in the center. Looks pristine on Mobile, Desktop, and Television. No white space or top cutoff.
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT DISPLAY SYSTEM SELECTOR */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <label className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500 block">
                Product Display System Layout
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLayoutMode('grid')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 border-2 text-center transition-all cursor-pointer rounded-xl",
                    layoutMode === 'grid'
                      ? "border-black bg-neutral-950 text-white shadow-sm"
                      : "border-neutral-250 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                  )}
                >
                  <Grid className="w-5 h-5 mb-1.5 text-rose-500 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider">Grid View</span>
                  <span className="text-[9px] opacity-75 mt-0.5">2-Column Compact Grid Layout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode('marquee')}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 border-2 text-center transition-all cursor-pointer rounded-xl",
                    layoutMode === 'marquee'
                      ? "border-black bg-neutral-950 text-white shadow-sm"
                      : "border-neutral-250 bg-neutral-50 hover:bg-neutral-100 text-neutral-800"
                  )}
                >
                  <span className="text-lg leading-none mb-1.5 text-blue-500 animate-pulse select-none">♾️</span>
                  <span className="text-xs font-black uppercase tracking-wider">Auto Scroll Layout</span>
                  <span className="text-[9px] opacity-75 mt-0.5">Continuous Horizontal Marquee</span>
                </button>
              </div>
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#000000] pb-2 border-b border-neutral-100">
              Homepage & Hub Controls (Target Sliders)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3.5 bg-neutral-50/55 hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all select-none">
                <div className="text-left py-0.5">
                  <span className="text-[10.5px] font-bold text-neutral-800 uppercase tracking-wide block">Show in Homepage Sliders</span>
                  <span className="text-[9px] text-neutral-400 font-medium">Banners appear dynamically in carousel index.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHomepageVisibility(!homepageVisibility)}
                  className="text-neutral-900 focus:outline-none transition-colors"
                >
                  {homepageVisibility ? (
                    <ToggleRight className="w-9 h-9 text-black fill-black/10" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-neutral-300" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-neutral-50/55 hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all select-none">
                <div className="text-left py-0.5">
                  <span className="text-[10.5px] font-bold text-neutral-800 uppercase tracking-wide block">Show in Offers Page</span>
                  <span className="text-[9px] text-neutral-400 font-medium">Grid preview appears in client offers hub.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOffersPageVisibility(!offersPageVisibility)}
                  className="text-neutral-900 focus:outline-none transition-colors"
                >
                  {offersPageVisibility ? (
                    <ToggleRight className="w-9 h-9 text-black fill-black/10" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-neutral-300" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-neutral-50/55 hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all select-none">
                <div className="text-left py-0.5">
                  <span className="text-[10.5px] font-bold text-rose-600 uppercase tracking-wide block">Assign as Flash Sale</span>
                  <span className="text-[9px] text-neutral-400 font-medium">Render products inside Home Flash Row.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAsFlashSale(!showAsFlashSale)}
                  className="text-neutral-900 focus:outline-none transition-colors"
                >
                  {showAsFlashSale ? (
                    <ToggleRight className="w-9 h-9 text-rose-600 fill-rose-600/10" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-neutral-300" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-neutral-50/55 hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all select-none">
                <div className="text-left py-0.5">
                  <span className="text-[10.5px] font-bold text-purple-600 uppercase tracking-wide block">Assign as Trending section</span>
                  <span className="text-[9px] text-neutral-400 font-medium">Send products to Homepage Hot Trending.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAsTrending(!showAsTrending)}
                  className="text-neutral-900 focus:outline-none transition-colors"
                >
                  {showAsTrending ? (
                    <ToggleRight className="w-9 h-9 text-purple-600 fill-purple-600/10" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-neutral-300" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-neutral-50/55 hover:bg-neutral-50 border border-neutral-200/60 rounded-xl transition-all select-none col-span-1 sm:col-span-2">
                <div className="text-left py-0.5">
                  <span className="text-[10.5px] font-bold text-amber-600 uppercase tracking-wide block">Assign as Best Sellers</span>
                  <span className="text-[9px] text-neutral-400 font-medium">Send products to Homepage Featured catalog list.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAsBestSelling(!showAsBestSelling)}
                  className="text-neutral-900 focus:outline-none transition-colors"
                >
                  {showAsBestSelling ? (
                    <ToggleRight className="w-9 h-9 text-amber-600 fill-amber-600/10" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-neutral-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100">
            <button 
              type="button"
              onClick={() => navigate('/admin/offers')}
              className="px-4 py-2.5 border border-neutral-250 text-neutral-700 bg-white hover:bg-neutral-50 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-all active:scale-95 disabled:bg-neutral-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'SAVING...' : (isEdit ? 'Save Changes' : 'Confirm & Build')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// VIEW 3: ASSOCIATE PRODUCTS TO THE CAMPAIGN (MULTIPLE SELECTIONS + MANUAL FORM)
// -----------------------------------------------------
function OfferProductsView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { offers, updateOffer } = useOfferStore();
  const { products, addProduct, deleteProduct } = useProductStore();
  const { categories } = useCategoryStore();

  const offer = offers.find(o => o.id === id);

  // States
  const [activeTab, setActiveTab] = useState<'existing' | 'manual' | 'selected'>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Manual Product form state
  const [manName, setManName] = useState('');
  const [manPrice, setManPrice] = useState('');
  const [manDiscountPrice, setManDiscountPrice] = useState('');
  const [manStock, setManStock] = useState('50');
  const [manImage, setManImage] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60');
  const [manCategory, setManCategory] = useState(categories[0]?.name || 'Fashion');
  const [manSku, setManSku] = useState('CAM-' + Math.random().toString(36).substring(3, 7).toUpperCase());
  const [manDescription, setManDescription] = useState('');

  if (!offer) {
    return (
      <div className="p-6 text-center bg-white border rounded-none">
        <p className="text-sm font-bold text-red-500 uppercase">Offer not found</p>
        <button onClick={() => navigate('/admin/offers')} className="mt-4 text-xs bg-black text-white px-4 py-2">
          Back to List
        </button>
      </div>
    );
  }

  const selectedIds = offer.productIds || [];
  const manualIds = offer.manualProductIds || [];

  // Toggle selection
  const handleToggleProduct = (productId: string) => {
    let updated;
    if (selectedIds.includes(productId)) {
      updated = selectedIds.filter(x => x !== productId);
    } else {
      updated = [...selectedIds, productId];
    }
    updateOffer(offer.id, { productIds: updated });
  };

  const handleUpdateManualVisibility = (productId: string, visible: boolean) => {
    // Products stored in DB can have draft/active profiles. 
    // We can interact directly with useProductStore actions
  };

  // Create manual product
  const handleAddManualProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manName.trim() || !manPrice.trim()) {
      alert('Please provide a name and standard price for this item.');
      return;
    }

    const priceNum = parseFloat(manPrice);
    const discNum = manDiscountPrice ? parseFloat(manDiscountPrice) : undefined;
    const stockNum = parseInt(manStock) || 0;

    const newProdId = 'm-' + Math.random().toString(36).substring(2, 9);
    
    // Add directly to main database (draft status if visibility toggle OFF initially, but ready to be served)
    const newProduct: any = {
      id: newProdId,
      name: manName,
      sku: manSku,
      category: manCategory,
      price: priceNum,
      discountPrice: discNum,
      stock: stockNum,
      image: manImage,
      images: [manImage],
      rating: 4.8,
      reviews: 1,
      isNew: true,
      status: 'active', // Active status to render in the client layout properly
      description: manDescription || `Exclusive campaign item for ${offer.name}`,
      createdAt: Date.now(),
      soldCount: 0,
      is_flash_sale: offer.type === 'Flash Sale' || offer.showAsFlashSale,
      is_trending: offer.type === 'Trending Items' || offer.showAsTrending,
      is_best_selling: offer.type === 'Best Selling' || offer.showAsBestSelling
    };

    // Integrate with manualProducts array in the useProductStore
    // To do this smoothly we can use the addProduct handler in our store:
    addProduct({
      name: manName,
      sku: manSku,
      category: manCategory,
      price: priceNum,
      discountPrice: discNum,
      stock: stockNum,
      image: manImage,
      images: [manImage],
      rating: 5.0,
      reviews: 1,
      isNew: true,
      status: 'active',
      description: manDescription || `Exclusive campaign item for ${offer.name}`,
      soldCount: 0,
    });

    // Let's grab the newly appended product by match
    setTimeout(() => {
      const generatedProducts = useProductStore.getState().products;
      const newestCreated = generatedProducts[0]; // Newest is placed at start

      if (newestCreated) {
        // Tie to our manualProductIds list index
        const updatedManual = [...manualIds, newestCreated.id];
        updateOffer(offer.id, { manualProductIds: updatedManual });
        
        // Clear manual inputs
        setManName('');
        setManPrice('');
        setManDiscountPrice('');
        setManSku('CAM-' + Math.random().toString(36).substring(3, 7).toUpperCase());
        setManDescription('');

        // Move layout to selected list tab
        setActiveTab('selected');
        alert(`Successfully launched "${newestCreated.name}" in this campaign!`);
      }
    }, 150);
  };

  const matchedProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCat;
  });

  // Render assigned products (both manually launched & checkbox assigned)
  const totalAssignedIds = [...selectedIds, ...manualIds];
  const totalAssignedProducts = products.filter(p => totalAssignedIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-none border border-neutral-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/offers')}
            className="p-2 hover:bg-neutral-50 border border-neutral-200 rounded-full transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-700" />
          </button>
          <div className="text-left">
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold uppercase tracking-widest text-[9px]">
              {offer.type}
            </span>
            <h2 className="text-lg font-bold font-sans uppercase tracking-tight text-neutral-950 mt-1">{offer.name}</h2>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1.5 bg-neutral-100 p-1 border border-neutral-200 rounded-xl select-none">
          <button 
            onClick={() => setActiveTab('existing')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'existing' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Select from Website
          </button>
          <button 
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'manual' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Add Products Manually
          </button>
          <button 
            onClick={() => setActiveTab('selected')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'selected' ? 'bg-black text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            View Selected ({totalAssignedProducts.length})
          </button>
        </div>
      </div>

      {/* 4. OPTION 1: SELECT EXISTING PRODUCTS */}
      {activeTab === 'existing' && (
        <div className="bg-white border border-neutral-150 rounded-xl overflow-hidden shadow-sm">
          {/* Filtering bar */}
          <div className="p-4 border-b border-neutral-100 bg-neutral-50/50 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input 
                type="text"
                placeholder="Search products by title or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2 bg-white border border-neutral-200 rounded-lg outline-none focus:border-black"
              />
            </div>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-white border border-neutral-200 p-2 rounded-lg focus:outline-none focus:border-black"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto text-left">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-400 text-[9px] uppercase tracking-[0.2em] font-black border-b border-neutral-100">
                  <th className="p-4 max-w-[50px] text-center">Select</th>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">category</th>
                  <th className="p-4">price</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {matchedProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr 
                      key={p.id} 
                      onClick={() => handleToggleProduct(p.id)}
                      className={`hover:bg-neutral-50/50 transition-colors cursor-pointer select-none ${isChecked ? 'bg-neutral-50/40' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Switched via parent tr click
                          className="h-4 w-4 rounded text-black focus:ring-black border-neutral-300"
                        />
                      </td>

                      <td className="p-4 flex items-center gap-3">
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="w-10 h-10 object-contain p-0.5 border border-neutral-150 rounded bg-white" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-neutral-900 line-clamp-1">{p.name}</span>
                          <span className="text-[9px] font-mono text-neutral-400 mt-0.5">SKU: {p.sku}</span>
                        </div>
                      </td>

                      <td className="p-4 text-xs font-semibold text-neutral-600">
                        {p.category}
                      </td>

                      <td className="p-4 text-xs font-bold text-neutral-950 font-mono">
                        {p.discountPrice ? (
                          <div className="flex flex-col">
                            <span className="text-red-600">{formatPrice(p.discountPrice)}</span>
                            <span className="text-[10px] text-gray-300 line-through leading-none mt-0.5">{formatPrice(p.price)}</span>
                          </div>
                        ) : (
                          <span>{formatPrice(p.price)}</span>
                        )}
                      </td>

                      <td className="p-4 text-xs font-mono font-bold text-neutral-600">
                        {p.stock} Units
                      </td>

                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${p.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-neutral-100 text-neutral-500'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. OPTION 2: ADD PRODUCT MANUALLY */}
      {activeTab === 'manual' && (
        <form onSubmit={handleAddManualProduct} className="bg-white p-6 border border-neutral-150 rounded-xl shadow-sm space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-950 pb-2 border-b border-neutral-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-black" /> Add Campaign Item Manually
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. Traditional Hand-woven Cotton Panjabi"
                value={manName}
                onChange={(e) => setManName(e.target.value)}
                className="w-full text-xs bg-neutral-50/50 border border-neutral-200 focus:border-black focus:bg-white p-2.5 rounded-lg outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Unique SKU
              </label>
              <input 
                type="text"
                value={manSku}
                onChange={(e) => setManSku(e.target.value)}
                className="w-full text-xs bg-neutral-50/50 border border-neutral-200 focus:border-black focus:bg-white p-2.5 rounded-lg outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Primary Image URL
              </label>
              <input 
                type="url"
                value={manImage}
                onChange={(e) => setManImage(e.target.value)}
                className="w-full text-xs bg-neutral-50/50 border border-neutral-200 focus:border-black focus:bg-white p-2.5 rounded-lg outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                category category
              </label>
              <select 
                value={manCategory}
                onChange={(e) => setManCategory(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 p-2.5 rounded-lg focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Price (BDT) <span className="text-red-500">*</span>
              </label>
              <input 
                type="number"
                placeholder="e.g. 2500"
                value={manPrice}
                onChange={(e) => setManPrice(e.target.value)}
                className="w-full text-xs bg-neutral-50/50 border border-neutral-200 focus:border-black focus:bg-white p-2.5 rounded-lg outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Offer Discount Price (BDT)
              </label>
              <input 
                type="number"
                placeholder="e.g. 1800 (Optional)"
                value={manDiscountPrice}
                onChange={(e) => setManDiscountPrice(e.target.value)}
                className="w-full text-xs bg-neutral-50/50 border border-neutral-200 focus:border-black focus:bg-white p-2.5 rounded-lg outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Short Description
              </label>
              <textarea 
                rows={2}
                placeholder="Write specific campaign terms, warranties, sizes..."
                value={manDescription}
                onChange={(e) => setManDescription(e.target.value)}
                className="w-full text-xs bg-neutral-50/50 border border-neutral-200 focus:border-black focus:bg-white p-2.5 rounded-lg outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-widest cursor-pointer group flex items-center gap-2 transition-all active:scale-95"
            >
              🚀 Launch in Campaign
            </button>
          </div>
        </form>
      )}

      {/* 6. TAB: VIEW SELECTED LIST ITEMS */}
      {activeTab === 'selected' && (
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
            Active Product cards in this campaign grid
          </span>

          {totalAssignedProducts.length === 0 ? (
            <div className="text-center py-24 bg-white border border-neutral-100 rounded-xl p-6">
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">No Products Tied to this Campaign</p>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">Use the tabs above to select existing items or bootstrap brand new catalog objects for Eid Sale/Flash Drops.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {totalAssignedProducts.map((p) => {
                const discountPercent = p.discountPrice 
                  ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
                  : null;

                const isManual = manualIds.includes(p.id);

                return (
                  <div 
                    key={p.id} 
                    className="bg-white border border-neutral-150 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow transition-all text-left relative"
                  >
                    {/* Visual Stamp for Manual/Website Products */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shadow ${isManual ? 'bg-purple-600 text-white' : 'bg-neutral-900 text-white'}`}>
                        {isManual ? 'Manual Item' : 'Attached'}
                      </span>
                    </div>

                    <div className="aspect-square relative flex items-center justify-center p-3 bg-neutral-50/30">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      {discountPercent && (
                        <span className="absolute bottom-2 left-2 bg-[#E2125B] text-white text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide rounded">
                          -{discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">{p.category}</span>
                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug">{p.name}</h4>
                        <p className="text-[9px] font-mono text-neutral-400 uppercase">SKU: {p.sku}</p>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 mt-2 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-neutral-950 font-mono">
                            {formatPrice(p.discountPrice || p.price)}
                          </span>
                          {p.discountPrice && (
                            <span className="text-[10px] text-gray-300 line-through leading-none font-bold mt-0.5">
                              {formatPrice(p.price)}
                            </span>
                          )}
                        </div>

                        {/* Drop relation button */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (confirm('Remove this product link from the campaign?')) {
                              if (isManual) {
                                // Delete fully from products database too
                                deleteProduct(p.id);
                                const nextManual = manualIds.filter(x => x !== p.id);
                                updateOffer(offer.id, { manualProductIds: nextManual });
                              } else {
                                const nextSelected = selectedIds.filter(x => x !== p.id);
                                updateOffer(offer.id, { productIds: nextSelected });
                              }
                            }
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
