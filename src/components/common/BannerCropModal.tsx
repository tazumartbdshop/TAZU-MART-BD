import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Crop, AlertCircle } from 'lucide-react';

interface BannerCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, croppedUrl: string) => void;
  targetWidth?: number;
  targetHeight?: number;
  aspectRatioText?: string;
}

export default function BannerCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  targetWidth = 1920,
  targetHeight = 650,
  aspectRatioText = "1920:650"
}: BannerCropModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectRatio = targetWidth / targetHeight; // 1920 / 650 = 2.953846...

  // Reset zoom and pan when imageSrc changes or modal opens
  useEffect(() => {
    if (isOpen && imageSrc) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [isOpen, imageSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    setImageLoaded(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleCrop = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;

    const img = imgRef.current;
    const container = containerRef.current;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    // Create a high-res canvas at exactly targetWidth x targetHeight (1920 x 650)
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Calculate source rect from natural image
    // Find scale factor between natural image dimensions and displayed image dimensions
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    // Crop box offset inside image
    const cropX = (containerRect.left - imgRect.left) * scaleX;
    const cropY = (containerRect.top - imgRect.top) * scaleY;
    const cropW = containerRect.width * scaleX;
    const cropH = containerRect.height * scaleY;

    // Fill canvas background with black if image doesn't cover completely
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw portion of natural image onto canvas
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      targetWidth,
      targetHeight
    );

    // Convert canvas to blob/file
    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedFile = new File([blob], `banner-1920x650-${Date.now()}.jpg`, {
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      const croppedUrl = URL.createObjectURL(blob);
      onCropComplete(croppedFile, croppedUrl);
      onClose();
    }, 'image/jpeg', 0.92);
  }, [onCropComplete, onClose, targetWidth, targetHeight]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="bg-white border border-zinc-200 w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-black text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crop className="w-5 h-5 text-orange-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Crop Category Banner</h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest">
                Enforce Required Aspect Ratio ({aspectRatioText} | {targetWidth}×{targetHeight}px)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-amber-900 text-xs font-bold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Drag image to position & use slider to zoom. Final output will be saved at exactly {targetWidth} × {targetHeight} px ({aspectRatioText} ratio).</span>
        </div>

        {/* Cropping Workspace */}
        <div className="p-6 bg-zinc-900 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          
          {/* Locked Crop Frame (1920:650) */}
          <div 
            ref={containerRef}
            className="relative w-full overflow-hidden border-2 border-dashed border-orange-500 shadow-2xl bg-black cursor-grab active:cursor-grabbing flex items-center justify-center"
            style={{ aspectRatio: `${targetWidth}/${targetHeight}` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop source"
              onLoad={handleImageLoad}
              draggable={false}
              className="max-w-none transition-transform duration-75 pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center'
              }}
              referrerPolicy="no-referrer"
            />

            {/* Grid Overlay lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
              <div className="border-r border-b border-white/50" />
              <div className="border-r border-b border-white/50" />
              <div className="border-b border-white/50" />
              <div className="border-r border-b border-white/50" />
              <div className="border-r border-b border-white/50" />
              <div className="border-b border-white/50" />
              <div className="border-r border-white/50" />
              <div className="border-r border-white/50" />
              <div className="" />
            </div>

            {/* Ratio badge overlay */}
            <div className="absolute top-2 left-2 bg-black/80 border border-orange-500/50 text-orange-400 px-2 py-1 text-[9px] font-black uppercase tracking-widest pointer-events-none rounded">
              LOCKED RATIO: {aspectRatioText} ({targetWidth}×{targetHeight}px)
            </div>
          </div>

          {/* Original Info */}
          {imageLoaded && (
            <p className="mt-3 text-[10px] text-zinc-400 font-mono">
              Original Resolution: {imageSize.width} × {imageSize.height} px 
              {Math.abs((imageSize.width / imageSize.height) - aspectRatio) < 0.05 
                ? ' (Matches standard ratio)' 
                : ' (Needs cropping to match 1920:650)'}
            </p>
          )}
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-zinc-100 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black uppercase text-zinc-700 tracking-wider flex items-center gap-1.5">
              Zoom:
            </span>
            <button
              type="button"
              onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
              className="p-2 bg-white border border-zinc-300 hover:border-black rounded transition-colors text-black"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32 accent-black cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setScale(s => Math.min(3, s + 0.1))}
              className="p-2 bg-white border border-zinc-300 hover:border-black rounded transition-colors text-black"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setScale(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="px-3 py-2 bg-white border border-zinc-300 hover:border-black rounded text-[10px] font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-zinc-300 hover:bg-zinc-200 text-zinc-800 text-xs font-black uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCrop}
              className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-colors"
            >
              <Check className="w-4 h-4 text-orange-400" />
              Apply Banner (1920×650)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
