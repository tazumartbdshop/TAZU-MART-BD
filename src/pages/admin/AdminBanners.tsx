import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, Layers, ChevronLeft, Search, X, Database, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBannerStore, Banner } from '../../store/useBannerStore';
import { useProductStore } from '../../store/useProductStore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path
  };
  const errorMsg = JSON.stringify(errInfo);
  if (errInfo.error.includes('Quota limit exceeded')) {
    console.warn("Firestore Quota Exceeded.");
  } else {
    console.error('Firestore Error: ', errorMsg);
  }
}

export default function AdminBanners() {
  const { banners } = useBannerStore();
  const products = useProductStore((state) => state.products) || [];
  
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const initialAction = searchParams.get('action');
  const navigate = useNavigate();

  // Form Fields State
  const [name, setName] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('');
  const [connectedProductId, setConnectedProductId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill form state when editing
  useEffect(() => {
    // Clear form when in "Add Mode"
    setName('');
    setButtonText('Shop Now');
    setButtonLink('');
    setConnectedProductId('');
  }, [banners]);

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFiles(Array.from(e.target.files));
    }
  };

  const handleImageFiles = async (files: File[]) => {
    setIsSubmitting(true);
    let successCount = 0;

    const { uploadImage } = await import('../../lib/imageUtils');
    const supabase = await import('../../lib/supabase').then(m => m.getSupabase());
    if (!supabase) return;

    try {
      const currentBannersLength = useBannerStore.getState().banners.length;
      const newBanners = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`❌ ${file.name} is not an image!`);
          continue;
        }
        
        try {
          const bannerBlob = await new Promise<Blob>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                const targetRatio = 21 / 9;
                const targetWidth = 1920;
                const targetHeight = targetWidth / targetRatio;
                
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Canvas context not found');
                
                const imgRatio = img.width / img.height;
                let drawWidth = targetWidth;
                let drawHeight = targetHeight;
                let offsetX = 0;
                let offsetY = 0;
                
                if (imgRatio > targetRatio) {
                  drawWidth = img.width * (targetHeight / img.height);
                  drawHeight = targetHeight;
                  if (drawWidth < targetWidth) {
                      drawWidth = targetWidth;
                      drawHeight = img.height * (targetWidth / img.width);
                  }
                } else {
                  drawWidth = targetWidth;
                  drawHeight = img.height * (targetWidth / img.width);
                  if (drawHeight < targetHeight) {
                      drawHeight = targetHeight;
                      drawWidth = img.width * (targetHeight / img.height);
                  }
                }
                
                offsetX = (targetWidth - drawWidth) / 2;
                offsetY = (targetHeight - drawHeight) / 2;
                
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                
                canvas.toBlob((blob) => {
                  if (blob) resolve(blob);
                  else reject('Blob creation failed');
                }, 'image/jpeg', 0.85);
              };
              img.onerror = reject;
              if (typeof e.target?.result === 'string') {
                img.src = e.target.result;
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          // Upload to storage
          const downloadUrl = await uploadImage(bannerBlob, 'banners', file.name);

          const targetId = `ban_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const currentOrder = currentBannersLength + successCount;

          const bannerData = {
            id: targetId,
            image: downloadUrl,
            name: name || file.name.split('.')[0],
            buttonText,
            buttonLink,
            buttonEnabled: !!buttonText && !!buttonLink,
            connectedProductId,
            isCustomButtonText: true,
            locations: ['homepage-hero'],
            bannerSize: 'hero',
            status: 'active' as const,
            order: currentOrder,
            bannerType: 'uploaded' as const,
            createdDate: new Date().toISOString()
          };

          newBanners.push(bannerData);
          successCount++;
        } catch (innerErr) {
          console.error(innerErr);
          toast.error(`❌ Failed to process ${file.name}`);
        }
      }

      if (successCount > 0) {
        await supabase.from('banners').upsert(newBanners);
        await supabase.from('banners_draft').upsert(newBanners);
        toast.success(`🎉 ${successCount} banners published successfully!`);
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to bulk upload banners');
    }

    setIsSubmitting(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    navigate('/admin/banner/list');
  };

  const handleEditClick = (banner: Banner, action?: string) => {
    let url = `/admin/banner/create?editId=${banner.id}`;
    if (action) {
      url += `&action=${action}`;
    }
    navigate(url);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        useBannerStore.getState().removeBanner(bannerId);
        useBannerStore.getState().removeDraftBanner(bannerId);
        toast.success("✅ Banner deleted successfully!");
      } catch (err) {
        toast.error("❌ Failed to delete banner");
      }
    }
  };

  const handleSeqDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSeqDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
      useBannerStore.getState().reorderBanners(dragIndex, dropIndex);
    }
  };

  const handleSeqDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div id="admin-banner-control" className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6 font-sans pb-24">
      {/* Live Table Inspector */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 relative overflow-hidden group rounded-none">
        <div className="absolute right-0 top-0 p-4 opacity-5 pointer-events-none">
          <Database className="w-16 h-16 text-white" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Live Supabase Table Inspector</span>
            </div>
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-1.5 font-mono text-[11px] text-green-400">
              <span className="text-neutral-600">TABLE:</span>
              banners
            </div>
          </div>

          <div className="flex gap-8">
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Entry Count</p>
              <p className="text-sm font-black text-white">{banners.length}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">DB Sync Status</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-black text-white uppercase tracking-wider">Cloud Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Container */}
      <div className="bg-white rounded-none border border-zinc-200 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-50 gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/admin/banner/list')} 
              className="p-2 border border-zinc-200 rounded-none bg-white hover:bg-gray-100 mr-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-black" />
            </button>
            <div>
              <h3 className="text-sm font-black text-black uppercase tracking-widest">
                UPLOAD BANNERS
              </h3>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                Configure and bulk upload new slideshow banners
              </p>
            </div>
          </div>
          <button 
            onClick={handleCancel}
            className="px-4 py-2 text-xs bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors uppercase font-black tracking-widest rounded-none cursor-pointer w-full sm:w-auto text-center"
          >
            Cancel & Go Back
          </button>
        </div>
      </div>

      {/* Form Sections (Each Field inside its own separate card container) */}
      <div className="space-y-6">
        
        {/* 1. Banner Image Upload Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-6 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              ১. Banner Image Upload <span className="text-rose-500 font-bold">*</span>
            </h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Drag multiple hero banner images or browse to upload instantly
            </p>
          </div>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-none flex flex-col items-center justify-center cursor-pointer transition-all aspect-[21/9] sm:aspect-[4/1] max-h-64 w-full ${
              dragActive 
                ? 'border-black bg-zinc-50 scale-[0.99]' 
                : 'border-zinc-200 bg-zinc-50/50 hover:border-black hover:bg-zinc-50'
            }`}
          >
            <input 
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/*"
              className="hidden"
              id="banner-image-uploader"
            />
            <Upload className="w-6 h-6 text-neutral-400 mb-2" />
            <span className="text-[10px] font-black uppercase text-black tracking-wider">Drag Multiple Images Here or Browse</span>
            <span className="text-[8px] text-zinc-400 uppercase tracking-widest mt-1.5 font-bold font-mono">Hero Banner Ratio Recommended</span>
          </div>
        </div>

        {/* 2. Banner Title Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-6 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              ২. Banner Title <span className="text-zinc-400 font-bold">(Optional)</span>
            </h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Primary text displayed on top of the slideshow banner
            </p>
          </div>
          
          <input 
            type="text"
            id="banner-title-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. SUMMER APPARELS 50% FLAT"
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-bold text-xs uppercase text-black"
          />
        </div>

        {/* 3. Banner Button Text Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-6 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              ৩. Banner Button Text <span className="text-zinc-400 font-bold">(Optional)</span>
            </h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Call to action text inside the action button
            </p>
          </div>
          
          <input 
            type="text"
            id="banner-btn-text-input"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="e.g. SHOP NOW"
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-bold text-xs uppercase text-black"
          />
        </div>

        {/* 4. Banner Navigation Link Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              ৪. Banner Navigation Link <span className="text-zinc-400 font-bold">(Optional)</span>
            </h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Select a pre-existing product or specify a custom routing path
            </p>
          </div>

          {/* Shortcut Selector */}
          <div className="space-y-1.5 relative">
            <span className="text-[8px] font-black tracking-widest text-neutral-400 block uppercase">Product Selection Shortcut</span>
            <ProductSearchDropdown 
              products={products} 
              value={connectedProductId} 
              onChange={(val) => {
                setConnectedProductId(val);
                if (val) {
                  setButtonLink(`/product/${val}`);
                } else {
                  setButtonLink('');
                }
              }}
            />
          </div>

          {/* Raw Input Redirection Path */}
          <div className="space-y-1.5">
            <span className="text-[8px] font-black tracking-widest text-neutral-400 block uppercase">Custom Action Redirection Path</span>
            <input 
              type="text"
              id="banner-redirect-path"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              placeholder="e.g. /product/product-id-here or /shop"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-mono font-bold text-xs text-black"
            />
          </div>
        </div>

        {/* 5. Save Banner Action Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-[10px] font-black uppercase text-black tracking-widest">Ready to Publish?</h4>
            <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest mt-1">Upload your images above to save and publish them instantly.</p>
          </div>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest transition-all rounded-none duration-150 cursor-pointer disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Select Image & Save Banner
              </>
            )}
          </button>
        </div>

      </div>

      {/* Main Sequence Panel */}
      {banners.length >= 2 && (
        <section className="bg-white border border-zinc-200 rounded-none p-6 md:p-8 shadow-sm space-y-4">
          <div className="border-b border-zinc-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-neutral-900">
              🗂️ Banner Sequence ({banners.length})
            </h2>
            <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest mt-0.5">Drag and drop slides to adjust priority</p>
          </div>
          
          <div className="flex items-center justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest px-1">
            <span>← First Slide</span>
            <span>Horizontal Scroll Area</span>
          </div>
          
          <div 
            className="flex overflow-x-auto gap-4 pb-4 snap-x pt-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {banners.map((banner, index) => (
              <BannerThumbnailItem 
                key={banner.id}
                banner={banner}
                index={index}
                onDelete={() => handleDeleteBanner(banner.id)}
                onDragStart={(e) => handleSeqDragStart(e, index)}
                onDrop={(e) => handleSeqDrop(e, index)}
                onDragOver={handleSeqDragOver}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

interface BannerThumbnailItemProps {
  banner: Banner;
  index: number;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const BannerThumbnailItem: React.FC<BannerThumbnailItemProps> = ({ 
  banner, 
  index, 
  onDelete, 
  onDragStart, 
  onDrop, 
  onDragOver 
}) => {
  // Pad the index with 0 for single digits
  const formatIndex = (idx: number) => (idx + 1).toString().padStart(2, '0');

  return (
    <div 
      className="shrink-0 w-32 snap-center relative group select-none cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden flex flex-col h-full shadow-sm">
        
        {/* Top absolute actions */}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-rose-600 scale-90 z-20"
          title="Remove Banner"
        >
          ✕
        </button>

        {/* Thumbnail Image */}
        <div 
          className="aspect-[21/9] w-full bg-neutral-950 overflow-hidden relative border-b border-zinc-150 flex items-center justify-center cursor-pointer pointer-events-none"
        >
          {banner.image ? (
            <img 
              src={banner.image} 
              alt={banner.name || 'Banner'} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="text-[10px] text-zinc-500 font-black uppercase">No Image</div>
          )}
        </div>

        {/* Meta */}
        <div className="p-1.5 bg-zinc-50 border-t border-zinc-100 flex justify-center items-center">
          <span className="text-[9px] font-black text-neutral-900 uppercase tracking-widest bg-zinc-200 px-2 py-0.5 rounded-full">
            {formatIndex(index)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---- Additional Components below ----

interface ProductSearchDropdownProps {
  products: any[];
  value: string;
  onChange: (val: string) => void;
}

const ProductSearchDropdown: React.FC<ProductSearchDropdownProps> = ({ products, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedProduct = products.find(p => p.id === value);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-zinc-200 px-3 py-2.5 rounded-lg text-xs font-bold uppercase bg-white cursor-pointer h-11 flex justify-between items-center transition-colors hover:border-black"
      >
        <span className="truncate pr-2">
          {selectedProduct ? `${selectedProduct.name} (৳${selectedProduct.price})` : '-- Click to Preselect Product --'}
        </span>
        <div className="flex items-center gap-1">
          {selectedProduct && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setQuery('');
              }}
              className="p-1 hover:bg-zinc-100 rounded-full"
              title="Clear Selection"
            >
              <X className="w-3.5 h-3.5 text-zinc-500 hover:text-red-500" />
            </div>
          )}
          <span className="text-[10px] text-zinc-400">▼</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50">
            <Search className="w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product by name or SKU..."
              className="w-full bg-transparent text-xs outline-none uppercase font-bold"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    onChange(p.id);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`p-3 text-xs cursor-pointer hover:bg-zinc-100 transition-colors uppercase font-bold flex items-center justify-between ${
                    value === p.id ? 'bg-zinc-100 border-l-2 border-black' : ''
                  }`}
                >
                  <span className="truncate pr-4">{p.name} <span className="text-zinc-500 font-mono text-[10px] ml-1">{p.sku && `[${p.sku}]`}</span></span>
                  <span className="text-emerald-600 font-black">৳{p.price}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-zinc-500 uppercase font-bold">
                No Products Found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
