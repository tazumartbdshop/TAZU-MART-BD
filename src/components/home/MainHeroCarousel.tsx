import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Banner, useBannerStore } from '../../store/useBannerStore';
import DesignedBannerRenderer from '../DesignedBannerRenderer';

interface MainHeroCarouselProps {
  banners: Banner[];
}

export default function MainHeroCarousel({ banners }: MainHeroCarouselProps) {
  // Filter user uploaded active banners with real image
  const uploadedBanners = (banners || []).filter(b => b && b.status === 'active' && b.image && b.image.trim() !== '');

  const activeBannersToRender = uploadedBanners;

  if (activeBannersToRender.length === 0) {
    return null;
  }

  const { sliderConfig } = useBannerStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(sliderConfig.autoSlide);

  // Sync with global config
  useEffect(() => {
    setAutoSlideEnabled(sliderConfig.autoSlide);
  }, [sliderConfig.autoSlide]);

  // Swipe start and end positions for gesture sliding
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const [swipeEnd, setSwipeEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // Reset index if it gets out of bounds during a list modification
  useEffect(() => {
    if (currentIndex >= activeBannersToRender.length) {
      setCurrentIndex(0);
    }
  }, [activeBannersToRender.length, currentIndex]);

  const handleNext = () => {
    if (activeBannersToRender.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % activeBannersToRender.length);
  };

  const handlePrev = () => {
    if (activeBannersToRender.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + activeBannersToRender.length) % activeBannersToRender.length);
  };

  // Interval Auto Slide System (Only runs if more than 1 banner) based on global config duration
  useEffect(() => {
    if (!autoSlideEnabled || activeBannersToRender.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, (sliderConfig.duration || 5) * 1000);
    return () => clearInterval(timer);
  }, [activeBannersToRender.length, autoSlideEnabled, sliderConfig.duration]);

  const getBannerButtonLink = (banner: Banner) => {
    if (banner.connectedProductId) {
      return `/product/${banner.connectedProductId}`;
    }
    if (banner.buttonLink) {
      if (banner.buttonLink.startsWith('http') || banner.buttonLink.startsWith('https')) {
         return banner.buttonLink; // will use react-router unfortunately, wait no
      }
      return banner.buttonLink.startsWith('/') ? banner.buttonLink : `/${banner.buttonLink}`;
    }
    return '/shop';
  };

  const currentBanner = activeBannersToRender[currentIndex] || activeBannersToRender[0];

  // Mobile touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeEnd(null);
    setSwipeStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setSwipeEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (swipeStart === null || swipeEnd === null) return;
    const distance = swipeStart - swipeEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Desktop mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setSwipeEnd(null);
    setSwipeStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (swipeStart !== null) {
      setSwipeEnd(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (swipeStart === null || swipeEnd === null) {
      setSwipeStart(null);
      setSwipeEnd(null);
      return;
    }
    const distance = swipeStart - swipeEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    setSwipeStart(null);
    setSwipeEnd(null);
  };

  const bannerLink = getBannerButtonLink(currentBanner);
  const isExternalLink = bannerLink.startsWith('http') || bannerLink.startsWith('https');

  return (
    <section 
      className="w-full bg-white overflow-hidden relative group font-mono select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setSwipeStart(null); setSwipeEnd(null); }}
    >
      {/* Hero Banner wrapper with YouTube banner style layout (Slim, wide, 2560x423) */}
      <div className="w-full relative bg-neutral-950 overflow-hidden flex flex-col justify-center h-[140px] md:h-auto md:aspect-[2560/423]">
        
        {/* Toggle & Controls Floating Board on topright */}
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoSlideEnabled(prev => !prev)}
            className="px-2.5 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-white/20 flex items-center gap-1.5 transition-all bg-black/50 backdrop-blur-md text-white hover:bg-black/70 rounded-full"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoSlideEnabled ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            Auto: {autoSlideEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {currentBanner.bannerType === 'designed' ? (
              <DesignedBannerRenderer banner={currentBanner} />
            ) : (
              <>
                {currentBanner.image ? (
                  <img 
                    src={currentBanner.image} 
                    className="w-full h-full object-cover object-center select-none pointer-events-none" 
                    alt={currentBanner.name || "Banner Graphic"} 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-900 to-zinc-900 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                    <ImageIcon className="w-12 h-12 text-zinc-700 mb-3" />
                    <span className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] md:text-sm">Store Banner Ready</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Optional based on design, simplified here) */}
        {activeBannersToRender.length > 1 && (
          <>
            <button 
 
              type="button"
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white text-black hover:bg-zinc-50 border-2 border-black flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 shadow-md active:scale-95 z-25"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
            </button>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white text-black hover:bg-zinc-50 border-2 border-black flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 shadow-md active:scale-95 z-25"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 stroke-[3]" />
            </button>

            {/* Bullet Indicators (Dots) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 pointer-events-auto">
              {activeBannersToRender.map((_, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={`h-2 transition-all border border-black ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Dynamic Action Button For Active Banner */}
      {currentBanner && currentBanner.buttonEnabled && currentBanner.buttonText && (
        <div className="w-full flex justify-center mt-2 mb-2 bg-transparent relative z-10">
          {isExternalLink ? (
            <a
              href={bannerLink}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex items-center justify-center min-w-[120px] max-w-[220px] h-[40px] px-6 bg-black text-white hover:bg-neutral-800 hover:scale-105 transition-all rounded-lg font-bold text-xs uppercase shadow-md gap-2 whitespace-nowrap relative z-50 pointer-events-auto"
            >
              {currentBanner.buttonText}
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </a>
          ) : (
            <Link
              to={bannerLink}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="flex items-center justify-center min-w-[120px] max-w-[220px] h-[40px] px-6 bg-black text-white hover:bg-neutral-800 hover:scale-105 transition-all rounded-lg font-bold text-xs uppercase shadow-md gap-2 whitespace-nowrap relative z-50 pointer-events-auto"
            >
              {currentBanner.buttonText}
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
