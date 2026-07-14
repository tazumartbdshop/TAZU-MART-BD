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
    <>
      {/* Desktop Layout */}
      <div className="hidden sm:flex items-center gap-4 bg-gradient-to-r from-red-600 via-rose-700 to-black text-white px-5 py-2 rounded-2xl shadow-[0_4px_15px_rgba(220,38,38,0.25)] border border-white/10 select-none">
        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-red-100">
          <span className="text-sm animate-pulse">⏰</span>
          <span>Ends In:</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <div className="flex flex-col items-center">
            <span className="bg-black/40 px-2.5 py-1.5 rounded-lg text-sm font-black tracking-normal min-w-[34px] text-center border border-white/5">{formatNumber(timeLeft.days)}</span>
            <span className="text-[7.5px] text-red-200 font-extrabold uppercase tracking-widest mt-1">Days</span>
          </div>
          <span className="text-red-300 font-black text-xs -mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="bg-black/40 px-2.5 py-1.5 rounded-lg text-sm font-black tracking-normal min-w-[34px] text-center border border-white/5">{formatNumber(timeLeft.hours)}</span>
            <span className="text-[7.5px] text-red-200 font-extrabold uppercase tracking-widest mt-1">Hours</span>
          </div>
          <span className="text-red-300 font-black text-xs -mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="bg-black/40 px-2.5 py-1.5 rounded-lg text-sm font-black tracking-normal min-w-[34px] text-center border border-white/5">{formatNumber(timeLeft.minutes)}</span>
            <span className="text-[7.5px] text-red-200 font-extrabold uppercase tracking-widest mt-1">Minutes</span>
          </div>
          <span className="text-red-300 font-black text-xs -mt-4">:</span>
          <div className="flex flex-col items-center">
            <span className="bg-black/40 px-2.5 py-1.5 rounded-lg text-sm font-black tracking-normal min-w-[34px] text-center border border-white/5">{formatNumber(timeLeft.seconds)}</span>
            <span className="text-[7.5px] text-red-200 font-extrabold uppercase tracking-widest mt-1">Seconds</span>
          </div>
        </div>
      </div>

      {/* Mobile Compact Layout */}
      <div className="sm:hidden flex items-center gap-2 bg-gradient-to-r from-red-600 via-rose-700 to-black text-white px-3.5 py-1.5 rounded-full shadow-[0_3px_10px_rgba(220,38,38,0.2)] border border-white/10 select-none">
        <span className="text-xs animate-pulse">⏰</span>
        <span className="text-[9.5px] font-black uppercase tracking-wider text-red-100 shrink-0">Ends In:</span>
        <span className="font-mono text-[10px] font-black bg-black/40 px-2 py-0.5 rounded-full text-red-300 tracking-wider">
          {formatNumber(timeLeft.days)}D {formatNumber(timeLeft.hours)}H {formatNumber(timeLeft.minutes)}M {formatNumber(timeLeft.seconds)}S
        </span>
      </div>
    </>
  );
}
