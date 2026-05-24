import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Filter, Plus, Edit, Trash2, Upload, X, Image as ImageIcon, ChevronLeft, Share2, ChevronDown, ChevronRight, Play, Camera, AlertCircle, Check, MoreVertical } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';

function AdminProductList() {
  const navigate = useNavigate();
  const { products, updateProduct } = useProductStore();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuProductId(null);
    };
    if (openMenuProductId) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [openMenuProductId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2500);
  };

  const toggleMenu = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (openMenuProductId === productId) {
      setOpenMenuProductId(null);
    } else {
      setOpenMenuProductId(productId);
    }
  };

  const handleShareProduct = (product: any) => {
    const productUrl = `${window.location.origin}/product/${product.id}`;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at only ৳${(product.discountPrice || product.price).toLocaleString()}!`,
        url: productUrl,
      }).catch(() => {
        navigator.clipboard.writeText(productUrl);
        showToast("Product link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      showToast("Link copied to clipboard!");
    }
  };

  const { categories: categoryList } = useCategoryStore();
  const categories = ['All', ...categoryList.map(c => c.name)];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'All' || product.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 border border-[#EEEEEE] rounded-none bg-white hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#000000]" />
          </button>
          <h3 className="text-xl font-bold text-[#000000]">Products</h3>
        </div>
        <div className="flex gap-3 items-center">
          <div className="bg-white border border-[#EEEEEE] px-3 py-1.5 rounded-none text-sm font-semibold shadow-sm">
            {filteredProducts.length} Total
          </div>
          <Link 
            to="/admin/products/add" 
            className="bg-[#a855f7] text-white p-2.5 rounded-none shadow-md hover:bg-[#9333ea] transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input 
          type="text" 
          placeholder="Search products by name or SKU..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#EEEEEE] rounded-none text-sm focus:outline-none focus:border-[#a855f7] shadow-sm transition-colors" 
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Category Tabs */}
      <div className="mb-6 overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${
                activeTab === category 
                  ? 'bg-[#000000] text-white border-[#000000]' 
                  : 'bg-white text-[#666666] border-[#EEEEEE] hover:border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
        {filteredProducts.map((product) => {
          const discountPercent = product.discountPrice 
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
            : 0;

          return (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-none p-4 border border-[#EEEEEE] shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 rounded-[12px] bg-gray-100 shrink-0 overflow-hidden relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-[8px]">
                      -{discountPercent}%
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#a855f7] bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 truncate mt-1">
                        {product.category}
                      </span>
                      
                      {/* Three-Dot Action Dropdown Menu */}
                      <div className="relative">
                        <button 
                          onClick={(e) => toggleMenu(product.id, e)}
                          className="p-1 px-1.5 text-[#666666] hover:bg-black/5 active:bg-black/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                          title="Options"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        <AnimatePresence>
                          {openMenuProductId === product.id && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-1 w-44 bg-white border border-[#EEEEEE] rounded-[10px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-1 z-40 text-left origin-top-right overflow-hidden"
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleShareProduct(product);
                                  setOpenMenuProductId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Share2 className="w-4 h-4 text-gray-400" />
                                <span>Share This Product</span>
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigate(`/admin/products/edit/${product.id}`);
                                  setOpenMenuProductId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-t border-gray-100 cursor-pointer"
                              >
                                <Edit className="w-4 h-4 text-gray-400" />
                                <span>Edit This Product</span>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-[#000000] text-sm line-clamp-2 leading-tight mb-1">
                      {product.name}
                    </h4>
                    
                    <p className="text-[11px] text-gray-500 font-medium">SKU: {product.sku}</p>
                    
                    {/* Quick Toggles */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          updateProduct(product.id, { is_flash_sale: !product.is_flash_sale });
                        }}
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-[6px] transition-all border shrink-0 flex items-center gap-1 cursor-pointer ${
                          product.is_flash_sale 
                            ? 'bg-red-500 text-white border-red-500' 
                            : 'bg-white text-gray-400 border-gray-200 hover:text-black hover:border-black'
                        }`}
                        title="Toggle Flash Sale"
                      >
                        ⚡ Flash
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          updateProduct(product.id, { is_trending: !product.is_trending });
                        }}
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-[6px] transition-all border shrink-0 flex items-center gap-1 cursor-pointer ${
                          product.is_trending 
                            ? 'bg-orange-500 text-white border-orange-500' 
                            : 'bg-white text-gray-400 border-gray-200 hover:text-black hover:border-black'
                        }`}
                        title="Toggle Trending"
                      >
                        🔥 Trend
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          updateProduct(product.id, { is_best_selling: !product.is_best_selling });
                        }}
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-[6px] transition-all border shrink-0 flex items-center gap-1 cursor-pointer ${
                          product.is_best_selling 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'bg-white text-gray-400 border-gray-200 hover:text-black hover:border-black'
                        }`}
                        title="Toggle Best Selling"
                      >
                        🏆 Best
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          updateProduct(product.id, { is_regular: !product.is_regular });
                        }}
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-[6px] transition-all border shrink-0 flex items-center gap-1 cursor-pointer ${
                          product.is_regular 
                            ? 'bg-neutral-900 text-white border-neutral-900' 
                            : 'bg-white text-gray-400 border-gray-200 hover:text-black hover:border-black'
                        }`}
                        title="Toggle Regular Category"
                      >
                        🛍 Regular
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex items-center justify-between">
                <div>
                  <div className="flex items-end gap-1.5 flex-wrap flex-col items-start">
                    {product.discountPrice ? (
                      <>
                        <span className="text-base font-bold text-[#000000]">
                          ৳{product.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400 font-medium line-through">
                          ৳{product.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-bold text-[#000000]">
                        ৳{product.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold mb-0.5">Stock</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-none mr-2 ${
                    product.stock > 10 ? 'bg-green-50 text-green-700' : 
                    product.stock > 0 ? 'bg-orange-50 text-orange-700' : 
                    'bg-red-50 text-red-700'
                  }`}>
                    {product.stock}
                  </span>

                  <button className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 text-[#000000] px-3 py-1.5 rounded-none border border-[#EEEEEE] transition-colors text-[11px] font-bold">
                    Stock <ChevronRight className="w-3 h-3" />
                  </button>
                  <button className="bg-gray-50 text-[#000000] p-1.5 flex items-center justify-center rounded-none border border-[#EEEEEE] hover:bg-gray-100">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
         <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-[#000000] font-bold">No products found</p>
            <p className="text-sm text-[#666666] mt-1">Try adjusting your search or filters</p>
         </div>
      )}
    </div>
  );
}

