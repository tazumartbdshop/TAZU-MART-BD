import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper';

// Import Swiper styles
import 'swiper/css';

function getOptimizedImageUrl(url: string, width = 200): string {
  if (!url) return "";
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("fm", "webp");
      urlObj.searchParams.set("w", width.toString());
      urlObj.searchParams.set("q", "80");
      urlObj.searchParams.set("auto", "format");
      urlObj.searchParams.set("fit", "crop");
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

export interface CategoryItem {
  id?: string;
  name: string;
  image: string;
  link: string;
}

interface CategorySliderProps {
  categories: CategoryItem[];
}

export function CategorySlider({ categories }: CategorySliderProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  if (!categories || categories.length === 0) return null;

  // Clear pending resume timer
  const clearResumeTimeout = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  // Called when user touches/drags the slider
  const handleUserInteractionStart = () => {
    clearResumeTimeout();
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
    }
  };

  // Called when user finishes touch/drag interaction
  const handleUserInteractionEnd = () => {
    clearResumeTimeout();
    // Schedule resume after 10 seconds of inactivity
    resumeTimeoutRef.current = setTimeout(() => {
      if (swiperRef.current && swiperRef.current.autoplay) {
        swiperRef.current.autoplay.start();
      }
    }, 10000);
  };

  return (
    <div className="w-full relative py-1 select-none">
      <Swiper
        modules={[Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        loop={categories.length > 3}
        speed={600}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        grabCursor={true}
        simulateTouch={true}
        allowTouchMove={true}
        onTouchStart={handleUserInteractionStart}
        onTouchEnd={handleUserInteractionEnd}
        onSliderMove={handleUserInteractionStart}
        breakpoints={{
          320: {
            slidesPerView: 4.2,
            spaceBetween: 10
          },
          480: {
            slidesPerView: 5.2,
            spaceBetween: 12
          },
          640: {
            slidesPerView: 6.5,
            spaceBetween: 16
          },
          768: {
            slidesPerView: 8.2,
            spaceBetween: 18
          },
          1024: {
            slidesPerView: 10.2,
            spaceBetween: 20
          },
          1280: {
            slidesPerView: 12.2,
            spaceBetween: 22
          }
        }}
        className="category-swiper !py-1 !px-1"
      >
        {categories.map((cat, idx) => (
          <SwiperSlide key={cat.id || idx} className="!w-auto">
            <Link
              to={cat.link}
              className="flex-none w-[72px] sm:w-[88px] md:w-[98px] flex flex-col items-center group text-center cursor-pointer"
            >
              <div className="relative w-15 h-15 sm:w-19 sm:h-19 md:w-20 md:h-20 rounded-full overflow-hidden border border-neutral-200/80 bg-neutral-50 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-black/30 group-hover:shadow-md shrink-0">
                <img
                  src={getOptimizedImageUrl(cat.image, 200)}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <span
                title={cat.name}
                className="w-full text-[10px] sm:text-xs font-bold uppercase text-neutral-800 tracking-wider mt-2 transition-colors group-hover:text-black leading-tight whitespace-nowrap overflow-hidden text-ellipsis block px-0.5"
              >
                {cat.name}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
