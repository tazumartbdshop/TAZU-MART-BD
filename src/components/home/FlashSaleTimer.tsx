import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function FlashSaleTimer() {
  const { settings } = useSettingsStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(settings.flashSaleEndTime).getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const h = Math.floor((distance / (1000 * 60 * 60)));
      const m = Math.floor((distance / (1000 * 60)) % 60);
      const s = Math.floor((distance / 1000) % 60);

      return { hours: h, minutes: m, seconds: s };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.flashSaleEndTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5 bg-[#ff4d4f] text-white h-[36px] px-3.5 rounded-md font-bold text-[15px] tabular-nums tracking-wider shadow-sm border border-white/10">
      <span>{formatNumber(timeLeft.hours)}</span>
      <span className="opacity-60 -mt-0.5">:</span>
      <span>{formatNumber(timeLeft.minutes)}</span>
      <span className="opacity-60 -mt-0.5">:</span>
      <span>{formatNumber(timeLeft.seconds)}</span>
    </div>
  );
}
