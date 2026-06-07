import React, { useState, useEffect } from 'react';
import { useFlutterBannerStore, FlutterBanner } from '../../store/useFlutterBannerStore';
import { ChevronLeft, ChevronRight, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export default function FlutterBannerSection() {
  const { flutterBanners, subscribeFlutterBanners, isLoaded } = useFlutterBannerStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Synchronize in real-time
  useEffect(() => {
    const unsubscribe = subscribeFlutterBanners();
    return () => unsubscribe();
  }, []);

  // Filter only active banners and sort them by displayOrder
  const activeBanners = flutterBanners
    .filter((b) => b.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Auto sliding interval logic
  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeBanners.length);
    }, 4500); // Auto slider changes every 4.5 seconds

    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // Handle slide index resets when activeBanners counts change
  useEffect(() => {
    if (currentIndex >= activeBanners.length) {
      setCurrentIndex(0);
    }
  }, [activeBanners.length, currentIndex]);

  if (!isLoaded && activeBanners.length === 0) {
    return null; // Don't show anything while initial hydration happens
  }

  if (activeBanners.length === 0) {
    return null; // Hide the section if no active custom Flutter Banners exist
  }

  const currentBanner = activeBanners[currentIndex];
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Trigger swipe transition if the distance is sufficient (over 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStartX(null);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === activeBanners.length - 1 ? 0 : prev + 1));
  };

  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const renderButton = () => {
    const btnText = currentBanner.buttonText || 'View Details';
    const link = currentBanner.redirectLink;

    if (!link) {
      return (
        <button className="bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-3 transition-colors active:scale-95 select-none rounded-none">
          {btnText}
        </button>
      );
    }

    if (isExternalUrl(link)) {
      return (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-1.5 bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-3 transition-colors active:scale-95 select-none rounded-none"
        >
          {btnText} <ExternalLink className="w-3.5 h-3.5" />
        </a>
      );
    }

    return (
      <Link 
        to={link} 
        className="inline-flex items-center justify-center bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-3 transition-colors active:scale-95 select-none rounded-none"
      >
        {btnText}
      </Link>
    );
  };

  return (
    <section id="flutter-banners-carousel" className="bg-white border-y border-gray-100 py-8 mb-6 shadow-sm">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Banner Section Title Label */}
        <div className="flex items-center gap-2 mb-4 justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-950 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-zinc-900"></span>
            Flutter Highlights
          </h3>
          
          <div className="flex gap-1.5 items-center">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 transition-all ${idx === currentIndex ? 'w-6 bg-zinc-900 rounded-none' : 'w-2 bg-zinc-200 hover:bg-zinc-300 rounded-none'}`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Display Layout Container */}
        <div className="space-y-6">
          
          {/* 1. CLEAN BANNER IMAGE SLIDER WITH TRANSPARENT NAVIGATION ACCENTS */}
          <div 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative aspect-[21/9] w-full bg-zinc-100 overflow-hidden border border-zinc-200 cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentBanner.id + '-' + currentBanner.imageUrl}
                src={currentBanner.imageUrl}
                alt={currentBanner.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover select-none pointer-events-none"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Left/Right Navigation Arrows if there are multiple active slides */}
            {activeBanners.length > 1 && (
              <>
                <button 
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/60 hover:bg-black text-white hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center p-1 rounded-sm"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/60 hover:bg-black text-white hover:scale-105 active:scale-95 transition-all text-xs flex items-center justify-center p-1 rounded-sm"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* 2. TEXT CONTENT & ACTION CONTROLS SHOWN UNDER BANNER IMAGE */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-zinc-900 leading-tight">
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-500 uppercase">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.description && (
                <p className="text-sm text-zinc-600 leading-relaxed max-w-3xl whitespace-pre-line">
                  {currentBanner.description}
                </p>
              )}
            </div>

            {/* View Details action button */}
            <div className="pt-2">
              {renderButton()}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
