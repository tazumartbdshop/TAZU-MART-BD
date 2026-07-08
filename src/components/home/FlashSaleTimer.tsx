import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function FlashSaleTimer() {
  const { settings } = useSettingsStore();
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // Load or initialize the personalized target timestamp (24 hours per visitor)
  useEffect(() => {
    const key = 'visitor_flash_sale_target';
    const now = Date.now();
    let storedTarget = localStorage.getItem(key);
    let targetTimestamp = storedTarget ? parseInt(storedTarget, 10) : null;

    // If no target timestamp, or it's invalid, or it's in the past: start a fresh 24h countdown
    if (!targetTimestamp || isNaN(targetTimestamp) || targetTimestamp <= now) {
      targetTimestamp = now + 24 * 60 * 60 * 1000;
      localStorage.setItem(key, targetTimestamp.toString());
    }

    setTargetTime(targetTimestamp);
  }, []);

  // Update timer every second
  useEffect(() => {
    if (!targetTime) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      let diff = targetTime - now;

      // When the 24-hour cycle completes, automatically start a brand new 24-hour cycle instantly!
      if (diff <= 0) {
        const newTarget = now + 24 * 60 * 60 * 1000;
        localStorage.setItem('visitor_flash_sale_target', newTarget.toString());
        setTargetTime(newTarget);
        diff = 24 * 60 * 60 * 1000;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      return { hours: h, minutes: m, seconds: s };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto select-none">
      {/* Dynamic inline styles to support smooth slide down entry animation on digit change */}
      <style>{`
        @keyframes digit-slide-down {
          0% {
            transform: translateY(-6px);
            opacity: 0.4;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-digit-change {
          animation: digit-slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Premium Glassmorphism Glowing Container */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-4 md:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.08)] border border-amber-500/20 backdrop-blur-md">
        
        {/* Soft Animated Glow Background Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.12)_0%,transparent_70%)] pointer-events-none" />
        
        {/* Top Header Badge */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <span className="text-sm animate-bounce shrink-0">🔥</span>
          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-amber-400 to-red-500 font-sans">
            FLASH SALE ENDS IN
          </span>
        </div>

        {/* Separated Digit Box Layout */}
        <div className="flex items-center justify-center gap-2 md:gap-3">
          
          {/* Hours Box */}
          <div className="flex flex-col items-center">
            <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-black px-3 py-2 md:px-4 md:py-3 rounded-xl border border-neutral-800/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.4)] min-w-[54px] md:min-w-[64px] text-center">
              <span 
                key={timeLeft.hours}
                className="block font-mono font-black text-2xl md:text-3xl text-amber-400 tracking-normal animate-digit-change"
              >
                {formatNumber(timeLeft.hours)}
              </span>
            </div>
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400 mt-1.5">Hours</span>
          </div>

          {/* Colon Separator */}
          <span className="text-amber-500/60 font-black text-xl md:text-2xl -mt-5 animate-pulse">:</span>

          {/* Minutes Box */}
          <div className="flex flex-col items-center">
            <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-black px-3 py-2 md:px-4 md:py-3 rounded-xl border border-neutral-800/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.4)] min-w-[54px] md:min-w-[64px] text-center">
              <span 
                key={timeLeft.minutes}
                className="block font-mono font-black text-2xl md:text-3xl text-amber-400 tracking-normal animate-digit-change"
              >
                {formatNumber(timeLeft.minutes)}
              </span>
            </div>
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400 mt-1.5">Minutes</span>
          </div>

          {/* Colon Separator */}
          <span className="text-amber-500/60 font-black text-xl md:text-2xl -mt-5 animate-pulse">:</span>

          {/* Seconds Box */}
          <div className="flex flex-col items-center">
            <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-black px-3 py-2 md:px-4 md:py-3 rounded-xl border border-neutral-800/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.4)] min-w-[54px] md:min-w-[64px] text-center">
              <span 
                key={timeLeft.seconds}
                className="block font-mono font-black text-2xl md:text-3xl text-red-500 tracking-normal animate-digit-change"
              >
                {formatNumber(timeLeft.seconds)}
              </span>
            </div>
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] text-neutral-400 mt-1.5">Seconds</span>
          </div>

        </div>

      </div>
    </div>
  );
}
