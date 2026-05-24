import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    const getNextEndTime = () => {
      const now = new Date().getTime();
      let endTime = localStorage.getItem("flashSaleEnd");

      if (!endTime || now > Number(endTime)) {
        endTime = (now + TWENTY_FOUR_HOURS).toString();
        localStorage.setItem("flashSaleEnd", endTime);
      }
      return Number(endTime);
    };

    let endTime = getNextEndTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      let distance = endTime - now;

      if (distance <= 0) {
        endTime = now + TWENTY_FOUR_HOURS;
        localStorage.setItem("flashSaleEnd", endTime.toString());
        distance = TWENTY_FOUR_HOURS;
      }

      const h = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const m = Math.floor((distance / (1000 * 60)) % 60);
      const s = Math.floor((distance / 1000) % 60);

      setTimeLeft({ hours: h, minutes: m, seconds: s });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
