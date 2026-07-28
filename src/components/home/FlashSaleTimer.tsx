import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function FlashSaleTimer() {
  const { settings } = useSettingsStore();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(settings.flashSaleEndTime || '').getTime();
      const distance = endTime - now;

      if (!settings.flashSaleEndTime || isNaN(endTime) || distance <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      return { days: d, hours: h, minutes: m, seconds: s, isEnded: false };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.flashSaleEndTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (timeLeft.isEnded) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 text-neutral-500 rounded-full text-[10px] font-black uppercase tracking-wider border border-neutral-200 select-none">
        <span className="text-neutral-400">⚡</span>
        <span>Flash Sale Ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center h-[40px] sm:h-[44px] rounded-[10px] sm:rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] overflow-hidden select-none w-fit mx-auto border border-neutral-200">
      {/* Left Section - Solid Red */}
      <div className="h-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center px-3 sm:px-4 shrink-0 border-r border-red-800/50">
        <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-white">
          <span className="text-sm animate-pulse">⏰</span>
          <span className="text-[10px] sm:text-xs">ENDS IN</span>
        </div>
      </div>
      
      {/* Right Section - Solid Black */}
      <div className="h-full bg-neutral-900 flex items-center justify-center px-3 sm:px-4 shrink-0 border-l border-neutral-800">
        <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-[0.15em]">
          {formatNumber(timeLeft.days)}:{formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
}
