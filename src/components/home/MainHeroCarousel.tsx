import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '../../store/useBannerStore';

interface MainHeroCarouselProps {
  banners: Banner[];
}

export default function MainHeroCarousel({ banners }: MainHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section className="w-full bg-white overflow-hidden relative group">
      <div className="w-full aspect-[16/6] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            {currentBanner.image ? (
              <img 
                src={currentBanner.image} 
                className="w-full h-full object-cover" 
                alt={currentBanner.name} 
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                 <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Banner Image Preview</span>
              </div>
            )}

            {/* Content Overlay */}
            <div className="absolute inset-x-4 md:inset-x-12 bottom-6 md:bottom-12 flex flex-col items-start gap-2 md:gap-4">
              {currentBanner.name && (
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-black text-white px-3 py-1.5 md:px-6 md:py-3 font-black uppercase tracking-tighter text-sm md:text-3xl shadow-2xl"
                >
                  {currentBanner.name}
                </motion.div>
              )}

              {currentBanner.buttonEnabled && currentBanner.buttonText && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to={currentBanner.connectedProductId ? `/product/${currentBanner.connectedProductId}` : '/shop'}
                    className="inline-flex items-center justify-center px-4 py-2 md:px-8 md:py-4 bg-purple-600 text-white text-[10px] md:text-sm font-black uppercase tracking-widest shadow-xl shadow-purple-900/20 hover:scale-105 transition-transform active:scale-95"
                  >
                    {currentBanner.buttonText}
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black shadow-xl"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button 
              onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black shadow-xl"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1 rounded-full transition-all ${idx === currentIndex ? 'w-6 md:w-10 bg-white' : 'w-2 bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
