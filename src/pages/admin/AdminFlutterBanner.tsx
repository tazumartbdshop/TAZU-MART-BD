import React, { useState, useEffect, useRef } from 'react';
import { useFlutterBannerStore, FlutterBanner } from '../../store/useFlutterBannerStore';
import { Upload, Trash2, Edit2, Sliders, Smartphone, Check, X, ArrowUp, ArrowDown, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { toast } from 'react-hot-toast';

export default function AdminFlutterBanner() {
  const { 
    flutterBanners, 
    loading, 
    subscribeFlutterBanners, 
    addFlutterBanner, 
    updateFlutterBanner, 
    deleteFlutterBanner 
  } = useFlutterBannerStore();

  // Selected banner for editing (null means we're in "Add" mode)
  const [editingBanner, setEditingBanner] = useState<FlutterBanner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('View Details');
  const [redirectLink, setRedirectLink] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Image Upload States
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time synchronization
  useEffect(() => {
    const unsubscribe = subscribeFlutterBanners();
    return () => unsubscribe();
  }, []);

  // Sync edit mode to form fields
  useEffect(() => {
    if (editingBanner) {
      setTitle(editingBanner.title);
      setSubtitle(editingBanner.subtitle);
      setDescription(editingBanner.description);
      setButtonText(editingBanner.buttonText || 'View Details');
      setRedirectLink(editingBanner.redirectLink);
      setDisplayOrder(editingBanner.displayOrder);
      setIsActive(editingBanner.isActive);
      setImageUrl(editingBanner.imageUrl);
    } else {
      handleReset();
    }
  }, [editingBanner]);

  // Handle Form Reset
  const handleReset = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setButtonText('View Details');
    setRedirectLink('');
    // Auto increment order as a convenient helper
    const maxOrder = flutterBanners.length > 0 
      ? Math.max(...flutterBanners.map(b => b.displayOrder)) 
      : 0;
    setDisplayOrder(maxOrder + 1);
    setIsActive(true);
    setImageUrl('');
    setUploadProgress(null);
    setIsUploading(false);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Pre-process image: Auto resize & center-crop to 2560x1440 YouTube Banner Style
  const resizeAndCropImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Selected file is not a valid image'));
        return;
      }
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const targetWidth = 2560;
        const targetHeight = 1440;
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get Canvas 2D Context'));
          return;
        }

        const sourceWidth = img.width;
        const sourceHeight = img.height;
        const sourceAspect = sourceWidth / sourceHeight;
        const targetAspect = targetWidth / targetHeight;

        let sx = 0, sy = 0, sWidth = sourceWidth, sHeight = sourceHeight;

        if (sourceAspect > targetAspect) {
          sWidth = sourceHeight * targetAspect;
          sx = (sourceWidth - sWidth) / 2;
        } else if (sourceAspect < targetAspect) {
          sHeight = sourceWidth / targetAspect;
          sy = (sourceHeight - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas image compression failed'));
          }
        }, 'image/jpeg', 0.92);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to parse image file inside browser canvas'));
      };
    });
  };

  // Helper to wrap promises with a timeout
  const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 15000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
      )
    ]);
  };

  // Upload file logic with canvas auto-resize & crop, and multiple upload support (with immediate base64 fallback)
  const handleMultipleFilesUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Setup an interval to increment simulated progress smoothly (e.g. 0 to 95%)
    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
      simulatedProgress = Math.min(95, simulatedProgress + Math.floor(Math.random() * 8) + 4);
      setUploadProgress(simulatedProgress);
    }, 100);

    // Dynamic helper to try Firebase Storage with fallback to optimized Base64
    const uploadWithFallback = async (blob: Blob, originalName: string): Promise<string> => {
      // Parallelize base64 generation in case storage fails/times out
      const base64Promise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image blob'));
        reader.readAsDataURL(blob);
      });

      try {
        const fileNameClean = originalName.replace(/[^a-zA-Z0-9.]/g, '_').replace(/\.[^/.]+$/, "") + ".jpg";
        const storageRef = ref(storage, `flutterBanners/${Date.now()}_crop_${fileNameClean}`);
        
        // Fast upload attempt with a 4-second timeout limit
        console.log("Attempting Firebase Storage write...");
        const uploadResult = await withTimeout(uploadBytes(storageRef, blob), 4000);
        const downloadUrl = await withTimeout(getDownloadURL(uploadResult.ref), 4000);
        console.log("Firebase Storage successfully written:", downloadUrl);
        return downloadUrl;
      } catch (storageErr) {
        console.warn("Storage upload timed out/failed. Falling back to high-reliability inline Base64 storage.", storageErr);
        // Fallback to compressed base64 JPEG
        return await base64Promise;
      }
    };

    try {
      // Check if we are in EDIT mode (single file replacement)
      if (editingBanner) {
        const file = fileList[0];
        if (!file.type.startsWith('image/')) {
          clearInterval(progressInterval);
          toast.error('Please upload an image file (PNG, JPG, WEBP, etc.)');
          setIsUploading(false);
          setUploadStatus('idle');
          setUploadProgress(null);
          return;
        }

        toast.loading('Resizing and Cropping image to 2560x1440 YouTube standard...', { id: 'crop-loader' });
        const resizedBlob = await resizeAndCropImage(file);
        toast.dismiss('crop-loader');

        const resolvedUrl = await uploadWithFallback(resizedBlob, file.name);

        clearInterval(progressInterval);
        setImageUrl(resolvedUrl);

        setUploadStatus('success');
        setUploadProgress(100);
        await new Promise((res) => setTimeout(res, 800));
        toast.success('Successfully auto-resized and replaced the image! Click Update Banner to save.');
        setIsUploading(false);
        setUploadStatus('idle');
        setUploadProgress(null);
        return;
      }

      // Otherwise, we are in batch ADD mode!
      let successCount = 0;
      const maxOrder = flutterBanners.length > 0 
        ? Math.max(...flutterBanners.map(b => b.displayOrder)) 
        : 0;

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }

        try {
          // Pre-crop image to 2560x1440 (YouTube banner ratio)
          const resizedBlob = await resizeAndCropImage(file);

          const resolvedUrl = await uploadWithFallback(resizedBlob, file.name);

          const displayName = file.name.substring(0, file.name.lastIndexOf('.')) || 'New Banner';

          // Save immediately to Firestore
          await withTimeout(addFlutterBanner({
            imageUrl: resolvedUrl,
            title: displayName.trim(),
            subtitle: '',
            description: '',
            buttonText: 'View Details',
            redirectLink: '',
            displayOrder: maxOrder + i + 1,
            isActive: true
          }), 10000);

          successCount++;
        } catch (err: any) {
          console.error(`Error uploading file index ${i}:`, err);
        }
      }

      clearInterval(progressInterval);

      if (successCount > 0) {
        setUploadStatus('success');
        setUploadProgress(100);
        await new Promise((res) => setTimeout(res, 1000));
        toast.success(`✓ Upload Successful! Added ${successCount} banner(s) resized to 2560x1440.`);
        handleReset();
      } else {
        setUploadStatus('error');
        toast.error('Upload Failed. Please verify selected images.');
        await new Promise((res) => setTimeout(res, 1000));
        setIsUploading(false);
        setUploadStatus('idle');
        setUploadProgress(null);
      }

    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Batch Uploading error:', err);
      setUploadStatus('error');
      toast.error('Upload Failed: Please try again.');
      await new Promise((res) => setTimeout(res, 1200));
      setIsUploading(false);
      setUploadStatus('idle');
      setUploadProgress(null);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFilesUpload(e.target.files);
    }
  };

  // Handle Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      toast.error('Banner Image is required. Please upload an image.');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required.');
      return;
    }

    const payload = {
      imageUrl,
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      buttonText: buttonText.trim() || 'View Details',
      redirectLink: redirectLink.trim(),
      displayOrder: Number(displayOrder) || 1,
      isActive,
    };

    try {
      if (editingBanner) {
        await updateFlutterBanner(editingBanner.id, payload);
        toast.success('Flutter banner updated successfully!');
      } else {
        await addFlutterBanner(payload);
        toast.success('New Flutter banner added successfully!');
      }
      handleReset();
    } catch (err: any) {
      toast.error(err?.message || 'Error occurred while saving banner.');
    }
  };

  // Delete Banner handler
  const handleDelete = async (id: string) => {
    if (window.confirm('Do you really want to delete this Flutter banner?')) {
      try {
        await deleteFlutterBanner(id);
        toast.success('Flutter banner deleted from database.');
        if (editingBanner?.id === id) {
          handleReset();
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete banner.');
      }
    }
  };

  // Quick order adjustment buttons
  const adjustOrder = async (banner: FlutterBanner, direction: 'up' | 'down') => {
    const offset = direction === 'up' ? -1 : 1;
    const newOrder = Math.max(1, banner.displayOrder + offset);
    try {
      await updateFlutterBanner(banner.id, { displayOrder: newOrder });
    } catch (err) {
      toast.error('Failed to change order.');
    }
  };

  return (
    <div id="flutter-banner-control" className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Introduction Banner header */}
      <div className="bg-[#0f172a] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between border border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <span className="text-xs uppercase tracking-widest font-mono text-zinc-400">Target Segment Setup</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider font-sans">Flutter Banner Controls</h2>
          <p className="text-sm mt-1 text-zinc-400 max-w-xl">
            Draft, edit, and orchestrate client banners delivered to the companion mobile Flutter app. Active changes synchronize live across client devices.
          </p>
        </div>
        <button 
          onClick={handleReset} 
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[11px] uppercase tracking-wider px-4 py-2 border border-zinc-700 active:scale-95 transition-all self-start md:self-auto flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload / Add New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Add/Edit Banner Form (5 cols) */}
        <section className="lg:col-span-5 bg-white border border-zinc-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <h3 className="font-sans font-bold text-sm tracking-widest uppercase text-zinc-900">
              {editingBanner ? 'Edit Flutter Banner' : 'Add Flutter Banner Form'}
            </h3>
            {editingBanner && (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 uppercase tracking-wider font-black">
                Editing Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Image upload widget field */}
            <div className="space-y-2">
              <label id="lbl-banner-image" className="block text-xs font-black uppercase tracking-wider text-zinc-700">Banner Image Upload *</label>
              
              <div 
                className={`relative border-2 border-dashed rounded-none transition-all flex flex-col items-center justify-center p-6 text-center ${
                  dragActive ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-300 hover:border-zinc-400'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                {imageUrl ? (
                  <div className="space-y-3 w-full">
                    <div className="aspect-[21/9] w-full bg-zinc-100 border border-zinc-200 overflow-hidden relative">
                      <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1 rounded-sm border border-white/20 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono break-all">{imageUrl}</p>
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-4 py-2 uppercase tracking-wide border border-zinc-300"
                    >
                      Replace Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-zinc-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-800 font-bold">Drag and drop your image file here</p>
                      <p className="text-[10px] text-zinc-400">or click to browse local files</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 bg-zinc-950 hover:bg-zinc-800 text-white font-mono text-[10px] px-4 py-1.5 uppercase tracking-widest transition-all"
                    >
                      Choose File
                    </button>
                  </div>
                )}

                {/* Uploading overlays */}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 transition-all duration-300">
                    {uploadStatus === 'uploading' && (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="w-8 h-8 text-black animate-spin mb-2" />
                        <p className="text-xs font-black text-zinc-900 uppercase tracking-widest">Uploading...</p>
                        {uploadProgress !== null && (
                          <div className="w-48 bg-zinc-150 h-1 rounded-full mt-2 overflow-hidden border border-zinc-200">
                            <div 
                              className="bg-zinc-900 h-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                        <span className="text-[10px] text-zinc-500 mt-1.5 font-mono font-bold">{uploadProgress}% COMPLETE</span>
                      </div>
                    )}

                    {uploadStatus === 'success' && (
                      <div className="flex flex-col items-center text-center animate-bounce">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-150 flex items-center justify-center mb-2">
                          <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
                        </div>
                        <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">✓ Upload Successful</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Firebase document live-synced</p>
                      </div>
                    )}

                    {uploadStatus === 'error' && (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 rounded-full bg-red-50 border border-red-150 flex items-center justify-center mb-2">
                          <X className="w-5 h-5 text-red-600 stroke-[3]" />
                        </div>
                        <p className="text-xs font-black text-red-700 uppercase tracking-widest">Upload Failed</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Please Try Again</p>
                      </div>
                    )}
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
            </div>

            {/* Uploaded Banner Preview List (Horizontal, single line scrollable row) */}
            <div className="space-y-2 pt-1 border-t border-zinc-150 mt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">
                  Uploaded Banner Preview List ({flutterBanners.length})
                </label>
                {flutterBanners.length > 0 && (
                  <span className="text-[9px] text-[#4f46e5] font-black uppercase tracking-wider">← Swipe / Scroll →</span>
                )}
              </div>
              
              {flutterBanners.length === 0 ? (
                <div className="py-4 text-center border border-dashed border-zinc-200 bg-zinc-50 text-[10px] text-zinc-400 font-mono font-bold uppercase tracking-wider">
                  No preview images available
                </div>
              ) : (
                <div className="flex overflow-x-auto gap-3 py-2 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
                  {flutterBanners.map((banner) => {
                    const isSelected = editingBanner?.id === banner.id;
                    return (
                      <div 
                        key={"preview-thumb-" + banner.id} 
                        onClick={() => setEditingBanner(banner)}
                        className={`w-28 flex-shrink-0 aspect-[21/9] border bg-zinc-50 overflow-hidden relative group cursor-pointer transition-all shadow-sm ${
                          isSelected ? 'border-zinc-900 ring-2 ring-zinc-950 scale-95' : 'border-zinc-200 hover:border-zinc-400 hover:scale-102'
                        }`}
                      >
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title} 
                          className="w-full h-full object-cover select-none pointer-events-none" 
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Overlay with small edit/delete buttons */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBanner(banner);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-1 rounded-sm border border-indigo-500 hover:scale-110 active:scale-95 transition-all text-xs"
                            title="Edit banner parameters"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(banner.id);
                            }}
                            className="bg-black hover:bg-red-600 text-white p-1 rounded-sm border border-zinc-700 hover:scale-110 active:scale-95 transition-all text-xs"
                            title="Delete banner"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Order & Status indicators shown on thumbnail */}
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-[8px] font-mono text-white tracking-tighter">
                          O:{banner.displayOrder}
                        </div>
                        <div className="absolute top-1 left-1 bg-black/80 p-0.5 rounded-full">
                          <span className={`block w-1.5 h-1.5 rounded-full ${banner.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Banner Title */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">Banner Title *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter banner headline"
                className="w-full border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-0 text-sm py-2 px-3 focus:outline-none border rounded-none"
                required
              />
            </div>

            {/* Banner Subtitle */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">Banner Subtitle</label>
              <input 
                type="text" 
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Enter secondary details"
                className="w-full border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-0 text-sm py-2 px-3 focus:outline-none border rounded-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a description text shown beneath the banner image slider"
                rows={3}
                className="w-full border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-0 text-sm py-2 px-3 focus:outline-none border rounded-none resize-none"
              />
            </div>

            {/* Redirect parameters inside row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">Button Text</label>
                <input 
                  type="text" 
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="View Details"
                  className="w-full border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-0 text-sm py-2 px-3 focus:outline-none border rounded-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">Display Order</label>
                <input 
                  type="number" 
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full border-zinc-300 text-zinc-900 focus:border-zinc-900 focus:ring-0 text-sm py-2 px-3 focus:outline-none border rounded-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-700">Redirect Link</label>
              <input 
                type="text" 
                value={redirectLink}
                onChange={(e) => setRedirectLink(e.target.value)}
                placeholder="/category/accessories or https://..."
                className="w-full border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-0 text-sm py-2 px-3 focus:outline-none border rounded-none font-mono"
              />
            </div>

            {/* Action toggles */}
            <div className="flex items-center justify-between bg-zinc-50 border border-zinc-150 p-3">
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-800">Banner Status</span>
                <span className="text-[10px] text-zinc-500">Enable or disable delivery to clients</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-zinc-950' : 'bg-zinc-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Buttons row */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white font-mono text-xs uppercase tracking-wider py-3 px-4 border border-zinc-950 hover:border-zinc-900 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> {editingBanner ? 'Update Banner' : 'Create Banner'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-white hover:bg-zinc-50 text-zinc-800 font-mono text-xs uppercase tracking-wider py-3 px-4 border border-zinc-300 transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" /> Reset
              </button>
            </div>
          </form>
        </section>

        {/* Right Side: Flutter Banner Live Listing Section (7 cols) */}
        <section className="lg:col-span-7 bg-white border border-zinc-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
            <h3 className="font-sans font-bold text-sm tracking-widest uppercase text-zinc-900">
              Banner Listing Section ({flutterBanners.length})
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono font-bold">Dynamic Sync Active</span>
          </div>

          {loading && flutterBanners.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 font-mono text-sm space-y-2">
              <RefreshCw className="w-8 h-8 mx-auto text-zinc-300 animate-spin" />
              <p>Connecting & Synchronizing DB...</p>
            </div>
          ) : flutterBanners.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center p-8">
              <ImageIcon className="w-8 h-8 text-zinc-300 mb-2" />
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">No companion Flutter banners found</p>
              <p className="text-[10px] text-zinc-400 mt-1 max-w-xs leading-normal">
                Create your first platform banner on the left layout to seed the dynamic client feed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flutterBanners.map((banner) => {
                const isActiveSelected = editingBanner?.id === banner.id;
                return (
                  <div 
                    key={banner.id} 
                    className={`border transition-all flex flex-col justify-between ${
                      isActiveSelected ? 'border-zinc-900 ring-1 ring-zinc-950 bg-zinc-50/50' : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    {/* Upper cover area */}
                    <div className="p-3 space-y-3">
                      <div className="aspect-[21/9] w-full bg-zinc-50 border border-zinc-100 overflow-hidden relative">
                        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                        
                        {/* Status badges */}
                        <div className="absolute top-2 left-2 flex gap-1 items-center">
                          <span className={`text-[8px] font-black border uppercase tracking-widest px-1.5 py-0.5 ${
                            banner.isActive 
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' 
                              : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                          }`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {/* Order tag badge */}
                        <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-0.5 text-white text-[9px] font-mono border border-white/10 tracking-widest uppercase">
                          Order: {banner.displayOrder}
                        </div>
                      </div>

                      {/* Info lines under Cover */}
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-sans font-black text-xs uppercase tracking-wider text-zinc-900 truncate">
                            {banner.title}
                          </h4>
                        </div>
                        {banner.subtitle && (
                          <p className="text-[10px] text-zinc-500 font-bold truncate">
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.description && (
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                            {banner.description}
                          </p>
                        )}
                        {banner.redirectLink && (
                          <div className="text-[8px] text-zinc-400 bg-zinc-50 border border-zinc-100 p-1 font-mono hover:text-zinc-650 transition-all truncate">
                            Redirect: {banner.redirectLink}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer operations */}
                    <div className="flex border-t border-zinc-100 bg-zinc-50/60 p-2 justify-between items-center text-xs">
                      {/* Reordering buttons queue */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => adjustOrder(banner, 'up')}
                          className="p-1 hover:bg-zinc-150 text-zinc-500 hover:text-zinc-800 transition-all"
                          title="Decrease display order (Move up)"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => adjustOrder(banner, 'down')}
                          className="p-1 hover:bg-zinc-150 text-zinc-500 hover:text-zinc-800 transition-all"
                          title="Increase display order (Move down)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingBanner(banner)}
                          className="flex items-center gap-1 hover:bg-zinc-150 text-zinc-650 px-2 py-1 transition-all border border-transparent hover:border-zinc-200 hover:text-zinc-900 uppercase tracking-widest font-mono text-[9px]"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(banner.id)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-red-600 transition-all px-2 py-1 hover:bg-red-50 hover:border-red-100 border border-transparent uppercase tracking-widest font-mono text-[9px]"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
