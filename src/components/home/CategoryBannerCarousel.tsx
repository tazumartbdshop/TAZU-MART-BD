import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../store/useCategoryStore';

interface CategoryBannerCarouselProps {
  category: Category;
}

export default function CategoryBannerCarousel({ category }: CategoryBannerCarouselProps) {
  const images = (category.bannerImages && category.bannerImages.length > 0 
    ? category.bannerImages 
    : [category.bannerImage]).filter(Boolean);

  const sliderSettings = category.sliderSettings || { autoScroll: true, interval: 3 };
  const autoScroll = sliderSettings.autoScroll !== false;
  const scrollInterval = (Number(sliderSettings.interval) || 3) * 1000;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto sliding based on database settings
  useEffect(() => {
    if (images.length <= 1 || !autoScroll) return;

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, scrollInterval);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [images.length, autoScroll, scrollInterval]);

  // Reset timer on manual interaction
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (images.length > 1 && autoScroll) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, scrollInterval);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe sensitivity threshold
    if (Math.abs(diff) > 40) {
      resetTimer();
      if (diff > 0) {
        // Swipe left -> next slide
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe right -> previous slide
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    setTouchStart(null);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    resetTimer();
    setCurrentIndex(index);
  };

  if (images.length === 0 || !images[0]) return null;

  return (
    <Link 
      to={`/category/${category.id}`} 
      className="block relative w-full overflow-hidden select-none outline-none group/banner"
      style={{ borderRadius: '10px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Outer Banner Wrapper */}
      <div className="relative h-[160px] md:h-[260px] w-full bg-neutral-100 overflow-hidden">
        {/* Slides Track */}
        <div 
          className="absolute inset-0 flex transition-transform duration-500 ease-in-out will-change-transform"
          style={{ transform: `translate3d(-${currentIndex * 100}%, 0, 0)` }}
        >
          {images.map((img, idx) => (
            <div key={`${category.id}-slide-${idx}`} className="w-full h-full shrink-0 relative">
              <img 
                src={img} 
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover/banner:scale-102 transition-transform duration-[2000ms] ease-out" 
                alt={`${category.name} Banner ${idx + 1}`} 
              />
            </div>
          ))}
        </div>

        {/* Premium Dark Cover Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ 
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.05) 100%)' 
          }}
        />

        {/* Swipe indicator dots (if multiple images exist) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[3] flex gap-2 p-1.5 p-1 px-2.5 bg-white/85 rounded-full shadow-sm">
            {images.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                type="button"
                onClick={(e) => handleDotClick(e, idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 outline-none ${
                  currentIndex === idx 
                    ? 'bg-black' 
                    : 'bg-neutral-300 hover:bg-neutral-400'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
