import React, { useRef, useEffect, useState, ReactNode } from 'react';

interface AutoScrollCarouselProps {
  children: ReactNode;
  speed?: number; // pixels per second
  className?: string;
  itemClassName?: string;
}

export function AutoScrollCarousel({ children, speed = 30, className = '', itemClassName = '' }: AutoScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime: number;

    const scroll = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      
      if (!isPaused && !isDragging && scrollRef.current) {
        scrollRef.current.scrollLeft += (speed * delta) / 1000;
        
        // Loop logic
        const { scrollWidth, scrollLeft, clientWidth } = scrollRef.current;
        // Since we duplicate content by 2 times, half of scrollWidth is 1 set.
        if (scrollLeft >= scrollWidth / 2) {
          // Instead of exactly 0, adjust smoothly by subtracting half width
          scrollRef.current.scrollLeft -= (scrollWidth / 2);
        }
      }
      
      lastTime = timestamp;
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isDragging, speed]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') {
      setIsDragging(true);
      startXRef.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
      scrollLeftRef.current = scrollRef.current?.scrollLeft || 0;
    }
    setIsPaused(true);
  };

  const handlePointerUpOrLeave = (e?: React.PointerEvent) => {
    setIsDragging(false);
    if (e?.pointerType === 'mouse') {
      setIsPaused(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerType !== 'mouse') return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startXRef.current) * 2; 
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollWidth, scrollLeft } = scrollRef.current;
      if (scrollLeft <= 0) {
        scrollRef.current.scrollLeft = scrollWidth / 2;
      } else if (scrollLeft >= scrollWidth / 2) {
        // Doing this continuously on manual scroll might be tricky,
        // but if someone scrolls fast forward:
        if (isDragging) {
           scrollRef.current.scrollLeft -= scrollWidth / 2;
           scrollLeftRef.current -= scrollWidth / 2;
        }
      }
    }
  };

  return (
    <div 
      className={`overflow-x-auto hide-scrollbar touch-pan-x touch-pan-y flex ${className}`}
      ref={scrollRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { setIsPaused(false); handlePointerUpOrLeave(); }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrLeave}
      onPointerCancel={handlePointerUpOrLeave}
      onPointerMove={handlePointerMove}
      onScroll={handleScroll}
      style={{ userSelect: isDragging ? 'none' : 'auto' }}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        // Resume after small delay
        setTimeout(() => setIsPaused(false), 800);
      }}
    >
      <div className="flex shrink-0">
        <div className={`flex shrink-0 ${itemClassName}`}>
            {children}
        </div>
        <div className={`flex shrink-0 ${itemClassName}`}>
            {children}
        </div>
      </div>
    </div>
  );
}
