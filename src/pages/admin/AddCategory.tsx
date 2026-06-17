import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Upload, Image as ImageIcon, X, Trash2, ArrowRight, Camera, AlertCircle, Eye, Globe } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategoryStore, Category } from '../../store/useCategoryStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { uploadImage } from '../../lib/imageUtils';

export default function AddCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { categories, addCategory, updateCategory } = useCategoryStore();
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');
  const [formData, setFormData] = useState({
    name: '',
    bannerName: '',
    slug: '',
    bannerImage: '',
    iconImage: '',
    wideBannerImage: '',
    buttonText: '',
    buttonLink: '',
    featuredProducts: '',
    description: '',
    displayOrder: 1,
    status: 'Active' as 'Active' | 'Inactive',
    showOnHomepage: true,
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  });

  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [bannerFiles, setBannerFiles] = useState<(File | string)[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [wideBannerFile, setWideBannerFile] = useState<File | null>(null);
  const [sliderSettings, setSliderSettings] = useState({
    autoScroll: false,
    manualScroll: true,
    interval: 3
  });
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [wideBannerError, setWideBannerError] = useState<string | null>(null);
  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [displayOrderError, setDisplayOrderError] = useState<string | null>(null);

  const bannerGalleryInputRef = useRef<HTMLInputElement>(null);
  const bannerCameraInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const wideBannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      const category = categories.find(c => c.id === id);
      if (category) {
        setFormData({
          name: category.name,
          bannerName: category.bannerName || '',
          slug: category.slug,
          bannerImage: category.bannerImage || '',
          iconImage: category.iconImage || '',
          wideBannerImage: category.wideBannerImage || '',
          buttonText: category.buttonText || '',
          buttonLink: category.buttonLink || '',
          featuredProducts: category.featuredProducts || '',
          description: category.description || '',
          displayOrder: category.displayOrder || 1,
          status: category.status,
          showOnHomepage: category.showOnHomepage !== undefined ? category.showOnHomepage : true,
          metaTitle: category.metaTitle || '',
          metaDescription: category.metaDescription || '',
          keywords: category.keywords || ''
        });
        const imgs = category.bannerImages && category.bannerImages.length > 0 ? category.bannerImages : (category.bannerImage ? [category.bannerImage] : []);
        setBannerImages(imgs);
        setBannerFiles(imgs);
        if (category.sliderSettings) {
           setSliderSettings(category.sliderSettings);
        }
      }
    }
  }, [id, isEditing, categories]);

  const handleSlugUpdate = (name: string) => {
    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'displayOrder') {
      setDisplayOrderError(null);
    }
    if (name === 'name' && !isEditing) {
      handleSlugUpdate(value);
    }
  };

  const handleToggle = (name: 'status' | 'showOnHomepage') => {
    if (name === 'status') {
      setFormData(prev => ({ ...prev, status: prev.status === 'Active' ? 'Inactive' : 'Active' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: !prev[name] }));
    }
  };

  const processBannerFiles = (files: FileList | null) => {
    if (!files) return;
    setBannerError(null);
    const newBanners = [...bannerImages];
    const newFiles = [...bannerFiles];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setBannerError("Only JPG, PNG and WEBP formats are supported.");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setBannerError(`Banner image "${file.name}" exceeds 5MB limit.`);
        continue;
      }
      const url = URL.createObjectURL(file);
      newBanners.push(url);
      newFiles.push(file);
    }
    setBannerImages(newBanners);
    setBannerFiles(newFiles);
  };

  const processThumbnailFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setThumbnailError(null);
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setThumbnailError("Only JPG, PNG and WEBP formats are supported.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setThumbnailError(`Category icon exceeds 2MB limit.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, iconImage: url }));
    setThumbnailFile(file);
  };

  const processWideBannerFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setWideBannerError(null);
    const file = files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setWideBannerError("Only JPG, PNG and WEBP formats are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setWideBannerError(`Wide Banner image exceeds 5MB limit.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, wideBannerImage: url }));
    setWideBannerFile(file);
  };

  const removeWideBannerImage = () => {
    if (formData.wideBannerImage && formData.wideBannerImage.startsWith('blob:')) {
      URL.revokeObjectURL(formData.wideBannerImage);
    }
    setFormData(prev => ({ ...prev, wideBannerImage: '' }));
    setWideBannerFile(null);
  };

  const removeBannerImage = (index: number) => {
    const target = bannerImages[index];
    if (target && target.startsWith('blob:')) {
      URL.revokeObjectURL(target);
    }
    setBannerImages(bannerImages.filter((_, i) => i !== index));
    setBannerFiles(bannerFiles.filter((_, i) => i !== index));
  };

  const removeThumbnailImage = () => {
    if (formData.iconImage && formData.iconImage.startsWith('blob:')) {
      URL.revokeObjectURL(formData.iconImage);
    }
    setFormData(prev => ({ ...prev, iconImage: '' }));
    setThumbnailFile(null);
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsLoading(true);
    console.log("handleSubmit started: Uploading images...");

    try {
        
         // Upload thumbnail if changed
        let iconUrl = formData.iconImage;
        if (thumbnailFile) {
          console.log("Uploading thumbnail...");
          iconUrl = await uploadImage(thumbnailFile, 'categories', `icon-${formData.slug}`);
          console.log("Thumbnail uploaded, URL:", iconUrl);
        }

        // Upload wide banner (16:9) if changed
        let wideBannerUrl = formData.wideBannerImage;
        if (wideBannerFile) {
          console.log("Uploading wide banner...");
          wideBannerUrl = await uploadImage(wideBannerFile, 'categories', `wide-banner-${formData.slug}`);
          console.log("Wide banner uploaded, URL:", wideBannerUrl);
        }

        // Upload all new banners
        console.log("Uploading banners...");
        const finalBannerUrls = await Promise.all(
          bannerFiles.map(async (fileOrUrl) => {
            if (typeof fileOrUrl === 'string') return fileOrUrl;
            return await uploadImage(fileOrUrl, 'categories', `banner-${formData.slug}-${Math.random().toString(36).substring(7)}`);
          })
        );
        console.log("Banners uploaded, URLs:", finalBannerUrls);

        const payload = {
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().trim().replace(/\s+/g, '-'),
          bannerName: formData.bannerName || formData.name,
          bannerImage: finalBannerUrls[0] || '',
          bannerImages: finalBannerUrls,
          sliderSettings: sliderSettings,
          iconImage: iconUrl,
          wideBannerImage: wideBannerUrl,
          buttonText: formData.buttonText,
          buttonLink: formData.buttonLink,
          featuredProducts: formData.featuredProducts,
          description: formData.description,
          displayOrder: Number(formData.displayOrder) || 1,
          status: formData.status,
          showOnHomepage: formData.showOnHomepage,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          keywords: formData.keywords
        };

        console.log("Uploading payload to Supabase...");
        if (isEditing && id) {
          await updateCategory(id, payload);
          console.log("Category updated in Supabase.");
        } else {
          await addCategory(payload);
          console.log("Category added to Supabase.");
        }
        
        toast.success("✅ Category Saved Successfully", {
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "0px",
          }
        });
        
        navigate('/admin/category-listing');
    } catch (error: any) {
        console.error("Save Category Error:", error);
        toast.error(`❌ Failed to save category: ${error.message || error}`);
    } finally {
        setIsLoading(false);
        console.log("handleSubmit finished (finally block).");
    }
  };

  return (
    <div className="bg-white rounded-none border border-zinc-200 overflow-hidden mb-12">
      <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/admin/category-listing')} 
            className="p-2 border border-zinc-200 rounded-none bg-white hover:bg-gray-100 mr-1"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <h3 className="text-sm font-black text-black uppercase tracking-widest">
            {isEditing ? 'EDIT CATEGORY' : 'ADD CATEGORY'}
          </h3>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-12">
        {/* Main form configuration */}
        <div className="lg:col-span-8 p-6 md:p-10 border-r border-zinc-200">
          
          {/* Sectionized tabs */}
          <div className="flex gap-4 border-b border-zinc-200 mb-8 pb-px">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'general' ? 'border-b-4 border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              General Setup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'seo' ? 'border-b-4 border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              SEO Configuration
            </button>
          </div>

          <div className="space-y-8">
            {activeTab === 'general' ? (
              <div className="space-y-8">
                {/* 1. Category name and slug */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest">Category Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="ENTER CATEGORY NAME..." 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest">Category Slug *</label>
                    <input 
                      type="text" 
                      name="slug" 
                      required
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="e.g. fashion-accessories" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-bold font-mono text-sm" 
                    />
                  </div>
                </div>

                {/* 2. Banner name */}
                <span className="h-px bg-zinc-100 block" />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest">Featured Banner Accent Tagline</label>
                  <input 
                    type="text" 
                    name="bannerName" 
                    value={formData.bannerName}
                    onChange={handleInputChange}
                    placeholder="ENTER BANNER BANGLA OR ENGLISH PRIMARY HEADLINE..." 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-bold text-sm" 
                  />
                </div>

                {/* 3. Description text */}
                <span className="h-px bg-zinc-100 block" />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest">Context Summary Description</label>
                  <textarea 
                    name="description" 
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="ENTER SUMMARY TAGLINE TO BE SHOWN IN HEADER OVERLAYS..." 
                    className="w-full px-4 py-3 bg-zinc-50 border border-[#EEEEEE] border-zinc-200 rounded-none focus:outline-none focus:border-black font-medium text-sm resize-none" 
                  />
                </div>

                {/* 4. Upload Cover image */}
                <span className="h-px bg-zinc-100 block" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Category Cover Image</h5>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight -mt-3">Tap to upload square thumbnail (displayed in search & browse)</p>
                    
                    {formData.iconImage ? (
                      <div className="relative w-28 h-28 bg-zinc-50 border border-zinc-200 p-2 flex items-center justify-center">
                        <img src={formData.iconImage} alt="Cover thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={removeThumbnailImage}
                          className="absolute -top-2 -right-2 bg-red-600 border border-zinc-200 text-white p-1 hover:bg-red-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="w-28 h-28 border-2 border-dashed border-zinc-200 hover:border-black bg-zinc-50 hover:bg-zinc-100/50 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <Camera className="w-5 h-5 text-gray-400" />
                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Upload Cover</span>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={thumbnailInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => processThumbnailFile(e.target.files)}
                    />
                    {thumbnailError && (
                      <p className="text-[10px] text-red-600 font-bold">{thumbnailError}</p>
                    )}
                  </div>

                  {/* 5. Upload banners image */}
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Category Page Hero Banners</h5>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight -mt-3">Drag to reorder, replace, or remove banners (Auto-slider enabled for multiple)</p>
                    
                    <div 
                      onClick={() => bannerGalleryInputRef.current?.click()}
                      className="border-2 border-dashed border-zinc-200 hover:border-black bg-zinc-50 hover:bg-zinc-100/50 p-6 text-center cursor-pointer min-h-[112px] flex flex-col items-center justify-center mb-4"
                    >
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-[9px] text-black font-extrabold uppercase tracking-widest">TAP TO UPLOAD MORE BANNERS</span>
                      <span className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5">JPG, PNG, WEBP FORMATS ONLY</span>
                    </div>

                    {bannerImages.length > 0 && (
                      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                        {bannerImages.map((bUrl, idx) => (
                          <div key={idx} className="relative flex-shrink-0 w-[120px] h-[70px] border border-zinc-200 p-0.5 bg-white group rounded-lg overflow-hidden">
                            <img src={bUrl} alt={`banner ${idx}`} className="w-full h-full object-cover rounded-md" referrerPolicy="no-referrer" />
                            
                            {/* Management Actions */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.createElement('input');
                                  input.type = 'file';
                                  input.accept = 'image/*';
                                  input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const url = URL.createObjectURL(file);
                                      const newImages = [...bannerImages];
                                      const newFiles = [...bannerFiles];
                                      newImages[idx] = url;
                                      newFiles[idx] = file;
                                      setBannerImages(newImages);
                                      setBannerFiles(newFiles);
                                    }
                                  };
                                  input.click();
                                }}
                                className="text-white text-[9px] font-black uppercase hover:text-orange-400 absolute top-1 left-1 bg-black/50 px-1 rounded"
                              >
                                Edit
                              </button>
                                <button
                                  type="button"
                                  onClick={() => removeBannerImage(idx)}
                                  className="text-white hover:text-red-400 absolute top-1 right-1 bg-red-600/50 p-0.5 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <input 
                      type="file" 
                      ref={bannerGalleryInputRef} 
                      className="hidden" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => processBannerFiles(e.target.files)} 
                    />
                    {bannerError && (
                      <p className="text-[10px] text-red-650 text-red-650 text-red-600 font-bold mt-2">{bannerError}</p>
                    )}
                  </div>
                </div>

                {/* Wide Banner 16:9 & Button / Product details */}
                <span className="h-px bg-zinc-100 block" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Wide Banner (16:9)</h5>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight -mt-3">Tap to upload category specific wide landscape banner</p>
                    
                    {formData.wideBannerImage ? (
                      <div className="relative w-full aspect-[16/9] max-w-[280px] bg-zinc-50 border border-zinc-200 p-2 flex items-center justify-center">
                        <img src={formData.wideBannerImage} alt="Wide banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={removeWideBannerImage}
                          className="absolute -top-2 -right-2 bg-red-600 border border-zinc-200 text-white p-1 hover:bg-red-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => wideBannerInputRef.current?.click()}
                        className="w-full aspect-[16/9] max-w-[280px] border-2 border-dashed border-zinc-200 hover:border-black bg-zinc-50 hover:bg-zinc-100/50 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all text-center animate-fade-in"
                      >
                        <Camera className="w-5 h-5 text-gray-400" />
                        <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Upload Wide Banner</span>
                      </div>
                    )}
                    
                    <input 
                      type="file" 
                      ref={wideBannerInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => processWideBannerFile(e.target.files)}
                    />
                    {wideBannerError && (
                      <p className="text-[10px] text-red-600 font-bold">{wideBannerError}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-black uppercase tracking-widest font-black">Featured Products (IDs / SKUs)</label>
                      <input 
                        type="text" 
                        name="featuredProducts" 
                        value={formData.featuredProducts}
                        onChange={handleInputChange}
                        placeholder="e.g. SKU-123, SKU-456, SKU-789" 
                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-semibold text-xs text-black" 
                      />
                    </div>
                  </div>
                </div>

                <span className="h-px bg-zinc-100 block" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest font-black">Button Text</label>
                    <input 
                      type="text" 
                      name="buttonText" 
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      placeholder="e.g. SHOP NOW, EXPLORE MORE" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-semibold text-xs text-black" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest font-black">Button Link</label>
                    <input 
                      type="text" 
                      name="buttonLink" 
                      value={formData.buttonLink}
                      onChange={handleInputChange}
                      placeholder="e.g. /category/electronics, https://..." 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-mono font-semibold text-xs text-black" 
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest">Meta Title Title Tag</label>
                  <input 
                    type="text" 
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Enter meta title tag details..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest">Search Keywords</label>
                  <input 
                    type="text" 
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleInputChange}
                    placeholder="e.g. cosmetics, original products, skin care"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest">Meta Search Description</label>
                  <textarea 
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Brief description preview for SEO listings..."
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black text-xs font-bold resize-none"
                  />
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-200">
                  <h5 className="text-[8px] font-black text-black uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Search Engine Snippet Preview
                  </h5>
                  <div className="space-y-1 text-left">
                    <p className="text-sm font-bold text-blue-700 hover:underline cursor-pointer">
                      {formData.metaTitle || (formData.name ? `${formData.name} - Tazu Mart BD` : 'Page Title Preview')}
                    </p>
                    <p className="text-[10px] text-green-750 text-green-700">https://tazumartbd.com/category/{formData.slug || 'category-name'}</p>
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1">
                      {formData.metaDescription || (formData.description || 'Provide a meta description overview details...')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Status / Position settings */}
        <div className="lg:col-span-4 p-6 md:p-8 bg-zinc-50/50 space-y-8 select-none">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">Status Settings</h4>
            
            <div className="p-4 border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Tab Status</h5>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest">Visible on listings</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('status')}
                  className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all ${
                    formData.status === 'Active' ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'
                  }`}
                >
                  {formData.status === 'Active' ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="h-px bg-zinc-100" />

              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Show in homepage</h5>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest">Home grids display</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('showOnHomepage')}
                  className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all ${
                    formData.showOnHomepage ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'
                  }`}
                >
                  {formData.showOnHomepage ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <h4 className="text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3 mt-6">Slider Settings</h4>

            <div className="p-4 border border-zinc-200 bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Auto Scroll</h5>
                <button
                  type="button"
                  onClick={() => setSliderSettings(p => ({...p, autoScroll: !p.autoScroll}))}
                  className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest border ${sliderSettings.autoScroll ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'}`}
                >
                  {sliderSettings.autoScroll ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-black text-black uppercase tracking-widest">Manual Scroll</h5>
                <button
                  type="button"
                  onClick={() => setSliderSettings(p => ({...p, manualScroll: !p.manualScroll}))}
                  className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest border ${sliderSettings.manualScroll ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'}`}
                >
                  {sliderSettings.manualScroll ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">Auto Scroll Interval (Seconds)</label>
                <input 
                  type="number"
                  value={sliderSettings.interval}
                  onChange={(e) => setSliderSettings(p => ({...p, interval: Number(e.target.value)}))}
                  className="w-full px-4 py-2 bg-white border border-zinc-200 text-xs font-bold"
                />
              </div>
            </div>

            {/* Display sequence order number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase tracking-widest">Display Sequence Order Position *</label>
              <input 
                type="number" 
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-none focus:outline-none focus:border-black font-black text-xs text-black" 
                min="1"
              />
              {displayOrderError && (
                <p className="text-[10px] text-red-650 text-red-650 text-red-600 font-bold">{displayOrderError}</p>
              )}
            </div>

            {/* Save Buttons */}
            <div className="pt-8">
              <button
                type="submit"
                className="w-full bg-black hover:bg-zinc-900 border border-black text-white py-4 font-black uppercase text-xs tracking-widest text-center cursor-pointer transition-colors disabled:bg-zinc-700 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'SAVING...' : '[ SAVE CATEGORY ]'}
              </button>
            </div>
          </div>
        </div>
      </form>
      </div>
    );
  }
