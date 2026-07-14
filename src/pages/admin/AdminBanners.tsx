import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Upload, Layers, ChevronLeft, Search, X, Database, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBannerStore, Banner } from '../../store/useBannerStore';
import { useProductStore } from '../../store/useProductStore';
import UnsavedChangesDialog from '../../components/common/UnsavedChangesDialog';
import DeleteBannerConfirmationDialog from '../../components/common/DeleteBannerConfirmationDialog';

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

interface LocalPreview {
  id: string;
  file: File;
  previewUrl: string;
  croppedBlob: Blob;
}

export default function AdminBanners() {
  const { banners } = useBannerStore();
  const products = useProductStore((state) => state.products) || [];
  
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const initialAction = searchParams.get('action');
  const navigate = useNavigate();

  // Unsaved changes state and logic
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    // Push dummy state to capture browser/gesture back button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      // Show confirmation dialog
      setShowLeaveDialog(true);
      // Restore dummy state
      window.history.pushState(null, '', window.location.href);
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleConfirmLeave = () => {
    setIsDirty(false);
    setShowLeaveDialog(false);
    navigate(pendingNavigationPath || '/admin/banner/list', { replace: true });
  };

  const handleCancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingNavigationPath(null);
  };

  // Form Fields State
  const [name, setName] = useState('');
  const [offerText, setOfferText] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [buttonLink, setButtonLink] = useState('');
  const [connectedProductId, setConnectedProductId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([]);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerIdToDelete, setBannerIdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Database Schema Readiness Check State
  const [schemaStatus, setSchemaStatus] = useState<{
    checked: boolean;
    ready: boolean;
    error?: string;
  }>({ checked: true, ready: true });

  const verifyDbSchema = async () => {
    // Silent check to avoid blocking the user dashboard
    setSchemaStatus({ checked: true, ready: true });
  };

  useEffect(() => {
    verifyDbSchema();
  }, []);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill form state when editing
  useEffect(() => {
    // Clear form when in "Add Mode"
    setName('');
    setOfferText('');
    setDescription('');
    setButtonText('Shop Now');
    setButtonLink('');
    setConnectedProductId('');
  }, [banners]);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      localPreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, [localPreviews]);

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
      setIsDirty(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFiles(Array.from(e.target.files));
      setIsDirty(true);
    }
  };

  const handleRemovePreview = (id: string) => {
    setIsDirty(true);
    setLocalPreviews((prev) => {
      const target = prev.find(item => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const handleImageFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newPreviews: LocalPreview[] = [];

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
              const targetRatio = 1920 / 650;
              const targetWidth = 1920;
              const targetHeight = 650;
              
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

        const previewUrl = URL.createObjectURL(bannerBlob);
        newPreviews.push({
          id: `preview_${Date.now()}_${Math.floor(Math.random() * 1000)}_${newPreviews.length}`,
          file,
          previewUrl,
          croppedBlob: bannerBlob
        });
      } catch (err) {
        console.error(err);
        toast.error(`❌ Failed to process ${file.name}`);
      }
    }

    if (newPreviews.length > 0) {
      setLocalPreviews((prev) => [...prev, ...newPreviews]);
    }
    
    setIsProcessing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublishBanners = async () => {
    if (localPreviews.length === 0) return;
    setIsSubmitting(true);
    let successCount = 0;

    const { uploadImage } = await import('../../lib/imageUtils');

    try {
      const currentBannersLength = useBannerStore.getState().banners.length;
      const newBanners: Banner[] = [];

      for (const item of localPreviews) {
        try {
          const downloadUrl = await uploadImage(item.croppedBlob, 'banners', item.file.name);
          const targetId = `ban_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const currentOrder = currentBannersLength + successCount;

          const bannerData: Banner = {
            id: targetId,
            image: downloadUrl,
            name: name.trim(),
            offerText: offerText.trim(),
            description: description.trim(),
            buttonText: buttonText.trim(),
            buttonLink: buttonLink.trim(),
            buttonEnabled: !!buttonText.trim() && !!buttonLink.trim(),
            connectedProductId: connectedProductId || undefined,
            isCustomButtonText: true,
            locations: ['homepage-hero'],
            bannerSize: 'hero',
            status: 'active',
            order: currentOrder,
            bannerType: 'uploaded',
            createdDate: new Date().toISOString()
          };

          newBanners.push(bannerData);
          successCount++;
        } catch (innerErr) {
          console.error(innerErr);
          toast.error(`❌ Failed to upload ${item.file.name}`);
        }
      }

      if (successCount > 0) {
        const result = await useBannerStore.getState().publishNewBanners(newBanners);

        if (!result.success) {
            throw result.error;
        }
        
        localPreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
        setLocalPreviews([]);
        
        toast.success(`🎉 Banner saved successfully.`);
        
        setName('');
        setOfferText('');
        setDescription('');
        setButtonText('Shop Now');
        setButtonLink('');
        setConnectedProductId('');

        setIsDirty(false);
        // Redirect user to Banner Listing as part of a smooth administrative workflow
        navigate('/admin/banner/list');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save banner. Please try again.');
    }

    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setIsDirty(false);
    navigate('/admin/banner/list');
  };

  const handleEditClick = (banner: Banner, action?: string) => {
    let url = `/admin/banner/create?editId=${banner.id}`;
    if (action) {
      url += `&action=${action}`;
    }
    navigate(url);
  };

  const handleDeleteClick = (bannerId: string) => {
    setBannerIdToDelete(bannerId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bannerIdToDelete) return;
    setIsDeleting(true);
    try {
      await useBannerStore.getState().deleteBannerPermanently(bannerIdToDelete);
      toast.success("Banner সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে।");
      setIsDeleteModalOpen(false);
      setBannerIdToDelete(null);
    } catch (err: any) {
      console.error(err);
      toast.error(`❌ Failed to delete banner: ${err?.message || 'Unknown database error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setBannerIdToDelete(null);
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
    <div id="admin-banner-control" className="w-full max-w-5xl mx-auto px-3 sm:px-6 space-y-6 font-sans pb-24">
      {/* Simple Back Button */}
      <div className="flex justify-between items-center pt-2">
        <button 
          type="button" 
          onClick={() => {
            if (isDirty) {
              setPendingNavigationPath('/admin/banner/list');
              setShowLeaveDialog(true);
            } else {
              navigate('/admin/banner/list');
            }
          }} 
          className="text-xs font-black tracking-wider uppercase text-neutral-600 hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          &larr; Back to Banners
        </button>
      </div>

      {/* Form Sections (Each Field inside its own separate card container) */}
      <div className="space-y-6" onChange={() => setIsDirty(true)}>
        
        {/* 1. Banner Image Upload Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              1. Banner Image Upload <span className="text-rose-500 font-bold">*</span>
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
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all min-h-[220px] w-full ${
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
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-6">
                <span className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin mb-2" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Processing & Cropping...</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-neutral-400 mb-2" />
                <span className="text-[10px] font-black uppercase text-black tracking-wider">Drag Multiple Images Here or Browse</span>
                <span className="text-[8px] text-zinc-400 uppercase tracking-widest mt-1.5 font-bold font-mono">Recommended Size: Desktop 1920 × 650 px / Mobile 1080 × 500 px</span>
              </>
            )}
          </div>

          {/* Local Previews Horizontal Row (Only shown if local previews exist) */}
          {localPreviews.length > 0 && (
            <div className="pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                <span>Selected Previews ({localPreviews.length})</span>
                <span>Swipe to Scroll &rarr;</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-thin scrollbar-thumb-zinc-200">
                {localPreviews.map((preview, index) => (
                  <div 
                    key={preview.id} 
                    className="relative flex-none w-48 sm:w-64 aspect-[1080/500] sm:aspect-[1200/500] md:aspect-[1920/650] bg-zinc-100 border border-zinc-200 snap-start overflow-hidden group/thumb select-none"
                  >
                    <img 
                      src={preview.previewUrl} 
                      alt={`Banner ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                    {/* Badge Serial Indicator */}
                    <div className="absolute bottom-1 left-1 bg-black/75 px-1.5 py-0.5 text-[8px] font-black text-white uppercase tracking-wider font-mono">
                      Banner {index + 1}
                    </div>
                    {/* Close / Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePreview(preview.id);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/85 text-white rounded-none border border-zinc-800 hover:bg-rose-600 hover:border-rose-600 flex items-center justify-center transition-all cursor-pointer opacity-100 group-hover/thumb:opacity-100"
                      title="Remove from previews"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Banner Title Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              2. Banner Title <span className="text-zinc-400 font-bold">(Optional)</span>
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

        {/* 3. Banner Subtitle Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              3. Banner Subtitle <span className="text-zinc-400 font-bold">(Optional)</span>
            </h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Secondary text or promotional catchphrase (e.g. LIMITED TIME OFFER)
            </p>
          </div>
          
          <input 
            type="text"
            id="banner-subtitle-input"
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            placeholder="e.g. SPECIAL RAMADAN COLLECTION"
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-bold text-xs uppercase text-black"
          />
        </div>

        {/* 4. Banner Description Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              4. Banner Description <span className="text-zinc-400 font-bold">(Optional)</span>
            </h4>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Small descriptive text providing additional details
            </p>
          </div>
          
          <textarea 
            id="banner-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Explore our newest arrivals for the season with premium quality material."
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-none focus:outline-none focus:border-black font-bold text-xs uppercase text-black min-h-[80px] resize-none"
          />
        </div>

        {/* 5. Banner Button Text Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-8 space-y-4 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              5. Banner Button Text <span className="text-zinc-400 font-bold">(Optional)</span>
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

        {/* 6. Banner Navigation Link Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-zinc-100 pb-3">
            <h4 className="text-[10px] font-black text-black uppercase tracking-widest">
              6. Banner Navigation Link <span className="text-zinc-400 font-bold">(Optional)</span>
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

        {/* 7. Save Banner Action Card */}
        <div className="bg-white border border-zinc-200 rounded-none p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div>
            <h4 className="text-[10px] font-black uppercase text-black tracking-widest">Ready to Publish?</h4>
            <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest mt-1">
              {localPreviews.length > 0 
                ? `You have prepared ${localPreviews.length} banner(s) for publishing.` 
                : "Select or drag hero images in the first step above to begin."}
            </p>
          </div>
          <button 
            type="button"
            disabled={isSubmitting || isProcessing || localPreviews.length === 0}
            onClick={handlePublishBanners}
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
                Save Banners ({localPreviews.length})
              </>
            )}
          </button>
        </div>

      </div>

      {/* Main Sequence Panel */}
      {banners.length >= 1 && (
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
                onDelete={() => handleDeleteClick(banner.id)}
                onDragStart={(e) => handleSeqDragStart(e, index)}
                onDrop={(e) => handleSeqDrop(e, index)}
                onDragOver={handleSeqDragOver}
              />
            ))}
          </div>
        </section>
      )}
      
      <UnsavedChangesDialog
        isOpen={showLeaveDialog}
        title="Unsaved Changes"
        message="আপনি এখনও ব্যানার তথ্য Save করেননি। আপনি কি নিশ্চিত এই পেজ থেকে বের হতে চান? আপনার করা পরিবর্তনগুলো হারিয়ে যাবে।"
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        cancelText="Cancel"
        confirmText="Yes, Leave"
      />

      <DeleteBannerConfirmationDialog
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
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
          className="aspect-[1080/500] sm:aspect-[1200/500] md:aspect-[1920/650] w-full bg-neutral-950 overflow-hidden relative border-b border-zinc-150 flex items-center justify-center cursor-pointer pointer-events-none"
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
