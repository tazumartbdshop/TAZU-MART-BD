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
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-500 rounded-md text-[9px] font-black uppercase tracking-wider border border-neutral-200 select-none shrink-0">
        <span className="text-neutral-400 text-xs">⚡</span>
        <span>Flash Sale Ended</span>
      </div>
    );
  }

  return (
    <div className="flex items-center h-7 sm:h-8 rounded-lg shadow-sm overflow-hidden select-none w-fit border border-neutral-200 shrink-0">
      {/* Left Section - Solid Red */}
      <div className="h-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center px-2 sm:px-3 shrink-0 border-r border-red-800/50">
        <div className="flex items-center gap-1 font-black uppercase tracking-wider text-white">
          <span className="text-[11px] sm:text-xs animate-pulse">⏰</span>
          <span className="text-[9px] sm:text-[10px] leading-none">ENDS IN</span>
        </div>
      </div>
      
      {/* Right Section - Solid Black */}
      <div className="h-full bg-neutral-900 flex items-center justify-center px-2 sm:px-3 shrink-0 border-l border-neutral-800">
        <span className="font-mono text-[11px] sm:text-xs font-bold text-white tracking-wider leading-none">
          {formatNumber(timeLeft.days)}:{formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
        </span>
      </div>
    </div>
  );
}
