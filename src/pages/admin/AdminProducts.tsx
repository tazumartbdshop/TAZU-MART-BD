import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Upload, X, Image as ImageIcon, ChevronLeft, ChevronDown, ChevronRight, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore, generateKeywords } from '../../store/useProductStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { toast } from 'react-hot-toast';
import { uploadImage } from '../../lib/imageUtils';
import { storage } from '../../lib/firebase';

function AdminProductList() {
  const navigate = useNavigate();
  const { products, deleteProduct } = useProductStore();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { categories: categoryList } = useCategoryStore();
  const categories = ['All', ...Array.from(new Set(categoryList.map(c => c.name)))];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 2500);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'All' || product.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-full space-y-6">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-bold border border-zinc-800 z-50 shadow-2xl">
          {toastMessage}
        </div>
      )}

      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin')}
            className="p-3 border border-neutral-200 rounded-none bg-white hover:bg-neutral-50 transition-all hover:border-black active:scale-95 group shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-black group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h3 className="text-2xl font-black text-[#0a0a0a] uppercase tracking-tighter">Product Listing</h3>
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <div className="w-1 h-3 bg-purple-600 rounded-full"></div> Inventory & Stock Intelligence
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[280px]">
          {/* FIRESTORE DEBUG COUNTER CARD */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-none flex items-center justify-between group hover:border-purple-500 transition-all">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-550 uppercase tracking-[0.2em] text-[#8c32ec]">Firestore Database</span>
              <span className="text-[10px] font-black text-black uppercase tracking-tight">Total Products Found In Firestore</span>
            </div>
            <div className="text-2xl font-black text-purple-600 bg-white border border-zinc-200 px-3 py-1 font-mono">
              {products.length}
            </div>
          </div>

          {/* ACTIVE FILTERED ITEMS CARD */}
          <div className="bg-white border border-zinc-100 p-4 rounded-none flex items-center justify-between group hover:border-purple-650 transition-all">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-[0.2em]">Filtered Results</span>
              <span className="text-[10px] font-black text-neutral-700 uppercase tracking-tight">Match Current Search/Tab</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 bg-neutral-50 border border-neutral-150 px-3 py-1 font-mono">
              {filteredProducts.length}
            </div>
          </div>

          {/* ADD PRODUCT BUTTON - Bottom */}
          <Link 
            to="/admin/products/add" 
            className="bg-[#0a0a0a] text-white hover:bg-purple-600 px-6 py-4.5 rounded-none text-[10px] uppercase tracking-[0.2em] font-black flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_10px_20px_rgba(0,0,0,0.1)] group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Add Product Entry
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="SEARCH PRODUCTS BY TITLE OR SKU CODE..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-zinc-250 border-zinc-200 rounded-none text-xs uppercase tracking-widest focus:outline-none focus:border-black transition-colors" 
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 min-w-max pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-5 py-2.5 rounded-none text-xs font-black uppercase tracking-widest transition-colors border ${
                activeTab === category 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-500 border-zinc-200 hover:border-black hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products list - One product per row vertical card list with image left */}
      <div className="space-y-4 pb-12">
        {filteredProducts.map((product) => {
          const discountPercent = product.discountPrice 
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100) 
            : 0;

          return (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-none p-4 border border-zinc-200 hover:border-black transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
            >
              <div className="flex gap-4 items-start md:items-center w-full min-w-0">
                {/* Image left side */}
                <div className="w-20 h-20 rounded-none bg-zinc-50 border border-zinc-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                  {(product.imageUrl || product.image) ? (
                    <img src={product.imageUrl || product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-300" />
                  )}
                  {discountPercent > 0 && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5">
                      -{discountPercent}%
                    </div>
                  )}
                </div>

                {/* Info block */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-50 text-black border border-black px-2 py-0.5">
                      {product.category}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold font-mono tracking-wider bg-zinc-50 border border-zinc-200 px-2 py-0.5">
                      SKU: {product.sku || 'N/A'}
                    </span>
                    {product.brand && (
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                        Brand: {product.brand}
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-black text-sm md:text-base tracking-tight leading-snug">
                    {product.name}
                  </h4>
                  <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-6 gap-y-1 pt-1 text-xs text-gray-500">
                    <div>
                      Price: <span className="text-black font-extrabold text-sm">
                        ৳{product.discountPrice?.toLocaleString() || product.price.toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-gray-400 line-through ml-1.5 text-xs font-normal">
                          ৳{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div>
                      Stock: <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{product.stock} Units</span>
                    </div>
                    <div>
                      Sold: <span className="text-black font-bold">{product.soldCount ? `${product.soldCount}+ Sold` : '0 Sold'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit/Delete row actions */}
              <div className="flex items-center gap-2 w-full md:w-auto border-t border-zinc-100 md:border-t-0 pt-3 md:pt-0 shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border border-black text-black bg-white hover:bg-black hover:text-white transition-colors rounded-none"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                     if (confirm('Are you sure you want to delete this product?')) {
                       deleteProduct(product.id);
                       showToast("Product deleted successfully");
                     }
                  }}
                  className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors rounded-none"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-zinc-200 bg-white">
          <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-4">
             <Search className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-black font-bold text-sm uppercase tracking-wider">No Products Found</p>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Adjust search query parameters</p>
        </div>
      )}
    </div>
  );
}

function AdminProductAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { products, addProduct, updateProduct } = useProductStore();
  const { categories: categoryList } = useCategoryStore();

  const editingProduct = products.find(p => p.id === id);

  const [uploadedImages, setUploadedImages] = useState<{ id: string; url: string; file?: File; name: string }[]>([]);
  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);

  // States
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
  const [isOffer, setIsOffer] = useState(false);
  const [coinAmount, setCoinAmount] = useState('250');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [compressing, setCompressing] = useState(false);
  
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  // AI Keyword system state integration
  const [manualKeywords, setManualKeywords] = useState<string[]>([]);
  const [newKeywordInput, setNewKeywordInput] = useState('');

  useEffect(() => {
    if (isEditing && editingProduct) {
      setSeoPoints(editingProduct.seoPoints || ['']);
      setVariants(editingProduct.variants || []);
      setShippingZones(editingProduct.shippingZones || [
        { zone: 'Inside Dhaka', charge: '80' },
        { zone: 'Outside Dhaka', charge: '150' }
      ]);
      setIsFlashSale(!!editingProduct.is_flash_sale);
      setIsTrending(!!editingProduct.is_trending);
      setIsBestSelling(!!editingProduct.is_best_selling);
      setIsRegular(!!editingProduct.is_regular);
      setIsOffer(!!editingProduct.is_offer);
      setCoinAmount(String(editingProduct.reward_coins || '250'));
      setBannerImage(editingProduct.banner_image || '');
      setVideoUrl(editingProduct.videoUrl || '');
      setManualKeywords(editingProduct.keywords || []);
      
      if (editingProduct.images && editingProduct.images.length > 0) {
        setUploadedImages(editingProduct.images.map((url, i) => ({ id: `init_${i}`, url, name: i === 0 ? 'primary' : 'gallery' })));
      } else if (editingProduct.image) {
        setUploadedImages([{ id: 'init_primary', url: editingProduct.image, name: 'primary' }]);
      }
    } else {
      setBannerImage('');
      setVideoUrl('');
      setManualKeywords([]);
    }
  }, [id, isEditing, editingProduct]);

  const compressAndResizeFile = (file: File): Promise<{ url: string; file: File }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_BOUND = 1400;
          if (width > MAX_BOUND || height > MAX_BOUND) {
            if (width > height) {
              height = Math.round((height * MAX_BOUND) / width);
              width = MAX_BOUND;
            } else {
              width = Math.round((width * MAX_BOUND) / height);
              height = MAX_BOUND;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                const url = URL.createObjectURL(compressedFile);
                resolve({ url, file: compressedFile });
              } else {
                const url = URL.createObjectURL(file);
                resolve({ url, file });
              }
            }, 'image/webp', 0.75);
          } else {
            const url = URL.createObjectURL(file);
            resolve({ url, file });
          }
        };
        img.onerror = () => {
          const url = URL.createObjectURL(file);
          resolve({ url, file });
        };
      };
      reader.onerror = () => {
        const url = URL.createObjectURL(file);
        resolve({ url, file });
      };
    });
  };

  const processFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    setCompressing(true);
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
      
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`Image "${file.name}" exceeds 10MB limit.`);
        continue;
      }

      try {
        const optimized = await compressAndResizeFile(file);
        newImages.push({
          id: Math.random().toString(36).substring(2, 9),
          url: optimized.url,
          file: optimized.file,
          name: optimized.file.name
        });
      } catch (error) {
        const url = URL.createObjectURL(file);
        newImages.push({
          id: Math.random().toString(36).substring(2, 9),
          url,
          file,
          name: file.name
        });
      }
    }
    
    setUploadedImages(newImages);
    setCompressing(false);
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

  const removeImage = (imgId: string) => {
    const target = uploadedImages.find(img => img.id === imgId);
    if (target && target.url.startsWith('blob:')) {
      URL.revokeObjectURL(target.url);
    }
    setUploadedImages(uploadedImages.filter(img => img.id !== imgId));
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

  const [isLoading, setIsLoading] = useState(false);
  const setLoading = (val: boolean) => setIsLoading(val);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    console.log("handleSubmit started for Product...");
    
    const formData = new FormData(e.currentTarget);
    
    // Convert logic
    const regPrice = Number(formData.get('regular_price'));
    const oldPrice = Number(formData.get('old_price'));
    const sellingPrice = Number(formData.get('selling_price'));

    let finalPrice = sellingPrice;
    let finalDiscountPrice: number | undefined = undefined;

    if (oldPrice > 0 && sellingPrice > 0) {
      finalPrice = oldPrice;
      finalDiscountPrice = sellingPrice;
    } else if (regPrice > 0 && sellingPrice > 0 && regPrice !== sellingPrice) {
      finalPrice = regPrice;
      finalDiscountPrice = sellingPrice;
    } else if (regPrice > 0) {
      finalPrice = regPrice;
    }

    try {
        const { uploadImage } = await import('../../lib/imageUtils');
        console.log("Image utils imported.");

        // 1. Upload Product Banner if needed
        let finalBannerUrl = bannerImage;
        if (bannerFile) {
          console.log("Uploading product banner...");
          try {
            finalBannerUrl = await uploadImage(bannerFile, 'products', bannerFile.name);
            console.log("Banner uploaded.");
          } catch (err) {
            console.error("Banner upload error:", err);
            throw new Error("Failed to upload product banner.");
          }
        }

        // 2. Upload any newly selected/modified files to Firebase Storage
        const finalImageUrls: string[] = [];
        console.log("Uploading product images...");
        
        for (const img of uploadedImages) {
          if (img.file && (img.url.startsWith('blob:') || img.url.startsWith('data:'))) {
            try {
              const downloadUrl = await uploadImage(img.file, 'products', img.name);
              finalImageUrls.push(downloadUrl);
            } catch (uploadErr) {
              console.error("Firebase Storage Upload Error:", uploadErr);
              throw new Error(`Failed to upload ${img.name}. Please try again.`);
            }
          } else {
            // This is already a remote URL, keep it
            finalImageUrls.push(img.url);
          }
        }
        console.log("Product images uploaded.");

        const mainImage = finalImageUrls[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';

        const payload = {
          name: formData.get('name') as string,
          sku: formData.get('product_code') as string,
          category: formData.get('category') as string,
          brand: formData.get('brand') as string,
          price: finalPrice,
          discountPrice: finalDiscountPrice,
          stock: Number(formData.get('stock_quantity')),
          soldCount: Number(formData.get('sold_count')),
          description: formData.get('long_description') as string,
          status: 'active' as const,
          image: mainImage,
          imageUrl: mainImage,
          featured_image: mainImage,
          banner_image: finalBannerUrl,
          videoUrl: videoUrl,
          mediaUrl: videoUrl,
          images: finalImageUrls.length > 0 ? finalImageUrls : undefined,
          rating: editingProduct?.rating || 4.5,
          reviews: editingProduct?.reviews || 0,
          isNew: editingProduct?.isNew !== undefined ? editingProduct.isNew : true,
          buyingPrice: Number(formData.get('buying_price')),
          warranty: formData.get('warranty') as string,
          unitName: formData.get('unit_name') as string,
          seoPoints,
          variants,
          shippingZones,
          is_flash_sale: isFlashSale,
          is_trending: isTrending,
          is_best_selling: isBestSelling,
          is_regular: isRegular,
          is_offer: isOffer,
          reward_coins: Number(coinAmount),
          keywords: manualKeywords.length > 0 ? manualKeywords : generateKeywords(
            (formData.get('name') as string) || '',
            (formData.get('category') as string) || '',
            (formData.get('brand') as string) || '',
            (formData.get('long_description') as string) || ''
          )
        };

        console.log("Saving payload to Firestore...");
        if (isEditing && id) {
          await updateProduct(id, payload);
          console.log("Product updated.");
        } else {
          await addProduct(payload);
          console.log("Product added.");
        }
        
        toast.success("✅ Product Saved Successfully", {
          position: "top-center",
          style: {
            background: "#10B981",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: "0px",
          }
        });
        
        navigate('/admin/product-listing');
    } catch (error: any) {
        console.error("Error saving product:", error);
        toast.error(error?.message || "❌ Failed to save product");
    } finally {
        setLoading(false);
        console.log("handleSubmit finished (finally block).");
    }
  };

  return (
    <div className="bg-white rounded-none border border-zinc-200 overflow-hidden mb-12">
        <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
           <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={() => navigate('/admin/product-listing')}
                className="p-2 border border-zinc-200 rounded-none bg-white hover:bg-gray-100 mr-1"
              >
                <ChevronLeft className="w-4 h-4 text-black" />
              </button>
              <h3 className="text-sm font-black text-black uppercase tracking-widest">{isEditing ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</h3>
           </div>
           <button onClick={() => navigate('/admin/product-listing')} className="text-gray-400 hover:text-black bg-white border border-zinc-200 p-2 rounded-none transition-colors">
             <X className="w-4 h-4" />
           </button>
        </div>
        
        <div className="p-6 md:p-10">
           <form className="space-y-12 max-w-5xl mx-auto" onSubmit={handleSubmit}>
              
              {/* 8. IMAGE UPLOAD SECTION */}
              <div className="space-y-4">
                 <h4 className="block text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">Product Images</h4>
                 
                 {uploadedImages.length === 0 ? (
                    <div 
                       onClick={() => setShowSourceSheet(true)}
                       className="border-2 border-dashed border-zinc-350 border-zinc-300 rounded-none p-8 text-center bg-zinc-50 hover:bg-zinc-100/50 hover:border-black transition-all cursor-pointer flex flex-col items-center justify-center min-h-[160px] group relative overflow-hidden"
                    >
                       <div className="w-12 h-12 bg-white group-hover:bg-black group-hover:text-white transition-colors flex items-center justify-center mb-3 border border-zinc-200 shadow-sm rounded-none">
                          <Upload className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                       </div>
                       <p className="text-black font-extrabold text-[11px] uppercase tracking-wider">Tap to upload product images</p>
                       <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Supports JPG, PNG, WEBP with Auto-Compression (Max. 10MB, limit 10)</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       <div className="flex gap-4 overflow-x-auto pb-3 px-1">
                          {uploadedImages.map((img, idx) => (
                             <div
                                key={img.id}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                className="relative w-32 h-32 rounded-none border border-zinc-200 bg-white p-1 hover:border-black cursor-grab active:cursor-grabbing shrink-0 overflow-hidden group transition-all"
                             >
                                <img src={img.url} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                
                                {idx === 0 ? (
                                   <span className="absolute bottom-1 left-1 bg-black text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
                                      PRIMARY
                                   </span>
                                ) : (
                                   <span className="absolute bottom-1 left-1 bg-white border border-zinc-200 text-gray-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {idx + 1}
                                   </span>
                                )}

                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={(e) => { e.stopPropagation(); moveImage(idx, 'left'); }}
                                      className="w-6 h-6 bg-white border border-zinc-200 text-black hover:bg-black hover:text-white disabled:opacity-0 transition-colors cursor-pointer text-[10px] font-black"
                                   >
                                      ←
                                   </button>
                                   <button
                                      type="button"
                                      disabled={idx === uploadedImages.length - 1}
                                      onClick={(e) => { e.stopPropagation(); moveImage(idx, 'right'); }}
                                      className="w-6 h-6 bg-white border border-zinc-200 text-black hover:bg-black hover:text-white disabled:opacity-0 transition-colors cursor-pointer text-[10px] font-black"
                                   >
                                      →
                                   </button>
                                </div>

                                <button
                                   type="button"
                                   onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                   className="absolute top-1 right-1 w-6 h-6 bg-red-650 bg-red-650 bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors"
                                >
                                   <X className="w-3.5 h-3.5" />
                                </button>
                             </div>
                          ))}

                          {uploadedImages.length < 10 && (
                             <button
                                type="button"
                                onClick={triggerGallery}
                                className="w-32 h-32 rounded-none border-2 border-dashed border-zinc-200 hover:border-black hover:bg-zinc-50 bg-white flex flex-col items-center justify-center shrink-0 transition-all group gap-1"
                             >
                                <Plus className="w-5 h-5 text-gray-400 group-hover:text-black" />
                                <span className="text-[9px] font-black text-gray-400 group-hover:text-black uppercase tracking-widest">ADD IMAGE</span>
                             </button>
                          )}
                       </div>
                    </div>
                 )}

                 {uploadError && (
                    <p className="text-xs text-red-650 bg-red-50 p-3 border border-red-200 text-red-600">
                       <AlertCircle className="w-4 h-4" /> {uploadError}
                    </p>
                 )}

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
               </div>

               {/* Product Banner & Media Video URL Support */}
               <div className="space-y-6 pt-8 border-t border-zinc-200">
                 <h4 className="block text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">Product Banner & Media Group</h4>
                 
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest">Product Banner Image</label>
                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <input 
                           type="text" 
                           value={bannerImage}
                           onChange={(e) => {
                             setBannerImage(e.target.value);
                             setBannerFile(null);
                           }}
                           placeholder="ENTER OR PASTE BANNER IMAGE URL" 
                           className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                        />
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          className="bg-black text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800"
                        >
                          <Upload className="w-4 h-4" /> Upload
                        </button>
                      </div>
                      
                      <input 
                        type="file" 
                        ref={bannerInputRef} 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBannerFile(file);
                            setBannerImage(URL.createObjectURL(file));
                          }
                        }}
                      />

                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                         Paste an image URL or upload a dedicated banner image that will show up on this product's details page.
                      </p>
                      
                      {bannerImage && (
                         <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-none max-w-xl relative">
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Banner Preview</p>
                            <img src={bannerImage} alt="Product Banner Preview" className="h-32 w-full object-cover border border-zinc-200" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                setBannerImage('');
                                setBannerFile(null);
                              }}
                              className="absolute top-4 right-4 bg-red-600 text-white p-1 rounded-sm shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                         </div>
                      )}
                    </div>
                 </div>

                 {/* Product Media URL Form */}
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-1.5">
                       Product Media URL <span className="text-[8px] px-1.5 py-0.5 bg-zinc-150 rounded-full font-mono text-neutral-500 font-black">NEW</span>
                    </label>
                    <input 
                       type="text" 
                       value={videoUrl}
                       onChange={(e) => setVideoUrl(e.target.value)}
                       placeholder="ENTER FACEBOOK OR YOUTUBE VIDEO / SHORTS / REELS URL (optional)" 
                       className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                    />
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                       Upgraded Media Module. Supports: <b className="text-zinc-700">YouTube Video URL, Shorts, Reels, and Facebook Videos</b>. Visually appears as the primary thumb preview element in the customer-facing gallery.
                    </p>
                    {videoUrl && (
                       <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-none max-w-xl space-y-1.5 font-sans">
                          <span className="inline-block text-[8px] bg-red-50 text-red-650 border border-red-155 font-black uppercase px-2 py-0.5">Media Link Detected</span>
                          <p className="text-[10px] font-semibold text-neutral-700 truncate" title={videoUrl}>Link: {videoUrl}</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* 9. PRODUCT INFORMATION SECTION */}
              <div className="space-y-4 pt-8 border-t border-zinc-200">
                 <h4 className="block text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">PRODUCT INFORMATION</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Product Name *</label>
                       <input 
                          name="name" 
                          required 
                          type="text" 
                          defaultValue={editingProduct?.name || ''}
                          placeholder="ENTER PRODUCT NAME..." 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Product Code / SKU *</label>
                       <input 
                          name="product_code" 
                          required 
                          type="text" 
                          defaultValue={editingProduct?.sku || ''}
                          placeholder="e.g. F-001" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold font-mono text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Brand Name</label>
                       <input 
                          name="brand" 
                          type="text" 
                          defaultValue={editingProduct?.brand || ''}
                          placeholder="e.g. Tazu Classic" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Product Tags</label>
                       <input 
                          name="tags" 
                          type="text" 
                          placeholder="e.g. clothing, trendy, winter" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                 </div>
              </div>

              {/* 10. PRICING SECTION */}
              <div className="space-y-4 pt-8 border-t border-zinc-200">
                 <h4 className="block text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">PRICING</h4>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Regular Price</label>
                       <input 
                          name="regular_price" 
                          type="number" 
                          defaultValue={editingProduct?.price || ''}
                          placeholder="Regular Price" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Old Price</label>
                       <input 
                          name="old_price" 
                          type="number" 
                          defaultValue={editingProduct?.discountPrice ? editingProduct.price : ''}
                          placeholder="Old Price" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Selling Price *</label>
                       <input 
                          name="selling_price" 
                          required 
                          type="number" 
                          defaultValue={editingProduct?.discountPrice || editingProduct?.price || ''}
                          placeholder="Selling Price" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Stock Quantity *</label>
                       <input 
                          name="stock_quantity" 
                          required 
                          type="number" 
                          defaultValue={editingProduct?.stock || ''}
                          placeholder="Stock Quantity" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5 col-span-2 md:col-span-1 border-black">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Sold Count</label>
                       <input 
                          name="sold_count" 
                          type="number" 
                          defaultValue={editingProduct?.soldCount || ''}
                          placeholder="Sold Count" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Buying Price *</label>
                       <input 
                          name="buying_price" 
                          type="number" 
                          defaultValue={editingProduct?.buyingPrice || ''}
                          placeholder="Buying Price" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                       <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">* ADMIN USE ONLY</p>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Warranty</label>
                       <input 
                          name="warranty" 
                          type="text" 
                          defaultValue={editingProduct?.warranty || ''}
                          placeholder="e.g. 1 Year Brand Warranty" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                    <div className="space-y-1.5 col-span-1">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Unit Name</label>
                       <input 
                          name="unit_name" 
                          type="text" 
                          defaultValue={editingProduct?.unitName || ''}
                          placeholder="e.g. piece, pack, box" 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black transition-colors font-bold text-sm" 
                       />
                    </div>
                 </div>
              </div>

              {/* 12. CATEGORY SYSTEM */}
              <div className="space-y-4 pt-8 border-t border-zinc-200">
                 <h4 className="block text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">CATEGORY</h4>
                 <div className="space-y-1.5 max-w-sm">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest">Choose Store Category *</label>
                    <select 
                       name="category" 
                       required 
                       defaultValue={editingProduct?.category || ''}
                       className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-black text-xs uppercase tracking-widest text-black cursor-pointer"
                    >
                       <option value="">SELECT A CATEGORY</option>
                       {categoryList.map(c => (
                         <option key={c.id} value={c.name}>{c.name}</option>
                       ))}
                    </select>
                 </div>
              </div>

              {/* 13. DESCRIPTION SECTION */}
              <div className="space-y-4 pt-8 border-t border-zinc-200">
                 <h4 className="block text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-3">DESCRIPTION</h4>
                 <div className="space-y-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Short Description</label>
                       <input 
                          name="short_description" 
                          type="text" 
                          placeholder="ENTER BRIEF PRODUCT TAGLINE..." 
                          className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black text-xs font-bold" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-black uppercase tracking-widest">Long Description</label>
                       <textarea 
                          name="long_description" 
                          rows={6} 
                          defaultValue={editingProduct?.description || ''}
                          placeholder="ENTER COMPLETE CONVENTIONAL DESCRIPTION DETAILS..." 
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-medium text-sm resize-none min-h-[160px]"
                       />
                    </div>
                 </div>
              </div>

              {/* Advanced collapsibles to fully align with schema features */}
              <div className="pt-8 border-t border-zinc-200 space-y-6">
                 <h5 className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">ADDITIONAL CONFIGURATIONS</h5>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-black uppercase tracking-[0.1em]">SEO Feature Points</label>
                          <button 
                             type="button" 
                             onClick={addSeoPoint}
                             className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-zinc-800"
                          >
                             <Plus className="w-3 h-3" /> Add Point
                          </button>
                       </div>
                       <div className="space-y-2">
                          {seoPoints.map((point, index) => (
                             <div key={index} className="flex gap-2">
                                <input 
                                   value={point}
                                   onChange={(e) => updateSeoPoint(index, e.target.value)}
                                   placeholder={`SEO Bullet Point ${index + 1}`}
                                   className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-bold"
                                />
                                <button 
                                   type="button"
                                   onClick={() => removeSeoPoint(index)}
                                   className="p-2 border border-zinc-200 text-gray-300 hover:text-red-500"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-black uppercase tracking-[0.1em]">Shipping Charge Zones</label>
                          <button 
                             type="button" 
                             onClick={addShippingZone}
                             className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-zinc-800"
                          >
                             <Plus className="w-3 h-3" /> Add Zone
                          </button>
                       </div>
                       <div className="space-y-2">
                          {shippingZones.map((zone, idx) => (
                             <div key={idx} className="flex gap-2 items-center">
                                <input 
                                   placeholder="Delivery zone (e.g. Outside Dhaka)" 
                                   value={zone.zone}
                                   onChange={(e) => {
                                      const newZ = [...shippingZones];
                                      newZ[idx].zone = e.target.value;
                                      setShippingZones(newZ);
                                   }}
                                   className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-bold"
                                />
                                <input 
                                   type="number" 
                                   placeholder="charge" 
                                   value={zone.charge}
                                   onChange={(e) => {
                                      const newZ = [...shippingZones];
                                      newZ[idx].charge = e.target.value;
                                      setShippingZones(newZ);
                                   }}
                                   className="w-20 px-3 py-2 bg-zinc-50 border border-zinc-200 text-xs font-bold"
                                />
                                <button 
                                   type="button"
                                   onClick={() => removeShippingZone(idx)}
                                   className="p-2 text-zinc-400 hover:text-red-500"
                                >
                                   <X className="w-4 h-4" />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                  {/* AI Search Keywords System Panel */}
                  <div className="pt-8 border-t border-zinc-200 space-y-4">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                           <h6 className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-900">AI Search Keywords Section</h6>
                           <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                              Associate manual keywords or auto-generate spelling variants, Bangla synonyms, and user intents
                           </p>
                        </div>
                        <button
                           type="button"
                           onClick={() => {
                              const nameVal = (document.getElementsByName('name')[0] as HTMLInputElement)?.value || '';
                              const catVal = (document.getElementsByName('category')[0] as HTMLSelectElement)?.value || '';
                              const brandVal = (document.getElementsByName('brand')[0] as HTMLInputElement)?.value || '';
                              const descVal = (document.getElementsByName('long_description')[0] as HTMLTextAreaElement)?.value || '';

                              if (!nameVal && !catVal) {
                                 toast.error('Type a product name/category first to generate smart suggestions!');
                                 return;
                              }

                              const generated = generateKeywords(nameVal, catVal, brandVal, descVal);
                              const union = Array.from(new Set([...manualKeywords, ...generated]));
                              setManualKeywords(union);
                              toast.success(`Generated ${generated.length} AI keywords!`);
                           }}
                           className="px-4 py-2.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center gap-2 self-start sm:self-center"
                        >
                           ⚡ Auto Keyword Generator
                        </button>
                     </div>

                     <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-4">
                        {/* Tags list */}
                        <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
                           {manualKeywords.length === 0 ? (
                              <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider italic">
                                 No custom keywords set yet. Push the Auto Generator or write tags manually below.
                              </span>
                           ) : (
                              manualKeywords.map((kw, i) => (
                                 <span 
                                    key={i} 
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-zinc-200 text-[10px] font-bold text-zinc-800 transition-colors uppercase select-none hover:border-red-400 group"
                                 >
                                    <span>{kw}</span>
                                    <button
                                       type="button"
                                       className="text-zinc-400 hover:text-red-500"
                                       onClick={() => {
                                          setManualKeywords(prev => prev.filter((_, idx) => idx !== i));
                                       }}
                                    >
                                       <X className="w-3 h-3 text-zinc-400 hover:text-red-500" />
                                    </button>
                                 </span>
                              ))
                           )}
                        </div>

                        {/* Input tools */}
                        <div className="flex gap-2 max-w-md">
                           <input 
                              type="text"
                              value={newKeywordInput}
                              onChange={(e) => setNewKeywordInput(e.target.value)}
                              onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (newKeywordInput.trim()) {
                                       setManualKeywords(prev => Array.from(new Set([...prev, newKeywordInput.trim().toLowerCase()])));
                                       setNewKeywordInput('');
                                    }
                                 }
                              }}
                              placeholder="Type keyword tag & press Add..."
                              className="flex-1 px-4 py-2 bg-white border border-zinc-200 text-xs font-bold focus:outline-none focus:border-black rounded-none"
                           />
                           <button
                              type="button"
                              onClick={() => {
                                 if (newKeywordInput.trim()) {
                                    setManualKeywords(prev => Array.from(new Set([...prev, newKeywordInput.trim().toLowerCase()])));
                                    setNewKeywordInput('');
                                 }
                              }}
                              className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 rounded-none"
                           >
                              Add
                           </button>
                        </div>
                     </div>
                  </div>

                 <div className="pt-4 border-t border-zinc-100 sm:flex sm:items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-2">
                       {[
                         { title: '⚡ Flash Sale', state: isFlashSale, set: setIsFlashSale },
                         { title: '🔥 Trending Item', state: isTrending, set: setIsTrending },
                         { title: '🏆 Best Selling', state: isBestSelling, set: setIsBestSelling },
                         { title: '🛍 Regular List', state: isRegular, set: setIsRegular },
                          { title: '🏷️ Offer Product', state: isOffer, set: setIsOffer }
                       ].map(badge => (
                         <button
                           type="button"
                           key={badge.title}
                           onClick={() => badge.set(!badge.state)}
                           className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all rounded-none ${
                             badge.state ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200 hover:border-black'
                           }`}
                         >
                           {badge.state ? '[✓]' : '[ ]'} {badge.title}
                         </button>
                       ))}
                    </div>

                    <div className="flex items-center gap-3 pt-4 sm:pt-0">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">REWARD COINS:</span>
                       <input 
                         type="number" 
                         value={coinAmount}
                         onChange={(e) => setCoinAmount(e.target.value)}
                         className="w-24 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black rounded-none"
                       />
                    </div>
                 </div>
              </div>

              {/* 14. SAVE PRODUCT BUTTON */}
              <div className="flex justify-center pt-8 border-t border-zinc-200">
                 <button 
                    type="submit" 
                    disabled={isLoading}
                     className="w-full max-w-sm py-4 bg-black text-white font-black uppercase text-xs tracking-[0.2em] rounded-none hover:bg-zinc-900 transition-colors shadow-xl shadow-black/10 text-center cursor-pointer disabled:bg-zinc-700 disabled:cursor-not-allowed"
                 >
                    {isLoading ? '[ SAVING... ]' : '[ SAVE PRODUCT ]'}
                 </button>
              </div>
           </form>
        </div>
        
        {/* Gallery bottom sheet picker mockup */}
        <AnimatePresence>
           {showSourceSheet && (
              <>
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSourceSheet(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[100]"
                 />
                 <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 220 }}
                    className="fixed bottom-0 inset-x-0 bg-white z-[101] max-w-md mx-auto p-6"
                 >
                    <div className="w-12 h-1 bg-zinc-200 mx-auto mb-4" />
                    <h4 className="text-[11px] font-black text-black uppercase tracking-widest text-center mb-6">Choose Image Source</h4>
                    
                    <div className="grid grid-cols-2 gap-4 pb-6">
                       <button
                          type="button"
                          onClick={triggerGallery}
                          className="flex flex-col items-center justify-center p-6 bg-zinc-50 border border-zinc-200 hover:border-black transition-all gap-2"
                       >
                          <ImageIcon className="w-6 h-6 text-gray-600" />
                          <span className="font-extrabold text-[10px] text-black uppercase tracking-widest">Device Gallery</span>
                       </button>

                       <button
                          type="button"
                          onClick={triggerCamera}
                          className="flex flex-col items-center justify-center p-6 bg-zinc-50 border border-zinc-200 hover:border-black transition-all gap-2"
                       >
                          <Camera className="w-6 h-6 text-gray-600" />
                          <span className="font-extrabold text-[10px] text-black uppercase tracking-widest">Scan Camera</span>
                       </button>
                    </div>

                    <button
                       type="button"
                       onClick={() => setShowSourceSheet(false)}
                       className="w-full py-4 bg-zinc-100 text-black font-extrabold uppercase text-[10px] tracking-widest"
                    >
                       Cancel
                    </button>
                 </motion.div>
              </>
           )}
        </AnimatePresence>
    </div>
  );
}

export default function AdminProducts() {
  return (
    <Routes>
      <Route path="/" element={<AdminProductList />} />
      <Route path="/add" element={<AdminProductAdd />} />
      <Route path="/edit/:id" element={<AdminProductAdd />} />
    </Routes>
  );
}
