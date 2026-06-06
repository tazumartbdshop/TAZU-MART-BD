import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface Banner {
  url: string;
  link: string;
}

interface BannerSliderProps {
  banners: Banner[];
  autoSlide?: boolean;
  slideDurationSeconds?: number;
}

export default function BannerSlider({ 
  banners, 
  autoSlide = true, 
  slideDurationSeconds = 3 
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoSlide || banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, slideDurationSeconds * 1000);

    return () => clearInterval(interval);
  }, [autoSlide, banners.length, slideDurationSeconds]);

  if (banners.length === 0) return null;

  if (banners.length === 1) {
    return (
      <Link to={banners[0].link} className="block w-full aspect-[3/1] overflow-hidden rounded-xl shadow-sm border border-neutral-100">
        <img src={banners[0].url} alt="Banner" className="w-full h-full object-cover" />
      </Link>
    );
  }

  return (
    <div className="relative w-full aspect-[3/1] overflow-hidden rounded-xl shadow-sm border border-neutral-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Link to={banners[currentIndex].link} className="block w-full h-full">
            <img src={banners[currentIndex].url} alt={`Banner ${currentIndex + 1}`} className="w-full h-full object-cover" />
          </Link>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex ? "bg-white w-4" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
