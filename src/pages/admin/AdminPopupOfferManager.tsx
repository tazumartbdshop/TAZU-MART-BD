import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Plus, Search, Trash2, Edit, Save, 
  Calendar, Eye, ChevronRight, Upload, RefreshCw, 
  X, AlertCircle, CheckCircle2, TrendingUp, BarChart3,
  MousePointerClick, Check, HelpCircle
} from 'lucide-react';
import { usePopupOfferStore, PopupOffer } from '../../store/usePopupOfferStore';
import { useProductStore } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';

export default function AdminPopupOfferManager() {
  const { 
    popupOffers, addPopupOffer, updatePopupOffer, deletePopupOffer 
  } = usePopupOfferStore();
  
  const { products } = useProductStore();
  const { categories } = useCategoryStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form States
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [primaryButtonText, setPrimaryButtonText] = useState('Buy Now');
  const [secondaryButtonText, setSecondaryButtonText] = useState('Skip Deal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Expired'>('Draft');

  // Image Crop Modal states
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropPreview, setCropPreview] = useState<string | null>(null);
  
  // Search state for product dropdown
  const [productSearch, setProductSearch] = useState('');
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  // Errors and messages
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewOffer, setPreviewOffer] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropBoxRef = useRef<HTMLDivElement>(null);

  // Auto set dates when opening form
  useEffect(() => {
    if (isFormOpen && !editingId) {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDate(today);
      setEndDate(thirtyDaysLater);
    }
  }, [isFormOpen, editingId]);

  // Load editing campaign details
  const handleEditClick = (offer: PopupOffer) => {
    setEditingId(offer.id);
    setTitle(offer.title);
    setSubtitle(offer.subtitle);
    setDescription(offer.description);
    setProductId(offer.productId);
    setCategoryId(offer.categoryId);
    setBannerUrl(offer.bannerUrl);
    setCropPreview(offer.bannerUrl);
    setPrimaryButtonText(offer.primaryButtonText);
    setSecondaryButtonText(offer.secondaryButtonText);
    setStartDate(offer.startDate);
    setEndDate(offer.endDate);
    setStatus(offer.status);
    setValidationError(null);
    setIsFormOpen(true);
    
    // Seed product lookup
    const foundProd = products.find(p => p.id === offer.productId);
    setProductSearch(foundProd ? foundProd.name : '');
  };

  // Close formulation
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setProductId('');
    setCategoryId('');
    setBannerUrl('');
    setCropPreview(null);
    setPrimaryButtonText('Buy Now');
    setSecondaryButtonText('Skip Deal');
    setStartDate('');
    setEndDate('');
    setStatus('Draft');
    setValidationError(null);
    setProductSearch('');
  };

  // Drag and drop handlers for image input
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageSelected(files[0]);
    }
  };

  const handleImageSelected = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImage(event.target?.result as string);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Dragging inside Crop container
  const handleCropMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
  };

  // Perform Center Crop to 1:1 Ratio on Canvas
  const handleConfirmCrop = () => {
    if (!rawImage) return;

    const img = new Image();
    img.src = rawImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 1080, 1080);

      // We want to draw a 1:1 square cropped image from the loaded image
      // based on zoom level and offset coordinates
      const imgWidth = img.width;
      const imgHeight = img.height;
      const minDimension = Math.min(imgWidth, imgHeight);

      // Crop center calculate
      const sourceWidth = minDimension / cropZoom;
      const sourceHeight = minDimension / cropZoom;
      
      const sourceX = (imgWidth - sourceWidth) / 2 - (cropOffset.x * (sourceWidth / 300));
      const sourceY = (imgHeight - sourceHeight) / 2 - (cropOffset.y * (sourceHeight / 300));

      ctx.drawImage(
        img,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(sourceWidth, imgWidth),
        Math.min(sourceHeight, imgHeight),
        0,
        0,
        1080,
        1080
      );

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCropPreview(croppedDataUrl);
      setBannerUrl(croppedDataUrl);
      setCropModalOpen(false);
      setRawImage(null);
    };
  };

  // Form submission handler
  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic fields validation
    if (!title.trim()) {
      setValidationError('Offer Title is required.');
      return;
    }
    if (!bannerUrl) {
      setValidationError('A 1:1 Square Banner image must be cropped and uploaded.');
      return;
    }
    if (!productId) {
      setValidationError('You must link exactly 1 product to this popup campaign.');
      return;
    }
    if (!startDate || !endDate) {
      setValidationError('Please select valid start and end dates.');
      return;
    }

    // DUPLICATE CHECK validation
    // Rule: Rule 2: "একই Product একাধিক Popup-এ ব্যবহার করা যাবে না. Duplicate Product Selection Block করতে হবে"
    const isDuplicateProduct = popupOffers.some(
      (offer) => offer.productId === productId && offer.id !== editingId
    );

    if (isDuplicateProduct) {
      setValidationError('🚫 Duplicate Link Blocked! The chosen product is already active/linked in another popup campaign offer. Each product can only have exactly one popup offer globally.');
      return;
    }

    const payload = {
      title,
      subtitle,
      description,
      productId,
      categoryId,
      bannerUrl,
      primaryButtonText: primaryButtonText || 'Buy Now',
      secondaryButtonText: secondaryButtonText || 'Skip Deal',
      startDate,
      endDate,
      status
    };

    try {
      if (editingId) {
        await updatePopupOffer(editingId, payload);
        showToast('Popup Campaign updated successfully!');
      } else {
        await addPopupOffer(payload);
        showToast('New Popup Campaign launched successfully!');
      }
      handleCloseForm();
    } catch (err) {
      setValidationError('Error saving campaign to database. Please review entry.');
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Delete confirm
  const handleDeleteClick = async (id: string) => {
    if (confirm('Are you absolutely sure you want to completely erase this popup campaign? This action is irreversible.')) {
      await deletePopupOffer(id);
      showToast('Popup campaign eliminated successfully.');
    }
  };

  // Search product filters list for picker dropdown
  const filteredProducts = products.filter(p => {
    const term = productSearch.toLowerCase();
    const nameEng = p.name ? p.name.toLowerCase() : '';
    return nameEng.includes(term);
  });

  // Category mapping helper
  const getCategoryName = (catId: string) => {
    const found = categories.find(c => c.id === catId);
    return found ? found.name : 'All Categories';
  };

  // Product mapping helper
  const getProductName = (prodId: string) => {
    const found = products.find(p => p.id === prodId);
    return found ? found.name : 'Missing Product';
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Toast feedback alerts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-4 right-4 z-50 bg-emerald-600 border border-emerald-500 text-white py-3 px-5 rounded-xl shadow-xl flex items-center gap-2 "
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-sans font-bold text-sm tracking-wide">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section admin area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 border border-neutral-200 p-5 rounded-2xl">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2 uppercase">
            <Sparkles className="w-6 h-6 text-black fill-black/5 animate-pulse" /> Popup Offer
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Control system for Daraz-style initial entry welcome offers, product targeted hooks, and live performance.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-black text-white hover:bg-neutral-900 py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 text-center"
          >
            <Plus className="w-4 h-4" /> Add Popup Offer
          </button>
        )}
      </div>

      {/* Primary single clean form workspace */}
      {isFormOpen ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main edit entry column */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <span className="font-sans font-black text-sm uppercase tracking-wider text-neutral-800">
                {editingId ? 'Edit Campaign Configurations' : 'New Popup Campaign Form'}
              </span>
              <button 
                onClick={handleCloseForm}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error messaging inside form */}
            {validationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-2.5 text-xs font-bold leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-650" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSaveOffer} className="space-y-4">
              
              {/* Info group */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-black uppercase text-orange-650 tracking-widest border-l-2 border-orange-500 pl-2">
                  1. Offer Information Details
                </h3>
                
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                    Offer Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Daraz Mega Weekly Surprise"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                      Offer Subtitle (Voucher Label etc.)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. EXCLUSIVE 50% SAVINGS"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                      Target Category Optional (Filters)
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                    >
                      <option value="">All Categories (Worldwide entry)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                    Offer Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a quick converting summary hook description to inspire immediate click checkout..."
                    className="w-full text-xs font-semibold p-3.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                  />
                </div>
              </div>

              {/* Product selector block with duplicate verification rules */}
              <div className="space-y-3.5 pt-2">
                <h3 className="text-xs font-black uppercase text-orange-650 tracking-widest border-l-2 border-orange-500 pl-2">
                  2. Direct Linked Conversion Product
                </h3>
                
                <div className="relative">
                  <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                    Select Target Product <span className="text-red-500">*</span>
                  </label>
                  
                  {productId ? (
                    <div className="flex justify-between items-center bg-gray-50 border border-neutral-200 p-2.5 rounded-xl text-xs font-bold font-mono">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-500 text-white px-2 py-0.5 rounded-md text-[9px] font-black font-sans">LINKED</span>
                        <span className="truncate max-w-[300px] text-neutral-800">{getProductName(productId)}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setProductId('');
                          setProductSearch('');
                        }}
                        className="text-red-500 hover:text-red-700 bg-white border border-red-100 p-1.5 rounded-lg active:scale-95"
                      >
                        Change Product
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setProductDropdownOpen(true);
                          }}
                          onFocus={() => setProductDropdownOpen(true)}
                          placeholder="Search products by title..."
                          className="w-full text-xs font-semibold pl-9 pr-3.5 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                        />
                      </div>

                      {productDropdownOpen && (
                        <div className="absolute z-30 left-0 right-0 mt-1 max-h-56 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-y-auto divide-y divide-neutral-100">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => {
                              // Identify if product already active in list to discourage duplicate
                              const isLinked = popupOffers.some(o => o.productId === p.id && o.id !== editingId);
                              
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  disabled={isLinked}
                                  onClick={() => {
                                    setProductId(p.id);
                                    setProductSearch(p.name);
                                    setProductDropdownOpen(false);
                                  }}
                                  className={`w-full text-left p-2.5 text-xs font-bold hover:bg-neutral-50 flex justify-between items-center ${isLinked ? 'opacity-40 cursor-not-allowed bg-red-50/10' : ''}`}
                                >
                                  <div className="truncate pr-4 text-neutral-850">
                                    {p.name}
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[10px] text-orange-560 font-mono">৳{p.variants?.[0]?.price || p.price}</span>
                                    {isLinked && (
                                      <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-sans uppercase">Duplicate Mapped</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="p-3 text-center text-xs text-neutral-400 font-bold">
                              No products matching search query.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 1:1 Square cropped image upload region */}
              <div className="space-y-3.5 pt-2">
                <h3 className="text-xs font-black uppercase text-orange-650 tracking-widest border-l-2 border-orange-500 pl-2">
                  3. Image Crop & Upload System (1:1 Ratio)
                </h3>
                
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-neutral-300 rounded-2xl p-5 text-center hover:border-orange-400 transition-all duration-200 bg-neutral-50 flex flex-col items-center justify-center space-y-2.5 relative min-h-[140px]"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageSelected(e.target.files[0]);
                      }
                    }}
                  />

                  {cropPreview ? (
                    <div className="relative group space-y-2.5">
                      <div className="w-[120px] h-[120px] mx-auto rounded-xl border border-neutral-200 overflow-hidden shadow-sm relative">
                        <img 
                          src={cropPreview} 
                          alt="Crop preview" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-[11px] text-emerald-600 font-extrabold flex items-center justify-center gap-1 animate-pulse">
                        <Check className="w-3.5 h-3.5" /> 1:1 Square Processed Fine!
                      </div>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] uppercase font-black tracking-wider bg-white border border-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg shadow-xs hover:bg-neutral-50 active:scale-95"
                        >
                          Replace Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCropPreview(null);
                            setBannerUrl('');
                          }}
                          className="text-[10px] uppercase font-black tracking-wider bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 active:scale-95"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 select-none">
                      <Upload className="w-8 h-8 text-neutral-400 mx-auto" />
                      <div className="text-xs font-bold text-neutral-700">
                        Drag and drop 1:1 image or <span className="text-orange-500 cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>browse</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 font-medium font-mono">
                        Supports JPEG, PNG, WEBP (Target: 1080x1080px)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Button Action controls */}
              <div className="space-y-3.5 pt-2">
                <h3 className="text-xs font-black uppercase text-orange-650 tracking-widest border-l-2 border-orange-500 pl-2">
                  4. Bottom Action Button Configuration
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                      Primary Checkout Button Text
                    </label>
                    <input
                      type="text"
                      value={primaryButtonText}
                      onChange={(e) => setPrimaryButtonText(e.target.value)}
                      placeholder="e.g. Buy Now / Grab Deal"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                      Secondary Cancel Button Text
                    </label>
                    <input
                      type="text"
                      value={secondaryButtonText}
                      onChange={(e) => setSecondaryButtonText(e.target.value)}
                      placeholder="e.g. Skip Deal / Close Offer"
                      className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                    />
                  </div>
                </div>
              </div>

              {/* Scheduling and status */}
              <div className="space-y-3.5 pt-2">
                <h3 className="text-xs font-black uppercase text-orange-650 tracking-widest border-l-2 border-orange-500 pl-2">
                  5. Timing Scheduling & Campaign Status
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-600 mb-1">
                      Publish Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full text-xs font-semibold px-3.5 py-2.5 border border-[#f57224]/30 bg-orange-50/20 rounded-xl focus:outline-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="pt-4 border-t border-neutral-100 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="bg-neutral-100 text-neutral-600 py-2.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider select-none active:scale-95 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#f57224] text-white py-2.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:bg-orange-600 active:scale-95 transition-all text-center cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Campaign
                </button>
              </div>

            </form>
          </div>

          {/* Interactive Fixed Preview Frame on right */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
            <div className="bg-neutral-900 border border-neutral-850 rounded-3xl p-5 text-white shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f57224] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span> Live Real-Time Offer Preview
                </span>
                <span className="text-[9px] font-mono font-bold text-neutral-500">Scale: Fixed Daraz Theme</span>
              </div>

              {/* Standard Daraz-Like Welcome Offer Popup frame render exactly */}
              <div className="bg-neutral-950/70 py-6 px-4 rounded-2xl flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden select-none border border-neutral-800/60 shadow-inner">
                
                {/* Backdrop ambient blur layout */}
                <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#f57224]/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl"></div>

                <div className="relative w-full max-w-[280px] bg-white text-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-200/50 flex flex-col items-center">
                  
                  {/* Fire Header bar */}
                  <div className="w-full bg-neutral-900 py-1.5 px-3 text-center text-[8.5px] font-black tracking-widest text-white flex justify-center items-center gap-1 uppercase">
                    🔥 {subtitle || 'MEGA WEEKLY OFFER'}
                  </div>

                  {/* 1:1 image representation */}
                  <div className="w-full aspect-square bg-neutral-100 overflow-hidden relative shrink-0 border-b border-neutral-100 flex items-center justify-center">
                    {bannerUrl ? (
                      <img 
                        src={bannerUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-[10px] text-neutral-400 font-bold p-4 text-center">
                        IMAGE NOT SELECTED YET
                      </div>
                    )}
                  </div>

                  {/* Text Information card content */}
                  <div className="p-4 text-center w-full bg-white">
                    <h2 className="font-sans font-black text-xs uppercase leading-tight tracking-tight text-neutral-900 mb-1 limit-2-lines">
                      {title || 'SURPRISE WELCOME DEAL'}
                    </h2>
                    
                    {/* Fake daraz coupon preview */}
                    <div className="bg-orange-50 text-[#f57224] py-1 px-3.5 rounded-lg border border-dashed border-[#f57224] max-w-[190px] mx-auto my-2 text-center select-none font-bold text-[10px] flex flex-col items-center justify-center">
                      <span className="text-[7.5px] font-bold text-neutral-800 uppercase tracking-widest">CHECKOUT ACCELERATOR</span>
                      <span>{getCategoryName(categoryId).toUpperCase() || 'Priority Deal'}</span>
                    </div>

                    <p className="text-[10px] font-bold text-neutral-550 leading-relaxed max-w-[220px] mx-auto limit-3-lines">
                      {description || 'Get specialized express priority counter delivery on this product. Limited item slots.'}
                    </p>
                  </div>

                </div>

                {/* Simulated action triggers */}
                <div className="flex gap-2.5 mt-4 w-full max-w-[280px]">
                  <button 
                    type="button"
                    className="flex-1 h-[38px] bg-[#EE0000] text-white rounded-xl text-[9px] uppercase tracking-widest font-black transition-all shadow-[0_0_10px_rgba(238,0,0,0.2)]"
                  >
                    {primaryButtonText || 'Buy Now'}
                  </button>
                  <button 
                    type="button" 
                    className="flex-1 h-[38px] bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-xl text-[9px] uppercase tracking-widest font-black"
                  >
                    {secondaryButtonText || 'Skip Deal'}
                  </button>
                </div>

              </div>

              {/* Guidance specifications lists */}
              <div className="text-[11px] font-sans text-neutral-400 leading-relaxed pt-2 border-t border-neutral-800 space-y-1 bg-neutral-950/20 p-3 rounded-xl border border-neutral-850">
                <p className="font-extrabold text-orange-400 uppercase tracking-wider">Specifications and Rules:</p>
                <p className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[#f57224]" /> Max 1 linked product allowed inside each popup.</p>
                <p className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[#f57224]" /> Multiple popups cannot link the same duplicate product.</p>
                <p className="flex items-center gap-1.5"><ChevronRight className="w-3 h-3 text-[#f57224]" /> Closed deals are remembered session-basedly.</p>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Grid listing with live performance stats and action buttons */
        <div className="space-y-6">
          
          {/* Active Campaigns filter bar */}
          <div className="flex justify-between items-center bg-white border border-neutral-200 p-4 rounded-2xl shadow-xs">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search popup campaign title..."
                className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500/30"
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
              Total Campaigns: {popupOffers.length}
            </span>
          </div>

          {/* Listing Section table replaced with Card list */}
          <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-neutral-150 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-neutral-800 tracking-wider">
                Active & Historic Popups List
              </span>
              <span className="text-[10px] font-bold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Admin Panel Synchronization: ONLINE
              </span>
            </div>

            {popupOffers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5 sm:p-6" id="popup-offers-cards-grid">
                {popupOffers
                  .filter(offer => offer.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((offer) => {
                    // Calculate live metrics
                    const conversion = offer.views > 0 
                      ? ((offer.buyNowClicks / offer.views) * 100).toFixed(1) 
                      : '0.0';

                    // Check status badges style
                    let statusColor = 'bg-gray-100 text-gray-700 border-gray-200';
                    if (offer.status === 'Published') {
                      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    } else if (offer.status === 'Expired') {
                      statusColor = 'bg-red-50 text-red-700 border-red-100';
                    }

                    return (
                      <div key={offer.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between" id={`offer-card-${offer.id}`}>
                        
                        {/* Banner Image Preview */}
                        <div className="relative aspect-video w-full bg-neutral-100 border-b border-neutral-200 overflow-hidden">
                          <img 
                            src={offer.bannerUrl} 
                            alt={offer.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className={`absolute top-2 left-2 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-full shadow-xs ${statusColor}`}>
                            {offer.status}
                          </span>
                          <span className="absolute top-2 right-2 text-[8px] font-black text-white bg-black/75 px-1.5 py-0.5 rounded-full font-mono tracking-wider">
                            CR: {conversion}%
                          </span>
                        </div>

                        {/* Card Meta Content */}
                        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <div className="text-xs font-black text-neutral-900 tracking-tight leading-snug line-clamp-1 uppercase" title={offer.title}>
                              {offer.title}
                            </div>
                            {offer.subtitle && (
                              <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-snug line-clamp-1">
                                {offer.subtitle}
                              </div>
                            )}
                            {/* Linked Product ID & Name Preview */}
                            <div className="pt-2 border-t border-neutral-100">
                              <p className="text-[8.5px] text-gray-400 font-extrabold uppercase tracking-widest mb-0.5">Linked Product</p>
                              <p className="text-[10px] font-bold text-neutral-800 line-clamp-1 leading-snug" title={getProductName(offer.productId)}>
                                {getProductName(offer.productId)}
                              </p>
                            </div>
                          </div>

                          {/* Scheduling Timeline Dates */}
                          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-0.5 font-mono text-[9px] text-neutral-500">
                            <div className="flex items-center gap-1 font-bold text-neutral-700">
                              <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>START: {offer.startDate}</span>
                            </div>
                            <div className="text-red-500 font-bold pl-4">ENDS: {offer.endDate}</div>
                          </div>
                        </div>

                        {/* Buttons Footer Actions */}
                        <div className="p-3 bg-neutral-50/50 border-t border-neutral-200 flex items-center justify-between gap-1">
                          <button
                            onClick={() => setPreviewOffer(offer)}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-[10px] font-bold text-neutral-800 tracking-wider uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Preview popup offer layer"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-600" /> Preview
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditClick(offer)}
                              className="p-1 px-1.5 border border-zinc-200 bg-white hover:bg-zinc-150 text-zinc-800 rounded-md transition-colors cursor-pointer"
                              title="Edit configurations"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(offer.id)}
                              className="p-1 px-1.5 border border-red-150 bg-white hover:bg-red-50 text-red-650 rounded-md transition-colors cursor-pointer"
                              title="Delete campaign offer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="p-12 text-center select-none space-y-2.5">
                <BarChart3 className="w-12 h-12 text-neutral-300 mx-auto animate-pulse" />
                <h4 className="font-sans font-black text-sm uppercase text-neutral-800 tracking-wider">
                  No popup campaign offers initialized yet
                </h4>
                <p className="text-xs font-medium text-neutral-400 max-w-sm mx-auto">
                  Click 'Add Popup Offer' at the top of the interface to crop your first welcome poster, link your product, and start capturing customers.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Floating Campaign overlay Preview Modal */}
      <AnimatePresence>
        {previewOffer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl border border-neutral-100 p-0"
            >
              
              {/* Banner visual */}
              <div className="relative w-full aspect-square bg-neutral-150">
                <img 
                  src={previewOffer.bannerUrl} 
                  alt="Offer Banner" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setPreviewOffer(null)}
                  className="absolute top-3.5 right-3.5 w-7 h-7 bg-black/60 hover:bg-black/85 text-white rounded-full flex items-center justify-center transition-all"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Text metadata */}
              <div className="p-5 text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] bg-neutral-100 text-neutral-800 font-extrabold uppercase px-2 py-0.5 tracking-wider rounded-md">
                    Welcome Campaign Preview
                  </span>
                  <h4 className="text-lg font-black text-neutral-900 uppercase tracking-tight pt-1">{previewOffer.title}</h4>
                  {previewOffer.subtitle && (
                    <p className="text-xs font-bold text-neutral-450 uppercase tracking-widest">{previewOffer.subtitle}</p>
                  )}
                </div>
                
                {previewOffer.productId && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex flex-col items-center">
                    <p className="text-[8px] font-black text-neutral-450 uppercase tracking-wider mb-1">Target Product</p>
                    <span className="font-extrabold text-xs text-neutral-800 tracking-tight text-center">{getProductName(previewOffer.productId)}</span>
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  <button 
                    onClick={() => setPreviewOffer(null)}
                    className="w-full bg-black text-white py-3 font-extrabold uppercase text-xs tracking-widest transition-all hover:bg-neutral-900 active:scale-95"
                  >
                    {previewOffer.primaryButtonText || 'Buy Now'}
                  </button>
                  <button 
                    onClick={() => setPreviewOffer(null)}
                    className="text-neutral-450 hover:text-neutral-800 text-[10px] font-black uppercase tracking-widest duration-150 inline-block py-1"
                  >
                    {previewOffer.secondaryButtonText || 'Skip Deal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Zoom & Align cropping modal dialog wrapper */}
      <AnimatePresence>
        {cropModalOpen && rawImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl max-w-md w-full space-y-5"
            >
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                <span className="font-sans font-black text-xs uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#f57224]" /> 1:1 Image Crop Adjustments
                </span>
                <button 
                  onClick={() => {
                    setCropModalOpen(false);
                    setRawImage(null);
                  }}
                  className="text-neutral-400 hover:text-neutral-700 bg-neutral-100 p-1 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Crop visual box with drag bounds */}
              <div 
                ref={cropBoxRef}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
                className="w-[280px] h-[280px] mx-auto overflow-hidden relative border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-950 cursor-move"
                style={{ touchAction: 'none' }}
              >
                <div 
                  onMouseDown={handleCropMouseDown}
                  className="absolute transition-transform duration-75 origin-center"
                  style={{
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%'
                  }}
                >
                  <img
                    src={rawImage}
                    alt="Raw Upload Source"
                    className="w-full h-full object-contain pointer-events-none select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Visual center grid overlay lines */}
                <div className="absolute inset-0 border border-white/20 pointer-events-none flex items-center justify-center">
                  <div className="w-[80%] h-[80%] border border-dashed border-white/30 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white/40 border-dashed rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Slider scale */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-black uppercase text-neutral-500">
                  <span>Zoom Image:</span>
                  <span className="font-mono text-neutral-800">x{cropZoom.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.05"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full text-orange-500 accent-[#f57224] bg-neutral-100 h-2 rounded-lg cursor-pointer focus:outline-none"
                />
                <p className="text-[9.5px] font-semibold text-neutral-405 text-center mt-1">
                  💡 Drag mouse inside the container grid box to manually center & align the image bounds before saving.
                </p>
              </div>

              {/* Trigger Crop capture */}
              <div className="pt-3 border-t border-neutral-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCropModalOpen(false);
                    setRawImage(null);
                  }}
                  className="bg-neutral-150 text-neutral-600 font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCrop}
                  className="bg-[#f57224] text-white font-black text-[10px] uppercase tracking-wider py-2 px-4.5 rounded-xl shadow-xs hover:bg-orange-600 active:scale-95 transition-all text-center"
                >
                  Confirm Crop
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
