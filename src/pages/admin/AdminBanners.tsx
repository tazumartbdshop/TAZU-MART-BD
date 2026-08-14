import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  ChevronLeft, 
  Search, 
  X, 
  Check, 
  Loader2, 
  Image as ImageIcon,
  User,
  Sliders,
  Sparkles,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useBannerStore, Banner } from '../../store/useBannerStore';
import { useProductStore } from '../../store/useProductStore';
import { useBrandingStore } from '../../store/useBrandingStore';
import { uploadImage } from '../../lib/imageUtils';
import { getSupabase } from '../../lib/supabase';
import UnsavedChangesDialog from '../../components/common/UnsavedChangesDialog';

interface LocalPreview {
  id: string;
  file: File;
  previewUrl: string;
  croppedBlob: Blob;
}

export type BannerCategoryType = 'main' | 'login';

export default function AdminBanners() {
  const { banners, updateBanner } = useBannerStore();
  const { settings: branding, updateBranding, isLoaded: isBrandingLoaded } = useBrandingStore();
  const products = useProductStore((state) => state.products) || [];
  
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const navigate = useNavigate();

  // Banner Type Selector: 'main' (Main Banner) vs 'login' (Login Banner)
  const [bannerCategory, setBannerCategory] = useState<BannerCategoryType>('main');

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

  // Default Character Management States
  const [maleImage, setMaleImage] = useState('');
  const [femaleImage, setFemaleImage] = useState('');
  const [guestImage, setGuestImage] = useState('');
  const [characterUploadingSlot, setCharacterUploadingSlot] = useState<'male' | 'female' | 'guest' | null>(null);

  // Unsaved changes state
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigationPath, setPendingNavigationPath] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const characterFileInputRef = useRef<HTMLInputElement>(null);
  const [activeCharacterUploadSlot, setActiveCharacterUploadSlot] = useState<'male' | 'female' | 'guest' | null>(null);

  // Load existing character avatars from branding store
  useEffect(() => {
    if (isBrandingLoaded || branding) {
      setMaleImage(branding.male_profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80');
      setFemaleImage(branding.female_profile_image || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80');
      setGuestImage(branding.default_profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    }
  }, [branding, isBrandingLoaded]);

  // Load banner data if editId is provided
  useEffect(() => {
    if (editId) {
      const bannerToEdit = banners.find(b => b.id === editId);
      if (bannerToEdit) {
        setName(bannerToEdit.name || '');
        setOfferText(bannerToEdit.offerText || '');
        setDescription(bannerToEdit.description || '');
        setButtonText(bannerToEdit.buttonText || 'Shop Now');
        setButtonLink(bannerToEdit.buttonLink || '');
        setConnectedProductId(bannerToEdit.connectedProductId || '');
        setBannerCategory((bannerToEdit.bannerCategory as BannerCategoryType) || 'main');
      }
    } else {
      setName('');
      setOfferText('');
      setDescription('');
      setButtonText('Shop Now');
      setButtonLink('');
      setConnectedProductId('');
    }
  }, [editId, banners]);

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      localPreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
    };
  }, [localPreviews]);

  // Navigation leave confirmation handlers
  const handleConfirmLeave = () => {
    setIsDirty(false);
    setShowLeaveDialog(false);
    navigate(pendingNavigationPath || '/admin/banner/list', { replace: true });
  };

  const handleCancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingNavigationPath(null);
  };

  // Drag & drop handlers for banner image
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
              // For Main Banner: Standard Hero Ratio (1920x650)
              // For Login Banner: 1536x1024 (3:2 Natural Aspect Ratio)
              const targetWidth = bannerCategory === 'login' ? 1536 : 1920;
              const targetHeight = bannerCategory === 'login' ? 1024 : 650;
              const targetRatio = targetWidth / targetHeight;
              
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
              
              if (bannerCategory === 'login') {
                // For Login Banner: preserve full image composition without aggressive cutting
                if (imgRatio > targetRatio) {
                  drawWidth = targetWidth;
                  drawHeight = targetWidth / imgRatio;
                  offsetX = 0;
                  offsetY = (targetHeight - drawHeight) / 2;
                } else {
                  drawHeight = targetHeight;
                  drawWidth = targetHeight * imgRatio;
                  offsetX = (targetWidth - drawWidth) / 2;
                  offsetY = 0;
                }
              } else {
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
              }
              
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, targetWidth, targetHeight);
              ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
              
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject('Blob generation failed');
              }, 'image/webp', 0.92);
            };
            img.onerror = () => reject('Image load failed');
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        });

        const previewUrl = URL.createObjectURL(bannerBlob);
        newPreviews.push({
          id: `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          file,
          previewUrl,
          croppedBlob: bannerBlob
        });
      } catch (err) {
        console.error("Image processing error:", err);
        toast.error(`❌ Could not process ${file.name}`);
      }
    }

    setLocalPreviews((prev) => [...prev, ...newPreviews]);
    setIsProcessing(false);
  };

  // Submit & Save Banner(s)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (editId) {
      // Editing single banner
      setIsSubmitting(true);
      try {
        let imageUrl: string | undefined = undefined;
        if (localPreviews.length > 0) {
          imageUrl = await uploadImage(localPreviews[0].croppedBlob, 'banners', localPreviews[0].file.name);
        }

        const isLogin = bannerCategory === 'login';
        const bannerTypeVal = isLogin ? 'login_banner' : 'main_banner';

        const updates: Partial<Banner> = {
          name: name.trim() || (isLogin ? 'Login Banner' : 'Main Banner'),
          offerText: offerText.trim(),
          description: description.trim(),
          buttonText: buttonText.trim(),
          buttonLink: buttonLink.trim(),
          buttonEnabled: !!buttonText.trim() && !!buttonLink.trim(),
          connectedProductId: connectedProductId || undefined,
          bannerType: bannerTypeVal,
          bannerCategory: bannerTypeVal,
          mediaType: 'banner'
        };

        if (imageUrl) {
          updates.image = imageUrl;
        }

        updateBanner(editId, updates);

        // If this is a login banner, also keep branding.login_banner in sync
        if (isLogin && imageUrl) {
          await updateBranding({ login_banner: imageUrl });
        }

        toast.success(`Banner (${isLogin ? 'LOGIN BANNER' : 'MAIN BANNER'}) updated successfully!`);
        setIsDirty(false);
        navigate('/admin/banner/list');
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to update banner.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Creating new banners
    if (localPreviews.length === 0) {
      toast.error('⚠️ Please select or drop at least one banner image.');
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    const supabase = getSupabase();

    if (!supabase) {
      toast.error('❌ Supabase client unavailable');
      setIsSubmitting(false);
      return;
    }

    try {
      const currentBannersLength = useBannerStore.getState().banners.length;
      const newBanners: Banner[] = [];

      for (const item of localPreviews) {
        try {
          const downloadUrl = await uploadImage(item.croppedBlob, 'banners', item.file.name);
          const targetId = `ban_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const currentOrder = currentBannersLength + successCount;

          const isLogin = bannerCategory === 'login';
          const bannerTypeVal = isLogin ? 'login_banner' : 'main_banner';

          const bannerData: Banner = {
            id: targetId,
            image: downloadUrl,
            name: name.trim() || (isLogin ? 'Login Banner' : 'Main Banner'),
            offerText: offerText.trim(),
            description: description.trim(),
            buttonText: buttonText.trim(),
            buttonLink: buttonLink.trim(),
            buttonEnabled: !!buttonText.trim() && !!buttonLink.trim(),
            connectedProductId: connectedProductId || undefined,
            isCustomButtonText: true,
            locations: isLogin ? ['auth-page'] : ['homepage-hero'],
            bannerSize: 'hero',
            status: 'active',
            order: currentOrder,
            bannerType: bannerTypeVal,
            bannerCategory: bannerTypeVal,
            mediaType: 'banner',
            createdDate: new Date().toISOString()
          };

          newBanners.push(bannerData);

          // If it's a login banner, update branding store's login_banner for instant live reflection on Create Account/Login pages
          if (isLogin) {
            await updateBranding({ login_banner: downloadUrl });
          }

          successCount++;
        } catch (innerErr) {
          console.error(innerErr);
          toast.error(`❌ Failed to upload ${item.file.name}`);
        }
      }

      if (successCount > 0) {
        const { objectToSnake } = await import('../../lib/supabaseUtils');
        const dbPayloads = objectToSnake(newBanners);

        const { error: bannersErr } = await supabase.from('banners').upsert(dbPayloads);
        if (bannersErr) {
          throw new Error('Failed to save banner. Please try again.');
        }

        // If login banners were added, also sync to dedicated login_banners table
        if (bannerCategory === 'login') {
          try {
            const loginPayloads = newBanners.map(b => ({
              title: b.name,
              image_url: b.image,
              is_active: b.status === 'active',
              sort_order: b.order || 0
            }));
            await supabase.from('login_banners').insert(loginPayloads);
          } catch (lErr) {
            console.warn("login_banners table sync note:", lErr);
          }
        }

        try {
          await supabase.from('banners_draft').upsert(dbPayloads);
        } catch (draftErr) {
          console.warn("banners_draft upsert note:", draftErr);
        }

        const existingBanners = useBannerStore.getState().banners;
        const updatedBanners = [...existingBanners.filter(b => !newBanners.some(n => n.id === b.id)), ...newBanners];
        useBannerStore.getState().setBanners(updatedBanners);
        
        localPreviews.forEach(p => URL.revokeObjectURL(p.previewUrl));
        setLocalPreviews([]);
        
        toast.success(`🎉 ${successCount} Banner(s) (${bannerCategory === 'login' ? 'LOGIN BANNER' : 'MAIN BANNER'}) saved successfully.`);
        
        setIsDirty(false);
        navigate('/admin/banner/list');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to save banner. Please try again.');
    }

    setIsSubmitting(false);
  };

  // Character Upload & Replace Handlers
  const handleCharacterSlotClick = (slot: 'male' | 'female' | 'guest') => {
    setActiveCharacterUploadSlot(slot);
    characterFileInputRef.current?.click();
  };

  const handleCharacterFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slot = activeCharacterUploadSlot;
    if (!file || !slot) return;

    setCharacterUploadingSlot(slot);
    try {
      const url = await uploadImage(file, 'profiles', `char_${slot}_${Date.now()}`);
      if (url) {
        if (slot === 'male') {
          setMaleImage(url);
          await updateBranding({ male_profile_image: url });
        } else if (slot === 'female') {
          setFemaleImage(url);
          await updateBranding({ female_profile_image: url });
        } else if (slot === 'guest') {
          setGuestImage(url);
          await updateBranding({ default_profile_image: url });
        }
        toast.success(`✅ ${slot.toUpperCase()} Character updated successfully!`);
      }
    } catch (err: any) {
      console.error(`Failed to upload ${slot} character:`, err);
      toast.error(`❌ Upload failed: ${err.message || 'Error'}`);
    } finally {
      setCharacterUploadingSlot(null);
      if (characterFileInputRef.current) {
        characterFileInputRef.current.value = '';
      }
    }
  };

  const handleResetCharacterSlot = async (slot: 'male' | 'female' | 'guest') => {
    try {
      if (slot === 'male') {
        const def = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80';
        setMaleImage(def);
        await updateBranding({ male_profile_image: def });
      } else if (slot === 'female') {
        const def = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80';
        setFemaleImage(def);
        await updateBranding({ female_profile_image: def });
      } else if (slot === 'guest') {
        const def = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
        setGuestImage(def);
        await updateBranding({ default_profile_image: def });
      }
      toast.success(`Reset ${slot.toUpperCase()} to standard avatar`);
    } catch (e) {
      toast.error("Failed to reset slot");
    }
  };

  return (
    <div id="admin-banner-control" className="w-full max-w-5xl mx-auto px-3 sm:px-6 space-y-6 font-sans pb-24 text-left">
      
      {/* Top Header & Back Link */}
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

      {/* Hidden file input for characters */}
      <input 
        ref={characterFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCharacterFileChange}
        className="hidden"
      />

      <div className="space-y-6" onChange={() => setIsDirty(true)}>

        {/* ======================================================================= */}
        {/* SECTION 1: BANNER CONTROL (Main Banner vs Login Banner Selection)       */}
        {/* ======================================================================= */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-6 space-y-4 shadow-xs">
          <div className="border-b border-zinc-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                BANNER CONTROL — MEDIA TYPE SELECTION
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
                Choose banner destination type before uploading image
              </p>
            </div>

            {/* Type selector toggle pills */}
            <div className="flex items-center gap-2 p-1 bg-zinc-100 border border-zinc-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setBannerCategory('main');
                  setIsDirty(true);
                }}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  bannerCategory === 'main' 
                    ? 'bg-black text-white shadow-xs' 
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Main Banner
              </button>
              <button
                type="button"
                onClick={() => {
                  setBannerCategory('login');
                  setIsDirty(true);
                }}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  bannerCategory === 'login' 
                    ? 'bg-black text-white shadow-xs' 
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Login Banner
              </button>
            </div>
          </div>

          {/* Banner Upload Box */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-800">
                1. Upload {bannerCategory === 'login' ? 'Login Banner Image' : 'Main Slideshow Image'} <span className="text-rose-500 font-bold">*</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-neutral-800 uppercase bg-zinc-100 border border-zinc-300 px-2.5 py-1">
                {bannerCategory === 'login' 
                  ? 'Recommended: 1536 × 1024 px (Aspect Ratio: 3:2)' 
                  : 'Recommended: 1920 × 650 px (Hero Slideshow)'}
              </span>
            </div>

            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-none flex flex-col items-center justify-center cursor-pointer transition-all w-full p-6 text-center ${
                bannerCategory === 'login' ? 'min-h-[220px] md:min-h-[260px]' : 'min-h-[180px]'
              } ${
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
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-black mb-2" />
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Processing Image...</span>
                </div>
              ) : (
                <>
                  <Upload className="w-7 h-7 text-neutral-400 mb-2.5" />
                  <span className="text-[11px] font-black uppercase text-black tracking-wider">
                    Drag {bannerCategory === 'login' ? 'Login Banner' : 'Main Banner'} Image Here or Browse
                  </span>
                  
                  {bannerCategory === 'login' ? (
                    <div className="mt-2 space-y-1">
                      <span className="inline-block bg-black text-white text-[9px] font-black uppercase px-2.5 py-0.5 tracking-wider">
                        এই সাইজের ব্যানার আপলোড করুন: 1536 × 1024 px (3:2)
                      </span>
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold block">
                        Maintains 3:2 visual proportion across Create Account, Login & Member headers
                      </p>
                    </div>
                  ) : (
                    <span className="text-[8px] text-zinc-400 uppercase tracking-widest mt-1 font-bold">
                      Used in Storefront Homepage hero carousel (1920 × 650 px)
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Login Banner Guidelines Box */}
            {bannerCategory === 'login' && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 flex items-start gap-2.5">
                <span className="text-xs mt-0.5">💡</span>
                <div className="text-[10px] leading-relaxed text-neutral-700">
                  <span className="text-black font-black uppercase tracking-wider">Login Banner Specification:</span>{' '}
                  <span className="text-neutral-600">
                    Recommended Banner Size: <strong>1536 × 1024 px</strong> | Aspect Ratio: <strong>3:2</strong>. 
                    ব্যানারের সম্পূর্ণ গঠন ও ভিজ্যুয়াল ব্যালেন্স অক্ষুণ্ণ রাখতে এই সাইজ ব্যবহার করুন। ছবি কোনো চ্যাপ্টা হওয়া বা অবাঞ্ছিত ক্রপ ছাড়াই সরাসরি সুন্দরভাবে দেখা যাবে।
                  </span>
                </div>
              </div>
            )}

            {/* Selected local preview list */}
            {localPreviews.length > 0 && (
              <div className="pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                  <span>Selected Images ({localPreviews.length})</span>
                  <span>Target: {bannerCategory.toUpperCase()} BANNER</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {localPreviews.map((preview, index) => (
                    <div 
                      key={preview.id} 
                      className={`relative flex-none bg-zinc-100 border border-zinc-200 overflow-hidden group select-none ${
                        bannerCategory === 'login' ? 'w-48 aspect-[3/2]' : 'w-52 aspect-[1920/650]'
                      }`}
                    >
                      <img 
                        src={preview.previewUrl} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/80 px-1.5 py-0.5 text-[8px] font-black text-white uppercase tracking-wider">
                        #{index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePreview(preview.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white flex items-center justify-center cursor-pointer"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Banner Details (Optional titles & links for main banners) */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-6 space-y-4 shadow-xs">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-xs font-black text-black uppercase tracking-wider">
              2. Banner Information & Link Target <span className="text-zinc-400 font-bold">(Optional)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-800 mb-1">
                Banner Name / Title
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={bannerCategory === 'login' ? 'e.g. Account Welcome Banner' : 'e.g. SUMMER APPARELS 50% FLAT'}
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black font-bold text-xs uppercase text-black"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-800 mb-1">
                Subtitle / Promo Catchphrase
              </label>
              <input 
                type="text"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                placeholder="e.g. SPECIAL OFFER"
                className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black font-bold text-xs uppercase text-black"
              />
            </div>
          </div>

          {bannerCategory === 'main' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-800 mb-1">
                  Connect Specific Product (Optional)
                </label>
                <ProductSearchDropdown 
                  products={products}
                  value={connectedProductId}
                  onChange={(val) => {
                    setConnectedProductId(val);
                    setIsDirty(true);
                  }}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-800 mb-1">
                  Direct Target Link / Route (Optional)
                </label>
                <input 
                  type="text"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  placeholder="e.g. /category/electronics or /offers"
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 focus:outline-none focus:border-black font-mono text-xs text-black"
                />
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* SECTION 2: ACCOUNT PROFILE CHARACTERS (Male, Female, Guest)             */}
        {/* Strictly separated from banners; saved to Account Character Settings    */}
        {/* ======================================================================= */}
        <div className="bg-white border border-zinc-200 rounded-none p-4 md:p-6 space-y-4 shadow-xs">
          <div className="border-b border-zinc-100 pb-3">
            <h3 className="text-xs font-black text-black uppercase tracking-wider">
              ACCOUNT PROFILE CHARACTERS
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">
              Default fallback avatars for Male, Female, and Guest customer profiles (Saved directly to Account Character Settings; not included in Banner Listing)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Slot 1: Male */}
            <div className="border border-zinc-200 p-3 bg-zinc-50/50 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-300 bg-white shrink-0">
                  <img 
                    src={maleImage} 
                    alt="Male Character" 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  {characterUploadingSlot === 'male' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-black leading-none">Male Character</h4>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1 block">● Active Setting</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => handleCharacterSlotClick('male')}
                  className="flex-1 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                >
                  Upload / Change
                </button>
                <button
                  type="button"
                  onClick={() => handleResetCharacterSlot('male')}
                  className="px-2 py-1.5 bg-zinc-200 text-neutral-700 text-[9px] font-black uppercase hover:bg-zinc-300 cursor-pointer"
                  title="Reset to default"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Slot 2: Female */}
            <div className="border border-zinc-200 p-3 bg-zinc-50/50 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-300 bg-white shrink-0">
                  <img 
                    src={femaleImage} 
                    alt="Female Character" 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  {characterUploadingSlot === 'female' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-black leading-none">Female Character</h4>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1 block">● Active Setting</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => handleCharacterSlotClick('female')}
                  className="flex-1 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                >
                  Upload / Change
                </button>
                <button
                  type="button"
                  onClick={() => handleResetCharacterSlot('female')}
                  className="px-2 py-1.5 bg-zinc-200 text-neutral-700 text-[9px] font-black uppercase hover:bg-zinc-300 cursor-pointer"
                  title="Reset to default"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Slot 3: Guest */}
            <div className="border border-zinc-200 p-3 bg-zinc-50/50 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-300 bg-white shrink-0">
                  <img 
                    src={guestImage} 
                    alt="Guest Character" 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  {characterUploadingSlot === 'guest' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-black leading-none">Guest Character</h4>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mt-1 block">● Active Setting</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => handleCharacterSlotClick('guest')}
                  className="flex-1 py-1.5 bg-black text-white text-[9px] font-black uppercase tracking-wider hover:bg-neutral-800 cursor-pointer"
                >
                  Upload / Change
                </button>
                <button
                  type="button"
                  onClick={() => handleResetCharacterSlot('guest')}
                  className="px-2 py-1.5 bg-zinc-200 text-neutral-700 text-[9px] font-black uppercase hover:bg-zinc-300 cursor-pointer"
                  title="Reset to default"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save / Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/banner/list')}
            className="px-5 py-3 border border-zinc-200 text-neutral-700 text-xs font-black uppercase tracking-wider hover:bg-zinc-50 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-6 py-3 bg-black hover:bg-neutral-900 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Save {bannerCategory === 'login' ? 'Login Banner' : 'Main Banner'} ({localPreviews.length})</span>
              </>
            )}
          </button>
        </div>

      </div>

      <UnsavedChangesDialog
        isOpen={showLeaveDialog}
        title="Unsaved Changes"
        message="আপনি এখনও ব্যানার তথ্য Save করেননি। আপনি কি নিশ্চিত এই পেজ থেকে বের হতে চান?"
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        cancelText="Cancel"
        confirmText="Yes, Leave"
      />
    </div>
  );
}

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
        className="w-full border border-zinc-200 px-3 py-2.5 rounded-none text-xs font-bold uppercase bg-zinc-50 cursor-pointer h-10 flex justify-between items-center transition-colors hover:border-black"
      >
        <span className="truncate pr-2">
          {selectedProduct ? `${selectedProduct.name} (৳${selectedProduct.price})` : '-- Select Connected Product --'}
        </span>
        <div className="flex items-center gap-1">
          {selectedProduct && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setQuery('');
              }}
              className="p-1 hover:bg-zinc-200"
              title="Clear"
            >
              <X className="w-3.5 h-3.5 text-zinc-500" />
            </div>
          )}
          <span className="text-[10px] text-zinc-400">▼</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-zinc-200 rounded-none shadow-lg z-50 overflow-hidden">
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
          <div className="max-h-52 overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    onChange(p.id);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className={`p-2.5 text-xs cursor-pointer hover:bg-zinc-100 transition-colors uppercase font-bold flex items-center justify-between ${
                    value === p.id ? 'bg-zinc-100 border-l-2 border-black' : ''
                  }`}
                >
                  <span className="truncate pr-4">{p.name}</span>
                  <span className="text-emerald-600 font-black">৳{p.price}</span>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-zinc-500 uppercase font-bold">
                No Products Found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