function AdminProductAdd() {
  const navigate = useNavigate();
  const { addProduct } = useProductStore();
  const { categories: categoryList } = useCategoryStore();

  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; file?: File; name: string }[]>([]);
  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    const newImages = [...uploadedImages];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (newImages.length >= 10) {
        setUploadError("Maximum 10 images allowed.");
        break;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setUploadError("Only JPG, PNG and WEBP formats are supported.");
        continue;
      }
      
      if (file.size > 4 * 1024 * 1024) {
        setUploadError(`Image "${file.name}" exceeds 4MB limit.`);
        continue;
      }

      const url = URL.createObjectURL(file);
      newImages.push({
        id: Math.random().toString(36).substring(2, 9),
        url,
        file,
        name: file.name
      });
    }
    
    setUploadedImages(newImages);
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    setShowSourceSheet(false);
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    setShowSourceSheet(false);
  };

  const triggerGallery = () => {
    galleryInputRef.current?.click();
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  const removeImage = (id: string) => {
    const target = uploadedImages.find(img => img.id === id);
    if (target && target.url.startsWith('blob:')) {
      URL.revokeObjectURL(target.url);
    }
    setUploadedImages(uploadedImages.filter(img => img.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newImages = [...uploadedImages];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setUploadedImages(newImages);
    setDraggedIndex(null);
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= uploadedImages.length) return;
    const newImages = [...uploadedImages];
    const temp = newImages[index];
    newImages[index] = newImages[newIndex];
    newImages[newIndex] = temp;
    setUploadedImages(newImages);
  };

  // Dynamic States
  const [seoPoints, setSeoPoints] = useState<string[]>(['']);
  const [variants, setVariants] = useState<{ title: string; option: string; price: string }[]>([]);
  const [shippingZones, setShippingZones] = useState<{ zone: string; charge: string }[]>([
    { zone: 'Inside Dhaka', charge: '80' },
    { zone: 'Outside Dhaka', charge: '150' }
  ]);

  const [isFlashSale, setIsFlashSale] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isBestSelling, setIsBestSelling] = useState(false);
  const [isRegular, setIsRegular] = useState(true);

  const addSeoPoint = () => {
    if (seoPoints.length < 15) {
      setSeoPoints([...seoPoints, '']);
    }
  };

  const removeSeoPoint = (index: number) => {
    if (seoPoints.length > 1) {
      setSeoPoints(seoPoints.filter((_, i) => i !== index));
    }
  };

  const updateSeoPoint = (index: number, value: string) => {
    const newPoints = [...seoPoints];
    newPoints[index] = value;
    setSeoPoints(newPoints);
  };

  const addVariant = () => {
    setVariants([...variants, { title: '', option: '', price: '' }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const addShippingZone = () => {
    setShippingZones([...shippingZones, { zone: '', charge: '' }]);
  };

  const removeShippingZone = (index: number) => {
    setShippingZones(shippingZones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProduct = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('sale_price')),
      discountPrice: formData.get('regular_price') ? Number(formData.get('regular_price')) : undefined,
      stock: Number(formData.get('stock_quantity')),
      sku: formData.get('product_code') as string,
      brand: formData.get('brand') as string,
      status: 'active' as const,
      description: formData.get('long_description') as string,
      image: uploadedImages[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      images: uploadedImages.length > 0 ? uploadedImages.map(i => i.url) : undefined,
      rating: 4.5,
      reviews: 0,
      isNew: true,
      // Additional fields for future use or store update
      buyingPrice: Number(formData.get('buying_price')),
      warranty: formData.get('warranty') as string,
      unitName: formData.get('unit_name') as string,
      seoPoints,
      variants,
      shippingZones,
      is_flash_sale: isFlashSale,
      is_trending: isTrending,
      is_best_selling: isBestSelling,
      is_regular: isRegular
    };

    addProduct(newProduct);
    navigate('/admin/products');
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#EEEEEE] shadow-[0_4px_30px_rgb(0,0,0,0.03)] overflow-hidden mb-12">
        <div className="p-6 border-b border-[#EEEEEE] flex justify-between items-center bg-gray-50/50">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-[12px] flex items-center justify-center text-white">
                 <Plus className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#000000]">Add New Product</h3>
           </div>
           <button onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-[#000000] bg-white border border-[#EEEEEE] p-2 rounded-full transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="p-6 md:p-10">
           <form className="space-y-12 max-w-5xl mx-auto" onSubmit={handleSubmit}>
              {/* SECTION: BASIC INFO */}
              <div className="space-y-8">
                 <div>
                    <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest mb-3">Product Images</label>
                    
                     {/* Horizontal Image Preview List or Empty Upload State */}
                     {uploadedImages.length === 0 ? (
                        <div 
                           onClick={() => setShowSourceSheet(true)}
                           className="border-2 border-dashed border-[#EAEAEA] rounded-[24px] p-8 text-center bg-white hover:bg-gray-50/50 hover:border-black/30 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[220px] group relative overflow-hidden"
                        >
                           <div className="w-16 h-16 bg-[#f8f8f8] group-hover:bg-black group-hover:text-white transition-colors rounded-full flex items-center justify-center mb-4 border border-[#EEEEEE] shadow-sm">
                              <Upload className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                           </div>
                           <p className="text-gray-900 font-bold text-base tracking-tight">Tap to upload product images</p>
                           <p className="text-xs text-gray-400 mt-1 font-medium">Supports JPG, PNG, WEBP (Max. 4MB, limit 10)</p>
                        </div>
                     ) : (
                        <div className="space-y-4">
                           <div className="flex gap-4 overflow-x-auto no-scrollbar py-3 px-1 -mx-1">
                              {uploadedImages.map((img, idx) => (
                                 <div
                                    key={img.id}
                                    draggable
                                    onDragStart={() => handleDragStart(idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDrop={() => handleDrop(idx)}
                                    className="relative w-36 h-36 rounded-[20px] border border-gray-100 bg-white shadow-md hover:shadow-lg shrink-0 overflow-hidden group cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02]"
                                 >
                                    <img src={img.url} alt={img.name} className="w-full h-full object-cover rounded-[18px] p-1" />
                                    
                                    {/* Badge for Primary / Index order */}
                                    {idx === 0 ? (
                                       <span className="absolute bottom-2 left-2 bg-black text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                                          PRIMARY
                                       </span>
                                    ) : (
                                       <span className="absolute bottom-2 left-2 bg-white/90 text-gray-500 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                          Index {idx + 1}
                                       </span>
                                    )}

                                    {/* Rearrange helpers */}
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={(e) => { e.stopPropagation(); moveImage(idx, 'left'); }}
                                          className="w-7 h-7 bg-white/95 text-gray-950 rounded-full flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-0 shadow-md transition-all font-bold text-xs"
                                       >
                                          ←
                                       </button>
                                       <button
                                          type="button"
                                          disabled={idx === uploadedImages.length - 1}
                                          onClick={(e) => { e.stopPropagation(); moveImage(idx, 'right'); }}
                                          className="w-7 h-7 bg-white/95 text-gray-950 rounded-full flex items-center justify-center hover:bg-black hover:text-white disabled:opacity-0 shadow-md transition-all font-bold text-xs"
                                       >
                                          →
                                       </button>
                                    </div>

                                    {/* Removable Top Right button */}
                                    <button
                                       type="button"
                                       onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                       className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white rounded-full flex items-center justify-center hover:bg-red-650 shadow-md transition-all scale-90 opacity-90 hover:scale-100"
                                    >
                                       <X className="w-4 h-4" />
                                    </button>
                                 </div>
                              ))}

                              {/* Plus Card for adding more directly from file dialog */}
                              {uploadedImages.length < 10 && (
                                 <button
                                    type="button"
                                    onClick={triggerGallery}
                                    className="w-36 h-36 rounded-[20px] border-2 border-dashed border-gray-200 hover:border-black/40 hover:bg-gray-50/50 bg-white flex flex-col items-center justify-center shrink-0 transition-all group gap-2"
                                 >
                                    <div className="w-10 h-10 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm">
                                       <Plus className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors">Add Image</span>
                                 </button>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Error State Banner */}
                     {uploadError && (
                        <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1.5 bg-red-50 p-3 rounded-xl border border-red-150">
                           <AlertCircle className="w-4 h-4" /> {uploadError}
                        </p>
                     )}

                     {/* Invisible/Hidden native pick inputs */}
                     <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/jpg" 
                        multiple 
                        className="hidden" 
                        ref={galleryInputRef} 
                        onChange={handleGalleryChange} 
                     />
                     <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/jpg" 
                        capture="environment" 
                        className="hidden" 
                        ref={cameraInputRef} 
                        onChange={handleCameraChange} 
                     />

                     {/* Popup Bottom Sheet markup */}
                     <AnimatePresence>
                        {showSourceSheet && (
                           <>
                              {/* Overlay Backdrop background blur */}
                              <motion.div
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                                 onClick={() => setShowSourceSheet(false)}
                                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-all"
                              />

                              {/* Sheet modal */}
                              <motion.div
                                 initial={{ y: "100%" }}
                                 animate={{ y: 0 }}
                                 exit={{ y: "100%" }}
                                 transition={{ type: "spring", damping: 25, stiffness: 220 }}
                                 className="fixed bottom-0 inset-x-0 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] z-[101] max-w-lg mx-auto overflow-hidden text-center"
                              >
                                 <div className="w-12 h-1.5 bg-gray-250 rounded-full mx-auto my-4 bg-gray-200" />
                                 <div className="px-8 pb-10 pt-4 space-y-6">
                                    <div className="space-y-1">
                                       <h4 className="text-xl font-bold text-gray-900 tracking-tight">Select Image Source</h4>
                                       <p className="text-gray-450 text-sm font-medium text-gray-400">Choose how you want to add product pictures</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                       <button
                                          type="button"
                                          onClick={triggerGallery}
                                          className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[24px] border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 active:scale-[0.98] transition-all gap-3.5 group"
                                       >
                                          <div className="w-14 h-14 bg-white shadow-sm border border-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-all">
                                             <ImageIcon className="w-6 h-6 animate-none" />
                                          </div>
                                          <div>
                                             <span className="font-bold text-gray-900 text-sm block">Gallery</span>
                                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 block">Pick from device</span>
                                          </div>
                                       </button>

                                       <button
                                          type="button"
                                          onClick={triggerCamera}
                                          className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[24px] border border-gray-100 hover:border-gray-200 hover:bg-gray-100/50 active:scale-[0.98] transition-all gap-3.5 group"
                                       >
                                          <div className="w-14 h-14 bg-white shadow-sm border border-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-black group-hover:text-white transition-all">
                                             <Camera className="w-6 h-6 animate-none" />
                                          </div>
                                          <div>
                                             <span className="font-bold text-gray-900 text-sm block">Camera</span>
                                             <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 block">Take a photo now</span>
                                          </div>
                                       </button>
                                    </div>

                                    <button
                                       type="button"
                                       onClick={() => setShowSourceSheet(false)}
                                       className="w-full h-14 bg-gray-100 text-gray-950 font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-gray-200 transition-colors animate-none"
                                    >
                                       Cancel
                                    </button>
                                 </div>
                              </motion.div>
                           </>
                        )}
                     </AnimatePresence>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Product Name</label>
                       <input name="name" required type="text" placeholder="e.g. Premium Leather Bag" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors font-medium" />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Category</label>
                       <select name="category" required className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-[16px] focus:outline-none focus:border-[#000000] transition-colors appearance-none font-medium">
                          <option value="">Select a category</option>
                          {categoryList.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                       </select>
                    </div>
                 </div>
              </div>

              {/* SECTION 1: PRESCRIPTION */}
              <div className="pt-10 border-t border-[#EEEEEE]">
                 <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-6 bg-black rounded-full" />
                    <h2 className="text-2xl font-black text-[#000000] uppercase tracking-tight">Prescription</h2>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">SEO Optimized Description</label>
                          <button 
                            type="button" 
                            onClick={addSeoPoint}
                            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                          >
                             <Plus className="w-3 h-3" /> Add Point
                          </button>
                       </div>
                       
                       <div className="space-y-3">
                          {seoPoints.map((point, index) => (
                             <motion.div 
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={index} 
                               className="flex items-center gap-3"
                             >
                                <div className="w-10 h-10 bg-white border border-[#EEEEEE] rounded-[10px] flex items-center justify-center text-[11px] font-bold text-gray-400 shrink-0 shadow-sm">
                                   {String(index + 1).padStart(2, '0')}
                                </div>
                                <input 
                                   value={point}
                                   onChange={(e) => updateSeoPoint(index, e.target.value)}
                                   placeholder={`Point ${index + 1} লিখুন...`} 
                                   className="flex-1 px-5 py-3.5 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-medium" 
                                />
                                <button 
                                   type="button"
                                   onClick={() => removeSeoPoint(index)}
                                   className="w-10 h-10 border border-[#EEEEEE] rounded-none flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </motion.div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Long Description</label>
                       <textarea 
                          name="long_description" 
                          rows={6} 
                          placeholder="Write full product details here..." 
                          className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors resize-none font-medium min-h-[160px]"
                       ></textarea>
                    </div>
                 </div>
              </div>

              {/* SECTION 2: PRICING */}
              <div className="pt-10 border-t border-[#EEEEEE]">
                 <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-6 bg-black rounded-full" />
                    <h2 className="text-2xl font-black text-[#000000] uppercase tracking-tight">Pricing</h2>
                 </div>

                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Sale Price</label>
                       <input name="sale_price" type="number" placeholder="Sale Price" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Regular Price</label>
                       <input name="regular_price" type="number" placeholder="Regular Price" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-bold text-gray-400" />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest text-[#000000]">Buying Price</label>
                       <input name="buying_price" type="number" placeholder="Buying Price" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-bold" />
                       <p className="text-[9px] text-[#666666] font-bold uppercase ml-1 italic tracking-widest">* Admin Use Only</p>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Sold Count</label>
                       <input name="sold_count" type="number" placeholder="Sold Count" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-bold" />
                    </div>
                 </div>
              </div>

              {/* SECTION 3: INVENTORY */}
              <div className="pt-10 border-t border-[#EEEEEE]">
                 <div className="flex items-center gap-2 mb-8">
                    <div className="w-1 h-6 bg-black rounded-full" />
                    <h2 className="text-2xl font-black text-[#000000] uppercase tracking-tight">Inventory</h2>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-2">
                       <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Product Code</label>
                       <input name="product_code" type="text" placeholder="Enter Product Code" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-bold tracking-widest" />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                       <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Brand Name</label>
                          <input name="brand" type="text" placeholder="Brand" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Warranty</label>
                          <input name="warranty" type="text" placeholder="Warranty" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-medium" />
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Stock / Quantity</label>
                          <input name="stock_quantity" type="number" placeholder="Quantity" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-[#000000] uppercase tracking-widest">Unit Name</label>
                          <input name="unit_name" type="text" placeholder="Piece / KG / Pack" className="w-full px-5 py-4 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-[#000000] transition-colors text-sm font-medium" />
                       </div>
                    </div>
                 </div>
              </div>

              {/* SECTION 4: PRODUCT VARIANT */}
              <div className="pt-10 border-t border-[#EEEEEE]">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-6 bg-black rounded-full" />
                       <h2 className="text-2xl font-black text-[#000000] uppercase tracking-tight">Product Variant</h2>
                    </div>
                    <button 
                      type="button" 
                      onClick={addVariant}
                      className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                       <Plus className="w-3 h-3" /> ADD NEW VARIANT
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {variants.map((variant, index) => (
                       <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white p-6 rounded-none border border-[#EEEEEE] shadow-sm relative group"
                       >
                          <button 
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-[#EEEEEE] rounded-full flex items-center justify-center text-gray-300 hover:text-red-500 hover:border-red-100 shadow-sm transition-all md:opacity-0 md:group-hover:opacity-100"
                          >
                             <X className="w-4 h-4" />
                          </button>
                          
                          <div className="space-y-5">
                             <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variant Title</label>
                                <input 
                                   placeholder="Color / Size / Theme / Storage" 
                                   value={variant.title}
                                   onChange={(e) => {
                                      const newVariants = [...variants];
                                      newVariants[index].title = e.target.value;
                                      setVariants(newVariants);
                                   }}
                                   className="w-full px-4 py-3 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-black transition-colors text-sm font-bold" 
                                />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Theme / Option</label>
                                   <input 
                                      placeholder="Red / XL / Premium" 
                                      value={variant.option}
                                      onChange={(e) => {
                                         const newVariants = [...variants];
                                         newVariants[index].option = e.target.value;
                                         setVariants(newVariants);
                                      }}
                                      className="w-full px-4 py-3 bg-[#f8f8f8] border border-[#EEEEEE] rounded-[14px] focus:outline-none focus:border-black transition-colors text-sm font-medium" 
                                   />
                                </div>
                                <div className="space-y-2">
                                   <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Extra Price</label>
                                   <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">+</span>
                                      <input 
                                         type="number" 
                                         placeholder="0.00" 
                                         value={variant.price}
                                         onChange={(e) => {
                                            const newVariants = [...variants];
                                            newVariants[index].price = e.target.value;
                                            setVariants(newVariants);
                                         }}
                                         className="w-full pl-8 pr-4 py-3 bg-[#f8f8f8] border border-[#EEEEEE] rounded-none focus:outline-none focus:border-black transition-colors text-sm font-bold" 
                                      />
                                   </div>
                                </div>
                             </div>
                          </div>
                       </motion.div>
                    ))}
                 </div>
              </div>

               {/* SPECIAL SECTION: PRODUCT VISIBILITY / PRODUCT TAGS */}
               <div className="pt-10 border-t border-[#EEEEEE]">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-1 h-6 bg-black rounded-full" />
                     <h2 className="text-2xl font-black text-[#000000] uppercase tracking-tight">🔥 PRODUCT VISIBILITY</h2>
                  </div>
                  
                  <p className="text-xs text-[#999999] font-bold uppercase tracking-wider mb-6">
                     Select where you want this product to show up on the storefront.
                  </p>

                  <div className="flex flex-wrap gap-2 select-none">
                     {/* Flash Sale Tag */}
                     <button
                        type="button"
                        onClick={() => setIsFlashSale(!isFlashSale)}
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none border transition-all flex items-center gap-2 cursor-pointer ${
                           isFlashSale
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                     >
                        <span className="font-mono text-xs">{isFlashSale ? '[✓]' : '[ ]'}</span>
                        <span>⚡ Flash Sale</span>
                     </button>

                     {/* Trending Item Tag */}
                     <button
                        type="button"
                        onClick={() => setIsTrending(!isTrending)}
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none border transition-all flex items-center gap-2 cursor-pointer ${
                           isTrending
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                     >
                        <span className="font-mono text-xs">{isTrending ? '[✓]' : '[ ]'}</span>
                        <span>🔥 Trending Item</span>
                     </button>

                     {/* Best Selling Tag */}
                     <button
                        type="button"
                        onClick={() => setIsBestSelling(!isBestSelling)}
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none border transition-all flex items-center gap-2 cursor-pointer ${
                           isBestSelling
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                     >
                        <span className="font-mono text-xs">{isBestSelling ? '[✓]' : '[ ]'}</span>
                        <span>🏆 Best Selling</span>
                     </button>

                     {/* Regular Tag */}
                     <button
                        type="button"
                        onClick={() => setIsRegular(!isRegular)}
                        className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-none border transition-all flex items-center gap-2 cursor-pointer ${
                           isRegular
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                        }`}
                     >
                        <span className="font-mono text-xs">{isRegular ? '[✓]' : '[ ]'}</span>
                        <span>🛍 Regular</span>
                     </button>
                   </div>
                </div>

               {/* SECTION 5: SHIPPING */}
              <div className="pt-10 border-t border-[#EEEEEE]">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                       <div className="w-1 h-6 bg-black rounded-full" />
                       <h2 className="text-2xl font-black text-[#000000] uppercase tracking-tight">Shipping</h2>
                    </div>
                    <button 
                      type="button" 
                      onClick={addShippingZone}
                      className="px-6 py-2.5 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                       <Plus className="w-3 h-3" /> Add Zone
                    </button>
                 </div>

                 <div className="space-y-4">
                    {shippingZones.map((zone, index) => (
                       <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 bg-[#f8f8f8] p-2 rounded-none border border-[#EEEEEE] group"
                       >
                          <div className="flex-1 grid grid-cols-2 gap-4 p-2">
                             <input 
                                placeholder="Delivery Zone" 
                                value={zone.zone}
                                onChange={(e) => {
                                   const newZones = [...shippingZones];
                                   newZones[index].zone = e.target.value;
                                   setShippingZones(newZones);
                                }}
                                className="w-full px-4 py-3 bg-white border border-[#EEEEEE] rounded-none focus:outline-none focus:border-black transition-colors text-sm font-bold" 
                             />
                             <div className="relative">
                                <input 
                                   type="number" 
                                   placeholder="Charge" 
                                   value={zone.charge}
                                   onChange={(e) => {
                                      const newZones = [...shippingZones];
                                      newZones[index].charge = e.target.value;
                                      setShippingZones(newZones);
                                   }}
                                   className="w-full pl-4 pr-10 py-3 bg-white border border-[#EEEEEE] rounded-none focus:outline-none focus:border-black transition-colors text-sm font-bold" 
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">৳</span>
                             </div>
                          </div>
                          <button 
                             type="button"
                             onClick={() => removeShippingZone(index)}
                             className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors shrink-0"
                          >
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </motion.div>
                    ))}
                 </div>
              </div>

              {/* FINAL SECTION: CREATE BUTTON */}
              <div className="flex justify-center pt-10 border-t border-[#EEEEEE]">
                 <button type="submit" className="w-full max-w-lg py-5 bg-[#000000] text-white font-black uppercase text-base tracking-[0.2em] rounded-none hover:bg-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.15)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.25)] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    CREATE INVENTORY
                 </button>
              </div>
           </form>
        </div>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Routes>
      <Route path="/" element={<AdminProductList />} />
      <Route path="/add" element={<AdminProductAdd />} />
    </Routes>
  );
}
