import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Upload, Image as ImageIcon, Save, X, Trash2, ArrowRight, Loader2, Sparkles, Globe, Settings, Eye, Check, Plus, Camera, AlertCircle } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCategoryStore, Category } from '../../store/useCategoryStore';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AddCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { categories, addCategory, updateCategory } = useCategoryStore();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bannerName: '',
    slug: '',
    bannerImage: '',
    iconImage: '',
    description: '',
    displayOrder: 1,
    status: 'Active' as 'Active' | 'Inactive',
    showOnHomepage: true,
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  });

  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [displayOrderError, setDisplayOrderError] = useState<string | null>(null);

  // Refs for native file uploads
  const bannerGalleryInputRef = useRef<HTMLInputElement>(null);
  const bannerCameraInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const plusBannerInputRef = useRef<HTMLInputElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing) {
      const category = categories.find(c => c.id === id);
      if (category) {
        setFormData({
          name: category.name,
          bannerName: category.bannerName,
          slug: category.slug,
          bannerImage: category.bannerImage,
          iconImage: category.iconImage || '',
          description: category.description || '',
          displayOrder: category.displayOrder,
          status: category.status,
          showOnHomepage: category.showOnHomepage,
          metaTitle: category.metaTitle || '',
          metaDescription: category.metaDescription || '',
          keywords: category.keywords || ''
        });
        setBannerImages(category.bannerImages && category.bannerImages.length > 0 ? category.bannerImages : (category.bannerImage ? [category.bannerImage] : []));
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

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const items = [...bannerImages];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    setBannerImages(items);
    setDraggedIndex(null);
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= bannerImages.length) return;
    const items = [...bannerImages];
    const temp = items[index];
    items[index] = items[nextIndex];
    items[nextIndex] = temp;
    setBannerImages(items);
  };

  const processBannerFiles = (files: FileList | null) => {
    if (!files) return;
    setBannerError(null);
    const newBanners = [...bannerImages];

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
    }
    setBannerImages(newBanners);
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
  };

  const removeBannerImage = (index: number) => {
    const target = bannerImages[index];
    if (target && target.startsWith('blob:')) {
      URL.revokeObjectURL(target);
    }
    setBannerImages(bannerImages.filter((_, i) => i !== index));
  };

  const removeThumbnailImage = () => {
    if (formData.iconImage && formData.iconImage.startsWith('blob:')) {
      URL.revokeObjectURL(formData.iconImage);
    }
    setFormData(prev => ({ ...prev, iconImage: '' }));
  };

  const handleSubmit = (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();

    // Prevent duplicate positions (excluding current category when editing)
    const orderNum = Number(formData.displayOrder);
    if (!isNaN(orderNum)) {
      const hasDuplicate = categories.some(c => c.displayOrder === orderNum && c.id !== id);
      if (hasDuplicate) {
        setDisplayOrderError("This display order is already assigned.");
        return;
      }
    }

    if (bannerImages.length === 0) {
      setBannerError("Please upload at least one category banner.");
      return;
    }
    setIsLoading(true);

    const submissionData = {
      ...formData,
      displayOrder: isNaN(orderNum) || formData.displayOrder === '' ? categories.length + 1 : orderNum,
      bannerImage: bannerImages[0],
      bannerImages: bannerImages
    };

    setTimeout(() => {
      if (isEditing && id) {
        updateCategory(id, submissionData);
      } else {
        addCategory(submissionData);
      }
      setIsLoading(false);
      if (!addAnother) {
        navigate('/admin/categories');
      } else if (!isEditing) {
        setFormData({
            name: '',
            bannerName: '',
            slug: '',
            bannerImage: '',
            iconImage: '',
            description: '',
            displayOrder: categories.length + 1,
            status: 'Active',
            showOnHomepage: true,
            metaTitle: '',
            metaDescription: '',
            keywords: ''
        });
        setBannerImages([]);
      }
    }, 1500);
  };

  const [activeSection, setActiveSection] = useState<'general' | 'seo'>('general');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/categories" 
            className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-black hover:bg-gray-50 transition-all shadow-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tight">{isEditing ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}</h2>
            <p className="text-[#707070] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Configure your category details & aesthetics</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button 
             onClick={() => navigate('/admin/categories')}
             className="flex-1 sm:flex-none border-2 border-black bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white active:scale-95 transition-all"
           >
             Cancel
           </button>
           <button 
             onClick={(e) => handleSubmit(e)}
             disabled={isLoading}
             className="flex-1 sm:flex-none bg-black text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2"
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> {isEditing ? 'UPDATE CATEGORY' : 'Save Category'}</>}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Main Form Area */}
         <div className="lg:col-span-8 space-y-8">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 gap-10">
               <button 
                 onClick={() => setActiveSection('general')}
                 className={cn(
                   "pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative",
                   activeSection === 'general' ? 'text-black' : 'text-gray-400 hover:text-black'
                 )}
               >
                 General Information
                 {activeSection === 'general' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
               </button>
               <button 
                 onClick={() => setActiveSection('seo')}
                 className={cn(
                   "pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative",
                   activeSection === 'seo' ? 'text-black' : 'text-gray-400 hover:text-black'
                 )}
               >
                 SEO Configuration
                 {activeSection === 'seo' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />}
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
               {activeSection === 'general' ? (
                 <div className="space-y-8">
                    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-black">
                             <Settings className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-black text-black uppercase tracking-tight">Basic Information</h3>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Category Name *</label>
                             <input 
                               type="text" 
                               name="name"
                               required
                               placeholder="e.g., Luxury Perfume"
                               value={formData.name}
                               onChange={handleInputChange}
                               className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Category Slug *</label>
                             <div className="relative">
                                <input 
                                  type="text" 
                                  name="slug"
                                  required
                                  placeholder="luxury-perfume"
                                  value={formData.slug}
                                  onChange={handleInputChange}
                                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300 pr-12"
                                />
                                <Globe className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                             </div>
                          </div>
                          <div className="md:col-span-2 space-y-3">
                             <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Banner Title / Name *</label>
                             <input 
                               type="text" 
                               name="bannerName"
                               required
                               placeholder="e.g., PREMIUM OUD COLLECTION"
                               value={formData.bannerName}
                               onChange={handleInputChange}
                               className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300"
                             />
                          </div>
                          <div className="md:col-span-2 space-y-3">
                             <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Description</label>
                             <textarea 
                               name="description"
                               rows={5}
                               placeholder="Detailed description of the category..."
                               value={formData.description}
                               onChange={handleInputChange}
                               className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300 resize-none"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Media Card */}
                    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-black">
                             <ImageIcon className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-black text-black uppercase tracking-tight">Category Media</h3>
                       </div>

                       {/* Hidden File Inputs */}
                       <input 
                          type="file" 
                          multiple
                          accept="image/jpeg,image/png,image/webp,image/jpg" 
                          className="hidden" 
                          ref={bannerGalleryInputRef} 
                          onChange={(e) => { processBannerFiles(e.target.files); setShowSourceSheet(false); }} 
                       />
                       <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp,image/jpg" 
                          capture="environment" 
                          className="hidden" 
                          ref={bannerCameraInputRef} 
                          onChange={(e) => { processBannerFiles(e.target.files); setShowSourceSheet(false); }} 
                       />
                       <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp,image/jpg" 
                          className="hidden" 
                          ref={plusBannerInputRef} 
                          onChange={(e) => processBannerFiles(e.target.files)} 
                       />
                       <input 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp,image/jpg" 
                          className="hidden" 
                          ref={thumbnailInputRef} 
                          onChange={(e) => processThumbnailFile(e.target.files)} 
                       />

                       <div className="space-y-8">
                          {/* SECTION 1: CATEGORY BANNERS */}
                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Category Banners (Unlimited) *</label>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Drag to reorder</span>
                             </div>

                             {bannerError && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-bold flex items-center gap-2">
                                   <AlertCircle className="w-4 h-4 shrink-0" />
                                   {bannerError}
                                </div>
                             )}

                             <AnimatePresence mode="popLayout">
                                {bannerImages.length === 0 ? (
                                   <motion.div 
                                      initial={{ opacity: 0, scale: 0.98 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.98 }}
                                      onClick={() => setShowSourceSheet(true)}
                                      className="w-full aspect-[16/6] border-2 border-dashed border-gray-200 rounded-[22px] bg-gray-50/50 hover:bg-gray-50 hover:border-black/30 cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all group select-none"
                                   >
                                      <div className="w-14 h-14 bg-white shadow-sm border border-gray-150 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-gray-400 group-hover:text-black animate-pulse">
                                         <Upload className="w-6 h-6 stroke-[2.5]" />
                                      </div>
                                      <p className="text-sm font-black text-black uppercase tracking-tight">Tap to upload category banners</p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Max: 5MB • JPG, PNG, WEBP (Landscape 16:6)</p>
                                   </motion.div>
                                ) : (
                                   <div className="space-y-4">
                                      <div className="space-y-4">
                                         {bannerImages.map((banner, index) => (
                                            <motion.div
                                               key={`${banner}-${index}`}
                                               layout
                                               initial={{ opacity: 0, y: 15 }}
                                               animate={{ opacity: 1, y: 0 }}
                                               exit={{ opacity: 0, scale: 0.95 }}
                                               transition={{ type: "spring", damping: 25, stiffness: 220 }}
                                               draggable
                                               onDragStart={() => handleDragStart(index)}
                                               onDragOver={(e) => handleDragOver(e, index)}
                                               onDrop={() => handleDrop(index)}
                                               className={cn(
                                                  "relative w-full aspect-[16/6] rounded-[22px] overflow-hidden bg-gray-800 shadow-sm group border cursor-grab active:cursor-grabbing transition-transform",
                                                  draggedIndex === index ? "opacity-40 border-black ring-2 ring-black/10 scale-[0.98]" : "border-gray-100 hover:shadow-md"
                                               )}
                                            >
                                               <img src={banner} alt={`Banner ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700" referrerPolicy="no-referrer" />

                                               {/* Gradient shade overlays */}
                                               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                                               {/* Badge layout */}
                                               <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between pointer-events-none">
                                                 {index === 0 ? (
                                                    <span className="bg-black text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                                       <Check className="w-3 h-3 stroke-[3]" /> PRIMARY BANNER
                                                    </span>
                                                 ) : (
                                                    <span className="bg-white/95 text-black text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                                                       Banner {index + 1}
                                                    </span>
                                                 )}
                                               </div>

                                               {/* Drag handles & reorder overlay buttons */}
                                               <div className="absolute top-4 left-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveBanner(index, 'up'); }}
                                                    disabled={index === 0}
                                                    className="w-8 h-8 rounded-full bg-white/95 text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center shadow-lg disabled:opacity-45 disabled:hover:bg-white/95 disabled:hover:text-black cursor-pointer text-xs font-black"
                                                  >
                                                    ↑
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); moveBanner(index, 'down'); }}
                                                    disabled={index === bannerImages.length - 1}
                                                    className="w-8 h-8 rounded-full bg-white/95 text-black hover:bg-black hover:text-white transition-colors flex items-center justify-center shadow-lg disabled:opacity-45 disabled:hover:bg-white/95 disabled:hover:text-black cursor-pointer text-xs font-black"
                                                  >
                                                    ↓
                                                  </button>
                                               </div>

                                               {/* Remove button top right */}
                                               <button
                                                 type="button"
                                                 onClick={(e) => { e.stopPropagation(); removeBannerImage(index); }}
                                                 className="absolute top-4 right-4 w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                                               >
                                                 <X className="w-4 h-4 stroke-[3]" />
                                               </button>
                                            </motion.div>
                                         ))}
                                      </div>

                                      {/* Plus-Card at the bottom */}
                                      <motion.button
                                        whileHover={{ scale: 1.005 }}
                                        whileTap={{ scale: 0.995 }}
                                        type="button"
                                        onClick={() => plusBannerInputRef.current?.click()}
                                        className="w-full aspect-[16/6] rounded-[22px] border-2 border-dashed border-gray-200 hover:border-black/30 hover:bg-gray-50/50 bg-white flex flex-col items-center justify-center transition-all group gap-2 shadow-sm cursor-pointer"
                                      >
                                        <div className="w-12 h-12 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-full flex items-center justify-center transition-all shadow-sm">
                                           <Plus className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <span className="text-xs font-black text-gray-400 group-hover:text-black uppercase tracking-widest transition-colors">Add More Banner</span>
                                      </motion.button>
                                   </div>
                                )}
                             </AnimatePresence>
                          </div>

                          {/* SECTION 2: CATEGORY ICON / THUMBNAIL */}
                          <div className="space-y-4">
                             <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Icon / Thumbnail (Single Square)</label>
                             
                             {thumbnailError && (
                                <div className="p-4 bg-red-50 text-red-605 rounded-2xl border border-red-101 text-xs font-bold flex items-center gap-2">
                                   <AlertCircle className="w-4 h-4 shrink-0" />
                                   {thumbnailError}
                                </div>
                             )}

                             <div className="flex items-center gap-6">
                                <AnimatePresence mode="wait">
                                   {formData.iconImage ? (
                                      <motion.div 
                                         key="icon-preview"
                                         initial={{ opacity: 0, scale: 0.9 }}
                                         animate={{ opacity: 1, scale: 1 }}
                                         exit={{ opacity: 0, scale: 0.9 }}
                                         className="relative w-32 h-32 rounded-[18px] bg-gray-50 border border-gray-150 p-2 overflow-hidden flex items-center justify-center group/icon shrink-0 shadow-sm"
                                      >
                                         <img src={formData.iconImage} alt="Icon preview" className="w-full h-full object-cover rounded-[14px]" referrerPolicy="no-referrer" />
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none rounded-[18px]" />
                                         
                                         <button
                                           type="button"
                                           onClick={removeThumbnailImage}
                                           className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                         >
                                           <X className="w-3.5 h-3.5 stroke-[3]" />
                                         </button>
                                      </motion.div>
                                   ) : (
                                      <motion.div
                                         key="icon-empty"
                                         initial={{ opacity: 0 }}
                                         animate={{ opacity: 1 }}
                                         exit={{ opacity: 0 }}
                                         onClick={() => thumbnailInputRef.current?.click()}
                                         className="w-32 h-32 rounded-[18px] border-2 border-dashed border-gray-200 hover:border-black/30 hover:bg-gray-50/50 bg-white cursor-pointer flex flex-col items-center justify-center transition-all group shrink-0 text-center p-3 select-none"
                                      >
                                         <div className="w-10 h-10 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-full flex items-center justify-center mb-1.5 transition-all shadow-sm">
                                            <Sparkles className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                                         </div>
                                         <span className="text-[9px] font-black text-gray-400 group-hover:text-black uppercase tracking-wider leading-tight">Upload category icon</span>
                                         <span className="text-[7.5px] text-gray-300 font-bold uppercase tracking-wider mt-1">2MB Max (1:1)</span>
                                      </motion.div>
                                   )}
                                </AnimatePresence>

                                <div className="space-y-1">
                                   <h4 className="text-xs font-black text-black uppercase tracking-tight">Category Badge Icon</h4>
                                   <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed tracking-wider">
                                      This item represents the category thumbnail across clean category blocks, menus, and compact interfaces. Maximum file size of 2MB in square parameters is recommended.
                                   </p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Bottom Sheet Source Selector popup */}
                    <AnimatePresence>
                       {showSourceSheet && (
                          <>
                             {/* Blur overlay backdrop */}
                             <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowSourceSheet(false)}
                                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] transition-all"
                             />

                             {/* Bottom sliding modal Sheet */}
                             <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 250 }}
                                className="fixed bottom-0 inset-x-0 bg-white rounded-t-[32px] shadow-[0_-12px_45px_rgba(0,0,0,0.2)] z-[101] max-w-md mx-auto overflow-hidden text-center pb-8 border border-gray-100"
                             >
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-4" />
                                <div className="px-8 pt-2 pb-6 space-y-6">
                                   <div>
                                      <h4 className="text-lg font-black text-black uppercase tracking-tight">Select Image Source</h4>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Choose an option below to fetch banners</p>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                      <motion.button
                                         whileHover={{ scale: 1.02 }}
                                         whileTap={{ scale: 0.98 }}
                                         type="button"
                                         onClick={() => bannerGalleryInputRef.current?.click()}
                                         className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-black hover:text-white rounded-3xl border border-gray-100 transition-all group/opt relative text-black"
                                      >
                                         <ImageIcon className="w-8 h-8 stroke-[1.5] mb-2 group-hover/opt:scale-110 group-hover/opt:text-white transition-all text-gray-600" />
                                         <span className="text-xs font-black uppercase tracking-widest font-sans">Gallery</span>
                                         <span className="text-[8px] opacity-60 font-medium uppercase mt-1">Browse photos</span>
                                      </motion.button>

                                      <motion.button
                                         whileHover={{ scale: 1.02 }}
                                         whileTap={{ scale: 0.98 }}
                                         type="button"
                                         onClick={() => bannerCameraInputRef.current?.click()}
                                         className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-black hover:text-white rounded-3xl border border-gray-100 transition-all group/opt relative text-black"
                                      >
                                         <Camera className="w-8 h-8 stroke-[1.5] mb-2 group-hover/opt:scale-110 group-hover/opt:text-white transition-all text-gray-600" />
                                         <span className="text-xs font-black uppercase tracking-widest font-sans">Camera</span>
                                         <span className="text-[8px] opacity-60 font-medium uppercase mt-1">Take quick photo</span>
                                      </motion.button>
                                   </div>

                                   <button 
                                      type="button"
                                      onClick={() => setShowSourceSheet(false)}
                                      className="w-full bg-gray-100 font-black text-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 active:scale-95 transition-all text-center font-sans cursor-pointer"
                                   >
                                      Cancel
                                   </button>
                                </div>
                             </motion.div>
                          </>
                       )}
                    </AnimatePresence>
                 </div>
               ) : (
                 <motion.div 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-8"
                 >
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-black">
                          <Globe className="w-4 h-4" />
                       </div>
                       <h3 className="text-sm font-black text-black uppercase tracking-tight">SEO Optimization</h3>
                    </div>

                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Meta Title</label>
                          <input 
                            type="text" 
                            name="metaTitle"
                            placeholder="SEO Optimized Page Title"
                            value={formData.metaTitle}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Keywords</label>
                          <input 
                            type="text" 
                            name="keywords"
                            placeholder="fashion, ecommerce, luxury, deals"
                            value={formData.keywords}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">Meta Description</label>
                          <textarea 
                            name="metaDescription"
                            rows={6}
                            placeholder="Summary for search results (max 160 characters)"
                            value={formData.metaDescription}
                            onChange={handleInputChange}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-black transition-all placeholder:font-medium placeholder:text-gray-300 resize-none"
                          />
                       </div>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-[24px] border border-gray-100">
                       <h5 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Google Search Preview
                       </h5>
                       <div className="space-y-1.5">
                          <h6 className="text-[18px] font-bold text-blue-700 leading-tight hover:underline cursor-pointer">
                             {formData.metaTitle || (formData.name ? `${formData.name} - Tazu Mart BD` : 'Page Title Preview')}
                          </h6>
                          <p className="text-[13px] text-green-800 line-clamp-1">https://tazumartbd.com/category/{formData.slug || 'category-name'}</p>
                          <p className="text-[12px] text-gray-500 font-medium line-clamp-3 mt-1.5 leading-relaxed">
                             {formData.metaDescription || (formData.description || 'Provide a meta description to help search engines understand the content of this category page.')}
                          </p>
                       </div>
                    </div>
                 </motion.div>
               )}
            </form>
         </div>

         {/* Sidebar Controls */}
         <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm space-y-10 sticky top-24">
               <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight mb-8">Status & Visibility</h3>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                           <h5 className="text-[11px] font-black text-black uppercase tracking-tight mb-1">Category Status</h5>
                           <p className="text-[9px] text-[#707070] font-bold uppercase tracking-widest">Control visibility</p>
                        </div>
                                <button 
                                  onClick={() => handleToggle('status')}
                                  type="button"
                                  className={cn(
                                    "w-12 h-6 rounded-full transition-all relative p-1",
                                    formData.status === 'Active' ? 'bg-black' : 'bg-gray-200'
                                  )}
                                >
                           <div className={cn("w-4 h-4 bg-white rounded-full transition-all", formData.status === 'Active' ? 'translate-x-6' : 'translate-x-0')} />
                        </button>
                     </div>

                     <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <div>
                           <h5 className="text-[11px] font-black text-black uppercase tracking-tight mb-1">Homepage Visibility</h5>
                           <p className="text-[9px] text-[#707070] font-bold uppercase tracking-widest">Show in front end</p>
                        </div>
                        <button 
                          onClick={() => handleToggle('showOnHomepage')}
                          type="button"
                          className={cn(
                            "w-12 h-6 rounded-full transition-all relative p-1",
                            formData.showOnHomepage ? 'bg-black' : 'bg-gray-200'
                          )}
                        >
                           <div className={cn("w-4 h-4 bg-white rounded-full transition-all", formData.showOnHomepage ? 'translate-x-6' : 'translate-x-0')} />
                        </button>
                     </div>
                  </div>
               </div>

               <div className="h-px bg-gray-100" />

               <div>
                  <h3 className="text-sm font-black text-black uppercase tracking-tight mb-6">Sequence Setting</h3>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-1">CATEGORY DISPLAY ORDER *</label>
                     <input 
                       type="number" 
                       name="displayOrder"
                       placeholder="Enter homepage category position"
                       min="1"
                       value={formData.displayOrder}
                       onChange={handleInputChange}
                       className={cn(
                         "w-full bg-gray-50 border rounded-2xl px-6 py-4 text-sm font-black focus:outline-none focus:border-black transition-all",
                         displayOrderError ? "border-red-550 focus:border-red-550 border-red-500" : "border-gray-100"
                       )}
                     />
                     {displayOrderError && (
                        <p className="text-xs text-red-650 text-red-600 font-bold mt-1 ml-1">{displayOrderError}</p>
                     )}
                     <p className="text-[9px] text-gray-400 font-bold uppercase ml-1 italic tracking-widest leading-relaxed">
                        Controls where this category appears on homepage.
                     </p>
                  </div>
               </div>

               <div className="pt-4 space-y-4">
                  <button 
                    onClick={(e) => handleSubmit(e)}
                    className="w-full bg-black text-white py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    {isEditing ? 'UPDATE CATEGORY' : 'Publish Category'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  {!isEditing && (
                    <button 
                      onClick={(e) => handleSubmit(e, true)}
                      className="w-full border-2 border-gray-100 bg-white text-black py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 hover:border-black transition-all active:scale-95"
                    >
                      Save & Add Another
                    </button>
                  )}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
