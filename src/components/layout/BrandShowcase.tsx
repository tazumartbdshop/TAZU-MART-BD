import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useBrandShowcaseStore, BrandShowcaseSlide } from '../../store/useBrandShowcaseStore';
import { useFlutterBannerStore } from '../../store/useFlutterBannerStore';
import { useNavigate } from 'react-router-dom';

export function BrandShowcase() {
  const { slides, autoScrollSpeed, companyName, companySubtext } = useBrandShowcaseStore();
  const { flutterBanners, subscribeFlutterBanners } = useFlutterBannerStore();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Subscribe to hot real-time updates from Firebase Database
  useEffect(() => {
    const unsubscribe = subscribeFlutterBanners();
    return () => unsubscribe();
  }, [subscribeFlutterBanners]);

  // Map dynamic Firebase Banners first
  const activeDbBanners = flutterBanners
    .filter(b => b.isActive)
    .map(b => ({
      id: b.id,
      image: b.imageUrl,
      title: b.title,
      tagline: b.subtitle || b.description || '',
      redirectLink: b.redirectLink,
      isActive: b.isActive,
    }));

  // If we have active database banners, use them! Otherwise fall back to the curated design presets.
  const activeSlides = activeDbBanners.length > 0 
    ? activeDbBanners 
    : slides.filter(slide => {
        if (!slide.isActive) return false;
        
        const now = new Date();
        if (slide.scheduledStart) {
          const start = new Date(slide.scheduledStart);
          if (now < start) return false;
        }
        if (slide.scheduledEnd) {
          const end = new Date(slide.scheduledEnd);
          if (now > end) return false;
        }
        return true;
      });

  // Handle bounds check when the active dynamic slides list updates
  useEffect(() => {
    if (currentIndex >= activeSlides.length) {
      setCurrentIndex(0);
    }
  }, [activeSlides.length, currentIndex]);

  // Handle auto-scroll
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % activeSlides.length);
    }, autoScrollSpeed || 4000);

    return () => clearInterval(interval);
  }, [activeSlides.length, autoScrollSpeed]);

  if (activeSlides.length === 0) {
    // If no active slides, only render the minimal company text to avoid blank spaces
    return (
      <div className="w-full bg-[#111111] text-white py-14 flex flex-col items-center justify-center border-t border-zinc-800">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.25em] text-center px-4 font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
          {companyName || 'TAZU MART'}
        </h2>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mt-3 text-center px-4">
          {companySubtext || 'Premium Ecommerce Platform'}
        </p>
      </div>
    );
  }

  // Touch Swipe Handlers for mobile swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    // Minimum swipe distance threshold (50 pixels)
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swiped left -> next slide
        handleNext();
      } else {
        // Swiped right -> prev slide
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex];

  return (
    <div className="w-full bg-[#111111] text-white pt-10 pb-16 border-t border-zinc-800 flex flex-col gap-8 select-none">
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-4">
        
        {/* Apple Style Smooth Transition Image Container */}
        <div 
          className="relative h-60 sm:h-80 md:h-[400px] w-full rounded-[24px] overflow-hidden group shadow-2xl border border-zinc-800 cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (currentSlide.redirectLink) {
              navigate(currentSlide.redirectLink);
            }
          }}
        >
          {/* Slides Carousel Wrapper */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 w-full h-full"
            >
              {currentSlide.image ? (
                <img 
                  src={currentSlide.image} 
                  alt={currentSlide.title} 
                  className="w-full h-full object-cover brightness-75 transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center p-6 text-center">
                  <span className="text-zinc-600 font-mono text-xs uppercase tracking-widest">[No Image Found / Unsplash Premium URL Needed]</span>
                </div>
              )}

              {/* Dynamic Overlay Text System */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 md:p-12">
                <div className="max-w-2xl space-y-2 sm:space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span className="text-[9px] uppercase tracking-widest font-black text-amber-300">
                      SHOWCASE SPECIAL
                    </span>
                  </div>
                  
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
                    {currentSlide.title}
                  </h3>
                  
                  {currentSlide.tagline && (
                    <p className="text-xs sm:text-sm text-zinc-300 uppercase tracking-wider font-semibold">
                      {currentSlide.tagline}
                    </p>
                  )}

                  {currentSlide.redirectLink && (
                    <div className="pt-2 flex items-center gap-2 text-xs text-white font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                      <span>Explore Showcase</span>
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows for click feedback */}
          {activeSlides.length > 1 && (
            <>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-md"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Bullet Selectors indicator */}
          {activeSlides.length > 1 && (
            <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-10">
              {activeSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'bg-white w-4' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Company Branding Typography */}
        <div className="mt-8 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.25em] text-white">
            {companyName || 'TAZU MART'}
          </h2>
          <div className="w-20 h-[2px] bg-purple-600 mt-3 mb-2.5 rounded-full" />
          <p className="text-[10px] md:text-xs font-extrabold uppercase tracking-[0.3em] text-zinc-400">
            {companySubtext || 'Premium Ecommerce Platform'}
          </p>
        </div>

      </div>
    </div>
  );
}
